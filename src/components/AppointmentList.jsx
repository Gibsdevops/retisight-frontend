import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { subscribeToPatientAppointmentStatus, getPatientAppointments } from '../utils/realtimeService';
import { Clock, CheckCircle, XCircle, Video, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import LiveConsult from './LiveConsult';
import { fromJSON } from 'postcss';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [selectedAppointmentForVideo, setSelectedAppointmentForVideo] = useState(null);

  useEffect(() => {
    const initAppointments = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        // Fetch initial appointments
        await fetchAppointments(user.id);

        // Subscribe to real-time status updates
        const subscription = subscribeToPatientAppointmentStatus(user.id, (payload) => {
          const { new: updatedAppointment } = payload;
          
          if (updatedAppointment.status === 'approved') {
            toast.success('✅ Doctor approved your appointment!');
          } else if (updatedAppointment.status === 'rejected') {
            toast.error('❌ Doctor rejected your appointment');
          }
          
          fetchAppointments(user.id);
        });

        setLoading(false);
        return () => subscription.unsubscribe();
      } catch (err) {
        console.error('Error initializing appointments:', err);
        setLoading(false);
      }
    };

    initAppointments();
  }, []);

  const fetchAppointments = async (patientId) => {
    try {
      const data = await getPatientAppointments(patientId);
      setAppointments(data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      toast.error('Failed to load appointments');
    }
  };

  const handleJoinCall = (appointment) => {
    setSelectedAppointmentForVideo(appointment);
    setShowVideoCall(true);
  };

  const handleCloseVideoCall = () => {
    setShowVideoCall(false);
    setSelectedAppointmentForVideo(null);
  };

  // Show video call component if in call
  if (showVideoCall && selectedAppointmentForVideo) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
        {/* Top bar with close button */}
        <div className="bg-black px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Video className="text-medical-600" size={24} />
            <div>
              <h2 className="text-lg font-black text-white">Live Consultation</h2>
              <p className="text-xs text-slate-400">with Dr. {selectedAppointmentForVideo.Profiles?.full_name}</p>
            </div>
          </div>
          <button
            onClick={handleCloseVideoCall}
            className="p-2 hover:bg-slate-800 rounded-lg transition-all"
          >
            <X size={24} className="text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Video component */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <LiveConsult 
            appointmentId={selectedAppointmentForVideo.id}
            doctorId={selectedAppointmentForVideo.doctor_id}
            patientId={currentUser?.id}
            userRole="patient"
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-[2rem] shadow-xl">
        <p className="text-slate-500 text-center">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-white sticky top-24">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="text-medical-600" size={24} />
        <h3 className="text-lg font-black text-slate-900">My Appointments (Real-Time)</h3>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {appointments.length > 0 ? (
          appointments.map(apt => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border-2 transition-all ${
                apt.status === 'pending'
                  ? 'border-amber-200 bg-amber-50'
                  : apt.status === 'approved'
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <p className="font-bold text-slate-800">Dr. {apt.Profiles?.full_name || 'Unknown'}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(apt.created_at).toLocaleDateString()} at{' '}
                    {new Date(apt.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  {apt.status === 'pending' && <Clock className="text-amber-600" size={20} />}
                  {apt.status === 'approved' && <CheckCircle className="text-emerald-600" size={20} />}
                  {apt.status === 'rejected' && <XCircle className="text-red-600" size={20} />}
                </div>
              </div>

              <p className="text-xs font-bold uppercase text-slate-600 mb-3">
                {apt.status === 'pending' && '⏳ Waiting for approval'}
                {apt.status === 'approved' && '✅ Approved - Ready for consultation'}
                {apt.status === 'rejected' && '❌ Rejected'}
              </p>

              {/* Join Call Button for Approved Appointments */}
              {apt.status === 'approved' && (
                <button
                  onClick={() => handleJoinCall(apt)}
                  className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <Video size={14} /> Join Consultation
                </button>
              )}
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">No appointments yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentList;