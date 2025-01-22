import { useState } from 'react'

type Props<T, K> = {
  items: T[]
  itemsValueKey: K
  selected?: T
  onChange?: (item: T) => void
  opaqueOnDisabled?: boolean
}

export function Dropdown<T extends { [P in K]: T[P] }, K extends keyof T>(props: Props<T, K>) {
  const { items, itemsValueKey, selected, onChange, opaqueOnDisabled = true } = props

  const [ activated, setActivated ] = useState(false)

  return (
    <>
      <button
        data-popover-target="menu"
        className={`${opaqueOnDisabled && 'disabled:opacity-50'} rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:shadow-none`}
        type="button"
        disabled={items.length <= 1}
        onClick={() => setActivated((prev) => !prev)}
      >
        {selected?.[itemsValueKey] ?? 'Select...'}
      </button>
      {activated && (
        <ul
          role="menu"
          data-popover="menu"
          data-popover-placement="bottom"
          className="absolute z-10 min-w-[180px] overflow-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg shadow-sm focus:outline-none"
        >
          {items.map((item, i) => (
            <li
              key={i}
              role="menuitem"
              className="cursor-pointer text-slate-800 flex w-full text-sm items-center rounded-md p-3 transition-all hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-100"
              onClick={() => {
                if (item === selected) return

                onChange?.(item)
                setActivated(false)
              }}
            >
              {item[itemsValueKey]}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
