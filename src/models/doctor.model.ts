import { Person } from "./person.model";

export interface Doctor extends Person {
  speciality: string;
}

export interface DoctorFilter {
  speciality?: string;
}
