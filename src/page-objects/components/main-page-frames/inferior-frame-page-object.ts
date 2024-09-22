/*
  InferiorFramePageObject
    └── PrincipalFramePageObject
         ├──CuerpoFramePageObject
         └──BotoneraTituloFramePageObject
*/
import { Page } from "playwright/test";
import PrincipalFramePageObject from "./principal-frame-page-object";
import PageObject from "base/page-object";

export default class InferiorFramePageObject extends PageObject {
  principal: PrincipalFramePageObject;

  static defaultSelectors(): Map<string, string> {
    const selectors = new Map<string, string>();

    selectors.set("frame", "[name='inferior']");

    return selectors;
  }

  constructor(
    page: Page,
    parent?: PageObject,
    selectors?: Map<string, string>
  ) {
    super(
      page,
      selectors || InferiorFramePageObject.defaultSelectors(),
      parent
    );
    this.principal = new PrincipalFramePageObject(page, this);
  }
}
