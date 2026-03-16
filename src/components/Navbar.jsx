import React from 'react';
import { Eye } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
        <div className="bg-medical-600 p-2 rounded-lg text-white shadow-lg shadow-medical-100">
          <Eye size={20} />
        </div>
        <span className="text-xl font-black tracking-tight text-slate-800 uppercase">
          RetiSight<span className="text-medical-600">AI</span>
        </span>
      </div>
      
      <div className="flex bg-slate-100 p-1 rounded-xl">
        {['dashboard', 'screening', 'consult'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${
              activeTab === tab 
                ? 'bg-white text-medical-600 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;