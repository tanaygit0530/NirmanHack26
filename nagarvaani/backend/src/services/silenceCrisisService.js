const { supabase } = require('../lib/supabase');

exports.recomputeSilenceRatios = async function() {
  try {
    // 1. Get all wards
    const { data: wards, error: wardError } = await supabase.from('wards').select('*');
    if (wardError) throw wardError;

    for (const ward of wards) {
      // 2. Count complaints in this ward from the last 30 days
      const { count, error: countError } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('ward_id', ward.id)
        .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (countError) {
        console.error(`Count Error for ward ${ward.name}:`, countError);
        continue;
      }

      // 3. Update ward_stats
      const silenceRatio = ward.population / (count || 1);
      
      const { error: upsertError } = await supabase.from('ward_stats').upsert({
        ward_id: ward.id,
        complaint_count: count,
        population: ward.population,
      });

      if (upsertError) {
        console.error(`Upsert Error for ward ${ward.name}:`, upsertError);
      }
    }
  } catch (error) {
    console.error("Silence Crisis Service Error:", error);
  }
};
