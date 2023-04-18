import { AddressEnrollment } from "@/protocols";
import { getAddress } from "@/utils/cep-service";
import { notFoundError } from "@/errors";
import addressRepository, { CreateOrUpdateAddressParams } from "@/repositories/address-repository";
import enrollmentRepository, { EnrollmentWithAddress } from "@/repositories/enrollment-repository";
import { Address, Enrollment } from "@prisma/client";

async function getAddressFromCEP(cep: string): Promise<AddressEnrollment> {
  const result = await getAddress(cep);

  if (!result) {
    throw notFoundError("Address not found");
  }

  const { bairro, localidade, uf, complemento, logradouro } = result;

  const address = {
    bairro,
    cidade: localidade,
    uf,
    complemento,
    logradouro,
  };

  return address;
}

export async function getOneWithAddressByUserId(userId: number): Promise<EnrollmentWithAddress> {
  const enrollmentWithAddress = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollmentWithAddress) {
    throw notFoundError("Enrollment not found");
  }

  const [firstAddress] = enrollmentWithAddress.Address;
  const address = getFirstAddress(firstAddress);

  return {
    ...enrollmentWithAddress,
    Address: address ? [address] : [],
  };
}

function getFirstAddress(firstAddress?: Address): Address | null {
  if (!firstAddress) {
    return null;
  }

  const { createdAt, updatedAt, enrollmentId, ...rest } = firstAddress;

  return rest;
}

export async function createOrUpdateEnrollmentWithAddress(
  params: CreateOrUpdateEnrollmentWithAddress
): Promise<void> {
  const enrollmentParams = { ...params };
  const addressParams = getAddressForUpsert(params.address);
  const result = await getAddressFromCEP(addressParams.cep);

  if (result.error) {
    throw notFoundError("Address not found");
  }

  const newEnrollment = await enrollmentRepository.upsert(
    enrollmentParams.userId,
    enrollmentParams,
    ["id", "userId", "eventId"]
  );

  await addressRepository.upsert(newEnrollment.id, addressParams, ["id", "enrollmentId", "cep"]);
}

export type CreateOrUpdateEnrollmentWithAddress = {
  userId: number;
  eventId: number;
  address: CreateOrUpdateAddressParams;
};

const enrollmentsService = {
  getOneWithAddressByUserId,
  createOrUpdateEnrollmentWithAddress,
  getAddressFromCEP,
};

export default enrollmentsService;
