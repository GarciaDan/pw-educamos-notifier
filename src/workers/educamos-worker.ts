import fs from "fs";
import { chromium, Page } from "playwright/test";
import LoginPageObject from "page-objects/pages/login-page-object";
import ApplicationsPanelPageObject from "page-objects/pages/applications-panel-page-object";
import SeguimientoEducativoPageObject from "page-objects/pages/seguimiento-educativo-page-object";
import { EducamosMessage } from "types/educamos-message";

const HEADLESS = true;

export default class EducamosWorker {
  constructor(
    private username: string,
    private password: string,
    private loginUrl: string,
    private downloadsFolder: string
  ) {
    this.setup();
  }

  async retrieveAllUnreadMessages(): Promise<EducamosMessage[]> {
    const browser = await chromium.launch({ headless: HEADLESS });
    const context = await browser.newContext();
    const mainPage = await context.newPage();
    try {
      await this.logInEducamosPlatform(mainPage);
      await this.navigateToSeguimientoEducativo(mainPage);
      const messages = await this.getMessages(mainPage);
      await browser.close();
      return messages;
    } catch (err) {
      const errorMessage: EducamosMessage = {
        date: this.getCurrentFormattedDate(),
        subject: "Error",
        isResponse: false,
        from: "Educamos Notifier Bot",
        centre: "",
        group: "",
        body: err,
      };
      return [errorMessage];
    }
  }

  setup() {
    if (!fs.existsSync(this.downloadsFolder)) {
      fs.mkdirSync(this.downloadsFolder, { recursive: true });
    }
  }

  async logInEducamosPlatform(page: Page) {
    const loginPO = new LoginPageObject(page);
    await loginPO.navigate(this.loginUrl);
    await loginPO.doLogin(this.username, this.password);
  }

  async navigateToSeguimientoEducativo(page: Page) {
    const appPanelPO = new ApplicationsPanelPageObject(page);
    const accessButton = await appPanelPO.getSeguimientoEducativoAccessButton();
    await appPanelPO.clickSeguimientoEducativoAccessButton();
    appPanelPO.waitUntilElementDoesNotExist(accessButton);
  }

  async getMessages(page: Page): Promise<EducamosMessage[]> {
    const messages: EducamosMessage[] = [];
    const seguimientoEducativoPO = new SeguimientoEducativoPageObject(
      page,
      this.downloadsFolder
    );
    const numberOfMessages =
      await seguimientoEducativoPO.barraNavegacion.getNumeroMensajesLabelValue();
    if (numberOfMessages > 0) {
      console.log(`Messages received: ${numberOfMessages}`);
      for (let i = 0; i < numberOfMessages; i++) {
        seguimientoEducativoPO.barraNavegacion.clickMensajesLink();
        const message = await seguimientoEducativoPO.readMessageByIndex(0);
        messages.push(message);
      }
    }
    return messages;
  }

  private getCurrentFormattedDate(): string {
    const now = new Date();

    const day = `${now.getDate()}`.padStart(2, "0");
    const month = `${now.getMonth() + 1}`.padStart(2, "0");
    const year = `${now.getFullYear()}`;

    const hours = `${now.getHours()}`.padStart(2, "0");
    const minutes = `${now.getMinutes()}`.padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
}
