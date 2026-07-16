/* ============================================================
   AI 书签管家 — Zustand Store (Options Page)
   ============================================================ */

import { create } from 'zustand';
import {
  type ExtensionConfig,
  DEFAULT_CONFIG,
  STORAGE_KEYS,
  type NotificationSettings,
} from '@shared/types';

export type SectionKey =
  | 'model'
  | 'ball'
  | 'category'
  | 'tags'
  | 'notification'
  | 'personalization'
  | 'data'
  | 'resurface'
  | 'about';

export interface TestResult {
  success: boolean;
  message: string;
  models?: string[];
}

export interface OptionsStore {
  /** 当前激活的侧边栏分区 */
  activeSection: SectionKey;
  /** 完整的扩展配置 */
  config: ExtensionConfig;
  /** 更新配置的部分字段，自动合并并持久化 */
  setConfig: (partial: Partial<ExtensionConfig>) => void;
  /** 更新 model 子配置 */
  setModelConfig: (partial: Partial<ExtensionConfig['model']>) => void;
  /** 更新 ball 子配置 */
  setBallConfig: (partial: Partial<ExtensionConfig['ball']>) => void;
  /** 更新 app 子配置 */
  setAppConfig: (partial: Partial<ExtensionConfig['app']>) => void;
  /** 更新通知设置 */
  setNotificationConfig: (partial: Partial<NotificationSettings>) => void;
  /** 切换侧边栏激活分区 */
  setActiveSection: (section: SectionKey) => void;
  /** 从 chrome.storage 加载配置 */
  loadConfig: () => Promise<void>;
  /** 持久化当前配置到 chrome.storage */
  saveConfig: () => Promise<void>;
  /** 连接测试状态 */
  testing: boolean;
  testResult: TestResult | null;
  /** 测试连接后获取的可用模型列表 */
  availableModels: string[];
  setTesting: (v: boolean) => void;
  setTestResult: (r: TestResult | null) => void;
  setAvailableModels: (models: string[]) => void;
  /** 发送连接测试消息到 background */
  testConnection: () => Promise<void>;
  /** 保存状态 */
  isSaving: boolean;
  lastSavedAt: number | null;
  setSavingState: (saving: boolean) => void;
  setLastSavedAt: (t: number) => void;
}

