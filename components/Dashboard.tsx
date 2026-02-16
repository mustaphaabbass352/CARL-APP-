
import React, { useState, useEffect } from 'react';
import { TrendingUp, Wallet, Timer, Map as MapIcon, ChevronRight, Flame, Sparkles, BrainCircuit } from 'lucide-react';
import { AppData } from '../types';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { GoogleGenAI } from '@google/genai';

interface DashboardProps {
  data: AppData;
  onStartRide: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onStartRide }) => {
  const [insight, setInsight] = useState<string>("Analyzing your GPS history...");
  const [loadingInsight, setLoadingInsight] = useState(true);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTrips = data.trips.filter(t => t.startTime >= today.getTime());
  const todayEarnings = todayTrips.reduce((acc, t) => acc + t.fare, 0);
  const todayExpenses = data.expenses
    .filter(e => e.date >= today.getTime())
    .reduce((acc, e) => acc + e.amount, 0);
  const todayNet = todayEarnings - todayExpenses;

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        const prompt = `Act as an expert Ghana ride-hailing consultant. 
        Current location: Accra/Kumasi area.
        Context: Earnings GHS ${todayEarnings}, Expenses GHS ${todayExpenses}.
        Goal: Provide ONE high-value profitable insight for a driver today. 
        Mention a specific real-world hotspot in Ghana (e.g. Osu, Kumasi Mall, Kotoka Airport) where demand is usually high at this time.
        Keep it under 15 words.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
              retrievalConfig: {
                latLng: { latitude: 5.6037, longitude: -0.1870 } // Default Accra
              }
            }
          }
        });
        setInsight(response.text || "Head towards Spintex for steady afternoon bookings.");
      } catch (e) {
        setInsight("Stick to East Legon for higher-value card payments today.");
      } finally {
        setLoadingInsight(false);
      }
    };

    fetchInsight();
  }, [todayEarnings]);

  return (
    <div className="p-4 space-y-6">
      <section className="bg-gray-800 border border-green-500/30 rounded-3xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-20">
          <BrainCircuit size={40} className="text-green-500" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-green-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles size={10} />
            AI COACH
          </span>
        </div>
        <p className={`text-sm leading-relaxed font-bold ${loadingInsight ? 'animate-pulse text-gray-500' : 'text-gray-200'}`}>
          "{insight}"
        </p>
      </section>

      <section className="bg-gradient-to-br from-green-600 via-green-700 to-green-900 rounded-[32px] p-7 shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12">
          <Wallet size={160} />
        </div>
        <div className="relative z-10">
          <p className="text-green-100 text-xs font-black uppercase tracking-widest opacity-80">Net Profit Today</p>
          <h2 className="text-5xl font-black mt-2 tabular-nums">₵{todayNet.toFixed(2)}</h2>
          <div className="flex gap-4 mt-8">
            <div className="bg-black/20 p-4 rounded-2xl flex-1 backdrop-blur-md border border-white/5">
              <p className="text-green-200 text-[10px] uppercase font-black opacity-60">Gross</p>
              <p className="text-xl font-black">₵{todayEarnings.toFixed(0)}</p>
            </div>
            <div className="bg-black/20 p-4 rounded-2xl flex-1 backdrop-blur-md border border-white/5">
              <p className="text-red-200 text-[10px] uppercase font-black opacity-60">Costs</p>
              <p className="text-xl font-black text-red-400">₵{todayExpenses.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </section>

      <button 
        onClick={onStartRide}
        className="w-full bg-gray-800 border-2 border-green-500/20 h-28 px-6 rounded-[32px] flex items-center justify-between active:scale-95 transition-all group shadow-xl"
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-green-500/20">
            <Timer className="text-black" size={32} />
          </div>
          <div className="text-left">
            <p className="font-black text-2xl uppercase tracking-tighter">Start Shift</p>
            <p className="text-xs text-gray-500 font-bold">Syncing Accra GPS history...</p>
          </div>
        </div>
        <ChevronRight className="text-green-500 group-hover:translate-x-1 transition-transform" size={28} />
      </button>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700">
           <Timer className="text-blue-400 mb-2" size={24} />
           <p className="text-[10px] text-gray-500 uppercase font-black">Trips Today</p>
           <p className="text-2xl font-black">{todayTrips.length}</p>
        </div>
        <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700">
           <Flame className="text-orange-400 mb-2" size={24} />
           <p className="text-[10px] text-gray-500 uppercase font-black">Status</p>
           <p className="text-2xl font-black text-green-500">Active</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
