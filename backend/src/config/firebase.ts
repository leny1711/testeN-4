/**
 * Firebase Configuration
 * Push notifications setup with Firebase Cloud Messaging
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      console.log('✅ Firebase initialized successfully');
    }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
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
