import React from 'react';
import { Users, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Participant } from '../../api/types';
import Card from '../ui/Card';

interface ParticipantsListProps {
  participants: Participant[];
  organizerId: number;
  currentUserId?: number;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({ participants, organizerId, currentUserId }) => {
  return (
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
            const isOrganizer = organizerId === p.user_id;
            const isMe = currentUserId === p.user_id;
            
            return (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={p.id} 
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors border ${
                  isMe
                    ? "bg-blue-50 border-blue-200" // Highlight for current user
                    : isOrganizer 
                        ? "bg-amber-50 border-amber-100" 
                        : "hover:bg-gray-50 border-transparent hover:border-gray-100"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm border-2 border-white ${
                  isOrganizer 
                    ? "bg-gradient-to-br from-amber-400 to-amber-600" 
                    : "bg-gradient-to-br from-gray-400 to-gray-500"
                }`}>
                  {isOrganizer ? <Star size={20} fill="currentColor" className="text-white/90" /> : index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isMe ? "text-blue-700" : "text-gray-900"}`}>
                        {p.username}
                    </span>
                    {isOrganizer && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                        Organizer
                      </span>
                    )}
                    {isMe && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                        ME
                      </span>
                    )}
                  </div>
                  {p.location_timestamp || (p.latitude && p.longitude) ? (
                     <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                       <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                       Active {p.location_timestamp ? new Date(p.location_timestamp).toLocaleTimeString() : ""}
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
  );
};

export default ParticipantsList;
