import * as React from 'react';
import { WindowGrid } from 'react-window-grid';
import { FunctionComponent, useMemo, SyntheticEvent, useState, useRef } from 'react';
import { useColumns, useEventHandlers, useRows } from '../../hooks';

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

  events: StringFunctionMap;

  renderHeader?: Function;
  maxHeight?: number;

  context?: any;

  // maxScrollY?: number
  // maxScrollX?: number

  // cellStyle?: string;

  // columns: array

  // containerStyle?: string;
  // guidelineStyle?: Function;
};

// function useHandle(callback) {
//   const handle = useRef();
//   handle.current = callback;
//   return (...args) => {
//     if (typeof handle.current === 'function') {
//       handle.current(...args);
//     }
//   };
// }

// console.log(columnWidth)
const DEFAULT_COLUMN_WIDTH = 150;
const WindowTable: FunctionComponent<WindowTableProps> = (props) => {
  // const [columns, columnWidth] = useColumns(props);

  const context = useMemo(() => {
    return props.context || {};
  }, [props.context || null])
  const [columns, columnWidth] = useColumns(props.columns, props.columnWidth || DEFAULT_COLUMN_WIDTH);


  
  // console.log(columns);
  const rows = useRows(props.rows, columns, context);
  // console.log(rows);
  // return null;
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

  const styleRef = useRef<HTMLElementRef>();

  const ownEvents = useMemo(() => {
    return {
      mouseover: {
        '.cell[data-row-index][data-column-index]': (event: SyntheticEvent, ui: any) => {
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
        '.cell[data-row-index]': (event: SyntheticEvent, ui: any) => {
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

  // @ts-ignore
  const eventHandlers = useEventHandlers({ ...props.events, ...ownEvents }, rows);

  // console.log('>>>>>>');
  // // console.log(eventsHash);
  // console.log('<<<<<<');

  const renderHeader =
    props.renderHeader ||
    ((data: any) => {
      return data;
    });

  const renderCell = (rowIndex: number, columnIndex: number) => {
    const row = rows[rowIndex];
    const column = columns[columnIndex];
    const data = row.arr[columnIndex];

    // @ts-ignore
    if (row._isHeader) {
      if (column.header) {
        return column.header(data);
      }
      // return data;
      return renderHeader(data);
    }
    // console.log(row);
    // @ts-ignore
    return column.render(data, row.org, { rowIndex, columnIndex });
    // if (rowIndex)
  };

  // @ts-ignore
  const Cell = ({ rowIndex, columnIndex, className, style }) => (
    <div className={className} style={style} data-row-index={rowIndex} data-column-index={columnIndex}>
      {renderCell(rowIndex, columnIndex)}
    </div>
  );

  const fixedTopCount = (props.fixedTopCount || 0) + 1;

  // return 'hello world';

  return (
    <div>
      <div ref={styleRef} />
      {/* <pre>{JSON.stringify(hover)}</pre> */}
      <div {...eventHandlers}>
        <WindowGrid
          {...props}
          rowHeight={40}
          rowCount={rows.length}
          fixedTopCount={fixedTopCount}
          columnCount={columns.length}
          columnWidth={columnWidth}
          // columnWidth={100}
          overscanCount={2}
        >
          {Cell}
        </WindowGrid>
      </div>
    </div>
  );
};

export default WindowTable;
