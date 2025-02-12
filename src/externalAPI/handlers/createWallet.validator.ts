import * as z from "zod";
import { NetworkEnum } from "../../lib/types";
import {
  evmAddressSchema,
  httpsURLSchema,
  apiMetadataSchema,
} from "../../lib/core/schemas";

export const createWalletByAPIReqBodySchema = z.object({
  name: z.string().optional(),
  chain: z.nativeEnum(NetworkEnum),
  recipientAddress: evmAddressSchema,
  webhookURL: httpsURLSchema,
  webhookSecret: z.string().optional(),
  apiMetadata: apiMetadataSchema,
});

export type CreateWalletByAPIReqBodySchema = z.infer<
  typeof createWalletByAPIReqBodySchema
>;
