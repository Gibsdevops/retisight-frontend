import React from 'react';
import { Calendar, Clock, CheckCircle2, Circle } from 'lucide-react';

const AppointmentList = () => {
  // Mock data for now
  const appointments = [
    { id: 1, doctor: "Dr. Sarah Johnson", date: "Mar 18, 2026", time: "10:30 AM", status: "Approved" },
    { id: 2, doctor: "Dr. James Mukasa", date: "Mar 20, 2026", time: "02:00 PM", status: "Pending" },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Calendar size={20} className="text-medical-600" /> Upcoming Consultations
      </h3>
      
      <div className="space-y-4">
        {appointments.map((apt) => (
          <div key={apt.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <Clock size={18} className="text-slate-400" />
              </div>
              <div>
                <p className="font-bold text-slate-900">{apt.doctor}</p>
                <p className="text-xs text-slate-500">{apt.date} • {apt.time}</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
              apt.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {apt.status === 'Approved' ? <CheckCircle2 size={12} /> : <Circle size={12} />}
              {apt.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentList;