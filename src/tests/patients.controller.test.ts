import request from "supertest";
import { app } from "../app";
import { Doctor } from "../models/doctor.model";
import { LoggerService } from "../services/logger.service";
import * as guard from "../utils/guards";
import exp from "constants";
import { Patient } from "../models/patient.model";
import { before } from "node:test";
import { PatientsService } from "../services/patients.service";
jest.mock('../services/db.service');
jest.mock("../services/doctors.service");
jest.mock("../services/logger.service");
jest.mock("../utils/guards");

const mockData: Patient[] = [
  {
    id: 1,
    lastName: "Valles",
    firstName: "Jules",
    birthDate: new Date("1990-01-01"),
    niss: "900101-123-45",
    address: {
      street: "Rue du polar",
      number: "273-B",
      zipCode: "1000",
      city: "Bruxelles",
      country: "Belgique",
    },
    refDoctor: 1,
  },
];

const URL = "/patients/";

describe("PatientsController", () => {
  let spyIsNumber: jest.SpyInstance;
  let spyIsString: jest.SpyInstance;
  let spyService: jest.SpyInstance;
  let spyIsPatient: jest.SpyInstance;
  let spyLogger: jest.SpyInstance;
  let spyLoggerError: jest.SpyInstance;

  describe("GET /patients/", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      spyService = jest
        .spyOn(PatientsService, "getAll")
        .mockReturnValue(mockData);
      spyIsString = jest.spyOn(guard, "isString").mockReturnValue(true);
      spyIsNumber = jest.spyOn(guard, "isNumber").mockReturnValue(true);
      spyLogger = jest.spyOn(LoggerService, "info").mockImplementation();
      spyLoggerError = jest.spyOn(LoggerService, "error").mockImplementation();
    });
    it("should return all patients and 200 status", (done) => {
      request(app)
        .get(URL)
        .expect(200)
        .expect("Content-Type", /json/)
        .then((response: request.Response) => {
          // JSON parse and stringify to compare dates and objects
          expect(response.body).toEqual(JSON.parse(JSON.stringify(mockData)));
          done();
        });
    });
    // it("should log a message", (done) => {
    //   request(app)
    //     .get(URL)
    //     .expect(200)
    //     .expect("Content-Type", /json/)
    //     .then((response: request.Response) => {
    //       expect(spyLogger).toHaveBeenCalled();
    //       done();
    //     });
    // });
  });

  describe("GET /patients/id", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      spyService = jest
        .spyOn(PatientsService, "getById")
        .mockReturnValue(mockData[0]);
      // spyIsString = jest.spyOn(guard, "isString").mockReturnValue(true);
      spyIsNumber = jest.spyOn(guard, "isNumber").mockReturnValue(true);
      spyLogger = jest.spyOn(LoggerService, "info").mockImplementation();
    });
    it("should return the expected patient and status 200", (done) => {
      request(app)
        .get("/patients/" +  mockData[0].id)
        .expect(200)
        .expect("Content-Type", /json/)
        .then((response: request.Response) => {
          expect(response.body).toEqual(
            JSON.parse(JSON.stringify(mockData[0]))
          );
          // expect(spyLogger).toHaveBeenCalledTimes(1);
          done();
        });
    });
    it("should check if the query parameter is a number", (done) => {
      request(app)
        .get("/patients/" +  mockData[0].id)
        .expect(200)
        .expect("Content-Type", /json/)
        .then((response: request.Response) => {
          expect(spyIsNumber).toHaveBeenCalled();
          done();
        });
    });
    // it("should send status 400 if query parameter is not a string and log a message", (done) => {
    //   spyIsString.mockReturnValue(false);
    //   request(app)
    //     .get("/patients/" +  'abc')
    //     .expect(400)
    //     .then(() => {
    //       expect(spyLogger).toHaveBeenCalledTimes(2);
    //       done();
    //     });
    // });
    // it("should check if the query parameter is a number", (done) => {
    //   request(app)
    //     .get("/patients/" +  mockData[0].id)
    //     .expect(200)
    //     .then(() => {
    //       expect(spyIsNumber).toHaveBeenCalled();
    //       done();
    //     });
    // });
    it("should return status 400 if id is not a number and log a message", (done) => {
      spyIsNumber.mockReturnValue(false);
      request(app)
        .get("/patients/" +  'abc')
        .expect(400)
        .then(() => {
          expect(spyLoggerError).toHaveBeenCalled();
          done();
        });
    });
    it("should return status 404  and log a message if patient is not found", (done) => {
      spyService.mockReturnValue(undefined);
      request(app)
        .get("/patients/" +  mockData[0].id)
        .expect(404)
        .then(() => {
          expect(spyLoggerError).toHaveBeenCalled();
          done();
        });
    });
  });

  describe("POST /patients", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      spyService = jest
        .spyOn(PatientsService, "insert")
        .mockReturnValue(mockData[0]);
      spyIsString = jest.spyOn(guard, "isString").mockReturnValue(true);
      spyIsNumber = jest.spyOn(guard, "isNumber").mockReturnValue(true);
      spyIsPatient = jest.spyOn(guard, "isPatient").mockReturnValue(true);
      spyLogger = jest.spyOn(LoggerService, "info").mockImplementation();
    });
    it("should create a new patient and return 200 status", (done) => {
      request(app)
        .post(URL)
        .send(mockData[0])
        .expect(200)
        .expect("Content-Type", /json/)
        .then((response: request.Response) => {
          expect(response.body).toEqual(
            JSON.parse(JSON.stringify(mockData[0]))
          );
          // expect(spyLogger).toHaveBeenCalledTimes(1);
          done();
        });
    });
    it("should check if the request body is a valid Patient model", (done) => {
      request(app)
        .post(URL)
        .send(mockData[0])
        .expect(200)
        .then(() => {
          expect(spyIsPatient).toHaveBeenCalled();
          done();
        });
    });
    it("should call the service to update the patient", (done) => {
      request(app)
        .post(URL)
        .send(mockData[0])
        .expect(200)
        .then(() => {
          expect(spyService).toHaveBeenCalled();
          done();
        });
    });
    it("should return status 400 and log a message if request body is not a valid Patient model", (done) => {
      spyIsPatient.mockReturnValue(false);
      request(app)
        .post(URL)
        .send({lastName: "Valles"})
        .expect(400)
        .then(() => {
          expect(spyLoggerError).toHaveBeenCalled();
          done();
        });
    });
  });

  describe("PUT /patients", () => {
    const mosckResponse = mockData[0];
    mosckResponse.lastName += " updated";
    beforeEach(() => {
      jest.clearAllMocks();
      spyService = jest
        .spyOn(PatientsService, "update")
        .mockReturnValue(mosckResponse);
      spyIsString = jest.spyOn(guard, "isString").mockReturnValue(true);
      spyIsNumber = jest.spyOn(guard, "isNumber").mockReturnValue(true);
      spyIsPatient = jest.spyOn(guard, "isPatient").mockReturnValue(true);
      spyLogger = jest.spyOn(LoggerService, "debug").mockImplementation();
      spyLoggerError = jest.spyOn(LoggerService, "error").mockImplementation();
    });
    it("should update a patient and return 200 status and log a message", (done) => {
      request(app)
        .put(URL)
        .send(mockData[0])
        .expect(200)
        .expect("Content-Type", /json/)
        .then((response: request.Response) => {
          expect(response.body).toEqual(
            JSON.parse(JSON.stringify(mosckResponse))
          );
          // expect(spyLoggerError).toHaveBeenCalled();
          done();
        });
    });
    it("should check if the request body is a valid Patient model", (done) => {
      request(app)
        .put(URL)
        .send(mockData[0])
        .expect(200)
        .then(() => {
          expect(spyIsPatient).toHaveBeenCalled();
          done();
        });
    });
    it("should return status 400 if request body is not a valid Patient model and log a message", (done) => {
      spyIsPatient.mockReturnValue(false);
      request(app)
        .put(URL)
        .send(mockData[0])
        .expect(400)
        .then(() => {
          expect(spyLoggerError).toHaveBeenCalled();
          done();
        });
    });
    it("should call the service to update the patient", (done) => {
      request(app)
        .put(URL)
        .send(mockData[0])
        .expect(200)
        .then(() => {
          expect(spyService).toHaveBeenCalled();
          done();
        });
    });
    it("should return status 404 if patient is not found and log a message", (done) => {
      spyService.mockReturnValue(undefined);
      request(app)
        .put(URL)
        .send(mockData[0])
        .expect(404)
        .then(() => {
          expect(spyLoggerError).toHaveBeenCalled();
          done();
        });
    });
  });

  describe("DELETE /patients/", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      spyService = jest.spyOn(PatientsService, "delete").mockReturnValue(true);
      spyIsString = jest.spyOn(guard, "isString").mockReturnValue(true);
      spyIsNumber = jest.spyOn(guard, "isNumber").mockReturnValue(true);
      spyLogger = jest.spyOn(LoggerService, "debug").mockImplementation();
    });
    it("should delete a patient and return 200 status and log a message", (done) => {
      request(app)
        .delete(URL + mockData[0].id)
        .expect(200)
        .then(() => {
          // expect(spyLogger).toHaveBeenCalledTimes(1);
          done();
        });
    });
    // it("should check if the query parameter is a string", (done) => {
    //   request(app)
    //     .delete(URL)
    //     .query({ id: mockData[0].id })
    //     .expect(204)
    //     .then(() => {
    //       expect(spyIsString).toHaveBeenCalled();
    //       done();
    //     });
    // });
    // it("should return status 400 if query parameter is not a string and log a message", (done) => {
    //   spyIsString.mockReturnValue(false);
    //   request(app)
    //     .delete(URL + mockData[0].id)
    //     .expect(400)
    //     .then(() => {
    //       expect(spyLogger).toHaveBeenCalledTimes(2);
    //       done();
    //     });
    // });
    it("should check if the query parameter is a number", (done) => {
      request(app)
        .delete(URL + 'abc')
        .expect(200)
        .then(() => {
          expect(spyIsNumber).toHaveBeenCalled();
          done();
        });
    });
    it("should return status 400 if id is not a number and log a message", (done) => {
      spyIsNumber.mockReturnValue(false);
      request(app)
        .delete(URL + mockData[0].id)
        .expect(400)
        .then(() => {
          expect(spyLoggerError).toHaveBeenCalled();
          done();
        });
    });
    it("should call the service", (done) => {
      request(app)
        .delete(URL + mockData[0].id)
        .expect(200)
        .then(() => {
          expect(spyService).toHaveBeenCalled();
          done();
        });
    });
    it("should return status 404 if patient is not found and log a message", (done) => {
      spyService.mockReturnValue(false);
      request(app)
        .delete(URL + mockData[0].id)
        .expect(404)
        .then(() => {
          expect(spyLoggerError).toHaveBeenCalled();
          done();
        });
    });
  });

  describe("GET /patients/niss", () => {
    let spyIsNiss: jest.SpyInstance;
    beforeEach(() => {
      jest.clearAllMocks();
      spyService = jest
        .spyOn(PatientsService, "getByNiss")
        .mockReturnValue(mockData[0]);
      spyIsString = jest.spyOn(guard, "isString").mockReturnValue(true);
      spyIsNumber = jest.spyOn(guard, "isNumber").mockReturnValue(true);
      spyLogger = jest.spyOn(LoggerService, "debug").mockImplementation();
      spyIsNiss = jest.spyOn(guard, "isNiss").mockReturnValue(true);
    });
    it("should return the expected patient and status 200 and log a message", (done) => {
      request(app)
        .get("/patients/niss/" + mockData[0].niss)
        .expect(200)
        .expect("Content-Type", /json/)
        .then((response: request.Response) => {
          expect(response.body).toEqual(
            JSON.parse(JSON.stringify(mockData[0]))
          );
          // expect(spyLogger).toHaveBeenCalledTimes(1);
          done();
        });
    });
    it("should check if the query parameter is a valid niss", (done) => {
      request(app)
        .get("/patients/niss/" + mockData[0].niss)
        .expect(200)
        .expect("Content-Type", /json/)
        .then(() => {
          expect(spyIsNiss).toHaveBeenCalled();
          done();
        });
    });
    it("should return status 400 if niss is not valid and log a message", (done) => {
      spyIsNiss.mockReturnValue(false);
      request(app)
        .get("/patients/niss/" + mockData[0].niss)
        .expect(400)
        .then(() => {
          expect(spyLoggerError).toHaveBeenCalled();
          done();
        });
    });
    it("should call the service to get the patient", (done) => {
      request(app)
        .get("/patients/niss/" + mockData[0].niss)
        .expect(200)
        .then(() => {
          expect(spyService).toHaveBeenCalled();
          done();
        });
    });
    it("should return status 404 if patient is not found and log a message", (done) => {
      spyService.mockReturnValue(undefined);
      request(app)
        .get("/patients/niss/" + mockData[0].niss)
        .expect(404)
        .then(() => {
          // expect(spyLogger).toHaveBeenCalled();
          // expect(spyLoggerError).toHaveBeenCalled();
          done();
        });
    });
  });

  // describe('GET /patients/age', () => {
  //   beforeEach(() => {
  //     jest.clearAllMocks();
  //     spyService = jest.spyOn(PatientsService, 'getOlderThan').mockReturnValue(mockData);
  //     spyIsString = jest.spyOn(guard, 'isString').mockReturnValue(true);
  //     spyIsNumber = jest.spyOn(guard, 'isNumber').mockReturnValue(true);
  //     spyLogger = jest.spyOn(LoggerService, 'info').mockImplementation();
  //   });
  //   it('should return all patients older than a given age and 200 status and log a message', (done) => {
  //     request(app)
  //       .get('/patients/age')
  //       .query({ age: 30 })
  //       .expect(200)
  //       .expect('Content-Type', /json/)
  //       .then((response: request.Response) => {
  //         expect(response.body).toEqual(JSON.parse(JSON.stringify(mockData))) ;
  //         expect(spyLogger).toHaveBeenCalledTimes(1);
  //         done();
  //       });
  //   });
  //   it('should check if the query parameter is a string', (done) => {
  //     request(app)
  //       .get('/patients/age')
  //       .query({ age: 30 })
  //       .expect(200)
  //       .expect('Content-Type', /json/)
  //       .then(() => {
  //         expect(spyIsString).toHaveBeenCalled();
  //         done();
  //       });
  //   });
  //   it('should return status 400 if age is not a string and log a message', (done) => {
  //     spyIsString.mockReturnValue(false);
  //     request(app)
  //       .get('/patients/age')
  //       .query({ age: 30 })
  //       .expect(400)
  //       .then(() => {
  //         expect(spyLogger).toHaveBeenCalledTimes(2);
  //         done();
  //       });
  //   });
  //   it('should check if the query parameter is a number', (done) => {
  //     request(app)
  //       .get('/patients/age')
  //       .query({ age: 30 })
  //       .expect(200)
  //       .then(() => {
  //         expect(spyIsNumber).toHaveBeenCalled();
  //         done();
  //       });
  //   });
  //   it('should return status 400 if age is not a number and log a message', (done) => {
  //     spyIsNumber.mockReturnValue(false);
  //     request(app)
  //       .get('/patients/age')
  //       .query({ age: 30 })
  //       .expect(400)
  //       .then(() => {
  //         expect(spyLogger).toHaveBeenCalledTimes(2);
  //         done();
  //       });
  //   });
  // });
});
