import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MoreHorizontal, Pencil, Trash2, PartyPopper, Undo2, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { AvatarDisplay } from '@/components/profile/AvatarPicker';
import { timeAgo, displayName } from '@/components/community/cheers';
import { triggerHaptic } from '@/components/utils/haptics';
import { useCelebration, CELEBRATION_TYPES } from '@/components/celebration/CelebrationContext';
import { PRAYER_BADGES } from '@/components/badges/badgeEngine';
import { useGroupBoard, useBoardActions, boardError } from './useGroupBoard';
import { markBoardSeen } from './boardSeen';

const MAX_TEXT = 1000;
const MAX_PASSAGE = 60;
const PAGE = 10;
const LONG_POST = 320;

const BOARD_INFO = {
  takeaway: {
    cta: 'Share a takeaway',
    title: 'Share a takeaway',
    placeholder: 'What stood out to you in your reading?',
    emptyTitle: 'No takeaways yet',
    emptyText: 'Share something that stood out in your reading.',
    react: { emoji: '❤️', label: 'Amen' },
  },
  prayer: {
    cta: 'Share a prayer request',
    title: 'Prayer request',
    placeholder: 'How can the group pray for you?',
    emptyTitle: 'No prayer requests yet',
    emptyText: 'Share a request and let your group lift you up.',
    react: { emoji: '🙏', label: 'I prayed' },
  },
};

