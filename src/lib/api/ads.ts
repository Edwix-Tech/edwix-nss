import { env } from '../env';
import { useQuery } from '@tanstack/react-query';
export interface Ad {
  created_at: string;
  partner_id: string;
  image_url: string;
  placement: 'SIDEBAR' | 'DASHBOARD';
  id: string;
  href: string;
  created_by: string | null;
}
export async function GetAdsByPartnerId(partnerId: string | undefined | null): Promise<Ad[]> {
  try {
    console.log(
      'Fetching ads for partner:',
      partnerId,
      env().SUPABASE_URL_PROMO_STAGING,
      env().SUPABASE_ANON_KEY_STAGING
    );
    const response = await fetch(
      `${env().SUPABASE_URL_PROMO_STAGING}/rest/v1/ads?partner_id=eq.${partnerId}`,
      {
        headers: {
          apikey: env().SUPABASE_ANON_KEY_STAGING,
          Authorization: `Bearer ${env().SUPABASE_ANON_KEY_STAGING}`,
          'Content-Type': 'application/json',
        },
        method: 'GET',
      }
    );

    const data = await response.json();
    console.log('Ads:', data);
    return data;
  } catch (error) {
    console.error('Error fetching ads:', error);
    throw error;
  }
}
export function useGetAdsByPartnerId(partnerId: string | undefined | null) {
  return useQuery({
    queryKey: ['ads', partnerId],
    queryFn: () => GetAdsByPartnerId(partnerId),
  });
}
