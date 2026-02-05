'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, History, Settings, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings, useTheme } from '@/hooks/use-settings';
import { useGameStore } from '@/stores/game-store';
import { formatTimeShort } from '@/lib/game-logic';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const { preferences, stats, isLoading, updateSetting } = useSettings();
  const { theme, setTheme } = useTheme();
  const { initGame } = useGameStore();

  const [gridSize, setGridSize] = useState(5);
  const [maxTime, setMaxTime] = useState(120);
  const [orderMode, setOrderMode] = useState<'ASC' | 'DESC'>('ASC');
  const [showSettings, setShowSettings] = useState(false);

  // Sync with saved preferences
  useEffect(() => {
    if (!isLoading) {
      setGridSize(preferences.defaultGridSize);
      setMaxTime(preferences.defaultMaxTime);
    }
  }, [isLoading, preferences.defaultGridSize, preferences.defaultMaxTime]);

  const handleStart = () => {
    initGame(gridSize, maxTime, orderMode);
    router.push('/train');
  };

  const bestTimeKey = `${gridSize}-${orderMode}`;
  const bestTime = stats.bestTimes[bestTimeKey];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col p-4 safe-top safe-bottom">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Schulte Table</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/history')}
            title="History"
          >
            <History className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full space-y-8">
        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-4 w-full text-center">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Sessions</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Streak</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold">
              {bestTime ? formatTimeShort(bestTime) : '--'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Best</div>
          </div>
        </div>

        {/* Game configuration */}
        <div className="w-full space-y-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          {/* Grid size */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Grid Size
            </label>
            <div className="flex gap-2">
              {[5, 6, 7].map((size) => (
                <button
                  key={size}
                  onClick={() => setGridSize(size)}
                  className={cn(
                    'flex-1 py-3 rounded-lg font-medium transition-all',
                    gridSize === size
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  {size}×{size}
                </button>
              ))}
            </div>
          </div>

          {/* Max time */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Time Limit: {maxTime}s
            </label>
            <input
              type="range"
              min="30"
              max="300"
              step="10"
              value={maxTime}
              onChange={(e) => setMaxTime(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>30s</span>
              <span>300s</span>
            </div>
          </div>

          {/* Order mode */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Order
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setOrderMode('ASC')}
                className={cn(
                  'flex-1 py-3 rounded-lg font-medium transition-all',
                  orderMode === 'ASC'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                )}
              >
                1 → {gridSize * gridSize}
              </button>
              <button
                onClick={() => setOrderMode('DESC')}
                className={cn(
                  'flex-1 py-3 rounded-lg font-medium transition-all',
                  orderMode === 'DESC'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                )}
              >
                {gridSize * gridSize} → 1
              </button>
            </div>
          </div>
        </div>

        {/* Start button */}
        <Button size="xl" className="w-full" onClick={handleStart}>
          <Play className="w-5 h-5 mr-2" />
          Start Training
        </Button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Settings</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                Close
              </Button>
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <div className="flex gap-2">
                {[
                  { value: 'light', icon: Sun, label: 'Light' },
                  { value: 'dark', icon: Moon, label: 'Dark' },
                  { value: 'system', icon: Monitor, label: 'System' },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value as 'light' | 'dark' | 'system')}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-1 py-3 rounded-lg transition-all',
                      theme === value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle settings */}
            {[
              { key: 'hapticFeedback', label: 'Haptic Feedback', desc: 'Vibrate on tap' },
              { key: 'showHints', label: 'Show Hints', desc: 'Highlight next number' },
              { key: 'showFixationDot', label: 'Fixation Dot', desc: 'Center eye anchor' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{label}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{desc}</div>
                </div>
                <button
                  onClick={() =>
                    updateSetting(
                      key as keyof typeof preferences,
                      !preferences[key as keyof typeof preferences]
                    )
                  }
                  className={cn(
                    'relative w-12 h-6 rounded-full transition-colors',
                    preferences[key as keyof typeof preferences]
                      ? 'bg-blue-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                      preferences[key as keyof typeof preferences]
                        ? 'translate-x-7'
                        : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            ))}

            {/* Save defaults */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                updateSetting('defaultGridSize', gridSize);
                updateSetting('defaultMaxTime', maxTime);
                setShowSettings(false);
              }}
            >
              Save Current Settings as Default
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
