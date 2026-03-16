import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanSearch, Video, ArrowRight, LogOut, Activity, ChevronLeft, Loader2 } from 'lucide-react'; 
import { supabase } from './utils/supabaseClient';

// Components
import Navbar from './components/Navbar';
import AIScreening from './components/AIScreening';
import LiveConsult from './components/LiveConsult';
import AppointmentList from './components/AppointmentList';
import DoctorList from './components/DoctorList';
import Login from './components/Login';
import DoctorDashboard from './components/DoctorDashboard';
import Home from './components/Home';

function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [showPortal, setShowPortal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else setLoading(false);
    });

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
    setLoading(true);
    try {
      // Changed to lowercase 'profiles'
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (data) {
        setUserRole(data.role);
        setShowPortal(true);
      }
    } catch (err) {
      console.error("Role Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUserRole(null);
    setSession(null);
    setShowPortal(false);
    setLoading(false);
  };

  // --- LOGIC GATES ---

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-medical-600 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">RetiSight System Initializing</p>
      </div>
    );
  }

  if (!session && !showPortal) {
    return <Home onStart={() => setShowPortal(true)} />;
  }

  if (!session && showPortal) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-slate-50">
        <button onClick={() => setShowPortal(false)} className="absolute top-8 left-8 text-sm font-bold text-slate-400 hover:text-medical-600 flex items-center gap-2">
          <ChevronLeft size={16}/> Back to Home
        </button>
        <Login />
      </div>
    );
  }

  // DOCTOR VIEW
  if (session && userRole === 'doctor') {
    return <DoctorDashboard onLogout={handleLogout} />;
  }

  // PATIENT VIEW
  if (session && userRole === 'patient') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 text-left">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
        <main className="max-w-7xl mx-auto w-full p-6 md:p-12">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h1 className="text-4xl font-black text-slate-900 mb-10 tracking-tight">Patient Portal</h1>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div onClick={() => setActiveTab('screening')} className="p-8 bg-white rounded-[2rem] shadow-xl border border-white hover:border-medical-600 cursor-pointer group transition-all">
                        <div className="bg-medical-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-medical-600"><Activity size={24}/></div>
                        <h3 className="font-bold text-lg">AI Screening</h3>
                        <p className="text-slate-400 text-xs mt-2 text-left">Instant Deep Learning Eye Analysis</p>
                      </div>
                      <div onClick={() => setActiveTab('consult')} className="p-8 bg-white rounded-[2rem] shadow-xl border border-white hover:border-medical-600 cursor-pointer group transition-all">
                        <div className="bg-medical-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-medical-600"><Video size={24}/></div>
                        <h3 className="font-bold text-lg">Live Consult</h3>
                        <p className="text-slate-400 text-xs mt-2 text-left">Connect with your eye specialist</p>
                      </div>
                    </div>
                    <DoctorList />
                  </div>
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

  // FALLBACK
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center text-center p-10">
      <Activity size={48} className="text-red-500 mb-4" />
      <h1 className="text-2xl font-bold">Account Role Mismatch</h1>
      <p className="text-slate-500 mt-2">We couldn't find your medical role. Please try logging out and in again.</p>
      <button onClick={handleLogout} className="mt-6 bg-medical-600 text-white px-6 py-2 rounded-xl">Logout</button>
    </div>
  );
}

export default App;