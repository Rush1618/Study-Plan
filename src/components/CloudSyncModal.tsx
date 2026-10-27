import React, { useState } from 'react';
import { 
  Cloud, 
  CloudCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Copy, 
  Check, 
  Database,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { SupabaseSyncConfig, UserProfile } from '../types';
import { StorageService } from '../services/storage';
import { SupabaseSyncService, SUPABASE_SQL_SCHEMA } from '../services/supabaseClient';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileReset: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileReset
}) => {
  const [config, setConfig] = useState<SupabaseSyncConfig>(() => StorageService.getSupabaseConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [showSqlSchema, setShowSqlSchema] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    StorageService.saveSupabaseConfig(config);
    setStatusMessage({ type: 'info', text: 'Cloud configuration saved locally.' });
  };

  const handleTestConnection = async () => {
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      setStatusMessage({ type: 'error', text: 'Please enter both Supabase URL and Anon Key.' });
      return;
    }
    setIsTesting(true);
    setStatusMessage(null);
    const res = await SupabaseSyncService.testConnection(config.supabaseUrl, config.supabaseAnonKey);
    setIsTesting(false);
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      const next = { ...config, syncStatus: 'connected' as const, syncEnabled: true };
      setConfig(next);
      StorageService.saveSupabaseConfig(next);
    } else {
      setStatusMessage({ type: 'error', text: res.message });
      const next = { ...config, syncStatus: 'error' as const };
      setConfig(next);
      StorageService.saveSupabaseConfig(next);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setStatusMessage(null);
    StorageService.saveSupabaseConfig(config);
    const res = await SupabaseSyncService.syncAll();
    setIsSyncing(false);
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      setConfig(StorageService.getSupabaseConfig());
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const handleResetToClean = () => {
    StorageService.resetToFreshProfile(profile.name || 'Sanskriti');
    onProfileReset();
    setStatusMessage({ type: 'success', text: `Reset complete! Switched to a fresh, clean slate for ${profile.name} with 0 attempts.` });
    setConfirmReset(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-parchment-50 border border-parchment-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-elevated relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-ink-600 hover:text-ink-900 hover:bg-parchment-200 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-terracotta-50 text-terracotta-600 border border-terracotta-200">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-ink-900">
              Supabase Cloud Synchronization
            </h2>
            <p className="text-xs text-ink-700 mt-0.5">
              Local-first with optional PostgreSQL sync between student and mentor.
            </p>
          </div>
        </div>

        {/* Status Pills */}
        <div className="mb-6 p-4 rounded-2xl bg-parchment-100 border border-parchment-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              config.syncEnabled && config.syncStatus === 'connected' 
                ? 'bg-sage-500 animate-pulse' 
                : config.syncStatus === 'error'
                ? 'bg-terracotta-500'
                : 'bg-amber-500'
            }`} />
            <span className="font-medium text-ink-900">
              Current Mode: {config.syncEnabled && config.syncStatus === 'connected' ? 'Cloud Connected & Synchronized' : 'Local-First (Offline Safe)'}
            </span>
          </div>
          {config.lastSyncedTimestamp && (
            <span className="text-ink-700 text-[11px]">
              Last synced: {new Date(config.lastSyncedTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Inputs */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-ink-800 uppercase tracking-wider mb-1.5">
              Supabase Project URL
            </label>
            <input
              type="text"
              value={config.supabaseUrl}
              onChange={(e) => setConfig({ ...config, supabaseUrl: e.target.value.trim() })}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3.5 py-2.5 rounded-xl border border-parchment-300 bg-white text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-800 uppercase tracking-wider mb-1.5">
              Supabase Anon Key
            </label>
            <input
              type="password"
              value={config.supabaseAnonKey}
              onChange={(e) => setConfig({ ...config, supabaseAnonKey: e.target.value.trim() })}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-parchment-300 bg-white text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enable-sync-toggle"
              checked={config.syncEnabled}
              onChange={(e) => {
                const next = { ...config, syncEnabled: e.target.checked };
                setConfig(next);
                StorageService.saveSupabaseConfig(next);
              }}
              className="rounded text-terracotta-600 focus:ring-terracotta-500 h-4 w-4"
            />
            <label htmlFor="enable-sync-toggle" className="text-xs text-ink-800 cursor-pointer font-medium">
              Enable automatic synchronization on every practice test completion
            </label>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`p-3.5 rounded-2xl mb-6 text-xs flex items-center gap-2 border ${
            statusMessage.type === 'success' 
              ? 'bg-sage-50 text-sage-900 border-sage-200' 
              : statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-200'
              : 'bg-parchment-100 text-ink-800 border-parchment-200'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-sage-600 flex-shrink-0" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            ) : (
              <Database className="w-4 h-4 text-ink-600 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pt-4 border-t border-parchment-200">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2 rounded-xl border border-parchment-300 hover:bg-parchment-100 text-xs font-semibold text-ink-800 transition-colors flex items-center gap-1.5"
            >
              {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />}
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <button
              onClick={handleSyncNow}
              disabled={isSyncing || !config.supabaseUrl}
              className="px-4 py-2 rounded-xl bg-ink-900 hover:bg-terracotta-500 text-parchment-50 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-soft disabled:opacity-50"
            >
              {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>

          <button
            onClick={() => setShowSqlSchema(!showSqlSchema)}
            className="text-xs text-terracotta-700 hover:text-terracotta-800 font-medium underline transition-colors"
          >
            {showSqlSchema ? 'Hide SQL Tables' : 'View SQL Table Setup'}
          </button>
        </div>

        {/* SQL Schema helper */}
        {showSqlSchema && (
          <div className="mb-6 p-4 rounded-2xl bg-ink-950 text-parchment-200 text-xs font-mono relative border border-ink-800 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-ink-800">
              <span className="text-ink-400 font-sans text-[11px]">Copy to Supabase SQL Editor</span>
              <button
                onClick={handleCopySchema}
                className="px-2.5 py-1 rounded bg-ink-800 hover:bg-ink-700 text-white text-[11px] flex items-center gap-1 transition-colors"
              >
                {copiedSchema ? <Check className="w-3 h-3 text-sage-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSchema ? 'Copied SQL!' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="max-h-48 overflow-y-auto text-[11px] leading-relaxed text-parchment-100 whitespace-pre-wrap">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        )}

        {/* Fresh Slate Toggle for Sanskriti */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-amber-950">Clean Production Slate for {profile.name}</div>
              <p className="text-amber-900/80 text-[11px] mt-0.5">
                Clear all sample demo history so Sanskriti's dashboard shows only her genuine attempts.
              </p>
            </div>

            {confirmReset ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetToClean}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors"
                >
                  Yes, Reset Clean
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1.5 rounded-lg border border-amber-300 text-amber-900 text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="px-3 py-1.5 rounded-xl border border-amber-300 hover:bg-amber-100 text-amber-950 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Clean Slate</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
