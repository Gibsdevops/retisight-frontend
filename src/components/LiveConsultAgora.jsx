import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import {
  initializeAgoraClient,
  createLocalTracks,
  joinAgoraChannel,
  publishLocalTracks,
  subscribeToRemoteUser,
  toggleMicrophone,
  toggleCamera,
  playRemoteVideo,
  playRemoteAudio,
  leaveAgoraChannel,
  generateChannelName
} from '../utils/agoraVideoService';
import { endVideoSession } from '../utils/videoSessionService';
import { Video, Phone, Mic, MicOff, VideoOff, Users, CheckCircle, LogIn, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const LiveConsultAgora = ({ appointmentId = null, userRole = 'patient' }) => {
  const [userName, setUserName] = useState('');
  const [channelName, setChannelName] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [callNotifications, setCallNotifications] = useState([]);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Setup channel name and user info
  useEffect(() => {
    const setupRoom = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

          setUserName(profile?.full_name || 'User');
        }

        if (appointmentId) {
          const name = generateChannelName(appointmentId);
          setChannelName(name);
          console.log('📍 Channel name set:', name);
          console.log('👤 User role:', userRole);
        }
      } catch (error) {
        console.error('Error setting up room:', error);
      }
    };

    setupRoom();
  }, [appointmentId, userRole]);

  // Add notification
  const addNotification = (type, title, message, duration = 5000) => {
    const id = Date.now();
    const notification = { id, type, title, message };
    
    setCallNotifications(prev => [...prev, notification]);
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        setCallNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
    
    return id;
  };

  // Join consultation
  const handleStartConsultation = async () => {
    setConnecting(true);
    setErrorMessage('');

    try {
      console.log('🔌 Starting Agora consultation...');
      console.log('👤 Role:', userRole);

      // Initialize client
      initializeAgoraClient();

      // Create local tracks
      const { audioTrack, videoTrack } = await createLocalTracks();

      // Join channel
      const client = await joinAgoraChannel(channelName, userName);

      // Publish local tracks
      await publishLocalTracks(audioTrack, videoTrack);

      // Play local video
      if (videoTrack && localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
        console.log('📹 Local video playing');
      }

      // Add notification that you joined
      addNotification(
        'success',
        `You joined as ${userRole === 'doctor' ? 'Doctor' : 'Patient'}`,
        `${userName} is now in the consultation room`,
        3000
      );

      // Setup event listeners
      client.on('user-published', async (user, mediaType) => {
        console.log('👤 User published:', user.uid, 'mediaType:', mediaType);

        await subscribeToRemoteUser(user, mediaType);

        if (mediaType === 'video') {
          playRemoteVideo(user, remoteVideoRef.current);
          setRemoteUsers(users => {
            if (!users.find(u => u.uid === user.uid)) {
              return [...users, user];
            }
            return users;
          });

          // Add notification when someone joins
          const joinMessage = userRole === 'doctor' 
            ? `👨‍🦳 Patient (${user.uid}) has joined the consultation!`
            : `👨‍⚕️ Doctor (${user.uid}) has joined the consultation!`;
          
          addNotification(
            'success',
            `${getOtherPersonTitle()} Joined!`,
            joinMessage,
            5000
          );

          toast.success(`${user.uid} joined the consultation`);
        }

        if (mediaType === 'audio') {
          playRemoteAudio(user);
        }
      });

      client.on('user-unpublished', (user, mediaType) => {
        console.log('👤 User unpublished:', user.uid, 'mediaType:', mediaType);

        if (mediaType === 'video') {
          setRemoteUsers(users => users.filter(u => u.uid !== user.uid));
          
          // Add notification when someone leaves
          addNotification(
            'warning',
            `${getOtherPersonTitle()} Left`,
            `${user.uid} has left the consultation`,
            4000
          );

          toast.info(`${user.uid} left the consultation`);
        }
      });

      setIsInRoom(true);
      toast.success('✅ Connected to consultation!');
    } catch (error) {
      console.error('❌ Error starting consultation:', error);
      const errorMsg = error.message || 'Failed to start consultation';
      setErrorMessage(errorMsg);
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setConnecting(false);
    }
  };

  // End consultation
  const handleEndConsultation = async () => {
    try {
      await leaveAgoraChannel();

      if (appointmentId) {
        await endVideoSession(appointmentId);
      }

      addNotification(
        'info',
        'Consultation Ended',
        'You have ended the consultation',
        3000
      );

      setIsInRoom(false);
      setRemoteUsers([]);
      toast.success('👋 Consultation ended');
    } catch (error) {
      console.error('Error ending consultation:', error);
      toast.error('Failed to end consultation');
    }
  };

  // Toggle mute
  const handleToggleMute = async () => {
    try {
      const success = await toggleMicrophone(!isMuted);
      if (success) {
        setIsMuted(!isMuted);
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  // Toggle video
  const handleToggleVideo = async () => {
    try {
      const success = await toggleCamera(!isVideoOn);
      if (success) {
        setIsVideoOn(!isVideoOn);
      }
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  // Get waiting message based on role
  const getWaitingMessage = () => {
    if (userRole === 'doctor') {
      return 'Waiting for patient to join...';
    } else {
      return 'Waiting for doctor to join...';
    }
  };

  // Get other person title based on role
  const getOtherPersonTitle = () => {
    if (userRole === 'doctor') {
      return 'Patient';
    } else {
      return 'Doctor';
    }
  };

  // Notification component
  const NotificationCard = ({ notification }) => {
    const getIcon = () => {
      switch (notification.type) {
        case 'success':
          return <CheckCircle className="text-green-500" size={20} />;
        case 'warning':
          return <LogOut className="text-yellow-500" size={20} />;
        case 'info':
          return <LogIn className="text-blue-500" size={20} />;
        default:
          return <Users className="text-slate-500" size={20} />;
      }
    };

    const getBgColor = () => {
      switch (notification.type) {
        case 'success':
          return 'bg-green-50 border-green-200';
        case 'warning':
          return 'bg-yellow-50 border-yellow-200';
        case 'info':
          return 'bg-blue-50 border-blue-200';
        default:
          return 'bg-slate-50 border-slate-200';
      }
    };

    const getTextColor = () => {
      switch (notification.type) {
        case 'success':
          return 'text-green-800';
        case 'warning':
          return 'text-yellow-800';
        case 'info':
          return 'text-blue-800';
        default:
          return 'text-slate-800';
      }
    };

    return (
      <div className={`flex items-start gap-3 p-4 rounded-lg border ${getBgColor()}`}>
        {getIcon()}
        <div className="flex-1">
          <p className={`font-bold text-sm ${getTextColor()}`}>{notification.title}</p>
          <p className={`text-xs ${getTextColor()} opacity-90`}>{notification.message}</p>
        </div>
      </div>
    );
  };

  // Before joining
  if (!isInRoom) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-12 rounded-[2rem] shadow-2xl border border-white text-center">
          <div className="mb-6">
            <Video className="mx-auto text-medical-600 mb-4" size={48} />
            <h2 className="text-3xl font-black text-slate-900 mb-2">Live Consultation</h2>
            <p className="text-slate-500">
              {userRole === 'doctor' 
                ? 'Start your consultation with your patient' 
                : 'Join your doctor for live consultation'}
            </p>
          </div>

          <button
            onClick={handleStartConsultation}
            disabled={connecting || !channelName}
            className={`px-12 py-6 rounded-2xl font-black text-white text-lg flex items-center gap-3 mx-auto transition-all ${
              connecting || !channelName
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-medical-600 hover:bg-medical-700'
            }`}
          >
            <Video size={24} />
            {connecting ? 'Connecting...' : 'Start Consultation'}
          </button>

          {errorMessage && (
            <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-xl">
              <p className="text-red-700 text-sm font-bold mb-2">❌ Connection Error</p>
              <p className="text-red-600 text-xs mb-3">{errorMessage}</p>
              <div className="text-red-600 text-xs text-left bg-white p-3 rounded">
                <p className="font-bold mb-2">✅ Check these:</p>
                <ul className="space-y-1">
                  <li>• VITE_AGORA_APP_ID is set in .env.local</li>
                  <li>• VITE_AGORA_TOKEN is set in .env.local</li>
                  <li>• Browser has camera/microphone access</li>
                  <li>• Internet connection is stable</li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4">Requirements:</h3>
            <ul className="text-left text-slate-600 space-y-2">
              <li>✓ Webcam & microphone enabled</li>
              <li>✓ Good internet connection</li>
              <li>✓ Well-lit environment</li>
              <li>✓ Modern browser (Chrome, Safari, Firefox)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // In consultation
  return (
    <div className="max-w-6xl mx-auto">
      {/* Notifications */}
      {callNotifications.length > 0 && (
        <div className="mb-4 space-y-2">
          {callNotifications.map(notification => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      )}

      <div className="bg-black rounded-[2rem] overflow-hidden shadow-2xl">
        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-900 min-h-[500px]">
          {/* Local Video */}
          <div className="relative bg-slate-800 rounded-xl overflow-hidden">
            <div
              ref={localVideoRef}
              className="w-full h-full bg-black"
              style={{ minHeight: '300px' }}
            />
            <div className="absolute bottom-4 left-4 bg-black/70 px-4 py-2 rounded-lg">
              <p className="text-white text-sm font-semibold">{userName} (You)</p>
            </div>
            <div className="absolute top-4 right-4 bg-green-500/20 border border-green-500 px-3 py-1 rounded-full">
              <p className="text-green-300 text-xs font-bold">🟢 You're Live</p>
            </div>
          </div>

          {/* Remote Video */}
          {remoteUsers.length > 0 ? (
            <div className="relative bg-slate-800 rounded-xl overflow-hidden">
              <div
                ref={remoteVideoRef}
                className="w-full h-full bg-black"
                style={{ minHeight: '300px' }}
              />
              <div className="absolute bottom-4 left-4 bg-black/70 px-4 py-2 rounded-lg">
                <p className="text-white text-sm font-semibold">
                  {remoteUsers[0]?.uid || getOtherPersonTitle()}
                </p>
              </div>
              <div className="absolute top-4 right-4 bg-green-500/20 border border-green-500 px-3 py-1 rounded-full">
                <p className="text-green-300 text-xs font-bold">🟢 Connected</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center bg-slate-800 rounded-xl">
              <div className="text-center">
                <Users className="text-slate-500 mx-auto mb-3" size={32} />
                <p className="text-slate-400 text-sm font-semibold">
                  ⏳ {getWaitingMessage()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Control Bar */}
        <div className="bg-slate-900 px-6 py-6 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleToggleMute}
            className={`p-4 rounded-full transition-all transform hover:scale-110 ${
              isMuted
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            onClick={handleToggleVideo}
            className={`p-4 rounded-full transition-all transform hover:scale-110 ${
              !isVideoOn
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
            title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          <div className="flex-1" />

          <button
            onClick={handleEndConsultation}
            className="px-8 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <Phone size={20} />
            End Consultation
          </button>
        </div>

        {/* Status Bar */}
        <div className="bg-slate-800 px-6 py-3 flex items-center justify-between text-slate-300 text-sm">
          <span>
            🎥 Channel: {channelName}
          </span>
          <span>
            👥 Connected: {remoteUsers.length + 1} people | 👤 Role: {userRole === 'doctor' ? 'Doctor 👨‍⚕️' : 'Patient 👨‍🦳'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveConsultAgora;