import * as z from "zod";
import { NetworkEnum } from "../../lib/types";
import { evmAddressSchema, httpsURLSchema } from "../../lib/core/schemas";

export const createWalletValidator = z.object({
  chain: z.nativeEnum(NetworkEnum),
  recipientAddress: evmAddressSchema,
  webhookURL: httpsURLSchema,
  webhookSecret: z.string().optional(),
});

export type CreateWalletPayload = z.infer<typeof createWalletValidator>;
