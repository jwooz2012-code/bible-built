import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, Bell, BellOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useReminders } from '@/components/reminders/useReminders';

const TIME_PRESETS = [
  { label: 'Early Morning', sublabel: '6:00 AM', value: '06:00' },
  { label: 'Noon', sublabel: '12:00 PM', value: '12:00' },
  { label: 'Evening', sublabel: '7:00 PM', value: '19:00' },
];

const DAY_OPTIONS = [
  { label: 'Every day', value: 'daily' },
  { label: 'Weekdays', value: 'weekdays' },
  { label: 'Custom', value: 'custom' },
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const variants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

const LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6953bfa67629f34f674461da/6d21a8071_AppIcon.png';

function LogoMark({ size = 'sm' }) {
  const cls = size === 'lg' ? 'w-24 h-24 rounded-[28px] shadow-xl' : 'w-12 h-12 rounded-2xl shadow-md';
  return <img src={LOGO_URL} alt="Bible Built" className={`${cls} mx-auto object-cover`} />;
}

function StepWelcome({ onNext, onSkip }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <div className="mb-8">
          <LogoMark size="lg" />
        </div>({ user, onNext, onSkip }) {
  const [name, setName] = useState(user?.displayName || user?.full_name?.split(' ')[0] || '');

  const handleNext = async () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== (user?.displayName || user?.full_name?.split(' ')[0] || '')) {
      try { await base44.auth.updateMe({ displayName: trimmed }); } catch {}
    }
    onNext({ displayName: trimmed });
  };

  return (
    <div className="flex flex-col flex-1 px-8 pt-10">
      <div className="mb-8"><LogoMark /></div>
      <h2 className="text-[28px] font-bold text-foreground mb-2">What should we call you?</h2>
      <p className="text-[15px] text-muted-foreground mb-8">We'll use this throughout the app.</p>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Your name"
        autoFocus
        className="w-full bg-secondary border border-border rounded-2xl px-5 py-4 text-[17px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-foreground/40 transition-colors mb-auto"
      />
      <div className="mt-8 space-y-3 pb-8">
        <button
          onClick={handleNext}
          disabled={!name.trim()}
          className="w-full py-4 rounded-2xl bg-foreground text-background text-[17px] font-semibold disabled:opacity-40 active:scale-95 transition-transform"
        >
          Continue
        </button>
        <button onClick={onSkip} className="w-full text-[14px] text-muted-foreground/60 py-2">
          Skip
        </button>
      </div>
    </div>
  );
}

function StepVision({ onNext }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
      <div className="mb-6"><LogoMark /></div>
      <div className="text-5xl mb-6">🌱</div>
      <h2 className="text-[28px] font-bold text-foreground tracking-tight mb-4">Consistency changes everything</h2>
      <p className="text-[16px] text-muted-foreground leading-relaxed mb-12 max-w-xs">
        Small, daily time in Scripture leads to lasting spiritual growth.
      </p>
      <button
        onClick={onNext}
        className="w-full max-w-xs py-4 rounded-2xl bg-foreground text-background text-[17px] font-semibold active:scale-95 transition-transform"
      >
        Continue
      </button>
    </div>
  );
}

function StepReminderIntro({ onSetReminder, onSkip }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
      <div className="mb-6"><LogoMark /></div>
      <div className="text-5xl mb-6">🔔</div>
      <h2 className="text-[28px] font-bold text-foreground tracking-tight mb-4">Stay consistent in God's Word</h2>
      <p className="text-[16px] text-muted-foreground leading-relaxed mb-12 max-w-xs">
        Set a daily reminder so you never miss your time in Scripture.
      </p>
      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={onSetReminder}
          className="w-full py-4 rounded-2xl bg-foreground text-background text-[17px] font-semibold active:scale-95 transition-transform"
        >
          Set My Reminder
        </button>
        <button onClick={onSkip} className="w-full py-4 rounded-2xl bg-secondary text-foreground text-[17px] font-medium active:scale-95 transition-transform">
          Skip
        </button>
      </div>
    </div>
  );
}

