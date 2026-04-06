import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Activity, TrendingUp, Filter, Download, ArrowLeft, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const lineData = [
  { name: 'Mon', web: 400, social: 240, mock: 240 },
  { name: 'Tue', web: 300, social: 139, mock: 221 },
  { name: 'Wed', web: 200, social: 980, mock: 229 },
  { name: 'Thu', web: 278, social: 390, mock: 200 },
  { name: 'Fri', web: 189, social: 480, mock: 218 },
  { name: 'Sat', web: 239, social: 380, mock: 250 },
  { name: 'Sun', web: 349, social: 430, mock: 210 },
];

const COLORS = ['#0D1B40', '#0E8A5F', '#E8720C', '#C0392B'];

export default function Analytics() {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex h-screen bg-bg">
      <aside className="w-64 bg-navy text-white flex flex-col flex-shrink-0 z-40 transition-all duration-300">
        <div className="p-4 py-8 text-2xl font-sora font-extrabold border-b border-navy-light flex flex-col gap-1">
          <span className="text-saffron">NagarVaani</span>
          <span className="text-xs uppercase tracking-widest text-white/50">Admin Analytics</span>
        </div>
        <nav className="flex-1 p-4 py-6 space-y-2">
          <a href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-white/60 hover:bg-navy-light hover:text-white transition">Overview</a>
          <a href="/admin/heatmap" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-white/60 hover:bg-navy-light hover:text-white transition">Heatmap</a>
          <a href="/admin/analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm bg-navy-light text-saffron shadow-lg">Analytics</a>
          <a href="/admin/civic-memory" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-white/60 hover:bg-navy-light hover:text-white transition">Civic Memory</a>
        </nav>
        <div className="p-6 border-t border-navy-light">
          <button onClick={signOut} className="w-full bg-crimson hover:bg-opacity-90 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg transition">
            Exit Session
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <header className="flex justify-between items-center mb-12">
           <div>
              <div className="flex items-center gap-2 mb-2 text-navy opacity-40">
                 <Shield size={14} />
                 <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Statistical Insights</span>
              </div>
              <h1 className="text-4xl font-sora font-extrabold text-navy tracking-tight underline decoration-saffron decoration-4 underline-offset-8">Data Analytics</h1>
           </div>
           <button className="bg-navy text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-navy-light transition shadow-xl flex items-center gap-3">
              Export Archive <Download size={18} />
           </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
           <KpiMetric label="Mean Resolution Time" value="4h 32m" icon={<TrendingUp size={24} />} status="OPTIMAL" />
           <KpiMetric label="SLA Compliance Rate" value="92.4%" icon={<Activity size={24} />} status="HIGH" />
           <KpiMetric label="Daily Ingestion Peak" value="2.1k" icon={<Filter size={24} />} status="STABLE" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section className="bg-surface p-8 rounded-[40px] shadow-soft border border-border h-[500px] flex flex-col">
            <h3 className="text-xl font-sora font-extrabold text-navy mb-8 uppercase tracking-tighter">Complaints Over Time</h3>
            <div className="flex-1 min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={lineData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E6EF" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                   <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                   <Legend iconType="circle" />
                   <Line type="monotone" dataKey="web" stroke="#0D1B40" strokeWidth={4} dot={{ r: 6, fill: '#0D1B40', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                   <Line type="monotone" dataKey="social" stroke="#E8720C" strokeWidth={4} dot={{ r: 6, fill: '#E8720C', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                 </LineChart>
               </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-surface p-8 rounded-[40px] shadow-soft border border-border h-[500px] flex flex-col">
            <h3 className="text-xl font-sora font-extrabold text-navy mb-8 uppercase tracking-tighter">SLA Compliance Trend</h3>
            <div className="flex-1 min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={lineData}>
                   <defs>
                     <linearGradient id="colorSla" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#0E8A5F" stopOpacity={0.8}/>
                       <stop offset="95%" stopColor="#0E8A5F" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E6EF" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} />
                   <YAxis axisLine={false} tickLine={false} />
                   <RechartsTooltip />
                   <Area type="monotone" dataKey="web" stroke="#0E8A5F" fillOpacity={1} fill="url(#colorSla)" strokeWidth={3} />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function KpiMetric({ label, value, icon, status }) {
   return (
      <div className="bg-surface p-8 rounded-[40px] shadow-soft border border-border group hover:-translate-y-1 transition-all duration-300">
         <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-gray-50 rounded-2xl text-navy group-hover:bg-navy group-hover:text-white transition">
               {icon}
            </div>
            <span className="text-[10px] font-bold bg-emerald-light text-emerald px-2 py-0.5 rounded-full uppercase tracking-widest">{status}</span>
         </div>
         <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-1">{label}</p>
         <h3 className="text-3xl font-sora font-extrabold text-navy tracking-tighter">{value}</h3>
      </div>
   );
}
