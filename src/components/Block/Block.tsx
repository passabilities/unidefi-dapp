import { useBlockContext } from '@/components/Block/BlockContext'
import { UniqueIdentifier, useDraggable, useDroppable } from '@dnd-kit/core'
import { CSSProperties, FC, PropsWithChildren, useCallback } from 'react'

import './style.css'

interface Props extends PropsWithChildren {
  id: UniqueIdentifier
  index: number
  header: string
}

export const Block: FC<Props> = ({ id, index, header, children }) => {
  const { removeBlock } = useBlockContext()

  const { attributes, listeners, setNodeRef: setDraggableNodeRef, transform } = useDraggable({
    id,
    data: {
      index,
    },
  })

  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id,
    data: {
      index,
    },
  })

  const style: CSSProperties = {
    transform: undefined,
  }
  if (transform) {
    style.transform = `translate3d(${transform.x}px, ${transform.y}px, 0)`
  }

  const onClose = useCallback(() => {
    console.log('on close')
    removeBlock(index)
  }, [ index, removeBlock ])

  return (
    <div ref={setDraggableNodeRef} className={'flex flex-col w-1/2'} style={style}>
      <div ref={setDroppableNodeRef}>
        <div className={'flex justify-between py-2'} {...listeners} {...attributes}>
          <span className={'block-header'}>{header}</span>
          <button onClick={() => onClose()}>X</button>
        </div>
        <div className={'block'} style={{ background: '#ececec' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
