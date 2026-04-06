import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';

export default function GroupDetail() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const groupId = params.get('id');
  const groupName = params.get('name') ?? 'Group';

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-5 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-foreground">{groupName}</h1>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <Users className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Group details coming in Phase 3.
          </p>
          <p className="text-xs text-muted-foreground/60">Group ID: {groupId}</p>
        </div>
      </div>
    </div>
  );
}