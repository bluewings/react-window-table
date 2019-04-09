import * as React from 'react';
// import PropTypes from 'prop-types';
import { Fragment, FunctionComponent, useEffect, useMemo, SyntheticEvent, useState, useRef } from 'react';
import { css } from 'emotion';
import cx from 'classnames';
import { useCachedItem, useGuidelines, useHelpers, useContainerInfo, useScrollbarSize, useSections } from '../../hooks';
import { ItemType, ScrollDirection } from '../../hooks/useHelpers';

import styles from './WindowTableCore.module.scss';

type ScrollEvent = SyntheticEvent<HTMLDivElement>;

type WindowTableCoreProps = {
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
  guideline?: boolean;

  classNames?: ClassNames;

  // maxScrollY?: number
  // maxScrollX?: number

  // cellStyle?: string;

  // columns: array

  // containerStyle?: string;
  // guidelineStyle?: Function;
};

type ClassNames = {
  CELL?: string;

  COL_ODD?: string;
  COL_EVEN?: string;
  COL_FIRST?: string;
  COL_LAST?: string;

  ROW_ODD?: string;
  ROW_EVEN?: string;
  ROW_FIRST?: string;
  ROW_LAST?: string;

  SECTION?: string;
  SECTION_TOP?: string;
  SECTION_LEFT?: string;
  SECTION_RIGHT?: string;
  SECTION_BOTTOM?: string;
  SECTION_CENTER?: string;

  GUIDELINE?: string;
  GUIDELINE_TOP?: string;
  GUIDELINE_LEFT?: string;
  GUIDELINE_RIGHT?: string;
  GUIDELINE_BOTTOM?: string;
};

// const IS_SCROLLING_DEBOUNCE_INTERVAL = 150;
const IS_SCROLLING_DEBOUNCE_INTERVAL = 150;

const CLASSNAMES = {
  CELL: 'cell',

  COL_ODD: 'col-odd',
  COL_EVEN: 'col-even',
  COL_FIRST: 'col-first',
  COL_LAST: 'col-last',

  // ROW_ODD: 'row-odd',
  ROW_ODD: 'row-odd',
  ROW_EVEN: 'row-even',
  ROW_FIRST: 'row-first',
  ROW_LAST: 'row-last',

  SECTION: 'section',
  SECTION_TOP: 'section-top',
  SECTION_LEFT: 'section-left',
  SECTION_RIGHT: 'section-right',
  SECTION_BOTTOM: 'section-bottom',
  SECTION_CENTER: 'section-center',

  GUIDELINE: 'guideline',
  GUIDELINE_TOP: 'guideline-top',
  GUIDELINE_LEFT: 'guideline-left',
  GUIDELINE_RIGHT: 'guideline-right',
  GUIDELINE_BOTTOM: 'guideline-bottom',

  SCROLL_TOP: 'scroll-top',
  SCROLL_LEFT: 'scroll-left',
  SCROLL_RIGHT: 'scroll-right',
  SCROLL_BOTTOM: 'scroll-bottom',
  // SECTION_TOP: 'section-top',
  // ROW_EVEN: '',
};

function useClassNames(classNames) {
  const hash = useMemo(() => {
    return JSON.stringify(classNames);
  }, [classNames]);

  return useMemo(() => {
    return Object.keys(classNames || {}).reduce(
      (accum, key) => {
        return {
          ...accum,
          [key]: classNames[key],
        };
      },
      { ...CLASSNAMES },
    );
    // return JSON.stringify(classNames);
  }, [hash]);
}

const WindowTableCore: FunctionComponent<WindowTableCoreProps> = (props) => {
  const [
    { isScrolling, scrollTop, scrollLeft, verticalScrollDirection, horizontalScrollDirection },
    setScroll,
  ] = useState({
    isScrolling: false,
    scrollTop: 0,
    scrollLeft: 0,
    verticalScrollDirection: ScrollDirection.FORWARD,
    horizontalScrollDirection: ScrollDirection.FORWARD,
  });

  const timeoutID = useRef<NodeJS.Timeout>();
  const handleScroll = (event: ScrollEvent) => {
    timeoutID.current && clearTimeout(timeoutID.current);
    const { scrollTop: nextScrollTop, scrollLeft: nextScrollLeft } = event.currentTarget;
    const scroll = {
      isScrolling: true,
      scrollTop: nextScrollTop,
      scrollLeft: nextScrollLeft,
      verticalScrollDirection: scrollTop > nextScrollTop ? ScrollDirection.BACKWARD : ScrollDirection.FORWARD,
      horizontalScrollDirection: scrollLeft > nextScrollLeft ? ScrollDirection.BACKWARD : ScrollDirection.FORWARD,
    };
    setScroll(scroll);
    timeoutID.current = setTimeout(() => setScroll({ ...scroll, isScrolling: false }), IS_SCROLLING_DEBOUNCE_INTERVAL);
  };

  useEffect(() => () => timeoutID.current && clearTimeout(timeoutID.current), []);

  const containerInfo = useContainerInfo(props);

  const classNames = useClassNames(props.classNames);

  // console.log(classNames);

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
    classNames,
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
    classNames,
  );

  const guidelines = useGuidelines(rowMetadata, columnMetadata, clientWidth, clientHeight, classNames);

  const scrollClassName = useMemo(() => {
    return [
      scrollTop === 0 && classNames.SCROLL_TOP,
      scrollLeft === 0 && classNames.SCROLL_LEFT,
      scrollTop >= scrollHeight - clientHeight && classNames.SCROLL_BOTTOM,
      scrollLeft >= scrollWidth - clientWidth && classNames.SCROLL_RIGHT,
    ]
      .filter((e) => e)
      .join(' ');
    // return classNames;
  }, [scrollTop, scrollLeft, clientHeight, scrollHeight, clientWidth, scrollWidth, classNames]);

  // {"scrollTop":3417,"scrollLeft":0,"clientHeight":283,"scrollHeight":3700}

  // console.log(guidelines);

  // console.log(columnMetadata);

  // return null;

  return (
    <div
      ref={containerInfo.ref}
      className={containerInfo.className + ' ' + scrollClassName + (isScrolling ? ' is-scrolling' : '')}
      style={{ width: containerInfo.offsetWidth }}
    >
      {/* <pre>{JSON.stringify({ scrollTop, scrollLeft, clientHeight, scrollHeight })}</pre> */}
      <div style={{ width: innerWidth, height: innerHeight }} className={styles.root} onScroll={handleScroll}>
        <div style={{ width: scrollWidth, height: scrollHeight }}>
          {sections.map((section) => (
            <div key={section.key} className={section.className} style={section.style}>
              {section.items}
            </div>
          ))}
          <div className={`${classNames.SECTION} ${classNames.SECTION_CENTER} ${styles.center}`}>{center.items}</div>
        </div>
      </div>
      {props.guideline && (
        <div className={styles.guidelines} style={{ width: clientWidth, height: clientHeight }}>
          {guidelines.map((guideline, i) => {
            return <div key={i} className={guideline.className} style={guideline.style} />;
          })}
        </div>
      )}
    </div>
  );
};

export default WindowTableCore;
