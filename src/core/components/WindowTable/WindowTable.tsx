import * as React from 'react';
import { Fragment, FunctionComponent, useEffect, useMemo, SyntheticEvent, useState, useRef } from 'react';
import { css } from 'emotion';
import { useCachedItem, useGuidelines, useHelpers, useContainerInfo, useScrollbarSize, useSections } from '../../hooks';
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
  const containerInfo = useContainerInfo(props);

  // console.log(containerInfo);

  // const { offsetWidth, offsetHeight } = container;

  const [scrollbarWidth, scrollbarHeight] = useScrollbarSize();

  const { columnCount, columnWidth, rowCount, rowHeight } = props;

  const helpers = useHelpers({
    ...props,

    innerWidth: containerInfo.innerWidth,
    innerHeight: containerInfo.innerHeight,
    scrollbarWidth,
    scrollbarHeight,
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

  const scrollClassName = useMemo(() => {
    const classNames = [
      scrollTop === 0 && 'scroll-top',
      scrollLeft === 0 && 'scroll-left',
      scrollTop === scrollHeight - clientHeight && 'scroll-bottom',
      scrollLeft === scrollWidth - clientWidth && 'scroll-right',
    ]
      .filter((e) => e)
      .join(' ');
    return classNames;
  }, [scrollTop, scrollLeft, clientHeight, scrollHeight, clientWidth, scrollWidth]);

  // {"scrollTop":3417,"scrollLeft":0,"clientHeight":283,"scrollHeight":3700}

  // console.log(guidelines);

  // console.log(columnMetadata);

  return (
    <div
      ref={containerInfo.ref}
      className={containerInfo.className + ' ' + scrollClassName}
      style={{ width: containerInfo.offsetWidth }}
    >
      <pre>{JSON.stringify({ scrollTop, scrollLeft, clientHeight, scrollHeight })}</pre>
      <div style={{ width: innerWidth, height: innerHeight }} className={styles.root} onScroll={handleScroll}>
        <div style={{ width: scrollWidth, height: scrollHeight }}>
          {sections.map((section) => (
            <div key={section.key} className={section.className} style={section.style}>
              {section.items}
            </div>
          ))}

          <div className={styles.center}>{center.items}</div>
        </div>
      </div>
      <div className={styles.guidelines} style={{ width: clientWidth, height: clientHeight }}>
        {guidelines.map((guideline) => {
          return <div className={guideline.className} style={guideline.style} />;
        })}
      </div>
    </div>
  );
};

export default WindowTable;
