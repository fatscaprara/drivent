import { notFoundError } from "@/errors";
import eventRepository from "@/repositories/event-repository";
import { Event } from "@prisma/client";
import dayjs from "dayjs";

export interface EventWithoutTimestamps extends Omit<Event, "createdAt" | "updatedAt"> {}

export async function getFirstEvent(): Promise<EventWithoutTimestamps> {
  const event = await eventRepository.findFirst();
  if (!event) {
    throw notFoundError();
  }

  return {
    id: event.id,
    name: event.name,
    description: event.description,
    location: event.location,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
  };
}

export async function isCurrentEventActive(): Promise<boolean> {
  const event = await eventRepository.findFirst();
  if (!event) {
    return false;
  }

  const now = dayjs();
  const eventStartsAt = dayjs(event.startsAt);
  const eventEndsAt = dayjs(event.endsAt);

  return now.isAfter(eventStartsAt) && now.isBefore(eventEndsAt);
}

const eventsService = {
  getFirstEvent,
  isCurrentEventActive,
};

export default eventsService;

