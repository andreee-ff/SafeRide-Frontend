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
import DebugControls from '../components/Ride/DebugControls';

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
      
      // 1. Fetch Ride Public Data (Priority)
      try {
          const rideData = await ridesApi.getRideById(rideId);
          setRide(rideData);

          // 2. Fetch Participations (Public)
          try {
             const participantsData = await participationsApi.getRideParticipations(rideId);
             if (rideData) {
                participantsData.sort((a, b) => {
                    if (a.user_id === rideData.created_by_user_id) return -1;
                    if (b.user_id === rideData.created_by_user_id) return 1;
                    return 0;
                });
             }
             setParticipants(Array.isArray(participantsData) ? participantsData : []);
             console.log("Participants Loaded:", participantsData);
          } catch (pErr) {
             console.warn("Failed to load participants", pErr);
             setParticipants([]);
          }

          // 3. Fetch My Participation (Authenticated)
          if (user) {
              try {
                 const myParticipationsData = await participationsApi.getMyParticipations();
                 const myPart = myParticipationsData.find(p => p.ride_id === rideId && p.user_id === user.id);
                 setMyParticipation(myPart || null);
              } catch (authErr) {
                 console.warn("User not authenticated or failed to fetch participations", authErr);
                 setMyParticipation(null);
              }
          } else {
              setMyParticipation(null);
          }

      } catch (rideErr: any) {
          throw rideErr; // If main ride load fails, we throw to outer catch
      }
      
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
              const timestamp = new Date(position.timestamp).toISOString();

              // 1. Send to API (Persist)
              await participationsApi.updateLocation(myParticipation.id, {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                location_timestamp: timestamp
              });

              // 2. Emit to Socket (Real-time Broadcast)
              if (socket) {
                socket.emit('update_location', {
                    ride_code: ride.code,
                    user_id: user?.id,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    location_timestamp: timestamp
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
            isParticipant={!!myParticipation}
            updating={updating}
            onDelete={() => setShowDeleteConfirm(true)} 
            onJoin={handleJoinRide}
            onLeave={handleLeaveRide}
            onUpdateLocation={handleUpdateLocation}
          />
          
          {/* Debug Controls (Compact) */}
          {myParticipation && (
             <div className="flex justify-end">
                <DebugControls rideCode={ride.code} rideId={ride.id} />
             </div>
          )}

          <Card className="overflow-hidden" noPadding>
            <div className="p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin size={18} /> Live Map <span className="text-gray-400 font-normal">({participants.length})</span>
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
                    currentUserId={user?.id}
                />
            ) : (
                <div className="h-[400px] flex items-center justify-center bg-gray-50 text-gray-400">
                    No active participants to show on map.
                </div>
            )}
          </Card>

        </div>

        {/* Right Column: Participants */}
        <div className="space-y-6">
          <ParticipantsList 
            participants={participants}
            organizerId={ride.created_by_user_id}
            currentUserId={user?.id}
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
