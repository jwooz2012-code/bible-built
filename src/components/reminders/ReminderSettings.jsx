import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, ChevronDown, AlertCircle, Download } from 'lucide-react';
import { useReminders, getReminderStatusText } from './useReminders';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function TimePickerRow({ value, onChange }) {
  const [h, m] = value.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;

  const setPeriod = (p) => {
    let newH = h;
    if (p === 'AM' && h >= 12) newH = h - 12;
    if (p === 'PM' && h < 12) newH = h + 12;
    onChange(`${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  };

  return (
    <div className="flex items-center gap-3">
      <select
        value={h12}
        onChange={e => {
          const newH12 = parseInt(e.target.value);
          const newH = period === 'PM' ? (newH12 === 12 ? 12 : newH12 + 12) : (newH12 === 12 ? 0 : newH12);
          onChange(`${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        }}
        className="bg-secondary border border-border rounded-lg px-2 py-1.5 text-sm text-foreground"
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <span className="text-muted-foreground">:</span>
      <select
        value={m}
        onChange={e => onChange(`${String(h).padStart(2, '0')}:${String(parseInt(e.target.value)).padStart(2, '0')}`)}
        className="bg-secondary border border-border rounded-lg px-2 py-1.5 text-sm text-foreground"
      >
        {[0, 15, 30, 45].map(n => (
          <option key={n} value={n}>{String(n).padStart(2, '0')}</option>
        ))}
      </select>
      <div className="flex rounded-lg overflow-hidden border border-border">
        {['AM', 'PM'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${period === p ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:bg-accent'}`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function PWASetupGuide({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-black/40 flex items-end"
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="w-full bg-card border-t border-border rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Add Bible Built to Home Screen</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground">
          <p>To enable notifications on iOS, Bible Built needs to be installed as an app on your home screen.</p>

          <div className="bg-secondary rounded-lg p-4 space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-foreground text-background text-xs font-bold">1</div>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Tap the Share button</p>
                <p className="text-xs">Look for the box with an arrow at the bottom</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-foreground text-background text-xs font-bold">2</div>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Select "Add to Home Screen"</p>
                <p className="text-xs">Scroll down if you don't see it immediately</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-foreground text-background text-xs font-bold">3</div>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Tap "Add" to confirm</p>
                <p className="text-xs">The app will appear on your home screen</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-foreground text-background text-xs font-bold">4</div>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Open Bible Built from home screen</p>
                <p className="text-xs">Then enable reminders again</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground/60 italic">
            Once installed, you'll get the native iOS notification permission prompt and reminders will work in the background.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-xl bg-foreground text-background font-semibold"
        >
          Got it
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function ReminderSettings() {
  const { settings, permissionStatus, isSaving, enableReminders, disableReminders, updateSettings, platformInfo } = useReminders();
  const [draft, setDraft] = useState(settings);
  const [showPWAGuide, setShowPWAGuide] = useState(false);

  const handleToggle = async () => {
    if (settings.enabled) {
      await disableReminders();
      setDraft(s => ({ ...s, enabled: false }));
    } else {
      // Check if iOS and not PWA
      if (platformInfo.isIOS && !platformInfo.isPWA) {
        setShowPWAGuide(true);
        return;
      }
      await enableReminders(draft);
      setDraft(s => ({ ...s, enabled: true }));
    }
  };

  const handleSave = async () => {
    await updateSettings(draft);
  };

  const isDirty = JSON.stringify(draft) !== JSON.stringify(settings);

  return (
    <div className="space-y-4">
      {/* Toggle row */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-card border border-border/60 rounded-xl">
        <div className="flex items-center gap-3">
          {settings.enabled
            ? <Bell className="text-muted-foreground w-[18px] h-[18px]" />
            : <BellOff className="text-muted-foreground w-[18px] h-[18px]" />
          }
          <div>
            <span className="text-[15px] font-medium text-foreground block">Daily Reminder</span>
            <span className="text-[12px] text-muted-foreground">{getReminderStatusText(settings)}</span>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={`relative w-11 h-6 rounded-full transition-colors ${settings.enabled ? 'bg-foreground' : 'bg-border'}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-background shadow transition-all ${settings.enabled ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
      </div>

      {/* Expanded settings when enabled */}
      {settings.enabled && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/60 rounded-xl overflow-hidden divide-y divide-border/60"
        >
          {/* Time */}
          <div className="px-4 py-3.5">
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Time</p>
            <TimePickerRow
              value={draft.time}
              onChange={t => setDraft(s => ({ ...s, time: t }))}
            />
          </div>

          {/* Days */}
          <div className="px-4 py-3.5">
            <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Days</p>
            <div className="flex gap-2 flex-wrap">
              {['daily', 'weekdays', 'custom'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setDraft(s => ({ ...s, days: opt }))}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${draft.days === opt ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:bg-accent'}`}
                >
                  {opt === 'daily' ? 'Every day' : opt === 'weekdays' ? 'Weekdays' : 'Custom'}
                </button>
              ))}
            </div>
            {draft.days === 'custom' && (
              <div className="flex gap-1 mt-3">
                {DAY_LABELS.map((d, i) => {
                  const active = (draft.customDays || []).includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        const cur = draft.customDays || [];
                        setDraft(s => ({ ...s, customDays: active ? cur.filter(x => x !== i) : [...cur, i] }));
                      }}
                      className={`flex-1 h-8 rounded-lg text-xs font-semibold transition-colors ${active ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'}`}
                    >
                      {d[0]}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Permission warning */}
          {permissionStatus === 'denied' && (
            <div className="px-4 py-3 bg-destructive/10">
              <p className="text-[12px] text-destructive">Notifications are blocked. Enable them in your device settings.</p>
            </div>
          )}
          
          {/* Permission errors */}
          {permissionStatus === 'needs_pwa' && (
            <div className="px-4 py-3 bg-amber-50 dark:bg-amber-950">
              <p className="text-[12px] text-amber-700 dark:text-amber-300">⚠️ Reminders work best on iOS when installed as an app. Tap below for setup.</p>
            </div>
          )}
          
          {permissionStatus === 'unsupported' && (
            <div className="px-4 py-3 bg-amber-50 dark:bg-amber-950">
              <p className="text-[12px] text-amber-700 dark:text-amber-300">Notifications are not supported in this browser.</p>
            </div>
          )}
          
          {/* iOS PWA note */}
          {settings.enabled && permissionStatus === 'granted' && (
            <div className="px-4 py-3 bg-blue-50 dark:bg-blue-950">
              <p className="text-[12px] text-blue-700 dark:text-blue-300">💡 For reliable notifications on iOS, add Bible Built to your home screen.</p>
            </div>
          )}

          {/* Save */}
          {isDirty && (
            <div className="px-4 py-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold disabled:opacity-50"
              >
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* PWA Setup Guide Modal */}
      {showPWAGuide && <PWASetupGuide onClose={() => setShowPWAGuide(false)} />}
    </div>
  );
}