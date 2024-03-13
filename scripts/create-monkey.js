// const fs = require("fs");
// const path = require("path");

// async function getFile(dir, ext) {
//   return await new Promise((resolve, reject) => {
//     fs.readdir(dir, (err, files) => {
//       if (err) {
//         console.error("Error reading directory:", err);
//         reject({ message: "Error reading directory", err });
//         return;
//       }

//       const jsFiles = files.filter((file) => file.endsWith(ext));
//       if (jsFiles.length === 0) {
//         reject({ message: "No JavaScript files found in directory:", dir });
//         return;
//       }

//       const filePath = path.join(dir, jsFiles[0]);
//       fs.readFile(filePath, "utf8", (err, data) => {
//         if (err) {
//           console.error("Error reading file:", err);
//           reject({ message: "Error reading file:", err });
//           return;
//         }
//         resolve(data);
//       });
//     });
//   });
// }

// async function main() {
// }

// main();
