const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { authenticate } = require('../middleware/auth');
const auditService = require('../services/auditService');

// POST /api/tickets/:id/vote
router.post('/:id/vote', authenticate, async (req, res) => {
  const { id } = req.params;
  const { vote } = req.body; // 'confirm' or 'dismiss'
  
  try {
    const { data: profile } = await supabase.from('profiles').select('vote_weight').eq('id', req.user.profile_id).single();

    const { error: voteError } = await supabase.from('complaint_votes').upsert({
      master_ticket_id: id,
      user_id: req.user.profile_id,
      vote,
      weight: profile.vote_weight
    });

    if (voteError) throw voteError;

    // Increment cluster size or flag for spam if dismiss
    if (vote === 'confirm') {
      await supabase.from('master_tickets').update({
        affected_count: supabase.rpc('increment', { x: 1 })
      }).eq('id', id);
    }

    await auditService.log({ ticket_id: id, actor_id: req.user.profile_id, action: 'VOTE_CAST', new_value: { vote, weight: profile.vote_weight } });
    res.json({ message: 'Vote recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

module.exports = router;
