import React, { useState } from 'react';
import { Camera, CheckCircle2, Upload, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

export default function ResolutionUpload({ onResolve, isSubmitting }) {
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);
  const [beforeDesc, setBeforeDesc] = useState('');
  const [afterDesc, setAfterDesc] = useState('');

  const onDropBefore = (acceptedFiles) => setBeforePhoto(acceptedFiles[0]);
  const onDropAfter = (acceptedFiles) => setAfterPhoto(acceptedFiles[0]);

  const { getRootProps: getBeforeProps, getInputProps: getBeforeInput } = useDropzone({
    onDrop: onDropBefore, accept: { 'image/*': [] }, multiple: false
  });

  const { getRootProps: getAfterProps, getInputProps: getAfterInput } = useDropzone({
    onDrop: onDropAfter, accept: { 'image/*': [] }, multiple: false
  });

  const handleSubmit = () => {
    if (!beforePhoto || !afterPhoto || !beforeDesc || !afterDesc) {
      return toast.error("All fields and photos are required for proof of resolution");
    }
    onResolve({ beforePhoto, afterPhoto, beforeDesc, afterDesc });
  };

  const PhotoPlaceholder = ({ photo, label, rootProps, inputProps }) => (
    <div {...rootProps()} className={`flex-1 border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition ${
      photo ? 'border-emerald bg-emerald-light' : 'border-border hover:border-navy'
    }`}>
      <input {...inputProps()} />
      {photo ? (
        <>
          <CheckCircle2 className="text-emerald mb-2" size={24} />
          <span className="text-[11px] font-bold text-emerald uppercase">{label} Uploaded</span>
          <span className="text-[10px] text-text-secondary mt-1 truncate max-w-full">{photo.name}</span>
        </>
      ) : (
        <>
          <Camera className="text-text-secondary mb-2" size={24} />
          <span className="text-[11px] font-bold text-text-secondary uppercase">Click to upload {label}</span>
        </>
      )}
    </div>
  );

  return (
    <div className="bg-surface rounded-2xl p-6 border border-border shadow-soft space-y-6">
      <div className="flex gap-4">
        <PhotoPlaceholder photo={beforePhoto} label="Before Photo" rootProps={getBeforeProps()} inputProps={getBeforeInput()} />
        <PhotoPlaceholder photo={afterPhoto} label="After Photo" rootProps={getAfterProps()} inputProps={getAfterInput()} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-secondary uppercase letter-spacing-[0.05em]">Before Description</label>
          <textarea 
            value={beforeDesc}
            onChange={(e) => setBeforeDesc(e.target.value)}
            className="w-full h-24 p-3 border border-border rounded-lg text-sm focus:border-navy outline-none"
            placeholder="Describe the initial state..."
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-text-secondary uppercase letter-spacing-[0.05em]">After Description</label>
          <textarea 
            value={afterDesc}
            onChange={(e) => setAfterDesc(e.target.value)}
            className="w-full h-24 p-3 border border-border rounded-lg text-sm focus:border-navy outline-none"
            placeholder="Describe the resolution work..."
          />
        </div>
      </div>

      <div className="p-4 bg-amber-light border border-amber rounded-lg flex gap-3 text-amber-700">
        <AlertCircle size={18} className="shrink-0 mt-0.5" />
        <p className="text-xs font-medium leading-relaxed">
          Resolution requires GPS validation. Ensure photos are taken at the site. The system will automatically verify location via metadata.
        </p>
      </div>

      <button 
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-navy text-white py-3 rounded-lg font-sora font-bold text-sm flex items-center justify-center gap-2 hover:bg-navy-light transition disabled:opacity-50"
      >
        {isSubmitting ? 'Validating Proof...' : 'Submit Resolution Proof'} <CheckCircle2 size={18} />
      </button>
    </div>
  );
}
