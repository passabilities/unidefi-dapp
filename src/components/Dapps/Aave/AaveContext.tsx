'use client'

import { useAaveData } from '@/components/Dapps/Aave/aave-utils'
import { formatReserves, formatUserSummary } from '@aave/math-utils'
import { createContext, FC, PropsWithChildren, useContext } from 'react'
import { useAccount } from 'wagmi'

interface DataType {
  data?: {
    reserves: ReturnType<typeof formatReserves>
    userSummary: ReturnType<typeof formatUserSummary>
  }
  update: () => void
}

const AaveContext = createContext<DataType>({
  data: undefined,
  update: () => {},
})

export const AaveContextProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const { address } = useAccount()
  const aaveData = useAaveData({ address })

  console.log({ address, aaveData })

  return (
    <AaveContext.Provider value={{
      ...aaveData
    }}>
      {children}
    </AaveContext.Provider>
  )
}

export const useAaveContext = () => {
  const context = useContext(AaveContext)
  console.log({ context })
  if (context === undefined) {
    throw new Error(
      'useAaveContext must be used within a AaveContext',
    )
  }
  return context
}
