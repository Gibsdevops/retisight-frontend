import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { CheckCircle, Video, User, Clock, LogOut, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const DoctorDashboard = ({ onLogout }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
    
    // REALTIME: Listen for new appointments automatically
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', table: 'appointments' }, () => {
        fetchAppointments();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchAppointments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch appointments and join with profiles to get the patient name
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id, 
        status, 
        created_at,
        profiles!appointments_patient_id_fkey(full_name)
      `)
      .eq('doctor_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setAppointments(data);
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      alert(`Session ${newStatus === 'approved' ? 'Approved' : 'Updated'}`);
      fetchAppointments();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="bg-medical-600 p-2 rounded-lg"><Activity size={20} /></div>
          <span className="text-xl font-black tracking-tighter uppercase italic">RetiSight<span className="text-medical-600">MD</span></span>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-all font-bold text-sm">
          <LogOut size={18} /> Sign Out
        </button>
      </nav>

      <main className="max-w-5xl mx-auto w-full p-8 md:p-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900">Provider Dashboard</h1>
          <p className="text-slate-500">Review incoming screening requests and manage live consultations.</p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 uppercase text-xs tracking-widest">
                <Clock size={16}/> Active Queue
            </h2>
            <span className="bg-medical-600 text-white px-3 py-1 rounded-full text-[10px] font-black">{appointments.length} REQUESTS</span>
          </div>

          <div className="divide-y divide-slate-50">
            {appointments.map((apt) => (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                key={apt.id} 
                className="p-8 flex flex-col md:flex-row justify-between items-center hover:bg-slate-50/50 transition-all"
              >
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner">
                    <User size={32} />
                  </div>
                  <div>
                    <h4 className="font-black text-xl text-slate-900">{apt.profiles.full_name}</h4>
                    <p className="text-sm text-slate-400">Sent: {new Date(apt.created_at).toLocaleTimeString()}</p>
                    <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      apt.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${apt.status === 'approved' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                      {apt.status}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  {apt.status === 'pending' && (
                    <button 
                      onClick={() => updateStatus(apt.id, 'approved')}
                      className="flex-1 bg-emerald-500 text-white px-6 py-4 rounded-2xl font-black text-xs hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all"
                    >
                      APPROVE EXAM
                    </button>
                  )}
                  <button className="flex-1 bg-medical-600 text-white px-6 py-4 rounded-2xl font-black text-xs hover:bg-medical-700 shadow-lg shadow-medical-100 flex items-center justify-center gap-2 transition-all">
                    <Video size={16}/> {apt.status === 'approved' ? 'ENTER CALL' : 'PREVIEW'}
                  </button>
                </div>
              </motion.div>
            ))}

            {appointments.length === 0 && (
              <div className="p-20 text-center flex flex-col items-center">
                <ShieldAlert size={48} className="text-slate-200 mb-4" />
                <p className="text-slate-400 font-medium italic">Your queue is currently empty.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;