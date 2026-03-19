'use client'

import { useState, useCallback } from 'react'
import { Upload, File, X, CheckCircle, Loader2 } from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '@/lib/api'
import { supabase } from '@/lib/supabase'

export default function FileUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState(null) // 'success' | 'error'

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setStatus(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setStatus(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const companyId = session?.user?.user_metadata?.company_id || 'test-company' // Fallback for test

      const formData = new FormData()
      formData.append('file', file)
      formData.append('company_id', companyId)

      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setStatus('success')
      setFile(null)
      if (onUploadComplete) onUploadComplete()
    } catch (error) {
      console.error('Upload failed:', error)
      setStatus('error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-10 hover:border-indigo-500/50 transition-all group">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.csv,.txt,.xlsx,.xls"
        />
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center cursor-pointer"
        >
          <div className="bg-indigo-500/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
            <Upload className="text-indigo-400 w-8 h-8" />
          </div>
          <p className="text-lg font-medium text-white mb-2">
            {file ? file.name : 'Click to upload or drag and drop'}
          </p>
          <p className="text-slate-400 text-sm">
            PDF, CSV, TXT, Excel (max 10MB)
          </p>
        </label>
      </div>

      {file && !uploading && !status && (
        <div className="mt-6 flex items-center justify-between bg-slate-800/50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <File className="text-indigo-400 w-5 h-5" />
            <span className="text-sm text-slate-200">{file.name}</span>
          </div>
          <button
            onClick={() => setFile(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {uploading && (
        <div className="mt-6 flex items-center justify-center space-x-3 text-indigo-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Processing document...</span>
        </div>
      )}

      {status === 'success' && (
        <div className="mt-6 flex items-center justify-center space-x-3 text-emerald-400">
          <CheckCircle className="w-5 h-5" />
          <span>Document processed successfully!</span>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-6 flex items-center justify-center space-x-3 text-red-400">
          <X className="w-5 h-5" />
          <span>Upload failed. Please try again.</span>
        </div>
      )}

      <button
        disabled={!file || uploading}
        onClick={handleUpload}
        className={`w-full mt-8 py-4 rounded-xl font-bold transition-all ${
          !file || uploading
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'
        }`}
      >
        Upload and Train
      </button>
    </div>
  )
}
