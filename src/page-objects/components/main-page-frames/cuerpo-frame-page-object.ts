import PageObject from "base/page-object";
import { Locator, Page } from "playwright/test";
import MessageRowPageObject from "page-objects/components/message-row-page-object";

export default class CuerpoFramePageObject extends PageObject {
  static defaultSelectors(): Map<string, string> {
    const selectors = new Map<string, string>();

    selectors.set("frame", "[name='cuerpo']");
    selectors.set("allInput", "input[value='TODOS']");
    selectors.set("rightArrowImage", "img[src*='arrowRight']");
    selectors.set("table", "table[class='TableData']");
    selectors.set(
      "tableHeader",
      `${selectors.get("table")} tr:has([class*='cabecera'])`
    );
    selectors.set(
      "rows",
      `${selectors.get("table")} tr:has([class^='cuerpo'])`
    );
    selectors.set("documents", "tr:has(>*>img[src*='txt-icon'])");
    selectors.set("cells", "td");
    selectors.set("input", "input");
    selectors.set("downloadLink", "td:has(a) a");
    selectors.set("messageTable", ".tablaFondoMenRec");
    selectors.set(
      "conversation",
      `${selectors.get("table")} tr:has(td[onclick='javascript:showOpciones(1)'][align='LEFT'])`
    );

    return selectors;
  }

  constructor(
    page: Page,
    parent?: PageObject,
    selectors?: Map<string, string>
  ) {
    super(page, selectors || CuerpoFramePageObject.defaultSelectors(), parent);
  }

  //#region Locators

  async getAllInput(): Promise<Locator> {
    return await this.getElement("allInput");
  }

  async getRightArrowImage(): Promise<Locator> {
    return await this.getElement("rightArrowImage");
  }

  async getTable(): Promise<Locator> {
    return await this.getElement("table");
  }

  async getTableHeader(): Promise<Locator> {
    return await this.getElement("tableHeader");
  }

  async getRows(): Promise<Locator> {
    return await this.getElement("rows");
  }

  async getDocuments(): Promise<Locator> {
    return await this.getElement("documents");
  }

  async getDownloadLink(): Promise<Locator> {
    return await this.getElement("downloadLink");
  }

  async getMessageTable(): Promise<Locator> {
    return await this.getElement("messageTable");
  }

  async getConversation(): Promise<Locator> {
    return await this.getElement("conversation");
  }

  async getMessageRowPageObject(
    rowIndex: number
  ): Promise<MessageRowPageObject> {
    await this.initFrame();
    const messageRow = new MessageRowPageObject(this.page, rowIndex, this);
    await messageRow.initFrame();
    return messageRow;
  }

  async getMessageRowPageObjects(): Promise<MessageRowPageObject[]> {
    await this.initFrame();
    const rows = await this.getRows();
    const rowsNumber = await rows.count();
    const messages = [];
    for (let i = 0; i < rowsNumber; i++) {
      const messageRow = new MessageRowPageObject(this.page, i, this);
      await messageRow.initFrame();
      messages.push(messageRow);
    }
    return messages;
  }

  //#endregion

  //#region Interactions

  async clickDownloadLink(): Promise<void> {
    return await this.click("downloadLink");
  }

  //#endregion

  //#region Workflows

  //TODO: Document detection algorithm clashes with attachment detection. Fix it.
  async isDocumentPresent(): Promise<boolean> {
    return await this.isElementPresent("documents");
  }

  //#endregion
}
