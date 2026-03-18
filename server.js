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

// Generate Twilio access token
app.post('/api/twilio-token', (req, res) => {
  const { userName, roomName } = req.body;

  if (!userName || !roomName) {
    return res.status(400).json({ error: 'Missing userName or roomName' });
  }

  try {
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

    res.json({ token: token.toJwt() });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

app.listen(3001, () => {
  console.log('Twilio server running on http://localhost:3001');
});