import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

export default function AdminTools() {
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  if (user?.role !== 'admin') {
    return <div className="p-8 text-center text-muted-foreground">Admin only</div>;
  }

  const run = async (fnName) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke(fnName, {});
      setResult(res.data);
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Tools</h1>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Consolidate Wallets</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Removes duplicate UserWallet records and recomputes balances from XPTransactions.
          </p>
          <Button onClick={() => run('consolidateWallets')} disabled={loading}>
            {loading ? 'Running...' : 'Run Consolidation'}
          </Button>
        </div>

        {result && (
          <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}