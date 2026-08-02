import { useCallback, useRef, useState, type SetStateAction } from "react"

export function useHistoryState<T>(initialValue: T, limit = 80) {
  const [state, setRawState] = useState(initialValue)
  const [revision, setRevision] = useState(0)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const past = useRef<T[]>([])
  const future = useRef<T[]>([])

  const setState = useCallback((action: SetStateAction<T>) => {
    setRawState(current => {
      const next = typeof action === "function"
        ? (action as (value: T) => T)(current)
        : action
      if (Object.is(current, next)) return current
      past.current = [...past.current.slice(-(limit - 1)), current]
      future.current = []
      setCanUndo(true)
      setCanRedo(false)
      setRevision(value => value + 1)
      return next
    })
  }, [limit])

  const undo = useCallback(() => {
    setRawState(current => {
      const previous = past.current.at(-1)
      if (previous === undefined) return current
      past.current = past.current.slice(0, -1)
      future.current = [current, ...future.current].slice(0, limit)
      setCanUndo(past.current.length > 0)
      setCanRedo(true)
      setRevision(value => value + 1)
      return previous
    })
  }, [limit])

  const redo = useCallback(() => {
    setRawState(current => {
      const next = future.current[0]
      if (next === undefined) return current
      future.current = future.current.slice(1)
      past.current = [...past.current, current].slice(-limit)
      setCanUndo(true)
      setCanRedo(future.current.length > 0)
      setRevision(value => value + 1)
      return next
    })
  }, [limit])

  const reset = useCallback((next: T) => {
    past.current = []
    future.current = []
    setCanUndo(false)
    setCanRedo(false)
    setRawState(next)
    setRevision(value => value + 1)
  }, [])

  return {
    state,
    setState,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    revision
  }
}
