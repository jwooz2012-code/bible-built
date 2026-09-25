import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CalendarCheck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { triggerHaptic } from '@/components/utils/haptics';
import { getStarterPlans } from '@/components/onboarding/starterPlans';

const EXPERIENCES = [
  {
    value: 'read_freely',
    label: 'Read Freely',
    description: 'Pick any book and track as you go',
    icon: BookOpen,
  },
  {
    value: 'follow_plan',
    label: 'Follow a Plan',
    description: "We'll set each day's reading for you",
    icon: CalendarCheck,
  },
];

export default function ExperienceTypeScreen({ onContinue, initialValue = '', initialPlanId = '' }) {
  const [selected, setSelected] = useState(initialValue);
  const [planId, setPlanId] = useState(initialPlanId);
  const plans = useMemo(() => getStarterPlans(), []);

  const needsPlan = selected === 'follow_plan' && !planId;
  const canContinue = !!selected && !needsPlan;

  const choose = (value) => {
    triggerHaptic('light');
    setSelected(value);
  };

  const choosePlan = (id) => {
    triggerHaptic('light');
    setPlanId(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col px-6 pt-4 pb-8"
    >
      <h1 className="text-3xl font-black mb-2 text-foreground">How do you want to read?</h1>
      <p className="text-base text-muted-foreground mb-6">You can change this anytime.</p>

      <div className="space-y-3">
        {EXPERIENCES.map((exp, idx) => {
          const isSelected = selected === exp.value;
          const Icon = exp.icon;
          return (
            <motion.button
              key={exp.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => choose(exp.value)}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-4 rounded-2xl border-2 transition-colors text-left flex items-center gap-4 ${
                isSelected ? 'border-foreground bg-foreground' : 'border-border bg-background hover:border-foreground/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-background/15' : 'bg-muted'}`}>
                <Icon className={`w-5 h-5 ${isSelected ? 'text-background' : 'text-foreground'}`} />
              </div>
              <div>
                <div className={`font-bold text-lg ${isSelected ? 'text-background' : 'text-foreground'}`}>{exp.label}</div>
                <div className={`text-sm mt-0.5 ${isSelected ? 'text-background/70' : 'text-muted-foreground'}`}>{exp.description}</div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {selected === 'follow_plan' && (
          <motion.div
            key="plans"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-6 mb-3">Pick a starter plan</p>
            <div className="space-y-2.5">
              {plans.map((plan) => {
                const isPicked = planId === plan.id;
                return (
                  <motion.button
                    key={plan.id}
                    onClick={() => choosePlan(plan.id)}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-left rounded-2xl border-2 px-4 py-3 flex items-start gap-3 transition-colors"
                    style={{
                      borderColor: isPicked ? '#22C55E' : 'hsl(var(--border))',
                      background: isPicked ? 'rgba(34,197,94,0.08)' : 'hsl(var(--card))',
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground">{plan.name}</p>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{plan.hook}</p>
                      <p className="text-xs font-semibold mt-1.5" style={{ color: '#16A34A' }}>
                        {plan.durationLabel} · {plan.chaptersPerDay} chapters a day
                      </p>
                    </div>
                    <div
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        borderColor: isPicked ? '#22C55E' : 'hsl(var(--border))',
                        background: isPicked ? '#22C55E' : 'transparent',
                      }}
                    >
                      {isPicked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3">More plans are on your Home screen anytime.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div whileTap={{ scale: canContinue ? 0.98 : 1 }} className="mt-8">
        <Button
          onClick={() => onContinue({ experienceType: selected, planId: selected === 'follow_plan' ? planId : '' })}
          disabled={!canContinue}
          size="lg"
          className="w-full h-14 rounded-full font-bold transition-all"
        >
          {needsPlan ? 'Pick a plan to continue' : 'Continue'}
        </Button>
      </motion.div>
    </motion.div>
  );
}
