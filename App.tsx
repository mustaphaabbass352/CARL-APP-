
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  Wallet, 
  BarChart3, 
  PlusCircle, 
  Settings as SettingsIcon,
  Activity
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import RideTracker from './components/RideTracker';
import Customers from './components/Customers';
import Finance from './components/Finance';
import Reports from './components/Reports';
import { getAppData } from './storage';
import { AppData, Trip } from './types';

const GHANA_BOUNDS = {
  latMin: 4.7,
  latMax: 11.2,
  lngMin: -3.3,
  lngMax: 1.2
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracker' | 'customers' | 'finance' | 'reports'>('dashboard');
  const [appData, setAppData] = useState<AppData>(getAppData());
  const [isGhana, setIsGhana] = useState<boolean | null>(null);
  const [activeRide, setActiveRide] = useState<Trip | null>(null);

  useEffect(() => {
    // Check GPS and Ghana restrictions
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const inGhana = latitude >= GHANA_BOUNDS.latMin && latitude <= GHANA_BOUNDS.latMax &&
                         longitude >= GHANA_BOUNDS.lngMin && longitude <= GHANA_BOUNDS.lngMax;
        setIsGhana(inGhana);
      }, () => {
        // Fallback for demo purposes if location is denied
        setIsGhana(true); 
      });
    }

    // Refresh data periodically
    const interval = setInterval(() => {
      setAppData(getAppData());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard data={appData} onStartRide={() => setActiveTab('tracker')} />;
      case 'tracker':
        return <RideTracker activeRide={activeRide} setActiveRide={setActiveRide} onComplete={() => {
          setAppData(getAppData());
          setActiveTab('dashboard');
        }} />;
      case 'customers':
        return <Customers data={appData} />;
      case 'finance':
        return <Finance data={appData} onUpdate={() => setAppData(getAppData())} />;
      case 'reports':
        return <Reports data={appData} />;
      default:
        return <Dashboard data={appData} onStartRide={() => setActiveTab('tracker')} />;
    }
  };

  if (isGhana === false) {
    return (
      <div className="min-h-screen bg-red-950 flex flex-col items-center justify-center p-6 text-center">
        <MapPin size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Region Restricted</h1>
        <p className="text-red-200">Carl App is currently only optimized and available for use within the Republic of Ghana.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-900 overflow-hidden shadow-2xl">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between bg-gray-800 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Activity size={20} className="text-black" />
          </div>
          <span className="font-bold text-xl tracking-tight">CARL</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300 font-medium">GHS ₵</span>
          <SettingsIcon size={20} className="text-gray-400" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 scroll-smooth">
        {renderContent()}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-gray-800/95 backdrop-blur-md border-t border-gray-700 flex items-center justify-around py-3 px-2 z-50">
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
          icon={<LayoutDashboard size={24} />} 
          label="Home" 
        />
        <NavButton 
          active={activeTab === 'tracker'} 
          onClick={() => setActiveTab('tracker')} 
          icon={<MapPin size={24} />} 
          label="Trips" 
        />
        <div className="relative -mt-8">
          <button 
            onClick={() => setActiveTab('tracker')}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20 active:scale-95 transition-transform"
          >
            <PlusCircle size={32} className="text-black" />
          </button>
        </div>
        <NavButton 
          active={activeTab === 'finance'} 
          onClick={() => setActiveTab('finance')} 
          icon={<Wallet size={24} />} 
          label="Money" 
        />
        <NavButton 
          active={activeTab === 'reports'} 
          onClick={() => setActiveTab('reports')} 
          icon={<BarChart3 size={24} />} 
          label="Stats" 
        />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-green-500' : 'text-gray-500'}`}
  >
    {icon}
    <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
  </button>
);

export default App;
