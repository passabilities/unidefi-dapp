'use client'

import { Alchemy, Network } from 'alchemy-sdk'
import BN from 'bignumber.js'
import { createContext, FC, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { useChainId } from 'wagmi'

interface DataType {
  api?: Alchemy
}

const AlchemyContext = createContext<DataType>({})

export const AlchemyContextProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [ api, setApi ] = useState<Alchemy>()

  const chainId = useChainId()

  useEffect(() => {
    console.log({ alchemy_api_key: process.env.ALCHEMY_API_KEY })
    setApi(new Alchemy({
      apiKey: process.env.ALCHEMY_API_KEY,
      network: Network.ETH_MAINNET,
    }))
  }, [ chainId ])

  const data: DataType = {
    api,
  }

  return (
    <AlchemyContext.Provider value={data}>
      {children}
    </AlchemyContext.Provider>
  )
}

export const useAlchemyContext = () => {
  const context = useContext(AlchemyContext)
  if (context === undefined) {
    throw new Error(
      'useAlchemyContext must be used within a AlchemyContext',
    )
  }
  return context
}

export const useAlchemyPrice = (props: {
  token: string
}) => {
  const { api } = useAlchemyContext()

  const [ price, setPrice ] = useState(new BN(0))

  useEffect(() => {
    if (!api) return
    (async () => {
      const response = await api.prices.getTokenPriceByAddress([ {
        network: api?.config.network,
        address: props.token,
      } ])
      const price = response.data[0].prices.find(({ currency }) => currency === 'usd')
      if (price) setPrice(new BN(price.value))
    })()
  }, [ api, props.token ])

  return { data: price }
}
