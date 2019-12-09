import { fromPoints } from '@dino-dna/d3-svg-path-editor'

export const getPathEditor: () => ReturnType<typeof fromPoints> = () =>
  (window as any)._pathEditor

export const toggleLineMode = (isCurvy?: boolean) =>
  ((window as any).__LINE_MODE_CURVY__ =
    typeof isCurvy === 'boolean'
      ? isCurvy
      : !(window as any).__LINE_MODE_CURVY__)
