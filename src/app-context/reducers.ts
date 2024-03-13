import initialState from "./initialState";
import { State, StateAction, StateActionType } from "./types";

export const mainReducer = (state: State, action: StateAction): State => {
  switch (action.type) {
    case StateActionType.Init:
      return JSON.parse(JSON.stringify(initialState));
    case StateActionType.PushSnack:
      return {
        ...state,
        snack: action.payload,
      };
    case StateActionType.RemoveSnack:
      return {
        ...state,
        snack: null,
      };
    default:
      return state;
  }
};
