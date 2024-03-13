import axios from "axios";
import dompurify from "dompurify";

class IsolatedAppGenericError {
  isAppGenericError = true;
  message: string;
  originalError: unknown;
  constructor(_message: string, _originalError: unknown = null) {
    this.message = _message;
    this.originalError = _originalError;
  }
}
type NewLineConfig = {
  p: number;
  div: number;
  h: number;
};

export const parseHtml = (html: string): HTMLElement => {
  const [bodyHtmlOriginal] = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i) ?? [
    "",
  ];

  const sanitisedHtml = dompurify.sanitize(
    bodyHtmlOriginal
      .replaceAll(/<picture[^>]*>([\s\S]*?)<\/picture>/gi, "")
      .replaceAll(/<figure[^>]*>([\s\S]*?)<\/figure>/gi, "")
      .replaceAll(/<video[^>]*>([\s\S]*?)<\/video>/gi, "")
      .replaceAll(/<img[^>]*>([\s\S]*?)<\/img>/gi, "")
      .replaceAll(/<svg[^>]*>([\s\S]*?)<\/svg>/gi, "")
      .replaceAll(/<button[^>]*>([\s\S]*?)<\/button>/gi, "")
      .replaceAll(/<br\/>[\s\n]*<\/div>/g, "\n\n</div>")
      .replaceAll("<br/>", "\n")
  );

  const body = document.createElement("BODY");
  body.innerHTML = sanitisedHtml;
  Array.prototype.forEach.call(body.querySelectorAll("style"), function (node) {
    node?.parentNode?.removeChild(node);
  });
  return body;
};

export const getPostParseElement = (
  el: HTMLElement,
  options: NewLineConfig = {
    p: 1,
    div: 1,
    h: 1,
  }
): HTMLElement => {
  let innerHtml = el.innerHTML;
  while (/[\s]*<div[^>]*><\/div>[\s]*/.test(innerHtml)) {
    innerHtml = innerHtml.replaceAll(/[\s]*<div[^>]*><\/div>[\s]*/gi, "");
  }

  const newLines = {
    p: `${Array.from({ length: options.p }).fill("\n").join("")}$&`,
    div: `${Array.from({ length: options.div }).fill("\n").join("")}$&`,
    h: `${Array.from({ length: options.h }).fill("\n").join("")}$&`,
  };
  el.innerHTML = innerHtml
    .replaceAll(/<div[^>]*><\/div>/gi, "")
    .replaceAll(/\n\n\n/g, "\n\n")
    .replaceAll(/(<\/div>)+/gi, newLines.div)
    .replaceAll(/(<\/p>)+/gi, newLines.p)
    .replaceAll(/(<\/h[\d]>)+/gi, newLines.h);
  return el;
};

