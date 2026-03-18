import React, { useEffect, useRef } from 'react';
import { Mic, Video } from 'lucide-react';

const Participant = ({ participant, isLocal, userName }) => {
  const videoRef = useRef();
  const audioRef = useRef();
  const videoTrack = participant.videoTracks.size > 0 && Array.from(participant.videoTracks.values())[0];
  const audioTrack = participant.audioTracks.size > 0 && Array.from(participant.audioTracks.values())[0];

  const videoStream = videoTrack && videoTrack.track;
  const audioStream = audioTrack && audioTrack.track;

  useEffect(() => {
    setMediaStream(videoStream, audioStream);
  }, [videoStream, audioStream]);

  const setMediaStream = (videoStream, audioStream) => {
    if (videoRef.current) {
      if (videoStream) {
        videoRef.current.srcObject = new MediaStream([videoStream]);
      }
    }
    if (audioRef.current) {
      if (audioStream) {
        audioRef.current.srcObject = new MediaStream([audioStream]);
      }
    }
  };

  return (
    <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center">
      {videoStream ? (
        <video
          ref={videoRef}
          autoPlay={true}
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full bg-slate-800">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-3">
            <div className="text-2xl font-bold text-slate-400">
              {userName?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          <p className="text-slate-400 text-sm">{userName}</p>
        </div>
      )}

      <audio ref={audioRef} autoPlay={true} muted={isLocal} />

      {/* Name Label */}
      <div className="absolute top-3 left-3 bg-slate-900/80 px-3 py-1 rounded-lg text-white text-xs font-bold">
        {isLocal ? 'You' : userName}
      </div>

      {/* Status Indicators */}
      <div className="absolute bottom-3 right-3 flex gap-2">
        {!audioStream && <Mic className="text-red-500" size={16} />}
        {!videoStream && <Video className="text-red-500" size={16} />}
      </div>
    </div>
  );
};

export default Participant;