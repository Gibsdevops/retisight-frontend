import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Clock, CheckCircle2, Circle, Calendar, User } from 'lucide-react';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMyAppointments = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
        .from('appointments')
        .select(`
            id, 
            status, 
            created_at,
            Profiles!appointments_doctor_id_fkey (
                full_name
            )
        `)
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });

        if (error) {
            console.error("Patient View Query Error:", error.message);
        } else {
            setAppointments(data || []);
        }
        setLoading(false);
    };

    getMyAppointments();
    
    // Auto-refresh when doctor approves
    const sub = supabase.channel('patient-updates')
      .on('postgres_changes', { event: 'UPDATE', table: 'appointments' }, () => getMyAppointments())
      .subscribe();

    return () => supabase.removeChannel(sub);
  }, []);

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tighter">
        <Calendar size={20} className="text-medical-600" /> My Consultations
      </h3>
      
      <div className="space-y-4">
        {appointments.map((apt) => (
          <div key={apt.id} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex justify-between items-center group hover:bg-white transition-all">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm border border-slate-100 group-hover:text-medical-600 transition-colors">
                  <User size={20} />
               </div>
               <div>
                  {/* FIXED: Profiles (Capital P) */}
                  <p className="font-bold text-slate-900 leading-none">{apt.Profiles?.full_name || "Specialist"}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">
                    {new Date(apt.created_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                  </p>
               </div>
            </div>
            
            <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ${
              apt.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {apt.status === 'approved' ? <CheckCircle2 size={12} /> : <Circle size={12} className="animate-pulse" />}
              {apt.status}
            </div>
          </div>
        ))}

        {appointments.length === 0 && !loading && (
          <div className="py-10 text-center">
             <p className="text-slate-300 text-sm font-medium italic">No consultation history.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentList;