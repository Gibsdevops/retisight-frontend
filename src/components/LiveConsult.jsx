import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { joinGoogleMeet, generateGoogleMeetLink, copyMeetingLink } from '../utils/twilioVideoService';
import { endVideoSession } from '../utils/videoSessionService';
import { Video, Phone, Users, Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const LiveConsult = ({ appointmentId = null, doctorId = null, patientId = null, userRole = 'patient' }) => {
  const [userName, setUserName] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Get user info and setup meeting link
  useEffect(() => {
    const setupMeeting = async () => {
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
          const link = generateGoogleMeetLink(appointmentId);
          setMeetLink(link);
          console.log('📍 Meeting link generated:', link);
        }
      } catch (error) {
        console.error('Error setting up meeting:', error);
      }
    };

    setupMeeting();
  }, [appointmentId]);

  // Join Google Meet
  const handleStartConsultation = async () => {
    setConnecting(true);
    setErrorMessage('');

    try {
      console.log('🔌 Starting consultation...');
      console.log('  User:', userName);
      console.log('  Meeting Link:', meetLink);

      joinGoogleMeet(appointmentId);
      setIsJoined(true);

      toast.success(`✅ Google Meet opened! Share the link with ${userRole === 'doctor' ? 'the patient' : 'your doctor'}`);
    } catch (error) {
      console.error('❌ Error starting consultation:', error);
      const errorMsg = error.message || 'Failed to start consultation';
      setErrorMessage(errorMsg);
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setConnecting(false);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyMeetingLink(meetLink);
    if (success) {
      toast.success('✅ Meeting link copied!');
    } else {
      toast.error('❌ Failed to copy link');
    }
  };

  const handleEndConsultation = async () => {
    try {
      if (appointmentId) {
        await endVideoSession(appointmentId);
      }
      
      setIsJoined(false);
      setErrorMessage('');
      toast.success('👋 Consultation ended');
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end consultation');
    }
  };

  // Before joining
  if (!isJoined) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-12 rounded-[2rem] shadow-2xl border border-white text-center">
          <div className="mb-6">
            <Video className="mx-auto text-medical-600 mb-4" size={48} />
            <h2 className="text-3xl font-black text-slate-900 mb-2">Live Consultation</h2>
            <p className="text-slate-500">
              {userRole === 'doctor' ? 'Start your consultation with Google Meet' : 'Join your doctor via Google Meet'}
            </p>
          </div>

          <button
            onClick={handleStartConsultation}
            disabled={connecting || !appointmentId}
            className={`px-12 py-6 rounded-2xl font-black text-white text-lg flex items-center gap-3 mx-auto transition-all ${
              connecting || !appointmentId
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-medical-600 hover:bg-medical-700'
            }`}
          >
            <Video size={24} />
            {connecting ? 'Opening...' : 'Start Consultation'}
          </button>

          {errorMessage && (
            <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-xl">
              <p className="text-red-700 text-sm font-bold mb-2">❌ Error</p>
              <p className="text-red-600 text-xs">{errorMessage}</p>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="font-bold text-slate-700 mb-4">Requirements:</h3>
            <ul className="text-left text-slate-600 space-y-2">
              <li>✓ Google account (optional)</li>
              <li>✓ Webcam & microphone access</li>
              <li>✓ Good internet connection</li>
              <li>✓ Well-lit environment</li>
              <li>✓ Browser that supports Google Meet</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // After joining - Meeting info
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden">
        {/* Meeting Info */}
        <div className="bg-gradient-to-r from-medical-600 to-medical-700 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Video size={32} />
            <h2 className="text-3xl font-black">Consultation in Progress</h2>
          </div>
          <p className="text-medical-100 mb-6">
            {userRole === 'doctor' ? 'Share this link with your patient:' : 'Your doctor has started the consultation:'}
          </p>

          {/* Meeting Link Display */}
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur">
            <div className="flex items-center gap-3 flex-wrap">
              <code className="text-sm font-mono text-white flex-1 break-all">{meetLink}</code>
              <button
                onClick={handleCopyLink}
                className="p-3 bg-white/30 hover:bg-white/40 rounded-lg transition-all"
                title="Copy link"
              >
                <Copy size={18} />
              </button>
              <a
                href={meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/30 hover:bg-white/40 rounded-lg transition-all"
                title="Open in new tab"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="p-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-blue-900">
              <Users size={20} />
              <p className="font-semibold">Google Meet window is open in a new tab</p>
            </div>
          </div>

          {/* End Call Button */}
          <button
            onClick={handleEndConsultation}
            className="w-full px-8 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
          >
            <Phone size={20} />
            End Consultation
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-slate-50 p-8 border-t border-slate-200">
          <h3 className="font-bold text-slate-700 mb-4">💡 Tips:</h3>
          <ul className="text-slate-600 space-y-2 text-sm">
            <li>✓ Keep the Google Meet tab open for the duration of your consultation</li>
            <li>✓ Use the copy button to share the meeting link with others</li>
            <li>✓ If the Google Meet window closed, click the link above to rejoin</li>
            <li>✓ Click "End Consultation" to finish the session</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

//okay
export default LiveConsult;