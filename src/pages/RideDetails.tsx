import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ridesApi, participationsApi } from '../api/client';
import type { Ride, Participant, Participation } from '../api/types';
import { useAuth } from '../contexts/AuthContext';
import { useRideSocket } from '../hooks/useRideSocket';
import ParticipantsMap from '../components/ParticipantsMap';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { MapPin, ArrowLeft } from 'lucide-react';

// New Components
import RideHeader from '../components/Ride/RideHeader';
import RideActions from '../components/Ride/RideActions';
import ParticipantsList from '../components/Ride/ParticipantsList';

const RideDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ride, setRide] = useState<Ride | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [myParticipation, setMyParticipation] = useState<Participation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Socket Hook
  const { socket } = useRideSocket(ride?.code, ride?.id, setParticipants);

  useEffect(() => {
    loadRideDetails();
  }, [id]);

  const loadRideDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const rideId = parseInt(id);
      
      const [rideData, myParticipationsData] = await Promise.all([
        ridesApi.getRideById(rideId),
        participationsApi.getMyParticipations()
      ]);

      setRide(rideData);
      
      try {
        const participantsData = await participationsApi.getRideParticipations(rideId);
        
        // Sort: Organizer always first (index 0 -> #1)
        if (rideData) {
            participantsData.sort((a, b) => {
                if (a.user_id === rideData.created_by_user_id) return -1;
                if (b.user_id === rideData.created_by_user_id) return 1;
                return 0; // Keep original order for others
            });
        }
        
        setParticipants(participantsData);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setParticipants([]);
        } else {
          throw err;
        }
      }
      
      const myPart = myParticipationsData.find(p => p.ride_id === rideId && p.user_id === user?.id);
      setMyParticipation(myPart || null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error loading ride details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocation = async () => {
    if (!myParticipation || !ride) return;

    setUpdating(true);
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              // 1. Send to API (Persist)
              await participationsApi.updateLocation(myParticipation.id, {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                location_timestamp: new Date().toISOString()
              });

              // 2. Emit to Socket (Real-time Broadcast)
              if (socket) {
                socket.emit('update_location', {
                    ride_code: ride.code,
                    user_id: user?.id,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
              }

              // 3. Local state update for immediate feedback (smoothness)
               setParticipants(prev => {
                  const idx = prev.findIndex(p => p.user_id === user?.id);
                  if (idx !== -1) {
                      const updated = [...prev];
                      updated[idx] = {
                          ...updated[idx],
                          latitude: position.coords.latitude,
                          longitude: position.coords.longitude,
                          location_timestamp: new Date().toISOString()
                      };
                      return updated;
                  }
                  return prev;
               });

            } catch (err: any) {
              setError(err.response?.data?.detail || 'Error updating geolocation');
            } finally {
              setUpdating(false);
            }
          },
          (err) => {
            setError('Failed to get geolocation: ' + err.message);
            setUpdating(false);
          }
        );
      } else {
        setError('Geolocation is not supported by your browser');
        setUpdating(false);
      }
    } catch (err) {
      setUpdating(false);
    }
  };

  const handleSimulateLocation = async () => {
    if (!ride || !myParticipation) return;

    setUpdating(true);
    
    // Default to Munich if no one is active
    const baseLat = 48.1351; 
    const baseLng = 11.5820;
    
    try {
        const lat = baseLat + (Math.random() - 0.5) * 0.01;
        const lng = baseLng + (Math.random() - 0.5) * 0.01;

        await participationsApi.updateLocation(myParticipation.id, {
            latitude: lat,
            longitude: lng,
            location_timestamp: new Date().toISOString()
        });
        
        if (socket) {
            socket.emit('update_location', {
                ride_code: ride.code,
                user_id: user?.id,
                latitude: lat,
                longitude: lng
            });
        }
        
        // Optimistic update
        setParticipants(prev => {
             const idx = prev.findIndex(p => p.user_id === user?.id);
             if (idx !== -1) {
                 const updated = [...prev];
                 updated[idx] = { ...updated[idx], latitude: lat, longitude: lng, location_timestamp: new Date().toISOString() };
                 return updated;
             }
             return prev;
        });

    } catch (err: any) {
        setError("Simulation failed: " + err.message);
    } finally {
        setUpdating(false);
    }
  };

  const handleGatherParticipants = async () => {
      if (!ride || !user) return;
      
      setUpdating(true);
      
      // 1. Determine Center
      let centerLat = 48.1351;
      let centerLng = 11.5820;
      
      // Try to find ME (robust ID comparison)
      const me = participants.find(p => String(p.user_id) === String(user.id));
      if (me && me.latitude && me.longitude) {
          centerLat = Number(me.latitude);
          centerLng = Number(me.longitude);
      } else {
          // Fallback: Find anyone with valid coords
          const anyone = participants.find(p => p.latitude && p.longitude);
          if (anyone) {
            centerLat = Number(anyone.latitude);
            centerLng = Number(anyone.longitude);
          }
      }

      // 2. Prepare updates
      const newParticipants = participants.map(p => {
          // Generate random offset ~100m
          const lat = centerLat + (Math.random() - 0.5) * 0.002;
          const lng = centerLng + (Math.random() - 0.5) * 0.002;
          
          // Emit socket
          if (socket) {
             socket.emit('update_location', {
                ride_code: ride.code,
                user_id: p.user_id,
                latitude: lat,
                longitude: lng
             });
          }

          // Return updated participant objects for local state
          return {
              ...p,
              latitude: lat,
              longitude: lng,
              location_timestamp: new Date().toISOString()
          };
      });
      
      // 3. Update State Immediately (Visual Feedback)
      setParticipants(newParticipants);
      
      setUpdating(false);
  };

  const handleJoinRide = async () => {
    if (!ride) return;

    try {
      await participationsApi.joinRide({ ride_code: ride.code });
      await loadRideDetails();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error joining ride');
    }
  };

  const handleLeaveRide = async () => {
    if (!myParticipation) return;
    
    try {
      await participationsApi.leaveRide(myParticipation.id);
      navigate('/'); 
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error leaving ride');
    }
  };

  const handleDeleteRide = async () => {
    if (!ride) return;
    
    setIsDeleting(true);
    try {
      await ridesApi.deleteRide(ride.id);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error deleting ride');
      setShowDeleteConfirm(false); 
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold text-gray-800">Ride not found</h2>
        <Button onClick={() => navigate('/')} className="mt-4" variant="outline">Back to Dashboard</Button>
      </div>
    );
  }

  const isOwner = ride.created_by_user_id === user?.id;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-6 flex justify-between items-center">
        <button 
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-100">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Map */}
        <div className="lg:col-span-2 space-y-6">
          <RideHeader 
            ride={ride} 
            isOwner={isOwner} 
            onDelete={() => setShowDeleteConfirm(true)} 
          />
          
          <Card className="overflow-hidden" noPadding>
            <div className="p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin size={18} /> Live Map
                    </h3>
                    {participants.filter(p => !p.latitude || !p.longitude).length > 0 && (
                        <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full font-medium">
                            Waiting for location from {participants.filter(p => !p.latitude || !p.longitude).length} participant(s)
                        </span>
                    )}
                </div>
            </div>
            {participants.length > 0 ? (
                <ParticipantsMap 
                    participants={participants} 
                    height="400px" 
                    organizerId={ride.created_by_user_id}
                />
            ) : (
                <div className="h-[400px] flex items-center justify-center bg-gray-50 text-gray-400">
                    No active participants to show on map.
                </div>
            )}
          </Card>

           <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Ride Controls</h3>
                <RideActions 
                    myParticipation={myParticipation}
                    isOwner={isOwner}
                    updating={updating}
                    onJoin={handleJoinRide}
                    onLeave={handleLeaveRide}
                    onUpdateLocation={handleUpdateLocation}
                    onSimulate={handleSimulateLocation}
                    onGather={handleGatherParticipants}
                />
           </Card>

        </div>

        {/* Right Column: Participants */}
        <div className="space-y-6">
          <ParticipantsList 
            participants={participants}
            organizerId={ride.created_by_user_id}
          />
        </div>
      </div>
    
      <ConfirmationModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteRide}
        title="Delete Ride?"
        message={
          <div className="space-y-2">
            <p>Are you sure you want to delete <strong>{ride?.title}</strong>?</p>
            <p className="text-red-600 font-medium bg-red-50 p-2 rounded border border-red-100">
               ⚠️ Warning: This action cannot be undone. All {participants.length} participant(s) will be automatically removed from this ride.
            </p>
          </div>
        }
        confirmText="Yes, Delete Ride"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default RideDetails;
