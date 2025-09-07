export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  uniqueProductCode: string;
  isActive: boolean;
  categoryId: string;
}

export interface ProductCardItem {
  uniqueProductCode: string;
  name: string;
  price: string;
}