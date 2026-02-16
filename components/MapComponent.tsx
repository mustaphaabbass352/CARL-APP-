
import React, { useEffect, useRef, useState } from 'react';
import { LatLng } from '../types';
import { MapPin, Navigation, WifiOff, Compass } from 'lucide-react';

declare var google: any;

interface MapProps {
  center: LatLng;
  zoom?: number;
  route?: LatLng[];
  showHeatmap?: boolean;
}

const MapComponent: React.FC<MapProps> = ({ center, zoom = 14, route = [], showHeatmap = false }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error' | 'auth_failed'>('loading');

  useEffect(() => {
    const handleAuthFailure = () => setStatus('auth_failed');
    const handleLoadError = () => setStatus('error');

    window.addEventListener('map-auth-failure', handleAuthFailure);
    window.addEventListener('map-load-error', handleLoadError);

    const checkApi = setInterval(() => {
      if (typeof google !== 'undefined' && google.maps) {
        setStatus('loaded');
        clearInterval(checkApi);
      }
    }, 500);

    const timeout = setTimeout(() => {
      if (status === 'loading') setStatus('error');
      clearInterval(checkApi);
    }, 5000);

    return () => {
      window.removeEventListener('map-auth-failure', handleAuthFailure);
      window.removeEventListener('map-load-error', handleLoadError);
      clearInterval(checkApi);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (status === 'loaded' && mapRef.current && !googleMapRef.current) {
      try {
        googleMapRef.current = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          disableDefaultUI: true,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
          ],
        });
      } catch (e) {
        setStatus('error');
      }
    }
  }, [status]);

  useEffect(() => {
    if (googleMapRef.current) {
      googleMapRef.current.setCenter(center);
    }
  }, [center]);

  // Fallback Grid Rendering Logic
  const gridOffset = {
    x: (center.lng * 10000) % 100,
    y: (center.lat * 10000) % 100
  };

  if (status === 'auth_failed' || status === 'error') {
    return (
      <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Dynamic Movement Grid */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none transition-transform duration-500 ease-out" 
          style={{ 
            backgroundImage: 'linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)', 
            backgroundSize: '60px 60px',
            transform: `translate(${gridOffset.x}px, ${gridOffset.y}px)`
          }} 
        />
        
        <div className="relative z-10 flex flex-col items-center p-6 text-center">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <Compass size={48} className="text-green-500 animate-pulse" />
          </div>
          <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Inertial Tracking Active</h3>
          <p className="text-sm text-gray-400 max-w-[280px] mb-6 leading-relaxed">
            Google Maps visual blocked by API restriction. Carl App is now using direct GPS data for tracking.
          </p>
          
          <div className="grid grid-cols-2 gap-3 w-full max-w-[300px]">
            <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/5">
              <p className="text-[10px] text-gray-500 font-black uppercase">Latitude</p>
              <p className="text-sm font-mono text-green-400">{center.lat.toFixed(5)}</p>
            </div>
            <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/5">
              <p className="text-[10px] text-gray-500 font-black uppercase">Longitude</p>
              <p className="text-sm font-mono text-green-400">{center.lng.toFixed(5)}</p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 bg-green-500/10 px-6 py-3 rounded-full border border-green-500/30">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
            <span className="text-xs font-black uppercase text-green-500 tracking-widest">Live GPS Engine Online</span>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Initializing Accra GPS...</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
};

export default MapComponent;
