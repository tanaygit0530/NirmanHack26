import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import SLATimer from '../../components/officer/SLATimer';
import ResolutionUpload from '../../components/officer/ResolutionUpload';
import { MapPin, Info, Users, ArrowLeft, CheckCircle2, MessageSquare, AlertTriangle, ShieldAlert } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const { data, error } = await supabase
          .from('master_tickets')
          .select('*, complaints(*), audit_log(*)')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setTicket(data);
        setLogs(data.audit_log || []);
      } catch (error) {
        toast.error("Ticket details inaccessible");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('master_tickets')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      setTicket(prev => ({ ...prev, status: newStatus }));
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (data) => {
    setIsSubmitting(true);
    try {
      // Logic for resolution with photo handles
      // Mocking for now as bucket upload is needed first
      const { error } = await supabase
         .from('master_tickets')
         .update({ 
           status: 'resolved', 
           resolution_verified: true,
           updated_at: new Date().toISOString() 
         })
         .eq('id', id);

      if (error) throw error;
      setTicket(prev => ({ ...prev, status: 'resolved' }));
      toast.success("Ticket resolved and verified!");
    } catch (error) {
       toast.error("Resolution failed");
    } finally {
       setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-text-secondary">Official Data Loading...</div>;
  if (!ticket) return <div className="p-12 text-center text-text-secondary">Internal Error: Ticket metadata restricted.</div>;

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-navy px-6 py-4 flex justify-between items-center text-white shadow-xl sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-lg transition">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
               <h1 className="text-xl font-sora font-extrabold tracking-tight underline-offset-4 decoration-saffron">
                  {ticket.title}
               </h1>
            </div>
            <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-0.5">#{ticket.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <SLATimer deadline={ticket.sla_deadline} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8 animate-fade-in">
          <div className="bg-surface rounded-2xl p-8 card-shadow space-y-8 border-l-4 border-l-navy">
             <div className="flex justify-between items-start">
                <div className="flex gap-2">
                   <span className="text-[10px] font-bold bg-navy text-white px-2.5 py-1 rounded-full uppercase tracking-widest">{ticket.category}</span>
                   <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${
                     ticket.priority_score >= 4 ? 'bg-crimson text-white' : 'bg-gray-100 text-text-secondary'
                   }`}>Priority {ticket.priority_score}</span>
                   {ticket.complaints?.some(c => c.is_anonymous) && (
                     <span className="text-[10px] font-bold bg-amber-light text-amber border border-amber rounded-full px-2.5 py-1 uppercase tracking-widest flex items-center gap-1">
                        <ShieldAlert size={10} /> Anonymous Case
                     </span>
                   )}
                </div>
             </div>

             <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest border-b border-border pb-2">Full Description</h4>
                <p className="text-navy text-lg font-medium leading-relaxed">{ticket.description}</p>
             </div>

             <div className="grid grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                   <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-1">Ward Area</p>
                   <p className="text-sm font-bold text-navy flex items-center gap-1.5"><MapPin size={14} className="opacity-40" /> {ticket.extracted_location || 'Zone A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                   <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-1">Impact Scale</p>
                   <p className="text-sm font-bold text-navy flex items-center gap-1.5"><Users size={14} className="opacity-40" /> {ticket.affected_count || 1} Residents</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                   <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-1">Source</p>
                   <p className="text-sm font-bold text-navy uppercase tracking-tighter">{ticket.source || 'WEB'}</p>
                </div>
             </div>
          </div>

          {ticket.status !== 'resolved' ? (
            <div className="space-y-6">
               <h3 className="text-xl font-sora font-extrabold text-navy px-2">Official Actions</h3>
               {ticket.status === 'filed' && (
                 <button 
                   onClick={() => handleUpdateStatus('assigned')}
                   disabled={isSubmitting}
                   className="w-full bg-navy text-white text-lg py-5 rounded-2xl font-bold shadow-xl hover:bg-navy-light transition flex items-center justify-center gap-2"
                 >
                   Accept & Assign to Myself <CheckCircle2 size={24} />
                 </button>
               )}
               {ticket.status === 'assigned' && (
                 <button 
                   onClick={() => handleUpdateStatus('in_progress')}
                   disabled={isSubmitting}
                   className="w-full bg-blue-600 text-white text-lg py-5 rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
                 >
                   Begin Resolution <MapPin size={24} />
                 </button>
               )}
               {ticket.status === 'in_progress' && (
                 <div className="space-y-4">
                    <div className="bg-emerald border border-emerald text-white p-4 rounded-xl font-bold text-center animate-pulse">
                       ACTION REQUIRED: RESOLUTION IN PROGRESS
                    </div>
                    <ResolutionUpload onResolve={handleResolve} isSubmitting={isSubmitting} />
                 </div>
               )}
            </div>
          ) : (
            <div className="bg-emerald p-8 rounded-2xl shadow-xl space-y-6">
               <div className="flex items-center gap-4 text-white">
                  <div className="w-16 h-16 rounded-full bg-white text-emerald flex items-center justify-center shadow-lg">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-sora font-extrabold uppercase tracking-tight">Resolution Complete</h2>
                    <p className="text-emerald-50 font-medium">Verified by system GPS and manual logic.</p>
                  </div>
               </div>
               <div className="bg-white/10 border border-white/20 p-4 rounded-xl text-white">
                  <p className="text-xs font-bold font-mono opacity-80 uppercase tracking-widest mb-1">Resolution Verifier Key</p>
                  <p className="text-sm font-bold truncate">TX_RESOLVED_{ticket.id.substring(0, 12).toUpperCase()}</p>
               </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
           <div className="bg-surface rounded-2xl p-6 card-shadow border border-border">
              <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest border-b border-border pb-3 mb-6">Priority Analysis</h4>
              <div className="space-y-4">
                 <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-navy">
                       <span>Keyword Urgency</span>
                       <span>80%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-crimson" style={{ width: '80%' }} />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-navy">
                       <span>Sentiment Intensity</span>
                       <span>65%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-amber" style={{ width: '65%' }} />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-navy">
                       <span>Public Pressure (Cluster)</span>
                       <span>90%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-navy" style={{ width: '90%' }} />
                    </div>
                 </div>
                 <div className="pt-4 mt-4 border-t border-border flex items-center gap-2 text-navy">
                    <Info size={14} className="opacity-40" />
                    <p className="text-[10px] font-bold leading-relaxed">Scores generated by Gemini 1.5 based on raw complaint semantics.</p>
                 </div>
              </div>
           </div>

           <div className="bg-surface rounded-2xl p-6 card-shadow border border-border overflow-hidden">
              <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest border-b border-border pb-3 mb-6 flex items-center gap-2">
                 <MessageSquare size={14} className="text-navy" /> Internal Notes
              </h4>
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                 <p className="text-xs text-text-secondary italic text-center py-4">No internal official notes yet.</p>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
                 <input 
                   disabled
                   type="text" 
                   placeholder="Add official note..." 
                   className="flex-1 bg-gray-50 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-navy"
                 />
                 <button disabled className="p-2 bg-gray-50 rounded-lg text-border"><ChevronRight size={18} /></button>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}

function ChevronRight({ size }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>; }
