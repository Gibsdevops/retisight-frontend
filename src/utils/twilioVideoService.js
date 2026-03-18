/**
 * Generate Google Meet link from appointment ID
 */
export const generateGoogleMeetLink = (appointmentId) => {
  // Create a unique meeting ID from appointment ID
  // Remove special characters and convert to lowercase
  const meetingId = `retisight-${appointmentId}`
    .replace(/[^a-z0-9-]/gi, '')
    .toLowerCase()
    .substring(0, 25);
  
  return `https://meet.google.com/${meetingId}`;
};

/**
 * Open Google Meet in new window
 */
export const joinGoogleMeet = (appointmentId) => {
  const meetLink = generateGoogleMeetLink(appointmentId);
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
 * Share meeting link via email (you can implement this)
 */
export const shareMeetingLink = (meetLink, recipientEmail) => {
  const subject = 'Join My Medical Consultation';
  const body = `Please join my consultation using this Google Meet link:\n\n${meetLink}`;
  const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;
};