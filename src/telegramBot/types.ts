import { Context, Telegraf } from "telegraf";
import { CustomClaims, User, UserRole } from "../users/types";
import { Organization } from "../organizations/types";

export type BotContext = Context;
export type TelegrafBot = Telegraf<BotContext>;

export interface UserContext {
  user: User;
  organization: Organization;
  role: UserRole;
  claims: CustomClaims;
}
