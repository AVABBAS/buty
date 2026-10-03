/**
 * Phase 2 Automated Data Architecture & User Ownership Test Suite
 * Validates:
 * 1. User Creation & Upsert
 * 2. Ownership Isolation & Cross-User Protection
 * 3. Authoritative Subscription Single Source of Truth
 * 4. Automatic Expiry Calculation
 * 5. Atomic Payment Settlement & Duplicate Protection (Idempotency)
 * 6. Preference & Behavioral Weight Persistence
 * 7. Event Logging, Taxonomy, and Retention Pruning
 * 8. User Lifecycle Distinctions (Reset Personalization vs Wipe User Data vs Delete Account)
 * 9. Financial Payment Ledger Anonymization for Audit
 * 10. UserContext Assembly for Phase 3 Intelligence Foundation
 * 11. Database Constraint Validation & Input Sanitization
 */

import assert from 'assert';
import { db, isSafeId } from '../db/database';

async function runDataArchitectureTests() {
  console.log('\n🚀 Starting Ayna Phase 2: Data Architecture & Ownership Test Suite...\n');
  await db.init();
  let passedTests = 0;

  const userA = 'user_test_alice_1001';
  const userB = 'user_test_bob_2002';

  // Cleanup before starting
  await db.deleteAccount(userA, { retainAuditPayments: false });
  await db.deleteAccount(userB, { retainAuditPayments: false });

  // -------------------------------------------------------------
  // TEST 1: User Creation & Upsert
  // -------------------------------------------------------------
  console.log('🧪 TEST 1: User Creation & Transactional Upsert...');
  const syncSuccess = await db.syncUserData({
    telegramId: userA,
    firstName: 'Alice',
    username: 'alice_ayna',
    dna: { faceShape: 'oval', skinType: 'balanced' },
    closet: [{ id: 'c1', name: 'کت طوسی', category: 'outerwear', color: 'طوسی', vibe: 'minimal' }],
    shelf: [{ id: 's1', name: 'سرم نیاسینامید', category: 'skincare', purpose: 'glow', isEssential: true }],
    savedLooks: [{ id: 'l1', title: 'لوک مینیمال کار', vibe: 'chic', steps: [], pieces: [], occasion: 'کار', date: '2026-10-03' }],
  });
  assert.strictEqual(syncSuccess, true, 'User A creation should succeed');

  const userDataA = await db.getUserData(userA);
  assert.ok(userDataA, 'User A data must exist');
  assert.strictEqual(userDataA.profile.firstName || userDataA.profile.first_name, 'Alice');
  assert.strictEqual(userDataA.closet?.length, 1);
  assert.strictEqual(userDataA.closet?.[0].name, 'کت طوسی');
  assert.strictEqual(userDataA.shelf?.length, 1);
  assert.strictEqual(userDataA.savedLooks?.length, 1);
  console.log('   ✅ User creation and asset synchronization verified.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 2: Ownership Isolation (No Cross-User Leaks)
  // -------------------------------------------------------------
  console.log('🧪 TEST 2: User Ownership Isolation & Zero Cross-User Leakage...');
  const userDataBBefore = await db.getUserData(userB);
  assert.strictEqual(userDataBBefore, null, 'User B must not exist before creation');

  await db.syncUserData({
    telegramId: userB,
    firstName: 'Bob',
    username: 'bob_ayna',
    closet: [{ id: 'cb1', name: 'پیراهن آبی', category: 'top', color: 'آبی', vibe: 'casual' }],
  });

  const freshUserA = await db.getUserData(userA);
  const freshUserB = await db.getUserData(userB);

  assert.strictEqual(freshUserA?.closet?.[0].name, 'کت طوسی', 'User A closet must remain isolated');
  assert.strictEqual(freshUserB?.closet?.[0].name, 'پیراهن آبی', 'User B closet must belong only to User B');
  console.log('   ✅ Explicit user scoping strictly isolates user assets.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 3: Authoritative Subscription Single Source of Truth
  // -------------------------------------------------------------
  console.log('🧪 TEST 3: Authoritative Subscription Management...');
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 1);

  await db.setSubscription(userA, {
    tier: 'vip',
    isActive: true,
    planName: 'اشتراک VIP',
    paymentMethod: 'stars',
    expiresAt: futureDate.toISOString(),
  });

  const subA = await db.getSubscription(userA);
  assert.ok(subA, 'Subscription must exist');
  assert.strictEqual(subA.tier, 'vip');
  assert.strictEqual(subA.isActive, true, 'Active future subscription must be active');
  assert.strictEqual(subA.planName, 'اشتراک VIP');
  console.log('   ✅ Subscription is strictly authoritative and properly retrieved.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 4: Automatic Expiry Calculation (Server-Authoritative)
  // -------------------------------------------------------------
  console.log('🧪 TEST 4: Automatic Subscription Expiry Calculation...');
  const pastDate = new Date(Date.now() - 86400000 * 2); // 2 days ago

  await db.setSubscription(userB, {
    tier: 'glow',
    isActive: true, // Client or stale record claims active
    planName: 'اشتراک منقضی',
    paymentMethod: 'stars',
    expiresAt: pastDate.toISOString(),
  });

  const subB = await db.getSubscription(userB);
  assert.ok(subB, 'Subscription record must exist');
  assert.strictEqual(subB.isActive, false, 'Expired subscription must automatically evaluate to isActive=false');
  console.log('   ✅ Past expiration dates automatically revoke active entitlements server-side.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 5: Atomic Payment Settlement & Duplicate Protection (Idempotency)
  // -------------------------------------------------------------
  console.log('🧪 TEST 5: Atomic Payment Settlement & Idempotency...');
  const invoicePayload = `ayna_vip_${userA}_${Date.now()}_testnonce`;

  // Create pending payment record
  await db.createPaymentRecord({
    telegramId: userA,
    provider: 'telegram_stars',
    planId: 'vip',
    amountStars: 280,
    invoicePayload,
  });

  // Attempt duplicate creation with same payload (must be ignored)
  const dupCreate = await db.createPaymentRecord({
    telegramId: userA,
    provider: 'telegram_stars',
    planId: 'vip',
    amountStars: 280,
    invoicePayload,
  });
  assert.strictEqual(dupCreate, true, 'Duplicate insert must safely handle unique constraint');

  // First settlement attempt
  const settlement1 = await db.settlePaymentAndGrantSubscription({
    invoicePayload,
    chargeId: 'charge_tx_998877',
    subscription: {
      tier: 'vip',
      planName: 'اشتراک VIP سالانه',
      durationMonths: 3,
      paymentMethod: 'stars',
    },
    eventMetadata: { planId: 'vip', starsAmount: 280 },
  });

  assert.strictEqual(settlement1.success, true, 'First payment settlement must succeed');
  assert.strictEqual(settlement1.subscription?.isActive, true);

  // Second duplicate settlement attempt (e.g. duplicate webhook delivery from Telegram)
  const settlement2 = await db.settlePaymentAndGrantSubscription({
    invoicePayload,
    chargeId: 'charge_tx_998877',
    subscription: {
      tier: 'vip',
      planName: 'اشتراک VIP سالانه',
      durationMonths: 3,
      paymentMethod: 'stars',
    },
  });

  assert.strictEqual(settlement2.success, false, 'Duplicate settlement must not re-process');
  assert.strictEqual(settlement2.duplicate, true, 'Duplicate must be explicitly identified');
  console.log('   ✅ Payment settlement is atomic, transactional, and protected against duplicate webhooks.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 6: Preferences & Behavioral Learned Weights Persistence
  // -------------------------------------------------------------
  console.log('🧪 TEST 6: Preference & Behavioral Weight Persistence...');
  await db.saveLearnedPreferences(userA, { avoidHeavyTextures: true }, { minimalWeight: 0.75, neutralColorWeight: 0.5 });
  const prefsA = await db.getLearnedPreferences(userA);

  assert.ok(prefsA, 'Preferences must exist');
  assert.strictEqual(prefsA.preferences.avoidHeavyTextures, true);
  assert.strictEqual(prefsA.learnedWeights.minimalWeight, 0.75);
  console.log('   ✅ Preferences and learned weights persist accurately.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 7: Event Logging, Taxonomy, and Retention Pruning
  // -------------------------------------------------------------
  console.log('🧪 TEST 7: Event Logging, Querying & Retention Pruning...');
  await db.recordEvent({
    telegramId: userA,
    eventType: 'recommendation_saved',
    feature: 'make_it_mine',
    metadata: { vibe: 'minimal', piecesCount: 3 },
  });

  await db.recordEvent({
    telegramId: userA,
    eventType: 'look_liked',
    feature: 'outfit_mixer',
    metadata: { outfitId: 'look_99' },
  });

  const events = await db.getUserEvents(userA, 10);
  assert.ok(events.length >= 2, 'User A must have at least 2 events');
  assert.strictEqual(events[0].telegramId, userA);

  const pruned = await db.pruneOldEvents(90);
  assert.ok(typeof pruned === 'number', 'Pruning must return count of deleted events');
  console.log('   ✅ Events log correctly, respect user scoping, and support data minimization pruning.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 8: User Lifecycle: Reset Personalization (Keeps Account & Subscription)
  // -------------------------------------------------------------
  console.log('🧪 TEST 8: Lifecycle Distinction - Reset Personalization...');
  const resetSuccess = await db.resetPersonalization(userA);
  assert.strictEqual(resetSuccess, true, 'Reset personalization must succeed');

  const afterResetData = await db.getUserData(userA);
  assert.ok(afterResetData, 'User account must still exist');
  assert.strictEqual(afterResetData.closet?.length, 0, 'Closet must be cleared on reset');
  assert.strictEqual(afterResetData.shelf?.length, 0, 'Shelf must be cleared on reset');
  assert.strictEqual(afterResetData.savedLooks?.length, 0, 'Saved looks must be cleared on reset');

  // Verify that paid subscription was NOT wiped by resetting styling preferences!
  const subAfterReset = await db.getSubscription(userA);
  assert.ok(subAfterReset, 'Paid subscription must survive personalization reset');
  assert.strictEqual(subAfterReset.tier, 'vip');
  assert.strictEqual(subAfterReset.isActive, true);
  console.log('   ✅ Personalization reset clears styling data without destroying paid subscription.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 9: Lifecycle Distinction - Delete User Data (Preserves Account Shell)
  // -------------------------------------------------------------
  console.log('🧪 TEST 9: Lifecycle Distinction - Delete User Data...');
  const deleteDataSuccess = await db.deleteUserData(userB);
  assert.strictEqual(deleteDataSuccess, true, 'Delete user data must succeed');

  const afterDeleteUserDataB = await db.getUserData(userB);
  assert.ok(afterDeleteUserDataB?.profile, 'User account shell remains');
  assert.strictEqual(afterDeleteUserDataB?.closet, undefined, 'Product data must be wiped');
  console.log('   ✅ Delete user data clears product assets while preserving user account.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 10: Lifecycle Distinction - Full Account Deletion & Payment Anonymization
  // -------------------------------------------------------------
  console.log('🧪 TEST 10: Full Account Deletion with Financial Audit Anonymization...');
  const deleteAccountSuccess = await db.deleteAccount(userA, { retainAuditPayments: true });
  assert.strictEqual(deleteAccountSuccess, true, 'Delete account must succeed');

  const goneUserA = await db.getUserData(userA);
  assert.strictEqual(goneUserA, null, 'User account must be completely gone');

  const goneSubA = await db.getSubscription(userA);
  assert.strictEqual(goneSubA, null, 'Subscription must be removed');

  const goneEventsA = await db.getUserEvents(userA);
  assert.strictEqual(goneEventsA.length, 0, 'User events must be removed');

  // Verify financial audit preservation: Payment record retained with anonymized identity
  const paymentRecord = await db.getPaymentRecord(invoicePayload);
  assert.ok(paymentRecord, 'Financial ledger record must be preserved for audit');
  assert.ok(paymentRecord.telegram_id?.startsWith('anonymized_') || paymentRecord.telegramId?.startsWith('anonymized_'));
  console.log('   ✅ Full account deletion safely purges personal data while anonymizing financial audit trail.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 11: UserContext Assembly for Phase 3 Readiness
  // -------------------------------------------------------------
  console.log('🧪 TEST 11: UserContext Assembly for Phase 3 Intelligence Foundation...');
  const userC = 'user_test_clara_3003';
  await db.syncUserData({
    telegramId: userC,
    firstName: 'Clara',
    dna: {
      faceShape: 'diamond',
      skinType: 'combination',
      hairTexture: 'curly',
      styleDna: { minimalVsMaximal: 60, colorfulVsNeutral: 40 },
    },
    closet: [{ id: 'c3', name: 'شومیز ساتن', category: 'top', color: 'کرم', vibe: 'elegant' }],
  });

  const userContext = await db.getUserContext(userC);
  assert.strictEqual(userContext.identity.telegramId, userC);
  assert.strictEqual(userContext.identity.firstName, 'Clara');
  assert.strictEqual(userContext.beautyDNA.faceShape, 'diamond');
  assert.strictEqual(userContext.styleDNA.minimalVsMaximal, 60);
  assert.strictEqual(userContext.closet.length, 1);
  assert.ok(Array.isArray(userContext.colorDNA.favoriteColors), 'ColorDNA must provide default color palette');
  assert.ok(userContext.preferences, 'User preferences must be initialized');
  assert.ok(typeof userContext.history.totalLooksTried === 'number');

  // Clean up test user C
  await db.deleteAccount(userC, { retainAuditPayments: false });
  console.log('   ✅ UserContext cleanly and consistently assembles complete intelligence foundation.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 12: Database Constraint Validation & Input Sanitization
  // -------------------------------------------------------------
  console.log('🧪 TEST 12: Input Sanitization & Prototype Pollution Protection...');
  assert.strictEqual(isSafeId('normal_id_123'), true);
  assert.strictEqual(isSafeId('__proto__'), false, 'Prototype pollution attempt must be rejected');
  assert.strictEqual(isSafeId('constructor'), false, 'Constructor pollution attempt must be rejected');
  assert.strictEqual(isSafeId(''), false, 'Empty ID must be rejected');
  assert.strictEqual(isSafeId('a'.repeat(65)), false, 'Overly long ID must be rejected');
  assert.strictEqual(isSafeId('bad ID with spaces!'), false, 'Malformed characters must be rejected');

  const invalidSync = await db.syncUserData({ telegramId: '__proto__' as any });
  assert.strictEqual(invalidSync, false, 'Unsafe ID must fail syncUserData immediately');
  console.log('   ✅ Input sanitization and safety guards strictly enforced.');
  passedTests++;

  console.log(`\n🎉 All ${passedTests} Data Architecture & User Ownership tests passed with 100% success!\n`);
}

runDataArchitectureTests().catch((err) => {
  console.error('\n❌ Data Architecture test failure:', err);
  process.exit(1);
});
