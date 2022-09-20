import { GenderEnum } from '../enums';

export interface IUser {
  _id?: number;
  username: string;
  password: string;
  enabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IContactInfo {
  name: string;
  middleName: string;
  lastName: string;
  birthday: Date;
  gender: GenderEnum;
  address: IAddress[];
}

interface IAddress {
  street: string;
  street2: string;
  city: string;
}
