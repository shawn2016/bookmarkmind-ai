/* ============================================================
   AI 书签管家 — Model Configuration Section
   使用 primitives: SectionCard, SubSection, Field, Slider, Callout, Button
   ============================================================ */

import React from 'react';
import { Wand2, Shield, AlertCircle } from 'lucide-react';
import { useOptionsStore } from '@options/store/optionsStore';
import { getMinimaxBaseUrlHint } from '@shared/utils/api-url';
import ProviderSelector from '@options/components/forms/ProviderSelector';
import ApiKeyInput from '@options/components/forms/ApiKeyInput';
import type { AIProvider } from '@shared/types';
import {
  SectionCard,
  SubSection,
  Field,
  Slider,
  Callout,
  Button,
} from '../primitives';

/* ============================================================
   Reusable inputs (保留在文件里因为只用于此页)
   ============================================================ */
const TextInput: React.FC<{
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: 'text' | 'number';
}> = ({ value, onChange, placeholder, type = 'text' }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full rounded-bm-md outline-none"
    style={{
      fontSize: 'var(--bm-text-md)',
      padding: '8px 12px',
      border: '1px solid var(--bm-border-strong)',
      background: 'var(--bm-bg-input)',
      color: 'var(--bm-text-primary)',
      transition: 'border-color var(--bm-duration-fast) var(--bm-ease-default)',
    }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = 'var(--bm-border-accent)';
      e.currentTarget.style.boxShadow = 'var(--bm-shadow-focus)';
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = 'var(--bm-border-strong)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  />
);

/* ============================================================
   Onboarding 引导条（低调，仅未配置 API Key 时显示）
   ============================================================ */
const OnboardingCard: React.FC = () => {
  const { config } = useOptionsStore();
  const hasKey =
    Boolean(config.model.apiKey) || config.model.provider === 'custom';
  if (hasKey) return null;

  return (
    <Callout icon={<Wand2 size={15} strokeWidth={2} />} tone="privacy">
      <strong style={{ color: 'var(--bm-text-heading)' }}>欢迎，</strong>
      在下方选 AI 服务商 → 填 API Key → 点
      <strong style={{ color: 'var(--bm-text-primary)' }}> 测试连接 </strong>
      验证 — 成功后即可在任意网页使用 AI 书签整理。
    </Callout>
  );
};

/* ============================================================
   内联"测试连接"按钮（紧贴 API Key 输入框右侧）
   ============================================================ */
const InlineTestButton: React.FC = () => {
  const { testing, testConnection } = useOptionsStore();
  return (
    <Button
      onClick={testConnection}
      variant="primary"
      disabled={testing}
      ariaLabel="测试连接"
      style={{
        height: '36px',
        padding: '0 14px',
        fontSize: 'var(--bm-text-sm)',
        flexShrink: 0,
      }}
    >
      {testing ? (
        <>
          <span
            className="rounded-full"
            style={{
              width: '8px',
              height: '8px',
              background: 'currentColor',
              animation: 'bm-blink 1s infinite',
            }}
          />
          测试中…
        </>
      ) : (
        '测试连接'
      )}
    </Button>
  );
};

/* ============================================================
   ModelConfigSection
   ============================================================ */
const MODEL_PLACEHOLDER: Record<AIProvider, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-haiku-20241022',
  custom: 'llama3',
};

