import { getEthersProvider } from '@/lib/ethers'
import { config } from '@/lib/wagmiConfig'
import {
  UiPoolDataProvider,
  UiIncentiveDataProvider,
  ChainId,
} from '@aave/contract-helpers'
import { formatReserves, formatUserSummary, formatUserSummaryAndIncentives } from '@aave/math-utils'
import * as markets from '@bgd-labs/aave-address-book'
import { useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'

export const useAaveData = () => {
  const provider = useMemo(() => getEthersProvider(config)!, [])
  const { address: currentAccount } = useAccount()

  // View contract used to fetch all reserves data (including market base currency data), and user reserves
  // Using Aave V3 Eth Mainnet address for demo
  const poolDataProviderContract = useMemo(() =>
      new UiPoolDataProvider({
        uiPoolDataProviderAddress: markets.AaveV3Ethereum.UI_POOL_DATA_PROVIDER,
        provider,
        chainId: ChainId.mainnet,
      }),
    [ provider ],
  )

  // View contract used to fetch all reserve incentives (APRs), and user incentives
  // Using Aave V3 Eth Mainnet address for demo
  const incentiveDataProviderContract = useMemo(() =>
      new UiIncentiveDataProvider({
        uiIncentiveDataProviderAddress:
        markets.AaveV3Ethereum.UI_INCENTIVE_DATA_PROVIDER,
        provider,
        chainId: ChainId.mainnet,
      }),
    [ provider ],
  )

  const [ reserves, setReserves ] = useState<ReturnType<typeof formatReserves>>()
  const [ userSummary, setUserSummary ] = useState<ReturnType<typeof formatUserSummary>>()

  useEffect(() => {
    if (!currentAccount) return

    (async () => {
      // Object containing array of pool reserves and market base currency data
      // { reservesArray, baseCurrencyData }
      const reserves =
        await poolDataProviderContract.getReservesHumanized({
          lendingPoolAddressProvider: markets.AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
        })

      // Object containing array or users aave positions and active eMode category
      // { userReserves, userEmodeCategoryId }
      const userReserves =
        await poolDataProviderContract.getUserReservesHumanized({
          lendingPoolAddressProvider: markets.AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
          user: currentAccount,
        })

      // Array of incentive tokens with price feed and emission APR
      const reserveIncentives =
        await incentiveDataProviderContract.getReservesIncentivesDataHumanized({
          lendingPoolAddressProvider:
          markets.AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
        })

      // Dictionary of claimable user incentives
      const userIncentives =
        await incentiveDataProviderContract.getUserReservesIncentivesDataHumanized({
          lendingPoolAddressProvider:
          markets.AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
          user: currentAccount,
        })

      const formattedReserves =
        formatReserves({
          currentTimestamp: Date.now() / 1000,
          marketReferenceCurrencyDecimals: reserves?.baseCurrencyData.marketReferenceCurrencyDecimals,
          marketReferencePriceInUsd: reserves?.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
          reserves: reserves?.reservesData,
        })
      setReserves(formattedReserves)

      setUserSummary(
        formatUserSummaryAndIncentives({
          currentTimestamp: Date.now() / 1000,
          marketReferenceCurrencyDecimals: reserves?.baseCurrencyData.marketReferenceCurrencyDecimals,
          marketReferencePriceInUsd: reserves?.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
          userReserves: userReserves.userReserves,
          formattedReserves,
          userEmodeCategoryId: userReserves.userEmodeCategoryId,
          reserveIncentives,
          userIncentives
        }),
      )
    })()
  }, [ currentAccount, incentiveDataProviderContract, poolDataProviderContract ])

  return {
    reserves,
    userSummary,
  }
}