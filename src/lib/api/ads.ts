import { env } from '../env';
const getAdsByPartnerId = async (partnerId: string) => {
  try {
    const { SUPABASE_URL_PROMO_STAGING, SUPABASE_ANON_KEY_STAGING } = env();

    if (!partnerId) {
      throw new Error('Partner ID is required');
    }

    const response = await fetch(
      `${SUPABASE_URL_PROMO_STAGING}/rest/v1/ads?partner_id=eq.${partnerId}`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY_STAGING,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching ads: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getAdsByPartnerId:', error);
    throw error;
  }
};
