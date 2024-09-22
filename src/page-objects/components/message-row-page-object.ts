import { Locator, Page } from "playwright/test";
import PageObject from "base/page-object";

export default class MessageRowPageObject extends PageObject {
  static defaultSelectors(): Map<string, string> {
    const selectors = new Map<string, string>();

    selectors.set(
      "root",
      "table[class='TableData']:has(img[src*='ico_sobre']) tr:nth-of-type(#)"
    );
    selectors.set("envelope", "td:nth-of-type(1)");
    selectors.set("clip", "td:nth-of-type(2)");
    selectors.set("checkbox", "td:nth-of-type(3)");
    selectors.set("date", "td:nth-of-type(4)");
    selectors.set("from", "td:nth-of-type(5)");
    selectors.set("subject", "td:nth-of-type(6)");
    selectors.set("isResponse", "td:nth-of-type(7)");
    selectors.set("group", "td:nth-of-type(8)");
    selectors.set("centre", "td:nth-of-type(9)");
    selectors.set("openEnvelope", "img[src*='abierto']");
    selectors.set("clipImage", "img[src*='attach']");
    selectors.set("checkboxInput", `${selectors.get("checkbox")} input`);

    return selectors;
  }

  constructor(
    page: Page,
    rowIndex: number,
    parent?: PageObject,
    selectors?: Map<string, string>
  ) {
    const updatedSelectors = MessageRowPageObject.defaultSelectors();
    updatedSelectors.set(
      "root",
      updatedSelectors.get("root").replace("#", `${rowIndex+2}`) // nth-of-type starts at 1, and we add another for header
    );
    super(page, selectors || updatedSelectors, parent);
  }

  //#region Locators

  async getRoot(): Promise<Locator> {
    return await this.getElement("root");
  }

  async getEnvelope(): Promise<Locator> {
    return await this.getElement("envelope");
  }

  async getClip(): Promise<Locator> {
    return await this.getElement("clip");
  }

  async getCheckbox(): Promise<Locator> {
    return await this.getElement("checkbox");
  }

  async getDate(): Promise<Locator> {
    return await this.getElement("date");
  }

  async getFrom(): Promise<Locator> {
    return await this.getElement("from");
  }

  async getSubject(): Promise<Locator> {
    return await this.getElement("subject");
  }

  async getIsResponse(): Promise<Locator> {
    return await this.getElement("isResponse");
  }

  async getGroup(): Promise<Locator> {
    return await this.getElement("group");
  }

  async getCentre(): Promise<Locator> {
    return await this.getElement("centre");
  }

  async getOpenEnvelope(): Promise<Locator> {
    return await this.getElement("openEnvelope");
  }

  async getClipImage(): Promise<Locator> {
    return await this.getElement("clipImage");
  }

  async getCheckboxInput(): Promise<Locator> {
    return await this.getElement("checkboxInput");
  }

  //#endregion

  //#region Values

  async isMessageOpen(): Promise<boolean> {
    const envelope = await this.getEnvelope();
    await envelope.waitFor();
    const openEnvelope = await envelope.locator(
      this.getSelector("openEnvelope")
    );
    const openEnvelopeCount = await openEnvelope.count();
    return openEnvelopeCount > 0;
  }

  async hasAttachments(): Promise<boolean> {
    const attachments = await this.getClip();
    await attachments.waitFor();
    const clipImage = await attachments.locator(this.getSelector("clipImage"));
    const clipImageCount = await clipImage.count();
    return clipImageCount > 0;
  }

  async getCheckboxValue(): Promise<boolean> {
    const checkbox = await this.getElement("checkboxInput");
    return await checkbox.isChecked();
  }

  async getDateTextValue(): Promise<string> {
    return await this.getTrimmedText("date");
  }

  async getFromTextValue(): Promise<string> {
    const cellText = await this.getTrimmedText("from");
    return cellText
      .split(",")
      .map((fromText) => fromText.trim())
      .reverse()
      .join(" ");
  }

  async getSubjectTextValue(): Promise<string> {
    return await this.getTrimmedText("subject");
  }

  async isResponse(): Promise<boolean> {
    const cellText = await this.getTrimmedText("isResponse");
    return cellText.toLocaleLowerCase().startsWith("s");
  }

  async getGroupTextValue(): Promise<string> {
    return await this.getTrimmedText("group");
  }

  async getCentreTextValue(): Promise<string> {
    return await this.getTrimmedText("centre");
  }

  //#endregion

  //#region Interactions

  async clickSubject(): Promise<void> {
    return await this.click("subject");
  }

  //#endregion

  private async getTrimmedText(selector: string) {
    const cellText = await this.getText(selector);
    return cellText.trim();
  }
}
