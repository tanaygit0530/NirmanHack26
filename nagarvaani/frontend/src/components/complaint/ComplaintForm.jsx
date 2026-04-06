import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, MapPin, Shield, Check, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'WATER', name: 'Water', icon: '💧', color: 'border-blue-500' },
  { id: 'ELECTRICITY', name: 'Electricity', icon: '⚡', color: 'border-yellow-500' },
  { id: 'ROADS', name: 'Roads', icon: '🛣️', color: 'border-gray-500' },
  { id: 'GARBAGE', name: 'Garbage', icon: '🗑️', color: 'border-emerald-500' },
  { id: 'PARKS', name: 'Parks', icon: '🌳', color: 'border-green-500' },
  { id: 'PUBLIC_SAFETY', name: 'Public Safety', icon: '🛡️', color: 'border-red-500' },
  { id: 'OTHER', name: 'Other', icon: '📋', color: 'border-purple-500' },
];

export default function ComplaintForm({ onSubmit, isSubmitting }) {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    lat: null,
    lng: null,
    location_text: '',
    is_anonymous: false
  });
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      
      // Match language
      rec.lang = i18n.language === 'hi' ? 'hi-IN' : 
                 i18n.language === 'mr' ? 'mr-IN' : 'en-IN';

      rec.onresult = (event) => {
        let finalTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setFormData(prev => ({ ...prev, description: prev.description + ' ' + finalTranscript }));
        }
      };
      
      rec.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [i18n.language]);

  const toggleListen = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      setFormData(prev => ({ ...prev, description: prev.description + (prev.description ? ' ' : '') })); // Add space before appending
      recognition?.start();
      setIsListening(true);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    toast.loading("Acquiring GPS Signal...", { id: 'gps-loading' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss('gps-loading');
        setFormData(prev => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }));
        toast.success("GPS Lock Acquired ✓");
      },
      (error) => {
        toast.dismiss('gps-loading');
        console.warn("GPS Error:", error.message);
        
        // Development/Hackathon Fallback: If GPS fails on localhost, provide mock data
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
           setFormData(prev => ({
             ...prev,
             lat: 19.0760, // Mock Mumbai Lat
             lng: 72.8777  // Mock Mumbai Lng
           }));
           toast.success("DevMode: Using Simulated Location");
        } else {
           toast.error("Unable to retrieve GPS lock. Please enter location manually.");
        }
      },
      options
    );
  };

  const nextStep = () => {
    if (step === 1 && !formData.category) return toast.error("Select a category");
    if (step === 2 && formData.description.trim().length < 10) return toast.error("Description must be at least 10 words");
    setStep(s => s + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.lat && !formData.location_text) {
      return toast.error("Location is required");
    }
    onSubmit(formData);
  };

  return (
    <div className="bg-surface rounded-2xl card-shadow max-w-2xl mx-auto overflow-hidden">
      <div className="flex border-b border-border">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`flex-1 text-center py-4 text-sm font-medium ${step >= s ? 'bg-navy text-white' : 'bg-gray-50 text-text-secondary'}`}>
            Step {s}
          </div>
        ))}
      </div>

      <div className="p-8">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-sora font-bold text-navy">What is the issue?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition ${
                    formData.category === cat.id 
                    ? `${cat.color} bg-gray-50` 
                    : 'border-border hover:border-navy'
                  }`}
                >
                  <span className="text-3xl">{cat.icon}</span>
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
            <button onClick={nextStep} className="w-full bg-navy text-white py-3 rounded-lg mt-8">Next Step</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-sora font-bold text-navy">Describe the problem</h2>
            <div className="relative">
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full h-32 p-4 border border-border rounded-xl focus:border-navy focus:ring-1 focus:ring-navy outline-none resize-none"
                placeholder="Give us the details (min 10 words)..."
              />
              {recognition && (
                <button 
                  onClick={toggleListen}
                  className={`absolute bottom-4 right-4 p-2 rounded-full ${isListening ? 'bg-crimson text-white animate-pulse' : 'bg-gray-100 text-gray-500'}`}
                >
                  {isListening ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4 border border-border rounded-xl p-4 cursor-pointer hover:bg-gray-50">
              <Camera className="text-navy" />
              <span className="text-text-secondary font-medium text-sm">Upload Photo (Optional)</span>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(s => s-1)} className="w-1/3 border border-border py-3 rounded-lg">Back</button>
              <button onClick={nextStep} className="w-2/3 bg-navy text-white py-3 rounded-lg">Next Step</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-sora font-bold text-navy">Where is it located?</h2>
            
            <button onClick={getLocation} className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 py-4 rounded-xl font-medium hover:bg-blue-100 transition">
              <MapPin size={20} />
              {formData.lat ? 'Location Captured ✓' : 'Use Current GPS Location'}
            </button>

            <div className="text-center text-text-secondary">OR</div>

            <input
              type="text"
              value={formData.location_text}
              onChange={e => setFormData({...formData, location_text: e.target.value})}
              placeholder="Type manual address or ward..."
              className="w-full p-4 border border-border rounded-xl outline-none focus:border-navy"
            />

            <div className="flex gap-4 mt-8">
              <button onClick={() => setStep(s => s-1)} className="w-1/3 border border-border py-3 rounded-lg">Back</button>
              <button onClick={nextStep} className="w-2/3 bg-navy text-white py-3 rounded-lg">Review Details</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-sora font-bold text-navy">Review & Submit</h2>
            
            <div className="bg-gray-50 p-4 rounded-xl space-y-3">
              <p><span className="font-medium">Category:</span> {formData.category}</p>
              <p><span className="font-medium">Description:</span> {formData.description}</p>
              <p><span className="font-medium">Location:</span> {formData.lat ? `${formData.lat.toFixed(4)}, ${formData.lng.toFixed(4)}` : formData.location_text}</p>
            </div>

            <label className="flex items-center gap-3 p-4 border border-border rounded-xl cursor-pointer hover:bg-gray-50 transition">
              <input 
                type="checkbox" 
                className="w-5 h-5 text-saffron accent-saffron"
                checked={formData.is_anonymous}
                onChange={e => setFormData({ ...formData, is_anonymous: e.target.checked })}
              />
              <div>
                <div className="font-medium text-navy flex items-center gap-2">
                  <Shield size={16} /> File Anonymously (Whistleblower Mode)
                </div>
                <div className="text-xs text-text-secondary mt-1">Your identity will be encrypted and hidden from local officers.</div>
              </div>
            </label>

            <div className="flex gap-4 mt-8">
              <button onClick={() => setStep(s => s-1)} className="w-1/3 border border-border py-3 rounded-lg">Back</button>
              <button 
                onClick={handleSubmit} 
                className="w-2/3 flex items-center justify-center gap-2 bg-saffron text-white py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Filing Complaint...' : 'Submit Complaint'} 
                {!isSubmitting && <Check size={20} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
