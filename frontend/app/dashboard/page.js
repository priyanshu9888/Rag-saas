'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FileText, Plus, Search, Trash2, ExternalLink } from 'lucide-react'
import Navbar from '@/components/Navbar'
import FileUpload from '@/components/FileUpload'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const fetchDocuments = async () => {
    try {
      setError(null)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      const companyId = session.user.user_metadata?.company_id
      
      if (!companyId) {
        setError('No company associated with this account. Please sign up again.')
        return
      }

      const { data, error: sbError } = await supabase
        .from('documents')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (sbError) throw sbError
      setDocuments(data || [])
    } catch (err) {
      console.error('Error fetching documents:', err)
      const errorMessage = typeof err === 'object' ? JSON.stringify(err) : String(err)
      setError(`Connection Error: ${err.message || errorMessage}. Check your Supabase configuration.`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />

      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Knowledge Base</h1>
            <p className="text-slate-400">Manage your company documents and training data.</p>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
          >
            {showUpload ? <Trash2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <span>{showUpload ? 'Cancel' : 'Upload Document'}</span>
          </button>
        </div>

        {showUpload && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mb-12"
          >
            <FileUpload onUploadComplete={() => {
              setShowUpload(false)
              fetchDocuments()
            }} />
          </motion.div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard title="Total Documents" value={documents.length} />
          <StatCard title="Tokens Used" value="12.5k" unit="this month" />
          <StatCard title="Storage" value="45.2" unit="MB used" />
        </div>

        {/* Documents Table */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-bold">Uploaded Files</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search documents..."
                className="bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Filename</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Created At</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
                      Loading documents...
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
                      No documents found. Start by uploading one!
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <FileText className="text-indigo-400 w-5 h-5" />
                          <span className="font-medium">{doc.filename}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded text-xs uppercase font-bold">
                          {doc.file_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-500 hover:text-white mr-4">
                          <ExternalLink className="w-5 h-5" />
                        </button>
                        <button className="text-slate-500 hover:text-red-400">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, unit }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        {unit && <span className="text-slate-500 text-sm">{unit}</span>}
      </div>
    </div>
  )
}
