import { clamp01, plantDimensions } from "./growth-profile.ts";
import type { Plant } from "./model.ts";
export interface VisualTransition { from: Plant; to: Plant; start: number; duration: number }
export function sampleTransition(transition: VisualTransition, now: number): Plant {
  const t = transition.duration ? clamp01((now - transition.start) / transition.duration) : 1;
  const eased = 1 - Math.pow(1 - t, 3);
  const growth = transition.from.growth + (transition.to.growth - transition.from.growth) * eased;
  return { ...transition.to, growth, health: transition.from.health + (transition.to.health - transition.from.health) * eased, ...plantDimensions(growth) };
}
export function retargetTransition(current: VisualTransition | undefined, to: Plant, now: number, immediate = false): VisualTransition {
  if (current && current.to.growth === to.growth && current.to.health === to.health && current.to.seed === to.seed) return { ...current, to };
  return { from: current && current.to.seed === to.seed ? sampleTransition(current, now) : to, to, start: now, duration: immediate ? 0 : 1800 };
}
