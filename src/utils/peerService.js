import Peer from 'peerjs';

let peer = null;

/**
 * Initialize PeerJS peer connection
 */
export const initializePeer = () => {
  return new Promise((resolve, reject) => {
    if (peer && !peer.destroyed) {
      resolve(peer);
      return;
    }

    peer = new Peer({
      config: {
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302'] },
          { urls: ['stun:stun1.l.google.com:19302'] }
        ]
      }
    });

    peer.on('open', (id) => {
      console.log('✅ PeerJS initialized with ID:', id);
      resolve(peer);
    });

    peer.on('error', (error) => {
      console.error('❌ PeerJS error:', error);
      reject(error);
    });
  });
};

/**
 * Get peer ID
 */
export const getPeerId = () => {
  return peer?.id || null;
};

/**
 * Initiate video call
 */
export const initiateCall = async (remoteUserId, localStream) => {
  try {
    if (!peer) {
      throw new Error('Peer not initialized');
    }

    console.log('📞 Initiating call to:', remoteUserId);
    const call = peer.call(remoteUserId, localStream);

    return call;
  } catch (error) {
    console.error('❌ Error initiating call:', error);
    throw error;
  }
};

/**
 * Answer incoming call
 */
export const answerCall = (call, localStream) => {
  try {
    console.log('📞 Answering call from:', call.peer);
    call.answer(localStream);
    return call;
  } catch (error) {
    console.error('❌ Error answering call:', error);
    throw error;
  }
};

/**
 * Close peer connection
 */
export const closePeer = () => {
  if (peer && !peer.destroyed) {
    peer.destroy();
    peer = null;
    console.log('👋 Peer connection closed');
  }
};

/**
 * Get peer instance
 */
export const getPeer = () => {
  return peer;
};