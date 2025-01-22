import supabaseClient from '../supabase-client';

export async function getMemberships(userId: string) {
  const data = await supabaseClient
    .from('Membership')
    .select('property_id, role, Property(*)')
    .eq('user_id', userId)
    .eq('status', 'active');
  console.log(data);
  return data.data;
}
