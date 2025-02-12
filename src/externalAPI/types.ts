import { ZodSchema } from "zod";
import { Organization } from "../organizations/types";
import { Request, Response, NextFunction } from "express";
import { Address, OrganizationID, UnixTimestamp, WalletID } from "../lib/types";
import { WalletAPIMetadata } from "../wallets/types";

export interface APIRequest extends Request {
  organization?: Organization;
}
export type APIResponse = Response;
export type APINextFunction = NextFunction;

export type BodySchemaValidatorMiddleware = <T>(
  schema: ZodSchema<T>
) => (req: APIRequest, res: APIResponse, next: APINextFunction) => void;

interface BodyValidationErrorResponse {
  success?: false;
  message: string;
  errors?: { field: string; message: string }[];
}

export type APIResponseErrorPayload = BodyValidationErrorResponse;

export interface CreateWalletResponseV1 {
  success: true;
  wallet: WalletV1;
}

export interface WalletV1 {
  id: WalletID;
  organizationID: OrganizationID;
  name: string;
  createdAt: UnixTimestamp;
  updatedAt: UnixTimestamp;
  deletedAt: UnixTimestamp | null;
  address: Address;
  /**
   * Webhook URL that is called when a payment is received
   */
  webhookURL: string;
  /**
   * Fee that is charged by the DAO for using the wallet in basis points,
   * i.e. 100% = 10000, 1% = 100, 0.01% = 1
   */
  daoFeeBasisPoints: number;
  /**
   * End customer wallet address that receives the payment
   */
  recipientAddress: Address;
  metadata: WalletAPIMetadata | null;
}
