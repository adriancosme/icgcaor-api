export interface IProduct {
  _id: string;
  name: string;
  internalCode: string;
  promotion: IPromotion | null;
  priceInList: string;
  clientPrice: string;
  suggestPrice: string;  
  createdAt: Date;
  updatedAt: Date;
}

export interface IPromotion {
  description: string;
  expiration: string;
}
