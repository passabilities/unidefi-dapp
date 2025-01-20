import { useBlockContext } from '@/components/Block/BlockContext'
import { UniqueIdentifier } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FC, PropsWithChildren, useCallback } from 'react'

import './style.css'

interface Props extends PropsWithChildren {
  id: UniqueIdentifier
  header: string
}

export const Block: FC<Props> = ({ id, header, children }) => {
  const { removeBlock } = useBlockContext()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const onClose = useCallback(() => {
    console.log('on close')
    removeBlock(id)
  }, [ id, removeBlock ])

  return (
    <div ref={setNodeRef} className={'flex flex-col w-1/2'} style={style}>
      <div className={'flex justify-between py-2'} {...listeners} {...attributes}>
        <span className={'block-header'}>{header}</span>
        <button onClick={() => onClose()}>X</button>
      </div>
      <div className={'block'} style={{ background: '#ececec' }}>
        {children}
      </div>
    </div>
  )
}
