import twilio from 'twilio';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userName, roomName } = req.body;

  if (!userName || !roomName) {
    return res.status(400).json({ error: 'Missing userName or roomName' });
  }

  try {
    const TWILIO_ACCOUNT_SID = process.env.VITE_TWILIO_ACCOUNT_SID;
    const TWILIO_API_KEY = process.env.VITE_TWILIO_API_KEY;
    const TWILIO_API_SECRET = process.env.VITE_TWILIO_API_SECRET;

    // Debug logging
    console.log('🔍 Checking credentials:');
    console.log('  ACCOUNT_SID exists:', !!TWILIO_ACCOUNT_SID);
    console.log('  API_KEY exists:', !!TWILIO_API_KEY);
    console.log('  API_SECRET exists:', !!TWILIO_API_SECRET);

    if (!TWILIO_ACCOUNT_SID) {
      return res.status(500).json({ error: 'VITE_TWILIO_ACCOUNT_SID not configured' });
    }
    if (!TWILIO_API_KEY) {
      return res.status(500).json({ error: 'VITE_TWILIO_API_KEY not configured' });
    }
    if (!TWILIO_API_SECRET) {
      return res.status(500).json({ error: 'VITE_TWILIO_API_SECRET not configured' });
    }

    console.log('✅ All credentials found. Generating token...');

    const token = new twilio.jwt.AccessToken(
      TWILIO_ACCOUNT_SID,
      TWILIO_API_KEY,
      TWILIO_API_SECRET
    );

    const videoGrant = new twilio.jwt.AccessToken.VideoGrant({
      room: roomName
    });

    token.addGrant(videoGrant);
    token.identity = userName;

    const jwt = token.toJwt();
    console.log('✅ Token generated successfully');

    return res.status(200).json({ token: jwt });
  } catch (error) {
    console.error('❌ Error generating token:', error.message);
    return res.status(500).json({ 
      error: 'Failed to generate token',
      details: error.message 
    });
  }
}