import * as React from 'react';
import { Fragment, FunctionComponent, useEffect, useMemo, SyntheticEvent, useState, useRef } from 'react';
import { useCachedItem, useContainerSize, useHelpers, useMetadata, useScrollbarSize, useSections } from '../../hooks';
import { ItemType, ScrollDirection } from '../../hooks/useHelpers';

import styles from './WindowTable.module.scss';

type ScrollEvent = SyntheticEvent<HTMLDivElement>;

type WindowTableProps = {
  scrollTop?: number;
  scrollLeft?: number;
  width?: number;
  height?: number;
  columnCount: number;
  columnWidth: number | Function;
  rowCount: number;
  rowHeight: number | Function;

  fixedTopCount?: number;
  fixedLeftCount?: number;
  fixedRightCount?: number;
  fixedBottomCount?: number;
  overscanCount?: number;

  // maxScrollY?: number
  // maxScrollX?: number

  // cellStyle?: string;

  // columns: array

  // containerStyle?: string;
  // contentHeight: number;
  // contentWidth: number;
  // guidelineStyle?: Function;
};

const WindowTable: FunctionComponent<WindowTableProps> = (props) => {
  const [{ scrollTop, scrollLeft, verticalScrollDirection, horizontalScrollDirection }, setScroll] = useState({
    scrollTop: 0,
    scrollLeft: 0,
    verticalScrollDirection: ScrollDirection.FORWARD,
    horizontalScrollDirection: ScrollDirection.FORWARD,
  });
  const handleScroll = (event: ScrollEvent) => {
    const { scrollTop: nextScrollTop, scrollLeft: nextScrollLeft } = event.currentTarget;
    setScroll({
      scrollTop: nextScrollTop,
      scrollLeft: nextScrollLeft,
      verticalScrollDirection: scrollTop > nextScrollTop ? ScrollDirection.BACKWARD : ScrollDirection.FORWARD,
      horizontalScrollDirection: scrollLeft > nextScrollLeft ? ScrollDirection.BACKWARD : ScrollDirection.FORWARD,
    });
  };

  const container = useRef<HTMLDivElement>(null);
  const [width, height] = useContainerSize(props, container);

  const [scrollbarWidth, scrollbarHeight] = useScrollbarSize();
  const { columnCount, columnWidth, rowCount, rowHeight } = props;
  let { fixedTopCount = 0, fixedBottomCount = 0, fixedLeftCount = 0, fixedRightCount = 0 } = props;

  const helpers = useHelpers({
    columnCount,
    columnWidth,
    rowCount,
    rowHeight,
    fixedTopCount,
    fixedBottomCount,
    fixedLeftCount,
    fixedRightCount,
    width,
    height,
    scrollbarWidth,
    scrollbarHeight,
    overscanCount: props.overscanCount,
  });

  const { columnMetadata, rowMetadata, totalWidth, totalHeight, contentWidth, contentHeight } = helpers;

  const { getItemMetadata, getRange } = helpers;

  const [rowStartIndex, rowStopIndex] = getRange(ItemType.ROW, scrollTop, verticalScrollDirection);
  const [columnStartIndex, columnStopIndex] = getRange(ItemType.COLUMN, scrollLeft, horizontalScrollDirection);

  const getCachedStyle = useCachedItem({
    getItemMetadata,
    columnCount,
    columnWidth,
    rowCount,
    rowHeight,
    children: props.children,
  });

  const { center, sections } = useSections(
    rowMetadata,
    columnMetadata,
    rowStartIndex,
    rowStopIndex,
    columnStartIndex,
    columnStopIndex,
    contentWidth,
    contentHeight,
    getCachedStyle,
  );

  return (
    <div ref={container} className={styles.container} style={{ height }}>
      <div style={{ width, height }} className={styles.root} onScroll={handleScroll}>
        <div style={{ width: totalWidth, height: totalHeight }}>
          {sections.map((section) => (
            <div key={section.key} className={section.className} style={section.style}>
              {section.items}
            </div>
          ))}
          <div className={styles.center}>{center.items}</div>
        </div>
      </div>
      {/* <h4>
        {horizontalScrollDirection}, {verticalScrollDirection},{scrollLeft}, {scrollTop}, {contentWidth},{' '}
        {contentHeight}
      </h4> */}
    </div>
  );
};

export default WindowTable;
