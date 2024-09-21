import { ElementHandle, Frame, Locator, Page, expect } from "playwright/test";

export default class PageObject {
  protected page: Page;
  protected frame: Frame = null;
  protected selectors: Map<string, string>;
  protected ROOT = "root";
  protected FRAME = "frame";
  protected parent: PageObject;

  constructor(
    page: Page,
    selectors?: Map<string, string>,
    parent?: PageObject
  ) {
    this.page = page;
    this.parent = parent;
    this.initSelectors();
    if (selectors && selectors.size > 0) {
      this.selectors = new Map<string, string>([
        ...this.selectors,
        ...selectors,
      ]);
    } else {
      this.selectors = new Map<string, string>();
    }
  }

  async initFrame(): Promise<Frame> {
    let handle: ElementHandle = null;
    // Case 1: No parent
    if (!this.parent) {
      if (this.selectors.has(this.FRAME)) {
        // Case 1.1 No parent, it's a frame - Set its own frame
        handle = await this.page.waitForSelector(this.getSelector(this.FRAME));
      }
      // Case 2: It has parent
    } else {
      // Init parent's frame recursively
      const parentFrame = await this.parent.initFrame();
      if (this.selectors.has(this.FRAME)) {
        if (parentFrame) {
          // Case 2.1.1 It has parent, it's a frame and parent is a frame - Find the frame inside the frame
          handle = await parentFrame.waitForSelector(
            this.getSelector(this.FRAME)
          );
        } else {
          // Case 2.1.2 It has parent, it's a frame and parent is not a frame - Find the frame inside parent's page
          handle = await this.parent.page.waitForSelector(
            this.getSelector(this.FRAME)
          );
        }
      } else {
        // Case 2.2 It has parent, not a frame
        if (parentFrame) {
          // Case 2.1.1 It has parent, it's not a frame and parent is a frame - Set frame as parent's
          this.frame = this.parent.frame;
          return this.frame
        }
      }
    }
    if (handle) {
      this.frame = await handle.contentFrame();
    }
    return this.frame;
  }

  private getContainer(): Page | Frame {
    return this.frame ?? this.page;
  }

  private initSelectors() {
    this.selectors = new Map<string, string>();
    this.selectors.set("body", "body");
  }

  getSelector(selectorName: string): string {
    if (selectorName && this.selectors.has(selectorName)) {
      const selector = this.selectors.get(selectorName);
      if (selector) {
        return selector;
      } else {
        throw new Error(
          `getSelector(): no locator found for element '${selectorName}'`
        );
      }
    } else {
      throw new Error(
        `getSelector(): no locator found for element '${selectorName}'`
      );
    }
  }

  async getElement(
    selectorName: string,
    parameter?: string,
    characterToReplace = "#"
  ): Promise<Locator> {
    await this.initFrame();
    let selector = "";
    if (this.selectors.has(this.ROOT)) {
      if (selectorName === this.ROOT) {
        await this.getContainer().waitForSelector(selectorName);
        return await this.getContainer().locator(this.getSelector(this.ROOT));
      } else {
        selector = `${this.getSelector(
          this.ROOT
        )} ${this.replaceSelectorParameter(
          this.getSelector(selectorName),
          parameter,
          characterToReplace
        )}`;
        await this.getContainer().waitForSelector(selector);
        return await this.getContainer().locator(selector);
      }
    } else {
      const replacedSelector = this.replaceSelectorParameter(
        this.getSelector(selectorName),
        parameter,
        characterToReplace
      );
      await this.getContainer().waitForSelector(replacedSelector);
      return await this.getContainer().locator(replacedSelector);
    }
  }

  async isElementPresent(
    selectorName: string,
    waitTimeMs: number = 2000,
    state: "attached" | "detached" | "visible" | "hidden" = "attached"
  ): Promise<boolean> {
    await this.initFrame();
    const locator = this.getContainer().locator(this.getSelector(selectorName));
    try {
      await locator.waitFor({ state: state, timeout: waitTimeMs });
      return true;
    } catch (error) {
      return false;
    }
  }

  getRootSelector(): string {
    if (this.selectors.has(this.ROOT)) {
      return this.getSelector(this.ROOT);
    } else {
      return "body";
    }
  }

  setRootLocator(rootLocator: string) {
    this.selectors.set(this.ROOT, rootLocator);
  }

  async click(selectorName: string) {
    const element = await this.getElement(selectorName);
    await expect(element).toBeEnabled();
    return await element.click();
  }

  async getValue(selectorName: string): Promise<string> {
    const element = await this.getElement(selectorName);
    return await element.getAttribute("value");
  }

  async getText(
    selectorName: string,
    errorIfNotFound: boolean = true,
    waitTimeMs: number = 2000
  ): Promise<string> {
    if (!errorIfNotFound) {
      const isPresent = await this.isElementPresent(selectorName, waitTimeMs);
      if (!isPresent) {
        return "";
      }
    }
    const element = await this.getElement(selectorName);
    const text = await element.textContent();
    return text;
  }

  async type(
    selectorName: string,
    text: string,
    clearBeforeType: boolean = true,
    hideLog: boolean = false
  ): Promise<Locator> {
    if (clearBeforeType) {
      const element = await this.getElement(selectorName);
      if (clearBeforeType) {
        await element.fill(text);
        return element;
      } else {
        const currentText = await this.getValue(selectorName);
        return await this.type(
          selectorName,
          `${currentText}${text}`,
          false,
          hideLog
        );
      }
    }
  }

  async getBody(): Promise<Locator> {
    return await this.getElement("body");
  }

  async getRoot(): Promise<Locator> {
    return await this.getContainer().locator(this.getRootSelector());
  }

  protected capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  protected replaceSelectorParameter(
    locator: string,
    replaceWith: string,
    replaceChar: string
  ): string {
    if (replaceWith) {
      return locator.replace(new RegExp(replaceChar, "g"), replaceWith);
    } else {
      return locator;
    }
  }

  async navigate(url?: string) {
    return await this.page.goto(url);
  }

  async waitUntilElementDoesNotExist(locator: Locator) {
    await expect(locator).toHaveCount(0);
  }

  async waitUntilElementIsNotVisible(locator: Locator) {
    await expect(locator).not.toBeVisible();
  }

  async waitUntilElementIsVisible(locator: Locator) {
    await expect(locator).toBeVisible();
  }

  async acceptDialog() {
    this.page.on("dialog", async (dialog) => {
      console.info(`Accepting dialog with message "${dialog.message()}"`);
      await dialog.accept();
    });
  }

  async dismissDialog() {
    this.page.on("dialog", async (dialog) => {
      console.info(`Dismissing dialog with message "${dialog.message()}"`);
      await dialog.dismiss();
    });
  }
}
