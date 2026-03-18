import { connect } from 'twilio-video';

/**
 * Get access token from Vercel backend
 */
/**
 * Get access token from Vercel backend
 */
export const getAccessToken = async (userName, roomName) => {
  try {
    // Get your actual Vercel domain
    const vercelDomain = window.location.hostname; // This gets your deployed domain
    const apiUrl = `https://${vercelDomain}/api/twilio-token`;

    console.log('🔗 Fetching token from:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userName, roomName })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get token');
    }

    const data = await response.json();
    console.log('✅ Got token successfully');
    return data.token;
  } catch (error) {
    console.error('❌ Error getting access token:', error);
    throw error;
  }
};

/**
 * Join Twilio video room
 */
export const joinTwilioRoom = async (token, roomName, userName) => {
  try {
    console.log('📹 Joining Twilio room:', roomName);
    
    const room = await connect(token, {
      name: roomName,
      audio: { name: 'microphone' },
      video: { name: 'camera', width: 640 },
      maxAudioBitrate: 16000,
      maxVideoBitrate: 2500000,
      dominantSpeakerPriority: 'high',
      networkQuality: {
        local: 1,
        remote: 1
      }
    });

    console.log('✅ Joined room:', roomName);
    console.log('📊 Participants:', room.participants.size);
    
    return room;
  } catch (error) {
    console.error('❌ Error joining room:', error);
    throw error;
  }
};

/**
 * Leave Twilio room
 */
export const leaveTwilioRoom = (room) => {
  if (room) {
    room.localParticipant.tracks.forEach(trackSubscription => {
      trackSubscription.track.stop();
    });

    room.disconnect();
    console.log('👋 Left Twilio room');
  }
};

/**
 * Generate room name from appointment
 */
export const generateTwilioRoomName = (appointmentId) => {
  return `retisight-apt-${appointmentId}`;
};