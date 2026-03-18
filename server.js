import express from 'express';
import twilio from 'twilio';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
app.use(express.json());
app.use(cors());

const TWILIO_ACCOUNT_SID = process.env.VITE_TWILIO_ACCOUNT_SID;
const TWILIO_API_KEY = process.env.VITE_TWILIO_API_KEY;
const TWILIO_API_SECRET = process.env.VITE_TWILIO_API_SECRET;

console.log('🔍 Twilio Credentials Check:');
console.log('  Account SID:', TWILIO_ACCOUNT_SID ? '✅ Loaded' : '❌ Missing');
console.log('  API Key:', TWILIO_API_KEY ? '✅ Loaded' : '❌ Missing');
console.log('  API Secret:', TWILIO_API_SECRET ? '✅ Loaded' : '❌ Missing');

// Generate Twilio access token
app.post('/api/twilio-token', (req, res) => {
  const { userName, roomName } = req.body;

  if (!userName || !roomName) {
    return res.status(400).json({ error: 'Missing userName or roomName' });
  }

  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_API_KEY || !TWILIO_API_SECRET) {
      return res.status(500).json({ error: 'Twilio credentials not configured' });
    }

    const token = new twilio.jwt.AccessToken(
      TWILIO_ACCOUNT_SID,
      TWILIO_API_KEY,
      TWILIO_API_SECRET
    );

    // Add video grant
    const videoGrant = new twilio.jwt.AccessToken.VideoGrant({
      room: roomName
    });

    token.addGrant(videoGrant);
    token.identity = userName;

    console.log('✅ Token generated for room:', roomName);
    res.json({ token: token.toJwt() });
  } catch (error) {
    console.error('❌ Error generating token:', error.message);
    res.status(500).json({ error: 'Failed to generate token: ' + error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', credentials: {
    account: !!TWILIO_ACCOUNT_SID,
    apiKey: !!TWILIO_API_KEY,
    apiSecret: !!TWILIO_API_SECRET
  }});
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Twilio server running on port ${PORT}`);
});