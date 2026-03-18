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

    if (!TWILIO_ACCOUNT_SID || !TWILIO_API_KEY || !TWILIO_API_SECRET) {
      return res.status(500).json({ error: 'Twilio credentials not configured' });
    }

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

    return res.status(200).json({ token: token.toJwt() });
  } catch (error) {
    console.error('Error generating token:', error);
    return res.status(500).json({ error: 'Failed to generate token' });
  }
}