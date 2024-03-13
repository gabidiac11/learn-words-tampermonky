import { useWordFunctions } from "../../core/useWordFunctions";
import { RocketLaunch } from "@mui/icons-material";
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

export const AddRecordUrlPage = () => {
  const { displayError } = useUIFeedback();
  const { addRecord } = useWordFunctions();

  const [urlValue] = useState(window.location.href.replace(window.location.search, ""));
  // const [urlValue] = useState(`https://lenta.ru/articles/2024/03/13/donoryspermi/`);
  const [desktopUrl, setDesktopUrl] = useState("");
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
    async (name: string, content: string, source: string) => {
      try {
        const record = await addRecord(name, content, source);
        window.open(`${webAppUrl}/records/${record.id}`, '_blank');
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

    onGenerate(name, content, desktopUrl);
  }, [
    name,
    content,
    urlFetched,
    urlValue,
    onGenerate,
    desktopUrl,
    displayError,
  ]);

  const onFetchUrlContent = useCallback(
    async (url: string) => {
      setIsFetching(true);
      try {
        const { name, content, url: desktopUrl } = await fetchUrlContent(url);
        setDesktopUrl(desktopUrl);
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
              startIcon={<RocketLaunch />}
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
                readOnly
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
