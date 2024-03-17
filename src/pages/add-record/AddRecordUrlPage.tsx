import { useWordFunctions } from "../../core/useWordFunctions";
import { Textarea } from "@mui/joy";
import { Button as ButtonMat } from "@mui/material";
import { useState, useCallback, ChangeEvent } from "react";
import { useUIFeedback } from "../../app-context/useUIFeedback";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import { allowedSources } from "../../core/sources";
import { useRefState } from "../../hooks/useRefState";
import { fetchUrlContent } from "../../core/wordHelpers";

import "./AddRecord.scss";
import { webAppUrl } from "../../constants";

const getUrl = () => {
  if (window.location.hostname === "localhost") {
    return "https://lenta.ru/articles/2024/03/13/donoryspermi/";
  }
  return window.location.href.replace(window.location.search, "");
};

export const AddRecordUrlPage = () => {
  const { displayError } = useUIFeedback();
  const { addRecord } = useWordFunctions();
  const [readOnly] = useState(window.location.hostname !== "localhost");

  const [urlValue, setUrlValue] = useState(getUrl());
  const [urlFetched, setUrlFetched] = useState("");

  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const [errors, setErrors] = useState({
    name: false,
    content: false,
    url: false,
  });

  const [isFetching, setIsFetching] = useRefState(false);

  const onGenerate = useCallback(
    async (name: string, content: string, url: string) => {
      try {
        const record = await addRecord(name, content, url);
        window.open(`${webAppUrl}/records/${record.id}`, "_blank");
      } catch (error) {
        console.error(error);
        displayError(error);
      }
    },
    [addRecord, displayError]
  );

  const onChangeContent = useCallback(async (value: string) => {
    setErrors((p) => ({
      ...p,
      content: false,
    }));
    setContent(value);
  }, []);

  const onChangeName = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    setErrors((p) => ({
      ...p,
      name: false,
    }));
    setName(e.target.value);
  }, []);

  const onSubmit = useCallback(() => {
    setErrors({
      name: !name,
      content: !content,
      url: urlFetched !== urlValue || !urlValue,
    });

    if (!urlFetched) {
      displayError("You need to fetch the url.");
      return;
    }

    const errorMessages: string[] = [];
    if (!content) {
      errorMessages.push("Content is required.");
    }
    if (!name) {
      errorMessages.push("Name is required.");
    }
    if (urlFetched !== urlValue) {
      errorMessages.push(
        "Current url was not fetch: the cotennt might not match the source url."
      );
    }
    const errorMessage = errorMessages.join(" ");
    if (errorMessage) {
      displayError(errorMessage);
      return;
    }

    onGenerate(name, content, urlValue);
  }, [name, content, urlFetched, urlValue, onGenerate, displayError]);

  const onFetchUrlContent = useCallback(
    async (url: string) => {
      setIsFetching(true);
      try {
        const { name, content } = await fetchUrlContent(url);
        setUrlFetched(url);
        setName(name);
        setContent(content);
        setErrors({
          name: false,
          content: false,
          url: false,
        });
      } catch (error) {
        console.error(error);
        displayError(error);
      } finally {
        setIsFetching(false);
      }
    },
    [setIsFetching, displayError]
  );

  return (
    <div className="learn-words-app-view learn-words-app-page-wrapper learn-words-app-add-record-page learn-words-app-url-record-page">
      <div className="learn-words-app-view-content">
        <div className="url-page-form">
          <div className="mb-20">
            <ButtonMat
              className="pr-20"
              startIcon={
                <svg
                  className="rocket-svg"
                  focusable="false"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                >
                  <path d="M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89L2 10.69l4.05-4.05c.47-.47 1.15-.68 1.81-.55zM11.17 17s3.74-1.55 5.89-3.7c5.4-5.4 4.5-9.62 4.21-10.57-.95-.3-5.17-1.19-10.57 4.21C8.55 9.09 7 12.83 7 12.83zm6.48-2.19c-2.29 2.04-5.58 3.44-5.89 3.57L13.31 22l4.05-4.05c.47-.47.68-1.15.55-1.81zM9 18c0 .83-.34 1.58-.88 2.12C6.94 21.3 2 22 2 22s.7-4.94 1.88-6.12C4.42 15.34 5.17 15 6 15c1.66 0 3 1.34 3 3m4-9c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2"></path>
                </svg>
              }
              onClick={onSubmit}
            >
              Generate
            </ButtonMat>
          </div>

          <div className="mb-20 learn-words-app-page-input-container">
            <div className="mb-20">
              <div className="learn-words-app-txt">Sources</div>
              <List aria-labelledby="decorated-list-demo">
                {allowedSources.map((item, i) => (
                  <ListItem key={i}>
                    <ListItemDecorator>
                      <img width="20px" alt={item.name} src={item.img} />
                    </ListItemDecorator>{" "}
                    {item.name}
                  </ListItem>
                ))}
              </List>
            </div>
            <div className="mb-20 learn-words-app-page-input-container">
              <Input
                className="page-input"
                placeholder="Enter url"
                tabIndex={-1}
                variant="outlined"
                value={urlValue}
                error={errors.url}
                readOnly={readOnly}
                onChange={(e) => setUrlValue(e.target.value)}
                endDecorator={
                  <div className="flex">
                    <Button
                      onClick={() => onFetchUrlContent(urlValue)}
                      loading={isFetching}
                    >
                      Fetch
                    </Button>
                  </div>
                }
              />
            </div>
          </div>

          {content && (
            <div className="mb-20 learn-words-app-page-input-container">
              <Input
                className="page-input"
                error={errors.name}
                onChange={onChangeName}
                value={name}
                placeholder="Enter name"
              />
            </div>
          )}

          {content && (
            <div className="mb-20 learn-words-app-page-input-container">
              <Textarea
                className="mt-15"
                error={errors.content}
                aria-label="minimum height"
                value={content}
                onChange={(e) => onChangeContent(e.target.value)}
                minRows={5}
                placeholder="Fetched content"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
