import { GraduationCap, Rocket, Trophy, ChefHat, Guitar, Search, WandSparkles, Sprout, Flame, Mic, BookOpen, Star, BadgeCheck, Cake, Wrench } from 'lucide-react'

// Íconos en lugar de emojis para accesorios de Limmy e insignias
export const ICONS = {
  teacher: GraduationCap, astro: Rocket, futbol: Trophy, chef: ChefHat, rock: Guitar, detective: Search, mago: WandSparkles,
  primera: Sprout, racha7: Flame, pronun: Mic, lector: BookOpen, estrella: Star, perfecto: BadgeCheck,
  cake: Cake, wrench: Wrench,
}

export function InsIcon({ k, size = 22, className = '' }) {
  const I = ICONS[k] || BadgeCheck
  return <I size={size} className={className} />
}
