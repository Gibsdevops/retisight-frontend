import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { subscribeToPatientAppointmentStatus, getPatientAppointments } from '../utils/realtimeService';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
            <div
              key={apt.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                apt.status === 'pending'
                  ? 'border-amber-200 bg-amber-50'
                  : apt.status === 'approved'
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
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
              <p className="text-xs font-bold uppercase text-slate-600 mt-2">
                {apt.status === 'pending' && '⏳ Waiting for approval'}
                {apt.status === 'approved' && '✅ Approved - Ready for consultation'}
                {apt.status === 'rejected' && '❌ Rejected'}
              </p>
            </div>
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