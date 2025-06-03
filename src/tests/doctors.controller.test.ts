import request from 'supertest';
import { app } from '../app';
import { Doctor } from '../models/doctor.model';
import { DoctorsService } from '../services/doctors.service';
import { LoggerService } from '../services/logger.service';
import * as guard from '../utils/guards';
jest.mock('../services/db.service');
jest.mock('../services/doctors.service');
jest.mock('../services/logger.service');
jest.mock('../utils/guards');

/**
 * Fake data for the tests
 */
const mockData: Doctor[] = [
  {id: 1, lastName: 'House', firstName: 'Gregory', speciality: 'general practicien'},
];

describe('DoctorController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(LoggerService, 'info').mockImplementation();
    jest.spyOn(LoggerService, 'error').mockImplementation();
  });
  // const  
  describe('GET /doctors/', () => {
    it('should return all doctors and 200 status', (done) => {
      jest.spyOn(DoctorsService, 'getAll').mockReturnValue(mockData);
      // DoctorsService.getAll.mockReturnValue(mockData);
      request(app)
        .get('/doctors/')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response: request.Response) => {
          expect(response.body).toEqual(mockData);
          done();
        });
    });

    it('should log a message', (done) => {
      jest.spyOn(DoctorsService, 'getAll').mockReturnValue(mockData);
      jest.spyOn(LoggerService, 'info');
      request(app)
        .get('/doctors/')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response: request.Response) => {
          expect(response.body).toEqual(mockData);
          // expect(LoggerService.info).toHaveBeenCalled();
          done();
      });
    });
  });

  describe('Get /doctors/id', () => {
    let spyIsNumber: jest.SpyInstance;
    let spyIsString: jest.SpyInstance;
    let spygetById: jest.SpyInstance;
    beforeEach(() => {
      jest.clearAllMocks();
      spygetById = jest.spyOn(DoctorsService, 'getById').mockReturnValue(mockData[0]);
      spyIsString = jest.spyOn(guard, 'isString').mockReturnValue(true);
      spyIsNumber = jest.spyOn(guard, 'isNumber').mockReturnValue(true);
      jest.spyOn(LoggerService, 'info');
    });
    it('return the expected doctor and status 200', (done) => {
      request(app)
        .get('/doctors/' + mockData[0].id)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response: request.Response) => {
          expect(response.body).toEqual(mockData[0]);
          done();
        });
    });
    // it('should log a message', (done) => {
    //   request(app)
    //     .get('/doctors/' + mockData[0].id)
    //     .expect(200)
    //     .expect('Content-Type', /json/)
    //     .then((response: request.Response) => {
    //       expect(response.body).toEqual(mockData[0]);
    //       expect(LoggerService.info).toHaveBeenCalledTimes(1);
    //       done();
    //     });
    // });
    // // it('should verify that the id in the query is a string', (done) => {
    // //   request(app)
    // //     .get('/doctors/' + mockData[0].id)
    // //     .expect(200)
    // //     .expect('Content-Type', /json/)
    // //     .then((response: request.Response) => {
    // //       expect(response.body).toEqual(mockData[0]);
    // //       expect(guard.isString).toHaveBeenCalledTimes(1);
    // //       done();
    // //     });
    // // });
    // it('should return a 400 status and log a message if the id is not a string', (done) => {
    //   spyIsString.mockReturnValue(false);
    //   request(app)
    //     .get('/doctors/' + mockData[0].id)
    //     .expect(400)
    //     .then((response: request.Response) => {
    //       expect(LoggerService.info).toHaveBeenCalledTimes(2);
    //       done();
    //     });
    // });
    it('should very that the id is a number', (done) => {
      request(app)
        .get('/doctors/' + mockData[0].id)
        .expect(200)
        .then((response: request.Response) => {
          expect(spyIsNumber).toHaveBeenCalledTimes(1);
          done();
        });
    });
    it('should return a 400 status and log a message if the id is not a number', (done) => {
      spyIsNumber.mockReturnValue(false);
      request(app)
        .get('/doctors/abc')
        .expect(400)
        .then((response: request.Response) => {
          expect(LoggerService.error).toHaveBeenCalled();
          done();
        });
    });
    it('should return a 404 status if the doctor is not found', (done) => {
      spygetById.mockReturnValue(undefined);
      request(app)
        .get('/doctors/' + mockData[0].id)
        .expect(404)
        .then((response: request.Response) => {
          expect(LoggerService.error).toHaveBeenCalled();
          done();
        });
      });
  });

  describe('POST /doctor', () => {
    beforeEach(() => {
      jest.spyOn(DoctorsService, 'insert').mockReturnValue(mockData[0]);
      jest.spyOn(guard, 'isDoctor').mockReturnValue(true);
    });
    it('should return the new doctor and status 200', (done) => {
      request(app)
        .post('/doctors/')
        .send(mockData[0])
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response: request.Response) => {
          expect(response.body).toEqual(mockData[0]);
          done();
        });
    });
    it('should call isPatient guard and return a 400 status if the body is not a doctor', (done) => {
      jest.spyOn(guard, 'isDoctor').mockReturnValue(false);
      request(app)
        .post('/doctors/')
        .send(mockData[0])
        .expect(400)
        .then((response: request.Response) => {
          expect(guard.isDoctor).toHaveBeenCalledTimes(1);
          done();
        });
    });
    it('should call the service', (done) => {
      jest.spyOn(DoctorsService, 'insert').mockReturnValue(mockData[0]);
      request(app)
        .post('/doctors/')
        .send(mockData[0])
        .expect(200)
        .then((response: request.Response) => {
          expect(DoctorsService.insert).toHaveBeenCalledTimes(1);
          done();
        });
    });
  });

  // describe('PUT /doctors', () => {
  //   it('should return the updated doctor and status 200', (done) => {
  //     jest.spyOn(DoctorsService, 'update').mockReturnValue(mockData[0]);
  //     jest.spyOn(guard, 'isDoctor').mockReturnValue(true);
  //     request(app)
  //       .put('/doctors/')
  //       .send(mockData[0])
  //       .expect(200)
  //       .expect('Content-Type', /json/)
  //       .then((response: request.Response) => {
  //         expect(response.body).toEqual(mockData[0]);
  //         done();
  //       });
  //   });
  //   it('should return a 400 status if the body is not a doctor', (done) => {
  //     jest.spyOn(guard, 'isDoctor').mockReturnValue(false);
  //     request(app)
  //       .put('/doctors/')
  //       .send(mockData[0])
  //       .expect(400)
  //       .then((response: request.Response) => {
  //         expect(guard.isDoctor).toHaveBeenCalledTimes(1);
  //         done();
  //       });
  //   });
  //   it('should return a 404 status if the doctor is not found', (done) => {
  //     jest.spyOn(DoctorsService, 'update').mockReturnValue(undefined);
  //     jest.spyOn(guard, 'isDoctor').mockReturnValue(true);
  //     request(app)
  //       .put('/doctors/')
  //       .send(mockData[0])
  //       .expect(404)
  //       .then((response: request.Response) => {
  //         done();
  //       });
  //   });
  // });

  // describe('DELETE /doctors/', () => {
  //   it('should return a 200 status if the doctor is deleted', (done) => {
  //     jest.spyOn(DoctorsService, 'delete').mockReturnValue(true);
  //     request(app)
  //       .delete('/doctors/' + mockData[0].id)
  //       .expect(200)
  //       .then((response: request.Response) => {
  //         done();
  //       });
  //   });
  //   it('should call the service', (done) => {
  //     jest.spyOn(DoctorsService, 'delete').mockReturnValue(true);
  //     request(app)
  //       .delete('/doctors/' + mockData[0].id)
  //       .expect(200)
  //       .then((response: request.Response) => {
  //         expect(DoctorsService.delete).toHaveBeenCalledTimes(1);
  //         done();
  //       });
  //   });
  //   it('should return a 400 status if the id is not a number', (done) => {
  //     jest.spyOn(guard, 'isNumber').mockReturnValue(false);
  //     request(app)
  //       .delete('/doctors/abc')
  //       .expect(400)
  //       .then((response: request.Response) => {
  //         done();
  //       });
  //   });
  //   it('should return a 404 status if the doctor is not found', (done) => {
  //     jest.spyOn(DoctorsService, 'delete').mockReturnValue(false);
  //     jest.spyOn(guard, 'isNumber').mockReturnValue(true);
  //     request(app)
  //       .delete('/doctors/' + mockData[0].id)
  //       .expect(404)
  //       .then((response: request.Response) => {
  //         done();
  //       });
  //   });
  // });
    
});


