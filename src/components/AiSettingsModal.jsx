import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, AlertCircle, KeyRound, RefreshCw, X, Sparkles, ShieldCheck, ExternalLink } from 'lucide-react';
import { AI_PROVIDERS } from '../ai/craftKnowledgeBase';
import { getAiConfig, saveAiConfig, fetchServerAiStatus, testAiConnection } from '../ai/aiService';

export default function AiSettingsModal({ isOpen, onClose, onConfigChange }) {
  const [config, setConfig] = useState(getAiConfig);
  const [serverStatus, setServerStatus] = useState({ defaultProvider: 'grok', serverKeysConfigured: {} });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setConfig(getAiConfig());
    setTestResult(null);
    fetchServerAiStatus().then(setServerStatus);
  }, [isOpen]);

  if (!isOpen) return null;

  const activeProviderMeta = AI_PROVIDERS.find((p) => p.id === config.provider) || AI_PROVIDERS[0];
  const hasServerKey = Boolean(serverStatus.serverKeysConfigured?.[config.provider]);

  const handleProviderSelect = (providerId) => {
    const meta = AI_PROVIDERS.find((p) => p.id === providerId);
    const updated = { ...config, provider: providerId, model: meta?.defaultModel || '' };
    setConfig(updated);
    setTestResult(null);
  };

  const handleSave = () => {
    saveAiConfig(config);
    if (onConfigChange) onConfigChange(config);
    onClose();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testAiConnection(config);
      saveAiConfig(config);
      if (onConfigChange) onConfigChange(config);
      setTestResult({ ok: true, message: `${res.greeting} (${res.provider.toUpperCase()} • ${res.model})` });
    } catch (err) {
      setTestResult({ ok: false, message: err?.message || 'Connection failed. Check API key or model.' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-up">
      <div className="parchment-card rounded-3xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="indigo-glass px-6 py-5 flex items-center justify-between text-[#f7f1e3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c88d28]/20 border border-[#c88d28]/50 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-[#f0c76e]" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold tracking-wide">
                Provider-Agnostic AI Engine
              </h2>
              <p className="text-xs text-[#f7f1e3]/75">
                Hot-swap xAI Grok ↔ Google Gemini ↔ Groq ↔ OpenAI with zero retraining
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-[#f7f1e3]/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Zero Retraining & Auto-Failover Info */}
          <div className="p-4 rounded-2xl bg-[#1b365d]/10 border border-[#1b365d]/25 text-xs text-[#2c1d13] space-y-2">
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#b54426] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#1b365d]">Zero Re-Training Architecture:</strong> Every craft prompt, GI-tag registry rule, fair-pricing formula, and 15-language JSON contract lives in our portable <code className="px-1 py-0.5 rounded bg-white/80 font-mono text-[11px]">craftKnowledgeBase.js</code> layer.
              </div>
            </div>
            {serverStatus.failoverChain?.length > 1 && (
              <div className="pt-2 border-t border-[#1b365d]/15 flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Smart Auto-Failover Armed:</span>
                {serverStatus.failoverChain.map((p, idx) => (
                  <span key={p} className="inline-flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 uppercase text-[10px]">
                      {p}
                    </span>
                    {idx < serverStatus.failoverChain.length - 1 && <span>→</span>}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Provider Cards */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#6d4f38] block mb-2.5">
              1. Select Active AI Provider
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AI_PROVIDERS.map((p) => {
                const selected = config.provider === p.id;
                const envActive = Boolean(serverStatus.serverKeysConfigured?.[p.id]);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProviderSelect(p.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      selected
                        ? 'bg-[#1b365d] text-[#f7f1e3] border-[#c88d28] shadow-md'
                        : 'bg-white/80 hover:bg-white text-[#2c1d13] border-[#c88d28]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm">{p.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          selected ? 'bg-[#c88d28] text-[#11233e]' : 'bg-[#ede1ca] text-[#6d4f38]'
                        }`}
                      >
                        {envActive ? '.env Ready' : p.badge}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 leading-snug ${selected ? 'text-[#f7f1e3]/80' : 'text-[#7c5c43]'}`}>
                      {p.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6d4f38] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#b54426]" />
                <span>2. {activeProviderMeta.name} API Key</span>
              </label>
              <a
                href={activeProviderMeta.docsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-[#1b365d] hover:underline flex items-center gap-1"
              >
                Get Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder={hasServerKey ? 'Server .env key detected (optional override here)' : `Paste ${activeProviderMeta.name} key (${activeProviderMeta.keyPlaceholder})`}
              className="w-full px-4 py-3 rounded-xl bg-white/95 border border-[#c88d28]/35 text-sm text-[#2c1d13] font-mono focus:outline-none focus:ring-2 focus:ring-[#b54426]/40"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#6d4f38] block mb-1">
                  Model Override (Optional)
                </label>
                <input
                  type="text"
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  placeholder={activeProviderMeta.defaultModel}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-[#c88d28]/30 text-xs font-mono text-[#2c1d13] focus:outline-none focus:ring-2 focus:ring-[#1b365d]/30"
                />
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-950/5 border border-emerald-700/20 text-[11px] text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Without a key, every AI feature gracefully runs in <strong>Smart Offline Demo Mode</strong>—zero crashes!
                </span>
              </div>
            </div>
          </div>

          {/* Test Connection Result */}
          {testResult && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2.5 border ${
                testResult.ok
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-red-50 border-red-300 text-red-900'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#efe4cf]/85 border-t border-[#c88d28]/25 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#faf5ec] border border-[#1b365d]/30 text-[#1b365d] text-xs font-bold transition cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Testing...' : 'Test Live Connection'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#6d4f38] hover:bg-black/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-terracotta px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Save AI Engine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
