import React from 'react';
import { Users, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Participant } from '../../api/types';
import Card from '../ui/Card';

interface ParticipantsListProps {
  participants: Participant[];
  organizerId: number;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({ participants, organizerId }) => {
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
  );
};

export default ParticipantsList;
