import { State } from '../interfaces'

let isPaintingState = false
let stateToPaint: State = {} as any

export const onStateChange = (state: State) => {
  stateToPaint = state
  if (isPaintingState) return
  isPaintingState = true
  window.requestAnimationFrame(() => {
    const toFourChars = (num: number) => {
      const rounded = Math.floor(num).toString()
      return rounded + ' '.repeat(4 - rounded.length)
    }
    const pointsNode = window.document.getElementById('points')!
    pointsNode.innerHTML = ''
    stateToPaint.points.forEach(point => {
      const li = document.createElement('li')
      const pre = document.createElement('pre')
      pre.innerText = point.map(toFourChars).join(', ')
      li.appendChild(pre)
      pointsNode.appendChild(li)
    })
    isPaintingState = false
  })
}
