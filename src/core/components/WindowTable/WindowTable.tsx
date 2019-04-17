import * as React from 'react';
import { WindowGrid } from 'react-window-grid';
// import PropTypes from 'prop-types';

import { Fragment, FunctionComponent, useEffect, useMemo, SyntheticEvent, useState, useRef } from 'react';
// import WindowGrid from '../WindowTableCore';

// import { css } from 'emotion';
// import { useCachedItem, useGuidelines, useHelpers, useContainerInfo, useScrollbarSize, useSections } from '../../hooks';
// import { ItemType, ScrollDirection } from '../../hooks/useHelpers';

import styles from './WindowTable.module.scss';

type ScrollEvent = SyntheticEvent<HTMLDivElement>;

type WindowTableProps = {
  scrollTop?: number;
  scrollLeft?: number;
  width?: number;
  height?: number;

  columns?: any;
  columnCount: number;
  columnWidth: number | Function;

  rows?: any;
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

  // maxScrollY?: number
  // maxScrollX?: number

  // cellStyle?: string;

  // columns: array

  // containerStyle?: string;
  // guidelineStyle?: Function;
};

function useColumns(props: any) {
  console.log(props.columns);
  const columns = useMemo(() => {
    return (props.columns || [])
      .filter((column: any) => column && (typeof column === 'string' || typeof column === 'object'))
      .map((column: any) => (typeof column === 'string' ? { name: column } : { ...column }))
      .filter((column: any) => column.name)
      .map((column) => {
        return {
          ...column,
          render: typeof column.render === 'function' ? column.render : (data) => data,
        };
      });
  }, [props.columns]);

  const columnWidth = useMemo(
    () => (index: number) =>
      (columns[index] && columns[index].width) ||
      (typeof props.columnWidth === 'function' ? props.columnWidth(index) : props.columnWidth),
    [columns, props.columnWidth],
  );

  return [columns, columnWidth];
}

function useRows(props: any, columns) {
  const rows = props.rows.map((row) => {
    let _row;
    if (Array.isArray(row)) {
      _row = columns.reduce(
        (prev, e, i) => ({
          ...prev,
          [e.name]: row[i],
        }),
        {},
      );
    } else {
      _row = { ...row };
    }

    const data = {
      org: { ..._row },
      arr: columns.map((e) => {
        let value = _row[e.name];
        if (typeof e.getValue === 'function') {
          value = e.getValue(value);
        }
        if (typeof value === 'string' || typeof value === 'number') {
          return value;
        }
        return '-';
      }),
    };

    return data;
  });
  return [
    {
      org: {},
      _isHeader: true,
      arr: columns.map((e) => e.name),
    },
    ...rows,
  ];
}

const serialize = (() => {
  const replacer = (key: string, value: any) => (typeof value === 'function' ? value.toString() : value);
  return (value: any) => JSON.stringify(value, replacer);
})();

function useEventHandlers(events, rows) {
  const dict = {
    click: 'onClick',
    mouseover: 'onMouseOver',
    mouseout: 'onMouseOut',
  };
  const eventsHash = serialize(events);

  const eventHandlers = useMemo(() => {
    const entries = (target) => {
      return Object.keys(target).map((k) => {
        return [k, target[k]];
      });
    };

    // props.events
    // console.log('%c-=-=-=-=-=-=-=-=-', 'background:orange');
    // console.log();

    // console.log();

    const getAttrFromClosest = (source, attrName) => {
      const target = source.getAttribute(attrName) ? source : source.closest(`[${attrName}]`);
      if (target) {
        return target.getAttribute(attrName);
      }
      return null;
    };

    const getEventTarget = (source, selector) => {
      const target = source.matches(selector) ? source : source.closest(selector);

      if (target) {
        let rowIndex = getAttrFromClosest(target, 'data-row-index');
        let columnIndex = getAttrFromClosest(target, 'data-column-index');

        if (rowIndex && columnIndex) {
          rowIndex = ~~rowIndex;
          columnIndex = ~~columnIndex;
          const row = rows[rowIndex].org;
          return {
            target,
            rowIndex,
            columnIndex,
            data: row,
            // data: rows[row]
          };
        }
      }
      // if (target) {
      //   return target;
      //   // return target.matches(selector);
      // }
      return null;
    };

    const handlerFactory = (details) => {
      const handles = entries(details).map(([selector, handler]) => {
        return {
          selector,
          handler,
        };
      });

      return (event) => {
        // console.log(event.target);
        // console.log(handles);
        handles.forEach((e) => {
          const target = getEventTarget(event.target, e.selector);
          if (target) {
            e.handler(event, target);
          }

          // console.log(target);
        });
      };
    };

    let allEvts = entries(events).reduce((accum, [eventName, details]) => {
      const handlerName = dict[eventName.toLowerCase()];
      if (handlerName) {
        return {
          ...accum,
          [handlerName]: handlerFactory(details),
        };
      }
      return accum;
    }, {});

    // allEvts = entries(events).reduce((accum, [eventName, details]) => {
    //   const handlerName = dict[eventName.toLowerCase()];
    //   if (handlerName) {
    //     return {
    //       ...accum,
    //       [handlerName]: handlerFactory(details),
    //       // [handlerName]: [
    //       //   ...(accum[handlerName] || []),
    //       //   ...handlerFactory(details),
    //       // ],
    //     };
    //   }
    //   return accum;
    // }, allEvts);

    console.log(allEvts);
    console.log('%c-=-=-=-=-=-=-=-=-', 'background:blue');
    return allEvts;
  }, [eventsHash, rows]);

  return eventHandlers;
}

