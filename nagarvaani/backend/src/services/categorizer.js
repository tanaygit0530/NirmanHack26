const { geminiCategorize } = require('../lib/gemini');

exports.categorizeComplaint = async function(text) {
  try {
    const result = await geminiCategorize(text);
    return result;
  } catch (error) {
    console.error("Categorization API failed:", error);
    return {
      category: 'OTHER',
      severity: 'MEDIUM',
      extracted_location: 'Unknown',
      summary: text.substring(0, 100) + '...'
    };
  }
};
