import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users } from 'lucide-react';
import Card from './ui/Card';
import type { Ride } from '../api/types';
import { useAuth } from '../contexts/AuthContext';

interface RideCardProps {
  ride: Ride;
  participantCount?: number;
}

const RideCard: React.FC<RideCardProps> = ({ ride, participantCount: initialCount }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isOrganizer = user?.id === ride.created_by_user_id;

  return (
    <Card 
      variant="white"
      className="group cursor-pointer hover:shadow-primary-500/10 hover:border-primary-200 transition-all duration-300 relative overflow-hidden"
      onClick={() => navigate(`/rides/${ride.id}`)}
      noPadding
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="bg-primary-50 p-2 rounded-lg text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
            <MapPin size={24} />
          </div>
          <div className="flex flex-col items-end gap-1">
             <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                ride.is_active 
                  ? "bg-green-100 text-green-700" 
                  : "bg-gray-100 text-gray-600"
              }`}>
                {ride.is_active ? "Active" : "Inactive"}
              </span>
              
              {isOrganizer && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-blue-200">
                      ORG
                  </span>
              )}
          </div>
        </div>
        
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {ride.title}
        </h3>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
          {ride.description || "No description provided."}
        </p>
        
        <div className="flex items-center gap-4 text-xs font-medium text-gray-400 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            {new Date(ride.start_time).toLocaleDateString()}
          </div>
          


          <div className="flex items-center gap-1.5">
            <Users size={14} />
            {initialCount ?? 0} Cyclists
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RideCard;
