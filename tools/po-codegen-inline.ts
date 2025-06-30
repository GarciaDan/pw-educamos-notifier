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

// Generates the base code for a given PageObject based on the classname
// and the selectors map
import fs from "fs";
import path from "path";

const outputDirectory = path.join(process.cwd(), "lib", "page-objects", "pages");

const className = "TestPageObject";
const selectors = {
    "user": "body",
    "password": "input",
    "loginButton": "submit",
    "inputByIndex": "input:nth-of-type(#)",
    "inputByText": "input:has-text('#')"
}

let result = `
import { Locator, Page } from "playwright/test";
import PageObject from "base/page-object";

export default class ${className} extends PageObject {
  static defaultSelectors(): Map<string, string> {
    const selectors = new Map<string, string>();

`;

const selectorsMap = new Map();

function isParameterizableKey(key: string): boolean {
  return (
    key.toLowerCase().endsWith("byindex") ||
    key.toLowerCase().endsWith("bytext")
  );
}

function thereAreParameterizableKeys(keysArray: string[]): boolean {
  return keysArray.some(
    (str) =>
      str.toLowerCase().endsWith("byindex") ||
      str.toLowerCase().endsWith("bytext")
  );
}

function isClickable(key: string): boolean {
    const clickableKeywords = ["button", "link"];
    const trimmedKey = key.toLocaleLowerCase().replace("byindex", "").replace("bytext", "");
    return clickableKeywords.some(keyword => trimmedKey.endsWith(keyword));
}

function capitalizeFirstLetter(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

Object.keys(selectors).forEach((key) => {
  selectorsMap.set(key, selectors[key]);
  result += `    selectors.set("${key}", "${selectors[key]}");\n`;
});

result += `
    return selectors;
  }

  constructor(page: Page, selectors?: Map<string, string>, url?: string) {
    super(page, selectors || ${className}.defaultSelectors(), url || "");
  }`;

const keys = Array.from(selectorsMap.keys());

result += "\n\n  //#region Locators\n\n";
for (let key of keys) {
  if (!isParameterizableKey(key)) {
    result += `  async get${capitalizeFirstLetter(key)}(): Promise<Locator> {
    return await this.getElement("${key}");
  }

`;
  }
}

result += "  //#endregion\n\n  //#region Interactions\n\n";

for (let key of keys) {
    if ((!isParameterizableKey(key)) && isClickable(key)) {
    result += `  async click${capitalizeFirstLetter(key)}(): Promise<void> {
    return await this.click("${key}");
  }

`;
  }
}

result += "  //#endregion\n";

if (thereAreParameterizableKeys(keys)) {
  result += "\n  //#region Parameterized Locators\n\n";

  for (let key of keys) {
    if (key.toLowerCase().endsWith("byindex")) {
      result +=
        `  async get${capitalizeFirstLetter(
          key
        )}(index: number): Promise<Locator> {
    return await this.getElement("${key}", ` +
        "`${index+1}`" +
        `);
  }

`;
    }
  }

  for (let key of keys) {
    if (key.toLowerCase().endsWith("bytext")) {
      result += `  async get${capitalizeFirstLetter(
        key
      )}(text: string): Promise<Locator> {
    return await this.getElement("${key}", text);
  }
    
`;
    }
  }

  result += "  //#endregion\n";
  result += "\n  //#region Parameterized Interactions\n\n";

  for (let key of keys) {
    if ((key.toLowerCase().includes("byindex")) && isClickable(key)) {
      result += `  async click${capitalizeFirstLetter(
        key
      )}(index: number): Promise<void> {
    const element = await this.get${capitalizeFirstLetter(key)}(index);
    return await element.click();
  }

`;
    }
  }

  for (let key of keys) {
    if ((key.toLowerCase().includes("bytext") && isClickable(key))) {
      result += `  async click${capitalizeFirstLetter(
        key
      )}(text: string): Promise<void> {
    const element = await this.get${capitalizeFirstLetter(key)}(text);
    return await element.click();
  }

`;
    }
  }
  result += "  //#endregion\n";
}

result += "}";

console.log(result);
const outputFile = path.join(
  outputDirectory,
  className.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() + ".ts"
);
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}

console.log(`Saving result to ${outputFile}...`);
fs.writeFile(outputFile, result, { encoding: "utf8" }, (err) => {
  if (err) {
    console.error(err);
  }
});
