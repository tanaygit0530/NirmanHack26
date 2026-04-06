const express = require('express');
const router = express.Router();
const TelegramBot = require('node-telegram-bot-api');
const { supabase } = require('../../lib/supabase');
const { geminiEmbed, geminiCategorize } = require('../../lib/gemini');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = token ? new TelegramBot(token) : null;

router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message || !message.text) return res.sendStatus(200);

  const chatId = message.chat.id;
  const text = message.text;
  const userId = message.from.id;

  try {
    // Process text as complaint
    const catResult = await geminiCategorize(text);
    const embedding = await geminiEmbed(text);

    // Get location from message if available
    let lat = 19.0760, lng = 72.8777; // Mumbai mock
    if (message.location) {
        lat = message.location.latitude;
        lng = message.location.longitude;
    }

    // Pipeline Logic (Simplified for brevity)
    // Create Master Ticket (or merge)
    const { data: ticket } = await supabase.from('master_tickets').insert({
        category: catResult.category,
        title: catResult.summary,
        description: text,
        lat, lng,
        status: 'filed',
        source: 'telegram',
        embedding
    }).select().single();

    const { error: compError } = await supabase.from('complaints').insert({
        master_ticket_id: ticket.id,
        raw_text: text,
        lat, lng,
        source: 'telegram',
        scraped_at: new Date().toISOString()
    });

    if (bot) bot.sendMessage(chatId, `Thank you. Complaint registered. Tracker ID: ${ticket.id}`);

    res.sendStatus(200);

  } catch (err) {
    console.error("Telegram Ingestion Error:", err);
    res.sendStatus(200);
  }
});

module.exports = router;
