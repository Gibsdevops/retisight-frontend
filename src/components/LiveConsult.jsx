import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Video, Phone, Mic, MicOff, VideoOff, Share2, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const LiveConsult = () => {
  const [roomId, setRoomId] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const generateRoomId = () => {
    return `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleStartConsultation = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Get user media (camera + microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });

      setLocalStream(stream);

      // Display local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Generate room ID for this consultation
      const newRoomId = generateRoomId();
      setRoomId(newRoomId);
      setIsInRoom(true);
      setConnectionStatus('connected');

      toast.success('Camera & microphone ready! Waiting for other participant...');
    } catch (err) {
      console.error('Error accessing media:', err);
      
      if (err.name === 'NotAllowedError') {
        toast.error('Camera/microphone permission denied');
      } else if (err.name === 'NotFoundError') {
        toast.error('Camera/microphone not found');
      } else {
        toast.error('Failed to start consultation');
      }
      
      setConnectionStatus('error');
    }
  };

  const handleEndConsultation = () => {
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

  const shareRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    toast.success('📋 Room code copied to clipboard!');
  };

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
                Failed to start consultation. Please check your camera/microphone permissions and try again.
              </p>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4">Requirements:</h3>
            <ul className="text-left text-slate-600 space-y-2">
              <li>✓ Webcam & microphone access</li>
              <li>✓ Good internet connection (min 2.5 Mbps)</li>
              <li>✓ Well-lit environment for eye examination</li>
              <li>✓ Private, quiet space</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

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
              You
            </div>
            <div className={`absolute top-3 right-3 px-3 py-1 rounded-lg text-white text-xs font-bold ${
              connectionStatus === 'connected' ? 'bg-emerald-600' : 'bg-amber-600'
            }`}>
              {connectionStatus === 'connected' ? '● Live' : '● Connecting...'}
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
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 px-3 py-1 rounded-lg text-white text-xs font-bold">
                  Doctor
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Video className="text-slate-400" size={32} />
                </div>
                <p className="text-slate-400 text-sm">Waiting for doctor to join...</p>
                <p className="text-slate-500 text-xs mt-2">Room: {roomId.substring(0, 15)}...</p>
              </div>
            )}
          </div>
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

          <button
            onClick={shareRoomCode}
            className="p-4 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-all"
            title="Share room code"
          >
            <Share2 size={20} />
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
          <span>Room ID: {roomId}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveConsult;