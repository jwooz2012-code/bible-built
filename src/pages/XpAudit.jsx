import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Play, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 4000; // 4 seconds between batches to stay well under rate limit

export default function XpAudit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [log, setLog] = useState([]);
  const [totals, setTotals] = useState({ updated: 0, errors: 0, total: 0 });

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Admin access required.</p>
      </div>
    );
  }

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const runAudit = async () => {
    setRunning(true);
    setDone(false);
    setLog([]);
    setTotals({ updated: 0, errors: 0, total: 0 });

    let offset = 0;
    let totalUsers = null;
    let cumulativeUpdated = 0;
    let cumulativeErrors = 0;

    while (true) {
      setLog(prev => [...prev, { type: 'info', text: `Processing users ${offset + 1}–${offset + BATCH_SIZE}…` }]);
      
      try {
        const res = await base44.functions.invoke('auditAndFixAllUsersXp', {
          batchOffset: offset,
          batchSize: BATCH_SIZE,
        });

        const data = res.data;
        totalUsers = data.totalUsers;
        cumulativeUpdated += data.updated ?? 0;
        cumulativeErrors += data.errors ?? 0;

        setTotals({ updated: cumulativeUpdated, errors: cumulativeErrors, total: totalUsers });
        setLog(prev => [...prev, {
          type: data.errors > 0 ? 'warn' : 'success',
          text: `Batch ${offset}–${offset + BATCH_SIZE}: ${data.updated} updated, ${data.errors} errors`,
        }]);

        if (data.done || !data.nextOffset) break;
        offset = data.nextOffset;
      } catch (err) {
        setLog(prev => [...prev, { type: 'error', text: `Error at offset ${offset}: ${err.message}. Retrying after delay…` }]);
        await sleep(8000); // longer delay on error
        continue; // retry same batch
      }

      await sleep(BATCH_DELAY_MS);
    }

    setLog(prev => [...prev, { type: 'success', text: `✅ Audit complete! ${cumulativeUpdated}/${totalUsers} users updated.` }]);
    setDone(true);
    setRunning(false);
  };

  return (
    <div className="min-h-screen bg-background pb-10" style={{ paddingTop: 'max(3rem, env(safe-area-inset-top, 0px))' }}>
      <div className="max-w-lg mx-auto px-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-6 mt-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-2xl font-bold text-foreground mb-1">XP Audit</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Recalculates every user's XP purely from reading log verse math (2 XP/verse + daily bonuses), minus artifact purchases. Ignores the XP transaction ledger entirely for a clean, accurate reset.
        </p>

        {/* Summary */}
        {totals.total > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-foreground">{totals.total}</p>
              <p className="text-xs text-muted-foreground">Total users</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-green-600">{totals.updated}</p>
              <p className="text-xs text-muted-foreground">Updated</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-red-500">{totals.errors}</p>
              <p className="text-xs text-muted-foreground">Errors</p>
            </div>
          </div>
        )}

        {/* Start button */}
        {!running && !done && (
          <button
            onClick={runAudit}
            className="w-full h-12 rounded-xl bg-foreground text-background font-semibold flex items-center justify-center gap-2 mb-6"
          >
            <Play className="w-4 h-4" /> Start XP Audit
          </button>
        )}

        {running && (
          <div className="w-full h-12 rounded-xl bg-muted text-muted-foreground font-semibold flex items-center justify-center gap-2 mb-6">
            <Loader2 className="w-4 h-4 animate-spin" /> Running audit… please keep this page open
          </div>
        )}

        {done && (
          <button
            onClick={runAudit}
            className="w-full h-12 rounded-xl border border-border text-foreground font-semibold flex items-center justify-center gap-2 mb-6"
          >
            <Play className="w-4 h-4" /> Re-run Audit
          </button>
        )}

        {/* Log */}
        {log.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-2 max-h-96 overflow-y-auto">
            {log.map((entry, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                {entry.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />}
                {entry.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                {entry.type === 'warn' && <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                {entry.type === 'info' && <Loader2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
                <span className={
                  entry.type === 'success' ? 'text-green-700 dark:text-green-400' :
                  entry.type === 'error' ? 'text-red-600' :
                  entry.type === 'warn' ? 'text-amber-600' :
                  'text-muted-foreground'
                }>{entry.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}