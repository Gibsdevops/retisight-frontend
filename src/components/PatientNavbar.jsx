import React from 'react';
import { Eye, LogOut } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const PatientNavbar = ({ activeTab, setActiveTab, onLogout }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
        <div className="bg-medical-600 p-2 rounded-lg text-white shadow-lg">
          <Eye size={20} />
        </div>
        <span className="text-xl font-black text-slate-800 uppercase">RetiSight AI</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl mr-4">
          {['dashboard', 'screening', 'consult'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${
                activeTab === tab ? 'bg-white text-medical-600 shadow-sm' : 'text-slate-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button 
          onClick={handleLogout} 
          className="text-slate-400 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default PatientNavbar;