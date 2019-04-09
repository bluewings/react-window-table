import * as React from 'react';
// import PropTypes from 'prop-types';
import { Fragment, FunctionComponent, useEffect, useMemo, SyntheticEvent, useState, useRef } from 'react';
import { css } from 'emotion';
import cx from 'classnames';
import {
  useCachedItem,
  useClassNames,
  useGuidelines,
  useHelpers,
  useContainerInfo,
  useScrollbarSize,
  useSections,
  useTheme,
} from '../../hooks';
import { ItemType, ScrollDirection } from '../../hooks/useHelpers';
import { ClassNames } from '../../hooks/useClassNames';
import { ThemeFunction } from '../../hooks/useTheme';

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
  theme?: ThemeFunction;

  // maxScrollY?: number
  // maxScrollX?: number

  // cellStyle?: string;

  // columns: array

  // containerStyle?: string;
  // guidelineStyle?: Function;
};

// const IS_SCROLLING_DEBOUNCE_INTERVAL = 150;
const IS_SCROLLING_DEBOUNCE_INTERVAL = 150;

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

  const classNames = useClassNames(props.classNames);

  const theme = useTheme(props.theme, classNames);

  // console.log('T H E M E : ', theme);
  const containerInfo = useContainerInfo({ ...props, theme });

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

  // {"scrollTop":3417,"scrollLeft":0,"clientHeight":283,"scrollHeight":3700}

  // console.log(guidelines);

  // console.log(columnMetadata);

  //eturn null;

  const statusClassName = useMemo(() => {
    return [
      scrollTop === 0 && classNames.SCROLL_TOP,
      scrollLeft === 0 && classNames.SCROLL_LEFT,
      scrollTop >= scrollHeight - clientHeight && classNames.SCROLL_BOTTOM,
      scrollLeft >= scrollWidth - clientWidth && classNames.SCROLL_RIGHT,
      isScrolling ? classNames.IS_SCROLLING : classNames.IS_NOT_SCROLLING,
    ]
      .filter((e) => e)
      .join(' ');
    // return classNames;
  }, [scrollTop, scrollLeft, clientHeight, scrollHeight, clientWidth, scrollWidth, isScrolling, classNames]);

  // const statusClassName = useMemo(() => {
  //   const classNames_ = [
  //     isScrolling ? classNames.IS_SCROLLING : classNames.IS_NOT_SCROLLING,

  //   ]
  // }, [classNames, isScrolling, scrollClassName])

  return (
    <div ref={containerInfo.ref} className={containerInfo.className} style={{ width: containerInfo.offsetWidth }}>
      {/* <pre>{JSON.stringify({ scrollTop, scrollLeft, clientHeight, scrollHeight })}</pre> */}
      <div className={statusClassName}>
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
    </div>
  );
};

export default WindowTableCore;
