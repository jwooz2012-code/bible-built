import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function GroupEditSheet({ group, onClose, onSaved }) {
  const [name, setName] = useState(group.name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(group.avatarUrl ?? '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAvatarUrl(file_url);
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const updated = await base44.entities.Group.update(group.id, {
        name: name.trim(),
        avatarUrl: avatarUrl || null,
      });
      toast.success('Group updated!');
      onSaved({ ...group, name: name.trim(), avatarUrl: avatarUrl || null });
      onClose();
    } catch {
      toast.error('Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full bg-card rounded-t-3xl max-w-lg mx-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          <div className="flex items-center justify-between px-6 pt-2 pb-4">
            <h3 className="text-[17px] font-semibold text-foreground">Edit Group</h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-accent">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="px-6 space-y-5" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 32px)' }}>
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="relative w-20 h-20 rounded-2xl overflow-hidden bg-muted border-2 border-dashed border-border hover:border-foreground/30 transition-colors flex items-center justify-center"
              >
                {uploadingPhoto ? (
                  <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="group avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Camera className="w-6 h-6 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground font-medium">Add Photo</span>
                  </div>
                )}
                {avatarUrl && !uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                )}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              {avatarUrl && (
                <button
                  onClick={() => setAvatarUrl('')}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Remove photo
                </button>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Group Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={40}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter group name…"
              />
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="w-full h-14 rounded-2xl text-base font-bold bg-foreground text-background flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}