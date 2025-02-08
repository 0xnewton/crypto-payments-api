import { Context, Telegraf } from "telegraf";
import { FetchResult } from "../lib/types";
import { CustomClaims, User, UserRole } from "../users/types";
import { Organization } from "../organizations/types";

export type BotContext = Context;
export type TelegrafBot = Telegraf<BotContext>;

export interface UserContext {
  user: FetchResult<User>;
  organization: FetchResult<Organization>;
  role: UserRole;
  claims: CustomClaims;
}
