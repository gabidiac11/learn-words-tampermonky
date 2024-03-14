// don't use typescript specific things here will be parsed when generating tampermonky script
export const urlRegexes = {
  geniousSongSource: /^https:\/\/genius\.com\/[\w-_]+$/,
  geniousAlbumSource: /^https:\/\/genius\.com\/albums\/([\w-_]+)\/([\w-_]+)$/,
  meduzaArticleSource:
    /^https:\/\/meduza\.io\/(feature|news)\/\d{4}\/\d{2}\/\d{2}\/[\w\-_]+\/?$/i,
  lentaArticleSource:
    /^https:\/\/lenta\.ru\/(articles|news|brief)\/\d{4}\/\d{2}\/\d{2}\/[\w\-_]+\/?$/i,
  uraArticleSource: /^https:\/\/ura\.news\/(news|articles)\/[\d]+\/?$/i,
  dwArticleSource: /^https:\/\/www\.dw\.com\/ru\/[\w\-_]+\/a-[\d]+\/?$/i,
};

export const loadScripts = () => {
  const url = window.location.href
    .replace(window.location.search, "")
    .replace("https://m.", "https://");
  return Object.values(urlRegexes).some((f) => f.test(url));
};
