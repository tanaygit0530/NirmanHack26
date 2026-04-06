const { supabase } = require('../lib/supabase');

exports.authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  // Get user profile role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, ward_id, id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) return res.status(401).json({ error: 'User profile not found' });

  req.user = { ...user, role: profile.role, ward_id: profile.ward_id, profile_id: profile.id };
  next();
};
