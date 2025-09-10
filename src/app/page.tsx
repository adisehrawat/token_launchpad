'use client'
import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import TokenLaunchpad from './create-token'
import Pools from './pools'
import { useWalletStatus } from './hooks/useWalletStatus'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
)

function WalletStatus() {
  const { mounted } = useWalletStatus()

  if (!mounted) {
    return (
      <div className="flex justify-end p-4">
        <div className="w-32 h-10 bg-slate-700 rounded-lg animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="flex justify-end p-4">
      <WalletMultiButton />
    </div>
  )
}

export default function Page() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)


  const handleTokenCreated = () => {
    setShowCreateForm(false)
    setRefreshTrigger(prev => prev + 1)
  }

  const handleCreateNew = () => {
    setShowCreateForm(true)
  }

  const handleBackToList = () => {
    setShowCreateForm(false)
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-slate-900">
        <WalletStatus />
        <div className="p-4">
          <button
            onClick={handleBackToList}
            className="mb-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-colors"
          >
            ← Back to Tokens
          </button>
        </div>
        <TokenLaunchpad onTokenCreated={handleTokenCreated} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <WalletStatus />
      
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-100">
            Pools
          </h1>
          <button
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-200"
          >
            + Create New Token
          </button>
        </div>
        <Pools onTokenCreated={handleTokenCreated} refreshTrigger={refreshTrigger} />
      </div>
    </div>
  )
}