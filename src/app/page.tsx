'use client'

import { useBlockContext } from '@/components/Block/BlockContext'
import { DappId } from '@/components/Dapps/constants'

const Home = () => {
  const { blocks, addBlock } = useBlockContext()

  return (
    <div
      className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div>
        <input type="button" value="Add Aave Supply" onClick={() => addBlock(DappId.AAVE_SUPPLY)}/>
        <input type="button" value="Add Aave Borrow" onClick={() => addBlock(DappId.AAVE_BORROW)}/>
      </div>
      <main className="flex gap-8 row-start-2 items-center sm:items-start w-3/4">
        {blocks.map(({ id, ele }) => ({ ...ele, key: id.toString() }))}
      </main>
    </div>
  )
}

export default Home
