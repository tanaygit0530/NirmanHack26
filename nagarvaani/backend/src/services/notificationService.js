const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

// Mock setup for no credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'mock@example.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'mock_pass'
  }
});

// Mock FCM setup
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
  });
}

exports.sendEmail = async function(to, subject, text, html) {
  try {
    if (process.env.GMAIL_USER === 'mock@example.com') {
      console.log(`Mock Email to ${to}, Subject: ${subject}`);
      return;
    }
    await transporter.sendMail({ from: process.env.GMAIL_USER, to, subject, text, html });
  } catch (error) {
    console.error("Email Service Error:", error);
  }
};

exports.sendPushNotification = async function(token, title, body, data = {}) {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      console.log(`Mock Push Notification to ${token}: ${title} - ${body}`);
      return;
    }
    await admin.messaging().send({
      token,
      notification: { title, body },
      data
    });
  } catch (error) {
    console.error("Push Notification Error:", error);
  }
};
