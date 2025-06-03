/**
 * This file contains all the logic for the doctors controller
 */

import { Request, Response, Router } from "express";
import { Doctor, DoctorFilter } from "../models/doctor.model";
import { isDoctor, isNumber, isString } from "../utils/guards";
import { DoctorsService } from "../services/doctors.service";
import { LoggerService } from "../services/logger.service";

export const doctorsController = Router();

/**
 * This function returns all the doctors
 */
doctorsController.get("/", (req: Request, res: Response) => {
  LoggerService.info("[GET] /doctors/");
  const filter: DoctorFilter = {};
  const speciality = req.query.speciality;
  if (isString(speciality)) {
    filter.speciality = speciality;
  }
  const result = DoctorsService.getAll();
  res.status(200).json(result);
  return;
});

/**
 * This function returns a specific doctor
 */
doctorsController.get("/:id", (req: Request, res: Response) => {
  LoggerService.info("[GET] /doctors/:id");
  const id = parseInt(req.params.id);
  if (!isNumber(id)) {
    LoggerService.error("Invalid id");
    res.status(400).send("Invalid id");
    return;
  }

  const doctor : Doctor | undefined = DoctorsService.getById(id);

  if (doctor === undefined) {
    LoggerService.error("Doctor not found");
    res.status(404).send("Doctor not found");
    return;
  }

  res.status(200).json(doctor);
  return;
});

/**
 * This function creates a new doctor
 */
doctorsController.post("/", (req: Request, res: Response) => {
  LoggerService.info("[POST] /doctors/");
  const doctor: Doctor = req.body;
  if(!isDoctor(doctor)) {
    res.status(400).send("Missing fields");
    return;
  }
  const newDoctor = DoctorsService.insert(doctor);
  res.status(200).json(doctor);
  return;
});

/**
 * This function updates a doctor
 */
doctorsController.put("/", (req: Request, res: Response) => {
  LoggerService.info("[PUT] /doctors/");
  const doctor = req.body;
  if(!isDoctor(doctor)) {
    res.status(400).send("Missing fields");
    return;
  }
  const doctorUpdated : Doctor | undefined = DoctorsService.update(doctor);

  if (doctorUpdated === undefined) {
    res.status(404).send("Doctor not found");
    return;
  }

  res.status(200).json(doctorUpdated);
});

/**
 * This function deletes a doctor
 */
doctorsController.delete("/:id", (req: Request, res: Response) => {
  LoggerService.info("[DELETE] /doctors/:id");
  const id = parseInt(req.params.id);
  if (!isNumber(id)) {
    res.status(400).send("Invalid id");
    return;
  }
  const result = DoctorsService.delete(id);
  if (!result) {
    res.status(404).send("Doctor not found");
    return;
  }

  res.status(200).send();
});
