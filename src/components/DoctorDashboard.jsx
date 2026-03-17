import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { CheckCircle, Video, User, Clock, LogOut, Activity, Bell, Search, Filter, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const DoctorDashboard = ({ onLogout }) => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ pending: 0, critical: 0, total: 0 });

  useEffect(() => {
    fetchAppointments();
    // Realtime setup (keep existing)
  }, []);

  const fetchAppointments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('appointments')
      .select(`id, status, created_at, Profiles!appointments_patient_id_fkey(full_name)`)
      .eq('doctor_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
        setAppointments(data);
        setStats({
            pending: data.filter(a => a.status === 'pending').length,
            critical: data.filter(a => a.status === 'approved').length, // Placeholder logic
            total: data.length
        });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased">
      {/* Sidebar-style Nav */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg"><Activity size={20}/></div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-800 uppercase">RetiSight<span className="text-blue-600 underline decoration-4 underline-offset-4 ml-1">CLINIC</span></span>
            <p className="text-[10px] font-bold text-slate-400 leading-none mt-1">HOSPITAL MANAGEMENT SYSTEM</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
                {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />)}
            </div>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <button onClick={onLogout} className="text-slate-400 hover:text-red-500 transition-colors"><LogOut size={20}/></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto w-full p-8">
        {/* 1. Clinical Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Waiting</p>
                    <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.pending}</h3>
                </div>
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600"><Clock /></div>
            </div>
            <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-blue-400">Total Screened</p>
                    <h3 className="text-3xl font-black mt-1">{stats.total}</h3>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400"><TrendingUp /></div>
            </div>
            <div className="bg-red-500 p-6 rounded-[2rem] shadow-xl text-white flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold opacity-80 uppercase tracking-widest text-white">Critical Alerts</p>
                    <h3 className="text-3xl font-black mt-1">{stats.critical}</h3>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white"><AlertTriangle /></div>
            </div>
        </div>

        {/* 2. Patient Queue with Search/Filter */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-white overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-black text-slate-800">Patient Triage Queue</h2>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-3 text-slate-400" size={18}/>
                        <input type="text" placeholder="Search patient name..." className="pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm w-full focus:ring-2 focus:ring-blue-500 transition-all"/>
                    </div>
                    <button className="bg-slate-50 p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-all"><Filter size={20}/></button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        <tr>
                            <th className="px-8 py-4">Patient Name</th>
                            <th className="px-8 py-4">Requested</th>
                            <th className="px-8 py-4">Clinical Status</th>
                            <th className="px-8 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {appointments.map(apt => (
                            <tr key={apt.id} className="group hover:bg-slate-50/50 transition-all">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold">{apt.Profiles.full_name[0]}</div>
                                        <span className="font-bold text-slate-700">{apt.Profiles.full_name}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-sm text-slate-500">
                                    {new Date(apt.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                        apt.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {apt.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    {apt.status === 'pending' ? (
                                        <button className="bg-medical-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-medical-700 transition-all shadow-lg shadow-blue-100">Approve</button>
                                    ) : (
                                        <button className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center gap-2 ml-auto shadow-lg shadow-slate-200">
                                            <Video size={14}/> Enter Room
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;