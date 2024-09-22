import { EducamosMessage } from "types/educamos-message";
import { TelegramMessage } from "types/telegram-message";

const axios = require("axios");
const fs = require("fs");

export default class TelegramWorker {
  private chatId: string;
  private baseUrl: string;
  private apiUrl: string;

  constructor(botToken: string, chatId: string) {
    this.chatId = chatId;
    this.baseUrl = `https://api.telegram.org/bot${botToken}`;
    this.apiUrl = `${this.baseUrl}/sendMessage`;
  }

  async sendMessage(educamosMessage: EducamosMessage) {
    let response = [];
    const telegramMessage = this.formatMessage(educamosMessage);
    // Send the message using Axios
    try {
      const msgResponse = await axios.post(this.apiUrl, telegramMessage);
      response.push(msgResponse.data);
      if (
        educamosMessage?.attachments &&
        educamosMessage?.attachments?.length > 0
      ) {
        for (const attachment of educamosMessage.attachments) {
          try {
            const msgResponseAttachment = await this.sendAttachment(attachment);
            response.push(msgResponseAttachment.data);
          } catch (error) {
            console.error("Error sending attachment: " + error);
          }
        }
      }
    } catch (error) {
      console.error("Error sending message: " + error);
    }
    return response;
  }

  private formatMessage(educamosMsg: EducamosMessage): TelegramMessage {
    const isResponseText = educamosMsg.isResponse ? "(Respuesta)" : "";
    const attachmentText =
      educamosMsg?.attachments?.length > 0 ? "Contiene adjuntos" : "";
    let messageBody = `Recibido mensaje el ${educamosMsg.date}
  DE:     ${educamosMsg.from} ${isResponseText}
  ASUNTO: ${educamosMsg.subject}`;
  if(educamosMsg.centre) {
    messageBody += `
  CENTRO: ${educamosMsg.centre}`;
  }
  if(educamosMsg.body) {
    messageBody += `
  GRUPO:  ${educamosMsg.group}`;
  }
  messageBody += `
  ---
  ${educamosMsg.body}
  
  ${attachmentText}
  `;

    const messageData: TelegramMessage = {
      chat_id: this.chatId,
      text: messageBody,
    };
    return messageData;
  }

  async sendAttachment(filePath) {
    const formData = new FormData();
    formData.append("chat_id", this.chatId);
    const extension = filePath.toLowerCase().split(".").reverse()[0];
    const filename = filePath.split("/").reverse()[0];
    const blob = await this.fileToBlob(filePath);
    let apiUrl = this.baseUrl;
    if (["jpg", "jpeg", "gif", "png", "bmp"].includes(extension)) {
      formData.append("photo", blob, filename);
      apiUrl += "/sendPhoto";
    } else if (["wav", "mp3"].includes(extension)) {
      formData.append("audio", blob, filename);
      apiUrl += "/sendAudio";
    } else if (["wav", "mp3"].includes(extension)) {
      formData.append("video", blob, filename);
      apiUrl += "/sendVideo";
    } else if (["pdf"].includes(extension)) {
      console.log("Filename: " + filename);
      formData.append("document", blob, filename);
      apiUrl += "/sendDocument";
    } else {
      formData.append("document", blob, filename);
      apiUrl += "/sendDocument";
    }

    // Send the data using Axios
    return await axios.post(apiUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  private fileToBlob(filePath: string): Promise<Blob> {
    const extension = filePath.toLowerCase().split(".").reverse()[0];
    const type = this.getMimeTypeByExtension(extension);
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(filePath);
      const chunks = [];

      readStream.on("data", (chunk) => {
        chunks.push(chunk);
      });

      readStream.on("end", () => {
        const buffer = Buffer.concat(chunks);
        const blob = new Blob([buffer], { type: type });
        resolve(blob);
      });

      readStream.on("error", (error) => {
        reject(error);
      });
    });
  }

  private getMimeTypeByExtension(extension) {
    const mimeTypes = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      pdf: "application/pdf",
      txt: "text/plain",
      html: "text/html",
      css: "text/css",
      js: "application/javascript",
      zip: "application/zip",
    };
    const lowercasedExtension = extension.toLowerCase();
    return mimeTypes[lowercasedExtension] || "application/octet-stream";
  }
}
