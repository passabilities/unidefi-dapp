'use client'
import { mainnet } from 'wagmi/chains'

import { http, createStorage, cookieStorage } from 'wagmi'
import { Chain, getDefaultConfig } from '@rainbow-me/rainbowkit'

const projectId = 'YOUR_PROJECT_ID'

const supportedChains: Chain[] = [ mainnet ]

export const config = getDefaultConfig({
  appName: 'Unidefi',
  projectId,
  chains: supportedChains as never,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: supportedChains.reduce((obj, chain) => ({ ...obj, [chain.id]: http() }), {}),
})