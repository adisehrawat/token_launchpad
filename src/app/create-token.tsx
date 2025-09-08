'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { useWallet, Wallet } from '@solana/wallet-adapter-react'
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, Transaction } from '@solana/web3.js'
import { DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk'

interface Token {
    id: string
    name: string
    symbol: string
    totalSupply: string
    image?: string
    createdAt: string
}

interface TokenLaunchpadProps {
    onTokenCreated?: (token: Token) => void
}

export default function TokenLaunchpad({ onTokenCreated }: TokenLaunchpadProps) {
    const wallet = useWallet();
    const { publicKey, signTransaction, sendTransaction } = useWallet();
    const connection = new Connection(
        'https://api.devnet.solana.com',
        'confirmed'
    )
    const [tokenData, setTokenData] = useState({
        name: '',
        symbol: '',
        totalSupply: '',
        image: null as File | null
    })
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setTokenData(prev => ({
            ...prev,
            [name]: value
        }))
    }
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setTokenData(prev => ({
                ...prev,
                image: file
            }))
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }
    const handleCreateToken = async () => {
        if (!tokenData.name || !tokenData.symbol || !tokenData.totalSupply) {
            alert('Please fill in all required fields')
            return
        }
        try {
            const formData = new FormData()
            formData.append('name', tokenData.name)
            formData.append('symbol', tokenData.symbol)
            formData.append('totalSupply', tokenData.totalSupply)
            if (tokenData.image) {
                formData.append('image', tokenData.image)
            }
            const response = await fetch('/api', {
                method: 'POST',
                body: formData,
            })
            const result = await response.json()
            console.log(result);

            const configAddress = new PublicKey(result.configAddress);
            console.log(`Payer wallet: ${wallet.publicKey?.toString()}`)
            console.log(`Pool creator wallet: ${wallet.publicKey?.toString()}`)
            console.log(`Using config: ${configAddress.toString()}`)
            if (!publicKey || !signTransaction) {
                throw new Error('Wallet not connected')
            }
            try {
                const baseMint = Keypair.generate()
                console.log(`Generated base mint: ${baseMint.publicKey.toString()}`)
        
                const createPoolParam = {
                    baseMint: baseMint.publicKey,
                    config: configAddress,
                    name: tokenData.name,
                    symbol: tokenData.symbol,
                    uri: "https://image.com",
                    payer: publicKey,
                    poolCreator: publicKey,
                }
                const client = new DynamicBondingCurveClient(connection, 'confirmed')
                const transaction = await client.pool.createPool(createPoolParam);
                transaction.feePayer = publicKey
                transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

                transaction.partialSign(baseMint)
                const signedTx = await signTransaction(transaction);

            const txid = await connection.sendRawTransaction(signedTx.serialize());
            await connection.confirmTransaction(txid, 'confirmed')
                console.log('Transaction confirmed pool created!')
                console.log(
                    `Pool created: https://solscan.io/tx/${txid}?cluster=devnet`
                )
            } catch (error) {
                console.error('Failed to create pool:', error)
                console.log('Error details:', JSON.stringify(error, null, 2))
                throw error
            }

            console.log('Token created:', result)

            if (result.success) {
                const newToken: Token = {
                    id: Date.now().toString(),
                    name: tokenData.name,
                    symbol: tokenData.symbol,
                    totalSupply: tokenData.totalSupply,
                    image: previewUrl || undefined,
                    createdAt: new Date().toISOString()
                }

                if (onTokenCreated) {
                    onTokenCreated(newToken)
                }

                setTokenData({
                    name: '',
                    symbol: '',
                    totalSupply: '',
                    image: null
                })
                setPreviewUrl(null)

                alert('Token created successfully!')
            } else {
                alert('Error creating token: ' + (result.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Error creating token:', error)
            alert('Error creating token')
        }
    }

    return (
        <div>
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-white mb-12">
                    Token Launchpad
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-800 p-8">
                        <h2 className="text-2xl font-semibold text-white mb-8">Token Details</h2>

                        <div className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
                                    Token Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={tokenData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., My Awesome Token"
                                    className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="symbol" className="block text-sm font-medium text-gray-400 mb-2">
                                    Token Symbol *
                                </label>
                                <input
                                    type="text"
                                    id="symbol"
                                    name="symbol"
                                    value={tokenData.symbol}
                                    onChange={handleInputChange}
                                    placeholder="e.g., MAT"
                                    className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="totalSupply" className="block text-sm font-medium text-gray-400 mb-2">
                                    Total Supply *
                                </label>
                                <input
                                    type="number"
                                    id="totalSupply"
                                    name="totalSupply"
                                    value={tokenData.totalSupply}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 1000000"
                                    className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="image" className="block text-sm font-medium text-gray-400 mb-2">
                                    Token Image
                                </label>
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-800 p-8">
                        <h2 className="text-2xl font-semibold text-white mb-8">Token Preview</h2>

                        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                            {previewUrl ? (
                                <div className="text-center">
                                    <Image
                                        src={previewUrl}
                                        alt="Token preview"
                                        width={128}
                                        height={128}
                                        className="w-32 h-32 rounded-full object-cover mx-auto mb-6 shadow-lg ring-4 ring-gray-700"
                                    />
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-semibold text-white">
                                            {tokenData.name || 'Token Name'}
                                        </h3>
                                        <p className="text-lg text-gray-400 font-mono">
                                            {tokenData.symbol || 'SYMBOL'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Supply: {tokenData.totalSupply ? Number(tokenData.totalSupply).toLocaleString() : '0'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-gray-700">
                                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-lg">Upload an image to preview your token</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex justify-center mt-12">
                    <button
                        onClick={handleCreateToken}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-12 rounded-xl shadow-xl hover:shadow-blue-500/20 transform hover:-translate-y-1 transition-all duration-200 text-lg"
                    >
                        Create Token
                    </button>
                </div>
            </div>
        </div>
    )
}
