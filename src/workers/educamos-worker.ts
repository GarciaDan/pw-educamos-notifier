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

import { chromium, expect, Page } from "playwright/test";
import { convert } from "html-to-text";
import LoginPageObject from "page-objects/pages/login-page-object";
import { EducamosMessage } from "types/educamos-message";
import SideMenuPageObject from "page-objects/components/side-menu-page-object";
import defaults from "constants/defaults";
import { EducamosMessageFilter } from "types/educamos-message-filter";
import { EducamosMessageDetails } from "types/educamos-message-details";
import { TelegramAttachment } from "types/telegram-attachment";
import { EducamosAdjunto } from "types/educamos-adjunto";
import { TelegramMessage } from "types/telegram-message";
import { Logger } from "utils/logger";

const axios = require("axios").default;

export default class EducamosWorker {
  private authorization: string = "";

  constructor(
    private username: string,
    private password: string,
    private loginUrl: string,
    private notificationEndpoint: string,
    private headless: boolean
  ) {}

  async sendNotification(message: TelegramMessage) {
    const options = {
      method: "POST",
      url: this.notificationEndpoint,
      headers: { "content-type": "application/json" },
      data: message,
    };

    try {
      Logger.info(
        `Sending ${message.format} message with ${message.message} attachments: ${message.message}`
      );
      await axios.request(options);
    } catch (err) {
      console.error("Error sending message: " + err);
    }
  }

  async retrieveAllUnreadMessages(): Promise<EducamosMessage[]> {
    const browser = await chromium.launch({ headless: this.headless });
    const context = await browser.newContext();
    const mainPage = await context.newPage();
    try {
      await this.logInEducamosPlatform(mainPage);

      const messages = await this.getMessages(mainPage);

      return messages;
    } catch (err) {
      Logger.error("Error retrieving messages: " + err);
      throw(err);
    } finally {
      await browser.close();
    }
  }

  async logInEducamosPlatform(page: Page) {
    try {
      const loginPO = new LoginPageObject(page);
      Logger.info(`Navigating to ${this.loginUrl}`);
      await loginPO.navigate(this.loginUrl);
      Logger.info(`Logging in`);
      await loginPO.doLogin(this.username, this.password);

      const sideMenuPO = new SideMenuPageObject(page);
      const botonAvisos = await sideMenuPO.getAvisos();
      await expect(botonAvisos).toBeVisible();
      Logger.info(`Login successful`);
    } catch (err) {
      Logger.error("Error logging in Educamos platform: " + err);
    }
  }

