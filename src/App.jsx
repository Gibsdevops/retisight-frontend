import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanSearch, Video, ArrowRight, Activity, LogOut, ShieldAlert } from 'lucide-react';
import { supabase } from './utils/supabaseClient';

// Components
import Navbar from './components/Navbar';
import AIScreening from './components/AIScreening';
import LiveConsult from './components/LiveConsult';
import AppointmentList from './components/AppointmentList';
import DoctorList from './components/DoctorList'; // New: List of doctors for patients
import Login from './components/Login';
import DoctorDashboard from './components/DoctorDashboard';

function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else setLoading(false);
    });

    // Listen for Auth changes (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else {
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      if (data) setUserRole(data.role);
    } catch (err) {
      console.error("Role fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-medical-600 border-t-transparent"></div>
        <p className="text-slate-400 font-bold animate-pulse text-xs uppercase tracking-widest">Securing Connection</p>
      </div>
    </div>
  );

  if (!session) return <Login />;

  // --- DOCTOR VIEW ---
  if (userRole === 'doctor') {
    return <DoctorDashboard onLogout={handleLogout} />;
  }

  // --- PATIENT VIEW ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto w-full p-6 md:p-12">
        <AnimatePresence mode="wait">
          
          {activeTab === 'dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="mb-10">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Patient Portal</h1>
                <p className="text-slate-500 text-lg">Manage your retinal health and expert consultations.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Action Cards */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div onClick={() => setActiveTab('screening')} className="p-8 bg-white rounded-3xl shadow-xl border border-white hover:border-medical-600 cursor-pointer transition-all group">
                      <div className="bg-medical-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <ScanSearch className="text-medical-600" size={28} />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-slate-800">AI Screening</h3>
                      <p className="text-slate-400 text-sm mb-4 leading-relaxed">Analyze your fundus scan using deep learning.</p>
                      <div className="flex items-center text-medical-600 font-bold text-sm">Start Analysis <ArrowRight size={16} className="ml-2"/></div>
                    </div>

                    <div onClick={() => setActiveTab('consult')} className="p-8 bg-white rounded-3xl shadow-xl border border-white hover:border-medical-600 cursor-pointer transition-all group">
                      <div className="bg-medical-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Video className="text-medical-600" size={28} />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-slate-800">Live Consult</h3>
                      <p className="text-slate-400 text-sm mb-4 leading-relaxed">Connect to a specialist for a real-time exam.</p>
                      <div className="flex items-center text-medical-600 font-bold text-sm">Join Room <ArrowRight size={16} className="ml-2"/></div>
                    </div>
                  </div>

                  {/* REAL DATA: List of Doctors in the DB */}
                  <DoctorList /> 
                </div>

                {/* Right: Appointment Status */}
                <div className="lg:col-span-4">
                  <AppointmentList />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'screening' && <motion.div key="s" initial={{opacity:0}} animate={{opacity:1}}><AIScreening /></motion.div>}
          {activeTab === 'consult' && <motion.div key="c" initial={{opacity:0}} animate={{opacity:1}}><LiveConsult /></motion.div>}

        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;