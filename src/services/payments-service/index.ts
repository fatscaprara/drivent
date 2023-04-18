import { notFoundError, unauthorizedError } from "@/errors";
import paymentRepository, { Payment } from "@/repositories/payment-repository";
import ticketRepository, { TicketWithType } from "@/repositories/ticket-repository";
import enrollmentRepository, { Enrollment } from "@/repositories/enrollment-repository";

export interface CardPaymentParams {
  issuer: string;
  number: string;
  name: string;
  expirationDate: string;
  cvv: string;
}

async function verifyTicketAndEnrollment(ticketId: number, userId: number): Promise<void> {
  const ticket = await ticketRepository.findTickeyById(ticketId);

  if (!ticket) {
    throw notFoundError("Ticket not found");
  }

  const enrollment = await enrollmentRepository.findById(ticket.enrollmentId);

  if (enrollment.userId !== userId) {
    throw unauthorizedError("You are not authorized to perform this action");
  }
}

export async function getPaymentByTicketId(userId: number, ticketId: number): Promise<Payment> {
  await verifyTicketAndEnrollment(ticketId, userId);

  const payment = await paymentRepository.findPaymentByTicketId(ticketId);

  if (!payment) {
    throw notFoundError("Payment not found");
  }

  return payment;
}

export async function paymentProcess(
  ticketId: number,
  userId: number,
  cardData: CardPaymentParams
): Promise<Payment> {
  await verifyTicketAndEnrollment(ticketId, userId);

  const ticketWithType = await ticketRepository.findTickeWithTypeById(ticketId);

  const paymentData = {
    ticketId,
    value: ticketWithType.TicketType.price,
    cardIssuer: cardData.issuer,
    cardLastDigits: cardData.number.slice(-4),
  };

  const payment = await paymentRepository.createPayment(ticketId, paymentData);

  await ticketRepository.ticketProcessPayment(ticketId);

  return payment;
}

const paymentService = {
  getPaymentByTicketId,
  paymentProcess,
};

export default paymentService;
