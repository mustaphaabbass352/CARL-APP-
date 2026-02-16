
import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Navigation, CreditCard, Banknote, RefreshCw } from 'lucide-react';
import { Trip, PaymentType, LatLng, Customer } from '../types';
import { addTrip, getAppData } from '../storage';
import MapComponent from './MapComponent';

interface RideTrackerProps {
  activeRide: Trip | null;
  setActiveRide: (ride: Trip | null) => void;
  onComplete: () => void;
}

const ACCRA_CENTER: LatLng = { lat: 5.6037, lng: -0.1870 };

const RideTracker: React.FC<RideTrackerProps> = ({ activeRide, setActiveRide, onComplete }) => {
  const [duration, setDuration] = useState(0);
  const [fare, setFare] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [payment, setPayment] = useState<PaymentType>(PaymentType.CASH);
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [showSummaryForm, setShowSummaryForm] = useState(false);
  const [currentPos, setCurrentPos] = useState<LatLng>(ACCRA_CENTER);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const syncGPS = () => {
    setIsSyncing(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentPos(newPos);
        setIsSyncing(false);
      },
      (err) => {
        console.error(err);
        setIsSyncing(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  useEffect(() => {
    setCustomers(getAppData().customers);
    syncGPS();
  }, []);

  useEffect(() => {
    if (activeRide) {
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - activeRide.startTime) / 1000));
      }, 1000);

      const watchId = navigator.geolocation.watchPosition((pos) => {
        const newCoord = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentPos(newCoord);
        
        setActiveRide({
          ...activeRide,
          route: [...activeRide.route, newCoord]
        });
      }, (err) => console.error(err), { enableHighAccuracy: true });

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [!!activeRide]);

  const handleStart = () => {
    const newRide: Trip = {
      id: Date.now().toString(),
      startTime: Date.now(),
      endTime: null,
      pickupLocation: 'In Progress...',
      dropoffLocation: '',
      fare: 0,
      distance: 0,
      paymentType: PaymentType.CASH,
      notes: '',
      route: [currentPos],
      status: 'ACTIVE'
    };
    setActiveRide(newRide);
    setDuration(0);
  };

  const handleStop = () => {
    setShowSummaryForm(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleCompleteTrip = () => {
    if (!activeRide) return;
    const completedTrip: Trip = {
      ...activeRide,
      endTime: Date.now(),
      fare: parseFloat(fare) || 0,
      pickupLocation: pickup || 'Unknown Start',
      dropoffLocation: dropoff || 'Unknown End',
      paymentType: payment,
      customerId,
      status: 'COMPLETED'
    };
    addTrip(completedTrip);
    setActiveRide(null);
    onComplete();
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (showSummaryForm) {
    return (
      <div className="p-6 space-y-6 bg-gray-900 min-h-full">
        <h2 className="text-3xl font-black flex items-center gap-3">
          <Navigation className="text-green-500" size={32} />
          Save Trip
        </h2>
        <div className="space-y-4">
          <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 flex flex-col items-center shadow-inner">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-2">Total Fare (GHS)</p>
            <div className="relative w-full">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-gray-600">₵</span>
              <input 
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                className="w-full bg-gray-900 border border-gray-700 rounded-2xl py-6 pl-14 pr-4 text-4xl font-black text-center text-green-500 focus:border-green-500 outline-none transition-all"
                value={fare}
                onChange={(e) => setFare(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setPayment(PaymentType.CASH)} className={`p-5 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${payment === PaymentType.CASH ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-gray-800 border-transparent text-gray-400'}`}>
              <Banknote size={24} />
              <span className="font-black text-sm uppercase">Cash</span>
            </button>
            <button onClick={() => setPayment(PaymentType.CARD)} className={`p-5 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${payment === PaymentType.CARD ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-gray-800 border-transparent text-gray-400'}`}>
              <CreditCard size={24} />
              <span className="font-black text-sm uppercase">Card</span>
            </button>
          </div>
          <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
             <input placeholder="Drop-off Area" className="w-full bg-transparent outline-none text-white font-bold" value={dropoff} onChange={(e) => setDropoff(e.target.value)} />
          </div>
        </div>
        <div className="pt-6 flex gap-3">
          <button onClick={() => setShowSummaryForm(false)} className="flex-1 py-5 bg-gray-800 border border-gray-700 rounded-2xl font-black text-gray-400 text-sm uppercase">Back</button>
          <button onClick={handleCompleteTrip} className="flex-[2] py-5 bg-green-500 rounded-2xl font-black text-black text-lg uppercase shadow-xl shadow-green-500/30">Finish</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex-1 relative bg-gray-800 overflow-hidden">
        <MapComponent center={currentPos} route={activeRide?.route} zoom={activeRide ? 16 : 14} />
        
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={syncGPS}
            className={`p-3 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 text-white shadow-xl active:scale-90 transition-transform ${isSyncing ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={20} />
          </button>
        </div>

        {activeRide && (
          <div className="absolute top-4 left-4 right-16 z-10">
            <div className="bg-gray-900/90 backdrop-blur-md p-4 rounded-2xl border border-green-500/30 flex justify-between items-center shadow-2xl">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-black">Duration</p>
                <p className="text-2xl font-black tabular-nums leading-none">{formatTime(duration)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase font-black">Gross GHS</p>
                <p className="text-xl font-black text-green-500">₵ {((duration / 60) * 0.9 + 5).toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-800 p-6 rounded-t-[40px] border-t border-gray-700 shadow-2xl shrink-0">
        {!activeRide ? (
          <button onClick={handleStart} className="w-full h-24 bg-green-500 text-black rounded-3xl flex items-center justify-center gap-4 active:scale-95 transition-all shadow-2xl shadow-green-500/40 group">
            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play size={28} fill="currentColor" className="ml-1" />
            </div>
            <span className="text-2xl font-black uppercase tracking-tight">Start Tracking</span>
          </button>
        ) : (
          <button onClick={handleStop} className="w-full h-24 bg-red-500 text-white rounded-3xl flex items-center justify-center gap-4 active:scale-95 transition-all shadow-2xl shadow-red-500/40 group">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform">
              <Square size={28} fill="currentColor" />
            </div>
            <span className="text-2xl font-black uppercase tracking-tight">End Ride</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default RideTracker;
