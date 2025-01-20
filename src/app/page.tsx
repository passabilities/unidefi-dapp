'use client'

import { useBlockContext } from '@/components/Block/BlockContext'

const Home = () => {
  const { blocks, addBlock } = useBlockContext()

  return (
    <div
      className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <input type="button" value="Add Aave Supply" onClick={() => addBlock('aave')} />
      <main className="flex gap-8 row-start-2 items-center sm:items-start w-3/4">
        {blocks}
      </main>
    </div>
  )
}

export default Home
