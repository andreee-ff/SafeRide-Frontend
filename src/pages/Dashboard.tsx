import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ridesApi, participationsApi } from '../api/client';
import type { Ride } from '../api/types';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { Plus, ArrowRight } from 'lucide-react';
import RideCard from '../components/RideCard';

const Dashboard: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [ownedRides, setOwnedRides] = useState<Ride[]>([]);
  const [joinedRides, setJoinedRides] = useState<Ride[]>([]);
  const [participantCounts, setParticipantCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for demo mode
    const searchParams = new URLSearchParams(window.location.search);
    const isDemo = searchParams.get('demo') === 'true';

    if (isDemo) {
        generateDemoData();
    } else {
        loadData();
    }
  }, []);

  const generateDemoData = () => {
      setLoading(true);
      // FAKE DATA FOR PRESENTATION
      const fakeRides: Ride[] = [
          { 
            id: 101, 
            code: "DEMO1",
            title: "Downtown Sunset Cruise", 
            description: "Casual ride through the city center.", 
            start_time: "2024-10-24T18:00:00", 
            created_by_user_id: 999, 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true
          },
          { 
            id: 102, 
            code: "DEMO2",
            title: "Electric Scooter Meetup", 
            description: "Testing new e-scooters.", 
            start_time: "2024-10-25T14:00:00", 
            created_by_user_id: 998, 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true
          },
          { 
            id: 103, 
            code: "DEMO3",
            title: "Monthly Critical Mass", 
            description: "Reclaiming the streets!", 
            start_time: "2024-10-26T19:00:00", 
            created_by_user_id: 997, 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true
          },
      ];
      
      setRides(fakeRides);
      setOwnedRides([fakeRides[0]]);
      setJoinedRides([fakeRides[1]]);
      
      setParticipantCounts({101: 42, 102: 15, 103: 128});
      setLoading(false);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // We fetch all lists. Owned/Joined might return 404 if empty, which we catch.
      const [available, myOwned, myJoined] = await Promise.all([
        ridesApi.getAvailableRides(),
        ridesApi.getOwnedRides().catch(() => [] as Ride[]),
        ridesApi.getJoinedRides().catch(() => [] as Ride[])
      ]);

      setRides(available);
      setOwnedRides(myOwned);
      setJoinedRides(myJoined);
      
      // Collect all unique ride IDs to fetch counts
      const allRideIds = Array.from(new Set([
          ...available.map(r => r.id),
          ...myOwned.map(r => r.id),
          ...myJoined.map(r => r.id)
      ]));

      const counts: Record<number, number> = {};
      await Promise.all(
        allRideIds.map(async (id) => {
          try {
            const participants = await participationsApi.getRideParticipations(id);
            counts[id] = participants.length;
          } catch (err) {
            counts[id] = 0;
          }
        })
      );
      setParticipantCounts(counts);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load data');
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



  const Section = ({ title, rides: sectionRides, emptyMsg, viewAllLink }: { title: string; rides: Ride[], emptyMsg: string, viewAllLink?: string }) => {
    const displayedRides = viewAllLink ? sectionRides.slice(0, 3) : sectionRides;
    
    return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {title}
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
            {sectionRides.length}
          </span>
        </h2>
        {viewAllLink && sectionRides.length > 3 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(viewAllLink)}
            className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
          >
            View All <ArrowRight size={16} className="ml-1" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedRides.length > 0 ? (
          displayedRides.map((ride) => (
            <motion.div
              key={ride.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RideCard ride={ride} participantCount={participantCounts[ride.id]} />
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm font-medium">{emptyMsg}</p>
          </div>
        )}
      </div>
    </div>
  );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gray-900 text-white p-8 md:p-12 shadow-2xl">
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('/images/autumn-ride.png')] bg-cover bg-center opacity-60"></div>
        
        {/* Violet/Pink Brand Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 via-primary-800/80 to-pink-600/40 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>

        {/* Decorative Blobs for that 'pink' feel */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-pink-500 opacity-20 rounded-full blur-3xl mix-blend-screen"></div>
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Hello, {user?.username} 👋
          </h1>
          <p className="text-primary-100 text-lg mb-8 max-w-xl">
            Ready for your next journey? Create a new ride or join an existing one to get started.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => navigate('/create')}
              className="bg-white text-primary-900 hover:bg-gray-50 shadow-none border-0"
            >
              <Plus size={18} className="mr-2" /> Create New Ride
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/join')}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Join with Code <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 animate-fade-in">
          {error}
        </div>
      )}

      {/* Sections */}
      <Section 
        title="Your Organized Rides" 
        rides={ownedRides} 
        emptyMsg="You haven't created any rides yet." 
        viewAllLink="/rides/organized"
      />
      
      <Section 
        title="Upcoming Trips" 
        rides={joinedRides} 
        emptyMsg="You haven't joined any rides yet."
        viewAllLink="/rides/upcoming"
      />
      
      <Section 
        title="Explore Available Rides" 
        rides={rides} 
        emptyMsg="No other rides available right now." 
        viewAllLink="/rides/available"
      />
    </motion.div>
  );
};

export default Dashboard;
