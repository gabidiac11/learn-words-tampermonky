import axios from "axios";
import { allowedSources } from "./sources";
import { AppGenericError } from "./types";
import { uuidv4 } from "@firebase/util";

// base regex: /[\p{L}_]+/ug
const regexes = {
  splitRegex: () => /[^\p{L}_]+/iu,
  classifiedRegex: () => /([^\p{L}_]+)|([\p{L}_]+)/giu,
  isNonWordRegex: () => /^[^\p{L}_]+$/u,
  containsWordRegex: () => /[\p{L}_]+/u,
};

export const generateRecordId = (name: string, timestamp: number) =>
  `${timestamp}-${name.slice(0, 20).replace(/[^\p{L}_]+/giu, "_")}-${uuidv4()}`;

export const containsWords = (content: string) =>
  regexes.containsWordRegex().test(content);

export const fetchUrlContent = async (
  url: string
): Promise<{ name: string; content: string; url: string }> => {
  if (!url) throw new AppGenericError("Empty url.");

  const source = allowedSources.find((f) => f.regex().test(url));
  if (!source) {
    throw new AppGenericError(`Url is not supported`);
  }

  const { data: html } = await axios.get<string>(url, {
    headers: {
      "Content-Type": "text/html",
    },
  });
  if (!html) {
    throw new AppGenericError(
      `Ups! Something went wrong. Could not fetch content.`
    );
  }
  return { ...(await source.parse(html, url)), url: url };
};
