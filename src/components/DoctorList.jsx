import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { getAllDoctors, createAppointment } from '../utils/realtimeService';
import { User, Calendar, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentReason, setAppointmentReason] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initDoctors = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        const doctorList = await getAllDoctors();
        setDoctors(doctorList || []);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        toast.error('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };

    initDoctors();
  }, []);

  const openBookingModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDoctor(null);
    setAppointmentDate('');
    setAppointmentTime('');
    setAppointmentReason('');
  };

  const handleSubmitAppointment = async (e) => {
    e.preventDefault();

    if (!appointmentDate || !appointmentTime || !appointmentReason.trim()) {
      toast.error('⚠️ Please fill in all fields');
      return;
    }

    setSubmitting(true);

    try {
      // Properly format the datetime: "YYYY-MM-DD" + "HH:mm" = "YYYY-MM-DDTHH:mm:00"
      const appointmentDateTime = `${appointmentDate}T${appointmentTime}:00`;

      console.log('Submitting appointment:', {
        patient_id: currentUser.id,
        doctor_id: selectedDoctor.id,
        scheduled_at: appointmentDateTime,
        reason: appointmentReason
      });

      const appointmentData = {
        patient_id: currentUser.id,
        doctor_id: selectedDoctor.id,
        status: 'pending',
        scheduled_at: appointmentDateTime,
        reason: appointmentReason,
        notes: ''
      };

      await createAppointment(appointmentData);
      
      toast.success(`✅ Appointment request sent to Dr. ${selectedDoctor.full_name}!`);
      closeModal();
    } catch (err) {
      console.error('Error creating appointment:', err);
      toast.error(`❌ Failed to send appointment request: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-[2rem] shadow-xl">
        <p className="text-slate-500 text-center">Loading doctors...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 mb-4">Available Doctors</h3>

        {doctors.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {doctors.map(doctor => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl shadow-lg border-2 border-slate-100 hover:border-medical-600 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-medical-100 rounded-full flex items-center justify-center text-medical-600 font-bold">
                      <User size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Dr. {doctor.full_name}</h4>
                      <p className="text-xs text-slate-500">Ophthalmologist</p>
                    </div>
                  </div>

                  <button
                    onClick={() => openBookingModal(doctor)}
                    className="px-6 py-2 bg-medical-600 text-white rounded-xl font-bold hover:bg-medical-700 transition-all text-sm"
                  >
                    Book Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl">
            <p className="text-slate-500">No doctors available</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showModal && selectedDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Book Appointment</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    with Dr. {selectedDoctor.full_name}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitAppointment} className="space-y-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <Calendar size={16} className="inline mr-2" />
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-medical-600 focus:ring-2 focus:ring-medical-100 transition-all outline-none"
                    required
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <Clock size={16} className="inline mr-2" />
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-medical-600 focus:ring-2 focus:ring-medical-100 transition-all outline-none"
                    required
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Reason for Visit
                  </label>
                  <textarea
                    value={appointmentReason}
                    onChange={(e) => setAppointmentReason(e.target.value)}
                    placeholder="e.g., Diabetic retinopathy screening, eye pain, blurred vision..."
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-medical-600 focus:ring-2 focus:ring-medical-100 transition-all outline-none resize-none h-24"
                    required
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-all ${
                      submitting
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-medical-600 hover:bg-medical-700'
                    }`}
                  >
                    {submitting ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </form>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-700">
                  ℹ️ Your appointment request will be pending until the doctor approves it. You'll receive a notification once approved.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DoctorList;