/*
    PrincipalFramePageObject
      ├──CuerpoFramePageObject
      └──BotoneraTituloFramePageObject
*/
import { Page } from "playwright/test";
import CuerpoFramePageObject from "./cuerpo-frame-page-object";
import BotoneraTituloFramePageObject from "./botonera-titulo-frame-page-object";
import PageObject from "base/page-object";

export default class PrincipalFramePageObject extends PageObject {
  cuerpo: CuerpoFramePageObject;
  botonera: BotoneraTituloFramePageObject;

  static defaultSelectors(): Map<string, string> {
    const selectors = new Map<string, string>();

    selectors.set("frame", "[name='principal']");

    return selectors;
  }

  constructor(
    page: Page,
    parent?: PageObject,
    selectors?: Map<string, string>
  ) {
    super(
      page,
      selectors || PrincipalFramePageObject.defaultSelectors(),
      parent
    );
    this.cuerpo = new CuerpoFramePageObject(page, this);
    this.botonera = new BotoneraTituloFramePageObject(page, this);
  }
}
