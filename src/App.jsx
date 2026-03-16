import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanSearch, Video, ArrowRight, Activity, LogOut } from 'lucide-react';
import { supabase } from './utils/supabaseClient';

// Import components
import Navbar from './components/Navbar';
import AIScreening from './components/AIScreening';
import LiveConsult from './components/LiveConsult';
import AppointmentList from './components/AppointmentList';
import Login from './components/Login';
import DoctorDashboard from './components/DoctorDashboard';

function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'patient' or 'doctor'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check current auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else setLoading(false);
    });

    // 2. Listen for login/logout changes
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

  // --- 1. LOADING STATE ---
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-medical-600 border-t-transparent"></div>
      </div>
    );
  }

  // --- 2. LOGIN STATE ---
  if (!session) {
    return <Login />;
  }

  // --- 3. DOCTOR VIEW ---
  if (userRole === 'doctor') {
    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="bg-medical-600 p-2 rounded-lg text-white">👁️</div>
            <span className="text-xl font-black text-slate-800 uppercase italic">RetiSight<span className="text-medical-600">MD</span></span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-500 font-bold text-sm transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </nav>
        <main className="max-w-7xl mx-auto p-8">
          <DoctorDashboard />
        </main>
      </div>
    );
  }

  // --- 4. PATIENT VIEW ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <main className="flex-grow max-w-7xl mx-auto w-full p-6 md:p-12">
        <AnimatePresence mode="wait">
          
          {/* PATIENT DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dash"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-10">
                <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Patient Portal</h1>
                <p className="text-slate-500 text-lg">Select a service to start your retinal assessment.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div 
                    onClick={() => setActiveTab('screening')} 
                    className="p-8 bg-white rounded-3xl shadow-xl border border-white hover:border-medical-600 cursor-pointer transition-all group"
                  >
                    <div className="bg-medical-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <ScanSearch className="text-medical-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">AI Screening</h3>
                    <p className="text-slate-400 text-sm mb-4">Instant analysis of fundus images.</p>
                    <div className="flex items-center text-medical-600 font-bold text-sm">
                      Start Now <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab('consult')} 
                    className="p-8 bg-white rounded-3xl shadow-xl border border-white hover:border-medical-600 cursor-pointer transition-all group"
                  >
                    <div className="bg-medical-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Video className="text-medical-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Live Consult</h3>
                    <p className="text-slate-400 text-sm mb-4">Secure link with your specialist.</p>
                    <div className="flex items-center text-medical-600 font-bold text-sm">
                      Enter Room <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>

                </div>

                <div className="lg:col-span-5">
                  <AppointmentList />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'screening' && (
            <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AIScreening />
            </motion.div>
          )}

          {activeTab === 'consult' && (
            <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LiveConsult />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="mt-auto p-10 text-center border-t border-slate-200">
        <p className="text-slate-300 text-xs font-bold tracking-widest uppercase">
          RetiSight Global • Patent Pending Technology
        </p>
      </footer>
    </div>
  );
}

export default App;