import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { triggerHaptic } from '@/components/utils/haptics';
import { fetchChapter } from '@/components/bible/utils/readerUtils';

const GREEN = '#16A34A';
const RED = '#DC2626';

function useVerses(bookIndex, chapter, from, to) {
  const [verses, setVerses] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetchChapter(bookIndex, chapter)
      .then((all) => { if (!cancelled) setVerses(all.slice(from - 1, to ?? from)); })
      .catch(() => { if (!cancelled) setVerses([]); });
    return () => { cancelled = true; };
  }, [bookIndex, chapter, from, to]);
  return verses;
}

function VerseBlock({ bookIndex, bookName, reference }) {
  const verses = useVerses(bookIndex, reference.chapter, reference.verse, reference.to);
  const label = `${bookName} ${reference.chapter}:${reference.verse}${reference.to ? `–${reference.to}` : ''}`;
  return (
    <div className="rounded-xl bg-muted/50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">{label}</p>
      {verses === null ? (
        <div className="h-10 rounded bg-muted animate-pulse" />
      ) : (
        <p className="text-[15px] leading-relaxed text-foreground font-serif">
          {verses.map((v) => (
            <span key={v.number}>
              <sup className="text-[10px] text-muted-foreground mr-0.5">{v.number}</sup>{v.text}{' '}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

function ChoiceQuestion({ question, revealed, onPick }) {
  const [picked, setPicked] = useState(null);

  const pick = (choice) => {
    if (revealed) return;
    triggerHaptic();
    setPicked(choice.index);
    onPick(choice.index === question.answer);
  };

  return (
    <div className="space-y-2.5">
      {question.shuffledChoices.map((choice) => {
        const isAnswer = choice.index === question.answer;
        const isPicked = choice.index === picked;
        let style = { borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' };
        if (revealed && isAnswer) style = { borderColor: GREEN, background: 'rgba(34,197,94,0.1)' };
        else if (revealed && isPicked) style = { borderColor: RED, background: 'rgba(220,38,38,0.08)' };
        return (
          <motion.button
            key={choice.index}
            whileTap={revealed ? undefined : { scale: 0.98 }}
            onClick={() => pick(choice)}
            disabled={revealed}
            className="w-full text-left rounded-2xl border-2 px-4 py-3.5 flex items-center gap-3 transition-colors"
            style={{ ...style, opacity: revealed && !isAnswer && !isPicked ? 0.55 : 1 }}
          >
            <span className="flex-1 text-[15px] font-semibold text-foreground leading-snug">{choice.text}</span>
            {revealed && isAnswer && <Check className="w-5 h-5 shrink-0" style={{ color: GREEN }} strokeWidth={3} />}
            {revealed && isPicked && !isAnswer && <X className="w-5 h-5 shrink-0" style={{ color: RED }} strokeWidth={3} />}
          </motion.button>
        );
      })}
    </div>
  );
}

function OrderQuestion({ question, revealed, onPick }) {
  const [placed, setPlaced] = useState([]);
  const remaining = question.shuffledItems.filter((item) => !placed.includes(item.index));

  const place = (item) => {
    if (revealed) return;
    triggerHaptic();
    setPlaced((p) => [...p, item.index]);
  };
  const unplace = (index) => {
    if (revealed) return;
    triggerHaptic();
    setPlaced((p) => p.filter((i) => i !== index));
  };
  const check = () => {
    triggerHaptic();
    onPick(placed.every((itemIndex, position) => itemIndex === position));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {question.items.map((_, position) => {
          const itemIndex = placed[position];
          const item = itemIndex !== undefined ? question.items[itemIndex] : null;
          const correct = revealed && itemIndex === position;
          return (
            <button
              key={position}
              onClick={() => item && unplace(itemIndex)}
              disabled={revealed || !item}
              className="w-full text-left rounded-2xl border-2 px-3 py-3 flex items-center gap-3 transition-colors min-h-[52px]"
              style={{
                borderStyle: item ? 'solid' : 'dashed',
                borderColor: revealed ? (correct ? GREEN : RED) : item ? 'hsl(var(--foreground) / 0.4)' : 'hsl(var(--border))',
                background: revealed ? (correct ? 'rgba(34,197,94,0.1)' : 'rgba(220,38,38,0.08)') : 'hsl(var(--card))',
              }}
            >
              <span className="w-7 h-7 rounded-full bg-foreground text-background text-sm font-black flex items-center justify-center shrink-0">
                {position + 1}
              </span>
              <span className={`flex-1 text-[15px] font-semibold leading-snug ${item ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                {item ? item.text : 'Tap an item below'}
              </span>
              {revealed && (correct
                ? <Check className="w-5 h-5 shrink-0" style={{ color: GREEN }} strokeWidth={3} />
                : <X className="w-5 h-5 shrink-0" style={{ color: RED }} strokeWidth={3} />)}
            </button>
          );
        })}
      </div>

      {!revealed && remaining.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {remaining.map((item) => (
            <motion.button
              key={item.index}
              layout
              whileTap={{ scale: 0.95 }}
              onClick={() => place(item)}
              className="rounded-xl border border-border bg-muted/60 px-3 py-2 text-sm font-semibold text-foreground text-left"
            >
              {item.text}
            </motion.button>
          ))}
        </div>
      )}

      {!revealed && (
        <div className="flex gap-2">
          <Button variant="outline" className="h-12 rounded-full" onClick={() => setPlaced([])} disabled={placed.length === 0}>
            <RotateCcw className="w-4 h-4 mr-1.5" /> Reset
          </Button>
          <Button className="flex-1 h-12 rounded-full font-bold" onClick={check} disabled={remaining.length > 0}>
            {remaining.length > 0 ? `Place ${remaining.length} more` : 'Check Order'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ChallengeQuestion({ question, bookIndex, bookName, onAnswered, onNext, isLast }) {
  const [result, setResult] = useState(null);
  const feedbackRef = useRef(null);
  const revealed = result !== null;

  const handlePick = (correct) => {
    setResult(correct);
    onAnswered(correct);
    if (correct && navigator.vibrate) navigator.vibrate([10, 40, 10]);
  };

  useEffect(() => {
    if (revealed) setTimeout(() => feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
  }, [revealed]);

  const correctText = question.type === 'order' ? null : question.choices[question.answer];

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="px-5 pb-10"
    >
      <span className="inline-block text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-muted text-muted-foreground mb-3">
        {question.kind}
      </span>
      <h2 className="text-[22px] font-black text-foreground leading-snug mb-6">{question.prompt}</h2>

      {question.type === 'order'
        ? <OrderQuestion question={question} revealed={revealed} onPick={handlePick} />
        : <ChoiceQuestion question={question} revealed={revealed} onPick={handlePick} />}

      <AnimatePresence>
        {revealed && (
          <motion.div
            ref={feedbackRef}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: result ? GREEN : RED }}
              >
                {result ? <Check className="w-5 h-5 text-white" strokeWidth={3} /> : <X className="w-5 h-5 text-white" strokeWidth={3} />}
              </div>
              <p className="text-xl font-black" style={{ color: result ? GREEN : RED }}>
                {result ? 'Correct!' : 'Not quite'}
              </p>
            </div>
            {!result && correctText && (
              <p className="text-sm text-foreground">
                The answer is <span className="font-bold">{correctText}</span>.
              </p>
            )}
            <p className="text-[15px] text-foreground/85 leading-relaxed">{question.explain}</p>

            {question.type === 'order' ? (
              <div className="rounded-xl bg-muted/50 px-4 py-3 space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Correct order</p>
                {question.items.map((item, i) => (
                  <p key={item.text} className="text-sm text-foreground">
                    <span className="font-black mr-1.5">{i + 1}.</span>{item.text}
                    <span className="text-muted-foreground"> · {bookName} {item.chapter}:{item.verse}</span>
                  </p>
                ))}
              </div>
            ) : (
              <VerseBlock bookIndex={bookIndex} bookName={bookName} reference={question.ref} />
            )}

            <Button onClick={onNext} size="lg" className="w-full h-14 rounded-full text-base font-bold">
              {isLast ? 'See Results' : 'Next Question →'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
