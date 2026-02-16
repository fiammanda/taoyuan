import * as Data from './data'
import * as WildTrees from './data/wildTrees'

const modules = [Data, WildTrees]
const data: Record<string, any> = {}

for (const mod of modules) {
  const m = mod as Record<string, any>
  for (const key in m) {
    if (/^[A-Z_]+$/.test(key)) {
      data[key] = m[key]
    }
  }
}

;(window as any).DATA = data