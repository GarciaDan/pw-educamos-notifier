import dotenv from "dotenv";
import EducamosWorker from "workers/educamos-worker";
import TelegramWorker from "workers/telegram-worker";

dotenv.config();

const USERNAME = process.env["EDUCAMOS_USERNAME"];
const PASSWORD = process.env["EDUCAMOS_PASSWORD"];
const LOGIN_URL = process.env["EDUCAMOS_LOGIN_URL"];
const DOWNLOADS_FOLDER = process.env["DOWNLOADS_FOLDER"];
const BOT_TOKEN = process.env["TELEGRAM_TOKEN"];
const CHAT_ID = process.env["TELEGRAM_CHAT_ID"];

export async function redirectEducamosMessagesToTelegram() {
  try {
    const educamos = new EducamosWorker(
      USERNAME,
      PASSWORD,
      LOGIN_URL,
      DOWNLOADS_FOLDER
    );
    const messages = await educamos.retrieveAllUnreadMessages();
    if (messages.length > 0) {
      const telegram = new TelegramWorker(BOT_TOKEN, CHAT_ID);
      for (const message of messages) {
        const result = await telegram.sendMessage(message);
        console.info("Sent message: " + JSON.stringify(result));
      }
    } else {
      console.info("No messages found.");
    }
  } catch (error) {
    console.error("Error :", error);
  }
}