function StepReminderSetup({ existingSettings, onConfirm, onSkip }) {
  const [selectedTime, setSelectedTime] = useState(existingSettings?.time || '07:00');
  const [selectedDays, setSelectedDays] = useState(existingSettings?.days || 'daily');
  const [customDays, setCustomDays] = useState(existingSettings?.customDays || [0,1,2,3,4,5,6]);
  const [customTimeMode, setCustomTimeMode] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const { enableReminders } = useReminders();

  const handleConfirm = async () => {
    setIsRequesting(true);
    await enableReminders({ time: selectedTime, days: selectedDays, customDays });
    setIsRequesting(false);
    onConfirm();
  };

  const matchedPreset = TIME_PRESETS.find(p => p.value === selectedTime);

  return (
    <div className="flex flex-col flex-1 px-6 pt-6 pb-6 overflow-y-auto">
      <div className="mb-5"><LogoMark /></div>
      <h2 className="text-[24px] font-bold text-foreground mb-1">Set your reminder</h2>
      <p className="text-[14px] text-muted-foreground mb-6">Pick a time that fits your routine.</p>

      {/* Time presets */}
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">When</p>
      <div className="space-y-2 mb-4">
        {TIME_PRESETS.map(preset => (
          <button
            key={preset.value}
            onClick={() => { setSelectedTime(preset.value); setCustomTimeMode(false); }}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-colors ${selectedTime === preset.value && !customTimeMode ? 'bg-foreground text-background border-foreground' : 'bg-secondary border-border text-foreground'}`}
          >
            <span className="font-medium text-[15px]">{preset.label}</span>
            <span className={`text-[13px] ${selectedTime === preset.value && !customTimeMode ? 'text-background/70' : 'text-muted-foreground'}`}>{preset.sublabel}</span>
          </button>
        ))}
        <button
          onClick={() => setCustomTimeMode(true)}
          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-colors ${customTimeMode ? 'bg-foreground text-background border-foreground' : 'bg-secondary border-border text-foreground'}`}
        >
          <span className="font-medium text-[15px]">Custom Time</span>
          {customTimeMode && (
            <input
              type="time"
              value={selectedTime}
              onChange={e => setSelectedTime(e.target.value)}
              onClick={e => e.stopPropagation()}
              className="bg-transparent text-background text-[13px] outline-none border-none"
            />
          )}
        </button>
      </div>

      {/* Days */}
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Days</p>
      <div className="flex gap-2 mb-3">
        {DAY_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSelectedDays(opt.value)}
            className={`flex-1 py-2 rounded-xl text-[13px] font-medium border transition-colors ${selectedDays === opt.value ? 'bg-foreground text-background border-foreground' : 'bg-secondary border-border text-muted-foreground'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {selectedDays === 'custom' && (
        <div className="flex gap-1 mb-4">
          {DAY_LABELS.map((d, i) => {
            const active = customDays.includes(i);
            return (
              <button
                key={i}
                onClick={() => setCustomDays(active ? customDays.filter(x => x !== i) : [...customDays, i])}
                className={`flex-1 h-9 rounded-lg text-xs font-bold transition-colors ${active ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'}`}
              >
                {d}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-auto space-y-3 pt-4">
        <button
          onClick={handleConfirm}
          disabled={isRequesting}
          className="w-full py-4 rounded-2xl bg-foreground text-background text-[17px] font-semibold disabled:opacity-50 active:scale-95 transition-transform"
        >
          {isRequesting ? 'Setting up…' : 'Confirm Reminder'}
        </button>
        <button onClick={onSkip} className="w-full text-[14px] text-muted-foreground/60 py-2">
          Skip for now
        </button>
      </div>
    </div>
  );
}

function StepComplete({ displayName, onEnter }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 250 }}
      >
        <div className="mb-8"><LogoMark size="lg" /></div>
        <h2 className="text-[32px] font-bold text-foreground tracking-tight mb-3">You're ready</h2>
        <p className="text-[16px] text-muted-foreground mb-2">
          {displayName ? `Welcome, ${displayName}.` : 'Welcome.'}
        </p>
        <p className="text-[15px] text-muted-foreground/70 mb-12">Start tracking your Bible reading today.</p>
        <button
          onClick={onEnter}
          className="w-full max-w-xs py-4 rounded-2xl bg-foreground text-background text-[17px] font-semibold shadow-lg active:scale-95 transition-transform"
        >
          Enter App
        </button>
      </motion.div>
    </div>
  );
}

// ── Dots ──────────────────────────────────────────────────────────────────────
function Dots({ total, current }) {
  return (
    <div className="flex gap-1.5 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`rounded-full transition-all ${i === current ? 'w-5 h-1.5 bg-foreground' : 'w-1.5 h-1.5 bg-border'}`} />
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function OnboardingFlow({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [showReminderSetup, setShowReminderSetup] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || user?.full_name?.split(' ')[0] || '');
  const { settings: existingReminder } = useReminders();

  // Steps: 0=welcome, 1=name, 2=vision, 3=reminderIntro, [3.5=reminderSetup], 4=complete
  const TOTAL_DOTS = 5;
  const dotIndex = step <= 3 ? step : step + 1 > 4 ? 4 : step;

  const go = (n) => { setDir(n > step ? 1 : -1); setStep(n); };
  const next = () => go(step + 1);

  const markComplete = async () => {
    try { await base44.auth.updateMe({ hasCompletedNewOnboarding: true }); } catch {}
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="w-8" />
        <Dots total={TOTAL_DOTS} current={step > 3 ? 4 : step} />
        <button onClick={markComplete} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence custom={dir} mode="wait">
          <motion.div
            key={step + (showReminderSetup ? '-setup' : '')}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="flex flex-col flex-1"
          >
            {step === 0 && (
              <StepWelcome onNext={next} onSkip={markComplete} />
            )}
            {step === 1 && (
              <StepName user={user} onNext={(data) => { setDisplayName(data.displayName); next(); }} onSkip={next} />
            )}
            {step === 2 && (
              <StepVision onNext={next} />
            )}
            {step === 3 && !showReminderSetup && (
              <StepReminderIntro
                onSetReminder={() => { setDir(1); setShowReminderSetup(true); }}
                onSkip={() => go(4)}
              />
            )}
            {step === 3 && showReminderSetup && (
              <StepReminderSetup
                existingSettings={existingReminder}
                onConfirm={() => go(4)}
                onSkip={() => go(4)}
              />
            )}
            {step === 4 && (
              <StepComplete displayName={displayName} onEnter={markComplete} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}