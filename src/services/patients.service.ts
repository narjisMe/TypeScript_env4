import { Patient } from '../models/patient.model';
import {DB} from './db.service';
import { LoggerService } from './logger.service';

export class PatientsService {
  
  /**
   * Get all patients
   */
  public static getAll(): Patient[] {
    let req = 'SELECT * FROM patients';
    let patients;
    try{
      patients = DB.prepare(req).all();
    } catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error');
    }
    const result: Patient[] = [];
    for(const data of patients) {
      const p: Patient = {
        id: data.patient_id,
        lastName: data.lastname,
        firstName: data.firstname,
        birthDate: new Date(data.birthdate),
        niss: data.niss,
        refDoctor: data.ref_doctor,
        address: {
          street: data.street_name,
          number: data.street_number,
          zipCode: data.zip_code,
          city: data.city,
          country: data.country
        }
      };
      result.push(p);
    }

    return result;
  }
  
  /**
   * Get a patient by its id or null if no patient found
   * @param id the patient id
   * @returns a valid Patient object or null
   */
  public static getById(id: number): Patient | undefined {
    const req = 'SELECT * FROM patients WHERE patient_id = ?';
    let data;
    try{
      data = DB.prepare(req).get(id);
    } catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error');
    }
    if (!data) {
      return undefined;
    }
    data = data[0];
    const p: Patient = {
      id: data.patient_id,
      lastName: data.lastname,
      firstName: data.firstname,
      birthDate: new Date(data.birthdate),
      niss: data.niss,
      refDoctor: data.ref_doctor,
      address: {
        street: data.street_name,
        number: data.street_number,
        zipCode: data.zip_code,
        city: data.city,
        country: data.country
      }
    };
    return p;
  }

  /**
   * Gets a patient by its niss
   * @param niss a valid niss
   * @returns a valid Patient object or null if no patient found
   */
  public static getByNiss(niss: string): Patient | undefined {
    const req = 'SELECT * FROM patients WHERE niss = ?';
    let data;
    try{
      data = DB.prepare(req).all(niss);
    }catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error');
    }
    if (data === null || data.length === 0) {
      return undefined;
    }
    data = data[0];
    const p: Patient = {
      id: data.patient_id,
      lastName: data.lastname,
      firstName: data.firstname,
      birthDate: new Date(data.birthdate),
      niss: data.niss,
      refDoctor: data.ref_doctor,
      address: {
        street: data.street_name,
        number: data.street_number,
        zipCode: data.zip_code,
        city: data.city,
        country: data.country
      }
    };
    return p;
  }

  /**
   * Inserts a new patient into the database
   * @param patient the patient to insert
   * @returns the created patient
   */
  public static insert(patient: Patient): Patient {
    const req = 'INSERT INTO patients (last_name, first_name, birthdate, niss, ref_doctor, street_name, street_number, zip_code, city, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    let data;
    try{
      data = DB.prepare(req).run(patient.lastName, patient.firstName, patient.birthDate, patient.niss, patient.refDoctor, patient.address.street, patient.address.number, patient.address.zipCode, patient.address.city, patient.address.country);
    } catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error');
    }
    patient.id = data.lastInsertRowid;
    return patient;
  }

  /**
   * Updates a patient in the database
   * @param patient the information to update
   * @returns the updated version of the patient or null if no patient has been found
   */
  public static update(patient: Patient): Patient | undefined {
    const req = 'UPDATE patients SET last_name = ?, first_name = ?, birthdate = ?, niss = ?, ref_doctor = ?, street_name = ?, street_number = ?, zip_code = ?, city = ?, country = ? WHERE patient_id = ?';
    let data;
    try {
      data = DB.prepare(req).run(patient.lastName, patient.firstName, patient.birthDate, patient.niss, patient.refDoctor, patient.address.street, patient.address.number, patient.address.zipCode, patient.address.city, patient.address.country, patient.id);
    } catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error');
    }
    if (data.changes === 0) {
      return undefined;
    }
    return patient;
  }

  /**
   * Deletes a patient from the database
   * @param id the id to delete
   * @returns true if the patient has been deleted, false otherwise
   */
  public static delete(id: number): boolean {
    const req = 'DELETE FROM patients WHERE patient_id = ?';
    let data;
    try {
      data = DB.prepare(req).run(id);
    } catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error');
    }
    return data.changes > 0;
  }
  
  /**
   * Get all patients with the given doctor id
   * @param id the doctor id
   * @returns a list of patients
   */
  public static getByDoctorId(id: number): Patient[] {
    const req = 'SELECT * FROM patients WHERE ref_doctor = ?';
    let data;
    try {
      data = DB.prepare(req).all(id);
    } catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error');
    }
    const result: Patient[] = [];
    for(const d of data) {
      const p: Patient = {
        id: d.patient_id,
        lastName: d.lastname,
        firstName: d.firstname,
        birthDate: new Date(d.birthdate),
        niss: d.niss,
        refDoctor: d.ref_doctor,
        address: {
          street: d.street_name,
          number: d.street_number,
          zipCode: d.zip_code,
          city: d.city,
          country: d.country
        }
      };
      result.push(p);
    }
    return result;
  }

  /**
   * Get all patients with the given zip code
   * @param zipCode the zip code
   * @returns a list of patients
   */
  public static getByZipCode(zipCode: string): Patient[] {
    const req = 'SELECT * FROM patients WHERE zip_code = ?';
    let data;
    try {
      data = DB.prepare(req).all(zipCode);
    } catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error');
    }
    const result: Patient[] = [];
    for(const d of data) {
      const p: Patient = {
        id: d.patient_id,
        lastName: d.lastname,
        firstName: d.firstname,
        birthDate: new Date(d.birthdate),
        niss: d.niss,
        refDoctor: d.ref_doctor,
        address: {
          street: d.street_name,
          number: d.street_number,
          zipCode: d.zip_code,
          city: d.city,
          country: d.country
        }
      };
      result.push(p);
    }
    return result;
  }

  /**
   * Get all patients with a given refering doctor and a given zip code
   * @param doctorId the doctor id
   * @param zipCode the zip code
   * @returns a list of patients
   */
  public static getByDoctorIdAndZipCode(doctorId: number, zipCode: string): Patient[] {
    const req = 'SELECT * FROM patients WHERE ref_doctor = ? AND zip_code = ?';
    let data;
    try {
      data = DB.prepare(req).all(doctorId, zipCode);
    } catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error');
    }
    const result: Patient[] = [];
    for(const d of data) {
      const p: Patient = {
        id: d.patient_id,
        lastName: d.lastname,
        firstName: d.firstname,
        birthDate: new Date(d.birthdate),
        niss: d.niss,
        refDoctor: d.ref_doctor,
        address: {
          street: d.street_name,
          number: d.street_number,
          zipCode: d.zip_code,
          city: d.city,
          country: d.country
        }
      };
      result.push(p);
    }
    return result;
  }
}
