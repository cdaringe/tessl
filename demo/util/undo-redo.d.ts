export declare type Style = 'mac' | 'windows'
export declare function check (
  ev: KeyboardEvent,
  style: Style,
  shift: boolean
): boolean
export declare const isUndo: (ev: KeyboardEvent, style: Style) => boolean
export declare const isRedo: (ev: KeyboardEvent, style: Style) => boolean
