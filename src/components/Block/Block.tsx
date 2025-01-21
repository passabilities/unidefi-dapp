import { useBlockContext } from '@/components/Block/BlockContext'
import { DappId } from '@/components/Dapps/constants'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FC, PropsWithChildren, useCallback } from 'react'

import './style.css'

interface Props extends PropsWithChildren {
  id: DappId
  header: string
  height?: number
}

export const Block: FC<Props> = ({ id, header, height, children }) => {
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
    removeBlock(id)
  }, [ id, removeBlock ])

  return (
    <div ref={setNodeRef} className={'flex flex-col w-1/2'} style={style}>
      <div className={'flex justify-between py-2'} {...listeners} {...attributes}>
        <span className={'dapp-block-header'}>{header}</span>
        <button onClick={() => onClose()}>X</button>
      </div>
      <div className={'dapp-block'} style={{ background: '#ececec', height }}>
        {children}
      </div>
    </div>
  )
}
