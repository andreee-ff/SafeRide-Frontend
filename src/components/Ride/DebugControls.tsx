import React, { useState } from 'react';
import { Bug, Users } from 'lucide-react';
import Button from '../ui/Button';
import SwarmCreationModal from './SwarmCreationModal';

interface DebugControlsProps {
  rideCode: string;
  rideId: number;
}

const DebugControls: React.FC<DebugControlsProps> = ({
  rideCode,
  rideId,
}) => {
  const [simulating, setSimulating] = useState(false);
  const [showSwarmModal, setShowSwarmModal] = useState(false);

  const startSimulation = async (count: number) => {
    try {
      setSimulating(true);
      
      let url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/simulation/start`;
      // Default body for "Start" (Swarm)
      let body: any = { 
           ride_code: rideCode, 
           count: count,
           username_base: count > 1 ? "swarm_bot" : "ghost"
      };

      // If existing simulation (count = 1) -> use animate endpoint
      if (count === 1) {
          url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/simulation/animate`;
          // Use RIDE ID as requested
          body = { ride_id: rideId };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (!res.ok) {
        const err = await res.json();
        alert(`Simulation failed: ${err.detail}`);
      } else {
        if (count > 1) {
             alert(`Swarm of ${count} started!`);
        }
      }
    } catch (e) {
      alert(`Error starting simulation: ${e}`);
    } finally {
      setSimulating(false);
    }
  };

  const handleConfirmSwarm = async (count: number) => {
      setShowSwarmModal(false);
      await startSimulation(count);
  };

  return (
    <>
      <div className="flex gap-2 items-center">
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => startSimulation(1)}
          disabled={simulating}
          className="text-primary-600 bg-primary-50 px-2 h-8 text-xs font-medium"
          isLoading={simulating}
        >
          <Bug size={14} className="mr-1.5" />
          Simulate
        </Button>

        <Button 
          variant="ghost"
          size="sm"
          onClick={() => setShowSwarmModal(true)}
          disabled={simulating}
          className="text-purple-600 bg-purple-50 px-2 h-8 text-xs font-medium"
        >
          <Users size={14} className="mr-1.5" />
          Create
        </Button>
      </div>

      <SwarmCreationModal
        isOpen={showSwarmModal}
        onClose={() => setShowSwarmModal(false)}
        onConfirm={handleConfirmSwarm}
        isLoading={simulating}
      />
    </>
  );
};

export default DebugControls;
