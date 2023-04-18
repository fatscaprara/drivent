import sessionRepository from "@/repositories/session-repository";
import userRepository, { User } from "@/repositories/user-repository";
import { exclude } from "@/utils/prisma-utils";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { invalidCredentialsError } from "./errors";

async function signIn(params: SignInParams): Promise<SignInResult> {
  const user = await userRepository.findByEmail(params.email);
  await validateUserAndPassword(user, params.password);
  const token = await createSession(user.id);

  return { user: exclude(user, "password"), token };
}

async function validateUserAndPassword(user: User | null, password: string) {
  if (!user) {
    throw invalidCredentialsError();
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw invalidCredentialsError();
  }
}

async function createSession(userId: number): Promise<string> {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET);
  await sessionRepository.create({ token, userId });
  return token;
}

export type SignInParams = Pick<User, "email" | "password">;

type SignInResult = {
  user: Pick<User, "id" | "email">;
  token: string;
};

const authenticationService = {
  signIn,
};

export default authenticationService;
export * from "./errors";
