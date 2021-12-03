import { reflowMove, stopReflow } from "actions/reflowActions";
import { OccupiedSpace } from "constants/editorConstants";
import { isEmpty } from "lodash";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOccupiedSpacesSelectorForContainer } from "selectors/editorSelectors";
import { getShouldResize } from "selectors/widgetReflowSelectors";
import { reflow } from "reflow";
import {
  CollidingSpaceMap,
  GridProps,
  ReflowDirection,
  ReflowedSpaceMap,
} from "reflow/reflowTypes";
import { getLimitedMovementMap } from "reflow/reflowUtils";

export const useReflow = (
  widgetId: string,
  parentId: string,
  gridProps: GridProps,
) => {
  const dispatch = useDispatch();

  const isReflowing = useRef<boolean>(false);

  const shouldResize = useSelector(getShouldResize);
  const occupiedSpacesSelector = getOccupiedSpacesSelectorForContainer(
    parentId,
  );
  const occupiedSpaces: OccupiedSpace[] =
    useSelector(occupiedSpacesSelector) || [];

  const originalSpacePosition = occupiedSpaces?.find(
    (space) => space.id === widgetId,
  );

  const prevPositions = useRef(originalSpacePosition);
  const prevCollidingSpaces = useRef<CollidingSpaceMap>();
  const prevMovementMap = useRef<ReflowedSpaceMap>({});

  return function reflowSpaces(
    newPositions: OccupiedSpace,
    OGPositions: OccupiedSpace,
    direction: ReflowDirection,
    stopMoveAfterLimit = false,
  ) {
    const { collidingSpaceMap, movementLimit, movementMap } = reflow(
      newPositions,
      OGPositions,
      occupiedSpaces,
      direction,
      gridProps,
      shouldResize,
      prevPositions.current,
      prevCollidingSpaces.current,
    );

    prevPositions.current = newPositions;
    prevCollidingSpaces.current = collidingSpaceMap;

    const shouldReflow = !isEmpty(movementMap);

    let correctedMovementMap = movementMap || {};

    if (stopMoveAfterLimit)
      correctedMovementMap = getLimitedMovementMap(
        movementMap,
        prevMovementMap.current,
        movementLimit,
      );

    prevMovementMap.current = correctedMovementMap;

    if (shouldReflow) {
      isReflowing.current = true;
      dispatch(reflowMove(correctedMovementMap));
    } else if (isReflowing.current) {
      isReflowing.current = false;
      dispatch(stopReflow());
    }

    return {
      ...movementLimit,
      movementMap: correctedMovementMap,
    };
  };
};
