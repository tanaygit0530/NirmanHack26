const cron = require('node-cron');
const { supabase } = require('../lib/supabase');
const auditService = require('../services/auditService');
const { sendEmail } = require('../services/notificationService');

// Every hour: detect SLA breaches
cron.schedule('0 * * * *', async () => {
  const { data: overdue } = await supabase
    .from('master_tickets')
    .select('*, assigned_officer:profiles!assigned_officer_id(*)')
    .lt('sla_deadline', new Date().toISOString())
    .eq('status', 'in_progress');

  if (!overdue) return;

  for (const ticket of overdue) {
    // Escalate ticket (mock logic)
    await auditService.log({ ticket_id: ticket.id, action: 'SLA_BREACH_ESCALATION', old_value: 'in_progress', new_value: 'escalated' });
    
    if (ticket.assigned_officer) {
      // await sendEmail(ticket.assigned_officer.email, 'SLA Breach Alert', `Ticket ${ticket.id} has breached SLA.`);
    }
  }
});

// Mock social ingestion every 2 minutes
const { ingestMockSocial } = require('../routes/social/mockSocialIngestion');
cron.schedule('*/2 * * * *', async () => {
  await ingestMockSocial();
});

// AATS daily recompute at 7 AM
const { computeAatsForDepartment } = require('../services/aatsService');
cron.schedule('0 7 * * *', async () => {
  const categories = ['WATER','ELECTRICITY','ROADS','GARBAGE','PARKS','PUBLIC_SAFETY','OTHER'];
  for (const cat of categories) {
    await computeAatsForDepartment(cat);
  }
});

// Daily insights at 6 AM
const { fetchAndGenerateInsights } = require('../services/insightsService');
cron.schedule('0 6 * * *', async () => {
  await fetchAndGenerateInsights();
});

// Silence ratio at 8 AM
const { recomputeSilenceRatios } = require('../services/silenceCrisisService');
cron.schedule('0 8 * * *', async () => {
  await recomputeSilenceRatios();
});
