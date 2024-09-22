import PageObject from "base/page-object";
import { Locator, Page } from "playwright/test";

export default class BarraNavegacionFramePageObject extends PageObject {
  static defaultSelectors(): Map<string, string> {
    const selectors = new Map<string, string>();

    selectors.set("frame", "[name='barraNavegacion']");
    selectors.set("mensajesLink", "a:has(img[alt='Mensajes'])");
    selectors.set("numeroMensajesLabel", "#numeroMensajes");

    return selectors;
  }

  constructor(page: Page, parent?: PageObject, selectors?: Map<string, string>) {
    super(
      page,
      selectors || BarraNavegacionFramePageObject.defaultSelectors(),
      parent
    );
  }

  //#region Locators

  async getMensajesLink(): Promise<Locator> {
    return await this.getElement("mensajesLink");
  }

  async getNumeroMensajesLabel(): Promise<Locator> {
    return await this.getElement("numeroMensajesLabel");
  }

  //#endregion

  //#region Interaction

  async clickMensajesLink(): Promise<void> {
    return await this.click("mensajesLink");
  }

  //#endregion

  //#region Values

  async getNumeroMensajesLabelValue(): Promise<number> {
    const textResult = await this.getText("numeroMensajesLabel", false);
    return !!textResult ? parseInt(textResult, 10) : 0;
  }

  //#endregion
}
