import * as React from 'react';
import { Fragment, FunctionComponent, useEffect, useMemo, SyntheticEvent, useState, useRef } from 'react';
import { css } from 'emotion';
import { useCachedItem, useGuidelines, useHelpers, useOffsetSize, useScrollbarSize, useSections } from '../../hooks';
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

  fillerColumn?: 'none' | 'append' | 'stretch' | 'shrink';
  fillerRow?: 'none' | 'append' | 'stretch' | 'shrink';
  /** 스크롤되는 뷰포트 너비가 특정값 이하로 떨어지면 fixedColumn 이 무효화된다. */
  minVisibleScrollViewWidth: number;
  minVisibleScrollViewHeight: number;

  containerStyle?: any;

  // maxScrollY?: number
  // maxScrollX?: number

  // cellStyle?: string;

  // columns: array

  // containerStyle?: string;
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
  const container = useOffsetSize(props);

  console.log(container);

  const { offsetWidth, offsetHeight } = container;

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
    innerWidth: container.innerWidth,
    innerHeight: container.innerHeight,
    scrollbarWidth,
    scrollbarHeight,
    overscanCount: props.overscanCount,
    fillerColumn: props.fillerColumn,
    fillerRow: props.fillerRow,
    minVisibleScrollViewWidth: props.minVisibleScrollViewWidth,
    minVisibleScrollViewHeight: props.minVisibleScrollViewHeight,
  });

  const {
    columnMetadata,
    rowMetadata,
    scrollWidth,
    scrollHeight,
    clientWidth,
    clientHeight,
    innerWidth,
    innerHeight,
  } = helpers;

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
    clientWidth,
    clientHeight,
    getCachedStyle,
  );

  const guidelines = useGuidelines(rowMetadata, columnMetadata, clientWidth, clientHeight);

  // console.log(columnMetadata);

  return (
    <div ref={container.ref} className={container.className} style={{ width: container.offsetWidth }}>
      {/* <pre>
        {JSON.stringify({
          borderTopWidth,
          borderLeftWidth,
          borderRightWidth,
          borderBottomWidth,
        })}
      </pre> */}
      {/* <pre>
        {JSON.stringify({
          rowStartIndex,
          rowStopIndex,
          columnStartIndex,
          columnStopIndex,
        })}
      </pre>
      <pre>
        {JSON.stringify({
          fixedBottomCount,
          fixedRightCount
        })}
      </pre> */}
      {/* <div className={styles.guidelines} style={{ width: clientWidth, height: clientHeight }}>
        {guidelines.map((guideline) => {
          return <div className={guideline.className} style={guideline.style} />;
        })}
      </div> */}
      <div style={{ width: innerWidth, height: innerHeight }} className={styles.root} onScroll={handleScroll}>
        <div style={{ width: scrollWidth, height: scrollHeight }}>
          {sections.map((section) => (
            <div key={section.key} className={section.className} style={section.style}>
              {section.items}
            </div>
          ))}
          {/* {guidelines.map(guideline => {
        return (
          <div className={styles.guideline.className} style={guideline.style} />
        )
      })} */}
          <div className={styles.center}>{center.items}</div>
        </div>
      </div>

      {/* <h4>
        {horizontalScrollDirection}, {verticalScrollDirection},{scrollLeft}, {scrollTop}, {clientWidth},{' '}
        {clientHeight}
      </h4> */}
    </div>
  );
};

export default WindowTable;
