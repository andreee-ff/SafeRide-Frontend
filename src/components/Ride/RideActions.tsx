import React from 'react';
import { Navigation, LogOut } from 'lucide-react';
import Button from '../ui/Button';
import type { Participation } from '../../api/types';

interface RideActionsProps {
  myParticipation: Participation | null;
  isOwner: boolean;
  updating: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onUpdateLocation: () => void;
  onSimulate: () => void;
  onGather: () => void;
}

const RideActions: React.FC<RideActionsProps> = ({
  myParticipation,
  isOwner,
  updating,
  onJoin,
  onLeave,
  onUpdateLocation,
  onSimulate,
  onGather
}) => {
  return (
    <div className="flex gap-3 border-t border-gray-100 pt-6">
      {!myParticipation && (
        <Button onClick={onJoin} className="w-full sm:w-auto">
          {isOwner ? "Join as Leader" : "Join Ride"}
        </Button>
      )}
      {myParticipation && (
        <>
          <Button 
            onClick={onUpdateLocation} 
            isLoading={updating}
          >
            <Navigation size={18} className="mr-2" />
            Update Location
          </Button>
          <Button 
            variant="ghost"
            onClick={onSimulate}
            disabled={updating}
            className="text-primary-600 bg-primary-50"
          >
            Simulate Move
          </Button>
          <Button 
            variant="ghost"
            onClick={onGather}
            disabled={updating}
            className="text-purple-600 bg-purple-50"
          >
            Gather All
          </Button>
          {isOwner ? (
            <Button 
              variant="outline"
              disabled
              className="text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
              title="Organizers cannot leave their own ride"
            >
              <LogOut size={18} className="mr-2" />
              Organizer cannot leave
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={onLeave}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut size={18} className="mr-2" />
              Leave
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default RideActions;
