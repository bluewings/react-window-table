import * as React from 'react';

// import PropTypes from 'prop-types';

import { Fragment, FunctionComponent, useEffect, useMemo, SyntheticEvent, useState, useRef } from 'react';
import WindowTableCore from '../WindowTableCore';
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

    const allEvts = entries(events).reduce((accum, [eventName, details]) => {
      const handlerName = dict[eventName.toLowerCase()];
      if (handlerName) {
        return {
          ...accum,
          [handlerName]: handlerFactory(details),
        };
      }
      return accum;
    }, {});

    console.log(allEvts);
    console.log('%c-=-=-=-=-=-=-=-=-', 'background:blue');
    return allEvts;
  }, [eventsHash, rows]);

  return eventHandlers;
}

const WindowTable: FunctionComponent<WindowTableProps> = (props) => {
  const [columns, columnWidth] = useColumns(props);
  const rows = useRows(props, columns);
  // return <pre>{JSON.stringify(rows, null, 2)}</pre>;
  // const render
  // const render = (data, columnIndex) => {
  //   // columns[columnIndex].render
  // }

  const eventHandlers = useEventHandlers(props.events, rows);

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

  return (
    <div {...eventHandlers}>
      <WindowTableCore {...props} columnCount={columns.length} columnWidth={columnWidth}>
        {Cell}
      </WindowTableCore>
    </div>
  );
};

export default WindowTable;
