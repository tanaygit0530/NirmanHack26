import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useRealtimeTickets } from '../../hooks/useRealtimeTickets';
import ComplaintCard from '../../components/complaint/ComplaintCard';
import { LogOut, Activity, Users, Shield, Clock, Search, Filter, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export default function OfficerDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { tickets, loading } = useRealtimeTickets();
  const [filterMode, setFilterMode] = useState('ALL');

  // Logic: Officer sees tickets assigned to their ward OR already assigned to them
  const relevantTickets = tickets.filter(t => {
     if (filterMode === 'MY_ASSIGNED') return t.assigned_officer_id === profile?.id;
     if (filterMode === 'PENDING') return t.status === 'filed';
     return true;
  });

  const stats = {
     assigned: tickets.filter(t => t.assigned_officer_id === profile?.id).length,
     pending: tickets.filter(t => t.status === 'filed').length,
     resolved: tickets.filter(t => t.status === 'resolved' && t.assigned_officer_id === profile?.id).length
  };

  return (
    <div className="min-h-screen bg-bg flex font-sans antialiased text-navy">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-navy text-white flex flex-col items-center lg:items-start transition-all duration-300 z-40 fixed lg:static h-screen">
        <div className="p-4 py-10 lg:px-8 text-2xl font-sora font-extrabold flex flex-col gap-1 border-b border-navy-light w-full">
           <span className="text-saffron">NagarVaani</span>
           <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold hidden lg:block">Field Officer Console</span>
        </div>
        <nav className="flex-1 p-4 w-full py-8 space-y-4">
           <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-navy-light text-saffron shadow-lg cursor-pointer">
              <Activity size={24} />
              <span className="font-bold text-sm hidden lg:block uppercase tracking-widest">Active Queue</span>
           </div>
           <div className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/50 hover:bg-navy-light hover:text-white transition cursor-not-allowed">
              <CheckCircle2 size={24} />
              <span className="font-bold text-sm hidden lg:block uppercase tracking-widest">Resolutions</span>
           </div>
           <div className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/50 hover:bg-navy-light hover:text-white transition cursor-not-allowed">
              <Shield size={24} />
              <span className="font-bold text-sm hidden lg:block uppercase tracking-widest">Legal & Audit</span>
           </div>
        </nav>
        <div className="p-6 border-t border-navy-light w-full">
           <button onClick={signOut} className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/50 hover:bg-crimson hover:text-white transition w-full">
              <LogOut size={24} />
              <span className="font-bold text-sm hidden lg:block uppercase tracking-widest">Exit console</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-0 ml-20 p-8 pt-12 overflow-y-auto overflow-x-hidden relative h-screen">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12">
           <div>
              <h1 className="text-4xl font-sora font-extrabold tracking-tight underline-offset-8 decoration-saffron">Hello, Officer {profile?.full_name?.split(' ')[0]}</h1>
              <p className="text-text-secondary mt-2 font-medium opacity-60">Field operations station active. {stats.pending} unassigned reports in Ward {profile?.ward_id}.</p>
           </div>
           <div className="flex gap-4 items-center bg-surface p-2 rounded-2xl border border-border shadow-soft">
              <NavStat label="My Load" value={stats.assigned} icon={<Users size={16} />} color="navy" />
              <div className="w-px h-10 bg-border mx-2" />
              <NavStat label="Pending" value={stats.pending} icon={<Clock size={16} />} color="amber" />
              <div className="w-px h-10 bg-border mx-2" />
              <NavStat label="Success" value={stats.resolved} icon={<CheckCircle2 size={16} />} color="emerald" />
           </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
           <div className="flex-1 relative group w-full lg:w-fit">
              <Search size={18} className="absolute left-4 top-4 text-text-secondary group-focus-within:text-navy transition" />
              <input 
                type="text" 
                placeholder="Search ticket ID or keyword..." 
                className="w-full pl-12 pr-4 py-4 border border-border rounded-2xl outline-none focus:border-navy focus:ring-4 focus:ring-navy/5 text-sm font-bold transition"
              />
           </div>
           <div className="flex items-center p-1 bg-surface border border-border rounded-2xl w-full lg:w-fit whitespace-nowrap overflow-x-auto scrollbar-hide">
              <FilterTab label="All Tasks" active={filterMode === 'ALL'} onClick={() => setFilterMode('ALL')} />
              <FilterTab label="Priority Queue" active={filterMode === 'PENDING'} onClick={() => setFilterMode('PENDING')} />
              <FilterTab label="Assigned to Me" active={filterMode === 'MY_ASSIGNED'} onClick={() => setFilterMode('MY_ASSIGNED')} />
           </div>
        </div>

        {/* Tickets Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
             <Activity className="animate-spin text-navy opacity-20" size={64} />
             <p className="text-xl font-sora font-extrabold text-navy opacity-20 uppercase tracking-widest">NagarVaani Syncing...</p>
          </div>
        ) : relevantTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
             {relevantTickets.map(ticket => (
               <div key={ticket.id} className="relative">
                  {ticket.priority_score >= 4 && (
                    <div className="absolute -top-2 -right-2 z-10 p-2 bg-crimson text-white rounded-full shadow-lg ring-4 ring-white animate-pulse">
                       <AlertTriangle size={16} />
                    </div>
                  )}
                  <ComplaintCard 
                    ticket={ticket} 
                    onClick={(id) => navigate(`/officer/tickets/${id}`)}
                  />
               </div>
             ))}
          </div>
        ) : (
          <div className="py-40 text-center flex flex-col items-center gap-6 group hover:scale-105 transition-transform duration-500">
             <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center text-navy opacity-10 group-hover:opacity-40 transition duration-500">
                <CheckCircle2 size={48} />
             </div>
             <div>
                <p className="text-2xl font-sora font-extrabold text-navy opacity-40 uppercase tracking-tighter">Operational Clearance</p>
                <p className="text-sm text-text-secondary mt-1 font-medium italic">No active {filterMode.toLowerCase().replace('_', ' ')} reports.</p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

function NavStat({ label, value, icon, color }) {
  const colors = {
     navy: 'text-navy',
     amber: 'text-amber',
     emerald: 'text-emerald',
     crimson: 'text-crimson'
  };
  return (
    <div className="px-4 flex flex-col items-center lg:items-start group">
       <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition ${colors[color]}`}>
          {icon} {label}
       </div>
       <span className={`text-2xl font-sora font-extrabold leading-none mt-1 ${colors[color]}`}>{value}</span>
    </div>
  );
}

function FilterTab({ label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all duration-300 ${
        active ? 'bg-navy text-white shadow-lg' : 'text-text-secondary hover:bg-gray-100 hover:text-navy'
      }`}
    >
      {label}
    </button>
  );
}
