import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PROGRESS_XP_PER_CHAPTER = 100;

async function recalculateUserXp(base44, userId) {
  try {
    const logs = await base44.asServiceRole.entities.ReadingLog.filter(
      { 'data.userId': userId },
      '-created_date',
      2000
    );
    
    const uniqueChapterIds = new Set(logs.map(l => l.chapterId).filter(Boolean));
    const progressXp = uniqueChapterIds.size * PROGRESS_XP_PER_CHAPTER;
    
    const transactions = await base44.asServiceRole.entities.XPTransaction.filter(
      { 'data.userId': userId },
      '-created_date',
      2000
    );
    
    let bonuses = 0;
    let spent = 0;
    
    for (const tx of transactions) {
      if (tx.type === 'earn_currency') {
        bonuses += tx.amount ?? 0;
      } else if (tx.type === 'spend_currency') {
        spent += Math.abs(tx.amount ?? 0);
      }
    }
    
    const totalXp = Math.max(0, progressXp + bonuses - spent);
    const level = Math.floor(progressXp / 1000) + 1;
    
    return {
      progressXpTotal: progressXp,
      spendableXp: totalXp,
      level,
    };
  } catch (err) {
    throw new Error(`Failed to recalculate XP for user ${userId}: ${err.message}`);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all early access users and admins
    const adminUsers = await base44.asServiceRole.entities.User.filter(
      { 'data.role': 'admin' },
      '-created_date',
      500
    );

    const earlyAccessUsers = await base44.asServiceRole.entities.User.filter(
      { 'data.hasEarlyAccess': true },
      '-created_date',
      500
    );

    // Combine and dedupe
    const userMap = new Map();
    for (const u of adminUsers) {
      userMap.set(u.id, u);
    }
    for (const u of earlyAccessUsers) {
      userMap.set(u.id, u);
    }

    const targetUsers = Array.from(userMap.values());
    const results = [];
    let updated = 0;
    let errors = 0;

    // Process sequentially with delays
    for (let i = 0; i < targetUsers.length; i++) {
      const currentUser = targetUsers[i];

      try {
        const calculated = await recalculateUserXp(base44, currentUser.id);

        const wallets = await base44.asServiceRole.entities.UserWallet.filter(
          { 'data.userId': currentUser.id },
          '-created_date',
          1
        );

        const now = new Date().toISOString();

        if (wallets.length > 0) {
          await base44.asServiceRole.entities.UserWallet.update(wallets[0].id, {
            progressXpTotal: calculated.progressXpTotal,
            spendableXp: calculated.spendableXp,
            level: calculated.level,
            updatedAt: now,
          });
        } else {
          await base44.asServiceRole.entities.UserWallet.create({
            userId: currentUser.id,
            progressXpTotal: calculated.progressXpTotal,
            spendableXp: calculated.spendableXp,
            level: calculated.level,
            updatedAt: now,
          });
        }

        results.push({
          userId: currentUser.id,
          email: currentUser.email,
          xp: calculated.spendableXp,
          level: calculated.level,
          status: 'updated',
        });

        updated++;
      } catch (err) {
        errors++;
        results.push({
          userId: currentUser.id,
          email: currentUser.email,
          status: 'error',
          error: err.message,
        });
      }

      if (i + 1 < targetUsers.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    return Response.json({
      success: true,
      totalProcessed: targetUsers.length,
      updated,
      errors,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});