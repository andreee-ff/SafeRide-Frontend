import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ridesApi } from '../api/client';
import type { RideCreate } from '../api/types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { Type, FileText, Calendar, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const CreateRide: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const rideData: RideCreate = {
        title,
        description: description || undefined,
        start_time: new Date(startTime).toISOString(),
      };

      const newRide = await ridesApi.createRide(rideData);
      navigate(`/rides/${newRide.id}`);
    } catch (err: any) {
      console.error('Error creating ride:', err);
      setError(err.response?.data?.detail || 'Error creating ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Card className="p-8">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 mb-6">
            Create a New Ride
          </h2>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-100">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Ride Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Sunday Morning Group Ride"
              icon={Type}
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                Description
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-3 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                  <FileText size={20} />
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all duration-200 outline-none min-h-[120px]"
                  placeholder="Add any details like meetup point, bike type, avg pace, etc."
                />
              </div>
            </div>

            <Input
              label="Start Time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              icon={Calendar}
            />

            <div className="pt-4 flex gap-4">
              <Button 
                type="submit" 
                isLoading={loading}
                className="flex-1"
                size="lg"
              >
                Create Ride
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default CreateRide;
