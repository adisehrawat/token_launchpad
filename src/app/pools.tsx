'use client'
import React, { useState, useEffect } from 'react'

interface Pool {
  name?: string
  symbol?: string
  baseMint?: { toString?: () => string }
  pool?: { toString?: () => string }
  poolSigner?: { toString?: () => string }
  poolCreator?: { toString?: () => string }
  config?: { toString?: () => string }
  uri?: string
  baseSupply?: string
  quoteSupply?: string
  isMigrated?: boolean
}

interface PoolsProps {
  onTokenCreated?: () => void
  refreshTrigger?: number
}

export default function Pools({ onTokenCreated, refreshTrigger }: PoolsProps) {
  const [creatorPools, setCreatorPools] = useState<Pool[]>([])
  const [loadingCreatorPools, setLoadingCreatorPools] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function fetchCreatorPools() {
      try {
        setLoadingCreatorPools(true)
        const configAddress = 'AdQWsu7ittQwDqr1aaBHDndisLUksGZMieM3krVU4XRZ';
        
        const response = await fetch(`/api/pools?config=${encodeURIComponent(configAddress)}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch pools')
        }
        
        const poolsData = await response.json()
        
        if (!isMounted) return
        
        if (poolsData.success) {
          const mappedPools: Pool[] = poolsData.pools.map((pool: {
            name: string;
            symbol: string;
            baseMintKey: string;
            poolKey: string;
            config: string;
            uri: string;
            baseSupply: string;
            quoteSupply: string;
            isMigrated: boolean;
          }) => ({
            name: pool.name,
            symbol: pool.symbol,
            baseMint: { toString: () => pool.baseMintKey },
            pool: { toString: () => pool.poolKey },
            poolSigner: { toString: () => pool.poolKey },
            poolCreator: { toString: () => pool.poolKey },
            config: { toString: () => pool.config },
            uri: pool.uri,
            baseSupply: pool.baseSupply,
            quoteSupply: pool.quoteSupply,
            isMigrated: pool.isMigrated,
          }))
          setCreatorPools(mappedPools)
          console.log(`Loaded ${poolsData.totalPools} pools from API`)
        } else {
          console.error('API returned error:', poolsData.error)
          setCreatorPools([])
        }
      } catch (e) {
        console.error('Failed to load creator pools', e)
        setCreatorPools([])
      } finally {
        if (isMounted) setLoadingCreatorPools(false)
      }
    }
    fetchCreatorPools()
    return () => { isMounted = false }
  }, [refreshTrigger])

  const handleCreateNew = () => {
    if (onTokenCreated) {
      onTokenCreated()
    }
  }

  if (loadingCreatorPools) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <p className="mt-4 text-slate-300">Loading your pools...</p>
      </div>
    )
  }

  if (creatorPools.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-32 h-32 mx-auto mb-6 bg-slate-800 rounded-full flex items-center justify-center">
          <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-slate-100 mb-4">No Pools Found</h2>
        <p className="text-slate-300 mb-8 max-w-md mx-auto">You have not created any pools with this wallet.</p>
        <button 
          onClick={handleCreateNew} 
          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-200 text-lg"
        >
          Create Your First Token
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {creatorPools.map((pool: Pool, idx: number) => {
        const name: string = pool?.name ?? 'Unknown'
        const symbol: string = pool?.symbol ?? 'POOL'
        const baseMint: string | undefined = pool?.baseMint?.toString?.()
        const poolAddress: string | undefined = pool?.pool?.toString?.() || pool?.poolSigner?.toString?.()
        
        return (
          <div key={poolAddress || idx} className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-700 p-6 hover:border-slate-600 transition-all">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center ring-2 ring-slate-600" style={{
                background: `linear-gradient(135deg, 
                  hsl(${(name.charCodeAt(0) * 137.5) % 360}, 70%, 50%), 
                  hsl(${(symbol.charCodeAt(0) * 137.5) % 360}, 70%, 60%))`
              }}>
                <span className="text-2xl font-bold text-white">{symbol.charAt(0)}</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-100">{name}</h3>
                <p className="text-slate-300 font-mono">{symbol}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-300">Base Supply:</span>
                <span className="text-slate-100 font-mono text-sm" title={pool.baseSupply}>
                  {pool.baseSupply ? Number(pool.baseSupply).toLocaleString() : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Quote Supply:</span>
                <span className="text-slate-100 font-mono text-sm" title={pool.quoteSupply}>
                  {pool.quoteSupply ? Number(pool.quoteSupply).toLocaleString() : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Status:</span>
                <span className={`text-sm font-medium ${pool.isMigrated ? 'text-yellow-400' : 'text-green-400'}`}>
                  {pool.isMigrated ? 'Migrated' : 'Active'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Base Mint:</span>
                <span className="text-slate-200 text-xs truncate max-w-[12rem]" title={baseMint}>{baseMint || '—'}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex space-x-2">
                <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 py-2 px-4 rounded-lg transition-colors text-sm">View Details</button>
                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors text-sm">Trade</button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
