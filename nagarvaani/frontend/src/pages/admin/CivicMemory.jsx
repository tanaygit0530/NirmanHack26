import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import CivicMemoryTable from '../../components/admin/CivicMemoryTable';
import { Sparkles, Brain, AlertCircle, History, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CivicMemory() {
  const [memoryData, setMemoryData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemory = async () => {
       try {
          const { data } = await supabase.from('daily_insights').select('*').eq('insight_type', 'civic_memory').limit(1).single();
          setInsights(data ? JSON.parse(data.insight_text) : [
             "Chronic road deterioration noted at Linking Road, Santacruz. 14 repairs in 24 months suggest drainage-related base failure.",
             "Seasonal influx of water supply complaints in Ward K-East coincides with construction activity periods.",
             "Contractor 'X-Tech Civics' has a 40% higher recurrence rate on garbage collection routes compared to Ward averages."
          ]);
          
          setMemoryData([
             { location_zone: 'Linking Road', category: 'ROADS', occurence_count: 14, contractors: ['BuildInd', 'X-Tech'], last_occurrence: '2026-03-28' },
             { location_zone: 'K-East Ward', category: 'WATER', occurence_count: 8, contractors: ['PipesLine', 'M-City'], last_occurrence: '2026-04-01' },
             { location_zone: 'Dharavi Sector 2', category: 'GARBAGE', occurence_count: 22, contractors: ['WasteAway'], last_occurrence: '2026-04-04' }
          ]);
       } catch (error) {
          toast.error("Memory retrieval error");
       } finally {
          setLoading(false);
       }
    };
    fetchMemory();
  }, []);

  return (
    <div className="min-h-screen bg-bg p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex justify-between items-end">
           <div>
              <div className="flex items-center gap-2 mb-2">
                 <History size={16} className="text-navy opacity-40" />
                 <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-none">AI Pattern Recognition Engine</span>
              </div>
              <h1 className="text-4xl font-sora font-extrabold text-navy tracking-tight">Civic Memory</h1>
           </div>
           <div className="bg-navy rounded-xl px-5 py-3 text-white flex items-center gap-3 shadow-lg group hover:bg-saffron transition-colors duration-500 cursor-pointer">
              <Brain size={20} className="text-saffron group-hover:text-white" />
              <div className="flex flex-col">
                 <span className="text-[10px] uppercase font-bold opacity-60">Neural Engine Status</span>
                 <span className="text-xs font-bold leading-none">ANALYZING 24M HISTORY</span>
              </div>
           </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {insights.map((insight, i) => (
             <div key={i} className="bg-surface p-6 rounded-2xl border border-border shadow-soft relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Sparkles size={48} className="text-navy" />
                </div>
                <div className="flex items-center gap-2 mb-4">
                   <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-navy font-bold">{i+1}</div>
                   <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Intelligence Pulse</span>
                </div>
                <p className="text-sm font-medium text-navy leading-relaxed">{insight}</p>
             </div>
          ))}
        </section>

        <section className="space-y-6">
           <div className="flex items-center gap-3 px-2">
              <TrendingUp size={20} className="text-navy" />
              <h2 className="text-xl font-sora font-extrabold text-navy uppercase tracking-tighter">Repeat Issue Registry</h2>
           </div>
           <CivicMemoryTable data={memoryData} />
        </section>

        <div className="bg-amber-light border border-amber p-6 rounded-2xl text-amber-900 flex items-start gap-4">
           <AlertCircle size={24} className="shrink-0 mt-1" />
           <div>
              <h4 className="text-lg font-sora font-bold">Administrative Warning</h4>
              <p className="text-sm font-medium opacity-80 mt-1">
                 Civic Memory identification suggest structural failures at Linking Road. Recommend diversion of monsoon-preparedness budget to this zone. Pattern confidence score: 0.94.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
