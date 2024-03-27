export const DAMAGE_TYPES = [
  'bludgeoning',
  'piercing',
  'slashing',
  'fire',
  'cold',
  'acid',
  'thunder',
  'lightning',
  'poison',
  'radiant',
  'necrotic',
  'psychic',
  'force',
] as const;

export type DamageType = (typeof DAMAGE_TYPES)[number];
export const DEFENSE_TYPES = ['immunity', 'resistance'] as const;
export type DefenseType = (typeof DEFENSE_TYPES)[number];