function Composer({ board, post, onClose, onSubmit }) {
  const info = BOARD_INFO[board];
  const editing = !!post;
  const [text, setText] = useState(post?.text ?? '');
  const [passage, setPassage] = useState(post?.passage ?? '');
  const [anonymous, setAnonymous] = useState(false);
  const [saving, setSaving] = useState(false);
  const textRef = useRef(null);

  useEffect(() => { const t = setTimeout(() => textRef.current?.focus(), 150); return () => clearTimeout(t); }, []);

  const trimmed = text.trim();
  const canPost = trimmed.length > 0 && text.length <= MAX_TEXT && !saving;

  const submit = async () => {
    if (!canPost) return;
    setSaving(true);
    const ok = await onSubmit({ text: trimmed, passage: passage.trim(), anonymous: board === 'prayer' && anonymous });
    setSaving(false);
    if (ok) onClose();
  };

  return createPortal(
    <motion.div className="fixed inset-0 z-[70] flex items-start justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={saving ? undefined : onClose} />
      {/* Sits at the top of the screen so the keyboard never covers it. */}
      <motion.div
        role="dialog"
        aria-label={editing ? 'Edit post' : info.title}
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -24, opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 340 }}
        className="relative w-full max-w-lg mx-3 rounded-3xl bg-card border border-border shadow-2xl"
        style={{ marginTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h3 className="text-[17px] font-semibold text-foreground">{editing ? 'Edit post' : info.title}</h3>
          <button onClick={onClose} disabled={saving} aria-label="Close" className="h-8 w-8 flex items-center justify-center rounded-full bg-muted">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="px-5 pb-5 space-y-3">
          <textarea
            ref={textRef}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
            placeholder={info.placeholder}
            rows={5}
            maxLength={MAX_TEXT}
            className="w-full resize-none rounded-2xl border border-border bg-muted/50 px-4 py-3 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 h-10 px-3 rounded-xl border border-border bg-muted/50 focus-within:ring-2 focus-within:ring-ring">
              <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                value={passage}
                onChange={(e) => setPassage(e.target.value.slice(0, MAX_PASSAGE))}
                placeholder="Passage (optional), e.g. John 3:16"
                maxLength={MAX_PASSAGE}
                className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <span className={`text-[11px] tabular-nums shrink-0 ${text.length > MAX_TEXT - 100 ? 'text-amber-600' : 'text-muted-foreground'}`}>
              {text.length}/{MAX_TEXT}
            </span>
          </div>
          {board === 'prayer' && !editing && (
            <label className="flex items-center gap-3 px-1 py-1 cursor-pointer select-none">
              <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="w-4 h-4 accent-green-600" />
              <span className="text-sm text-foreground">
                Post anonymously
                <span className="block text-xs text-muted-foreground">Members won't see your name</span>
              </span>
            </label>
          )}
          <button
            onClick={submit}
            disabled={!canPost}
            className="w-full h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
            style={{ background: '#16A34A' }}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editing ? 'Save' : 'Post'}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

function ConfirmDelete({ onCancel, onConfirm, isAuthor }) {
  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-6" onClick={onCancel}>
      <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        <p className="text-base font-semibold text-foreground mb-1">{isAuthor ? 'Delete post?' : 'Remove post?'}</p>
        <p className="text-sm text-muted-foreground mb-5">
          {isAuthor ? 'This removes it for everyone in the group.' : "As the group owner, you can remove posts that don't belong here."}
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 h-10 rounded-xl text-sm bg-muted text-muted-foreground font-semibold">Cancel</button>
          <button onClick={onConfirm} className="flex-1 h-10 rounded-xl text-sm font-semibold text-white" style={{ background: '#EF4444' }}>
            {isAuthor ? 'Delete' : 'Remove'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function PostMenu({ post, onEdit, onAnswered, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  const items = [
    post.mine && { label: 'Edit', icon: Pencil, run: onEdit },
    post.mine && post.board === 'prayer' && (post.answered
      ? { label: 'Not answered yet', icon: Undo2, run: () => onAnswered(false) }
      : { label: 'Mark answered', icon: PartyPopper, run: () => onAnswered(true) }),
    post.canDelete && { label: post.mine ? 'Delete' : 'Remove', icon: Trash2, run: onDelete, danger: true },
  ].filter(Boolean);
  if (items.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-label="Post options" className="h-8 w-8 -mr-1.5 flex items-center justify-center rounded-full hover:bg-muted">
        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-20 min-w-[170px] rounded-xl border border-border bg-card shadow-lg py-1">
          {items.map(({ label, icon: Icon, run, danger }) => (
            <button
              key={label}
              onClick={() => { setOpen(false); run(); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left hover:bg-muted ${danger ? 'text-red-600' : 'text-foreground'}`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({ post, onReact, onEdit, onAnswered, onDelete }) {
  const info = BOARD_INFO[post.board];
  const [expanded, setExpanded] = useState(false);
  const long = post.text.length > LONG_POST;
  // Anonymous prayers read as "Anonymous" to everyone, the author included, so they see what the group sees.
  const anonymous = post.anonymous || !post.author;
  const name = anonymous ? 'Anonymous' : displayName(post.author, 'Member');
  const answered = post.board === 'prayer' && post.answered;

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border bg-card p-4 ${answered ? 'border-green-300 dark:border-green-800' : 'border-border'}`}
      style={answered ? { background: 'color-mix(in srgb, rgb(34,197,94) 6%, hsl(var(--card)))' } : undefined}
    >
      <div className="flex items-center gap-2.5">
        {!anonymous ? (
          <AvatarDisplay initials={name[0]?.toUpperCase() ?? '?'} avatarData={post.author} size={32} />
        ) : (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm shrink-0">🙏</div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {name}{post.mine && <span className="font-normal text-muted-foreground"> (you)</span>}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {timeAgo(post.createdAt)}{post.editedAt ? ' · edited' : ''}{post.anonymous && post.mine ? ' · name hidden' : ''}
          </p>
        </div>
        {answered && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 shrink-0">🎉 Answered</span>
        )}
        <PostMenu post={post} onEdit={onEdit} onAnswered={onAnswered} onDelete={onDelete} />
      </div>

      {post.passage && (
        <p className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg bg-muted text-muted-foreground">
          <BookOpen className="w-3 h-3" /> {post.passage}
        </p>
      )}
      <p className={`mt-2 text-[15px] leading-relaxed text-foreground whitespace-pre-wrap break-words ${long && !expanded ? 'line-clamp-6' : ''}`}>
        {post.text}
      </p>
      {long && (
        <button onClick={() => setExpanded((e) => !e)} className="mt-1 text-xs font-semibold text-muted-foreground">
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      <div className="mt-3 flex items-center">
        <button
          onClick={onReact}
          aria-pressed={post.reacted}
          className="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold transition-colors"
          style={post.reacted
            ? { background: post.board === 'prayer' ? 'rgba(99,102,241,0.14)' : 'rgba(236,72,153,0.12)', color: post.board === 'prayer' ? '#4F46E5' : '#DB2777' }
            : { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
        >
          <motion.span key={post.reacted ? 'on' : 'off'} initial={{ scale: post.reacted ? 0.6 : 1 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
            {info.react.emoji}
          </motion.span>
          {info.react.label}
          {post.count > 0 && <span className="tabular-nums">· {post.count}</span>}
        </button>
      </div>
    </motion.div>
  );
}

/** One board (takeaways or prayers) of a group. The group page's tabs choose which. */
export default function GroupBoards({ group, board }) {
  const { user, updateUser } = useAuth();
  const { triggerCelebration } = useCelebration();
  const groupId = group?.id;
  const [composer, setComposer] = useState(null); // { post?: existing post when editing }
  const [confirm, setConfirm] = useState(null);
  const [shown, setShown] = useState(PAGE);
  const { data: posts = [], isLoading, isError, refetch } = useGroupBoard(groupId, board);
  const actions = useBoardActions(groupId, board);
  const info = BOARD_INFO[board];

  // Viewing a board clears its "new" dot.
  useEffect(() => {
    if (isLoading || isError || !user?.id) return;
    markBoardSeen(user.id, groupId, board);
  }, [isLoading, isError, user?.id, groupId, board]);

  const submit = async ({ text, passage, anonymous }) => {
    try {
      if (composer?.post) {
        await actions.edit(composer.post.id, { text, passage });
        toast('Post updated', { duration: 1400 });
      } else {
        await actions.create({ text, passage, anonymous });
        markBoardSeen(user?.id, groupId, board);
        triggerHaptic();
        toast(board === 'prayer' ? '🙏 Shared with your group' : '💡 Takeaway shared', { duration: 1600 });
      }
      return true;
    } catch (err) {
      toast.error(boardError(err));
      return false;
    }
  };

  const react = async (post) => {
    triggerHaptic();
    try {
      const res = await actions.react(post);
      if (typeof res?.prayersPrayed === 'number') {
        const before = user?.prayersPrayed ?? 0;
        const after = res.prayersPrayed;
        updateUser({ prayersPrayed: after });
        PRAYER_BADGES.forEach((b) => {
          if (before < b.target && after >= b.target) {
            triggerCelebration(CELEBRATION_TYPES.BADGE, { badge: { title: b.title, subtitle: b.subtitle }, userName: user?.displayName }, { dedupKey: `badge-${b.id}` });
          }
        });
      }
    } catch (err) {
      toast.error(boardError(err, "Couldn't send right now. Try again."));
    }
  };

  const setAnswered = async (post, answered) => {
    try {
      await actions.setAnswered(post, answered);
      if (answered) { triggerHaptic(); toast('🎉 Praise God! Marked answered', { duration: 1800 }); }
    } catch (err) {
      toast.error(boardError(err));
    }
  };

  const remove = async (post) => {
    setConfirm(null);
    try {
      await actions.remove(post.id);
      toast(post.mine ? 'Post deleted' : 'Post removed', { duration: 1400 });
    } catch (err) {
      toast.error(boardError(err, "Couldn't remove it right now. Try again."));
    }
  };

  const visible = posts.slice(0, shown);

  return (
    <div>
      <button
        onClick={() => setComposer({})}
        className="w-full flex items-center gap-3 px-4 h-12 mb-3 rounded-2xl border border-dashed border-border bg-card text-left text-sm text-muted-foreground hover:bg-muted/40 transition-colors"
      >
        <span className="text-base">{board === 'prayer' ? '🙏' : '💡'}</span>
        {info.cta}…
      </button>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1].map((i) => <div key={i} className="h-28 rounded-2xl bg-muted/60 animate-pulse" />)}
        </div>
      ) : isError ? (
        <button onClick={() => refetch()} className="w-full rounded-2xl border border-border bg-card py-6 text-sm text-muted-foreground">
          Couldn't load posts. Tap to try again.
        </button>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-8 px-6 flex flex-col items-center gap-1 text-center">
          <span className="text-2xl mb-1">{board === 'prayer' ? '🙏' : '💡'}</span>
          <p className="text-sm font-semibold text-foreground">{info.emptyTitle}</p>
          <p className="text-xs text-muted-foreground">{info.emptyText}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {visible.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onReact={() => react(post)}
                onEdit={() => setComposer({ post })}
                onAnswered={(answered) => setAnswered(post, answered)}
                onDelete={() => setConfirm(post)}
              />
            ))}
          </AnimatePresence>
          {posts.length > shown && (
            <button onClick={() => setShown((n) => n + PAGE)} className="w-full h-10 rounded-xl text-xs font-semibold bg-muted text-muted-foreground">
              Show more
            </button>
          )}
        </div>
      )}

      <AnimatePresence>
        {composer && (
          <Composer key={composer.post?.id ?? `new-${board}`} board={board} post={composer.post} onClose={() => setComposer(null)} onSubmit={submit} />
        )}
      </AnimatePresence>
      {confirm && <ConfirmDelete isAuthor={confirm.mine} onCancel={() => setConfirm(null)} onConfirm={() => remove(confirm)} />}
    </div>
  );
}
