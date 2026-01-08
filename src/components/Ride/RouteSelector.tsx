import React, { useState, useEffect, useRef } from 'react';
import { Map, Upload, Eye, EyeOff, Lock, ChevronDown, Check } from 'lucide-react';
import { routesApi } from '../../api/client';
import { Route, RouteVisibility } from '../../api/types';
import { isValidGpx, parseGpx } from '../../utils/gpxUtils';

interface RouteSelectorProps {
  onRouteSelect: (routeId: number | undefined) => void;
  onVisibilityChange: (visibility: RouteVisibility) => void;
  selectedRouteId?: number;
  visibility: RouteVisibility;
}

const RouteSelector: React.FC<RouteSelectorProps> = ({
  onRouteSelect,
  onVisibilityChange,
  selectedRouteId,
  visibility
}) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const data = await routesApi.getOwnedRoutes();
      setRoutes(data);
    } catch (err) {
      console.error('Error fetching routes:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (!isValidGpx(content)) {
        alert('Invalid GPX file format');
        return;
      }

      try {
        setUploading(true);
        const { points, title: gpxTitle } = parseGpx(content);
        
        if (points.length === 0) {
          alert('No coordinates found in the GPX file. Please check if the file is valid.');
          return;
        }

        const newRoute = await routesApi.createRoute({
          title: gpxTitle || file.name.replace('.gpx', ''),
          gpx_data: content,
          description: `Uploaded from ${file.name}`
        });
        
        setRoutes([newRoute, ...routes]);
        onRouteSelect(newRoute.id);
        setIsDropdownOpen(false); // Close dropdown on success
      } catch (err: any) {
        console.error('Error uploading route:', err);
        const errorMsg = err.response?.data?.detail || 'Failed to upload route. Please try again.';
        alert(errorMsg);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const selectedRoute = routes.find(r => r.id === selectedRouteId);

  const visibilityOptions = [
    { value: RouteVisibility.ALWAYS, label: 'Always Visible', icon: Eye, desc: 'Everyone can see the route' },
    { value: RouteVisibility.START, label: 'Reveal on Start', icon: EyeOff, desc: 'Route hidden until ride starts' },
    { value: RouteVisibility.SECRET, label: 'Secret (Organizer)', icon: Lock, desc: 'Only you see the route' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 ml-1">
          Select Route (GPX)
        </label>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between hover:border-primary-500 transition-all outline-none"
          >
            <div className="flex items-center gap-3">
              <Map className="text-gray-400" size={20} />
              <span className={selectedRoute ? "text-gray-900" : "text-gray-400"}>
                {selectedRoute ? selectedRoute.title : 'Choose a route or upload new'}
              </span>
            </div>
            <ChevronDown size={18} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-60 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    onRouteSelect(undefined);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-gray-600">No route (Free Ride)</span>
                  {!selectedRouteId && <Check size={16} className="text-primary-600" />}
                </button>
                
                {routes.map(route => (
                  <button
                    key={route.id}
                    type="button"
                    onClick={() => {
                      onRouteSelect(route.id);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left border-t border-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{route.title}</p>
                      <p className="text-xs text-gray-400">{(route.distance_meters / 1000).toFixed(1)} km</p>
                    </div>
                    {selectedRouteId === route.id && <Check size={16} className="text-primary-600" />}
                  </button>
                ))}
              </div>
              
              <div className="p-2 bg-gray-50 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Upload size={16} />
                  {uploading ? 'Parsing...' : 'Upload GPX File'}
                </button>
              </div>
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".gpx"
          onChange={handleFileUpload}
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 ml-1">
          Route Visibility
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {visibilityOptions.map(option => {
            const Icon = option.icon;
            const isSelected = visibility === option.value;
            
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onVisibilityChange(option.value as RouteVisibility)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all text-center gap-2 ${
                  isSelected 
                    ? 'border-primary-500 bg-primary-50/50 shadow-sm' 
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <Icon size={24} className={isSelected ? 'text-primary-600' : 'text-gray-400'} />
                <div>
                  <p className={`text-sm font-bold ${isSelected ? 'text-primary-900' : 'text-gray-700'}`}>
                    {option.label}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                    {option.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RouteSelector;
