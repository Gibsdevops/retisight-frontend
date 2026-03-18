import { supabase } from './supabaseClient';

/**
 * Subscribe to real-time appointment changes for a doctor
 * Triggers callback when patient books new appointment
 */
export const subscribeToDoctorAppointments = (doctorId, onAppointmentChange) => {
  const subscription = supabase
    .channel(`doctor-appointments:${doctorId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `doctor_id=eq.${doctorId}`,
      },
      (payload) => {
        console.log('Real-time appointment update:', payload);
        onAppointmentChange(payload);
      }
    )
    .subscribe();

  return subscription;
};

/**
 * Subscribe to real-time status updates for a patient's appointment
 * Triggers callback when doctor approves/rejects
 */
export const subscribeToPatientAppointmentStatus = (patientId, onStatusChange) => {
  const subscription = supabase
    .channel(`patient-appointments:${patientId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'appointments',
        filter: `patient_id=eq.${patientId}`,
      },
      (payload) => {
        console.log('Appointment status changed:', payload);
        onStatusChange(payload);
      }
    )
    .subscribe();

  return subscription;
};

/**
 * Create a new appointment
 */
export const createAppointment = async (appointmentData) => {
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointmentData])
    .select();

  if (error) throw error;
  return data;
};

/**
 * Update appointment status (doctor approve/reject)
 */
export const updateAppointmentStatus = async (appointmentId, status) => {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)
    .select();

  if (error) throw error;
  return data;
};

/**
 * Get all doctors for patient to book appointments
 */
export const getAllDoctors = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', 'doctor');

  if (error) throw error;
  return data;
};