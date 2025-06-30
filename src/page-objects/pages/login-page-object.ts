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
