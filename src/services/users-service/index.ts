import { cannotEnrollBeforeStartDateError } from "@/errors";
import userRepository, { User } from "@/repositories/user-repository";
import bcrypt from "bcrypt";

import eventsService from "../events-service";
import { duplicatedEmailError } from "./errors";

export async function createUser(params: CreateUserParams): Promise<User> {
  await validateUniqueEmail(params.email);

  await canEnroll();

  const hashedPassword = await bcrypt.hash(params.password, 12);
  return userRepository.create({ ...params, password: hashedPassword });
}

async function validateUniqueEmail(email: string): Promise<void> {
  const user = await userRepository.findByEmail(email);

  if (user) {
    throw duplicatedEmailError();
  }
}

async function canEnroll(): Promise<void> {
  const canEnroll = await eventsService.isCurrentEventActive();

  if (!canEnroll) {
    throw cannotEnrollBeforeStartDateError();
  }
}

export type CreateUserParams = Pick<User, "email" | "password">;

const userService = {
  createUser,
};

export * from "./errors";
export default userService;
