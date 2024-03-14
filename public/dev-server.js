const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {
  // Get the file path from the request URL
  const filePath = path.join(__dirname, req.url);

  // Read the file from the file system
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // If the file doesn't exist or there's an error reading it, return a 404 response
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("File not found");
    } else {
      // If the file exists, serve it with the appropriate MIME type
      const contentType = getContentType(filePath);
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
});

// Define a function to determine the MIME type of a file based on its extension
function getContentType(filePath) {
  const extname = path.extname(filePath);
  switch (extname) {
    case ".html":
      return "text/html";
    case ".css":
      return "text/css";
    case ".js":
      return "text/javascript";
    case ".png":
      return "image/png";
      
    case ".jpg":
      return "image/jpg";
    default:
      return "application/octet-stream";
  }
}

// Start the server on port 3000
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
