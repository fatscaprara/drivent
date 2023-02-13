import { Request, Response } from "express";
import httpStatus from "http-status";

import { AuthenticatedRequest } from "@/middlewares";
import paymentService from "@/services/payments-service";

export async function getPaymentByTicketId(
  req: AuthenticatedRequest,
  res: Response
) {
  const { userId } = req;
  const ticketId = Number(req.query.ticketId);

  if (!ticketId) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  try {
    const payment = await paymentService.getPaymentByTicketId(userId, ticketId);

    if (!payment) {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }

    return res.status(httpStatus.OK).send(payment);
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function paymentProcess(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { ticketId, cardData } = req.body;

  if (!ticketId || !cardData) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  try {
    const payment = await paymentService.paymentProcess(
      ticketId,
      userId,
      cardData
    );

    if (!payment) {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }

    return res.status(httpStatus.OK).send(payment);
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
