import { Block } from '@/components/Block/Block'
import { useAaveData } from '@/components/Dapps/Aave/aave-utils'
import { DappId } from '@/components/Dapps/constants'
import Dropdown from '@/components/Dropdown'
import * as markets from '@bgd-labs/aave-address-book'
import BN from 'bignumber.js'
import { FC, useMemo, useState } from 'react'
import { getAddress } from 'viem'
import { useAccount, useBalance } from 'wagmi'

interface Token {
  symbol: string
  address: string
}

const tokens: Token[] = [
  {
    symbol: 'USDT',
    address: markets.AaveV3Ethereum.ASSETS.USDT.UNDERLYING,
  },
  {
    symbol: 'USDC',
    address: markets.AaveV3Ethereum.ASSETS.USDC.UNDERLYING,
  },
]

const AaveBorrow: FC = () => {
  const { address } = useAccount()

  const [ selectedToken, setSelectedToken ] = useState<Token>()

  const usdtBalance = useBalance({
    address,
    token: markets.AaveV3Ethereum.ASSETS.USDT.UNDERLYING,
  })
  const usdcBalance = useBalance({
    address,
    token: markets.AaveV3Ethereum.ASSETS.USDC.UNDERLYING,
  })

  const aaveData = useAaveData()
  // const reserveSummary = useMemo(() => aaveData.reserves?.find(r => getAddress(r.underlyingAsset) === getAddress(markets.AaveV3Ethereum.ASSETS.wstETH.UNDERLYING)), [ aaveData.reserves ])
  const userReserveSummary = useMemo(
    () => {
      if (!aaveData.userSummary || !selectedToken) return
      return aaveData.userSummary.userReservesData.find(r => getAddress(r.underlyingAsset) === getAddress(selectedToken.address))
    },
    [aaveData.userSummary, selectedToken]
  )

  console.log(userReserveSummary)

  return (
    <Block id={DappId.AAVE_BORROW} header="Borrow">
      <div className="dapp-block-section">
        <div className="dapp-block-section-content">
          <Dropdown
            items={tokens}
            itemsValueKey="symbol"
            opaqueOnDisabled={false}
            onChange={setSelectedToken}
          />
        </div>
      </div>

      <div className="dapp-block-section overflow-hidden">
        <div className="dapp-block-section-header">Available to Borrow</div>
        <div className="dapp-block-section-content overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="text-xl text-ellipsis">
            ${new BN(aaveData.userSummary?.availableBorrowsUSD ?? '0').toFormat(2)} ~ {new BN(userReserveSummary?.reserve?.priceInUSD ?? '0').multipliedBy(aaveData.userSummary?.availableBorrowsUSD ?? '0').toFormat(2)}
          </span>
        </div>
      </div>

      <div className="dapp-block-section">
        <div className="dapp-block-section-header">Amount</div>

        <div className="dapp-block-section-content">
          <input className="" placeholder="0.00"/>
        </div>
      </div>

      <div className="dapp-block-section">
        <div className="dapp-block-section-header">Transaction overview</div>

        <div className="dapp-block-section-content flex flex-col">
          <div className="flex justify-between">
            <div>Borrow APY</div>
            <div className="font-bold">
              {userReserveSummary ? new BN(userReserveSummary?.reserve?.variableBorrowAPY ?? '0').multipliedBy('100').toFormat(2) : '...'}%
            </div>
          </div>
        </div>
      </div>

      <div className="block-section">
        <input type="button" value="Borrow"/>
      </div>
    </Block>
  )
}

export default AaveBorrow
