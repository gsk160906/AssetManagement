import React, { useRef, useState } from 'react';
import { Camera, Trash2, Loader2 } from 'lucide-react';
import { ProfileAvatar } from './ProfileAvatar';

interface AvatarUploaderProps {
  url?: string | null;
  name: string;
  onUpload: (file: File) => Promise<any>;
  onRemove: () => Promise<any>;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({ url, name, onUpload, onRemove }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB limit.');
      return;
    }

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Unsupported file format. Please upload JPG, PNG, or WEBP.');
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    setIsRemoving(true);
    try {
      await onRemove();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <ProfileAvatar url={url} name={name} size="xl" />
        
        {/* Hover Camera Overlay */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isRemoving}
          className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
        >
          {isUploading ? (
            <Loader2 className="animate-spin text-white w-8 h-8" />
          ) : (
            <Camera className="text-white w-8 h-8" />
          )}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".jpg,.jpeg,.png,.webp"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isRemoving}
          className="btn btn-outline btn-sm btn-primary"
        >
          {isUploading && <Loader2 className="animate-spin w-4 h-4 mr-1" />}
          Change Photo
        </button>

        {url && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isUploading || isRemoving}
            className="btn btn-outline btn-sm btn-error"
          >
            {isRemoving ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 size={16} />}
          </button>
        )}
      </div>
      <span className="text-[11px] text-base-content/40">JPG, PNG or WEBP. Max size 5MB.</span>
    </div>
  );
};
export default AvatarUploader;
