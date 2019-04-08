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
  const columns = useMemo(() => {
    return (props.columns || [])
      .filter((column: any) => column && (typeof column === 'string' || typeof column === 'object'))
      .map((column: any) => (typeof column === 'string' ? { name: column } : { ...column }))
      .filter((column: any) => column.name);
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
  return rows;
}

const WindowTable: FunctionComponent<WindowTableProps> = (props) => {
  const [columns, columnWidth] = useColumns(props);
  const rows = useRows(props, columns);
  // return <pre>{JSON.stringify(rows, null, 2)}</pre>;
  return (
    <WindowTableCore {...props} columnCount={columns.length} columnWidth={columnWidth}>
      {({ rowIndex, columnIndex, className, style }) => (
        <div className={className} style={style}>
          {rows[rowIndex].arr[columnIndex]}
        </div>
      )}
    </WindowTableCore>
  );
};

export default WindowTable;
