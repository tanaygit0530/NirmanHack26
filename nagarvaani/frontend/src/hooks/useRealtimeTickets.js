import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useRealtimeTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchTickets = async () => {
      const { data, error } = await supabase
        .from('master_tickets')
        .select('*')
        .order('priority_score', { ascending: false });
      
      if (!error) setTickets(data);
      setLoading(false);
    };

    fetchTickets();

    // Real-time subscription
    const channel = supabase
      .channel('ticket-updates')
      .on('postgres_changes', {
        event: '*', // Listen to INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'master_tickets'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTickets(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setTickets(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
        } else if (payload.eventType === 'DELETE') {
          setTickets(prev => prev.filter(t => t.id === payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { tickets, loading };
}
