import { AdminProduct } from '../model/product-admin';

export const ProductPolicies = {
  isDraft(p: AdminProduct): boolean {
    return (p.status ?? '').toUpperCase() === 'DRAFT';
  },

  isPublished(p: AdminProduct): boolean {
    return (p.status ?? '').toUpperCase() === 'PUBLISHED';
  },

  canPublish(p: AdminProduct): boolean {
    return (p.variants?.length ?? 0) >= 1;
  },

  /**
   * Regla de excepción:
   * - Si está PUBLISHED y se queda sin variantes, debe volver a DRAFT.
   * El front puede "enforzar" esto llamando a unpatch /unpublish.
   */
  mustAutoUnpublishBecauseNoVariants(p: AdminProduct): boolean {
    return this.isPublished(p) && (p.variants?.length ?? 0) === 0;
  },
};
