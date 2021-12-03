import {
  ReduxAction,
  ReflowReduxActionTypes,
} from "constants/ReduxActionConstants";
import { ReflowedSpaceMap } from "reflow/reflowTypes";

export const reflowMove = (
  payload: ReflowedSpaceMap,
): ReduxAction<ReflowedSpaceMap> => {
  return {
    type: ReflowReduxActionTypes.REFLOW_MOVE,
    payload: payload,
  };
};

export const stopReflow = () => {
  return {
    type: ReflowReduxActionTypes.STOP_REFLOW,
  };
};

export const setShouldResize = (payload: boolean) => {
  return {
    type: ReflowReduxActionTypes.RESIZE_RESIZING,
    payload,
  };
};
