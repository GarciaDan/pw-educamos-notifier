import PageObject from "base/page-object";
import { Frame, Locator, Page } from "playwright/test";

export default class BotoneraTituloFramePageObject extends PageObject {
  static defaultSelectors(): Map<string, string> {
    const selectors = new Map<string, string>();

    selectors.set("frame", "[name='botoneraTitulo']");
    selectors.set("deleteButton", "#i_ELIMINAR_MENSAJES_SELECCIONADO");

    return selectors;
  }

  constructor(
    page: Page,
    parent?: PageObject,
    selectors?: Map<string, string>
  ) {
    super(
      page,
      selectors || BotoneraTituloFramePageObject.defaultSelectors(),
      parent
    );
  }

  //#region Locators

  async getDeleteButton(): Promise<Locator> {
    return await this.getElement("deleteButton");
  }

  //#endregion

  //#region Interactions

  async clickDeleteButton(): Promise<void> {
    return await this.click("deleteButton");
  }

  //#endregion
}
