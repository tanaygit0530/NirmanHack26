import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AATSCard from '../../components/admin/AATSCard';
import InsightsCard from '../../components/admin/InsightsCard';
import { Users, FileText, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    breached: 0,
    activeOfficers: 0
  });
  const [aatsData, setAatsData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Stats
        const { count: total } = await supabase.from('complaints').select('*', { count: 'exact', head: true });
        const { count: resolved } = await supabase.from('master_tickets').select('*', { count: 'exact', head: true }).eq('status', 'resolved');
        const { count: breached } = await supabase.from('master_tickets').select('*', { count: 'exact', head: true }).lt('sla_deadline', new Date().toISOString()).neq('status', 'resolved');
        const { count: officers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'officer');
        
        setStats({ total: total || 0, resolved: resolved || 0, breached: breached || 0, activeOfficers: officers || 0 });

        // 2. Fetch AATS - using mock data for demo if null
        const { data: aats } = await supabase.from('department_scores').select('*').order('computed_at', { ascending: false }).limit(4);
        setAatsData(aats || [
          { department: 'WATER', aats: 85, resolution_rate: 0.9, sla_compliance: 88, avg_citizen_rating: 4.2, trend: +5 },
          { department: 'ELECTRICITY', aats: 72, resolution_rate: 0.8, sla_compliance: 75, avg_citizen_rating: 3.8, trend: -2 },
          { department: 'ROADS', aats: 44, resolution_rate: 0.4, sla_compliance: 40, avg_citizen_rating: 2.5, trend: +12 },
          { department: 'GARBAGE', aats: 68, resolution_rate: 0.7, sla_compliance: 70, avg_citizen_rating: 3.5, trend: -4 }
        ]);

        // 3. Fetch Insights
        const { data: ins } = await supabase.from('daily_insights').select('*').order('generated_at', { ascending: false }).limit(1);
        setInsights(ins && ins[0] ? JSON.parse(ins[0].insight_text) : [
          "Infrastructure load in Ward A has increased by 40% due to repeat water leaks. Recommend preventative contractor audit.",
          "Garbage collection SLA compliance is below 50% in Dharavi. Dispatching contingency mobile units recommended.",
          "High sentiment distress detected around Linking Road roadworks. Immediate communication update for residents required."
        ]);

        // 4. Recent Logs
        const { data: logs } = await supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(5);
        setRecentLogs(logs || []);

      } catch (error) {
        console.error(error);
        toast.error("Administrative data stream interrupted");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleRefreshInsights = async () => {
    toast.success("AI is re-summarizing city data...");
    // Mock refresh logic locally for demo
    setTimeout(() => {
       setInsights(prev => [...prev].reverse());
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-bg">
      <aside className="w-64 bg-navy text-white flex flex-col flex-shrink-0 z-40 transition-all duration-300">
        <div className="p-4 py-8 text-2xl font-sora font-extrabold border-b border-navy-light flex flex-col gap-1">
          <span className="text-saffron">NagarVaani</span>
          <span className="text-xs uppercase tracking-widest text-white/50">Admin Interface</span>
        </div>
        <nav className="flex-1 p-4 py-6 space-y-2">
          <NavLink icon={<Activity size={18} />} label="Overview" active />
          <NavLink icon={<Users size={18} />} label="Officers" href="/admin/officers" />
          <NavLink icon={<FileText size={18} />} label="Analytics" href="/admin/analytics" />
          <NavLink icon={<AlertCircle size={18} />} label="Heatmap" href="/admin/heatmap" />
          <NavLink icon={<Clock size={18} />} label="Civic Memory" href="/admin/civic-memory" />
          <NavLink icon={<Shield size={18} />} label="Whistleblower" href="/admin/whistleblower" />
          <NavLink icon={<CheckCircle2 size={18} />} label="Audit Log" href="/admin/audit" />
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 bg-bg relative">
        <div className="flex justify-between items-center mb-10">
           <div>
              <h1 className="text-3xl font-sora font-extrabold text-navy leading-tight">City Intelligence Overview</h1>
              <p className="text-text-secondary mt-1 font-medium italic opacity-60">Real-time status of India's civic pulse.</p>
           </div>
           <div className="flex items-center gap-4">
              <div className="text-right">
                 <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-none">Last Audit Sync</p>
                 <p className="text-xs font-bold text-navy mt-1 tracking-tighter">Just now</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-navy shadow-sm">
                 <Activity size={20} />
              </div>
           </div>
        </div>
        
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <KpiCard label="Total Reports" value={stats.total} icon={<FileText size={24} />} color="text-navy" />
          <KpiCard label="Resolved" value={stats.resolved} icon={<CheckCircle2 size={24} />} color="text-emerald" />
          <KpiCard label="SLA Breaches" value={stats.breached} icon={<AlertCircle size={24} />} color="text-crimson" />
          <KpiCard label="Managed Force" value={stats.activeOfficers} icon={<Users size={24} />} color="text-navy" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
             <section>
                <div className="flex justify-between items-end mb-6 px-2">
                   <h2 className="text-xl font-sora font-extrabold text-navy uppercase tracking-tighter">Department Trust (AATS)</h2>
                   <span className="text-xs text-text-secondary font-bold uppercase tracking-widest opacity-40">Leaderboard Breakdown</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {aatsData.map((d, i) => (
                    <AATSCard key={i} department={d.department} score={d.aats} trend={d.trend || 0} rating={d.avg_citizen_rating || 3} compliance={d.sla_compliance || 70} />
                  ))}
                </div>
             </section>
             
             <section>
                <div className="flex justify-between items-end mb-6 px-2">
                   <h2 className="text-xl font-sora font-extrabold text-navy uppercase tracking-tighter">System Pulse (Recent Audit)</h2>
                   <Link to="/admin/audit" className="text-xs text-navy font-bold uppercase tracking-widest hover:text-saffron transition">View Full log →</Link>
                </div>
                <div className="bg-surface rounded-2xl p-6 border border-border shadow-soft space-y-4">
                   {recentLogs.map((log, i) => (
                     <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0 group">
                        <div className="flex items-center gap-4">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                             log.action.includes('BREACH') ? 'bg-crimson-light text-crimson' : 'bg-gray-100 text-text-secondary group-hover:bg-navy group-hover:text-white'
                           } transition`}>
                              {log.action.substring(0, 2)}
                           </div>
                           <div>
                              <p className="text-xs font-bold text-navy uppercase">{log.action.replace(/_/g, ' ')}</p>
                              <p className="text-[10px] text-text-secondary font-medium mt-0.5">By Agent #{log.actor_id?.substring(0, 5) || 'SYSTEM'}</p>
                           </div>
                        </div>
                        <span className="text-[10px] font-bold text-text-secondary opacity-40 tracking-tighter uppercase">{formatDate(log.created_at)}</span>
                     </div>
                   ))}
                </div>
             </section>
          </div>

          <div className="space-y-8">
             <InsightsCard insights={insights} onRefresh={handleRefreshInsights} generatedAt={new Date().toISOString()} />
             
             <div className="bg-navy p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                <Shield size={64} className="text-saffron opacity-20 absolute -right-2 top-2" />
                <h3 className="text-2xl font-sora font-extrabold leading-tight">Whistleblower Decryption</h3>
                <p className="text-sm text-white/70 mt-4 leading-relaxed font-medium">12 anonymous reports are pending administrative review. Use your master key to decrypt and assign for investigation.</p>
                <Link to="/admin/whistleblower" className="inline-flex items-center gap-2 mt-6 bg-saffron text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-opacity-90 transition">
                   Open Review Panel <ChevronRight size={16} />
                </Link>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavLink({ icon, label, active, href = "#" }) {
  return (
    <a href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
      active ? 'bg-navy-light text-saffron shadow-lg' : 'text-white/60 hover:bg-navy-light hover:text-white'
    }`}>
      {icon}
      <span>{label}</span>
    </a>
  );
}

function KpiCard({ label, value, icon, color }) {
  return (
    <div className="bg-surface p-6 rounded-2xl shadow-soft border border-border group hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-gray-50 ${color} shadow-sm group-hover:bg-navy group-hover:text-white transition`}>
          {icon}
        </div>
      </div>
      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-60">{label}</p>
      <h3 className={`text-4xl font-sora font-extrabold mt-1 tracking-tighter ${color}`}>{value}</h3>
    </div>
  );
}

function Shield({ size, className }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function ChevronRight({ size, className }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 12-12m0 0H9m12 0v12"/></svg>; }
