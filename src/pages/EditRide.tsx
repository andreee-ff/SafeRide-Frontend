import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ridesApi } from '../api/client';
import type { RideUpdate } from '../api/types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { Type, FileText, Calendar, ArrowLeft, Power } from 'lucide-react';
import { motion } from 'framer-motion';

const EditRide: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadRide();
  }, [id]);

  const loadRide = async () => {
    if (!id) return;
    
    try {
      const ride = await ridesApi.getRideById(parseInt(id));
      setTitle(ride.title);
      setDescription(ride.description || '');
      // Convert ISO string to datetime-local format
      const date = new Date(ride.start_time);
      const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setStartTime(localDateTime);
      setIsActive(ride.is_active);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error loading ride');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUpdating(true);

    try {
      const rideData: RideUpdate = {
        title,
        description: description || undefined,
        start_time: new Date(startTime).toISOString(),
        is_active: isActive,
      };

      await ridesApi.updateRide(parseInt(id!), rideData);
      navigate(`/rides/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error updating ride');
    } finally {
      setUpdating(false);
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
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <button 
          onClick={() => navigate(`/rides/${id}`)}
          className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Back to parameters
        </button>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Card className="p-8">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 mb-6">
            Edit Ride
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

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className={`p-2 rounded-lg ${isActive ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                <Power size={20} />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-900 block cursor-pointer select-none">
                  Ride Status
                  <p className="text-xs text-gray-500 font-normal">
                    {isActive ? 'Ride is currently active and visible' : 'Ride is inactive and hidden from list'}
                  </p>
                </label>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
              />
            </div>

            <div className="pt-4 flex gap-4">
              <Button 
                type="submit" 
                isLoading={updating}
                className="flex-1"
                size="lg"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default EditRide;
