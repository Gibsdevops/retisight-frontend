import { supabase } from './supabaseClient';

/**
 * Subscribe to real-time appointment changes for a doctor
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

/**
 * Get patient appointments WITH doctor profile info (FIXED)
 */
export const getPatientAppointments = async (patientId) => {
  // First get appointments
  const { data: appointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select('id, status, created_at, doctor_id, scheduled_at, reason, notes')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (appointmentsError) throw appointmentsError;

  // Then get doctor profiles separately
  const doctorIds = [...new Set(appointments.map(a => a.doctor_id))];
  
  if (doctorIds.length === 0) return [];

  const { data: doctors, error: doctorsError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', doctorIds);

  if (doctorsError) throw doctorsError;

  // Merge data
  return appointments.map(apt => ({
    ...apt,
    Profiles: doctors.find(d => d.id === apt.doctor_id)
  }));
};

/**
 * Get doctor appointments WITH patient profile info (FIXED)
 */
export const getDoctorAppointments = async (doctorId) => {
  // First get appointments
  const { data: appointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select('id, status, created_at, patient_id, scheduled_at, reason, notes')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  if (appointmentsError) throw appointmentsError;

  // Then get patient profiles separately
  const patientIds = [...new Set(appointments.map(a => a.patient_id))];
  
  if (patientIds.length === 0) return [];

  const { data: patients, error: patientsError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', patientIds);

  if (patientsError) throw patientsError;

  // Merge data
  return appointments.map(apt => ({
    ...apt,
    Profiles: patients.find(p => p.id === apt.patient_id)
  }));
};