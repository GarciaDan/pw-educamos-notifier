/*
  SeguimientoEducativoPageObject
  ├── BarraNavegacionFramePageObject
  ├── InferiorFramePageObject
  │     └── PrincipalFramePageObject
  │          ├──CuerpoFramePageObject
  │          └──BotoneraTituloFramePageObject
  └── BarraNavegacionFramePageObject
*/

import path from "path";
import fs from "fs";
import { Page } from "playwright/test";
import { EducamosMessage } from "types/educamos-message";
import { Labels } from "constants/labels";
import PageObject from "base/page-object";
import BarraNavegacionFramePageObject from "page-objects/components/main-page-frames/barra-navegacion-frame-page-object";
import InferiorFramePageObject from "page-objects/components/main-page-frames/inferior-frame-page-object";
import MessageRowPageObject from "page-objects/components/message-row-page-object";

export default class SeguimientoEducativoPageObject extends PageObject {
  barraNavegacion: BarraNavegacionFramePageObject;
  inferior: InferiorFramePageObject;
  downloadFolder: string;

  static defaultSelectors(): Map<string, string> {
    const selectors = new Map<string, string>();

    selectors.set("cell", "td");

    return selectors;
  }

  constructor(
    page: Page,
    downloadFolder: string,
    selectors?: Map<string, string>,
    parent?: PageObject
  ) {
    super(
      page,
      selectors || SeguimientoEducativoPageObject.defaultSelectors(),
      parent
    );
    this.downloadFolder = downloadFolder;
    this.barraNavegacion = new BarraNavegacionFramePageObject(page, this);
    this.inferior = new InferiorFramePageObject(page, this);
  }

  //#region Workflows

  async readMessageByIndex(index: number): Promise<EducamosMessage> {
    const rowPO = await this.inferior.principal.cuerpo.getMessageRowPageObject(
      index
    );

    const message: EducamosMessage = {
      date: await rowPO.getDateTextValue(),
      from: await rowPO.getFromTextValue(),
      subject: await rowPO.getSubjectTextValue(),
      isResponse: await rowPO.isResponse(),
      group: await rowPO.getGroupTextValue(),
      centre: await rowPO.getCentreTextValue(),
      body: "",
    };

    const isRemovedMessage = await this.removeMessageIfDeleted(rowPO);
    if (isRemovedMessage) {
      message.subject = Labels.MessageHasBeenRemoved;
      return message;
    }

    const { body, attachments } = await this.getMessageBodyAndAttachments(
      rowPO
    );

    message.body = body;
    message.attachments = attachments;

    return message;
  }

  //#endregion

  //#region Message Handling

  private async removeMessageIfDeleted(
    rowPO: MessageRowPageObject
  ): Promise<boolean> {
    const checkbox = await rowPO.getCheckboxInput();
    await checkbox.waitFor();

    const messageSubject = await rowPO.getSubjectTextValue();
    if (
      messageSubject
        .toLocaleLowerCase()
        .includes(Labels.MessageHasBeenRemoved.toLocaleLowerCase())
    ) {
      this.acceptDialog();
      await checkbox.click();

      await this.inferior.principal.botonera.clickDeleteButton();
      return true;
    } else {
      return false;
    }
  }

  private async getMessageBodyAndAttachments(
    rowPO: MessageRowPageObject
  ): Promise<{ body: string; attachments?: string[] }> {
    const hasAttachments = await rowPO.hasAttachments();
    await rowPO.clickSubject();
    await this.page.waitForTimeout(5000);
    const messageTable = await this.inferior.principal.cuerpo.getMessageTable();
    messageTable.waitFor();

    const tableText = await messageTable.textContent();
    const body = tableText.trim();

    const attachments = [];
    if (hasAttachments) {
      const currentAttachmentFolder = this.createAttachmentFolder();
      const documents = await this.inferior.principal.cuerpo.getDocuments();
      const numberOfDocuments = await documents.count();
      console.info(`Message contains ${numberOfDocuments} attachments`);
      for (let i = 0; i < numberOfDocuments; i++) {
        const document = await documents.nth(i);
        const link = await document.locator(
          this.inferior.principal.cuerpo.getSelector("downloadLink")
        );
        await link.waitFor();
        const downloadPromise = this.page.waitForEvent("download");
        await link.click();

        const download = await downloadPromise;
        const filePath = path.join(
          currentAttachmentFolder,
          download.suggestedFilename()
        );
        console.info(`\t- Saving attachment to ${filePath}`);
        await download.saveAs(filePath);
        attachments.push(filePath);
      }
    }
    return { body, attachments };
  }

  private createAttachmentFolder(): string {
    const dateFolderPath = path.join(
      this.downloadFolder,
      new Date()
        .toJSON()
        .replaceAll(":", "")
        .replaceAll("-", "")
        .replaceAll(".", "")
    );
    fs.mkdirSync(dateFolderPath, { recursive: true });
    return dateFolderPath;
  }
  
  //#endregion
}
