import { dwArticleSource } from "./dw";
import { geniousSongSource, geniousAlbumSource } from "./genius";
import { lentaArticleSource } from "./lenta";
import { meduzaArticleSource } from "./meduzas";
import { Source } from "./parseUtils";
import { uraArticleSource } from "./ura";

export const allowedSources: Source[] = [
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
    .replace(window.location.search, "");
  return Object.values(allowedSources).some((f) => f.regex().test(url));
};
