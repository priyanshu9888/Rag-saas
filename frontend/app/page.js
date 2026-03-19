'use client'

import { motion } from 'framer-motion'
import { Bot, Shield, Zap, Database, ArrowRight, CheckCircle, Upload, MessageSquare, BarChart3, Users, Lock, Globe, Star, ChevronRight, Cpu, Layers, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 px-4">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full text-indigo-400 text-sm font-medium mb-8"
          >
            <Zap className="w-4 h-4" />
            <span>Powered by Gemini AI + RAG Technology</span>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight"
          >
            Train Your Chatbot on <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Your Own Knowledge
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Upload your PDFs, spreadsheets, or text files and get an instant AI assistant that knows
            everything about your business — privately and securely.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/signup"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center space-x-2 transition-all transform hover:scale-105 shadow-xl shadow-indigo-500/25"
            >
              <span>Start for Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-xl font-semibold border border-slate-700 hover:bg-slate-900 hover:border-slate-600 transition-all"
            >
              Sign In
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-slate-500 text-sm"
          >
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> No credit card required</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> SOC 2 ready architecture</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> GDPR compliant</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Data stays yours</span>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-y border-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { value: '10k+', label: 'Documents Processed' },
              { value: '500+', label: 'Companies Onboarded' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '<200ms', label: 'Avg Response Time' },
            ].map((stat) => (
              <motion.div key={stat.label} variants={fadeUp}>
                <p className="text-4xl font-extrabold text-white mb-1">{stat.value}</p>
                <p className="text-slate-500 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <p className="text-indigo-400 font-semibold mb-3 uppercase tracking-widest text-sm">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-bold">Deployed in 3 Simple Steps</h2>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-14 left-1/3 right-1/3 h-px bg-gradient-to-r from-indigo-600/0 via-indigo-500/50 to-indigo-600/0" />
            {[
              { step: '01', icon: <Upload className="w-8 h-8 text-indigo-400" />, title: 'Upload Your Files', desc: 'Drag and drop PDFs, Excel, CSV, or plain text files. Our system chunks, embeds, and indexes them automatically.' },
              { step: '02', icon: <Cpu className="w-8 h-8 text-purple-400" />, title: 'AI Does the Work', desc: 'Your documents are vectorized using Gemini embeddings and stored in a secure, private vector database on Supabase.' },
              { step: '03', icon: <MessageSquare className="w-8 h-8 text-pink-400" />, title: 'Start Chatting', desc: 'Your custom AI chatbot is ready. Ask it anything about your content and get precise, sourced answers instantly.' },
            ].map((item) => (
              <motion.div key={item.step} variants={fadeUp} className="relative p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 transition-all group">
                <div className="absolute top-6 right-6 text-5xl font-black text-slate-800 group-hover:text-indigo-900 transition-colors select-none">{item.step}</div>
                <div className="mb-5 p-3 bg-slate-800/50 rounded-xl inline-block">{item.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <p className="text-indigo-400 font-semibold mb-3 uppercase tracking-widest text-sm">Features</p>
            <h2 className="text-4xl md:text-5xl font-bold">Everything You Need</h2>
            <p className="text-slate-400 mt-4 max-w-xl mx-auto">A complete platform to build, deploy, and manage AI chatbots trained on your company's private knowledge.</p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Database className="w-6 h-6 text-indigo-400" />, title: 'Multi-Format Document Support', desc: 'PDF, Excel, CSV, TXT — our LangChain-powered loaders handle them all with smart text splitting.' },
              { icon: <Shield className="w-6 h-6 text-purple-400" />, title: 'Enterprise Multi-Tenancy', desc: 'Row Level Security ensures your data is completely isolated. No cross-contamination between companies.' },
              { icon: <Bot className="w-6 h-6 text-pink-400" />, title: 'Gemini 2.0 Powered', desc: 'Latest Google Gemini models for state-of-the-art language understanding and response generation.' },
              { icon: <Lock className="w-6 h-6 text-yellow-400" />, title: 'End-to-End Security', desc: 'All data encrypted at rest and in transit. Supabase handles auth with full JWT security.' },
              { icon: <BarChart3 className="w-6 h-6 text-green-400" />, title: 'Token Usage Analytics', desc: 'Track your API usage per company with built-in token metering and easy reporting.' },
              { icon: <Globe className="w-6 h-6 text-blue-400" />, title: 'REST API Access', desc: 'Headless API built with FastAPI. Integrate your chatbot into any product via simple HTTP calls.' },
              { icon: <Layers className="w-6 h-6 text-orange-400" />, title: 'Vector Search (pgvector)', desc: 'Semantic similarity search powered by Supabase + pgvector for blazing-fast, accurate retrieval.' },
              { icon: <TrendingUp className="w-6 h-6 text-rose-400" />, title: 'Scalable Architecture', desc: 'Built on modern serverless infrastructure — scales automatically as your usage grows.' },
              { icon: <Users className="w-6 h-6 text-cyan-400" />, title: 'Team Collaboration', desc: 'Multiple users per company can upload documents and use the chatbot simultaneously.' },
            ].map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-all group">
                <div className="mb-4 p-2 bg-slate-800/60 rounded-lg inline-block group-hover:bg-indigo-500/10 transition-colors">{f.icon}</div>
                <h3 className="text-lg font-bold mb-2 text-white">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <p className="text-indigo-400 font-semibold mb-3 uppercase tracking-widest text-sm">Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-bold">Loved by Teams</h2>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah K.', role: 'Head of Operations, FinCorp', quote: 'We trained the chatbot on our 500-page policy manual in minutes. It now handles 80% of internal HR queries automatically.', stars: 5 },
              { name: 'Rajan M.', role: 'CTO, TechStart India', quote: 'The RAG accuracy is incredible. Our support team uses it daily to answer customer product questions with source citations.', stars: 5 },
              { name: 'Elena P.', role: 'Data Lead, MediGroup', quote: 'Security was our top concern. The row-level isolation means patient-facing data is completely separated per clinic.', stars: 5 },
            ].map((t) => (
              <motion.div key={t.name} variants={fadeUp} className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-white">{t.name}</p>
                  <p className="text-slate-500 text-sm">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <p className="text-indigo-400 font-semibold mb-3 uppercase tracking-widest text-sm">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-bold">Simple, Transparent Plans</h2>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter', price: 'Free', period: 'forever',
                features: ['1 Company', 'Up to 10 documents', '500 queries/month', 'PDF & TXT support', 'Community support'],
                cta: 'Get Started', href: '/signup', highlighted: false
              },
              {
                name: 'Pro', price: '$29', period: '/month',
                features: ['1 Company', 'Unlimited documents', '10,000 queries/month', 'All file formats', 'Token analytics', 'Priority support'],
                cta: 'Start Free Trial', href: '/signup', highlighted: true
              },
              {
                name: 'Enterprise', price: 'Custom', period: '',
                features: ['Unlimited companies', 'Unlimited documents', 'Unlimited queries', 'Custom models', 'SLA guarantee', 'Dedicated support'],
                cta: 'Contact Us', href: '/signup', highlighted: false
              },
            ].map((plan) => (
              <motion.div key={plan.name} variants={fadeUp} className={`p-8 rounded-2xl border transition-all ${plan.highlighted ? 'bg-indigo-600/10 border-indigo-500/50 shadow-xl shadow-indigo-500/10' : 'bg-slate-900 border-slate-800'}`}>
                {plan.highlighted && <span className="inline-block text-xs font-bold bg-indigo-500 text-white px-3 py-1 rounded-full mb-4 uppercase tracking-wider">Most Popular</span>}
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`block w-full text-center py-3 rounded-xl font-semibold transition-all ${plan.highlighted ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'border border-slate-700 hover:bg-slate-800 text-slate-200'}`}>
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative rounded-3xl bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-pink-600/10 border border-indigo-500/20 p-12 md:p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent rounded-3xl" />
            <div className="relative z-10">
              <Bot className="w-14 h-14 text-indigo-400 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Build Your AI?</h2>
              <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
                Join hundreds of companies already using RAG SaaS to empower their teams with private, intelligent chatbots.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all transform hover:scale-105 shadow-xl shadow-indigo-500/25">
                  <span>Create Free Account</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/login" className="px-8 py-4 rounded-xl font-semibold border border-slate-700 hover:bg-slate-900 transition-all">
                  Sign In →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center space-x-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Bot className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">RAG SaaS</span>
            </div>
            <div className="flex gap-8 text-slate-500 text-sm">
              <Link href="#features" className="hover:text-white transition-colors">Features</Link>
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
              <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            </div>
          </div>
          <div className="border-t border-slate-800/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-600 text-sm">
            <p>© 2026 RAG SaaS. Built with Next.js, FastAPI & Gemini.</p>
            <p>Made with ❤️ for enterprise teams</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
