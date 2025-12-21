export interface Offer {
  id: string | number;
  title: string;
  discountPercent: number;
  isActive?: boolean;
}