export const useOptionsStore = create<OptionsStore>((set, get) => ({
  activeSection: 'model',
  config: DEFAULT_CONFIG,
  testing: false,
  testResult: null,
  availableModels: [],
  isSaving: false,
  lastSavedAt: null,

  setConfig: (partial) => {
    set((state) => {
      const newConfig = { ...state.config, ...partial };
      set({ isSaving: true });
      chrome.storage.local
        .set({ [STORAGE_KEYS.CONFIG]: newConfig })
        .then(() => set({ isSaving: false, lastSavedAt: Date.now() }))
        .catch(() => set({ isSaving: false }));
      return { config: newConfig };
    });
  },

  setModelConfig: (partial) => {
    set((state) => {
      const providerChanged =
        partial.provider != null && partial.provider !== state.config.model.provider;
      const newConfig = {
        ...state.config,
        model: { ...state.config.model, ...partial },
      };
      set({ isSaving: true });
      chrome.storage.local
        .set({ [STORAGE_KEYS.CONFIG]: newConfig })
        .then(() => set({ isSaving: false, lastSavedAt: Date.now() }))
        .catch(() => set({ isSaving: false }));
      return {
        config: newConfig,
        ...(providerChanged
          ? { availableModels: [], testResult: null }
          : {}),
      };
    });
  },

  setBallConfig: (partial) => {
    set((state) => {
      const newConfig = {
        ...state.config,
        ball: { ...state.config.ball, ...partial },
      };
      set({ isSaving: true });
      chrome.storage.local
        .set({ [STORAGE_KEYS.CONFIG]: newConfig })
        .then(() => set({ isSaving: false, lastSavedAt: Date.now() }))
        .catch(() => set({ isSaving: false }));
      return { config: newConfig };
    });
  },

  setAppConfig: (partial) => {
    set((state) => {
      const newConfig = {
        ...state.config,
        app: { ...state.config.app, ...partial },
      };
      set({ isSaving: true });
      chrome.storage.local
        .set({ [STORAGE_KEYS.CONFIG]: newConfig })
        .then(() => set({ isSaving: false, lastSavedAt: Date.now() }))
        .catch(() => set({ isSaving: false }));
      return { config: newConfig };
    });
  },

  setNotificationConfig: (partial) => {
    set((state) => {
      const newConfig = {
        ...state.config,
        app: {
          ...state.config.app,
          notifications: { ...state.config.app.notifications, ...partial },
        },
      };
      set({ isSaving: true });
      chrome.storage.local
        .set({ [STORAGE_KEYS.CONFIG]: newConfig })
        .then(() => set({ isSaving: false, lastSavedAt: Date.now() }))
        .catch(() => set({ isSaving: false }));
      return { config: newConfig };
    });
  },

  setActiveSection: (section) => {
    set({ activeSection: section });
  },

  loadConfig: async () => {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.CONFIG);
      const stored = result[STORAGE_KEYS.CONFIG] as ExtensionConfig | undefined;
      if (stored) {
        set({
          config: {
            model: { ...DEFAULT_CONFIG.model, ...stored.model },
            ball: { ...DEFAULT_CONFIG.ball, ...stored.ball },
            app: {
              ...DEFAULT_CONFIG.app,
              ...stored.app,
              notifications: {
                ...DEFAULT_CONFIG.app.notifications,
                ...(stored.app?.notifications ?? {}),
              },
            },
          },
        });
      }
    } catch (err) {
      console.error('[OptionsStore] loadConfig failed:', err);
    }
  },

  saveConfig: async () => {
    set({ isSaving: true });
    try {
      await chrome.storage.local.set({
        [STORAGE_KEYS.CONFIG]: get().config,
      });
      set({ isSaving: false, lastSavedAt: Date.now() });
    } catch (err) {
      set({ isSaving: false });
      console.error('[OptionsStore] saveConfig failed:', err);
    }
  },

  setTesting: (v) => set({ testing: v }),
  setTestResult: (r) => set({ testResult: r }),
  setAvailableModels: (models) => set({ availableModels: models }),
  setSavingState: (saving) => set({ isSaving: saving }),
  setLastSavedAt: (t) => set({ lastSavedAt: t }),

  testConnection: async () => {
    const { config } = get();
    const { model } = config;

    // Validate required fields before sending
    if (!model.apiKey && model.provider !== 'custom') {
      set({
        testing: false,
        testResult: { success: false, message: '请先填写 API Key' },
      });
      return;
    }
    if (model.provider === 'custom' && !model.baseUrl) {
      set({
        testing: false,
        testResult: { success: false, message: 'Custom 模式需要填写 Base URL' },
      });
      return;
    }

    set({ testing: true, testResult: null, availableModels: [] });

    try {
      // Race against a 15-second timeout to prevent UI hang
      const timeoutPromise = new Promise<{
        success: false;
        message: string;
        models?: string[];
        error?: string;
      }>((resolve) =>
        setTimeout(
          () =>
            resolve({
              success: false,
              message: '连接超时，请检查网络或 API 地址',
              models: [],
            }),
          15000,
        ),
      );

      const sendPromise = chrome.runtime.sendMessage({
        type: 'TEST_AI_CONNECTION',
        payload: {
          provider: model.provider,
          apiKey: model.apiKey,
          baseUrl: model.baseUrl,
          model: model.model,
        },
      }) as Promise<{
        success?: boolean;
        message?: string;
        models?: string[];
        error?: string;
      }>;

      const response = await Promise.race([sendPromise, timeoutPromise]);
      const models = Array.isArray(response?.models)
        ? response.models.filter((m): m is string => typeof m === 'string' && m.length > 0)
        : [];

      if (response?.success) {
        set({
          testing: false,
          availableModels: models,
          testResult: {
            success: true,
            message: response.message ?? '连接成功',
            models,
          },
        });
      } else if (response?.error) {
        set({
          testing: false,
          availableModels: [],
          testResult: {
            success: false,
            message: `连接失败: ${response.error}`,
          },
        });
      } else {
        set({
          testing: false,
          availableModels: [],
          testResult: {
            success: false,
            message: response?.message ?? '连接失败，请检查配置',
          },
        });
      }
    } catch (err) {
      set({
        testing: false,
        testResult: {
          success: false,
          message: `通信异常: ${(err as Error).message ?? '未知错误'}`,
        },
      });
    }
  },
}));
