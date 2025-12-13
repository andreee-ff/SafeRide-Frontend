import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, MapPin, Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import type { Ride } from '../../api/types';
import Card from '../ui/Card';

interface RideHeaderProps {
  ride: Ride;
  isOwner: boolean;
  isParticipant: boolean;
  updating?: boolean;
  onDelete: () => void;
  onJoin?: () => void;
  onLeave?: () => void;
  onUpdateLocation?: () => void;
}

const RideHeader: React.FC<RideHeaderProps> = ({ 
  ride, 
  isOwner, 
  isParticipant,
  updating,
  onDelete,
  onJoin,
  onLeave,
  onUpdateLocation
}) => {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    if (ride?.code) {
        navigator.clipboard.writeText(ride.code)
            .then(() => {
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
            })
            .catch(err => console.error("Failed to copy", err));
    }
  };

  return (
    <Card className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
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
              <Hash size={14} /> Code: 
              <div className="relative flex items-center">
                <span 
                    className="font-mono font-bold text-primary-700 bg-primary-100 px-2 py-0.5 rounded cursor-pointer hover:bg-primary-200 transition-colors select-none ml-1 border border-primary-200"
                    onClick={handleCopyCode}
                    title="Click to copy code"
                >
                    {ride.code}
                </span>
                {copiedCode && (
                    <span className="absolute left-full ml-2 text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 whitespace-nowrap animate-in fade-in zoom-in duration-200">
                        Copied!
                    </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-end md:self-start">
            {/* Functional Buttons */}
            {!isParticipant && onJoin && (
                <button
                    onClick={onJoin}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm"
                >
                    {isOwner ? "Join as Leader" : "Join Ride"}
                </button>
            )}

            {isParticipant && (
                <>
                    {onUpdateLocation && (
                        <button
                            onClick={onUpdateLocation}
                            disabled={updating}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-wait"
                        >
                           <MapPin size={18} />
                           {updating ? "Updating..." : "Update Location"}
                        </button>
                    )}
                    
                    {/* Owner cannot leave, others can */}
                    {!isOwner && onLeave && (
                         <button
                            onClick={onLeave}
                            className="px-4 py-2 border border-red-200 text-red-600 bg-white rounded-lg font-medium hover:bg-red-50 transition-colors"
                        >
                            Leave
                        </button>
                    )}
                </>
            )}

            {isOwner && (
                <>
                    <div className="w-px h-8 bg-gray-200 mx-2"></div>
                    <button 
                    onClick={() => navigate(`/rides/${ride.id}/edit`)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Edit Ride"
                    >
                    <Edit size={20} />
                    </button>
                    <button 
                    onClick={onDelete}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Ride"
                    >
                    <Trash2 size={20} />
                    </button>
                </>
            )}
        </div>
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
    </Card>
  );
};

export default RideHeader;
