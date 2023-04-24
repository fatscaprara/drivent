import { Request, Response } from "express";
import httpStatus from "http-status";
import enrollmentsService from "@/services/enrollments-service";

export async function getEnrollmentWithAddressByUserId(
  req: Request<{ userId: string }, {}, {}>,
  res: Response
): Promise<void> {
  const { userId } = req.params;
  try {
    const enrollmentWithAddress =
      await enrollmentsService.getOneWithAddressByUserId(userId);
    res.status(httpStatus.OK).send(enrollmentWithAddress);
  } catch (error) {
    res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function createOrUpdateEnrollmentWithAddress(
  req: Request<{}, {}, { userId: string }>,
  res: Response
): Promise<void> {
  const { body } = req;
  try {
    await enrollmentsService.createOrUpdateEnrollmentWithAddress({
      ...body,
      userId: req.params.userId,
    });
    res.sendStatus(httpStatus.OK);
  } catch (error) {
    res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function getAddressByCEP(
  req: Request<{}, {}, {}, { cep: string }>,
  res: Response
): Promise<void> {
  const { cep } = req.query;
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
