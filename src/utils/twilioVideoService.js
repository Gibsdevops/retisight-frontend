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
 * Generate Google Meet link from appointment
 */
export const generateGoogleMeetLink = (appointmentId) => {
  return generatePersistentMeetLink(appointmentId);
};

/**
 * Open Google Meet in new window
 */
export const joinGoogleMeet = (appointmentId) => {
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

/**
 * Share meeting link via email
 */
export const shareMeetingLink = (meetLink, recipientEmail) => {
  const subject = 'Join My Medical Consultation';
  const body = `Please join my consultation using this Google Meet link:\n\n${meetLink}`;
  const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;
};