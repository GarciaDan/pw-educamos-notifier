import { Locator, Page } from "playwright/test";
import PageObject from "base/page-object";

export default class ApplicationsPanelPageObject extends PageObject {
  static defaultSelectors(): Map<string, string> {
    const selectors = new Map<string, string>();

    selectors.set(
      "seguimientoEducativoAccessButton",
      "div:has(>*>*>.SEGUIMIENTO_EDUCATIVO) button"
    );
    selectors.set(
      "secretariaVirtualAccessButton",
      "div:has(>*>*>.SECRETARIA_VIRTUAL) button"
    );
    selectors.set("bancoDeLibrosAccessButton", "div:has(>*>*>.LIBROS) button");
    selectors.set(
      "evaluacionInternaAccessButton",
      "div:has(>*>*>.EICE) button"
    );
    return selectors;
  }

  constructor(page: Page, selectors?: Map<string, string>, parent?: PageObject) {
    super(
      page,
      selectors || ApplicationsPanelPageObject.defaultSelectors(),
      parent
    );
  }

  //#region Data

  async getSeguimientoEducativoAccessButton(): Promise<Locator> {
    return await this.getElement("seguimientoEducativoAccessButton");
  }

  async getSecretariaVirtualAccessButton(): Promise<Locator> {
    return await this.getElement("secretariaVirtualAccessButton");
  }

  async getBancoDeLibrosAccessButton(): Promise<Locator> {
    return await this.getElement("bancoDeLibrosAccessButton");
  }

  async getEvaluacionInternaAccessButton(): Promise<Locator> {
    return await this.getElement("evaluacionInternaAccessButton");
  }

  //#endregion

  //#region Interaction

  async clickSubmitButton() {
    return await this.click("submitButton");
  }

  async clickSeguimientoEducativoAccessButton(): Promise<void> {
    return await this.click("seguimientoEducativoAccessButton");
  }

  async clickSecretariaVirtualAccessButton(): Promise<void> {
    return await this.click("secretariaVirtualAccessButton");
  }

  async clickBancoDeLibrosAccessButton(): Promise<void> {
    return await this.click("bancoDeLibrosAccessButton");
  }

  async clickEvaluacionInternaAccessButton(): Promise<void> {
    return await this.click("evaluacionInternaAccessButton");
  }

  //#endregion
}
