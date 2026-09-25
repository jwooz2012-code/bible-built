import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { X, Lock, Zap, Check, ArrowLeft } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useCelebration, CELEBRATION_TYPES } from '@/components/celebration/CelebrationContext';
import { useReadingLogsRange } from '@/components/bible/hooks/useReadingLogsRange';
import { BIBLE_BOOKS } from '@/components/bible/bibleData';
import { getChallenge, buildTest, isBookComplete, MEDALS, minScoreFor } from '@/data/challenges';
import { useChallengeAttempts, summarizeAttempts } from '@/components/challenge/useChallengeAttempts';
import MedalBadge from '@/components/challenge/MedalBadge';
import ChallengeQuestion from '@/components/challenge/ChallengeQuestion';
import ChallengeResults from '@/components/challenge/ChallengeResults';

function track(eventName, properties) {
  try {
    base44.analytics.track({ eventName, properties });
  } catch {
    // Analytics must never interrupt a challenge.
  }
}

const Screen = ({ children }) => (
  <div className="min-h-screen bg-background overflow-x-hidden" style={{ paddingTop: 'max(env(safe-area-inset-top), 44px)' }}>
    <div className="max-w-lg mx-auto">{children}</div>
  </div>
);

export default function ChallengePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();
  const { triggerCelebration } = useCelebration();
  const returnTo = location.state?.returnTo || '/home';

  const challenge = getChallenge(new URLSearchParams(location.search).get('id'));
  const bookData = challenge ? BIBLE_BOOKS[challenge.bookIndex] : null;

  const { data: logs = [], isLoading: logsLoading } = useReadingLogsRange(user?.id, '2000-01-01', '2099-12-31');
  const { data: attempts = [], isLoading: attemptsLoading } = useChallengeAttempts(user?.id);
  const summary = useMemo(() => summarizeAttempts(attempts, challenge?.id), [attempts, challenge?.id]);
  const progress = useMemo(
    () => (challenge ? isBookComplete(logs, challenge, bookData.chapters) : { readCount: 0, complete: false }),
    [logs, challenge, bookData]
  );

  const [stage, setStage] = useState('intro');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [bestBeforeAttempt, setBestBeforeAttempt] = useState(null);
  const [save, setSave] = useState({ status: 'idle' });

  useEffect(() => { window.scrollTo(0, 0); }, [stage, current]);

  const start = () => {
    // Coming from results, the attempt just played may not have reloaded from the server yet.
    const justPlayed = stage === 'results' ? { score: answers.filter(Boolean).length, total: questions.length } : null;
    const lastIds = justPlayed ? questions.map((q) => q.id) : (summary.last?.questionIds || []);
    const best = [summary.best, justPlayed].filter(Boolean).reduce((a, b) => (!a || b.score > a.score ? b : a), null);
    setQuestions(buildTest(challenge, lastIds));
    setAnswers([]);
    setCurrent(0);
    setBestBeforeAttempt(best);
    setSave({ status: 'idle' });
    setStage('playing');
    track('challenge_started', { challengeId: challenge.id, attemptNumber: summary.count + 1 });
  };

  const submit = useCallback(async (finalAnswers) => {
    const score = finalAnswers.filter(Boolean).length;
    setSave({ status: 'saving' });
    try {
      const res = await base44.functions.invoke('submitChallengeAttempt', {
        challengeId: challenge.id,
        score,
        total: questions.length,
        questionIds: questions.map((q) => q.id),
      });
      const data = res?.data ?? res;
      if (data?.error) throw new Error(data.error);
      setSave({ status: 'saved', xpAwarded: data.xpAwarded || 0, newMedals: data.newMedals || [] });
      queryClient.invalidateQueries({ queryKey: ['challengeAttempts', user.id] });
      queryClient.invalidateQueries({ queryKey: ['userWallet', user.id] });

      const stats = data.stats || {};
      const prevAttempts = user.challengeAttempts || 0;
      const prevPerfects = user.challengePerfects || 0;
      const counts = { challengeAttempts: stats.attempts ?? prevAttempts + 1, challengePerfects: stats.perfects ?? prevPerfects };
      updateUser(counts);
      base44.auth.updateMe(counts).catch((error) => console.error('Failed to save challenge counts:', error));
      if (prevAttempts < 1 && counts.challengeAttempts >= 1) {
        triggerCelebration(CELEBRATION_TYPES.BADGE, { badge: { title: 'Study Approved', subtitle: 'Completed your first Bible Challenge' }, userName: user.displayName }, { dedupKey: 'badge-28' });
      }
      if (prevPerfects < 1 && counts.challengePerfects >= 1) {
        triggerCelebration(CELEBRATION_TYPES.BADGE, { badge: { title: 'Hidden in the Heart', subtitle: 'Perfect score on a Bible Challenge' }, userName: user.displayName }, { dedupKey: 'badge-29' });
      }
    } catch (error) {
      console.error('[challenge] save failed:', error);
      setSave({ status: 'error' });
    }
  }, [challenge, questions, queryClient, triggerCelebration, updateUser, user]);

  const handleAnswered = (correct) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = correct;
      return next;
    });
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      return;
    }
    const score = answers.filter(Boolean).length;
    track('challenge_completed', { challengeId: challenge.id, score, total: questions.length });
    setStage('results');
    submit(answers);
  };

  const leave = () => navigate(returnTo, { replace: true });

  if (!challenge) {
    return (
      <Screen>
        <div className="px-6 pt-16 text-center">
          <p className="text-lg font-bold text-foreground">Challenge not found</p>
          <Button className="mt-6 rounded-full" onClick={leave}>Go back</Button>
        </div>
      </Screen>
    );
  }

  if (logsLoading || attemptsLoading) {
    return <Screen><div className="flex justify-center pt-32"><LoadingSpinner /></div></Screen>;
  }

  if (stage === 'playing') {
    const question = questions[current];
    return (
      <Screen>
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => setConfirmQuit(true)}
            aria-label="Quit challenge"
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1 flex gap-1">
            {questions.map((q, i) => (
              <div
                key={q.id}
                className="h-1.5 flex-1 rounded-full transition-colors"
                style={{
                  background: i < current || (i === current && answers[i] !== undefined)
                    ? (answers[i] ? '#22C55E' : '#EF4444')
                    : i === current ? 'hsl(var(--foreground))' : 'hsl(var(--muted))',
                }}
              />
            ))}
          </div>
          <span className="text-sm font-bold text-muted-foreground tabular-nums w-12 text-right">{current + 1}/{questions.length}</span>
        </div>
        <ChallengeQuestion
          key={question.id}
          question={question}
          bookIndex={challenge.bookIndex}
          bookName={challenge.book}
          onAnswered={handleAnswered}
          onNext={handleNext}
          isLast={current === questions.length - 1}
        />
        <AlertDialog open={confirmQuit} onOpenChange={setConfirmQuit}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Leave the challenge?</AlertDialogTitle>
              <AlertDialogDescription>Your answers so far won't be saved. You can retake it anytime.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Going</AlertDialogCancel>
              <AlertDialogAction onClick={() => { track('challenge_quit', { challengeId: challenge.id, atQuestion: current + 1 }); leave(); }}>
                Leave
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Screen>
    );
  }

  if (stage === 'results') {
    return (
      <Screen>
        <div className="h-10" />
        <ChallengeResults
          challenge={challenge}
          questions={questions}
          answers={answers}
          previousBest={bestBeforeAttempt}
          save={save}
          onRetake={start}
          onDone={leave}
          onRetrySave={() => submit(answers)}
        />
      </Screen>
    );
  }

  const bestMedalRank = MEDALS.findIndex((m) => m.id === summary.best?.medal);

  return (
    <Screen>
      <div className="flex items-center px-4 h-14">
        <button onClick={leave} aria-label="Back" className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="px-6 pb-12">
        <div className="flex flex-col items-center text-center">
          <MedalBadge medalId={summary.best?.medal} locked={!progress.complete} size={84} />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-5">Bible Challenge</p>
          <h1 className="text-3xl font-black text-foreground mt-1">{challenge.title}</h1>
          <p className="text-base text-muted-foreground mt-2">{challenge.tagline}</p>
        </div>

        {!progress.complete ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-5 text-center">
            <div className="flex items-center justify-center gap-2 text-foreground font-bold">
              <Lock className="w-4 h-4" /> Finish {challenge.book} to unlock
            </div>
            <p className="text-sm text-muted-foreground mt-1.5">
              {progress.readCount} of {bookData.chapters} chapters read
            </p>
            <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(progress.readCount / bookData.chapters) * 100}%`, background: 'linear-gradient(90deg, #16A34A, #22C55E)' }} />
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 rounded-2xl border border-border bg-card divide-y divide-border">
              {[...MEDALS].reverse().map((m, i) => {
                const earned = bestMedalRank !== -1 && bestMedalRank <= MEDALS.indexOf(m);
                return (
                  <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                    <MedalBadge medalId={m.id} size={34} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{m.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {i === 2 ? `All ${challenge.questionsPerTest} correct` : `${minScoreFor(m, challenge.questionsPerTest)}+ correct`}
                      </p>
                    </div>
                    {earned ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600"><Check className="w-3.5 h-3.5" strokeWidth={3} /> Earned</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600"><Zap className="w-3.5 h-3.5" /> +{m.xp} XP</span>
                    )}
                  </div>
                );
              })}
            </div>

            {summary.best && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Best score: <span className="font-bold text-foreground">{summary.best.score}/{summary.best.total}</span>
                {' · '}{summary.count} {summary.count === 1 ? 'attempt' : 'attempts'}
              </p>
            )}

            <Button onClick={start} size="lg" className="w-full h-14 rounded-full text-base font-bold mt-6">
              {summary.count > 0 ? 'Retake Challenge' : 'Start Challenge'}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3 leading-relaxed">
              {challenge.questionsPerTest} questions from all {bookData.chapters} chapters · No timer<br />
              Retake anytime with new questions. Your best score counts.
            </p>
          </>
        )}
      </motion.div>
    </Screen>
  );
}
