export type ProductStatus = 'DRAFT' | 'READY' | 'PUBLISHED' | string;

export const ProductStatusUtils = {
  /** Regla de negocio frontend: solo mostramos dos buckets */
  isPublished(status: ProductStatus | null | undefined): boolean {
    return (status ?? '').toUpperCase() === 'PUBLISHED';
  },

  /** Bucket DRAFT: todo lo que no sea PUBLISHED */
  isDraftBucket(status: ProductStatus | null | undefined): boolean {
    return !this.isPublished(status);
  },

  /** Etiqueta a mostrar: reducimos READY -> DRAFT */
  display(status: ProductStatus | null | undefined): 'DRAFT' | 'PUBLISHED' {
    return this.isPublished(status) ? 'PUBLISHED' : 'DRAFT';
  }
};
