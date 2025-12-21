export const IMAGE_TYPES = [
  { value: 'PRIMARY', label: 'PRIMARY (Catálogo)' },
  { value: 'MODEL', label: 'MODEL (Detalle)' },
  { value: 'GALLERY', label: 'GALLERY' },
] as const;

export type ImageType = typeof IMAGE_TYPES[number]['value'];
