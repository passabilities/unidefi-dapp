import { Block } from '@/components/Block/Block'
import { FC } from 'react'

interface Props {
  index: number
}

const AaveSupply: FC<Props> = (props) => {
  return (
    <Block {...props} id="aave-supply" header="Supply">
      <div className="block-section">
        <div className="flex justify-between">
          <div className="block-section-header">Wallet balance</div>
          <div className="text-sm">0x6c..ea00</div>
        </div>
        <div className="block-section-content">
          <span className="text-xl">$24.88 ~ 0.0067154039685072</span>
        </div>
      </div>

      <div className="block-section">
        <div className="block-section-header">Amount</div>

        <div className="block-section-content">
          <input className="" placeholder="0.00"/>
        </div>
      </div>

      <div className="block-section">
        <div className="block-section-header">Transaction overview</div>

        <div className="block-section-content flex flex-col">
          <div className="flex justify-between">
            <div>Supply APY</div>
            <div className="font-bold">1.88%</div>
          </div>
          <div className="flex justify-between">
            <div>Collateralization</div>
            <div>Enabled</div>
          </div>
        </div>
      </div>

      <div className="block-section">
        <input type="button" value="Supply"/>
      </div>
    </Block>
  )
}

export default AaveSupply
