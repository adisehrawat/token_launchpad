'use client'
import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, Transaction } from '@solana/web3.js'
import { Buffer } from 'buffer'
import Image from 'next/image'
import { Input, Label, Loader2, AlertCircle } from './components'
import { toast } from 'sonner'

interface Token {
    id: string,
    tokenName: string;
    tokenSymbol: string;
    tokenUri: string;
    createdAt: string,
}
interface FormErrors {
    [key: string]: string;
  }

interface TokenLaunchpadProps {
    onTokenCreated?: (token: Token) => void
}

export default function TokenLaunchpad({ onTokenCreated }: TokenLaunchpadProps) {
    const { publicKey, sendTransaction } = useWallet();
    const connection = new Connection(
        'https://api.devnet.solana.com',
        'confirmed'
    )
    const [tokenData, setTokenData] = useState<Token>({
        id: '',
        tokenName: '',
        tokenSymbol: '',
        tokenUri: '',
        createdAt: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    const handleInputChange = (field: string, value: string) => {
        setTokenData(prev => ({
            ...prev,
            [field]: value
        }));
        
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
        if (field === 'tokenUri') {
            setImageError(false);
            setImageLoading(false);
        }
    }
    
    const validateForm = () => {
        const newErrors: FormErrors = {};
        
        if (!tokenData.tokenName.trim()) {
            newErrors.tokenName = 'Token name is required';
        }
        
        if (!tokenData.tokenSymbol.trim()) {
            newErrors.tokenSymbol = 'Token symbol is required';
        } else if (tokenData.tokenSymbol.length < 2) {
            newErrors.tokenSymbol = 'Token symbol must be at least 2 characters';
        }
        
        if (!tokenData.tokenUri.trim()) {
            newErrors.tokenUri = 'Token URI is required';
        } else if (!tokenData.tokenUri.startsWith('http')) {
            newErrors.tokenUri = 'Token URI must be a valid URL';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }
    const handleCreateToken = async () => {
        if (!publicKey || !sendTransaction) {
            toast.error("No wallet found", {
                description: "Connect wallet first"
              })
            return
        }
        
        if (!validateForm()) {
            return
        }
        
        setIsLoading(true);
        try {
            const response = await fetch('/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: tokenData.tokenName,
                    symbol: tokenData.tokenSymbol,
                    walletAddress: publicKey.toBase58(),
                    uri: tokenData.tokenUri,
                }),
            })
            if (!response.ok) {
                const err = await response.json().catch(() => ({}))
                throw new Error(err?.error || 'Request failed')
            }
            const { transaction: txB64 } = await response.json()
            if (!txB64) throw new Error('No transaction returned')
            const txBytes = Buffer.from(txB64, 'base64')
            const tx = Transaction.from(txBytes)
            tx.feePayer = publicKey
            const sig = await sendTransaction(tx, connection)
            await connection.confirmTransaction(sig, 'confirmed')
            if (onTokenCreated) {
                onTokenCreated({
                    id: sig,
                    tokenName: tokenData.tokenName,
                    tokenSymbol: tokenData.tokenSymbol,
                    tokenUri: tokenData.tokenUri,
                    createdAt: new Date().toISOString(),
                })
            }
            toast.success('Token Created', {
                description: (
                  <a
                    href={`https://explorer.solana.com/tx/${sig}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                  >
                    View on Solana Explorer
                  </a>
                ),
              })
            console.log('Token created! Tx: ' + sig)
            setTokenData({
                id: '',
                tokenName: '',
                tokenSymbol: '',
                tokenUri: '',
                createdAt: ''
            });
        } catch (error) {
            console.error('Error creating token:', error)
            toast.error("Error creating token", {
                description: error instanceof Error ? error.message : "Unknown error"
              })
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center text-slate-100 mb-12">
                    Token Launchpad
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-700 p-8">
                        <h2 className="text-2xl font-semibold text-slate-100 mb-8">Token Details</h2>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="tokenName" className="text-slate-200">
                                    Token Name *
                                </Label>
                                 <Input
                                     id="tokenName"
                                     placeholder="e.g., Solana Token"
                                     className="bg-slate-700/60 border border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                                     value={tokenData.tokenName}
                                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('tokenName', e.target.value)}
                                 />
                                {errors.tokenName && (
                                    <p className="text-sm text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.tokenName}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tokenSymbol" className="text-slate-200">
                                    Token Symbol *
                                </Label>
                                 <Input
                                     id="tokenSymbol"
                                     placeholder="e.g., SOL"
                                     className="bg-slate-700/60 border border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                                     value={tokenData.tokenSymbol}
                                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('tokenSymbol', e.target.value.toUpperCase())}
                                     maxLength={10}
                                 />
                                {errors.tokenSymbol && (
                                    <p className="text-sm text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.tokenSymbol}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2 mt-5">
                            <Label htmlFor="tokenUri" className="text-slate-200">
                                Token Image URL *
                            </Label>
                            <Input
                                id="tokenUri"
                                placeholder="https://example.com/token-image.png"
                                className="bg-slate-700/60 border border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                                value={tokenData.tokenUri}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('tokenUri', e.target.value)}
                            />
                            {errors.tokenUri && (
                                <p className="text-sm text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.tokenUri}
                                </p>
                            )}
                            <p className="text-sm text-slate-400">
                                Direct URL to your token image (PNG, JPG, etc.)
                            </p>
                        </div>
                    </div>

                    {/* Token Preview */}
                    <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-700 p-8">
                        <h2 className="text-2xl font-semibold text-slate-100 mb-8">Token Preview</h2>

                        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                            {tokenData.tokenName || tokenData.tokenSymbol || tokenData.tokenUri ? (
                                <div className="text-center space-y-6">
                                    {/* Token Image */}
                                    <div className="w-32 h-32 rounded-full shadow-2xl ring-4 ring-slate-600 overflow-hidden relative">
                                        {tokenData.tokenUri && tokenData.tokenUri.startsWith('http') ? (
                                            <>
                                                {imageLoading && (
                                                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                                                        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                                                    </div>
                                                )}
                                                <Image
                                                    src={`/api/image-proxy?url=${encodeURIComponent(tokenData.tokenUri)}`}
                                                    alt={tokenData.tokenName || 'Token'}
                                                    width={128}
                                                    height={128}
                                                    className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                                                    onLoad={() => {
                                                        setImageLoading(false);
                                                        setImageError(false);
                                                    }}
                                                    onError={() => {
                                                        setImageLoading(false);
                                                        setImageError(true);
                                                    }}
                                                    onLoadStart={() => setImageLoading(true)}
                                                />
                                                {imageError && (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                        <span className="text-4xl font-bold text-white">
                                                            {tokenData.tokenSymbol ? tokenData.tokenSymbol.charAt(0) : '?'}
                                                        </span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                {tokenData.tokenSymbol ? (
                                                    <span className="text-4xl font-bold text-white">
                                                        {tokenData.tokenSymbol.charAt(0)}
                                                    </span>
                                                ) : (
                                                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-bold text-slate-100">
                                            {tokenData.tokenName || 'Token Name'}
                                        </h3>
                                        <p className="text-xl text-slate-300 font-mono">
                                            {tokenData.tokenSymbol || 'SYMBOL'}
                                        </p>
                                    </div>

                                    {/* Status Indicator */}
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-green-400">Ready to create</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-slate-400">
                                    <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-slate-600">
                                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-lg">Fill in the details to preview your token</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
                <div className="flex justify-center mt-12">
                    <button
                        onClick={handleCreateToken}
                        disabled={isLoading || !tokenData.tokenName || !tokenData.tokenSymbol || !tokenData.tokenUri}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-12 rounded-xl shadow-xl hover:shadow-blue-500/20 transform hover:-translate-y-1 transition-all duration-200 text-lg flex items-center gap-2 disabled:transform-none"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating Token...
                            </>
                        ) : (
                            'Create Token'
                        )}
                    </button>
                </div>
        </div>
    )
}

