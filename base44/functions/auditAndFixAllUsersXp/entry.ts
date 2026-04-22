/**
 * auditAndFixAllUsersXp
 * 
 * Admin-only function to recalculate and correct all users' XP.
 * Formula: (unique chapters read * 100) + bonuses - artifact purchases
 * 
 * Updates UserWallet with correct progressXpTotal and spendableXp for all users.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PROGRESS_XP_PER_CHAPTER = 100;

async function recalculateUserXp(base44, userId) {
  try {
    // Get all reading logs for this user
    const logs = await base44.asServiceRole.entities.ReadingLog.filter(
      { 'data.userId': userId },
      '-created_date',
      2000
    );
    
    // Count unique chapters
    const uniqueChapterIds = new Set(logs.map(l => l.chapterId).filter(Boolean));
    const progressXp = uniqueChapterIds.size * PROGRESS_XP_PER_CHAPTER;
    
    // Get all transactions for this user
    const transactions = await base44.asServiceRole.entities.XPTransaction.filter(
      { 'data.userId': userId },
      '-created_date',
      2000
    );
    
    // Calculate bonuses and spending
    let bonuses = 0;
    let spent = 0;
    
    for (const tx of transactions) {
      if (tx.type === 'earn_currency') {
        bonuses += tx.amount ?? 0;
      } else if (tx.type === 'spend_currency') {
        spent += Math.abs(tx.amount ?? 0);
      }
    }
    
    // Total XP = progress XP + bonuses - spent
    const totalXp = Math.max(0, progressXp + bonuses - spent);
    const level = Math.floor(progressXp / 1000) + 1;
    
    return {
      progressXpTotal: progressXp,
      spendableXp: totalXp,
      level,
      bonuses,
      spent,
      uniqueChapters: uniqueChapterIds.size,
    };
  } catch (err) {
    throw new Error(`Failed to recalculate XP for user ${userId}: ${err.message}`);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Admin check
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    // Get all users — limit to first 500 to avoid massive timeouts
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
    
    const results = [];
    let updated = 0;
    let errors = 0;
    
    // Process sequentially with significant delays between users
    for (let i = 0; i < allUsers.length; i++) {
      const currentUser = allUsers[i];
      
      try {
        // Recalculate XP for this user
        const calculated = await recalculateUserXp(base44, currentUser.id);
        
        // Get or create wallet
        const wallets = await base44.asServiceRole.entities.UserWallet.filter(
          { 'data.userId': currentUser.id },
          '-created_date',
          1
        );
        
        let wallet;
        const now = new Date().toISOString();
        
        if (wallets.length > 0) {
          // Update existing wallet
          wallet = wallets[0];
          wallet = await base44.asServiceRole.entities.UserWallet.update(wallet.id, {
            progressXpTotal: calculated.progressXpTotal,
            spendableXp: calculated.spendableXp,
            level: calculated.level,
            updatedAt: now,
          });
        } else {
          // Create new wallet
          wallet = await base44.asServiceRole.entities.UserWallet.create({
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
          progressXpTotal: calculated.progressXpTotal,
          spendableXp: calculated.spendableXp,
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
      
      // Longer delay to avoid rate limiting
      if ((i + 1) < allUsers.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return Response.json({
      success: true,
      totalUsers: allUsers.length,
      updated,
      errors,
      results: results.slice(0, 50), // Return first 50 for logs
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});