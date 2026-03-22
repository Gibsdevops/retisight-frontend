import AgoraRTC from 'agora-rtc-sdk-ng';
import { generateAgoraToken } from './agoraTokenService';

let rtcClient = null;
let localAudioTrack = null;
let localVideoTrack = null;

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

    // Generate token dynamically
    const token = await generateAgoraToken(channelName, userName);
    console.log('🔐 Using token: YES');

    const userId = Math.floor(Math.random() * 100000);
    
    await rtcClient.join(import.meta.env.VITE_AGORA_APP_ID, channelName, token, userId);
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