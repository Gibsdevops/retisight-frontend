import { supabase } from './supabaseClient';

/**
 * End video session in database
 */
export const endVideoSession = async (appointmentId) => {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({
        video_session_ended_at: new Date().toISOString(),
        status: 'completed'
      })
      .eq('id', appointmentId);

    if (error) throw error;

    console.log('Video session ended for appointment:', appointmentId);
    return true;
  } catch (error) {
    console.error('Error ending video session:', error);
    throw error;
  }
};

/**
 * Start video session in database
 */
export const startVideoSession = async (appointmentId) => {
  try {
    const { error } = await supabase
      .from('appointments')
      .update({
        video_session_started_at: new Date().toISOString(),
        status: 'in_progress'
      })
      .eq('id', appointmentId);

    if (error) throw error;

    console.log('Video session started for appointment:', appointmentId);
    return true;
  } catch (error) {
    console.error('Error starting video session:', error);
    throw error;
  }
};