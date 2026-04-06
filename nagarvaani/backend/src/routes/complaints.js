const express = require('express');
const router = express.Router();
const multer = require('multer');
const { supabase } = require('../lib/supabase');
const { geminiEmbed, geminiUrgencyScore, geminiSentimentScore } = require('../lib/gemini');
const { filterSpam } = require('../services/spamFilter');
const { categorizeComplaint } = require('../services/categorizer');
const { deduplicateComplaint } = require('../services/deduplicator');
const { computePriorityScore } = require('../services/urgencyScorer');
const { computeSlaDeadline } = require('../services/slaService');
const { encryptComplaint, generateToken } = require('../services/whistleblowerService');
const { sendEmail, sendPushNotification } = require('../services/notificationService');
const auditService = require('../services/auditService');
const { authenticate } = require('../middleware/auth');
const { complaintLimiter } = require('../middleware/rateLimiter');

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/complaints
router.post('/', upload.single('photo'), complaintLimiter, async (req, res) => {
  const { raw_text, lat, lng, is_anonymous, location_text, user_id } = req.body;
  const ip_address = req.ip;

  try {
    // 1. VALIDATE INPUT
    if (!raw_text || raw_text.split(' ').length < 10) {
      return res.status(400).json({ error: 'Text must be at least 10 words' });
    }

    // 2. SPAM FILTER
    const spamResult = await filterSpam(raw_text);
    if (spamResult.status === 'rejected') {
      await auditService.log({ action: 'SPAM_REJECTED', ip_address, new_value: { text: raw_text } });
      return res.status(403).json({ error: 'Spam detected' });
    }

    // 3. CATEGORIZE & URGENCY
    const catResult = await categorizeComplaint(raw_text);
    const urgencyResult = await geminiUrgencyScore(raw_text);
    const sentimentResult = await geminiSentimentScore(raw_text);
    const embedding = await geminiEmbed(raw_text);

    // 4. DEDUPLICATE
    // 4. DEDUPLICATE with sanitization
    const safeLat = (lat && !isNaN(parseFloat(lat))) ? parseFloat(lat) : null;
    const safeLng = (lng && !isNaN(parseFloat(lng))) ? parseFloat(lng) : null;

    const newComplaintData = { lat: safeLat, lng: safeLng };
    const dedupResult = await deduplicateComplaint(newComplaintData, embedding);

    let masterTicketId = dedupResult.master_ticket_id;

    if (!dedupResult.merged) {
      // 5. COMPUTE PRIORITY & SLA
      const priority = await computePriorityScore({
        keywordScore: urgencyResult.keyword_score,
        sentimentScore: sentimentResult.sentiment_score,
        clusterSize: 1,
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      });
      const slaDeadline = computeSlaDeadline(new Date(), catResult.category);

      // Create new Master Ticket
      const { data: ticket, error: ticketError } = await supabase.from('master_tickets').insert({
        category: catResult.category,
        title: catResult.summary,
        description: raw_text,
        lat: safeLat,
        lng: safeLng,
        severity: catResult.severity,
        priority_score: priority,
        status: 'filed',
        sla_deadline: slaDeadline.toISOString(),
        embedding: embedding,
        source: 'web'
      }).select().single();

      if (ticketError) throw ticketError;
      masterTicketId = ticket.id;
    }

    // 6. WHISTLEBLOWER
    let finalRawText = raw_text;
    let finalEncryptedText = null;
    let finalAnonymousToken = null;
    let finalUserId = user_id || null;

    if (is_anonymous === 'true' || is_anonymous === true) {
      const encrypted = encryptComplaint(raw_text);
      if (encrypted) {
        finalEncryptedText = encrypted.encrypted;
        finalAnonymousToken = generateToken();
        finalRawText = "[ANONYMOUS]"; 
        finalUserId = null;
      } else {
        // Fallback: If encryption fails (e.g. bad key), don't allow anonymous file
        return res.status(500).json({ error: 'Encryption authority failure. Check platform secrets.' });
      }
    }

    // (Log for debugging as requested)
    console.log("Ingestion Payload:", { raw_text: raw_text?.substring(0, 50), safeLat, safeLng, user_id });

    // Create Complaint Entry
    const { data: complaint, error: compError } = await supabase.from('complaints').insert({
      master_ticket_id: masterTicketId,
      raw_text: finalRawText,
      encrypted_text: finalEncryptedText,
      anonymous_token: finalAnonymousToken,
      user_id: finalUserId,
      is_anonymous: is_anonymous === 'true' || is_anonymous === true,
      lat: safeLat,
      lng: safeLng,
      source: 'web',
      spam_status: spamResult.status
    }).select().single();

    if (compError) {
      console.error("Supabase Complaint Insert Error:", compError);
      throw compError;
    }

    // 7. AUDIT & NOTIFY
    await auditService.log({ ticket_id: masterTicketId, action: 'COMPLAINT_FILED', ip_address });
    
    return res.status(201).json({
      message: 'Complaint filed successfully',
      ticket_id: masterTicketId,
      anonymous_token: finalAnonymousToken
    });

  } catch (error) {
    console.error("Complaint Ingestion Fatal Error:", error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

module.exports = router;
