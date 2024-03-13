require("dotenv").config();
const fs = require("fs");
const path = require("path");

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

  const html = await getFile("build/index.html");
  const [, scriptPath] = html.match(
    /src="\.\/(static\/js\/main\.[\w\d]+\.js)"><\/script>/
  );
  const scriptUrl = `${baseUrl}/${scriptPath}`;

  const [, stylePath] = html.match(
    /<link href="\.\/(static\/css\/main\.[\w\d]+\.css)"/
  );
  const styleUrl = `${baseUrl}/${stylePath}`;

  const template = await getFile("scripts/tamper-template");
  const script = template
    .replace(
      "@@@@@@@@@@@@@@@@@@@@_BUNDLE_CSS_SRC_@@@@@@@@@@@@@@@@@@@@",
      styleUrl
    )
    .replace(
      "@@@@@@@@@@@@@@@@@@@@_BUNDLE_JS_SRC_@@@@@@@@@@@@@@@@@@@@",
      scriptUrl
    );
  await writeFile("build/tampermonkey-script.js", script);

  await removeFile("build/index.html");
}

main();
