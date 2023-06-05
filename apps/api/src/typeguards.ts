import { CounterMeta } from "./types";

export function isCounterMeta(obj: any): obj is CounterMeta {
  return (
    typeof obj === 'object' &&
    typeof obj.v === 'number' &&
    typeof obj.id === 'string'
  )
}
