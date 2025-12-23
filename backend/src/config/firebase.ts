/**
 * Firebase Configuration
 * Push notifications setup with Firebase Cloud Messaging
 */

import * as admin from 'firebase-admin';

let isFirebaseInitialized = false;

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase credentials are provided
    const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL } = process.env;
    
    if (!FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL) {
      console.warn('⚠️  Firebase credentials not configured. Push notifications will be disabled.');
      console.warn('   To enable Firebase, set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL environment variables.');
      return;
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: FIREBASE_PROJECT_ID,
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: FIREBASE_CLIENT_EMAIL,
        }),
      });
      isFirebaseInitialized = true;
      console.log('✅ Firebase initialized successfully');
    }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    console.warn('   Push notifications will be disabled. Please check your Firebase configuration.');
  }
};

initializeFirebase();

/**
 * Send push notification to a user
 */
export const sendPushNotification = async (
  token: string,
  notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }
) => {
  if (!isFirebaseInitialized) {
    console.warn('⚠️  Firebase not initialized. Skipping push notification.');
    return null;
  }

  try {
    const message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data,
      android: {
        priority: 'high' as const,
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    throw error;
  }
};

/**
 * Send push notification to multiple users
 */
export const sendMulticastNotification = async (
  tokens: string[],
  notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }
) => {
  if (!isFirebaseInitialized) {
    console.warn('⚠️  Firebase not initialized. Skipping multicast notification.');
    return null;
  }

  try {
    const message = {
      tokens,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data,
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(`✅ ${response.successCount} notifications sent successfully`);
    return response;
  } catch (error) {
    console.error('❌ Error sending notifications:', error);
    throw error;
  }
};

export default admin;
