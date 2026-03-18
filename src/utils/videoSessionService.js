import { supabase } from './supabaseClient';

/**
 * Start video session - doctor updates appointment with their Peer ID
 */
export const startVideoSession = async (appointmentId, doctorPeerId) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        doctor_peer_id: doctorPeerId,
        video_started_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select();

    if (error) throw error;
    console.log('✅ Video session started:', data);
    return data;
  } catch (error) {
    console.error('❌ Error starting video session:', error);
    throw error;
  }
};

/**
 * Update patient peer ID when they join
 */
export const updatePatientPeerId = async (appointmentId, patientPeerId) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        patient_peer_id: patientPeerId
      })
      .eq('id', appointmentId)
      .select();

    if (error) throw error;
    console.log('✅ Patient Peer ID updated:', data);
    return data;
  } catch (error) {
    console.error('❌ Error updating patient Peer ID:', error);
    throw error;
  }
};

/**
 * Get appointment video details (for both doctor and patient)
 */
export const getVideoSessionDetails = async (appointmentId) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('doctor_peer_id, patient_peer_id, video_started_at, video_ended_at')
      .eq('id', appointmentId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error fetching video session details:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time video session updates
 */
export const subscribeToVideoSession = (appointmentId, onUpdate) => {
  const subscription = supabase
    .channel(`video-session:${appointmentId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'appointments',
        filter: `id=eq.${appointmentId}`
      },
      (payload) => {
        console.log('📹 Video session updated:', payload.new);
        onUpdate(payload.new);
      }
    )
    .subscribe();

  return subscription;
};

/**
 * End video session
 */
export const endVideoSession = async (appointmentId) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        video_ended_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select();

    if (error) throw error;
    console.log('✅ Video session ended');
    return data;
  } catch (error) {
    console.error('❌ Error ending video session:', error);
    throw error;
  }
};