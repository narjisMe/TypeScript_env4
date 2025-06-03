import { Request, Response, Router } from 'express';
import { Patient, PatientFilter } from '../models/patient.model';
import { isNiss, isNumber, isPatient, isString } from '../utils/guards';
import { LoggerService } from '../services/logger.service';
import { PatientsService } from '../services/patients.service';

export const patientsController = Router();

/**
 * GET /patients/
 * Get all patients without filtering
 */
patientsController.get('/', (req: Request, res: Response) => {
  LoggerService.info('[GET] /patients/');
  const filter: PatientFilter = {};
  const zipCode = req.query.zipCode;
  const doctorString = req.query.refDoctor;
  if (isString(zipCode)) {
    filter.zipcode = zipCode;
  }
  if (isString(doctorString)) {
    const id = parseInt(doctorString);
    if (isNumber(id)) {
      filter.refDoctor = id;
    }
  }
  const results: Patient[] = PatientsService.getAll();
  res.status(200).json(results);
  return;
});

/**
 * GET /patients/niss/:niss
 * Get a patient by its niss
 */
patientsController.get('/niss/:niss', (req: Request, res: Response) => {
  LoggerService.debug('[GET] /patients/niss/:niss');

  // extract the niss number from the request's parameters
  const niss = req.params.niss;

  // check if this is a valid niss number
  if (!isNiss(niss)) {
    LoggerService.error('Invalid niss');
    return res.status(400).json({ error: `Invalid niss: ${niss}` });
  }

  // find the patient with the given niss
  const result : Patient | undefined = PatientsService.getByNiss(niss);

  // check if the patient has been found
  if (!result) {
    LoggerService.error('Patient not found');
    return res.status(404).json({ error: `Patient with niss ${niss} not found` });
  }

  // send the response with 200 status code
  return res.status(200).json(result);
});

/**
 * GET /patients/:id
 * Get a patient by its id
 */
patientsController.get('/:id', (req: Request, res: Response) => {
  LoggerService.info('[GET] /patients/id');
  const id = parseInt(req.params.id);
  if (!isNumber(id)) {
    LoggerService.error('Bad request: invalid id');
    res.status(400).send();
    return;
  }
  const patient: Patient | undefined = PatientsService.getById(id);
  if (patient == undefined) {
    LoggerService.error('Patient not found');
    res.status(404).send();
    return;
  }
  res.status(200).json(patient);
  return;
});

/**
 * POST /patients/
 * Create a new patient
 * Request body must be a valid Patient model
 */
patientsController.post('/', (req: Request, res: Response) => {
  LoggerService.info('[POST] /patients/');
  const patient: Patient = req.body;

  // check the request body is a valid Patient model
  if (!isPatient(patient)) {
    LoggerService.error('Bad request');
    return res.status(400).send();
  }

  const newPatient: Patient = PatientsService.insert(patient);
  return res.status(200).json(newPatient);
});

/**
 * GET /patients/niss
 * Get a patient by its niss
 * Request parameter must be a valid niss with the following format: XXXXXX-XXX-XX
 */
patientsController.get('/niss/:niss', (req: Request, res: Response) => {
  LoggerService.info('[GET] /patients/niss');
  const niss = req.params.niss;

  // check that the query parameter niss is present and is a valid niss
  if (!isNiss(niss)) {
    LoggerService.error('Bad request');
    res.status(400).send();
    return;
  }
  // search for the patient with the given niss
  const patient: Patient | undefined = PatientsService.getByNiss(niss);

  // check that the patient exists
  if (!patient) {
    LoggerService.error('Patient not found');
    res.status(404).send();
    return;
  }
  
  // all good, return the patient
  res.status(200).json(patient);
  return;
});

/**
 * UPDATE /patients/
 * Update a patient by its ID
 * Request body must be a valid Patient model
 */
patientsController.put('/', (req: Request, res: Response) => {
  LoggerService.debug('[PUT] /patients/');
  const patient = req.body;

  // check that the request body is a valid Patient model
  if (!isPatient(patient)) {
    LoggerService.error('Bad request: req.body does not match Patient model');
    res.status(400).send();
    return;
  }

  const updatedPatient: Patient | undefined = PatientsService.update(patient);

  if (!updatedPatient) {
    LoggerService.error('Patient not found');
    res.status(404).send('Patient not found');
    return;
  }

  res.status(200).json(updatedPatient);
  return;
});

/**
 * DELETE /patients/
 * Delete a patient by its ID
 * Request parameter must be a valid ID
 */
patientsController.delete('/:id', (req: Request, res: Response) => {
  LoggerService.info('[DELETE] /patients/');
  const id = parseInt(req.params.id);

  if (!isNumber(id)) {
    LoggerService.error('Bad request: invalid id');
    res.status(400).send();
    return;
  }

  const result: boolean = PatientsService.delete(id);
  if (!result) {
    LoggerService.error('Patient not found');
    res.status(404).send();
    return;
  }
  
  res.status(200).send();
  return;
});

/**
 * GET /patients/doctor/:id
 * Get all patients with the given doctor id
 */
patientsController.get('/doctor/:id', (req: Request, res: Response) => {
  LoggerService.debug('[GET] /patients/doctor/:id');

  // extract the id from the request's parameters
  const id = parseInt(req.params.id);

  // check if the id is a number
  if (!isNumber(id)) {
    return res.status(400).json({ error: `Invalid id: ${req.params.id}` });
  }

  // find the patients with the given doctor id
  const results = PatientsService.getByDoctorId(id);

  // send the response with 200 status code
  return res.status(200).json(results);
});

/**
 * GET /patients/zipcode/:zipcode
 * Get all patients with the given zip code
 */
patientsController.get('/zipcode/:zipcode', (req: Request, res: Response) => {
  LoggerService.debug('[GET] /zipcode/:zipcode');

  // extract the zipcode from the request's parameters
  const zipcode = req.params.zipcode;
  if (!isString(zipcode)) {
    return res.status(400).json({ error: `Invalid zip code: ${zipcode}` });
  }

  // find the patients with the given zip code
  const results = PatientsService.getByZipCode(zipcode);

  // send the response with 200 status code
  return res.status(200).json(results);
});

/**
 * GET /patients/doctor/:id/zipcode/:zipcode
 * Get all patients with the given doctor id and zipcode
 */
patientsController.get('/doctor/:id/zipcode/:zipcode', (req: Request, res: Response) => {
  LoggerService.debug('[GET] /patients/doctor/:id/zipcode/:zipcode');

  // extract the id from the request's parameters
  const id = parseInt(req.params.id);
  if (!isNumber(id)) {
    LoggerService.error('Invalid id');
    return res.status(400).json({ error: `Invalid id: ${req.params.id}` });
  }

  // extract the zipcode from the request's parameters
  const zipcode = req.params.zipcode;
  if (!isString(zipcode)) {
    LoggerService.error('Invalid zipcode');
    return res.status(400).json({ error: `Invalid zipcode: ${zipcode}` });
  }

  const results = PatientsService.getByDoctorIdAndZipCode(id, zipcode);

  // send the response with 200 status code
  return res.status(200).json(results);
});
