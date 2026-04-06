import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Placeholder dictionaries
const resources = {
  en: {
    translation: {
      "Welcome": "Welcome to NagarVaani",
      "FileComplaint": "File a Complaint",
      "TrackComplaint": "Track Complaint",
      "Login": "Login",
      "Register": "Register",
      // ... we will populate more later
    }
  },
  hi: {
    translation: {
      "Welcome": "NagarVaani में आपका स्वागत है",
      "FileComplaint": "शिकायत दर्ज करें",
      "TrackComplaint": "शिकायत ट्रैक करें",
      "Login": "लॉगिन करें",
      "Register": "रजिस्टर करें",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
