'use client'

import AaveBorrow from '@/components/Dapps/AaveBorrow'
import AaveSupply from '@/components/Dapps/AaveSupply'
import { DndContext, MouseSensor, UniqueIdentifier, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useState,
  useCallback, ReactElement,
} from 'react'

interface DataType {
  blocks: { id: UniqueIdentifier, ele: ReactElement }[]
  addBlock: (type: string) => void
  removeBlock: (id: UniqueIdentifier) => void
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
  const [ blocks, setBlocks ] = useState<{ id: UniqueIdentifier, ele: ReactElement }[]>([])

  const removeBlock = useCallback((id: UniqueIdentifier) => {
    const result = Array.from(blocks)
    const index = result.findIndex((item) => item.id === id)
    if (index > -1) {
      result.splice(index, 1)
      setBlocks(result)
    }
  }, [ blocks ])

  const addBlock = useCallback((type: string) => {
    const newBlock = (() => {
      switch (type) {
        case 'aave-supply':
          return <AaveSupply id={type}/>
        case 'aave-borrow':
          return <AaveBorrow id={type}/>
      }
    })()

    if (newBlock) setBlocks([ ...blocks, { id: type, ele: newBlock } ])
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