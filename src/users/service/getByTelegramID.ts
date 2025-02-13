import { TelegramUserID } from "../../lib/types";
import { getUserByTelegramUserID } from "../db";
import { User } from "../types";

export const getByTelegramID = async (
  telegramID: TelegramUserID
): Promise<User | null> => {
  const data = getUserByTelegramUserID(telegramID);

  return data;
};
