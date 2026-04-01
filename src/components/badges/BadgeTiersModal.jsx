import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, BookOpen, Shield, Layers, Crown, Star, X } from 'lucide-react';

const TIERS = [
  {
    label: 'Follower',
    Icon: Sprout,
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.25)',
    range: '0 – 6 days',
    requirement: 'Just getting started. Open your Bible and begin.',
  },
  {
    label: 'Disciple',
    Icon: BookOpen,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.25)',
    range: '7 – 29 days',
    requirement: 'Maintain a 7-day reading streak.',
  },
  {
    label: 'Warrior',
    Icon: Shield,
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.25)',
    range: '30 – 99 days',
    requirement: 'Maintain a 30-day reading streak.',
  },
  {
    label: 'Builder',
    Icon: Layers,
    color: '#06B6D4',
    bg: 'rgba(6,182,212,0.12)',
    border: 'rgba(6,182,212,0.25)',
    range: '100 – 249 days',
    requirement: 'Maintain a 100-day reading streak.',
  },
  {
    label: 'Faithful',
    Icon: Crown,
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.25)',
    range: '250 – 499 days',
    requirement: 'Maintain a 250-day reading streak.',
  },
  {
    label: 'Steadfast',
    Icon: Star,
    color: '#FDE047',
    bg: 'rgba(253,224,71,0.12)',
    border: 'rgba(253,224,71,0.25)',
    range: '500+ days',
    requirement: 'Maintain a 500-day reading streak.',
  },
];

export default function BadgeTiersModal({ open, onClose, currentTierLabel }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.55)',
              zIndex: 200,
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              zIndex: 201,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              background: 'var(--tw-card, hsl(var(--card)))',
              padding: '20px 20px 40px',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            {/* Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 9999, background: 'rgba(128,128,128,0.3)', margin: '0 auto 18px' }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'hsl(var(--foreground))' }}>Battle Badge Tiers</h2>
                <p style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', margin: '4px 0 0' }}>
                  Earn higher tiers by keeping your streak alive.
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'hsl(var(--muted))', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                <X style={{ width: 16, height: 16, color: 'hsl(var(--muted-foreground))' }} />
              </button>
            </div>

            {/* Tier list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TIERS.map((tier, i) => {
                const Icon = tier.Icon;
                const isCurrent = tier.label === currentTierLabel;
                return (
                  <motion.div
                    key={tier.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.25 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '12px 14px',
                      borderRadius: 14,
                      background: isCurrent ? tier.bg : 'hsl(var(--muted))',
                      border: `1.5px solid ${isCurrent ? tier.border : 'transparent'}`,
                      position: 'relative',
                    }}
                  >
                    {/* Icon bubble */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: tier.bg,
                      border: `1px solid ${tier.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon style={{ width: 18, height: 18, color: tier.color }} />
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: tier.color }}>{tier.label}</span>
                        {isCurrent && (
                          <span style={{
                            fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                            color: tier.color, background: tier.bg, border: `1px solid ${tier.border}`,
                            borderRadius: 9999, padding: '2px 6px',
                          }}>
                            Current
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', margin: '2px 0 0', lineHeight: 1.4 }}>
                        {tier.requirement}
                      </p>
                    </div>

                    {/* Range */}
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: 'hsl(var(--muted-foreground))',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      {tier.range}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}