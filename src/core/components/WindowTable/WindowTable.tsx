import * as React from 'react';
import { useEffect, useImperativeHandle, forwardRef, isValidElement } from 'react';
import { WindowGrid } from 'react-window-grid';
import { FunctionComponent, useMemo, SyntheticEvent, useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { useColumns, useDragHandle, useEventHandlers, useRows, useTheme, useHandle } from '../../hooks';
import { GetChildRowsFunc } from '../../hooks/useRows';
import styles from './WindowTable.module.scss';

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

  getChildRows?: GetChildRowsFunc;
  getClassNames?: Function;
  checkbox?: boolean | 'left' | 'right';

  trackBy?: Function;

  cancelMouseMove?: boolean;

  onSelect?: Function;
  selected?: string[];

  status?: string;

  theme?: Function | string;

  onColumnResizeEnd?: Function;

  onVisibleRangeChange?: Function;
};

const preventDefault = (e: any) => {
  e.preventDefault();
};

const noop = () => undefined;

const toValidContent = (e: any) => {
  const type = typeof e;
  if (type === 'string' || type === 'number' || isValidElement(e)) {
    return e;
  }
  if (e && typeof e.toString === 'function') {
    return e.toString();
  }
  return null;
};

const WindowTable: FunctionComponent<WindowTableProps> = (props, ref) => {
  const context = useMemo(() => props.context || {}, [props.context || null]);

  const [columns, columnWidth, fixedLeftCount] = useColumns({
    columns: props.columns,
    columnWidth: props.columnWidth,
    checkbox: props.checkbox,
  });

  const [rows, dataRows, rowHeight, getRows] = useRows({
    rows: props.rows,
    rowHeight: props.rowHeight,
    columns,
    context,
    checkbox: props.checkbox,
    getChildRows: props.getChildRows,
    trackBy: props.trackBy,
  });

  const maxHeight = useMemo(() => props.maxHeight || 400, [props.maxHeight || null]);

  const fixedTopCount = (props.fixedTopCount || 0) + 1;

  const [hover, setHover] = useState({ rowIndex: null, columnIndex: null });
  const currHover = useRef(hover);
  currHover.current = hover;
  const handleRef = useRef(setHover);
  handleRef.current = setHover;

  const timer = useRef();

  const styleRef = useRef<HTMLElementRef>();

  // const
  // const
  // @ts-ignore
  const [selected, setSelected] = useState<any[]>(props.selected || []);

  // cibst
  const selectedRef = useRef<any[]>([]);
  selectedRef.current = selected;

  // @ts-ignore
  // @ts-ignore
  const classNames = useMemo(() => ({ HEADER: 'header', CELL: 'cell', ...(props.classNames || {}) }), [
    // @ts-ignore
    props.classNames || null,
  ]);

  const ownEvents = useMemo(() => {
    return {
      // mouseover: {
      //   '.cell[data-row-index][data-column-index]': (event: SyntheticEvent, ui: any) => {
      //     timer.current && clearTimeout(timer.current);

      //     styleRef.current.innerHTML = '';

      //     var styleNode = document.createElement('style');
      //     styleNode.type = 'text/css';
      //     var styleText = document.createTextNode(
      //       `[data-row-index="${ui.rowIndex}"] { background:#e9eaeb !important } `,
      //     );
      //     styleNode.appendChild(styleText);
      //     styleRef.current.appendChild(styleNode);
      //   },
      // },
      // mouseout: {
      //   '.cell[data-row-index]': (event: SyntheticEvent, ui: any) => {
      //     styleRef.current.innerHTML = '';
      //   },
      // },
      click: {
        [`.${classNames.CELL}[data-row-index] input[type=checkbox][data-rwt-checkbox-control]`]: (
          event: SyntheticEvent,
          ui: any,
        ) => {
          const parentRows = dataRows.filter((e: any) => !e._isChildRow);
          // console.log('>%-=-=-=-=-=-=-', 'background:yellow')
          if (selectedRef.current.length < parentRows.length) {
            setSelected(parentRows.map((e: any) => e._key).sort());
          } else {
            setSelected([]);
          }
        },
        [`.${classNames.CELL}[data-row-index] input[type=checkbox][data-rwt-checkbox]`]: (
          event: SyntheticEvent,
          ui: any,
        ) => {
          let _selected: StringAnyMap = selectedRef.current.reduce((accum, curr) => {
            return { ...accum, [curr]: true };
          }, {});
          if (_selected[ui._key]) {
            delete _selected[ui._key];
          } else {
            _selected[ui._key] = true;
          }
          setSelected(Object.keys(_selected).sort());
        },
      },
    };
  }, [classNames, dataRows]);

  // @ts-ignore
  const eventHandlers = useEventHandlers(ownEvents, props.events, rows, context);

  // const [resizeHelper, setResizeHelper] = useState();

  const resizeHelper = useRef<HTMLElementRef>();

  const container = useRef<HTMLElementRef>();

  // const [sizeInfo, setSizeInfo] = useState({});
  const sizeInfoRef = useRef<any>({});

  const handleResize = (info: any) => {
    sizeInfoRef.current = info;
    // setSizeInfo(info);
  };

  const { key: resizableKey, onStart: handleDragStart, onDrag: handleDrag, onStop: handleDragStop } = useDragHandle(
    columns,
    columnWidth,
    fixedLeftCount,
    container,
    resizeHelper,

    props.onColumnResizeEnd,
    sizeInfoRef,
  );

  const selectedStatus = useMemo(() => {
    if (selected.length === 0) {
      return 'none';
    }
    return dataRows
      .filter(({ _key, _isChildRow }) => !_isChildRow && _key)
      .map(({ _key }) => _key)
      .sort()
      .join(',') === selected.sort().join(',')
      ? 'all'
      : 'some';
  }, [dataRows, selected]);

  const renderHeader = useMemo(() => {
    return (data: any, column: any) => {
      let txt = column.label;
      if (typeof props.renderHeader === 'function') {
        txt = props.renderHeader(data, column);
      }

      if (typeof props.onColumnResizeEnd !== 'function') {
        return txt;
      }

      return (
        <>
          {txt}
          <div>
            <Draggable
              key={resizableKey}
              onStart={handleDragStart}
              onDrag={handleDrag}
              onStop={handleDragStop}
              axis="x"
            >
              <div className={styles.resizeHandle} data-column-key={column.name} />
            </Draggable>
          </div>
        </>
      );
    };
  }, [props.renderHeader, resizableKey, handleDragStart, handleDragStop, props.onColumnResizeEnd || null]);

  const renderCore = useMemo(() => {
    const seletedMap = selected.reduce((accum, curr) => {
      return { ...accum, [curr]: true };
    }, {});

    const getIsSelected = (row: any) => {
      return !!seletedMap[row._key];
    };

    return (rowIndex: number, columnIndex: number, style: any) => {
      // @ts-ignore
      const row = rows[rowIndex];
      const column = columns[columnIndex];
      const data = row.arr[columnIndex];
      const isSelected = getIsSelected(row);

      // console.log(row);
      if (!column) {
        return null;
      }

      // let className = styles.cell;
      // // if (column.ellipsis !== false) {
      // //   className += ' ' + styles.ellipsis;
      // // }
      // // if (column.textAlign && styles['text-' + column.textAlign]) {
      // //   className += ' ' + styles['text-' + column.textAlign];
      // // }

      let rendered = null;

      // @ts-ignore
      if (row._isHeader) {
        if (column.header) {
          rendered = column.header(data, column, {
            selectedStatus,
          });
        } else {
          // @ts-ignore
          rendered = renderHeader(data, column, { selectedStatus });
        }
      } else {
        const { _key, _index } = row;

        // @ts-ignore
        if (typeof props.renderCell === 'function') {
          // @ts-ignore
          rendered = props.renderCell(data, row.obj, column, {
            ...context,
            rowIndex,
            columnIndex,
            _key,
            _index,
            isSelected,
            selectedStatus,

            _isChildRow: !!row._isChildRow,
            style,
          });
        }

        if (rendered === null) {
          // @ts-ignore
          rendered = column.render(data, row.obj, {
            ...context,
            rowIndex,
            columnIndex,
            _key,
            _index,
            isSelected,
            selectedStatus,
            _isChildRow: !!row._isChildRow,
            style,
          });
        }
      }

      rendered = toValidContent(rendered);

      return rendered;

      // return (
      //   <div className={className} data-column={column.name}>
      //     {rendered}
      //   </div>
      // );
    };
  }, [rows, columns, renderHeader, selected, selectedStatus]);

  const getClassNames = useMemo(() => {
    // return ()
    if (typeof props.getClassNames === 'function') {
      return (rowIndex: number, columnIndex: number) => {
        // console.log(rows[rowIndex])
        // @ts-ignore
        const row = rows[rowIndex];
        const tmp = {
          _rowIndex: row._index,
          _isChildRow: row._isChildRow,
        };

        const column = columns[columnIndex];

        // @ts-ignore
        return props.getClassNames({ rowIndex, columnIndex, ...tmp });
      };
    }
    return () => '';

    // @ts-ignore
  }, [props.getClassNames, rows, columns]);

  const Cell = useMemo(() => {
    // @ts-ignore
    return ({ rowIndex, columnIndex, className: className_, style }) => {
      let _style = style;

      // @ts-ignore
      if (columnIndex === -1) {
        _style = {
          ..._style,
          overflow: 'hidden',
          padding: 0,
        };
      }

      let row = rows[rowIndex];

      let className__ = ' ' + styles.cell;
      const column = columns[columnIndex] || {};
      if (column.ellipsis !== false) {
        className__ += ' ' + styles.ellipsis;
      }
      if (column.textAlign && styles['text-' + column.textAlign]) {
        className__ += ' ' + styles['text-' + column.textAlign] + ` text-align-${column.textAlign}`;
      }
      if (row._isHeader) {
        className__ += ' ' + classNames.HEADER;
      }
      // console.log()
      const className = className_ + className__ + ` ${getClassNames(rowIndex, columnIndex)}`;

      // dummy 컬럼은 없을 수 있다.
      const column_ = columns[columnIndex] || {};

      return (
        <div
          className={className}
          style={_style}
          data-row-index={rowIndex}
          data-column-index={columnIndex}
          data-column={column_.name}
        >
          {renderCore(rowIndex, columnIndex, _style)}
        </div>
      );
    };
  }, [rows, columns, renderCore, getClassNames, classNames]);

  useEffect(() => {
    const keys = dataRows
      .filter((e: any) => !e._isChildRow)
      .reduce((accum: any, { _key }) => ({ ...accum, [_key]: true }), {});
    const availKeys = selected.filter((e) => keys[e]);
    if (props.status !== 'PENDING' && selected.join(',') !== availKeys.join(',')) {
      setSelected(availKeys);
    }
  }, [props.status || null, dataRows]);

  const selectedProps = useRef('');

  useEffect(() => {
    if (Array.isArray(props.selected)) {
      const hash = props.selected.sort().join(',');
      if (Array.isArray(props.selected) && selectedProps.current !== hash && hash !== selected.sort().join(',')) {
        setSelected(props.selected);
      }
      selectedProps.current = hash;
    }
  }, [props.selected || null]);

  useEffect(() => {
    if (props.status !== 'PENDING' && typeof props.onSelect === 'function') {
      props.onSelect(selected);
    }
  }, [props.status || null, selected]);

  // console.log(selected);

  const theme = useTheme(props.theme);

  const guideline = useMemo(() => {
    return typeof props.guideline === 'undefined' ? true : !!props.guideline;
  }, [props.guideline || null]);

  const windowGrid = useRef<any>();
  useImperativeHandle(
    ref,
    () => {
      return {
        getData: async (data?: any) => {
          const columns_ = (columns || []).map((column: any) => ({ ...column }));
          let rows_ = (Array.isArray(data) ? getRows(data) : rows) || [];
          const startIndex = columns_.findIndex((column: any) => !column._system);

          rows_ = rows_.filter((row: any) => !row._isHeader);
          rows_ = await columns_.reduce(async (prevRows, col, i) => {
            if (typeof col.batchData === 'function') {
              const prev = await prevRows;
              const nextRows = await Promise.all(
                prev.map(async (row: any, j: number) => {
                  const newRow = [...(row.arr || [])];
                  newRow[i] = await col.batchData(newRow[i], { ...row.obj }, context);
                  return { ...row, arr: newRow };
                }),
              );
              return nextRows;
            }
            return prevRows;
          }, Promise.resolve(rows_));

          return {
            columns: columns_.slice(startIndex),
            rows: rows_.map((row: any) => row.arr.slice(startIndex)),
            // rows: rows_.filter((row: any) => !row._isHeader).map((row: any) => (row.arr || []).slice(startIndex)),
          };
        },
        scrollTo: (params: any) => {
          if (windowGrid.current && typeof windowGrid.current.scrollTo === 'function') {
            windowGrid.current.scrollTo(params);
          }
        },
        clearSelected: () => {
          setSelected([]);
        },
      };
    },
    [rows, columns, getRows, context],
  );

  const onVisibleRangeChange = useHandle(props.onVisibleRangeChange);

  const handleMouseMove = useMemo(() => props.cancelMouseMove === false ?  noop : preventDefault, [props.cancelMouseMove]);

  // @ts-ignore
  return (
    <div ref={container} className={styles.root}>
      <div ref={styleRef} />
      <div onMouseMove={handleMouseMove}>
        <div {...eventHandlers}>
          <WindowGrid
            ref={windowGrid}
            {...props}
            classNames={classNames}
            rowHeight={rowHeight}
            rowCount={rows.length}
            fixedLeftCount={fixedLeftCount}
            fixedTopCount={fixedTopCount}
            columnCount={columns.length}
            columnWidth={columnWidth}
            overscanCount={2}
            overflow={rows.length > 1}
            fillerColumn="append"
            onResize={handleResize}
            theme={theme}
            guideline={guideline}
            maxHeight={maxHeight}
            onVisibleRangeChange={onVisibleRangeChange}
          >
            {Cell}
          </WindowGrid>
          <div className={styles.resizeHelper} ref={resizeHelper} />
        </div>
      </div>
    </div>
  );
};

export default forwardRef(WindowTable);
