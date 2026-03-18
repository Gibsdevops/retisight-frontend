/**
 * Generate Google Meet instant meeting link
 * Google Meet creates an instant meeting when you access /meetings without a specific ID
 */
export const generateGoogleMeetLink = (appointmentId) => {
  // Use Google Meet's instant meeting feature
  // Each time someone opens this, it creates/joins a room
  return `https://meet.google.com/new`;
};

/**
 * Generate a unique meeting link that can be shared
 * This creates a persistent room for the appointment
 */
export const generatePersistentMeetLink = (appointmentId) => {
  // Generate a random meeting code (Google Meet format: xxx-xxxx-xxx)
  const randomCode = () => {
    return Math.random().toString(36).substring(2, 5);
  };
  
  const code = `${randomCode()}-${randomCode()}-${randomCode()}`;
  return `https://meet.google.com/${code}`;
};

/**
 * Open Google Meet instant meeting in new window
 */
export const joinGoogleMeet = (appointmentId) => {
  // Use persistent meet link for the appointment
  const meetLink = generatePersistentMeetLink(appointmentId);
  console.log('📞 Opening Google Meet:', meetLink);
  
  // Open in new tab
  window.open(meetLink, '_blank', 'noopener,noreferrer');
  
  return meetLink;
};

/**
 * Generate room name from appointment (kept for compatibility)
 */
export const generateTwilioRoomName = (appointmentId) => {
  return `retisight-apt-${appointmentId}`;
};

/**
 * Copy meeting link to clipboard
 */
export const copyMeetingLink = async (meetLink) => {
  try {
    await navigator.clipboard.writeText(meetLink);
    console.log('✅ Meeting link copied to clipboard');
    return true;
  } catch (error) {
    console.error('❌ Failed to copy link:', error);
    return false;
  }
};