import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Smile, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const EMOJIS = ['🦁','🐺','🦅','🐉','⚔️','🛡️','📖','✝️','🌿','🌊','🔥','⭐','🌙','☀️','🙏','💪','🌄','🦋','🕊️','🌱'];

const DEFAULT_AVATARS = [
  { id: 'A', bg: 'from-slate-700 to-slate-900', text: 'text-white' },
  { id: 'B', bg: 'from-stone-600 to-stone-800', text: 'text-white' },
  { id: 'C', bg: 'from-zinc-700 to-zinc-900', text: 'text-white' },
  { id: 'D', bg: 'from-neutral-600 to-neutral-900', text: 'text-white' },
  { id: 'E', bg: 'from-orange-700 to-orange-900', text: 'text-white' },
  { id: 'F', bg: 'from-blue-700 to-blue-900', text: 'text-white' },
];

function Sheet({ onClose, children }) {
  return (
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
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 96px)' }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function AvatarPicker({ initials, avatarData, onUpdate }) {
  const [step, setStep] = useState(null); // null | 'menu' | 'emoji' | 'default'
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const save = async (data) => {
    setSaving(true);
    try {
      await base44.auth.updateMe(data);
      onUpdate(data);
    } finally {
      setSaving(false);
      setStep(null);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    setStep(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await save({ avatarType: 'photo', avatarPhotoUrl: file_url });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Tappable Avatar Wrapper */}
      <button
        onClick={() => setStep('menu')}
        className="relative focus:outline-none"
        aria-label="Change profile image"
      >
        <AvatarDisplay initials={initials} avatarData={avatarData} size={64} />
        {/* Edit badge */}
        <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-foreground flex items-center justify-center border-2 border-card">
          <Camera className="w-3 h-3 text-background" />
        </div>
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <AnimatePresence>
        {step === 'menu' && (
          <Sheet onClose={() => setStep(null)}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h3 className="text-[17px] font-semibold text-foreground">Change Profile Image</h3>
              <button onClick={() => setStep(null)} className="p-1 rounded-full hover:bg-accent">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="px-4 pb-2 space-y-2">
              <MenuOption icon={Camera} label="Upload Photo" onPress={() => { setStep(null); setTimeout(() => fileInputRef.current?.click(), 100); }} />
              <MenuOption icon={Smile} label="Choose Emoji Avatar" onPress={() => setStep('emoji')} />
              <MenuOption icon={User} label="Choose Default Avatar" onPress={() => setStep('default')} />
            </div>
          </Sheet>
        )}

        {step === 'emoji' && (
          <Sheet onClose={() => setStep(null)}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <button onClick={() => setStep('menu')} className="text-[14px] text-muted-foreground font-medium">← Back</button>
              <h3 className="text-[17px] font-semibold text-foreground">Choose Emoji</h3>
              <button onClick={() => setStep(null)} className="p-1 rounded-full hover:bg-accent">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="px-6 pb-6 grid grid-cols-5 gap-3">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => save({ avatarType: 'emoji', avatarEmoji: emoji })}
                  disabled={saving}
                  className="w-full aspect-square flex items-center justify-center text-3xl bg-secondary rounded-2xl hover:bg-accent transition-colors active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </Sheet>
        )}

        {step === 'default' && (
          <Sheet onClose={() => setStep(null)}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <button onClick={() => setStep('menu')} className="text-[14px] text-muted-foreground font-medium">← Back</button>
              <h3 className="text-[17px] font-semibold text-foreground">Default Avatar</h3>
              <button onClick={() => setStep(null)} className="p-1 rounded-full hover:bg-accent">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="px-6 pb-8 grid grid-cols-3 gap-4">
              {DEFAULT_AVATARS.map(av => (
                <button
                  key={av.id}
                  onClick={() => save({ avatarType: 'default', avatarDefaultId: av.id })}
                  disabled={saving}
                  className={`aspect-square flex items-center justify-center rounded-2xl bg-gradient-to-br ${av.bg} active:scale-95 transition-transform text-2xl font-bold ${av.text} hover:ring-2 ring-foreground/30`}
                >
                  {initials}
                </button>
              ))}
            </div>
          </Sheet>
        )}
      </AnimatePresence>
    </>
  );
}

function MenuOption({ icon: Icon, label, onPress }) {
  return (
    <button
      onClick={onPress}
      className="w-full flex items-center gap-3 px-4 py-3.5 bg-secondary rounded-xl hover:bg-accent/60 transition-colors text-left"
    >
      <Icon className="w-5 h-5 text-muted-foreground" />
      <span className="text-[15px] font-medium text-foreground">{label}</span>
    </button>
  );
}

// Exported separately so Profile.jsx can also use it for the ring display
export function AvatarDisplay({ initials, avatarData, size = 64 }) {
  const type = avatarData?.avatarType;

  if (type === 'photo' && avatarData.avatarPhotoUrl) {
    return (
      <div
        className="rounded-full overflow-hidden border border-border flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <img src={avatarData.avatarPhotoUrl} alt="avatar" className="w-full h-full object-cover" />
      </div>
    );
  }

  if (type === 'emoji' && avatarData.avatarEmoji) {
    return (
      <div
        className="rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.45 }}
      >
        {avatarData.avatarEmoji}
      </div>
    );
  }

  if (type === 'default' && avatarData.avatarDefaultId) {
    const av = DEFAULT_AVATARS.find(a => a.id === avatarData.avatarDefaultId) || DEFAULT_AVATARS[0];
    return (
      <div
        className={`rounded-full bg-gradient-to-br ${av.bg} border border-border flex items-center justify-center flex-shrink-0 font-bold ${av.text}`}
        style={{ width: size, height: size, fontSize: size * 0.32 }}
      >
        {initials}
      </div>
    );
  }

  // Fallback: initials
  return (
    <div
      className="rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <span className="font-bold text-foreground" style={{ fontSize: size * 0.32 }}>{initials}</span>
    </div>
  );
}