'use client'
import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import TokenLaunchpad from './create-token'
import { useWalletStatus } from './hooks/useWalletStatus'
import Image from 'next/image'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
)

function WalletStatus() {
  const { mounted } = useWalletStatus()

  if (!mounted) {
    return (
      <div className="flex justify-end p-4">
        <div className="w-32 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="flex justify-end p-4">
      <WalletMultiButton />
    </div>
  )
}

interface Token {
  id: string
  name: string
  symbol: string
  totalSupply: string
  image?: string
  createdAt: string
}

export default function Page() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleTokenCreated = (newToken: Token) => {
    setTokens(prev => [newToken, ...prev])
    setShowCreateForm(false)
  }

  const handleCreateNew = () => {
    setShowCreateForm(true)
  }

  const handleBackToList = () => {
    setShowCreateForm(false)
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <WalletStatus />
        <div className="p-4">
          <button
            onClick={handleBackToList}
            className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            ← Back to Tokens
          </button>
        </div>
        <TokenLaunchpad onTokenCreated={handleTokenCreated} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <WalletStatus />
      
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            Token Launchpad
          </h1>
          <button
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-200"
          >
            + Create New Token
          </button>
        </div>

        {tokens.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-4">No Tokens Created Yet</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Start by creating your first token. Click the &quot;Create New Token&quot; button to get started.
            </p>
            <button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-200 text-lg"
            >
              Create Your First Token
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokens.map((token) => (
              <div key={token.id} className="bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-800 p-6 hover:border-gray-700 transition-all">
                <div className="flex items-center space-x-4 mb-4">
                  {token.image ? (
                    <Image
                      src={token.image}
                      alt={token.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-700"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center ring-2 ring-gray-700">
                      <span className="text-2xl font-bold text-gray-500">
                        {token.symbol.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-white">{token.name}</h3>
                    <p className="text-gray-400 font-mono">{token.symbol}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Supply:</span>
                    <span className="text-white font-mono">
                      {Number(token.totalSupply).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created:</span>
                    <span className="text-gray-300 text-sm">
                      {new Date(token.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                      View Details
                    </button>
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                      Trade
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}