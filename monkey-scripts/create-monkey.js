/* eslint-disable no-useless-escape */
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const outputScriptName = "tampermonkey-script.js";
const currentDirectory = process.cwd();

async function removeFile(fileName) {
  return await new Promise((resolve, reject) => {
    fs.unlink(fileName, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function getFile(fileName) {
  return await new Promise((resolve, reject) => {
    const filePath = path.join(currentDirectory, fileName);
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        reject({ message: "Error reading file:", err });
        return;
      }
      resolve(data);
    });
  });
}

async function writeFile(filePath, data) {
  return await new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (err) => {
      if (err) {
        console.error("Error writing to file:", err);
        reject({ message: "Error writing to file:", err });
      } else {
        console.log("Data written to file successfully:", filePath);
        resolve();
      }
    });
  });
}

async function main() {
  const baseUrl = process.env.REACT_APP_SOURCE_URL;
  const domain = new URL(baseUrl).hostname;

  const html = await getFile("build/index.html");
  let [, js] = html.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  js = js.replace(
    /\/\*\! For license information please see main\.[\w]+\.js\.LICENSE\.txt \*\//,
    ""
  );

  const [, css] = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);

  const template = await getFile("monkey-scripts/tamper-template.js");

  const dateString = `${new Date().toLocaleString("ro-RO", {
    timeZone: "Europe/Bucharest",
  })}`;

  const script = template
    .replace("@@@_ENV_@@@", () => domain)
    .replace("@@@_CSS_@@@", () => css)
    .replace(/\/\/\s@@@_JS_\@\@\@/, () => js)
    .replace("@@@_DATE_@@@", () => dateString);
  await writeFile(`build/${outputScriptName}`, script);

  await removeFile("build/index.html");
}

main();
