import { urlRegexes }from "../../sourceUrlRegexes";
import { AppGenericError } from "../types";
import { parseHtml, parseTitle, getPostParseElement } from "./parseUtils";

//Ex: https://www.dw.com/ru/cto-delat-tem-kto-rodilsa-29-fevrala-opyt-germanii/a-68405660
export const dwArticleSource = {
  name: "DW",
  img: "https://www.dw.com/images/icons/favicon-32x32.png",
  regex: () => urlRegexes.dwArticleSource,
  parse: async (html: string) => {
    const article = parseHtml(html).querySelector("article") as HTMLElement;
    if (!article)
      throw new AppGenericError("Something went wrong with parsing.");

    [
      `[data-tracking-name="sharing-icons-inline"]`,
      ".advertisement",
      ".vjs-wrapper",
      "footer",
    ].forEach((selector) =>
      Array.prototype.forEach.call(
        article.querySelectorAll(selector),
        function (node) {
          node.parentNode?.removeChild(node);
        }
      )
    );

    return {
      name: parseTitle(html),
      content:
        getPostParseElement(article, {
          p: 0,
          div: 1,
          h: 0,
        }).textContent ?? "empty",
    };
  },
};
