import AgoraRTC from 'agora-rtc-sdk-ng';
import { generateAgoraToken } from './agoraTokenService';

let rtcClient = null;
let localAudioTrack = null;
let localVideoTrack = null;

// Log environment variables on module load
console.log('📋 Environment Variables on Module Load:');
console.log('  VITE_AGORA_APP_ID:', import.meta.env.VITE_AGORA_APP_ID ? `✅ Set (${import.meta.env.VITE_AGORA_APP_ID})` : '❌ NOT SET');
console.log('  VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? `✅ Set (${import.meta.env.VITE_SUPABASE_URL})` : '❌ NOT SET');
console.log('  VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? `✅ Set (length: ${import.meta.env.VITE_SUPABASE_ANON_KEY.length})` : '❌ NOT SET');

export const initializeAgoraClient = () => {
  rtcClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  console.log('🔧 Agora client initialized');
  return rtcClient;
};

export const createLocalTracks = async () => {
  try {
    console.log('🎤 Creating local audio and video tracks...');
    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    console.log('✅ Local tracks created successfully');
    return { audioTrack: localAudioTrack, videoTrack: localVideoTrack };
  } catch (error) {
    console.error('❌ Error creating tracks:', error);
    throw error;
  }
};

export const joinAgoraChannel = async (channelName, userName) => {
  try {
    console.log('📞 Joining Agora channel:', channelName);
    console.log('👤 User:', userName);

    // Check environment variables at join time
    const appId = import.meta.env.VITE_AGORA_APP_ID;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    console.log('🔍 Environment Variables at Join Time:');
    console.log('  VITE_AGORA_APP_ID:', appId ? `✅ ${appId}` : '❌ Missing');
    console.log('  VITE_SUPABASE_URL:', supabaseUrl ? `✅ ${supabaseUrl}` : '❌ Missing');
    console.log('  VITE_SUPABASE_ANON_KEY:', supabaseKey ? `✅ Present (${supabaseKey.length} chars)` : '❌ Missing');

    // Throw error if missing
    if (!appId) {
      throw new Error('❌ VITE_AGORA_APP_ID is NOT SET in Vercel environment variables');
    }

    if (!supabaseUrl) {
      throw new Error('❌ VITE_SUPABASE_URL is NOT SET in Vercel environment variables');
    }

    if (!supabaseKey) {
      throw new Error('❌ VITE_SUPABASE_ANON_KEY is NOT SET in Vercel environment variables');
    }

    // Generate token dynamically
    console.log('🔄 Generating token...');
    const token = await generateAgoraToken(channelName, userName);
    console.log('🔐 Token Generated:', token ? `✅ (${token.length} chars)` : '❌ Failed');

    const userId = Math.floor(Math.random() * 100000);
    
    console.log('📝 Final Join Parameters:');
    console.log('  App ID:', appId);
    console.log('  Channel:', channelName);
    console.log('  User ID:', userId);
    console.log('  Token:', token ? `✅ (length: ${token.length})` : '❌ INVALID');

    await rtcClient.join(appId, channelName, token, userId);
    console.log('✅ Successfully joined channel');
    
    return rtcClient;
  } catch (error) {
    console.error('❌ Error joining Agora channel:', error);
    throw error;
  }
};

export const publishLocalTracks = async (audioTrack, videoTrack) => {
  try {
    await rtcClient.publish([audioTrack, videoTrack]);
    console.log('📤 Local tracks published');
  } catch (error) {
    console.error('❌ Error publishing tracks:', error);
    throw error;
  }
};

export const subscribeToRemoteUser = async (user, mediaType) => {
  try {
    await rtcClient.subscribe(user, mediaType);
    console.log(`✅ Subscribed to ${mediaType} from ${user.uid}`);
  } catch (error) {
    console.error('❌ Error subscribing:', error);
    throw error;
  }
};

export const playRemoteVideo = (user, videoRef) => {
  if (videoRef && user.videoTrack) {
    user.videoTrack.play(videoRef);
    console.log('📹 Remote video playing');
  }
};

export const playRemoteAudio = (user) => {
  if (user.audioTrack) {
    user.audioTrack.play();
  }
};

export const toggleMicrophone = (enabled) => {
  if (localAudioTrack) {
    localAudioTrack.setEnabled(enabled);
    console.log(`🎤 Microphone: ${enabled ? 'ON' : 'OFF'}`);
  }
};

export const toggleCamera = (enabled) => {
  if (localVideoTrack) {
    localVideoTrack.setEnabled(enabled);
    console.log(`📷 Camera: ${enabled ? 'ON' : 'OFF'}`);
  }
};

export const leaveAgoraChannel = async () => {
  try {
    const audioTracks = rtcClient.localAudioTracks;
    const videoTracks = rtcClient.localVideoTracks;

    audioTracks.forEach(track => track.close());
    videoTracks.forEach(track => track.close());

    await rtcClient.leave();
    console.log('👋 Left Agora channel');
  } catch (error) {
    console.error('❌ Error leaving channel:', error);
    throw error;
  }
};

export const generateChannelName = (appointmentId) => {
  return `retisight-apt-${appointmentId}`;
};