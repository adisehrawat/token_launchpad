'use client'
import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import TokenLaunchpad from './create-token'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletStatus } from './hooks/useWalletStatus'
import Image from 'next/image'
import { Connection, PublicKey } from '@solana/web3.js'
import { DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk'

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
  createdBy?: string
}

export default function Page() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all')
  const { publicKey } = useWallet()
  const [allPools, setAllPools] = useState<any[]>([])
  const [loadingPools, setLoadingPools] = useState(false)
  const [creatorPools, setCreatorPools] = useState<any[]>([])
  const [loadingCreatorPools, setLoadingCreatorPools] = useState(false)

  React.useEffect(() => {
    let isMounted = true
    async function fetchPools() {
      try {
        setLoadingPools(true)
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
        const client = new DynamicBondingCurveClient(connection, 'confirmed')
        const pools = await client.state.getPools()
        console.log(pools);
        if (!isMounted) return
        setAllPools(pools ?? [])
      } catch (e) {
        console.error('Failed to load pools', e)
      } finally {
        if (isMounted) setLoadingPools(false)
      }
    }
    fetchPools()
    return () => { isMounted = false }
  }, [])

  React.useEffect(() => {
    let isMounted = true
    async function fetchCreatorPools() {
      if (!publicKey) {
        setCreatorPools([])
        return
      }
      try {
        setLoadingCreatorPools(true)
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
        const client = new DynamicBondingCurveClient(connection, 'confirmed')
        const pools = await client.state.getPoolsByCreator(new PublicKey(publicKey))
        console.log(pools);
        if (!isMounted) return
        setCreatorPools(pools ?? [])
      } catch (e) {
        console.error('Failed to load creator pools', e)
      } finally {
        if (isMounted) setLoadingCreatorPools(false)
      }
    }
    fetchCreatorPools()
    return () => { isMounted = false }
  }, [publicKey])

  const handleTokenCreated = (newToken: Token) => {
    const createdBy = publicKey?.toString()
    setTokens(prev => [{ ...newToken, createdBy }, ...prev])
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

  const displayedPools = activeTab === 'all' ? allPools : creatorPools

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

        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            All Pools
          </button>
          <button
            onClick={() => setActiveTab('mine')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === 'mine' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            disabled={!publicKey}
          >
            My Pools
          </button>
        </div>

        {activeTab === 'all' ? (
          loadingPools ? (
            <div className="text-center py-20">Loading pools...</div>
          ) : displayedPools.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-32 h-32 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">No Pools Found</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">Start by creating your first token.</p>
              <button onClick={handleCreateNew} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-200 text-lg">Create Your First Token</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedPools.map((pool: any, idx: number) => {
                const name: string = pool?.name ?? 'Unknown'
                const symbol: string = pool?.symbol ?? 'POOL'
                const baseMint: string | undefined = pool?.baseMint?.toString?.()
                const poolAddress: string | undefined = pool?.pool?.toString?.() || pool?.poolSigner?.toString?.()
                const creator: string | undefined = pool?.poolCreator?.toString?.()
                const configAddr: string | undefined = pool?.config?.toString?.()
                const uri: string | undefined = typeof pool?.uri === 'string' ? pool.uri : undefined
                return (
                <div key={poolAddress || idx} className="bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-800 p-6 hover:border-gray-700 transition-all">
                  <div className="flex items-center space-x-4 mb-4">
                    {uri && uri.startsWith('http') ? (
                      <Image src={uri} alt={name} width={64} height={64} className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-700" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center ring-2 ring-gray-700">
                        <span className="text-2xl font-bold text-gray-500">{symbol.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-white">{name}</h3>
                      <p className="text-gray-400 font-mono">{symbol}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Base Mint:</span>
                      <span className="text-white font-mono truncate max-w-[12rem]" title={baseMint}>{baseMint || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pool Address:</span>
                      <span className="text-gray-300 text-xs truncate max-w-[12rem]" title={poolAddress}>{poolAddress || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Creator:</span>
                      <span className="text-gray-300 text-xs truncate max-w-[12rem]" title={creator}>{creator || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Config:</span>
                      <span className="text-gray-300 text-xs truncate max-w-[12rem]" title={configAddr}>{configAddr || '—'}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors text-sm">View Details</button>
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm">Trade</button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )
        ) : (
          loadingCreatorPools ? (
            <div className="text-center py-20">Loading your pools...</div>
          ) : displayedPools.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-32 h-32 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">No Pools Found</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">You have not created any pools with this wallet.</p>
              <button onClick={handleCreateNew} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-200 text-lg">Create Your First Token</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedPools.map((pool: any, idx: number) => {
                const name: string = pool?.name ?? 'Unknown'
                const symbol: string = pool?.symbol ?? 'POOL'
                const baseMint: string | undefined = pool?.baseMint?.toString?.()
                const poolAddress: string | undefined = pool?.pool?.toString?.() || pool?.poolSigner?.toString?.()
                const creator: string | undefined = pool?.poolCreator?.toString?.()
                const configAddr: string | undefined = pool?.config?.toString?.()
                const uri: string | undefined = typeof pool?.uri === 'string' ? pool.uri : undefined
                return (
                <div key={poolAddress || idx} className="bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-800 p-6 hover:border-gray-700 transition-all">
                  <div className="flex items-center space-x-4 mb-4">
                    {uri && uri.startsWith('http') ? (
                      <Image src={uri} alt={name} width={64} height={64} className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-700" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center ring-2 ring-gray-700">
                        <span className="text-2xl font-bold text-gray-500">{symbol.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-white">{name}</h3>
                      <p className="text-gray-400 font-mono">{symbol}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Base Mint:</span>
                      <span className="text-white font-mono truncate max-w-[12rem]" title={baseMint}>{baseMint || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pool Address:</span>
                      <span className="text-gray-300 text-xs truncate max-w-[12rem]" title={poolAddress}>{poolAddress || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Creator:</span>
                      <span className="text-gray-300 text-xs truncate max-w-[12rem]" title={creator}>{creator || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Config:</span>
                      <span className="text-gray-300 text-xs truncate max-w-[12rem]" title={configAddr}>{configAddr || '—'}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors text-sm">View Details</button>
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm">Trade</button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )
        )}
      </div>
    </div>
  )
}