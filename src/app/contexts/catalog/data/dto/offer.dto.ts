export interface OfferDto {
  id: string | number;
  title: string;
  discountPercent: number;
  isActive?: boolean;
}
