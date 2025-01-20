'use client'

import { useBlockContext } from '@/components/Block/BlockContext'
import AddDappButton from '@/components/Dapps/AddDappButton'
import { DappId } from '@/components/Dapps/constants'

const Home = () => {
  const { blocks } = useBlockContext()

  return (
    <div
      className="flex flex-col items-center justify-items-center min-h-screen p-8 gap-8 font-[family-name:var(--font-geist-sans)]">
      <div className="flex w-full">
        <AddDappButton id={DappId.AAVE_SUPPLY} />
        <AddDappButton id={DappId.AAVE_BORROW} />
      </div>
      <main className="flex flex-grow gap-8 row-start-2 items-center w-3/4">
        {blocks.map(({ id, ele }) => ({ ...ele, key: id.toString() }))}
      </main>
    </div>
  )
}

export default Home
