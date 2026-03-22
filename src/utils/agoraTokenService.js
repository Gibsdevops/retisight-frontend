const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Get Agora token from Supabase Edge Function
 */
export const generateAgoraToken = async (channelName, userId) => {
  try {
    const functionUrl = `${SUPABASE_URL}/functions/v1/agora-token`;

    console.log('🔄 Requesting token from:', functionUrl);

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channelName,
        userId: userId || Math.floor(Math.random() * 100000).toString(),
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Token server error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Token generated successfully');
    return data.token;
  } catch (error) {
    console.error('❌ Failed to generate token:', error);
    throw error;
  }
};