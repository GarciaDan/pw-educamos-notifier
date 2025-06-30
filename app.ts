// pw-educamos-notifier
// Copyright (C) 2025 Daniel García García
// dev {at} danigarcia.org

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import defaults from "constants/defaults";
import dotenv from "dotenv";
import { Logger } from "utils/logger";
import EducamosWorker from "workers/educamos-worker";

dotenv.config();

const USERNAME = process.env["EDUCAMOS_USERNAME"];
const PASSWORD = process.env["EDUCAMOS_PASSWORD"];
const LOGIN_URL = `${defaults.baseUrl}/${defaults.pages.login}`;
const NOTIFICATION_ENDPOINT = process.env["NOTIFICATION_ENDPOINT"];
const HEADLESS = process.env["HEADLESS"] != "false";

(async () => {
  try {
    const educamos = new EducamosWorker(
      USERNAME,
      PASSWORD,
      LOGIN_URL,
      NOTIFICATION_ENDPOINT,
      HEADLESS
    );
    const messages = await educamos.retrieveAllUnreadMessages();
    if (messages?.length > 0) {
      const result = [];
      Logger.info(`There are ${messages.length} new messages.`);
      for(let message of messages) {
        const telegramMessage = await educamos.getTelegramMessageFromMessageId(message.id);
        if(!message.leido) {
          await educamos.setLeido(message.idDestinatarioMensaje);
        }
        const messageResponse = await educamos.sendNotification(telegramMessage);
        result.push(messageResponse);
      }
    } else {
      Logger.info("No new messages found.");
    }
  } catch (err) {
    Logger.error("There was an error while retrieving messages :", err);
  }
})();