const ModelConfigSection: React.FC = () => {
  const { config, setModelConfig } = useOptionsStore();
  const { model } = config;
  const { testing, testResult } = useOptionsStore();

  return (
    <SectionCard
      title="模型配置"
      subtitle="选择 AI 服务商并配置连接参数"
    >
      <div className="mb-bm-5">
        <OnboardingCard />
      </div>

      {/* AI 服务商 */}
      <SubSection
        icon={<Wand2 size={15} strokeWidth={2.2} />}
        title="AI 服务商"
        caption="选择 · 配置"
      >
        <Field label="服务商" description="切换不会丢失当前 Key">
          <ProviderSelector
            value={model.provider}
            onChange={(p: AIProvider) => setModelConfig({ provider: p })}
          />
        </Field>

        <Field
          label="API Key"
          description="您的密钥仅存储在本地浏览器中，不会发送到任何第三方服务"
        >
          <div className="flex items-stretch gap-bm-2">
            <div className="flex-1">
              <ApiKeyInput
                value={model.apiKey}
                onChange={(v) => setModelConfig({ apiKey: v })}
                placeholder="sk-..."
              />
            </div>
            <InlineTestButton />
          </div>

          {/* 内联测试结果 */}
          {testResult && (
            <div
              className="flex items-start gap-bm-2 rounded-bm-md p-bm-3 mt-bm-2"
              style={{
                fontSize: 'var(--bm-text-sm)',
                background: testResult.success
                  ? 'rgba(136,198,110,0.08)'
                  : 'rgba(224,133,133,0.08)',
                border: `1px solid ${testResult.success ? 'rgba(136,198,110,0.35)' : 'rgba(224,133,133,0.35)'}`,
                borderLeft: `3px solid ${testResult.success ? 'var(--bm-state-success)' : 'var(--bm-state-error)'}`,
                color: testResult.success
                  ? 'var(--bm-state-success)'
                  : 'var(--bm-state-error)',
                animation: 'bm-fade-in 220ms var(--bm-ease-out)',
              }}
              data-testid="test-result"
            >
              {!testResult.success && (
                <AlertCircle size={14} strokeWidth={2} style={{ flexShrink: 0, marginTop: '1px' }} />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </Field>

        <Field label="模型名称" description="使用的具体模型 ID">
          <TextInput
            value={model.model}
            onChange={(v) => setModelConfig({ model: v })}
            placeholder={MODEL_PLACEHOLDER[model.provider]}
          />
        </Field>

        {model.provider === 'custom' && (
          <Field
            label="Base URL"
            description={`自定义 API 地址。MiniMax: ${getMinimaxBaseUrlHint()}；Ollama: http://localhost:11434/v1`}
          >
            <TextInput
              value={model.baseUrl ?? ''}
              onChange={(v) => setModelConfig({ baseUrl: v })}
              placeholder="https://api.minimaxi.com/anthropic/v1"
            />
          </Field>
        )}
      </SubSection>

      {/* 行为参数 */}
      <SubSection
        icon={<Wand2 size={15} strokeWidth={2.2} />}
        title="行为参数"
        caption="温度 · 超时 · 限额"
      >
        <Field
          label="Temperature"
          description={`控制输出创造性，当前值 ${model.temperature}`}
        >
          <Slider
            value={model.temperature}
            min={0}
            max={2}
            step={0.1}
            onChange={(v) => setModelConfig({ temperature: v })}
            formatValue={(v) => v.toFixed(1)}
            minLabel="0"
            maxLabel="2"
            ariaLabel="Temperature"
          />
        </Field>

        <Field label="超时时间 (秒)" description="请求超时时间，默认 30 秒">
          <TextInput
            value={model.timeout / 1000}
            onChange={(v) =>
              setModelConfig({
                timeout: Math.max(1, parseInt(v, 10) || 30) * 1000,
              })
            }
            placeholder="30"
            type="number"
          />
        </Field>

        <Field label="每日调用上限" description="限制每天最大 AI API 调用次数，防止超额">
          <TextInput
            value={model.dailyLimit}
            onChange={(v) =>
              setModelConfig({
                dailyLimit: Math.max(1, parseInt(v, 10) || 100),
              })
            }
            placeholder="100"
            type="number"
          />
        </Field>
      </SubSection>

      {/* 隐私声明 */}
      <div className="mt-bm-5">
        <Callout icon={<Shield size={14} strokeWidth={2} />} tone="privacy">
          您的 API Key 和书签数据仅存储在本地浏览器中，不会发送到任何第三方服务。所有 AI 请求直接发送到您配置的服务商。
        </Callout>
      </div>

      {testing && (
        <div
          style={{
            marginTop: '12px',
            fontSize: 'var(--bm-text-xs)',
            color: 'var(--bm-text-muted)',
            fontFamily: 'var(--bm-font-display)',
            fontStyle: 'italic',
            textAlign: 'right',
          }}
        >
          正在测试连接…
        </div>
      )}
    </SectionCard>
  );
};

export default ModelConfigSection;