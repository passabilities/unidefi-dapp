import { useAaveContext } from '@/components/Dapps/Aave/AaveContext'
import Dropdown from '@/components/Dropdown'
import * as markets from '@bgd-labs/aave-address-book'
import { Block } from '@/components/Block/Block'
import { DappId } from '@/components/Dapps/constants'
import BN from 'bignumber.js'
import { FC, useMemo } from 'react'
import { getAddress } from 'viem'
import { useAccount, useBalance } from 'wagmi'

import './styles.css'

interface Token {
  symbol: string
  address: string
}

const tokens: Token[] = [
  {
    address: markets.AaveV3Ethereum.ASSETS.wstETH.UNDERLYING,
    symbol: 'wstETH',
  },
]

const AaveSupply: FC = () => {
  const { address } = useAccount()

  const { data: aaveData } = useAaveContext()
  const userReserveSummary = useMemo(() => aaveData?.userSummary?.userReservesData?.find(r => getAddress(r.underlyingAsset) === getAddress(markets.AaveV3Ethereum.ASSETS.wstETH.UNDERLYING)), [ aaveData?.userSummary?.userReservesData ])

  const stETHBalance = useBalance({
    address,
    token: markets.AaveV3Ethereum.ASSETS.wstETH.UNDERLYING,
  })

  return (
    <Block id={DappId.AAVE_SUPPLY} header="Supply">
      <div className="dapp-block-section">
        <div className="dapp-block-section-content">
          <Dropdown
            items={tokens}
            itemsValueKey={'symbol'}
            selected={tokens[0]}
            opaqueOnDisabled={false}
          />
        </div>
      </div>

      <div className="dapp-block-section overflow-hidden">
        <div className="dapp-block-section-header">Wallet balance</div>
        <div className="dapp-block-section-content overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="text-xl text-ellipsis">
            ${new BN(userReserveSummary?.reserve?.priceInUSD ?? '0').multipliedBy(stETHBalance.data?.formatted ?? 0).toFormat(2)} ~ {stETHBalance.data?.formatted}
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
            <div>Supply APY</div>
            <div className="font-bold">
              {userReserveSummary ? new BN(userReserveSummary?.reserve?.supplyAPY ?? '0').multipliedBy('100').toFormat(2) : '...'}%
            </div>
          </div>
          <div className="flex justify-between">
            <div>Collateralization</div>
            {
              userReserveSummary
                ? (userReserveSummary.usageAsCollateralEnabledOnUser
                  ? <div className="font-bold collateral-usage enabled">Enabled</div>
                  : <div className="font-bold collateral-usage disabled">Disabled</div>)
                : '...'
            }

          </div>
        </div>
      </div>

      <div className="dapp-block-section">
        <input type="button" value="Supply"/>
      </div>
    </Block>
  )
}

export default AaveSupply
