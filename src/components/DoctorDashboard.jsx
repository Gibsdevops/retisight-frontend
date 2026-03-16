import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { CheckCircle, Video, User, Clock, LogOut, Activity, Bell, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorDashboard = ({ onLogout }) => {
  const [appointments, setAppointments] = useState([]);
  const [newAlert, setNewAlert] = useState(false);

  useEffect(() => {
    fetchAppointments();
    
    const channel = supabase
      .channel('live-queue')
      .on('postgres_changes', { event: '*', table: 'appointments' }, () => {
        fetchAppointments();
        setNewAlert(true);
        setTimeout(() => setNewAlert(false), 5000); 
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchAppointments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Use lowercase 'profiles' and match the fkey
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id, 
        status, 
        created_at,
        profiles!appointments_patient_id_fkey (
          full_name
        )
      `)
      .eq('doctor_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setAppointments(data || []);
  };

  const approve = async (id) => {
    await supabase.from('appointments').update({ status: 'approved' }).eq('id', id);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-medical-900 p-2.5 rounded-2xl text-white shadow-xl"><Activity size={22} /></div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic text-left">RetiSight<span className="text-medical-600 text-sm align-top ml-1 text-left">CLINIC</span></span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <Bell size={24} className={newAlert ? "text-red-500 animate-bounce" : "text-slate-300"} />
            {newAlert && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-4 border-white"></span>}
          </div>
          <button onClick={onLogout} className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto w-full p-8">
        <div className="mb-10 text-left">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Diagnostic Queue</h1>
            <p className="text-slate-400 font-medium text-lg mt-1">Review patient requests and launch eye examinations.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {appointments.map((apt) => (
            <motion.div 
              key={apt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col md:flex-row justify-between items-center"
            >
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <User size={32} />
                </div>
                <div className="text-left">
                  <h4 className="text-2xl font-black text-slate-800">{apt.profiles?.full_name || "New Patient"}</h4>
                  <p className="text-slate-400 text-xs mt-1 uppercase font-bold tracking-widest">
                    Request sent {new Date(apt.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-6 md:mt-0 w-full md:w-auto">
                {apt.status === 'pending' ? (
                  <button onClick={() => approve(apt.id)} className="flex-1 bg-medical-600 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:scale-105 transition-all">APPROVE EXAM</button>
                ) : (
                  <button className="flex-1 bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-2"><Video size={18}/> JOIN STREAM</button>
                )}
              </div>
            </motion.div>
          ))}
          {appointments.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center opacity-40">
              <ShieldAlert size={64} className="text-slate-200 mb-4" />
              <p className="text-slate-400 font-medium italic">Your queue is empty.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;