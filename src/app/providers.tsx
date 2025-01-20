'use client'

import { BlockContextProvider } from '@/components/Block/BlockContext'
import { config } from '@/lib/wagmiConfig'
import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FC, PropsWithChildren } from 'react'
import { State, WagmiProvider } from 'wagmi'

import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

interface Props extends PropsWithChildren {
  initialState?: State
}

const Providers: FC<Props> = ({ children, initialState }) => {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: '#0E76FD',
            accentColorForeground: 'white',
            borderRadius: 'large',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
        >
          <BlockContextProvider>
            {children}
          </BlockContextProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default Providers
