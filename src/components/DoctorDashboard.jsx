import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { subscribeToDoctorAppointments, updateAppointmentStatus, getDoctorAppointments } from '../utils/realtimeService';
import { CheckCircle, Video, User, Clock, LogOut, Activity, Bell, Search, Filter, TrendingUp, AlertTriangle, Calendar, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import LiveConsult from './LiveConsultAgora';

const DoctorDashboard = ({ onLogout }) => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ pending: 0, critical: 0, total: 0 });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [approving, setApproving] = useState(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [activeCallAppointment, setActiveCallAppointment] = useState(null);

  useEffect(() => {
    const initDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      await fetchAppointments(user.id);
      
      const subscription = subscribeToDoctorAppointments(user.id, (payload) => {
        if (payload.eventType === 'INSERT') {
          toast.success('🔔 New appointment request received!');
          fetchAppointments(user.id);
        } else if (payload.eventType === 'UPDATE') {
          fetchAppointments(user.id);
        }
      });

      setLoading(false);
      return () => subscription.unsubscribe();
    };

    initDashboard();
  }, []);

  const fetchAppointments = async (doctorId) => {
    try {
      const { getDoctorAppointments } = await import('../utils/realtimeService');
      const data = await getDoctorAppointments(doctorId);
      
      setAppointments(data || []);
      setStats({
        pending: data?.filter(a => a.status === 'pending').length || 0,
        critical: data?.filter(a => a.status === 'approved').length || 0,
        total: data?.length || 0
      });
    } catch (err) {
      console.error('Error fetching appointments:', err);
      toast.error('Failed to load appointments');
    }
  };

  const handleApproveAppointment = async (appointmentId) => {
    setApproving(appointmentId);
    try {
      await updateAppointmentStatus(appointmentId, 'approved');
      toast.success('✅ Appointment approved! Patient will be notified.');
      await fetchAppointments(currentUser.id);
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Error approving appointment:', err);
      toast.error('Failed to approve appointment');
    } finally {
      setApproving(null);
    }
  };

  const handleRejectAppointment = async (appointmentId) => {
    setApproving(appointmentId);
    try {
      await updateAppointmentStatus(appointmentId, 'rejected');
      toast.success('❌ Appointment rejected');
      await fetchAppointments(currentUser.id);
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Error rejecting appointment:', err);
      toast.error('Failed to reject appointment');
    } finally {
      setApproving(null);
    }
  };

  const handleJoinCall = (appointment) => {
    setActiveCallAppointment(appointment);
    setShowVideoCall(true);
    setSelectedAppointment(null);
  };

  const handleCloseVideoCall = () => {
    setShowVideoCall(false);
    setActiveCallAppointment(null);
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.Profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show video call component if in call
  if (showVideoCall && activeCallAppointment) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        {/* Top bar with close button */}
        <div className="bg-black px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Video className="text-medical-600" size={24} />
            <div>
              <h2 className="text-lg font-black text-white">Live Consultation</h2>
              <p className="text-xs text-slate-400">with {activeCallAppointment.Profiles?.full_name}</p>
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
        <div className="flex-1 flex items-center justify-center p-4">
          <LiveConsult 
            appointmentId={activeCallAppointment.id}
            doctorId={currentUser?.id}
            patientId={activeCallAppointment.patient_id}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="animate-spin mx-auto mb-4 text-medical-600" size={40} />
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg">
            <Activity size={20} />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-800 uppercase">
              RetiSight
              <span className="text-blue-600 underline decoration-4 underline-offset-4 ml-1">
                CLINIC
              </span>
            </span>
            <p className="text-[10px] font-bold text-slate-400 leading-none mt-1">
              HOSPITAL MANAGEMENT SYSTEM
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell className="text-slate-400" size={20} />
            {stats.pending > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {stats.pending}
              </span>
            )}
          </div>
          <div className="h-8 w-px bg-slate-200 mx-2" />
          <button onClick={onLogout} className="text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto w-full p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">⏳ Pending Requests</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.pending}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <Clock />
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-blue-400">✅ Approved</p>
              <h3 className="text-3xl font-black mt-1">{stats.critical}</h3>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
              <CheckCircle />
            </div>
          </div>

          <div className="bg-medical-600 p-6 rounded-[2rem] shadow-xl text-white flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest">📊 Total</p>
              <h3 className="text-3xl font-black mt-1">{stats.total}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <TrendingUp />
            </div>
          </div>
        </div>

        {/* Appointment Queue */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-white overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-black text-slate-800">📋 Appointment Requests (Real-Time)</h2>
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <tr>
                  <th className="px-8 py-4">Patient</th>
                  <th className="px-8 py-4">Requested</th>
                  <th className="px-8 py-4">Scheduled For</th>
                  <th className="px-8 py-4">Reason</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map(apt => (
                    <motion.tr
                      key={apt.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`group hover:bg-slate-50/50 transition-all cursor-pointer ${
                        apt.status === 'pending' ? 'bg-amber-50/30' : ''
                      }`}
                      onClick={() => setSelectedAppointment(apt)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-sm">
                            {apt.Profiles?.full_name?.[0] || 'P'}
                          </div>
                          <span className="font-bold text-slate-700">{apt.Profiles?.full_name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-500">
                        {new Date(apt.created_at).toLocaleDateString()} <br />
                        <span className="text-xs">{new Date(apt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-600 font-medium">
                        {apt.scheduled_at ? (
                          <>
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(apt.scheduled_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-slate-500">
                              {new Date(apt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </>
                        ) : (
                          'TBD'
                        )}
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-600">
                        <div className="max-w-xs truncate" title={apt.reason}>
                          {apt.reason || 'No reason provided'}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                            apt.status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : apt.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {apt.status === 'pending' && '⏳ Pending'}
                          {apt.status === 'approved' && '✅ Approved'}
                          {apt.status === 'rejected' && '❌ Rejected'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {apt.status === 'pending' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppointment(apt);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-bold text-sm underline"
                          >
                            Review
                          </button>
                        ) : apt.status === 'approved' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinCall(apt);
                            }}
                            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black transition-all flex items-center gap-1 ml-auto"
                          >
                            <Video size={14} /> Join
                          </button>
                        ) : null}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-8 py-12 text-center text-slate-500">
                      No appointments
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Appointment Detail Modal */}
      <AnimatePresence>
        {selectedAppointment && selectedAppointment.status === 'pending' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAppointment(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-black text-slate-900 mb-6">
                Appointment Request Details
              </h3>

              <div className="space-y-4 mb-6">
                {/* Patient */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Patient</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-medical-100 rounded-full flex items-center justify-center text-medical-600 font-bold">
                      {selectedAppointment.Profiles?.full_name?.[0]}
                    </div>
                    <span className="font-bold text-slate-900">{selectedAppointment.Profiles?.full_name}</span>
                  </div>
                </div>

                {/* Requested At */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Request Submitted</p>
                  <p className="text-sm text-slate-900 font-medium">
                    {new Date(selectedAppointment.created_at).toLocaleDateString()} at{' '}
                    {new Date(selectedAppointment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Scheduled For */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">📅 Preferred Date & Time</p>
                  <p className="text-sm text-slate-900 font-medium">
                    {selectedAppointment.scheduled_at
                      ? `${new Date(selectedAppointment.scheduled_at).toLocaleDateString()} at ${new Date(selectedAppointment.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : 'Not specified'}
                  </p>
                </div>

                {/* Reason */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-2 flex items-center gap-2">
                    <FileText size={14} /> Reason for Visit
                  </p>
                  <p className="text-sm text-slate-900 font-medium">
                    {selectedAppointment.reason || 'No reason provided'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleRejectAppointment(selectedAppointment.id)}
                  disabled={approving === selectedAppointment.id}
                  className="flex-1 px-4 py-3 border-2 border-red-300 text-red-700 rounded-xl font-bold hover:bg-red-50 transition-all disabled:opacity-50"
                >
                  ❌ Reject
                </button>
                <button
                  onClick={() => handleApproveAppointment(selectedAppointment.id)}
                  disabled={approving === selectedAppointment.id}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-all ${
                    approving === selectedAppointment.id
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {approving === selectedAppointment.id ? '...' : '✅ Approve'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorDashboard;