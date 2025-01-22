import { Block } from '@/components/Block/Block'
import { useAaveBorrow } from '@/components/Dapps/Aave/aave-utils'
import { useAaveContext } from '@/components/Dapps/Aave/AaveContext'
import { DappId } from '@/components/Dapps/constants'
import Dropdown from '@/components/Dropdown'
import { InterestRate } from '@aave/contract-helpers'
import * as markets from '@bgd-labs/aave-address-book'
import BN from 'bignumber.js'
import { FC, useMemo, useState } from 'react'
import { getAddress } from 'viem'
import { useAccount } from 'wagmi'

interface Token {
  symbol: string
  address: `0x${string}`
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

  const [ selectedToken, setSelectedToken ] = useState<Token>(tokens[0])

  const { data: aaveData } = useAaveContext()
  const userReserveSummary = useMemo(
    () => {
      if (!aaveData?.userSummary || !selectedToken) return
      return aaveData?.userSummary.userReservesData.find(r => getAddress(r.underlyingAsset) === getAddress(selectedToken.address))
    },
    [ aaveData?.userSummary, selectedToken ],
  )

  const maxBorrowAmount = useMemo(() => {
    if (!userReserveSummary || !aaveData) return '0'

    return new BN(userReserveSummary.reserve.priceInUSD).multipliedBy(aaveData.userSummary.availableBorrowsUSD).toString()
  }, [ aaveData, userReserveSummary ])

  const [ amount, setAmount ] = useState('')

  const borrow = useAaveBorrow({
    user: address!,
    reserve: selectedToken.address,
    amount,
    interestRateMode: InterestRate.Variable,
  })

  return (
    <Block id={DappId.AAVE_BORROW} header="Borrow">
      <div className="dapp-block-section">
        <div className="dapp-block-section-content">
          <Dropdown
            items={tokens}
            itemsValueKey="symbol"
            selected={selectedToken}
            onChange={(newToken) => {
              setSelectedToken(newToken)
              setAmount('')
            }}
            opaqueOnDisabled={false}
          />
        </div>
      </div>

      <div className="dapp-block-section overflow-hidden">
        <div className="dapp-block-section-header">Available to Borrow</div>
        <div className="dapp-block-section-content overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="text-xl text-ellipsis">
            ${new BN(aaveData?.userSummary?.availableBorrowsUSD ?? '0').toFormat(2)} ~ {maxBorrowAmount}
          </span>
        </div>
      </div>

      <div className="dapp-block-section">
        <div className="dapp-block-section-content grid grid-cols-4 gap-2">
          <input className="col-start-1 col-end-4" placeholder="0.00" value={amount} onChange={(evt) => {
            setAmount(evt.target.value)
          }}/>
          <input className="col-start-4 col-end-4" type="button" value="Max" onClick={() => {
            setAmount(maxBorrowAmount)
          }}/>
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
        <input type="button" value="Borrow" onClick={() => borrow.execute()}/>
      </div>
    </Block>
  )
}

export default AaveBorrow
