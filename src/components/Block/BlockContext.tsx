'use client'

import AaveBorrow from '@/components/Dapps/AaveBorrow'
import AaveSupply from '@/components/Dapps/AaveSupply'
import { DappId } from '@/components/Dapps/constants'
import { DndContext, MouseSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { arrayMove, rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { createContext, FC, PropsWithChildren, ReactElement, useCallback, useContext, useState } from 'react'

interface DataType {
  blocks: { id: DappId, ele: ReactElement }[]
  addBlock: (id: DappId) => void
  removeBlock: (id: DappId) => void
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
  const [ blocks, setBlocks ] = useState<{ id: DappId, ele: ReactElement }[]>([])

  const removeBlock = useCallback((id: DappId) => {
    const result = Array.from(blocks)
    const index = result.findIndex((item) => item.id === id)
    if (index > -1) {
      result.splice(index, 1)
      setBlocks(result)
    }
  }, [ blocks ])

  const addBlock = useCallback((id: DappId) => {
    const newBlock = (() => {
      switch (id) {
        case DappId.AAVE_SUPPLY:
          return <AaveSupply />
        case DappId.AAVE_BORROW:
          return <AaveBorrow />
      }
    })()

    if (newBlock) setBlocks([ ...blocks, { id, ele: newBlock } ])
  }, [ blocks ])

  const data: DataType = {
    blocks,
    addBlock,
    removeBlock,
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        distance: 10,
      },
    }),
  )

  return (
    <BlockContext.Provider value={data}>
      <DndContext
        modifiers={[ restrictToParentElement ]}
        sensors={sensors}
        onDragStart={() => {
        }}
        onDragEnd={(evt) => {
          const { active, over } = evt

          if (active.id !== over?.id) {
            setBlocks((items) => {
              const oldIndex = items.findIndex((item) => item.id === active.id)
              const newIndex = items.findIndex((item) => item.id === (over?.id ?? ''))

              return arrayMove(items, oldIndex, newIndex)
            })
          }
        }}
      >
        <SortableContext
          items={blocks}
          strategy={rectSortingStrategy}
        >
          {children}
        </SortableContext>
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