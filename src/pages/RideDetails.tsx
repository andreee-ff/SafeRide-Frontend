import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ridesApi, participationsApi } from '../api/client';
import type { Ride, Participant, Participation } from '../api/types';
import { useAuth } from '../contexts/AuthContext';
import ParticipantsMap from '../components/ParticipantsMap';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { MapPin, Calendar, Clock, Hash, Navigation, LogOut, Trash2, Edit, Users, ArrowLeft, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import ConfirmationModal from '../components/ui/ConfirmationModal';

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
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Initialize Socket
  useEffect(() => {
    // Connect to backend
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:8000');
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    loadRideDetails();
    
    // Polling removed in favor of WebSockets
    // But we still fetch initial data in loadRideDetails
  }, [id]);

  // Socket Event Listeners
  useEffect(() => {
    if (!socket) {
        console.log("Socket not initialized yet");
        return;
    }
    if (!ride) {
        console.log("Ride not loaded yet");
        return;
    }

    console.log(`Attempting to join ride room: ${ride.code}`);
    
    // Join the "room" for this ride
    socket.emit('join_ride', { ride_code: ride.code });

    socket.on('connect', () => {
        console.log("Socket Connected:", socket.id);
        // Re-join on reconnect
        socket.emit('join_ride', { ride_code: ride.code });
    });

    socket.on('message', (msg: any) => {
        console.log("Socket Message:", msg);
    });

    // Handle incoming location updates
    socket.on('location_update', (data: any) => {
      console.log("Socket Update:", data);
      
      setParticipants(prevParticipants => {
        const index = prevParticipants.findIndex(p => p.user_id === data.user_id);
        
        if (index !== -1) {
          // Update existing participant
          const updated = [...prevParticipants];
          updated[index] = {
            ...updated[index],
            latitude: data.latitude,
            longitude: data.longitude,
            location_timestamp: data.location_timestamp
          };
          return updated;
        } else {
          // New participant found via socket? 
          // (Ideally we should fetch full profile, but for now we might skip or rely on refresh)
          // Since we only get location data, we can't fully create a participant without username.
          // Strategy: If user unknown, maybe trigger a one-time API refresh or ignore until full sync.
          // For now: let's re-fetch list if we see a stranger, or better:
          // Just ignore strangers for "smoothness" and rely on periodic background sync or manual Refresh?
          // Actually, let's keep it simple: Update local state if found.
          return prevParticipants;
        }
      });
    });

    return () => {
      socket.off('location_update');
    };
  }, [socket, ride]);

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
    console.log("Simulate Move clicked");
    if (!ride) {
        console.error("No ride loaded");
        return;
    }
    if (!myParticipation) {
        console.error("No participation record for current user.");
        return;
    }

    setUpdating(true);
    
    // 1. Determine Center
    // Default to Munich if no one is active, otherwise average or just keep existing.
    // For single user simulation, we just move ourselves.
    const baseLat = 48.1351; 
    const baseLng = 11.5820;

    // ... (rest of logic same as before but simplified for single user move)
    // Actually, let's merge logic.
    // If Simulate is clicked, we move OURSELVES.
    // Use the logic we just wrote, but let's clean it up.
    
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
      
      console.log("Gathering all active participants...");
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
      // Create a new participants array for immediate local update
      const newParticipants = participants.map(p => {
          // Generate random offset ~100m
          const lat = centerLat + (Math.random() - 0.5) * 0.002;
          const lng = centerLng + (Math.random() - 0.5) * 0.002;
          
          // Emit socket (optimization: could batch? Backend handles 1 by 1)
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
    console.log("handleLeaveRide called");
    console.log("Current myParticipation:", myParticipation);
    console.log("Current User:", user);

    // We already check availability in render, but safety first
    if (!myParticipation) {
        console.error("Cannot leave: No participation found");
        alert("Error: No participation found to leave.");
        return;
    }
    
    // Confirm removed for now to ensure it works without browser dialog interference
    // if (!confirm('Are you sure you want to leave this ride?')) {
    //    console.log("Leave cancelled by user");
    //    return;
    // }

    try {
      console.log("Calling participationsApi.leaveRide with ID:", myParticipation.id);
      await participationsApi.leaveRide(myParticipation.id);
      console.log("Leave successful, navigating home");
      navigate('/'); 
    } catch (err: any) {
      console.error("Leave error:", err);
      alert(`Error leaving ride: ${err.response?.data?.detail || err.message}`);
      setError(err.response?.data?.detail || 'Error leaving ride');
    }
  };

  const handleDeleteRide = async () => {
    if (!ride) return;
    
    setIsDeleting(true);
    try {
      console.log("Calling ridesApi.deleteRide...");
      await ridesApi.deleteRide(ride.id);
      console.log("Delete successful. Navigating home.");
      navigate('/');
    } catch (err: any) {
      console.error("Delete error:", err);
      // alert(`Error deleting ride: ${err.response?.data?.detail || err.message}`);
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
      <div className="mb-6">
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
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{ride.title}</h1>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    ride.is_active 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {ride.is_active ? "Active Ride" : "Inactive"}
                  </span>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Hash size={14} /> Code: <span className="font-mono font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{ride.code}</span>
                  </div>
                </div>
              </div>
              
              {isOwner && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/rides/${ride.id}/edit`)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit size={20} />
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 text-sm gap-y-4 gap-x-8 mb-8">
               <div className="col-span-2">
                <h3 className="text-gray-400 font-medium mb-1 flex items-center gap-2"><MapPin size={16} /> Description</h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">
                  {ride.description || "No description provided."}
                </p>
               </div>
               
               <div>
                 <h3 className="text-gray-400 font-medium mb-1 flex items-center gap-2"><Calendar size={16} /> Date</h3>
                 <p className="text-gray-900 font-medium">{new Date(ride.start_time).toLocaleDateString()}</p>
               </div>

               <div>
                 <h3 className="text-gray-400 font-medium mb-1 flex items-center gap-2"><Clock size={16} /> Time</h3>
                 <p className="text-gray-900 font-medium">{new Date(ride.start_time).toLocaleTimeString()}</p>
               </div>
            </div>

            {/* Actions for Participant */}
            <div className="flex gap-3 border-t border-gray-100 pt-6">
              {!myParticipation && (
                <Button onClick={handleJoinRide} className="w-full sm:w-auto">
                  {isOwner ? "Join as Leader" : "Join Ride"}
                </Button>
              )}
              {myParticipation && (
                <>
                  <Button 
                    onClick={handleUpdateLocation} 
                    isLoading={updating}
                  >
                    <Navigation size={18} className="mr-2" />
                    Update Location
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={handleSimulateLocation}
                    disabled={updating}
                    className="text-primary-600 bg-primary-50"
                  >
                    Simulate Move
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={handleGatherParticipants}
                    disabled={updating}
                    className="text-purple-600 bg-purple-50"
                  >
                    Gather All
                  </Button>
                  {isOwner ? (
                    <Button 
                      variant="outline"
                      disabled
                      className="text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
                      title="Organizers cannot leave their own ride"
                    >
                      <LogOut size={18} className="mr-2" />
                      Organizer cannot leave
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={handleLeaveRide}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <LogOut size={18} className="mr-2" />
                      Leave
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>

          {participants.length > 0 && (
            <Card className="overflow-hidden" noPadding>
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin size={18} /> Live Map
                </h3>
              </div>
              <ParticipantsMap 
                participants={participants} 
                height="400px" 
                organizerId={ride.created_by_user_id}
              />
            </Card>
          )}
        </div>

        {/* Right Column: Participants */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={20} className="text-primary-500" />
              Participants ({participants.length})
            </h3>
            
            {participants.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No participants yet.</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {participants.map((p, index) => {
                  const isOrganizer = ride?.created_by_user_id === p.user_id;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={p.id} 
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors border ${
                        isOrganizer 
                          ? "bg-blue-50 border-blue-100" 
                          : "hover:bg-gray-50 border-transparent hover:border-gray-100"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm border-2 border-white ${
                        isOrganizer 
                          ? "bg-gradient-to-br from-blue-500 to-blue-700" 
                          : "bg-gradient-to-br from-primary-400 to-primary-600"
                      }`}>
                        {isOrganizer ? <Star size={20} fill="currentColor" className="text-white/90" /> : index}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium truncate ${isOrganizer ? "text-blue-900" : "text-gray-900"}`}>
                            {p.username}
                          </p>
                          {isOrganizer && (
                            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-blue-200">
                              ORG
                            </span>
                          )}
                        </div>
                        {p.location_timestamp ? (
                           <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                             <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                             Active {new Date(p.location_timestamp).toLocaleTimeString()}
                           </p>
                        ) : (
                          <p className="text-xs text-gray-400 mt-0.5">No location data</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>
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
