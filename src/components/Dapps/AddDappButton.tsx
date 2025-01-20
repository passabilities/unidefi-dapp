import { useBlockContext } from '@/components/Block/BlockContext'
import { DappId, DappName } from '@/components/Dapps/constants'
import { FC, useMemo } from 'react'

interface Props {
  id: DappId
}

const AddDappButton: FC<Props> = ({ id }) => {
  const { blocks, addBlock } = useBlockContext()

  const disabled = useMemo(
    () => blocks.some((block) => block.id === id),
    [ blocks, id ]
  )

  return (
    <input className="mx-1" type="button" value={`Add ${DappName[id]}`} disabled={disabled} onClick={() => addBlock(id)}/>
  )
}

export default AddDappButton
