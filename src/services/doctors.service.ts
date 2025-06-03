import { Doctor } from '../models/doctor.model';
import {DB} from './../services/db.service';
import { LoggerService } from './logger.service';

export class DoctorsService {
  /**
   * This function returns all the doctors
   */
  static getAll(): Doctor[] {
    let data;

    const req = 'SELECT * FROM doctors';

    try {
      data = DB.prepare(req).all();
    } catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error');
    }
    const doctors: Doctor[] = [];

    for(const d of data) {
      doctors.push({
        id: d.doctor_id,
        firstName: d.first_name,
        lastName: d.last_name,
        speciality: d.speciality
      });
    }

    return doctors;
  }

  /**
   * This function returns a specific doctor
   */
  static getById(id: number): Doctor | undefined {
    let data;

    try{
      data = DB.prepare('SELECT * FROM doctors WHERE doctor_id = ?').get(id);
    } catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error');
    }

    if (!data) {
      return undefined;
    }

    return {
      id: data.doctor_id,
      firstName: data.first_name,
      lastName: data.last_name,
      speciality: data.speciality
    };
  }

  /**
   * Insert a doctor in the databse
   * @param doctor 
   * @returns 
   */
  static insert(doctor: Doctor): Doctor {
    let dbResp;
    const dbReq = 'INSERT INTO doctors (first_name, last_name, speciality) VALUES (?, ?, ?)';

    try{
      dbResp = DB.prepare(dbReq).run(doctor.firstName, doctor.lastName, doctor.speciality);
    } catch(error) {
      LoggerService.error(error);
      throw new Error('Internal Error');
    }

    //console.log(dbResp);//{ changes: 1, lastInsertRowid: 6 }

    const result: Doctor = doctor;
    result.id = dbResp.lastInsertRowid;
    return result;
  }

  /**
   * Update a doctor from the database
   * @param doctor 
   * @returns 
   */
  static update(doctor: Doctor): Doctor | undefined {
    let dbResp;
    const dbReq = 'UPDATE doctors SET first_name = ?, last_name = ?, speciality = ? WHERE doctor_id = ?';
    try{
      dbResp = DB.prepare(dbReq).run(
        doctor.firstName, doctor.lastName, doctor.speciality, doctor.id
      );
    } catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error');
    }

    if (dbResp.changes === 0) {
      return undefined;
    }

    return doctor;
  }

  static delete(id: number): boolean {
    let dbResp; 
    const dbReq = 'DELETE FROM doctors WHERE doctor_id = ?';
    try {
      dbResp = DB.prepare(dbReq).run(id);
    } catch (error) {
      LoggerService.error(error);
      throw new Error('Internal Error');
    }
    return dbResp.changes > 0;
  }
  
}
