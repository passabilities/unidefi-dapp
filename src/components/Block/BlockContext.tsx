"use client"

import AaveSupply from '@/components/Dapps/AaveSupply'
import { DndContext, MouseSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useState,
  useCallback, ReactNode,
} from 'react'

interface DataType {
  blocks: ReactNode[]
  addBlock: (type: string) => void
  removeBlock: (index: number) => void
}

const BlockContext = createContext<DataType>({
  blocks: [],
  addBlock: () => {
  },
  removeBlock: () => {
  },
})

export const BlockContextProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [ blocks, setBlocks ] = useState<ReactNode[]>([])

  const removeBlock = useCallback((index: number) => {
    const result = Array.from(blocks)
    result.splice(index, 1)
    setBlocks(result)
  }, [ blocks ])

  const addBlock = useCallback((type: string) => {
    const index = blocks.length
    const newBlock = (() => {
      switch (type) {
        case 'aave':
          return <AaveSupply key={type} index={index} />
      }
    })()

    setBlocks([ ...blocks, newBlock ])
  }, [blocks])

  const data: DataType = {
    blocks,
    // setBlocks,

    addBlock,
    removeBlock,
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        distance: 10,
      },
    })
  )

  return (
    <BlockContext.Provider value={data}>
      <DndContext
        modifiers={[ restrictToParentElement ]}
        sensors={sensors}
        onDragStart={() => {
        }}
        onDragEnd={(evt) => {
        }}
      >
        {children}
      </DndContext>
    </BlockContext.Provider>
  )
}

export const useBlockContext = () => {
  const context = useContext(BlockContext)
  if (context === undefined) {
    throw new Error(
      'useBlockContext must be used within a BlockContext',
    )
  }
  return context
}