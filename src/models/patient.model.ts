import { Address } from './address.model';
import {Person} from './person.model';

export interface Patient extends Person {
  birthDate: Date;
  niss: string;
  address: Address;
  refDoctor: number;
}

export interface PatientFilter {
  zipcode?: string;
  refDoctor?: number;
}
