// ============================================================
// AI 书签管家 v2 — 再发现 Zustand Store
// ============================================================
import { create } from 'zustand';
import type { ResurfaceAction, ResurfacePrefs } from '@shared/types';
import { DEFAULT_RESURFACE_PREFS } from '@shared/types';
import { safeSendMessage } from '@shared/utils/chrome-api';

export interface ResurfaceCardData {
  bookmarkId: string;
  title: string;
  url: string;
  domain: string;
  faviconUrl?: string;
  daysSinceAdded: number;
  daysSinceLastVisit: number;
  score: number;
  tags?: string[];
}

export interface ResurfaceStore {
  cards: ResurfaceCardData[];
  loading: boolean;
  hasMore: boolean;
  prefs: ResurfacePrefs;
  excludeIds: Set<string>;

  // Operations
  loadCards: () => Promise<void>;
  refreshCards: () => Promise<void>;
  loadMore: () => Promise<void>;
  handleAction: (bookmarkId: string, action: ResurfaceAction) => Promise<void>;
  updatePrefs: (partial: Partial<ResurfacePrefs>) => Promise<void>;
  loadPrefs: () => Promise<void>;
}

export const useResurfaceStore = create<ResurfaceStore>((set, get) => ({
  cards: [],
  loading: false,
  hasMore: true,
  prefs: DEFAULT_RESURFACE_PREFS,
  excludeIds: new Set<string>(),

  loadCards: async () => {
    set({ loading: true });
    try {
      const response = await safeSendMessage<{ cards: ResurfaceCardData[] }>({
        type: 'RESURFACE_GET_CARDS',
      });
      const cards = response?.cards ?? [];
      const { excludeIds } = get();
      const filtered = cards.filter(c => !excludeIds.has(c.bookmarkId));
      set({
        cards: filtered,
        loading: false,
        hasMore: filtered.length > 0,
      });
    } catch {
      set({ loading: false });
    }
  },

  refreshCards: async () => {
    set({ loading: true, excludeIds: new Set<string>() });
    try {
      const response = await safeSendMessage<{ cards: ResurfaceCardData[] }>({
        type: 'RESURFACE_REFRESH',
      });
      const cards = response?.cards ?? [];
      set({
        cards,
        loading: false,
        hasMore: cards.length > 0,
      });
    } catch {
      set({ loading: false });
    }
  },

  loadMore: async () => {
    const { cards, excludeIds } = get();
    // Add current cards to exclude set and refresh
    const newExclude = new Set(excludeIds);
    cards.forEach(c => newExclude.add(c.bookmarkId));

    set({ loading: true, excludeIds: newExclude });
    try {
      const response = await safeSendMessage<{ cards: ResurfaceCardData[] }>({
        type: 'RESURFACE_REFRESH',
      });
      const newCards = response?.cards ?? [];
      const filtered = newCards.filter(c => !newExclude.has(c.bookmarkId));
      set({
        cards: [...cards, ...filtered],
        loading: false,
        hasMore: filtered.length > 0,
      });
    } catch {
      set({ loading: false });
    }
  },

  handleAction: async (bookmarkId: string, action: ResurfaceAction) => {
    await safeSendMessage({
      type: 'RESURFACE_ACTION',
      payload: { bookmarkId, action },
    });

    // Remove the card from local state
    set(state => ({
      cards: state.cards.filter(c => c.bookmarkId !== bookmarkId),
      excludeIds: new Set([...state.excludeIds, bookmarkId]),
    }));
  },

  updatePrefs: async (partial: Partial<ResurfacePrefs>) => {
    await safeSendMessage({
      type: 'RESURFACE_SET_PREFS',
      payload: partial,
    });
    set(state => ({
      prefs: { ...state.prefs, ...partial },
    }));
  },

  loadPrefs: async () => {
    const response = await safeSendMessage<{ prefs: ResurfacePrefs }>({
      type: 'RESURFACE_GET_PREFS',
    });
    if (response?.prefs) {
      set({ prefs: { ...DEFAULT_RESURFACE_PREFS, ...response.prefs } });
    }
  },
}));
