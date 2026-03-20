import AgoraRTC from 'agora-rtc-sdk-ng';

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const AGORA_TOKEN = import.meta.env.VITE_AGORA_TOKEN; // Add this line

let agoraClient = null;
let localAudioTrack = null;
let localVideoTrack = null;

/**
 * Initialize Agora client
 */
export const initializeAgoraClient = () => {
  if (!agoraClient) {
    agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    console.log('🔧 Agora client initialized');
  }
  return agoraClient;
};

/**
 * Create local audio and video tracks
 */
export const createLocalTracks = async () => {
  try {
    console.log('🎤 Creating local audio and video tracks...');
    
    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    
    console.log('✅ Local tracks created successfully');
    return { audioTrack: localAudioTrack, videoTrack: localVideoTrack };
  } catch (error) {
    console.error('❌ Error creating local tracks:', error);
    throw error;
  }
};

/**
 * Join Agora channel
 */
export const joinAgoraChannel = async (channelName, userName) => {
  try {
    if (!APP_ID) {
      throw new Error('Agora App ID not configured. Set VITE_AGORA_APP_ID in .env.local');
    }

    const client = initializeAgoraClient();

    console.log('📞 Joining Agora channel:', channelName);
    console.log('👤 User:', userName);
    console.log('🔐 Using token:', AGORA_TOKEN ? 'YES' : 'NO');

    // Use token if available, otherwise null (for testing)
    await client.join(APP_ID, channelName, AGORA_TOKEN || null, userName);

    console.log('✅ Successfully joined channel:', channelName);
    return client;
  } catch (error) {
    console.error('❌ Error joining Agora channel:', error);
    throw error;
  }
};

/**
 * Publish local tracks to channel
 */
export const publishLocalTracks = async (audioTrack, videoTrack) => {
  try {
    if (!agoraClient) {
      throw new Error('Agora client not initialized');
    }

    console.log('📤 Publishing local tracks...');
    await agoraClient.publish([audioTrack, videoTrack]);
    console.log('✅ Tracks published successfully');
  } catch (error) {
    console.error('❌ Error publishing tracks:', error);
    throw error;
  }
};

/**
 * Subscribe to remote user
 */
export const subscribeToRemoteUser = async (user, mediaType) => {
  try {
    if (!agoraClient) {
      throw new Error('Agora client not initialized');
    }

    console.log('📥 Subscribing to remote user:', user.uid, 'mediaType:', mediaType);
    await agoraClient.subscribe(user, mediaType);
    console.log('✅ Subscribed to user:', user.uid);

    return user;
  } catch (error) {
    console.error('❌ Error subscribing to remote user:', error);
    throw error;
  }
};

/**
 * Toggle microphone
 */
export const toggleMicrophone = async (enabled) => {
  try {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(enabled);
      console.log('🎤 Microphone:', enabled ? 'ON' : 'OFF');
      return true;
    }
  } catch (error) {
    console.error('❌ Error toggling microphone:', error);
    return false;
  }
};

/**
 * Toggle camera
 */
export const toggleCamera = async (enabled) => {
  try {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(enabled);
      console.log('📹 Camera:', enabled ? 'ON' : 'OFF');
      return true;
    }
  } catch (error) {
    console.error('❌ Error toggling camera:', error);
    return false;
  }
};

/**
 * Play remote video
 */
export const playRemoteVideo = (user, containerRef) => {
  try {
    if (user.videoTrack && containerRef) {
      user.videoTrack.play(containerRef);
      console.log('📹 Playing remote video for user:', user.uid);
    }
  } catch (error) {
    console.error('❌ Error playing remote video:', error);
  }
};

/**
 * Play remote audio
 */
export const playRemoteAudio = (user) => {
  try {
    if (user.audioTrack) {
      user.audioTrack.play();
      console.log('🔊 Playing remote audio for user:', user.uid);
    }
  } catch (error) {
    console.error('❌ Error playing remote audio:', error);
  }
};

/**
 * Leave Agora channel
 */
export const leaveAgoraChannel = async () => {
  try {
    console.log('👋 Leaving Agora channel...');

    // Close tracks
    if (localAudioTrack) {
      localAudioTrack.close();
      localAudioTrack = null;
    }
    if (localVideoTrack) {
      localVideoTrack.close();
      localVideoTrack = null;
    }

    // Leave channel
    if (agoraClient) {
      await agoraClient.leave();
      console.log('Left channel successfully');
    }
  } catch (error) {
    console.error('Error leaving channel:', error);
    throw error;
  }
};

/**
 * Get local video track
 */
export const getLocalVideoTrack = () => {
  return localVideoTrack;
};

/**
 * Get local audio track
 */
export const getLocalAudioTrack = () => {
  return localAudioTrack;
};

/**
 * Get Agora client
 */
export const getAgoraClient = () => {
  return agoraClient;
};

/**
 * Generate room/channel name from appointment
 */
export const generateChannelName = (appointmentId) => {
  // For testing, use fixed channel name
  return `retisight-apt-test`;
  
  // For production, use dynamic:
  // return `retisight-apt-${appointmentId}`;
};