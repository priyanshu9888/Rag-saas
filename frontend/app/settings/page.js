'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Settings, Key, Cpu, CheckCircle, AlertCircle, Loader2, ChevronDown, ExternalLink } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { API_BASE_URL } from '@/lib/api'

const PROVIDER_INFO = {
  google: {
    label: 'Google Gemini',
    color: 'text-blue-400',
    badge: 'bg-blue-500/10 border-blue-500/20',
    docsUrl: 'https://aistudio.google.com/apikey',
    placeholder: 'AIzaSy...',
  },
  openai: {
    label: 'OpenAI',
    color: 'text-green-400',
    badge: 'bg-green-500/10 border-green-500/20',
    docsUrl: 'https://platform.openai.com/api-keys',
    placeholder: 'sk-...',
  },
  anthropic: {
    label: 'Anthropic Claude',
    color: 'text-orange-400',
    badge: 'bg-orange-500/10 border-orange-500/20',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    placeholder: 'sk-ant-...',
  },
  groq: {
    label: 'Groq (Ultra Fast)',
    color: 'text-purple-400',
    badge: 'bg-purple-500/10 border-purple-500/20',
    docsUrl: 'https://console.groq.com/keys',
    placeholder: 'gsk_...',
  },
}

export default function SettingsPage() {
  const [companyId, setCompanyId] = useState(null)
  const [availableModels, setAvailableModels] = useState({})
  const [provider, setProvider] = useState('google')
  const [model, setModel] = useState('gemini-2.0-flash-lite')
  const [apiKey, setApiKey] = useState('')
  const [hasApiKey, setHasApiKey] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null) // { type: 'success' | 'error', msg }
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const cid = session.user.user_metadata?.company_id
      setCompanyId(cid)

      try {
        const [modelsRes, settingsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/models`),
          fetch(`${API_BASE_URL}/settings/${cid}`)
        ])
        const models = await modelsRes.json()
        const settings = await settingsRes.json()
        setAvailableModels(models)
        setProvider(settings.llm_provider || 'google')
        setModel(settings.llm_model || 'gemini-2.0-flash-lite')
        setHasApiKey(settings.has_api_key || false)
      } catch (e) {
        console.error('Failed to load settings:', e)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider)
    const firstModel = availableModels[newProvider]?.[0]?.id || ''
    setModel(firstModel)
  }

  const handleSave = async () => {
    setSaving(true)
    setStatus(null)
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          llm_provider: provider,
          llm_model: model,
          api_key: apiKey || undefined,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Failed')
      setStatus({ type: 'success', msg: 'Settings saved! Your chatbot will now use the selected model.' })
      setHasApiKey(!!apiKey || hasApiKey)
      setApiKey('')
    } catch (e) {
      setStatus({ type: 'error', msg: e.message })
    } finally {
      setSaving(false)
    }
  }

  const info = PROVIDER_INFO[provider] || PROVIDER_INFO.google
  const modelsForProvider = availableModels[provider] || []

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="pt-24 pb-12 px-4 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Settings className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold">AI Model Settings</h1>
          </div>
          <p className="text-slate-400 ml-14">Choose your preferred LLM provider, model, and API key. Changes apply to all future chat requests for your company.</p>
        </div>

        {/* Status Banner */}
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
          >
            {status.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            <p className="text-sm">{status.msg}</p>
          </motion.div>
        )}

        {/* Provider Selection */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" /> LLM Provider
          </h2>
          <p className="text-slate-500 text-sm mb-5">Select which AI company's models you want to use.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(PROVIDER_INFO).map(([key, p]) => (
              <button
                key={key}
                onClick={() => handleProviderChange(key)}
                className={`p-4 rounded-xl border text-sm font-semibold transition-all text-left ${
                  provider === key
                    ? `${p.badge} ${p.color} border-current`
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <span className={`block text-base font-bold ${provider === key ? p.color : 'text-white'}`}>{p.label}</span>
                {provider === key && <span className="text-xs mt-1 block opacity-70">Selected ✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Model Selection */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold mb-1">Model</h2>
          <p className="text-slate-500 text-sm mb-5">Choose the specific model variant for <span className={info.color}>{info.label}</span>.</p>
          <div className="grid grid-cols-1 gap-3">
            {modelsForProvider.map((m) => (
              <button
                key={m.id}
                onClick={() => setModel(m.id)}
                className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                  model === m.id
                    ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">{m.id}</p>
                </div>
                {model === m.id && <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Key className="w-5 h-5 text-yellow-400" /> API Key
            </h2>
            <a
              href={info.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Get API Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-slate-500 text-sm mb-5">
            Enter your <span className={info.color}>{info.label}</span> API key.
            {hasApiKey && !apiKey && (
              <span className="ml-2 text-green-400 font-medium">✓ API key already saved</span>
            )}
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={hasApiKey ? '••••••••  (leave blank to keep current)' : info.placeholder}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 font-mono text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder-slate-600"
          />
          <p className="text-xs text-slate-600 mt-2">🔒 API keys are stored securely and never returned to the browser.</p>
        </div>

        {/* Current Config Preview */}
        <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-2xl p-5 mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Current Configuration</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300">Provider: <span className={`font-bold ${info.color}`}>{info.label}</span></span>
            <span className="bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300 font-mono">Model: <span className="font-bold text-white">{model}</span></span>
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${hasApiKey ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              API Key: {hasApiKey ? 'Set ✓' : 'Not Set'}
            </span>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
        >
          {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : 'Save Settings'}
        </button>
      </main>
    </div>
  )
}