  private getCurrentFormattedDate(): string {
    const now = new Date();

    const day = `${now.getDate()}`.padStart(2, "0");
    const month = `${now.getMonth() + 1}`.padStart(2, "0");
    const year = `${now.getFullYear()}`;

    const hours = `${now.getHours()}`.padStart(2, "0");
    const minutes = `${now.getMinutes()}`.padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  private async getMessages(
    page: Page,
    filter: EducamosMessageFilter = { leido: false }
  ): Promise<Array<EducamosMessage>> {
    let currentMessages: Array<EducamosMessage> = [];

    page.on("request", async (request) => {
      try {
        if (
          request.url() == `${defaults.baseUrl}${defaults.endpoints.messages}`
        ) {
          const headers = await request.allHeaders();
          this.authorization = headers["authorization"];
        }
      } catch (err) {
        Logger.error("getMessages: request error: " + err);
      }
    });

    await page.goto(`${defaults.baseUrl}${defaults.pages.inbox}`);
    const response = await page.waitForResponse((response) =>
      response.url().includes(defaults.endpoints.messages)
    , {timeout: defaults.timeouts.inboxResponseTime});

    await expect(response.status()).toBe(200);

    currentMessages = JSON.parse(
      (await response.body()).toString()
    ) as Array<EducamosMessage>;
    Logger.info(
      `Retrieved ${currentMessages?.length ?? 0} messages from Educamos backend`
    );
    const filterKeys = Object.keys(filter);
    for (let filterKey of filterKeys) {
      currentMessages = currentMessages.filter((m) => {
        if (typeof m[filterKey] === "string") {
          return m[filterKey].includes(filter[filterKey]);
        } else {
          return m[filterKey] == filter[filterKey];
        }
      });
    }
    return currentMessages;
  }

  private async getAttachment(attachmentId: number) {
    const endpoint = defaults.endpoints.attachment.replace(
      "#",
      `${attachmentId}`
    );
    const options = {
      method: "GET",
      url: `${defaults.baseUrl}${endpoint}`,
      responseType: "arraybuffer",
      headers: JSON.parse(JSON.stringify(defaults.headers)),
    };

    delete options.headers["accept"];
    options.headers["maxContentLength"] = defaults.maxContentLength;
    options.headers["authorization"] = this.authorization;

    try {
      Logger.info("Retrieving attachment...");
      const response = await axios.request(options);
      const buffer = Buffer.from(response.data, "binary");
      return buffer;
    } catch (err) {
      Logger.error("Error retrieving attachment: " + err);
    }
  }

  async getMessageDetails(messageId: number): Promise<EducamosMessageDetails> {
    const endpoint = defaults.endpoints.messageDetails.replace(
      "#",
      `${messageId}`
    );
    return (await this.get(endpoint)) as EducamosMessageDetails;
  }

  async setLeido(idDestinatarioMensaje: number) {
    const endpoint = defaults.endpoints.leido.replace(
      "#",
      `${idDestinatarioMensaje}`
    );

    const options = {
      method: "POST",
      url: `${defaults.baseUrl}${endpoint}`,
      headers: defaults.headers,
    };

    options.headers["authorization"] = this.authorization;

    try {
      Logger.info(`Setting message ${idDestinatarioMensaje} as readed`);
      await axios.request(options);
    } catch (err) {
      Logger.error("Error when setting message as readed: " + err);
    }
  }

  async getTelegramMessageFromMessageId(
    messageId: number
  ): Promise<TelegramMessage> {
    let messageDetails;
    try {
      messageDetails = await this.getMessageDetails(messageId);
    } catch (err) {
      Logger.error(
        `Error getting message details from message ${messageId}: ` + err
      );
      throw err;
    }

    try {
      const telegramMessage: TelegramMessage = {
        message: this.formatMessage(messageDetails),
        attachments: [],
      };
      for (let adjunto of messageDetails.ficherosAdjuntos) {
        const datosAdjunto = await this.generateAttachmentStructure(adjunto);
        telegramMessage.attachments.push(datosAdjunto);
      }
      return telegramMessage;
    } catch (err) {
      Logger.error(
        `Error composing Telegram message details for message ${messageId}: ` +
          err
      );
      throw err;
    }
  }

  private async get(endpoint: string, headers = {}) {
    const options = {
      method: "GET",
      url: `${defaults.baseUrl}${endpoint}`,
      headers: JSON.parse(JSON.stringify(defaults.headers)),
    };

    options.headers["authorization"] = this.authorization;

    const headerKeys = Object.keys(headers);
    for (let key of headerKeys) {
      options.headers[key] = headers[key];
    }

    try {
      Logger.info(`Sending request to ${endpoint}`);
      const { data } = await axios.request(options);
      return data;
    } catch (err) {
      Logger.error(`Error retrieving data from ${endpoint}: ${err}`);
    }
  }

  private async generateAttachmentStructure(
    datosAdjunto: EducamosAdjunto
  ): Promise<TelegramAttachment> {
    const result = await this.getAttachment(datosAdjunto.id);
    const adjunto: TelegramAttachment = {
      fileName: datosAdjunto.nombre,
      fileBase64Content: result.toString("base64"),
    };
    return adjunto;
  }

  private formatMessage(educamosMsg: EducamosMessageDetails): string {
    const isResponseText = educamosMsg.respuesta ? "\u{21A9}" : "";

    let messageBody = `·  \u{1F4C5}    ${educamosMsg.fechaMensaje}
·  \u{2709}    ${educamosMsg.remitente} ${isResponseText}
·  \u{270D}    ${educamosMsg.asunto}`;
    if (educamosMsg.procedencia) {
      messageBody += `
·  \u{1F3EB}    ${educamosMsg.procedencia}`;
    }
    if (educamosMsg.grupo) {
      messageBody += `
·  \u{1F465}    ${educamosMsg.grupo}`;
    }
    if (educamosMsg.adjuntos) {
      messageBody += `
·  \u{1F4CE}    Contiene adjuntos:`;
      const adjuntos = educamosMsg.ficherosAdjuntos;
      for (let adjunto of adjuntos) {
        messageBody += this.getAttachmentLine(adjunto.nombre);
      }
    }
    messageBody += `
    ········································
${convert(educamosMsg.cuerpoMensaje)}
  
    `;
    return messageBody;
  }

  private getAttachmentLine(filename: string): string {
    const extension = filename.split(".").splice(-1)[0].toLocaleLowerCase();
    if (["png", "jpg", "gif", "jpeg", "bmp"].includes(extension)) {
      return `
  ·  \u{1F5BC}    ${filename}`;
    } else if (["wav", "mp3", "snd", "rec"].includes(extension)) {
      return `
      ·  \u{1F50A}    ${filename}`;
    } else if (["avi", "mpg", "mpeg", "mov", "mkv"].includes(extension)) {
      return `
      ·  \u{1F4F9}    ${filename}`;
    } else if (["zip", "rar", "7z"].includes(extension)) {
      return `
      ·  \u{1F4E6}    ${filename}`;
    } else {
      return `
      ·  \u{1F4C4}    ${filename}`;
    }
  }
}
