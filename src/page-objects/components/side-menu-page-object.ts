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

export default class SideMenuPageObject extends PageObject {
  static defaultSelectors(): Map<string, string> {
    const selectors = new Map<string, string>();

    selectors.set("alumno", "mat-list-item:has([class='alumn-image'])");
    selectors.set("selectorAlumno", "[class='blockPerfiles']");
    selectors.set("opcionAlumno", "[class='blockPerfiles'] [type='button']");
    selectors.set("inicio", "button:has(i[class*='ri-home-2-line'])");
    selectors.set("avisos", "button:has(i[class*='ri-notification-3-line'])");

    return selectors;
  }

  constructor(
    page: Page,
    selectors?: Map<string, string>,
    parent?: PageObject
  ) {
    super(page, selectors || SideMenuPageObject.defaultSelectors(), parent);
  }

  //#region Data

  async getAlumno(): Promise<Locator> {
    return await this.getElement("alumno");
  }

  async getSelectorAlumno(): Promise<Locator> {
    return await this.getElement("selectorAlumno");
  }

  async getOpcionAlumno(): Promise<Locator> {
    return await this.getElement("opcionAlumno");
  }

  async geInicio(): Promise<Locator> {
    return await this.getElement("inicio");
  }

  async getAvisos(): Promise<Locator> {
    return await this.getElement("avisos");
  }

  //#endregion

  //#region Interaction

  async clickAlumno() {
    return await this.click("alumno");
  }

  async clickSelectorAlumno() {
    return await this.click("selectorAlumno");
  }

  async clickOpcionAlumno(index: number) {
    const opciones = await this.getElement("opcionAlumno");
    return await (await opciones.nth(index)).click();
  }

  async clickInicio() {
    return await this.click("inicio");
  }

  async clickAvisos() {
    return await this.click("avisos");
  }

  //#endregion

  //#region Workflows

  async elegirAlumno(index: number) {
    await this.clickAlumno();
    await this.waitUntilElementIsVisible(await this.getSelectorAlumno());
    await this.clickOpcionAlumno(index);
  }

  //#endregion
}
