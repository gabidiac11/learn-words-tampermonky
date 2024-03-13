import { useCallback } from "react";
import { LearningRecord } from "../model.types";
import { AppGenericError } from "./types";
import { useDatabase } from "./useDatabase";
import { containsWords, generateRecordId } from "./wordHelpers";

export const useWordFunctions = () => {
  const { set } = useDatabase();

  const addRecord = useCallback(
    async (
      name: string,
      content: string,
      source?: string
    ): Promise<LearningRecord> => {
      if (!containsWords(content)) {
        throw new AppGenericError("Content should contain words.");
      }

      const timestamp = Date.now();
      const recordId = generateRecordId(name, timestamp);
      const record: LearningRecord = {
        id: recordId,
        name,
        content,
        timestamp,
        source,
      };

      const result = await set(`records/${recordId}`, record);
      result.throwIfError("Could not add record");

      return record;
    },
    [set]
  );

  return {
    addRecord,
  };
};
