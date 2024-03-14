import { urlRegexes }from "../../sourceUrlRegexes";
import { AppGenericError } from "../types";
import { parseHtml, parseTitle, getPostParseElement } from "./parseUtils";

//Ex: https://lenta.ru/news/2024/03/06/v-odesse-proizoshla-seriya-vzryvov/
//Ex: https://lenta.ru/articles/2024/03/05/simonova/
export const lentaArticleSource = {
  name: "Lenta",
  img: "https://icdn.lenta.ru/images/icons/icon-256x256.png",
  regex: () => urlRegexes.lentaArticleSource,
  parse: async (html: string) => {
    const article = parseHtml(html).querySelector(
      `.topic-page__container`
    ) as HTMLElement;
    if (!article)
      throw new AppGenericError("Something went wrong with parsing.");

    [`.topic-page__header`, `.topic-footer`].forEach((selector) => {
      const node = article.querySelector(selector);
      node?.parentNode?.removeChild(node);
    });

    return {
      name: parseTitle(html),
      content:
        getPostParseElement(article, {
          p: 2,
          div: 1,
          h: 2,
        }).textContent ?? "empty",
    };
  },
};
