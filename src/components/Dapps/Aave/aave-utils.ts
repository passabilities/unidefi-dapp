import { getEthersProvider } from '@/lib/ethers'
import { config } from '@/lib/wagmiConfig'
import {
  LPBorrowParamsType,
  LPSupplyParamsType,
} from '@aave/contract-helpers/dist/esm/v3-pool-contract/lendingPoolTypes'
import {
  UiPoolDataProvider,
  UiIncentiveDataProvider,
  ChainId, Pool,
} from '@aave/contract-helpers'
import { formatReserves, formatUserSummary, formatUserSummaryAndIncentives } from '@aave/math-utils'
import * as markets from '@bgd-labs/aave-address-book'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSendTransaction } from 'wagmi'

const provider = getEthersProvider(config)!

interface AaveDataArgs {
  address?: string
}

export const useAaveData = ({ address }: AaveDataArgs) => {
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

  const fetchAndProcess = useCallback((address: string) => {
    void new Promise(async () => {
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
          user: address,
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
          user: address,
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
          userIncentives,
        }),
      )
    })
  }, [ incentiveDataProviderContract, poolDataProviderContract ])

  useEffect(() => {
    if (!address) return
    fetchAndProcess(address)
  }, [ address, fetchAndProcess ])

  const dataResponse = useMemo(
    () => {
      if (!reserves || !userSummary) return

      return {
        reserves,
        userSummary,
      }
    },
    [ reserves, userSummary ],
  )

  return {
    data: dataResponse,
    update: () => {
      if (address) fetchAndProcess(address)
    },
  }
}

interface AaveSupplyArgs extends LPSupplyParamsType {

}

export const useAaveSupply = (args: AaveSupplyArgs) => {
  const sendTx = useSendTransaction()

  const execute = useCallback(async () => {
    const pool = new Pool(provider, {
      POOL: markets.AaveV3Ethereum.POOL,
      WETH_GATEWAY: markets.AaveV3Ethereum.WETH_GATEWAY,
    })

    const txs = await pool.supply({
      user: args.user,
      reserve: args.reserve,
      amount: args.amount,
      onBehalfOf: args.onBehalfOf,

      encodedTxData: args.encodedTxData,
      referralCode: args.referralCode,
      useOptimizedPath: args.useOptimizedPath,
    })
    console.log({txs})

    const txChain = txs.reduce(
      (chain, { txType, tx: getRawTx }) => chain.then(async () => {
        const rawTx = await getRawTx()

        const gas = rawTx.gasLimit ? BigInt(rawTx.gasLimit.toString()) : undefined
        const gasPrice = rawTx.gasPrice ? BigInt(rawTx.gasPrice.toString()) : undefined
        const value = rawTx.value ? BigInt(rawTx.value) : undefined

        const processedRawTx = {
          to: rawTx.to as `0x${string}`,
          nonce: rawTx.nonce,
          gas,
          gasPrice,
          data: rawTx.data as `0x${string}`,
          value,
        }

        await sendTx.sendTransactionAsync(processedRawTx)
      }),
      Promise.resolve(),
    )

    try {
      await txChain
    } catch (err) {
      console.error(err)
    }
  }, [
    args.amount,
    args.encodedTxData,
    args.onBehalfOf,
    args.referralCode,
    args.reserve,
    args.useOptimizedPath,
    args.user,
    sendTx,
  ])

  return {
    execute,
  }
}

interface AaveBorrowArgs extends LPBorrowParamsType {

}

export const useAaveBorrow = (args: AaveBorrowArgs) => {
  const sendTx = useSendTransaction()

  const execute = useCallback(async () => {
    const pool = new Pool(provider, {
      POOL: markets.AaveV3Ethereum.POOL,
      WETH_GATEWAY: markets.AaveV3Ethereum.WETH_GATEWAY,
    })

    const txs = await pool.borrow({
      user: args.user,
      reserve: args.reserve,
      amount: args.amount,
      interestRateMode: args.interestRateMode,

      onBehalfOf: args.onBehalfOf,
      debtTokenAddress: args.debtTokenAddress,
      encodedTxData: args.encodedTxData,
      referralCode: args.referralCode,
      useOptimizedPath: args.useOptimizedPath,
    })

    const txChain = txs.reduce(
      (chain, { txType, tx: getRawTx }) => chain.then(async () => {
        const rawTx = await getRawTx()

        const gas = rawTx.gasLimit ? BigInt(rawTx.gasLimit.toString()) : undefined
        const gasPrice = rawTx.gasPrice ? BigInt(rawTx.gasPrice.toString()) : undefined
        const value = rawTx.value ? BigInt(rawTx.value) : undefined

        const processedRawTx = {
          to: rawTx.to as `0x${string}`,
          nonce: rawTx.nonce,
          gas,
          gasPrice,
          data: rawTx.data as `0x${string}`,
          value,
        }

        await sendTx.sendTransactionAsync(processedRawTx)
      }),
      Promise.resolve(),
    )

    try {
      await txChain
    } catch (err) {
      console.error(err)
    }
  }, [
    args.amount,
    args.debtTokenAddress,
    args.encodedTxData,
    args.interestRateMode,
    args.onBehalfOf,
    args.referralCode,
    args.reserve,
    args.useOptimizedPath,
    args.user,
    sendTx,
  ])

  return {
    execute,
  }
}
