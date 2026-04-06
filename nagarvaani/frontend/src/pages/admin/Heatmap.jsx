import React, { useState, useEffect } from 'react';
import AdminMap from '../../components/map/AdminMap';
import { supabase } from '../../lib/supabaseClient';
import { Shield, Activity, MapPin, Filter, MoreVertical, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Heatmap() {
  const [complaints, setComplaints] = useState([]);
  const [silentWards, setSilentWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch live complaint locations
      let query = supabase.from('master_tickets').select('id, lat, lng, priority_score, category').neq('status', 'resolved');
      if (category !== 'ALL') {
         query = query.eq('category', category);
      }
      const { data: tickets, error: ticketError } = await query;
      if (ticketError) throw ticketError;

      // 2. Fetch silent crisis wards
      const { data: wards, error: wardError } = await supabase.from('wards').select('*').gt('silence_ratio', 500); // 500 threshold
      if (wardError) throw wardError;

      setComplaints(tickets || []);
      setSilentWards(wards || []);
    } catch (error) {
      console.error(error);
      toast.error("Telemetry stream interrupted");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category]);

  return (
    <div className="flex h-screen bg-bg">
      <aside className="w-80 bg-surface card-shadow z-20 flex flex-col items-start p-8 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-navy opacity-[0.02] rounded-full" />
        
        <header className="mb-10 w-full">
           <div className="flex items-center gap-2 mb-2 text-navy opacity-40">
              <Shield size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Spatial Telemetry</span>
           </div>
           <h1 className="text-3xl font-sora font-extrabold text-navy tracking-tight">Active Heatmap</h1>
        </header>

        <div className="w-full space-y-8">
          <div>
            <label className="flex items-center gap-2 text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-3 ml-1">
               <Filter size={12} className="text-navy" /> Intelligence Layer
            </label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 border border-border rounded-2xl px-4 py-3.5 font-bold text-navy text-sm outline-none focus:border-navy focus:ring-4 focus:ring-navy/5 transition appearance-none cursor-pointer"
            >
              <option value="ALL">ALL SYSTEMS</option>
              <option value="WATER">WATER SUPPLY</option>
              <option value="ROADS">ROAD INFRA</option>
              <option value="GARBAGE">SANITATION</option>
              <option value="ELECTRICITY">POWER GRID</option>
            </select>
          </div>

          <div>
            <h3 className="text-[11px] font-bold text-navy uppercase tracking-widest border-b border-border pb-3 mb-6">Zone Metrics</h3>
            <div className="space-y-4">
              <LegendItem color="bg-crimson" label="Severe Cluster" weight="Priority 5" />
              <LegendItem color="bg-amber" label="Moderate Crisis" weight="Priority 3-4" />
              <LegendItem color="bg-emerald" label="Emerging Trend" weight="Priority 1-2" />
              
              <div className="mt-8 pt-6 border-t border-border space-y-4">
                 <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-crimson-light text-crimson flex items-center justify-center font-bold text-xl shadow-sm group-hover:scale-110 transition">⚠️</div>
                    <div>
                       <p className="text-[10px] font-bold text-navy uppercase tracking-widest">Silent Crisis</p>
                       <p className="text-xs text-text-secondary font-medium">Anomaly: Zero reporting ward</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto w-full">
           <button 
             onClick={fetchData}
             className="w-full bg-navy text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-navy-light transition shadow-xl group"
           >
              <RefreshCw size={16} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} /> Sync Live Map
           </button>
        </div>
      </aside>

      <main className="flex-1 relative z-0">
        {loading && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-[5] flex items-center justify-center p-12">
             <div className="bg-navy p-8 rounded-3xl text-white shadow-2xl flex items-center gap-4 animate-fade-in">
                <Activity className="animate-spin text-saffron" size={24} />
                <span className="font-sora font-extrabold uppercase tracking-widest text-sm text-[12px]">Processing Geospatial Stream...</span>
             </div>
          </div>
        )}
        <AdminMap complaints={complaints} silentWards={silentWards} />
      </main>
    </div>
  );
}

function LegendItem({ color, label, weight }) {
   return (
      <div className="flex items-center justify-between group cursor-default">
         <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${color} shadow-sm group-hover:scale-125 transition`} />
            <span className="text-xs font-bold text-navy opacity-60 group-hover:opacity-100 transition">{label}</span>
         </div>
         <span className="text-[10px] font-bold text-text-secondary opacity-40 uppercase tracking-tighter">{weight}</span>
      </div>
   );
}
