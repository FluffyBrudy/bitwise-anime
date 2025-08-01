export type TBitwiseOperators = "&" | "|" | "^" | "~" | "<<" | ">>" | ">>>"

export interface AnimationConfig {
  duration: number
  delay: number
  easing: string
}

export interface ParticleConfig {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  life: number
}
