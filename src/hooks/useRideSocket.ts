import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Participant } from '../api/types';

export const useRideSocket = (
    rideCode: string | undefined, 
    rideId: number | undefined,
    setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>
) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Initialize Socket
    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:8000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setIsConnected(true);
            if (rideCode) {
                console.log(`Socket Connected. Joining room: ${rideCode}`);
                newSocket.emit('join_ride', { ride_code: rideCode });
            }
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
        });

        return () => {
            newSocket.close();
        };
    }, []); // Run once on mount (or we could depend on URL but that's constant)

    // Handle Room Joining (if rideCode loads later)
    useEffect(() => {
        if (socket && isConnected && rideCode) {
            socket.emit('join_ride', { ride_code: rideCode });
        }
    }, [socket, isConnected, rideCode]);

    // Handle Location Updates
    useEffect(() => {
        if (!socket || !rideId) return;

        const handleLocationUpdate = (data: any) => {
            // console.log("Socket Update:", data);
            
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
                    // New participant found via socket
                    return [...prevParticipants, {
                        id: -data.user_id, // Use negative user_id to ensure uniqueness vs Date.now() collisions
                        user_id: data.user_id,
                        ride_id: rideId,
                        username: `Rider #${data.user_id}`, // Placeholder
                        joined_at: new Date().toISOString(),
                        latitude: data.latitude,
                        longitude: data.longitude,
                        location_timestamp: data.location_timestamp
                    }];
                }
            });
        };

        socket.on('location_update', handleLocationUpdate);

        return () => {
            socket.off('location_update', handleLocationUpdate);
        };
    }, [socket, rideId, setParticipants]);

    return { socket, isConnected };
};
