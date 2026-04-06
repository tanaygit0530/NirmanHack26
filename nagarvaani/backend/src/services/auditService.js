const { supabase } = require('../lib/supabase');

exports.log = async function({ ticket_id, actor_id, action, old_value, new_value, ip_address }) {
  try {
    const payload = {
      action,
      ip_address,
      created_at: new Date().toISOString()
    };
    if (ticket_id) payload.ticket_id = ticket_id;
    if (actor_id) payload.actor_id = actor_id;
    if (old_value) payload.old_value = old_value;
    if (new_value) payload.new_value = new_value;

    const { error } = await supabase.from('audit_log').insert(payload);
    if (error) console.error("Audit Log Error:", error);
  } catch (err) {
    console.error("Audit Log Exception:", err);
  }
};
