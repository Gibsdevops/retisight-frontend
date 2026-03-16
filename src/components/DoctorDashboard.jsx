import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { CheckCircle, Video, User } from 'lucide-react';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const { data } = await supabase
        .from('appointments')
        .select(`*, profiles:patient_id(full_name)`)
        .eq('status', 'pending');
      setAppointments(data);
    };
    fetchAppointments();
  }, []);

  const approve = async (id) => {
    await supabase.from('appointments').update({ status: 'approved' }).eq('id', id);
    alert("Appointment Approved!");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-slate-800">Doctor's Command Center</h1>
      <div className="grid grid-cols-1 gap-4">
        {appointments.map(apt => (
          <div key={apt.id} className="bg-white p-6 rounded-2xl shadow-md flex justify-between items-center border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-medical-50 rounded-full text-medical-600"><User /></div>
              <div>
                <h4 className="font-bold text-lg">{apt.profiles.full_name}</h4>
                <p className="text-sm text-slate-400">Requesting Retinal Screening</p>
              </div>
            </div>
            <div className="flex gap-3">
               <button onClick={() => approve(apt.id)} className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-600">
                  <CheckCircle size={18}/> Approve
               </button>
               <button className="bg-medical-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-medical-700">
                  <Video size={18}/> Join Stream
               </button>
            </div>
          </div>
        ))}
        {appointments.length === 0 && <p className="text-slate-400 italic">No pending appointment requests.</p>}
      </div>
    </div>
  );
};

export default DoctorDashboard;