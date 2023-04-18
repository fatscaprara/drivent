import { notFoundError } from "@/errors";
import ticketRepository, { Ticket } from "@/repositories/ticket-repository";
import enrollmentRepository, { EnrollmentWithAddress } from "@/repositories/enrollment-repository";
import { TicketStatus } from "@prisma/client";

export async function getTicketTypes(): Promise<Ticket[]> {
  const ticketTypes = await ticketRepository.findTicketTypes();

  if (!ticketTypes || ticketTypes.length === 0) {
    throw notFoundError("Ticket types not found");
  }

  return ticketTypes;
}

export async function getTicketByUserId(userId: number): Promise<Ticket> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) {
    throw notFoundError("Enrollment not found");
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket) {
    throw notFoundError("Ticket not found");
  }

  return ticket;
}

export async function createTicket(userId: number, ticketTypeId: number): Promise<Ticket> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) {
    throw notFoundError("Enrollment not found");
  }

  const ticketData = {
    ticketTypeId,
    enrollmentId: enrollment.id,
    status: TicketStatus.RESERVED,
  };

  await ticketRepository.createTicket(ticketData);

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket) {
    throw notFoundError("Ticket not found after creation");
  }

  return ticket;
}

const ticketService = {
  getTicketTypes,
  getTicketByUserId,
  createTicket,
};

export default ticketService;
