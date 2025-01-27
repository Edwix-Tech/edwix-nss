import supabaseClient from '@/lib/supabase-client';
import { useQuery } from '@tanstack/react-query';

export function useCurrentUser() {
  const queryFn = async () => {
    const { data } = await supabaseClient.auth.getUser();
    if (!data.user?.id) throw new Error('User not found');

    const { data: userData, error } = await supabaseClient
      .from('User')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (error) throw error;
    if (!userData) throw new Error('User data not found');

    return {
      ...data.user,
      profile: {
        firstname: userData.firstname,
        lastname: userData.lastname,
      },
    };
  };

  return useQuery({
    queryKey: ['currentUser'],
    queryFn,
  });
}
