import * as zod from "zod";
import { Address } from "../types";

// EVM addresses are typically 0x + 40 hex chars
// e.g., 0x0123456789abcdef0123456789abcdef01234567
const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;

export const evmAddressSchema = zod
  .string()
  .regex(evmAddressRegex, "Invalid EVM address format")
  // Transform the validated string into our branded type:
  .transform((value) => value as Address);

export const httpsURLSchema = zod
  .string()
  .url() // ensures it’s a properly formed URL
  .refine((url) => url.startsWith("https://"), {
    message: "webhookURL must use ssl (https)",
  });
