'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Bot, LogOut, User, Menu, X, Settings } from 'lucide-react'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Bot className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                RAG SaaS
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/chat" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Chat
              </Link>
              {user && (
                <Link href="/settings" className="flex items-center gap-1.5 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  <Settings className="w-4 h-4" /> Settings
                </Link>
              )}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 px-4 py-2 rounded-lg border border-red-500/30 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/30"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/dashboard" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Dashboard
            </Link>
            <Link href="/chat" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              Chat
            </Link>
            {user && (
              <Link href="/settings" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                Settings
              </Link>
            )}
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-left text-red-400 px-3 py-2 rounded-md text-base font-medium"
              >
                Logout
              </button>
            ) : (
              <Link href="/login" className="text-indigo-400 block px-3 py-2 rounded-md text-base font-medium">
                Get Started
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