// function useHandle(callback) {
//   const handle = useRef();
//   handle.current = callback;
//   return (...args) => {
//     if (typeof handle.current === 'function') {
//       handle.current(...args);
//     }
//   };
// }

const WindowTable: FunctionComponent<WindowTableProps> = (props) => {
  const [columns, columnWidth] = useColumns(props);
  const rows = useRows(props, columns);
  // return <pre>{JSON.stringify(rows, null, 2)}</pre>;
  // const render
  // const render = (data, columnIndex) => {
  //   // columns[columnIndex].render
  // }
  const [hover, setHover] = useState({ rowIndex: null, columnIndex: null });
  const currHover = useRef(hover);
  currHover.current = hover;
  const handleRef = useRef(setHover);
  handleRef.current = setHover;

  const timer = useRef();

  const styleRef = useRef();

  const ownEvents = useMemo(() => {
    return {
      mouseover: {
        '.cell[data-row-index][data-column-index]': (event, ui) => {
          timer.current && clearTimeout(timer.current);
          // console.log('%cmouseover', 'background:orange');
          styleRef.current.innerHTML = '';

          var styleNode = document.createElement('style');
          styleNode.type = 'text/css';
          var styleText = document.createTextNode(
            `[data-row-index="${ui.rowIndex}"] { background:#e9eaeb !important } `,
          );
          styleNode.appendChild(styleText);
          styleRef.current.appendChild(styleNode);
          // // browser detection (based on prototype.js)
          // if(!!(window.attachEvent && !window.opera)) {
          //      styleNode.styleSheet.cssText = 'span { color: rgb(255, 0, 0); }';
          // } else {
          //      var styleText = document.createTextNode('span { color: rgb(255, 0, 0); } ');
          //      styleNode.appendChild(styleText);
          // }
          //     var css = 'h1 { background: red; }',
          //     head = document.head || document.getElementsByTagName('head')[0],
          //     style = document.createElement('style');

          // head.appendChild(style);

          // style.type = 'text/css';
          // if (style.styleSheet){
          //   // This is required for IE8 and below.
          //   style.styleSheet.cssText = css;
          // } else {
          //   style.appendChild(document.createTextNode(css));
          // }

          // style.appendChild(document.createTextNode(css));
          // window._cnt1 = (window._cnt1 || 0);
          // console.log('hover', window._cnt1++)
          // if (currHover.current.ho)
          // if (currHover.curren)
          // styleRef.current.inner
          // const _ = currHover.current
          // const { rowIndex, columnIndex } = ui;
          // if (_.rowIndex !== rowIndex || _.columnIndex !== columnIndex) {
          //   handleRef.current({ rowIndex, columnIndex });
          // }
          // console.log(ui);
        },
      },
      mouseout: {
        '.cell[data-row-index]': (event, ui) => {
          // timer.current && clearTimeout(timer.current);
          // console.log('%cmouseout', 'background:blue');
          styleRef.current.innerHTML = '';

          // timer.current = setTimeout(() => {
          //   // const _ = currHover.current
          //   // if (_.rowIndex !== null || _.columnIndex !== null ) {
          //     handleRef.current({ rowIndex: null, columnIndex: null });
          //   // }
          // }, 100);

          // window._cnt2 = (window._cnt2 || 0);
          // console.log('out', window._cnt2++)
        },
      },
    };
  }, []);

  const eventHandlers = useEventHandlers({ ...props.events, ...ownEvents }, rows);

  console.log('>>>>>>');
  // console.log(eventsHash);
  console.log('<<<<<<');

  const renderHeader =
    props.renderHeader ||
    ((data) => {
      return data;
    });

  const renderCell = (rowIndex, columnIndex) => {
    const row = rows[rowIndex];
    const column = columns[columnIndex];
    const data = row.arr[columnIndex];

    if (row._isHeader) {
      if (column.header) {
        return column.header(data);
      }
      // return data;
      return renderHeader(data);
    }
    return column.render(data, { rowIndex, columnIndex });
    // if (rowIndex)
  };

  const Cell = ({ rowIndex, columnIndex, className, style }) => (
    <div className={className} style={style} data-row-index={rowIndex} data-column-index={columnIndex}>
      {renderCell(rowIndex, columnIndex)}
    </div>
  );

  const fixedTopCount = (props.fixedTopCount || 0) + 1;

  return (
    <div>
      <div ref={styleRef} />
      <pre>{JSON.stringify(hover)}</pre>
      <div {...eventHandlers}>
        <WindowGrid
          {...props}
          rowCount={rows.length}
          fixedTopCount={fixedTopCount}
          columnCount={columns.length}
          columnWidth={columnWidth}
        >
          {Cell}
        </WindowGrid>
      </div>
    </div>
  );
};

export default WindowTable;
