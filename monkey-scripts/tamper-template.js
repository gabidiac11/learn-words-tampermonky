// ==UserScript==
// @name         Learn word @@@_ENV_@@@
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// @icon         https://learn-word-56d10.web.app/favicon.ico
// @grant        none
// ==/UserScript==

(() => {
  // Generated: @@@_DATE_@@@

  setTimeout(() => {
    const container = document.createElement("div");
    container.id = "learn-words-app-root";
    document.body.append(container);
    
    const style = document.createElement("style");
    style.textContent = `@@@_CSS_@@@`;
    document.body.append(style);

    // @@@_JS_@@@

  }, 2500);
})();