export const parseTitle = (html: string) => {
  const [, name] = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ?? ["", ""];
  return name;
};
//Ex: https://www.dw.com/ru/cto-delat-tem-kto-rodilsa-29-fevrala-opyt-germanii/a-68405660
export const dwArticleSource = {
  name: "DW",
  img: "https://www.dw.com/images/icons/favicon-32x32.png",
  regex: () => /^https:\/\/www\.dw\.com\/ru\/[\w\-_]+\/a-[\d]+\/?$/i,
  parse: async (html: string) => {
    const article = parseHtml(html).querySelector("article") as HTMLElement;
    if (!article)
      throw new IsolatedAppGenericError("Something went wrong with parsing.");

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

// Ex: https://genius.com/Husky-stupid-bullet-lyrics
export const geniousSongSource = {
  name: "Genius Song",
  img: "https://assets.genius.com/images/apple-touch-icon.png?1709224724",
  regex: () => /^https:\/\/genius\.com\/[\w-_]+$/,
  parse: async (html: string) => {
    const body = parseHtml(html);
    const children = body.querySelectorAll(
      `body [data-lyrics-container="true"]`
    );
    body.innerHTML = "";
    Array.prototype.forEach.call(children, function (node: HTMLElement) {
      body.append(node);
    });
    return {
      name: parseTitle(html),
      content: getPostParseElement(body).textContent ?? "empty",
    };
  },
};

//Ex: https://genius.com/albums/Monetochka/Adult-coloring-books
export const geniousAlbumSource = {
  name: "Genius Album",
  img: "https://assets.genius.com/images/apple-touch-icon.png?1709224724",
  regex: () => /^https:\/\/genius\.com\/albums\/([\w-_]+)\/([\w-_]+)$/,
  parse: async (albumPageHtml: string) => {
    const getSongLinks = (): string[] => {
      const children = parseHtml(albumPageHtml).querySelectorAll(
        `.chart_row-content a[href^="https://genius.com/"]`
      );
      const urls = Array.prototype.map.call(
        children,
        function (node: HTMLAnchorElement) {
          return `${node.href}`;
        }
      ) as string[];

      return urls
        .filter((u) => geniousSongSource.regex().test(u))
        .filter((value, index, self) => self.indexOf(value) === index);
    };

    const album = parseTitle(albumPageHtml);
    const songUrls = await getSongLinks();
    let content = `${album}`;
    let index = 0;
    for (const url of songUrls) {
      const { data: html } = await axios.get<string>(url, {
        headers: {
          "Content-Type": "text/html",
        },
      });
      const { content: songContent } = await geniousSongSource.parse(html);
      content += `\n\n\n========= [${++index}] =========\n\n${songContent}`;
    }

    return { name: `Album: ${album}`, content };
  },
};

//Ex: https://lenta.ru/news/2024/03/06/v-odesse-proizoshla-seriya-vzryvov/
//Ex: https://lenta.ru/articles/2024/03/05/simonova/
export const lentaArticleSource = {
  name: "Lenta",
  img: "https://icdn.lenta.ru/images/icons/icon-256x256.png",
  regex: () =>
    /^https:\/\/lenta\.ru\/(articles|news|brief)\/\d{4}\/\d{2}\/\d{2}\/[\w\-_]+\/?$/i,
  parse: async (html: string) => {
    const article = parseHtml(html).querySelector(
      `.topic-page__container`
    ) as HTMLElement;
    if (!article)
      throw new IsolatedAppGenericError("Something went wrong with parsing.");

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

//Ex: https://meduza.io/feature/2024/03/05/vsu-pytayutsya-sderzhat-nastuplenie-voysk-rf-v-donetskoy-oblasti-po-rossiyskim-gorodam-ezdit-agitpoezd-sila-v-pravde
//Ex: https://meduza.io/news/2024/03/05/institut-razvitiya-interneta-eto-on-razdaet-dengi-na-patrioticheskiy-kontent-zapustit-sobstvennyy-telekanal-my
export const meduzaArticleSource = {
  name: "Meduza",
  img: "https://meduza.io/favicon-32x32.png",
  regex: () =>
    /^https:\/\/meduza\.io\/(feature|news)\/\d{4}\/\d{2}\/\d{2}\/[\w\-_]+\/?$/i,
  parse: async (html: string) => {
    const article = parseHtml(html).querySelector(
      `.GeneralMaterial-module-root`
    ) as HTMLElement;
    if (!article)
      throw new IsolatedAppGenericError("Something went wrong with parsing.");

    const removeFooter = () => {
      const articleFooter = article?.querySelector(`[data-testid="toolbar"]`);
      articleFooter?.parentNode?.removeChild(articleFooter);
    };
    const adjustArticleTitle = () => {
      const header =
        article.querySelector(
          `.GeneralMaterial-module-head [data-testid="rich-title"]`
        ) ??
        article.querySelector(
          `.GeneralMaterial-module-head [data-testid="simple-title"]`
        );
      const headerContainer = article?.querySelector(
        `.GeneralMaterial-module-head`
      );
      if (header && headerContainer) {
        headerContainer.innerHTML = header.textContent ?? "Empty title";
      }
    };
    const removeRelatedItems = () => {
      Array.prototype.forEach.call(
        article?.querySelectorAll(`[data-testid="related-rich-block"]`),
        function (node) {
          node?.parentNode?.removeChild(node);
        }
      );
    };
    const removeSeparators = () => {
      article.innerHTML = article.innerHTML.replaceAll(
        /<div[^>]*><\/div>/g,
        ""
      );
    };
    removeFooter();
    adjustArticleTitle();
    removeRelatedItems();
    removeSeparators();

    return {
      name: parseTitle(html),
      content:
        getPostParseElement(article, {
          p: 2,
          div: 1,
          h: 1,
        }).textContent ?? "empty",
    };
  },
};

//Ex: https://ura.news/news/1052740762
//Ex: https://ura.news/articles/1036288437
export const uraArticleSource = {
  name: "URA.RU",
  img: "https://s.ura.news/favicon.ico?3",
  regex: () => /^https:\/\/ura\.news\/(news|articles)\/[\d]+\/?$/i,
  parse: async (html: string) => {
    const articleContainer = parseHtml(html).querySelector(
      `.vc-publication-center`
    ) as HTMLElement;

    const articleTitle = articleContainer.querySelector(".publication-title");
    const article = articleContainer.querySelector(`.item-text`) as HTMLElement;
    articleTitle && article.prepend(articleTitle);

    if (!article)
      throw new IsolatedAppGenericError("Something went wrong with parsing.");

    [
      ...(Array.prototype.map.call(
        article.querySelectorAll(`.yandex-rss-hidden`),
        function (n) {
          return n as HTMLElement;
        }
      ) as HTMLElement[]),
    ].forEach((node) => {
      node?.parentNode?.removeChild(node);
    });
    return {
      name: parseTitle(html),
      content: getPostParseElement(article).textContent ?? "empty",
    };
  },
};

export const allowedSources = [
  geniousSongSource,
  geniousAlbumSource,
  meduzaArticleSource,
  lentaArticleSource,
  uraArticleSource,
  dwArticleSource,
];
