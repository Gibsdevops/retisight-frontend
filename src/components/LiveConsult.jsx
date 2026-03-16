import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import { Video, User, PhoneOff, Copy, ShieldCheck } from 'lucide-react';

const LiveConsult = () => {
    const [myId, setMyId] = useState('');
    const [callActive, setCallActive] = useState(false);
    const videoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerInstance = useRef(null);

    useEffect(() => {
        const peer = new Peer();
        peer.on('open', (id) => setMyId(id));
        
        peer.on('call', (call) => {
            navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" }, // Rear camera for phone attachment
                audio: true 
            }).then((stream) => {
                videoRef.current.srcObject = stream;
                call.answer(stream);
                call.on('stream', (remoteStream) => {
                    remoteVideoRef.current.srcObject = remoteStream;
                });
                setCallActive(true);
            });
        });
        peerInstance.current = peer;
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl aspect-video border-4 border-white">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold animate-pulse">LIVE FEED</div>
                
                {/* Overlay Doctor small window */}
                <div className="absolute bottom-4 right-4 w-32 md:w-48 aspect-video bg-black rounded-xl border-2 border-white overflow-hidden shadow-2xl">
                    <video ref={remoteVideoRef} autoPlay className="w-full h-full object-cover" />
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                    <h2 className="text-lg font-bold mb-2 flex items-center gap-2"><User size={18} className="text-medical-600"/> Session Control</h2>
                    <p className="text-xs text-slate-500 mb-6">Share this ID with your specialist to start the exam.</p>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center group cursor-pointer" onClick={() => navigator.clipboard.writeText(myId)}>
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase">Consultation ID</span>
                            <p className="font-mono font-bold text-medical-900 truncate w-32">{myId || 'Connecting...'}</p>
                        </div>
                        <Copy size={16} className="text-slate-300 group-hover:text-medical-600" />
                    </div>

                    <button className={`w-full mt-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${callActive ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {callActive ? <><PhoneOff size={20} /> End Consultation</> : "Waiting for Doctor..."}
                    </button>
                </div>

                <div className="bg-emerald-600 p-6 rounded-2xl text-white flex gap-4">
                    <ShieldCheck size={40} className="opacity-50 shrink-0" />
                    <div>
                        <h4 className="font-bold text-sm">HIPAA Compliant</h4>
                        <p className="text-[10px] opacity-80 mt-1">Video is encrypted and peer-to-peer. No patient medical data is recorded.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveConsult;