/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TabType, BeautyDna, ClosetItem, BeautyProductItem, SavedLook, UserSubscription } from './types';
import { DEFAULT_CLOSET, DEFAULT_SHELF } from './data/beautyKnowledge';
import { TelegramHeader } from './components/TelegramHeader';
import { Navigation } from './components/Navigation';
import { HomeTab } from './components/tabs/HomeTab';
import { MakeItMineTab } from './components/tabs/MakeItMineTab';
import { DnaTab } from './components/tabs/DnaTab';
import { ClosetTab } from './components/tabs/ClosetTab';
import { SosTab } from './components/tabs/SosTab';
import { WisdomTab } from './components/tabs/WisdomTab';
import { AdminTab } from './components/tabs/AdminTab';
import { ChatCoachModal } from './components/ChatCoachModal';
import { GoodEnoughModal } from './components/GoodEnoughModal';
import { ScannerModal } from './components/ScannerModal';
import { RoutinePlayerModal } from './components/RoutinePlayerModal';
import { OutfitMixerModal } from './components/OutfitMixerModal';
import { SecondOpinionModal } from './components/SecondOpinionModal';
import { TelegramLauncherModal } from './components/TelegramLauncherModal';
import { ReadyCheckModal } from './components/modals/ReadyCheckModal';
import { BeforeYouDoItModal } from './components/modals/BeforeYouDoItModal';
import { CycleBeautyModal } from './components/modals/CycleBeautyModal';
import { IntimateCareModal } from './components/modals/IntimateCareModal';
import { BeautyDefenseModal } from './components/modals/BeautyDefenseModal';
import { SmartShoppingModal } from './components/modals/SmartShoppingModal';
import { PhotoCoachModal } from './components/modals/PhotoCoachModal';
import { ExpressVibesModal } from './components/modals/ExpressVibesModal';
import { BeautySearchModal } from './components/modals/BeautySearchModal';
import { MakeupHairStudioModal } from './components/modals/MakeupHairStudioModal';
import { SkinProblemSolverModal } from './components/modals/SkinProblemSolverModal';
import { BodyAccessoriesModal } from './components/modals/BodyAccessoriesModal';
import { DailyChallengeModal } from './components/modals/DailyChallengeModal';
import { PremiumModal } from './components/modals/PremiumModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { safeStorage } from './utils/safeStorage';

const INITIAL_DNA: BeautyDna = {
  faceShape: 'oval',
  skinType: 'balanced',
  hairTexture: 'wavy',
  hairLength: 'medium',
  undertone: 'neutral',
  dailyRoutineTime: 10,
  primaryGoal: 'آراستگی سریع و راحت متناسب با سبک زندگی من',
  styleDna: {
    minimalVsMaximal: 35,
    colorfulVsNeutral: 30,
    boldVsSubtle: 45,
    feminineVsStructured: 55,
    comfortVsFashion: 65,
    primaryArchetype: 'soft-romantic',
    secondaryArchetype: 'minimal',
    preferredPalette: 'chic',
  },
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isDesktopFrame, setIsDesktopFrame] = useState<boolean>(true);
  const [isCoachOpen, setIsCoachOpen] = useState<boolean>(false);
  const [isGoodEnoughOpen, setIsGoodEnoughOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isRoutineOpen, setIsRoutineOpen] = useState<boolean>(false);
  const [routineTime, setRoutineTime] = useState<number>(10);
  const [isMixerOpen, setIsMixerOpen] = useState<boolean>(false);
  const [isSecondOpinionOpen, setIsSecondOpinionOpen] = useState<boolean>(false);
  const [isTelegramSetupOpen, setIsTelegramSetupOpen] = useState<boolean>(false);
  const [isReadyCheckOpen, setIsReadyCheckOpen] = useState<boolean>(false);
  const [isBeforeYouDoItOpen, setIsBeforeYouDoItOpen] = useState<boolean>(false);
  const [isCycleBeautyOpen, setIsCycleBeautyOpen] = useState<boolean>(false);
  const [isIntimateCareOpen, setIsIntimateCareOpen] = useState<boolean>(false);
  const [isBeautyDefenseOpen, setIsBeautyDefenseOpen] = useState<boolean>(false);
  const [isSmartShoppingOpen, setIsSmartShoppingOpen] = useState<boolean>(false);
  const [isPhotoCoachOpen, setIsPhotoCoachOpen] = useState<boolean>(false);
  const [expressVibeMode, setExpressVibeMode] = useState<'surprise' | 'cute' | 'refresh' | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMakeupStudioOpen, setIsMakeupStudioOpen] = useState<boolean>(false);
  const [isHairStudioOpen, setIsHairStudioOpen] = useState<boolean>(false);
  const [isSkinProblemOpen, setIsSkinProblemOpen] = useState<boolean>(false);
  const [isBodyAccessoriesOpen, setIsBodyAccessoriesOpen] = useState<boolean>(false);
  const [isDailyChallengeOpen, setIsDailyChallengeOpen] = useState<boolean>(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState<boolean>(false);
  const [tgUserFirstName, setTgUserFirstName] = useState<string | undefined>();
  const [tgUserId, setTgUserId] = useState<string | undefined>();
  const [tgUsername, setTgUsername] = useState<string | undefined>();

  // Subscription State
  const [userSubscription, setUserSubscription] = useState<UserSubscription>(() => {
    return safeStorage.get('ayna_subscription', { tier: 'free', isActive: false });
  });

  const handleActivateSubscription = (sub: UserSubscription) => {
    setUserSubscription(sub);
    safeStorage.set('ayna_subscription', sub);
    if (tgUserId) {
      fetch('/api/user/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: tgUserId, subscription: sub }),
      }).catch(() => {});
    }
  };

  // Dedicated Admin Identification for Telegram ID 291775184 and @Av_abbas
  const ADMIN_ID = '291775184';
  const ADMIN_USERNAME = 'av_abbas';

  const isUserAdmin = Boolean(
    (tgUserId && String(tgUserId) === ADMIN_ID) ||
    (tgUsername && tgUsername.toLowerCase().replace('@', '') === ADMIN_USERNAME) ||
    (typeof window !== 'undefined' &&
      (new URLSearchParams(window.location.search).get('admin') === 'true' ||
       safeStorage.get('ayna_simulated_admin', false)))
  );

  // Persistent States
  const [userDna, setUserDna] = useState<BeautyDna>(() => {
    return safeStorage.get('ayna_beauty_dna', INITIAL_DNA);
  });

  const [closetItems, setClosetItems] = useState<ClosetItem[]>(() => {
    return safeStorage.get('ayna_closet_items', DEFAULT_CLOSET);
  });

  const [shelfItems, setShelfItems] = useState<BeautyProductItem[]>(() => {
    return safeStorage.get('ayna_shelf_items', DEFAULT_SHELF);
  });

  const [savedLooks, setSavedLooks] = useState<SavedLook[]>(() => {
    return safeStorage.get('ayna_saved_looks', []);
  });

  // Sync to safe storage
  useEffect(() => {
    safeStorage.set('ayna_beauty_dna', userDna);
  }, [userDna]);

  useEffect(() => {
    safeStorage.set('ayna_closet_items', closetItems);
  }, [closetItems]);

  useEffect(() => {
    safeStorage.set('ayna_saved_looks', savedLooks);
  }, [savedLooks]);

  // Sync to backend database
  useEffect(() => {
    if (!tgUserId) return;
    const timeout = setTimeout(() => {
      fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: tgUserId,
          firstName: tgUserFirstName,
          username: tgUsername,
          dna: userDna,
          closet: closetItems,
          shelf: shelfItems,
          savedLooks: savedLooks,
          subscription: userSubscription,
        }),
      }).catch(() => {
        // Offline or server temporarily unreachable; safeStorage handles local persistence
      });
    }, 1500);

    return () => clearTimeout(timeout);
  }, [userDna, closetItems, shelfItems, savedLooks, userSubscription, tgUserId, tgUserFirstName, tgUsername]);

  // Telegram WebApp Setup & Initial DB Hydration
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      const user = tg.initDataUnsafe?.user;
      if (user?.first_name) {
        setTgUserFirstName(user.first_name);
      }
      if (user?.username) {
        setTgUsername(user.username);
      }
      if (user?.id) {
        const idStr = String(user.id);
        setTgUserId(idStr);

        // Fetch remote data from DB
        fetch(`/api/user/profile/${idStr}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data) {
              if (data.dna) setUserDna(data.dna);
              if (Array.isArray(data.closet) && data.closet.length > 0) setClosetItems(data.closet);
              if (Array.isArray(data.shelf) && data.shelf.length > 0) setShelfItems(data.shelf);
              if (Array.isArray(data.savedLooks) && data.savedLooks.length > 0) setSavedLooks(data.savedLooks);
            }
          })
          .catch(() => {});

        fetch(`/api/user/subscription/${idStr}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.subscription) {
              setUserSubscription(data.subscription);
              safeStorage.set('ayna_subscription', data.subscription);
            }
          })
          .catch(() => {});
      }
      if (tg.setHeaderColor) {
        tg.setHeaderColor('#141214');
      }
      if (tg.setBackgroundColor) {
        tg.setBackgroundColor('#141214');
      }
    }
  }, []);

  // Unified Bidirectional Back button handling in Telegram WebApp
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.BackButton) {
      const tg = window.Telegram.WebApp;
      const isAnyModalOpen =
        isCoachOpen ||
        isGoodEnoughOpen ||
        isScannerOpen ||
        isRoutineOpen ||
        isMixerOpen ||
        isSecondOpinionOpen ||
        isTelegramSetupOpen ||
        isReadyCheckOpen ||
        isBeforeYouDoItOpen ||
        isCycleBeautyOpen ||
        isIntimateCareOpen ||
        isBeautyDefenseOpen ||
        isSmartShoppingOpen ||
        isPhotoCoachOpen ||
        Boolean(expressVibeMode) ||
        isSearchOpen ||
        isMakeupStudioOpen ||
        isHairStudioOpen ||
        isSkinProblemOpen ||
        isBodyAccessoriesOpen ||
        isDailyChallengeOpen ||
        isPremiumModalOpen;

      if (isAnyModalOpen || currentTab !== 'home') {
        tg.BackButton.show();

        const handleBack = () => {
          if (isPremiumModalOpen) {
            setIsPremiumModalOpen(false);
          } else if (isSearchOpen) {
            setIsSearchOpen(false);
          } else if (isMakeupStudioOpen) {
            setIsMakeupStudioOpen(false);
          } else if (isHairStudioOpen) {
            setIsHairStudioOpen(false);
          } else if (isSkinProblemOpen) {
            setIsSkinProblemOpen(false);
          } else if (isBodyAccessoriesOpen) {
            setIsBodyAccessoriesOpen(false);
          } else if (isDailyChallengeOpen) {
            setIsDailyChallengeOpen(false);
          } else if (expressVibeMode) {
            setExpressVibeMode(null);
          } else if (isPhotoCoachOpen) {
            setIsPhotoCoachOpen(false);
          } else if (isSmartShoppingOpen) {
            setIsSmartShoppingOpen(false);
          } else if (isBeautyDefenseOpen) {
            setIsBeautyDefenseOpen(false);
          } else if (isIntimateCareOpen) {
            setIsIntimateCareOpen(false);
          } else if (isCycleBeautyOpen) {
            setIsCycleBeautyOpen(false);
          } else if (isBeforeYouDoItOpen) {
            setIsBeforeYouDoItOpen(false);
          } else if (isReadyCheckOpen) {
            setIsReadyCheckOpen(false);
          } else if (isTelegramSetupOpen) {
            setIsTelegramSetupOpen(false);
          } else if (isSecondOpinionOpen) {
            setIsSecondOpinionOpen(false);
          } else if (isMixerOpen) {
            setIsMixerOpen(false);
          } else if (isRoutineOpen) {
            setIsRoutineOpen(false);
          } else if (isScannerOpen) {
            setIsScannerOpen(false);
          } else if (isGoodEnoughOpen) {
            setIsGoodEnoughOpen(false);
          } else if (isCoachOpen) {
            setIsCoachOpen(false);
          } else if (currentTab !== 'home') {
            setCurrentTab('home');
          }
        };

        tg.BackButton.onClick(handleBack);
        return () => {
          tg.BackButton.offClick(handleBack);
        };
      } else {
        tg.BackButton.hide();
      }
    }
  }, [
    currentTab,
    isCoachOpen,
    isGoodEnoughOpen,
    isScannerOpen,
    isRoutineOpen,
    isMixerOpen,
    isSecondOpinionOpen,
    isTelegramSetupOpen,
    isReadyCheckOpen,
    isBeforeYouDoItOpen,
    isCycleBeautyOpen,
    isIntimateCareOpen,
    isBeautyDefenseOpen,
    isSmartShoppingOpen,
    isPhotoCoachOpen,
    expressVibeMode,
    isSearchOpen,
    isMakeupStudioOpen,
    isHairStudioOpen,
    isSkinProblemOpen,
    isBodyAccessoriesOpen,
    isDailyChallengeOpen,
    isPremiumModalOpen,
  ]);

  const handleAddClosetItem = (item: ClosetItem) => {
    setClosetItems((prev) => [item, ...prev]);
  };

  const handleRemoveClosetItem = (id: string) => {
    setClosetItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSaveLook = (look: SavedLook) => {
    setSavedLooks((prev) => [look, ...prev]);
  };

  const handleOpenRoutine = (time: number) => {
    setRoutineTime(time);
    setIsRoutineOpen(true);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-start select-none font-vazir">
        {/* Container: If isDesktopFrame is active on larger screens, frame it as a sleek phone shell */}
        <div
          className={`w-full transition-all duration-300 ${
            isDesktopFrame
              ? 'max-w-md my-0 sm:my-6 sm:rounded-3xl sm:border sm:border-stone-800/80 sm:shadow-2xl overflow-hidden bg-stone-900 flex flex-col'
              : 'max-w-md bg-stone-900 flex flex-col'
          }`}
          style={{ minHeight: isDesktopFrame ? '94vh' : '100vh' }}
        >
          {/* Telegram Top Header */}
          <TelegramHeader
            userFirstName={tgUserFirstName}
            isDesktopFrame={isDesktopFrame}
            onToggleFrame={() => setIsDesktopFrame((prev) => !prev)}
            onOpenCoach={() => setIsCoachOpen(true)}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenRoutine={handleOpenRoutine}
            onOpenMixer={() => setIsMixerOpen(true)}
            onOpenTelegramSetup={() => setIsTelegramSetupOpen(true)}
            savedLooksCount={savedLooks.length}
            isAdmin={isUserAdmin}
            onOpenAdmin={() => setCurrentTab('admin')}
            isPremium={userSubscription?.isActive}
            onOpenPremium={() => setIsPremiumModalOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1 px-3.5 py-3.5 overflow-y-auto">
            {currentTab === 'home' && (
              <HomeTab
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenGoodEnough={() => setIsGoodEnoughOpen(true)}
                onOpenCoach={() => setIsCoachOpen(true)}
                onOpenScanner={() => setIsScannerOpen(true)}
                onOpenRoutine={handleOpenRoutine}
                onOpenMixer={() => setIsMixerOpen(true)}
                onOpenSecondOpinion={() => setIsSecondOpinionOpen(true)}
                onOpenReadyCheck={() => setIsReadyCheckOpen(true)}
                onOpenBeforeYouDoIt={() => setIsBeforeYouDoItOpen(true)}
                onOpenCycleBeauty={() => setIsCycleBeautyOpen(true)}
                onOpenIntimateCare={() => setIsIntimateCareOpen(true)}
                onOpenBeautyDefense={() => setIsBeautyDefenseOpen(true)}
                onOpenSmartShopping={() => setIsSmartShoppingOpen(true)}
                onOpenPhotoCoach={() => setIsPhotoCoachOpen(true)}
                onOpenExpressVibes={(mode) => setExpressVibeMode(mode)}
                onOpenSearch={() => setIsSearchOpen(true)}
                onOpenMakeupStudio={() => setIsMakeupStudioOpen(true)}
                onOpenHairStudio={() => setIsHairStudioOpen(true)}
                onOpenSkinProblemSolver={() => setIsSkinProblemOpen(true)}
                onOpenBodyAccessories={() => setIsBodyAccessoriesOpen(true)}
                onOpenDailyChallenge={() => setIsDailyChallengeOpen(true)}
                onOpenPremium={() => setIsPremiumModalOpen(true)}
                isPremium={userSubscription?.isActive}
              />
            )}

            {currentTab === 'make-it-mine' && (
              <MakeItMineTab
                onSaveLook={handleSaveLook}
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenMixer={() => setIsMixerOpen(true)}
                savedLooks={savedLooks}
              />
            )}

            {currentTab === 'dna' && (
              <DnaTab
                dna={userDna}
                onUpdateDna={(newDna) => setUserDna(newDna)}
              />
            )}

            {currentTab === 'closet' && (
              <ClosetTab
                closetItems={closetItems}
                shelfItems={shelfItems}
                onAddClosetItem={handleAddClosetItem}
                onRemoveClosetItem={handleRemoveClosetItem}
                onOpenMixer={() => setIsMixerOpen(true)}
              />
            )}

            {currentTab === 'sos' && (
              <SosTab
                onOpenGoodEnough={() => setIsGoodEnoughOpen(true)}
                onOpenSecondOpinion={() => setIsSecondOpinionOpen(true)}
                onOpenRoutine={handleOpenRoutine}
                onOpenBeforeYouDoIt={() => setIsBeforeYouDoItOpen(true)}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'wisdom' && (
              <WisdomTab
                onOpenCycleBeauty={() => setIsCycleBeautyOpen(true)}
                onOpenSmartShopping={() => setIsSmartShoppingOpen(true)}
                onOpenBeautyDefense={() => setIsBeautyDefenseOpen(true)}
              />
            )}

            {currentTab === 'admin' && isUserAdmin && (
              <AdminTab
                adminId={tgUserId || ADMIN_ID}
                adminUsername={tgUsername || ADMIN_USERNAME}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            )}
          </main>

          {/* Telegram Bottom Navigation */}
          <Navigation
            currentTab={currentTab}
            onSelectTab={(tab) => setCurrentTab(tab)}
            isAdmin={isUserAdmin}
          />

          {/* Floating Modals */}
          <ChatCoachModal
            isOpen={isCoachOpen}
            onClose={() => setIsCoachOpen(false)}
          />

          <GoodEnoughModal
            isOpen={isGoodEnoughOpen}
            onClose={() => setIsGoodEnoughOpen(false)}
          />

          <ScannerModal
            isOpen={isScannerOpen}
            onClose={() => setIsScannerOpen(false)}
          />

          <RoutinePlayerModal
            isOpen={isRoutineOpen}
            timeMinutes={routineTime}
            onClose={() => setIsRoutineOpen(false)}
            onFinishRoutine={() => setIsGoodEnoughOpen(true)}
          />

          <OutfitMixerModal
            isOpen={isMixerOpen}
            onClose={() => setIsMixerOpen(false)}
            onSaveLook={handleSaveLook}
          />

          <SecondOpinionModal
            isOpen={isSecondOpinionOpen}
            onClose={() => setIsSecondOpinionOpen(false)}
          />

          <TelegramLauncherModal
            isOpen={isTelegramSetupOpen}
            onClose={() => setIsTelegramSetupOpen(false)}
          />

          <ReadyCheckModal
            isOpen={isReadyCheckOpen}
            onClose={() => setIsReadyCheckOpen(false)}
            onFinish={() => setIsGoodEnoughOpen(true)}
          />

          <BeforeYouDoItModal
            isOpen={isBeforeYouDoItOpen}
            onClose={() => setIsBeforeYouDoItOpen(false)}
          />

          <CycleBeautyModal
            isOpen={isCycleBeautyOpen}
            onClose={() => setIsCycleBeautyOpen(false)}
          />

          <IntimateCareModal
            isOpen={isIntimateCareOpen}
            onClose={() => setIsIntimateCareOpen(false)}
          />

          <BeautyDefenseModal
            isOpen={isBeautyDefenseOpen}
            onClose={() => setIsBeautyDefenseOpen(false)}
          />

          <SmartShoppingModal
            isOpen={isSmartShoppingOpen}
            onClose={() => setIsSmartShoppingOpen(false)}
          />

          <PhotoCoachModal
            isOpen={isPhotoCoachOpen}
            onClose={() => setIsPhotoCoachOpen(false)}
          />

          {expressVibeMode && (
            <ExpressVibesModal
              isOpen={Boolean(expressVibeMode)}
              mode={expressVibeMode}
              onClose={() => setExpressVibeMode(null)}
              onSaveLook={handleSaveLook}
            />
          )}

          <BeautySearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onSelectAction={(category) => {
              if (category === 'closet') setCurrentTab('closet');
              else if (category === 'look') setIsMixerOpen(true);
              else if (category === 'problem') setIsSkinProblemOpen(true);
              else if (category === 'technique') setIsMakeupStudioOpen(true);
              else if (category === 'wisdom') setCurrentTab('wisdom');
            }}
          />

          <MakeupHairStudioModal
            isOpen={isMakeupStudioOpen}
            initialTab="makeup"
            onClose={() => setIsMakeupStudioOpen(false)}
          />

          <MakeupHairStudioModal
            isOpen={isHairStudioOpen}
            initialTab="hair"
            onClose={() => setIsHairStudioOpen(false)}
          />

          <SkinProblemSolverModal
            isOpen={isSkinProblemOpen}
            onClose={() => setIsSkinProblemOpen(false)}
            onOpenRoutine={handleOpenRoutine}
          />

          <BodyAccessoriesModal
            isOpen={isBodyAccessoriesOpen}
            onClose={() => setIsBodyAccessoriesOpen(false)}
            onOpenMixer={() => setIsMixerOpen(true)}
          />

          <DailyChallengeModal
            isOpen={isDailyChallengeOpen}
            onClose={() => setIsDailyChallengeOpen(false)}
          />

          <PremiumModal
            isOpen={isPremiumModalOpen}
            onClose={() => setIsPremiumModalOpen(false)}
            currentSubscription={userSubscription}
            onActivateSubscription={handleActivateSubscription}
            telegramUsername={tgUsername}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
