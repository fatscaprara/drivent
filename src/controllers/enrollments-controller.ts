import { Request, Response } from "express";
import httpStatus from "http-status";
import enrollmentsService from "@/services/enrollments-service";

export async function getEnrollmentByUser(
  req: Request,
  res: Response
): Promise<void> {
  const { userId } = req;
  try {
    const enrollmentWithAddress =
      await enrollmentsService.getOneWithAddressByUserId(userId);
    res.status(httpStatus.OK).send(enrollmentWithAddress);
  } catch (error) {
    res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function postCreateOrUpdateEnrollment(
  req: Request,
  res: Response
): Promise<void> {
  const { body } = req;
  try {
    await enrollmentsService.createOrUpdateEnrollmentWithAddress({
      ...body,
      userId: req.userId,
    });
    res.sendStatus(httpStatus.OK);
  } catch (error) {
    res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function getAddressFromCEP(
  req: Request,
  res: Response
): Promise<void> {
  const cep = req.query?.cep as string;
  if (!cep) {
    res.sendStatus(httpStatus.BAD_REQUEST);
    return;
  }

  try {
    const address = await enrollmentsService.getAddressFromCEP(cep);
    res.status(httpStatus.OK).send(address);
  } catch (error) {
    if (error.name === "NotFoundError") {
      res.sendStatus(httpStatus.NO_CONTENT);
      return;
    }
    res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
