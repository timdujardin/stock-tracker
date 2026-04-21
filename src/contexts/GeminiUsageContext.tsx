import { createContext, useCallback, useContext, useMemo, useState, type FC, type ReactNode } from 'react';

import { MAX_DAILY_REQUESTS } from '@/config/app.config';
import { getDailyUsageCount, incrementDailyUsage } from '@/services/geminiSummary.service';

interface GeminiUsageContextValue {
  dailyUsageCount: number;
  remainingCalls: number;
  isAvailable: boolean;
  refreshUsageCount: () => void;
  incrementAndRefresh: () => void;
}

const GeminiUsageContext = createContext<GeminiUsageContextValue | null>(null);

/** Centralizes Gemini API daily usage tracking so all providers share a single reactive counter. */
export const GeminiUsageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [dailyUsageCount, setDailyUsageCount] = useState(() => getDailyUsageCount().count);

  const apiKey = import.meta.env.VITE_GEMINI_KEY as string | undefined;
  const isAvailable = !!apiKey;
  const remainingCalls = MAX_DAILY_REQUESTS - dailyUsageCount;

  const refreshUsageCount = useCallback(() => {
    setDailyUsageCount(getDailyUsageCount().count);
  }, []);

  const incrementAndRefresh = useCallback(() => {
    const newCount = incrementDailyUsage();
    setDailyUsageCount(newCount);
  }, []);

  const value = useMemo<GeminiUsageContextValue>(
    () => ({ dailyUsageCount, remainingCalls, isAvailable, refreshUsageCount, incrementAndRefresh }),
    [dailyUsageCount, remainingCalls, isAvailable, refreshUsageCount, incrementAndRefresh],
  );

  return <GeminiUsageContext.Provider value={value}>{children}</GeminiUsageContext.Provider>;
};

/** Accesses the shared Gemini API usage counter and availability state. */
export const useGeminiUsage = (): GeminiUsageContextValue => {
  const context = useContext(GeminiUsageContext);
  if (!context) {
    throw new Error('useGeminiUsage must be used within GeminiUsageProvider');
  }
  return context;
};
