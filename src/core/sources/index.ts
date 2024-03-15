import { dwArticleSource } from "./dw";
import { geniousSongSource, geniousAlbumSource } from "./genius";
import { lentaArticleSource } from "./lenta";
import { meduzaArticleSource } from "./meduzas";
import { uraArticleSource } from "./ura";

export const allowedSources = [
  geniousSongSource,
  geniousAlbumSource,
  meduzaArticleSource,
  lentaArticleSource,
  uraArticleSource,
  dwArticleSource,
];

export const loadScripts = () => {
  if (window.location.hostname === "localhost") {
    return true;
  }
  const url = window.location.href
    .replace(window.location.search, "")
    .replace("https://m.", "https://");
  return Object.values(allowedSources).some((f) => f.regex().test(url));
};
