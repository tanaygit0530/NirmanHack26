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
  },
  es: {
    translation: {
      "Welcome": "Bienvenido a NagarVaani",
      "FileComplaint": "Presentar una queja",
      "TrackComplaint": "Seguimiento de queja",
      "Login": "Iniciar sesión",
      "Register": "Registrarse",
    }
  },
  fr: {
    translation: {
      "Welcome": "Bienvenue à NagarVaani",
      "FileComplaint": "Déposer une plainte",
      "TrackComplaint": "Suivre la plainte",
      "Login": "Connexion",
      "Register": "S'inscrire",
    }
  },
  de: {
    translation: {
      "Welcome": "Willkommen bei NagarVaani",
      "FileComplaint": "Beschwerde einreichen",
      "TrackComplaint": "Beschwerde verfolgen",
      "Login": "Anmelden",
      "Register": "Registrieren",
    }
  },
  ja: {
    translation: {
      "Welcome": "NagarVaaniへようこそ",
      "FileComplaint": "苦情を申し立てる",
      "TrackComplaint": "苦情を追跡する",
      "Login": "ログイン",
      "Register": "登録",
    }
  },
  ar: {
    translation: {
      "Welcome": "مرحباً بكم في NagarVaani",
      "FileComplaint": "تقديم شكوى",
      "TrackComplaint": "تتبع الشكوى",
      "Login": "تسجيل الدخول",
      "Register": "تسجيل",
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
