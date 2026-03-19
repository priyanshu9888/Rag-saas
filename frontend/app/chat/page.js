'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Loader2, Sparkles, Paperclip, ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import axios from 'axios'
import { supabase } from '@/lib/supabase'

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your company knowledge assistant. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const companyId = session?.user?.user_metadata?.company_id || 'test-company'

      const response = await axios.post('http://localhost:8000/chat', {
        query: input,
        company_id: companyId
      })

      const assistantMessage = { 
        role: 'assistant', 
        content: response.data.answer,
        sources: response.data.sources 
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat failed:', error)
      const detail = error?.response?.data?.detail || error?.message || 'Unknown error'
      const isQuota = detail.toLowerCase().includes('quota') || detail.includes('429')
      const msg = isQuota
        ? '⚠️ API quota exceeded. The Gemini free tier limit has been reached. Please wait a few minutes and try again, or upgrade your API plan.'
        : `Sorry, I encountered an error: ${detail}`
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: msg
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col pt-16 h-screen max-w-5xl mx-auto w-full px-4">
        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto py-8 space-y-6 scrollbar-hide"
        >
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start max-w-[80%] space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`p-2 rounded-lg shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                    {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-indigo-400" />}
                  </div>
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                    <p className="leading-relaxed">{msg.content}</p>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-800">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Sources</p>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((source, sIdx) => (
                            <span key={sIdx} className="text-[10px] bg-slate-800 text-indigo-300 px-2 py-1 rounded border border-indigo-500/20">
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                <span className="text-slate-400 text-sm">Thinking...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="pb-8 pt-4">
          <form 
            onSubmit={handleSend}
            className="relative bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl focus-within:border-indigo-500/50 transition-all"
          >
            <textarea
              rows="1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(e)
                }
              }}
              placeholder="Ask anything about your documents..."
              className="w-full bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-500 py-3 pl-4 pr-12 resize-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white p-3 rounded-xl transition-all shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-center text-[10px] text-slate-600 mt-4 uppercase tracking-widest font-bold">
            Powered by Gemini 1.5 Flash & RAG Technology
          </p>
        </div>
      </main>
    </div>
  )
}
