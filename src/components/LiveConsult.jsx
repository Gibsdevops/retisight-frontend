import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { initializePeer, getPeerId, initiateCall, answerCall, closePeer, getPeer } from '../utils/peerService';
import { Video, Phone, Mic, MicOff, VideoOff, Copy, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const LiveConsult = ({ appointmentId = null, doctorId = null, patientId = null }) => {
  const [roomId, setRoomId] = useState('');
  const [peerId, setPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const [currentCall, setCurrentCall] = useState(null);
  const [userRole, setUserRole] = useState('patient'); // 'doctor' or 'patient'

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Initialize Peer on mount
  useEffect(() => {
    const initPeer = async () => {
      try {
        console.log('🔧 Initializing PeerJS...');
        const peerInstance = await initializePeer();
        const myPeerId = peerInstance.id;
        setPeerId(myPeerId);

        // Listen for incoming calls
        peerInstance.on('call', (incomingCall) => {
          console.log('📞 Incoming call from:', incomingCall.peer);
          handleIncomingCall(incomingCall);
        });

        // Get current user role
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setUserRole(profile?.role || 'patient');
      } catch (error) {
        console.error('Error initializing peer:', error);
        toast.error('Failed to initialize video system');
      }
    };

    initPeer();

    return () => {
      // Cleanup on unmount
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleIncomingCall = async (incomingCall) => {
    try {
      console.log('📞 Answering incoming call...');
      setRemotePeerId(incomingCall.peer);

      if (!localStream) {
        console.error('No local stream available');
        incomingCall.close();
        return;
      }

      const call = answerCall(incomingCall, localStream);
      setCurrentCall(call);

      // Handle incoming stream
      call.on('stream', (remoteStreamData) => {
        console.log('✅ Received remote stream');
        setRemoteStream(remoteStreamData);
      });

      call.on('close', () => {
        console.log('Call closed');
        setRemoteStream(null);
      });

      call.on('error', (err) => {
        console.error('Call error:', err);
      });
    } catch (error) {
      console.error('Error handling incoming call:', error);
      toast.error('Failed to answer call');
    }
  };

  const generateRoomId = () => {
    if (appointmentId) {
      return `apt-${appointmentId}`;
    }
    return `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleStartConsultation = async () => {
    try {
      setConnectionStatus('connecting');

      // Get user media
      console.log('📹 Requesting camera and microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });

      setLocalStream(stream);

      // Display local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Generate room ID
      const newRoomId = generateRoomId();
      setRoomId(newRoomId);
      setIsInRoom(true);
      setConnectionStatus('connected');

      console.log('✅ Room created:', newRoomId);
      console.log('✅ Your Peer ID:', peerId);
      toast.success('✅ Camera & microphone ready!');
    } catch (err) {
      console.error('Error accessing media:', err);

      if (err.name === 'NotAllowedError') {
        toast.error('❌ Camera/microphone permission denied');
      } else if (err.name === 'NotFoundError') {
        toast.error('❌ Camera/microphone not found');
      } else {
        toast.error('❌ Failed to start consultation');
      }

      setConnectionStatus('error');
    }
  };

  const handleConnectToCall = async () => {
    try {
      if (!remotePeerId.trim()) {
        toast.error('⚠️ Please enter the other person\'s Peer ID');
        return;
      }

      if (!localStream) {
        toast.error('⚠️ Camera not enabled. Click "Start" first.');
        return;
      }

      setConnectionStatus('calling');
      console.log('📞 Calling peer:', remotePeerId);

      const call = await initiateCall(remotePeerId, localStream);
      setCurrentCall(call);

      // Handle incoming stream
      call.on('stream', (remoteStreamData) => {
        console.log('✅ Connected! Receiving stream from', remotePeerId);
        setRemoteStream(remoteStreamData);
        setConnectionStatus('connected');
        toast.success('✅ Connected to doctor!');
      });

      call.on('close', () => {
        console.log('Call ended');
        setRemoteStream(null);
      });

      call.on('error', (err) => {
        console.error('Call error:', err);
        toast.error('Connection error');
        setConnectionStatus('error');
      });
    } catch (error) {
      console.error('Error connecting to call:', error);
      toast.error('❌ Failed to connect');
      setConnectionStatus('error');
    }
  };

  const handleEndConsultation = () => {
    // Close call
    if (currentCall) {
      currentCall.close();
      setCurrentCall(null);
    }

    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsInRoom(false);
    setRoomId('');
    setRemotePeerId('');
    setConnectionStatus('idle');
    toast.success('👋 Consultation ended');
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  const copyPeerId = () => {
    navigator.clipboard.writeText(peerId);
    toast.success('📋 Your Peer ID copied to clipboard!');
  };

  // Before joining
  if (!isInRoom) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-12 rounded-[2rem] shadow-2xl border border-white text-center">
          <div className="mb-6">
            <Video className="mx-auto text-medical-600 mb-4" size={48} />
            <h2 className="text-3xl font-black text-slate-900 mb-2">Live Consultation</h2>
            <p className="text-slate-500">Connect with your ophthalmologist for real-time screening</p>
          </div>

          <button
            onClick={handleStartConsultation}
            disabled={connectionStatus === 'connecting'}
            className={`px-12 py-6 rounded-2xl font-black text-white text-lg flex items-center gap-3 mx-auto transition-all ${
              connectionStatus === 'connecting'
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-medical-600 hover:bg-medical-700'
            }`}
          >
            <Video size={24} />
            {connectionStatus === 'connecting' ? 'Starting...' : 'Start Consultation'}
          </button>

          {connectionStatus === 'error' && (
            <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-xl">
              <p className="text-red-700 text-sm">
                ❌ Failed to start consultation. Please check your camera/microphone permissions and try again.
              </p>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4">Requirements:</h3>
            <ul className="text-left text-slate-600 space-y-2">
              <li>✓ Webcam & microphone access</li>
              <li>✓ Good internet connection (min 1 Mbps)</li>
              <li>✓ Well-lit environment for eye examination</li>
              <li>✓ Private, quiet space</li>
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
        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-900">
          {/* Local Video */}
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-slate-900/80 px-3 py-1 rounded-lg text-white text-xs font-bold">
              You {userRole === 'doctor' ? '👨‍⚕️' : '👤'}
            </div>
            <div className={`absolute top-3 right-3 px-3 py-1 rounded-lg text-white text-xs font-bold ${
              remoteStream ? 'bg-emerald-600' : 'bg-amber-600'
            }`}>
              {remoteStream ? '● Connected' : '● Waiting...'}
            </div>
          </div>

          {/* Remote Video */}
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center">
            {remoteStream ? (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  onLoadedMetadata={(e) => {
                    e.target.srcObject = remoteStream;
                  }}
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 px-3 py-1 rounded-lg text-white text-xs font-bold">
                  {userRole === 'doctor' ? 'Patient 👤' : 'Doctor 👨‍⚕️'}
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Video className="text-slate-400" size={32} />
                </div>
                <p className="text-slate-400 text-sm">
                  {userRole === 'doctor' 
                    ? 'Waiting for patient...' 
                    : 'Waiting for doctor...'}
                </p>
                {peerId && (
                  <p className="text-slate-500 text-xs mt-3 px-4">
                    Your ID: <span className="font-mono text-yellow-300">{peerId.slice(0, 12)}...</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Peer ID Exchange (if not connected yet) */}
        {!remoteStream && (
          <div className="bg-slate-800 px-6 py-6 border-t border-slate-700">
            <p className="text-slate-300 text-sm mb-3">
              💡 <strong>Not connected?</strong> Share your Peer ID with the other person:
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={peerId}
                readOnly
                className="flex-1 px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg text-sm font-mono"
              />
              <button
                onClick={copyPeerId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Copy size={16} /> Copy
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste their Peer ID here..."
                value={remotePeerId}
                onChange={(e) => setRemotePeerId(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg text-sm font-mono placeholder-slate-500"
              />
              <button
                onClick={handleConnectToCall}
                disabled={connectionStatus === 'calling' || !remotePeerId.trim()}
                className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                  connectionStatus === 'calling' || !remotePeerId.trim()
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                <Phone size={16} />
                {connectionStatus === 'calling' ? 'Calling...' : 'Connect'}
              </button>
            </div>
          </div>
        )}

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
          {isMuted && <span className="mr-4">🔇 Muted</span>}
          {!isVideoOn && <span className="mr-4">📹 Camera Off</span>}
          <span>Room: {roomId}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveConsult;