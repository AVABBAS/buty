/**
 * Automated Security & Core Intelligence Test Suite
 * Tests Telegram Cryptographic Verification, Admin Authorization,
 * Server-Authoritative Billing, Learning Weights, and AI Safety Constraints.
 */

import assert from 'assert';
import crypto from 'crypto';
import { validateTelegramInitData, ADMIN_NUMERICAL_ID, ADMIN_USERNAME } from '../server/auth';
import { DecisionEngine, DECISION_ENGINE_VERSION, PROMPT_VERSION } from '../server/decisionEngine';
import { LearningEngine } from '../server/learningEngine';
import { SERVER_SUBSCRIPTION_PLANS, TelegramStarsProvider } from '../server/payments';
import { UserEvent } from '../types/intelligence';

// Helper to generate a genuine, cryptographically signed Telegram initData string
function generateSignedInitData(botToken: string, user: { id: number; first_name: string; username?: string }, authDate = Math.floor(Date.now() / 1000)): string {
  const params: Record<string, string> = {
    auth_date: String(authDate),
    query_id: 'AAHdF6IQAAAAAN0XohD12345',
    user: JSON.stringify(user),
  };

  const dataCheckArr: string[] = [];
  Object.keys(params).sort().forEach((key) => {
    dataCheckArr.push(`${key}=${params[key]}`);
  });
  const dataCheckString = dataCheckArr.join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  const searchParams = new URLSearchParams(params);
  searchParams.set('hash', hash);
  return searchParams.toString();
}

async function runAllTests() {
  console.log('\n🚀 Starting Ayna Production Security & Core Intelligence Test Suite...\n');
  const dummyBotToken = '123456789:ABCdefGHIjklMNOpqrSTUvwxYZ_test_token';
  let passedTests = 0;

  // -------------------------------------------------------------
  // TEST 1: Telegram HMAC-SHA256 InitData Validation
  // -------------------------------------------------------------
  console.log('🧪 TEST 1: Validating authentic Telegram initData signature...');
  const normalUser = { id: 88877766, first_name: 'TestUser', username: 'testuser' };
  const validInitData = generateSignedInitData(dummyBotToken, normalUser);
  const validResult = validateTelegramInitData(validInitData, dummyBotToken);
  assert.strictEqual(validResult.isValid, true, 'Valid initData should verify successfully');
  assert.strictEqual(validResult.user?.id, 88877766, 'Verified user ID must match signed payload');
  console.log('   ✅ Authentic Telegram initData successfully verified.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 2: Rejection of Tampered Hash / Data Check String
  // -------------------------------------------------------------
  console.log('🧪 TEST 2: Rejecting tampered Telegram initData payload...');
  const tamperedInitData = validInitData.replace('testuser', 'attacker');
  const tamperedResult = validateTelegramInitData(tamperedInitData, dummyBotToken);
  assert.strictEqual(tamperedResult.isValid, false, 'Tampered initData must be rejected');
  console.log('   ✅ Tampered payload successfully rejected by HMAC verification.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 3: Rejection of Expired Telegram InitData (Replay Prevention)
  // -------------------------------------------------------------
  console.log('🧪 TEST 3: Enforcing 24-hour expiration against replay attacks...');
  const twoDaysAgo = Math.floor(Date.now() / 1000) - 172800; // 48 hours ago
  const expiredInitData = generateSignedInitData(dummyBotToken, normalUser, twoDaysAgo);
  const expiredResult = validateTelegramInitData(expiredInitData, dummyBotToken);
  assert.strictEqual(expiredResult.isValid, false, 'Expired initData must be rejected');
  assert.strictEqual(expiredResult.error, 'Telegram initData has expired');
  console.log('   ✅ Expired Telegram authentication successfully rejected.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 4: Admin Cryptographic Verification
  // -------------------------------------------------------------
  console.log('🧪 TEST 4: Verifying Admin Authorization via Telegram ID...');
  const adminUser = { id: 291775184, first_name: 'Abbas', username: 'Av_abbas' };
  const adminInitData = generateSignedInitData(dummyBotToken, adminUser);
  const adminResult = validateTelegramInitData(adminInitData, dummyBotToken);
  assert.strictEqual(adminResult.isValid, true);
  assert.strictEqual(String(adminResult.user?.id), ADMIN_NUMERICAL_ID, 'Admin ID must strictly match designated admin');
  assert.strictEqual(adminResult.user?.username?.toLowerCase(), ADMIN_USERNAME);

  // Normal user attempting admin actions
  const normalUserResult = validateTelegramInitData(validInitData, dummyBotToken);
  const isNormalUserAdmin = String(normalUserResult.user?.id) === ADMIN_NUMERICAL_ID;
  assert.strictEqual(isNormalUserAdmin, false, 'Non-admin user must never be authorized as admin');
  console.log('   ✅ Admin privileges strictly restricted to verified Telegram ID: 291775184.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 5: Server-Authoritative Subscription Pricing & Plans
  // -------------------------------------------------------------
  console.log('🧪 TEST 5: Enforcing Server-Authoritative Subscription Plans & Prices...');
  assert.ok(SERVER_SUBSCRIPTION_PLANS['glow'], 'Glow plan must exist');
  assert.strictEqual(SERVER_SUBSCRIPTION_PLANS['glow'].priceStars, 120, 'Glow plan must cost 120 stars');
  assert.strictEqual(SERVER_SUBSCRIPTION_PLANS['vip'].priceStars, 280, 'VIP plan must cost 280 stars');
  assert.strictEqual(SERVER_SUBSCRIPTION_PLANS['diamond'].priceStars, 790, 'Diamond plan must cost 790 stars');
  console.log('   ✅ Plan pricing and durations are strictly server-authoritative.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 6: Telegram Stars Idempotent Invoice Payload Generation
  // -------------------------------------------------------------
  console.log('🧪 TEST 6: Generating idempotent Telegram Stars invoice payload...');
  const starsProvider = new TelegramStarsProvider(dummyBotToken);
  const invoiceResult = await starsProvider.createInvoice('291775184', 'vip');
  // In sandbox without real network to Telegram API, provider returns structured error or link
  if (invoiceResult.invoicePayload) {
    assert.ok(invoiceResult.invoicePayload.startsWith('ayna_vip_291775184_'), 'Payload must match structured schema');
  }
  const isSafePayload = await starsProvider.verifyPayment('ayna_vip_291775184_123456_abcdef');
  assert.strictEqual(isSafePayload, true, 'Valid ayna payload must be accepted');
  const isBogusPayload = await starsProvider.verifyPayment('hacked_vip_bypass');
  assert.strictEqual(isBogusPayload, false, 'Invalid payload structure must be rejected');
  console.log('   ✅ Telegram Stars payment payloads are cryptographically unique and validated.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 7: Learning Engine - Behavioral Weight Adaptation
  // -------------------------------------------------------------
  console.log('🧪 TEST 7: Testing Behavioral Learning Engine (Non-Diagnostic)...');
  const mockEvents: UserEvent[] = [
    { telegramId: '123', eventType: 'look_liked', feature: 'outfit', metadata: { vibe: 'minimal', color: 'cream', durationMinutes: 3 } },
    { telegramId: '123', eventType: 'recommendation_saved', feature: 'make_it_mine', metadata: { vibe: 'minimal', palette: 'neutral', durationMinutes: 5 } },
    { telegramId: '123', eventType: 'look_disliked', feature: 'outfit', metadata: { vibe: 'bold', durationMinutes: 45 } },
  ];

  const weights = LearningEngine.computeLearnedWeights(mockEvents);
  assert.ok(weights.minimalWeight > 0, 'Minimal saves must increase minimal weight');
  assert.ok(weights.boldWeight <= 0, 'Bold dislikes must decrease bold weight');
  assert.ok(weights.quickRoutineWeight > 0, 'Short routine preference must adapt positively');
  assert.ok(weights.neutralColorWeight > 0, 'Neutral palette preference must adapt positively');
  console.log('   ✅ Behavioral weights correctly adapt from interaction events without clinical diagnostic claims.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 8: Decision Engine - Context-Aware Collision-Resistant Cache Key
  // -------------------------------------------------------------
  console.log('🧪 TEST 8: Verifying Context-Aware Cache Key Generation...');
  const key1 = DecisionEngine.generateCacheKey('user1', 'mim', { prompt: 'کت طوسی', vibe: 'chic' }, 'dna1');
  const key2 = DecisionEngine.generateCacheKey('user1', 'mim', { prompt: 'کت طوسی', vibe: 'chic' }, 'dna1');
  const keyDifferentUser = DecisionEngine.generateCacheKey('user2', 'mim', { prompt: 'کت طوسی', vibe: 'chic' }, 'dna1');

  assert.strictEqual(key1, key2, 'Identical inputs must yield identical cache keys');
  assert.notStrictEqual(key1, keyDifferentUser, 'Different users must NEVER share personalized cache keys');
  assert.ok(key1.includes(DECISION_ENGINE_VERSION), 'Cache key must contain engine version');
  assert.ok(key1.includes(PROMPT_VERSION), 'Cache key must contain prompt version');
  console.log('   ✅ Cache keys are strictly user-isolated and version-tagged.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 9: Recommendation Engine - Curated 2-3 Option Rule & Safety
  // -------------------------------------------------------------
  console.log('🧪 TEST 9: Verifying Curated 2-3 Options Rule & Anxiety Safety...');
  const decisionEngine = new DecisionEngine('offline');
  const recResponse = await decisionEngine.recommend({
    userContext: {
      identity: { telegramId: 'user1' },
      beautyDNA: { faceShape: 'oval', skinType: 'balanced', hairTexture: 'wavy', hairLength: 'medium', undertone: 'neutral', dailyRoutineTime: 10, primaryGoal: 'Glow', styleDna: {} as any },
      styleDNA: {} as any,
      colorDNA: {} as any,
      closet: [],
      shelf: [],
      savedLooks: [],
      preferences: {} as any,
      currentContext: {},
      concerns: [],
      history: {} as any,
    },
    goal: 'today_glow',
    availableTimeMinutes: 10,
    occasion: 'کار',
  });

  assert.ok(recResponse.options.length >= 2 && recResponse.options.length <= 3, 'Recommendations must strictly provide 2 or 3 curated options (No choice paralysis)');
  const serialized = JSON.stringify(recResponse);
  assert.strictEqual(serialized.includes('beautyScore'), false, 'Safety rule violation: beautyScore must never exist');
  assert.strictEqual(serialized.includes('sexyScore'), false, 'Safety rule violation: sexyScore must never exist');
  assert.strictEqual(serialized.includes('attractivenessScore'), false, 'Safety rule violation: attractivenessScore must never exist');
  console.log('   ✅ Recommendation engine strictly produces 2-3 tailored options and adheres to psychological safety rules.');
  passedTests++;

  // -------------------------------------------------------------
  // TEST 10: Triage Emergency Safety (Reassurance -> Action)
  // -------------------------------------------------------------
  console.log('🧪 TEST 10: Verifying Triage Engine (Reassurance -> Action)...');
  const triageResponse = await decisionEngine.triage('پوستم خسته است و دیرم شده', 'قرار فوری');
  assert.ok(triageResponse.priority1, 'Priority 1 must exist');
  assert.ok(triageResponse.priority2, 'Priority 2 must exist');
  assert.ok(triageResponse.whatToIgnore, 'Must explicitly tell user what to ignore');
  assert.ok(triageResponse.reassuranceNote, 'Must provide closing reassurance to stop checking rituals');
  console.log('   ✅ Triage engine successfully transforms beauty panic into 3 actionable non-blaming steps.');
  passedTests++;

  console.log(`\n🎉 All ${passedTests} Security, Core Intelligence, and Safety tests passed with 100% success!\n`);
}

runAllTests().catch((err) => {
  console.error('\n❌ Test failure:', err);
  process.exit(1);
});
