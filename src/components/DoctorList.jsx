import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { User, Send } from 'lucide-react';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('role', 'doctor');
      setDoctors(data || []);
      setLoading(false);
    };
    fetchDoctors();
  }, []);

  const requestAppointment = async (doctor_id) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('appointments').insert([
      { patient_id: user.id, doctor_id: doctor_id, status: 'pending' }
    ]);
    if (error) alert("Error booking appointment");
    else alert("Request sent to doctor!");
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-white">
      <h3 className="text-lg font-bold text-slate-800 mb-4 tracking-tight text-center uppercase">Available Specialists</h3>
      <div className="space-y-3">
        {doctors.map(doc => (
          <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-full text-medical-600 shadow-sm"><User size={18}/></div>
              <span className="font-bold text-slate-700">{doc.full_name}</span>
            </div>
            <button 
              onClick={() => requestAppointment(doc.id)}
              className="p-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition-all shadow-md"
            >
              <Send size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorList;