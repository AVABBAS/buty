/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TabType, BeautyDna, ClosetItem, BeautyProductItem, SavedLook } from './types';
import { DEFAULT_CLOSET, DEFAULT_SHELF } from './data/beautyKnowledge';
import { TelegramHeader } from './components/TelegramHeader';
import { Navigation } from './components/Navigation';
import { HomeTab } from './components/tabs/HomeTab';
import { MakeItMineTab } from './components/tabs/MakeItMineTab';
import { DnaTab } from './components/tabs/DnaTab';
import { ClosetTab } from './components/tabs/ClosetTab';
import { SosTab } from './components/tabs/SosTab';
import { WisdomTab } from './components/tabs/WisdomTab';
import { ChatCoachModal } from './components/ChatCoachModal';
import { GoodEnoughModal } from './components/GoodEnoughModal';
import { ScannerModal } from './components/ScannerModal';
import { RoutinePlayerModal } from './components/RoutinePlayerModal';
import { OutfitMixerModal } from './components/OutfitMixerModal';
import { SecondOpinionModal } from './components/SecondOpinionModal';
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
  const [tgUserFirstName, setTgUserFirstName] = useState<string | undefined>();

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

  // Telegram WebApp Setup
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      if (tg.initDataUnsafe?.user?.first_name) {
        setTgUserFirstName(tg.initDataUnsafe.user.first_name);
      }
      if (tg.setHeaderColor) {
        tg.setHeaderColor('#141214');
      }
      if (tg.setBackgroundColor) {
        tg.setBackgroundColor('#141214');
      }
    }
  }, []);

  // Back button handling in Telegram
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.BackButton) {
      const tg = window.Telegram.WebApp;
      if (currentTab !== 'home') {
        tg.BackButton.show();
        const handleBack = () => setCurrentTab('home');
        tg.BackButton.onClick(handleBack);
        return () => {
          tg.BackButton.offClick(handleBack);
        };
      } else {
        tg.BackButton.hide();
      }
    }
  }, [currentTab]);

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
            savedLooksCount={savedLooks.length}
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
              />
            )}

            {currentTab === 'make-it-mine' && (
              <MakeItMineTab
                onSaveLook={handleSaveLook}
                onNavigateTab={(tab) => setCurrentTab(tab)}
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
              />
            )}

            {currentTab === 'wisdom' && (
              <WisdomTab />
            )}
          </main>

          {/* Telegram Bottom Navigation */}
          <Navigation
            currentTab={currentTab}
            onSelectTab={(tab) => setCurrentTab(tab)}
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
        </div>
      </div>
    </ErrorBoundary>
  );
}
