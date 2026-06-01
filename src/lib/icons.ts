import z from 'zod'

export const AVAILABLE_ICONS = [
  'shopping-cart',
  'briefcase',
  'utensils',
  'car',
  'home',
  'graduation-cap',
  'heart',
  'wifi',
  'zap',
  'droplet',
  'smartphone',
  'tv',
  'film',
  'music',
  'book',
  'gift',
  'plane',
  'train',
  'bus',
  'coffee',
  'circle',
  'laptop',
  'trending-up',
  'smile',
  'wallet',
  'piggy-bank'
] as const

export const categoryIconSchema = z.enum(AVAILABLE_ICONS)

export type CategoryIcon = z.infer<typeof categoryIconSchema>
