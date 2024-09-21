import { Locator, Page } from "playwright/test";
import PageObject from "base/page-object";

export default class LoginPageObject extends PageObject {
  static defaultSelectors(): Map<string, string> {
    const selectors = new Map<string, string>();

    selectors.set("username", "#username");
    selectors.set("password", "#password");
    selectors.set("submitButton", "#kc-login");

    return selectors;
  }

  constructor(page: Page, selectors?: Map<string, string>, parent?: PageObject) {
    super(page, selectors || LoginPageObject.defaultSelectors(), parent);
  }

  //#region Data

  async getUsername(): Promise<Locator> {
    return await this.getElement("username");
  }

  async getPassword(): Promise<Locator> {
    return await this.getElement("password");
  }

  async getSubmitButton(): Promise<Locator> {
    return await this.getElement("submitButton");
  }

  //#endregion

  //#region Interaction

  async setUsername(username: string): Promise<Locator> {
    //await this.getUsername();
    return await this.type("username", username);
  }

  async setPassword(password: string): Promise<Locator> {
    //await this.getPassword();
    return await this.type("password", password, true, true);
  }

  async clickSubmitButton() {
    return await this.click("submitButton");
  }

  //#endregion

  //#region Workflows

  async doLogin(username: string, password: string) {
    const usernameField = await this.getUsername();
    await this.setUsername(username);
    await this.setPassword(password);
    await this.clickSubmitButton();
    await this.waitUntilElementDoesNotExist(usernameField);
  }

  //#endregion
}
