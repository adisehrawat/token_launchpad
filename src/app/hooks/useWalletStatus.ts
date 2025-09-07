'use client'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'

export function useWalletStatus() {
  const { connected } = useWallet()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return {
    connected: mounted ? connected : false,
    mounted
  }
}
