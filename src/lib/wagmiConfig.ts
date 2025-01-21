'use client'
import { mainnet } from 'wagmi/chains'

import { http, createStorage, cookieStorage } from 'wagmi'
import { Chain, getDefaultConfig } from '@rainbow-me/rainbowkit'

const projectId = 'YOUR_PROJECT_ID'

const supportedChains: Chain[] = [ mainnet ]

// declare module 'wagmi' {
//   interface Register {
//     config: typeof config
//   }
// }

export const config = getDefaultConfig({
  appName: 'Unidefi',
  projectId,
  chains: supportedChains as never,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`)
  },
})