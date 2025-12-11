import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ridesApi, participationsApi } from '../api/client';
import type { Ride } from '../api/types';
import { motion } from 'framer-motion';

import Button from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import RideCard from '../components/RideCard';

const OwnedRidesPage: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [participantCounts, setParticipantCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const myOwned = await ridesApi.getOwnedRides();
      setRides(myOwned);

      const counts: Record<number, number> = {};
      await Promise.all(
        myOwned.map(async (ride) => {
          try {
            const participants = await participationsApi.getRideParticipations(ride.id);
            counts[ride.id] = participants.length;
          } catch (err) {
            counts[ride.id] = 0;
          }
        })
      );
      setParticipantCounts(counts);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load rides');
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/')} size="sm">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Your Organized Rides</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {rides.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rides.map((ride) => (
            <motion.div
              key={ride.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RideCard ride={ride} participantCount={participantCounts[ride.id]} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 mb-4">You haven't organized any rides yet.</p>
          <Button onClick={() => navigate('/create')}>Create a Ride</Button>
        </div>
      )}
    </motion.div>
  );
};

export default OwnedRidesPage;
