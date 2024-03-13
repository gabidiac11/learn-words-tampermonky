export type Snack = {
  key: string;
  message: string;
  autoHideDuration?: number;
  transitionDuration?: number;
  severity: "error" | "success" | "info" | "warning";
  onClose?: () => void;
};

export type State = {
  snack: Snack | null;
};

export enum StateActionType {
  Init = "Init",
  PushSnack = "PushSnack",
  RemoveSnack = "RemoveSnack",
}

export type StateAction =
  | {
      type: StateActionType.Init;
    }
  | {
      type: StateActionType.PushSnack;
      payload: Snack;
    }
  | {
      type: StateActionType.RemoveSnack;
      payload: {
        key: string;
      };
    };;
