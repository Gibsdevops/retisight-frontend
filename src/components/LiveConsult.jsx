import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { getAccessToken, joinTwilioRoom, leaveTwilioRoom, generateTwilioRoomName } from '../utils/twilioVideoService';
import { endVideoSession } from '../utils/videoSessionService';
import { Video, Phone, Mic, MicOff, VideoOff, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Participant from './Participant';

const LiveConsult = ({ appointmentId = null, doctorId = null, patientId = null, userRole = 'patient' }) => {
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isInRoom, setIsInRoom] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const [connecting, setConnecting] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // Get user info and setup room name
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
          const name = generateTwilioRoomName(appointmentId);
          setRoomName(name);
        }
      } catch (error) {
        console.error('Error setting up room:', error);
      }
    };

    setupRoom();
  }, [appointmentId]);

  // Join room when user starts consultation
  const handleStartConsultation = async () => {
    setConnecting(true);
    setConnectionStatus('connecting');

    try {
      console.log('🔌 Getting access token...');
      const token = await getAccessToken(userName, roomName);

      console.log('📞 Joining room:', roomName);
      const newRoom = await joinTwilioRoom(token, roomName, userName);

      setRoom(newRoom);
      setIsInRoom(true);
      setConnectionStatus('connected');

      // Handle participant joined
      const participantConnected = (participant) => {
        console.log('👤 Participant joined:', participant.name);
        setParticipants(participants => [...participants, participant]);
      };

      // Handle participant left
      const participantDisconnected = (participant) => {
        console.log('👤 Participant left:', participant.name);
        setParticipants(participants => participants.filter(p => p !== participant));
      };

      newRoom.on('participantConnected', participantConnected);
      newRoom.on('participantDisconnected', participantDisconnected);
      
      // Set initial participants
      setParticipants(Array.from(newRoom.participants.values()));

      toast.success(`✅ ${userRole === 'doctor' ? 'Waiting for patient...' : 'Connected to doctor!'}`);
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('❌ Failed to join room. Make sure backend is running on localhost:3001');
      setConnectionStatus('error');
    } finally {
      setConnecting(false);
    }
  };

  const handleEndConsultation = async () => {
    // End video session in DB
    if (appointmentId) {
      try {
        await endVideoSession(appointmentId);
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }

    // Leave room
    if (room) {
      leaveTwilioRoom(room);
      setRoom(null);
    }

    setIsInRoom(false);
    setParticipants([]);
    setConnectionStatus('idle');
    toast.success('👋 Consultation ended');
  };

  const toggleMute = () => {
    if (room) {
      room.localParticipant.audioTracks.forEach(trackSubscription => {
        if (isMuted) {
          trackSubscription.track.enable();
        } else {
          trackSubscription.track.disable();
        }
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (room) {
      room.localParticipant.videoTracks.forEach(trackSubscription => {
        if (isVideoOn) {
          trackSubscription.track.disable();
        } else {
          trackSubscription.track.enable();
        }
      });
      setIsVideoOn(!isVideoOn);
    }
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
              {userRole === 'doctor' ? 'Waiting for patient to join...' : 'Join your doctor for real-time consultation'}
            </p>
          </div>

          <button
            onClick={handleStartConsultation}
            disabled={connecting || !roomName}
            className={`px-12 py-6 rounded-2xl font-black text-white text-lg flex items-center gap-3 mx-auto transition-all ${
              connecting || !roomName
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-medical-600 hover:bg-medical-700'
            }`}
          >
            <Video size={24} />
            {connecting ? 'Joining...' : 'Join Room'}
          </button>

          {connectionStatus === 'error' && (
            <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-xl">
              <p className="text-red-700 text-sm font-bold mb-2">❌ Connection Failed</p>
              <p className="text-red-600 text-xs">
                Make sure the backend server is running: <br />
                <code className="bg-red-200 px-2 py-1 rounded">node server.js</code>
              </p>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4">Requirements:</h3>
            <ul className="text-left text-slate-600 space-y-2">
              <li>✓ Webcam & microphone access</li>
              <li>✓ Good internet connection</li>
              <li>✓ Well-lit environment</li>
              <li>✓ Backend server running (port 3001)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // After joining
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-black rounded-[2rem] overflow-hidden shadow-2xl">
        {/* Participants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-900 min-h-[500px]">
          {/* Local Participant */}
          <Participant
            key="local"
            participant={room.localParticipant}
            isLocal={true}
            userName={userName}
          />

          {/* Remote Participants */}
          {participants.map(participant => (
            <Participant
              key={participant.sid}
              participant={participant}
              isLocal={false}
              userName={participant.name}
            />
          ))}

          {/* Waiting message */}
          {participants.length === 0 && (
            <div className="flex items-center justify-center bg-slate-800 rounded-xl">
              <div className="text-center">
                <Users className="text-slate-500 mx-auto mb-3" size={32} />
                <p className="text-slate-400 text-sm">
                  {userRole === 'doctor' ? 'Waiting for patient...' : 'Waiting for doctor...'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Control Bar */}
        <div className="bg-slate-900 px-6 py-6 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all ${
              isMuted
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all ${
              !isVideoOn
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
            title={isVideoOn ? 'Turn off video' : 'Turn on video'}
          >
            {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          <div className="flex-1" />

          <button
            onClick={handleEndConsultation}
            className="px-8 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center gap-2"
          >
            <Phone size={20} />
            End Call
          </button>
        </div>

        {/* Status Bar */}
        <div className="bg-slate-800 px-6 py-3 text-center text-slate-300 text-sm">
          <span>Room: {roomName} | Participants: {participants.length + 1}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveConsult;