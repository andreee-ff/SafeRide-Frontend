import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { participationsApi, ridesApi } from '../api/client';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Search, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import RideCard from '../components/RideCard';

const JoinRide: React.FC = () => {
  const [rideCode, setRideCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [rides, setRides] = useState<any[]>([]);
  const [participantCounts, setParticipantCounts] = useState<Record<number, number>>({});

  React.useEffect(() => {
    loadAvailableRides();
  }, []);

  const loadAvailableRides = async () => {
    try {
      const available = await ridesApi.getAvailableRides();
      setRides(available);

      const counts: Record<number, number> = {};
      await Promise.all(
        available.map(async (ride) => {
          try {
            const participants = await participationsApi.getRideParticipations(ride.id);
            counts[ride.id] = participants.length;
          } catch (err) {
            counts[ride.id] = 0;
          }
        })
      );
      setParticipantCounts(counts);
    } catch (e) {
      console.error("Failed to load available rides", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const ride = await ridesApi.getRideByCode(rideCode);
      await participationsApi.joinRide({ ride_code: rideCode });
      navigate(`/rides/${ride.id}`);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Ride with this code not found');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Error joining ride');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-12 px-4 space-y-16">
      {/* Join by Code Section */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg"
      >
        <Card className="p-8 text-center" variant="glass">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
            <Search size={32} />
          </div>
          
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-secondary-700 mb-2">
            Join a Ride
          </h1>
          <p className="text-gray-500 mb-8">
            Enter the 6-character code provided by the organizer to join their trip.
          </p>
          
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mb-6 rounded-xl bg-red-50 p-4 border border-red-100 text-left"
            >
              <p className="text-sm font-medium text-red-800">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                required
                className="w-full text-center text-4xl font-bold tracking-[0.2em] uppercase py-4 border-b-2 border-gray-200 focus:border-primary-500 outline-none bg-transparent transition-colors placeholder:text-gray-200 placeholder:tracking-normal"
                value={rideCode}
                onChange={(e) => setRideCode(e.target.value.toUpperCase())}
                placeholder="CODE"
                maxLength={6}
                autoFocus
              />
            </div>

            <Button
              type="submit"
              disabled={loading || rideCode.length < 6}
              className="w-full"
              size="lg"
              isLoading={loading}
            >
             Join Now <ArrowRight size={18} className="ml-2" />
            </Button>
            
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-gray-400 hover:text-gray-600 font-medium"
            >
              Cancel
            </button>
          </form>
        </Card>
      </motion.div>

      {/* Available Rides Section */}
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
             Explore Available Rides
          </h2>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/rides/available')}
            className="text-primary-600 hover:text-primary-700"
          >
            View All <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>

        {rides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rides.slice(0, 3).map((ride) => (
              <motion.div
                key={ride.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                  {/* We need to import RideCard if not present, but for now I assume I can import it or use inline if import is tricky with replace. 
                      Wait, previous content did NOT import RideCard. I must look at imports. 
                      Ah, I see imports in original file: import Card from ...
                      I need to add RideCard import too.
                  */}
                  <RideCard ride={ride} participantCount={participantCounts[ride.id] || 0} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500">No other public rides available at the moment.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default JoinRide;
