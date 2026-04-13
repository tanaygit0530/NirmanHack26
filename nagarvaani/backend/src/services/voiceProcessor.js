const { geminiCategorize } = require('../lib/gemini');

/**
 * Intelligent Voice Processor
 * Extracts structured data from a raw voice transcript
 */
const extractComplaintFromVoice = async (transcript) => {
  if (!transcript) return null;

  try {
    // We can reuse geminiCategorize as it already extracts category, severity, and location
    const extraction = await geminiCategorize(transcript);

    return {
      category: extraction.category || 'OTHER',
      description: transcript,
      location_text: extraction.extended_location || extraction.extracted_location || '',
      severity: extraction.severity || 'MEDIUM',
      summary: extraction.summary || ''
    };
  } catch (error) {
    console.error("Voice extraction failed:", error);
    return {
      category: 'OTHER',
      description: transcript,
      location_text: '',
      severity: 'MEDIUM'
    };
  }
};

module.exports = { extractComplaintFromVoice };
