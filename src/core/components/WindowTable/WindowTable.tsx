import * as React from 'react';
import { useEffect } from 'react';
import { WindowGrid } from 'react-window-grid';
import { FunctionComponent, useMemo, SyntheticEvent, useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { useColumns, useEventHandlers, useRows } from '../../hooks';
import styles from './WindowTable.module.scss';
import { AnyARecord } from 'dns';

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

  getChildRows?: Function;
  getClassNames?: Function;
  checkbox?: boolean;

  trackBy?: Function;

  onSelect?: Function;

  onColumnResizeEnd?: Function;
};

const DEFAULT_COLUMN_WIDTH = 150;

function useDragHandle(
  columns: Column[],
  columnWidth: Function,
  fixedLeftCount: number,
  container: any,
  resizeHp: any,
  handleResizeEnd?: Function,
  sizeInfo?: any,
) {
  const [resizableKey, setResizableKey] = useState('tmp');

  const handleResize = useRef<Function>();
  handleResize.current = handleResizeEnd;

  const aaa = useRef<any>({ baseWidth: 0, divEl: null });

  const [onStart, onDrag, onStop] = useMemo(() => {
    const handleDragStart = (event: any, data: any) => {
      const { node } = data;
      const columnKey = node.getAttribute('data-column-key');

      const index = columns.findIndex((e) => e.name === columnKey);

      node.style.visibility = 'hidden';

      // const left = columns.slice(0, index).reduce((prev, curr, index) => prev + columnWidth(index), 0);
      //
      let width = columnWidth(index);

      const _width = width;

      let left = node.getBoundingClientRect().right - width - container.current.getBoundingClientRect().left;

      const fixedLeftWidth = columns
        .slice(0, fixedLeftCount)
        .reduce((prev, curr, index) => prev + columnWidth(index), 0);

      if (left < fixedLeftWidth && fixedLeftWidth < left + width) {
        width -= fixedLeftWidth - left;
        left = fixedLeftWidth;
      }

      const column = columns[index];

      aaa.current.baseWidth = width;
      aaa.current._baseWidth = _width;

      aaa.current.baseLeft = left;
      aaa.current.fixedLeftWidth = fixedLeftWidth;
      // @ts-ignore
      aaa.current.minWidth = (column && column.minWidth) || 80;
      aaa.current._minWidth = Math.max(0, aaa.current.minWidth - (_width - aaa.current.baseWidth));

      // aaa.current._baseWidth = width;
      aaa.current.columnKey = columnKey;

      if (resizeHp.current) {
        const divEl = document.createElement('div');
        resizeHp.current.innerHTML = '';
        resizeHp.current.appendChild(divEl);
        divEl.style.left = `${left}px`;
        divEl.style.width = `${width}px`;
        if (sizeInfo.current) {
          divEl.style.height = `${sizeInfo.current.clientHeight}px`;
        }

        aaa.current.divEl = divEl;

        document.body.classList.add(styles.cursorResize);
      }
    };

    const handleDrag = (event: any, data: any) => {
      let width = Math.max(aaa.current._minWidth, aaa.current.baseWidth + data.x);
      if (sizeInfo.current) {
        const clintWidth = sizeInfo.current.clientWidth;
        if (width > clintWidth - aaa.current.baseLeft) {
          width = clintWidth - aaa.current.baseLeft;
        }
        aaa.current.divEl.style.width = `${width}px`;
      }
    };

    const resetResizable = (event: any, data: any) => {
      document.body.classList.remove(styles.cursorResize);

      let width = Math.max(aaa.current.minWidth, aaa.current._baseWidth + data.x);

      // data.node.style.visibility = 'visible';

      // data.node.style.transform = '';      // handleResize.current

      if (aaa.current && typeof handleResize.current === 'function') {
        const { columnKey } = aaa.current;
        handleResize.current({ name: columnKey, width });
      }
      if (resizeHp.current) {
        resizeHp.current.innerHTML = '';
      }
      setResizableKey(Math.random() + '_');
      // return false;
    };
    return [handleDragStart, handleDrag, resetResizable];
  }, [columns, columnWidth]);

  return {
    key: resizableKey,
    onStart,
    onDrag,
    onStop,
  };
}

const WindowTable: FunctionComponent<WindowTableProps> = (props) => {
  const context = useMemo(() => {
    return props.context || {};
  }, [props.context || null]);
  const [columns, columnWidth, fixedLeftCount] = useColumns(
    props.columns,
    props.checkbox,
    props.columnWidth || DEFAULT_COLUMN_WIDTH,
  );

  const [rows, getRowIndex, getRow_, getAllRows] = useRows(
    props.rows,
    columns,
    context,
    props.checkbox,
    props.getChildRows,
    props.trackBy,
  );

  const [hover, setHover] = useState({ rowIndex: null, columnIndex: null });
  const currHover = useRef(hover);
  currHover.current = hover;
  const handleRef = useRef(setHover);
  handleRef.current = setHover;

  const timer = useRef();

  const styleRef = useRef<HTMLElementRef>();

  // const
  // const
  const [selected, setSelected] = useState<any[]>([]);

  // cibst
  const selectedRef = useRef<any[]>([]);
  selectedRef.current = selected;

  const ownEvents = useMemo(() => {
    return {
      mouseover: {
        '.cell[data-row-index][data-column-index]': (event: SyntheticEvent, ui: any) => {
          timer.current && clearTimeout(timer.current);

          styleRef.current.innerHTML = '';

          var styleNode = document.createElement('style');
          styleNode.type = 'text/css';
          var styleText = document.createTextNode(
            `[data-row-index="${ui.rowIndex}"] { background:#e9eaeb !important } `,
          );
          styleNode.appendChild(styleText);
          styleRef.current.appendChild(styleNode);
        },
      },
      mouseout: {
        '.cell[data-row-index]': (event: SyntheticEvent, ui: any) => {
          styleRef.current.innerHTML = '';
        },
      },
      click: {
        '.cell[data-row-index] input[type=checkbox][data-rwt-checkbox-control]': (event: SyntheticEvent, ui: any) => {
          // styleRef.current.innerHTML = '';
          // console.log(ui.target.checked, ui);
          // console.log('>>> check all');
          // let _selected: any[] = selectedRef.current.slice();
          // if (ui.target.checked) {
          //   _selected = [..._selected, ui.rowIndex];
          // } else {
          //   _selected = _selected.filter((e: any) => e !== ui.rowIndex);
          // }

          // setSelected(_selected);
          if (typeof getAllRows === 'function') {
            const allRows = getAllRows().filter((e: any) => !e._childRow);

            // let selected: StringAnyMap = {};

            if (selectedRef.current.length < allRows.length) {
              setSelected(allRows.map((e: any) => e._key).sort());
            } else {
              setSelected([]);
            }
          }
        },
        '.cell[data-row-index] input[type=checkbox][data-rwt-checkbox]': (event: SyntheticEvent, ui: any) => {
          // // styleRef.current.innerHTML = '';
          // console.log(ui.target.checked, ui);
          let _selected: StringAnyMap = selectedRef.current.reduce((accum, curr) => {
            return { ...accum, [curr]: true };
          }, {});
          // let key: any;
          // if (typeof props.trackBy === 'function') {
          //   key = props.trackBy(ui.data);
          // } else if (typeof getRowIndex === 'function') {
          //   key = getRowIndex(ui.rowIndex);

          //   // const rowIndex = getRowIndex(ui.rowIndex);
          // }

          // if (typeof ui._key !== 'undefined') {
          if (_selected[ui._key]) {
            delete _selected[ui._key];
          } else {
            _selected[ui._key] = true;
          }
          setSelected(Object.keys(_selected).sort());
        },
      },
    };
  }, [props.trackBy, getAllRows]);

  // @ts-ignore
  const eventHandlers = useEventHandlers({ ...props.events, ...ownEvents }, rows);

  const [resizeHelper, setResizeHelper] = useState();

  const resizeHp = useRef<HTMLElementRef>();

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
    resizeHp,

    props.onColumnResizeEnd,
    sizeInfoRef,
  );

  const selectedStatus = useMemo(() => {
    if (selected.length === 0) {
      return 'none';
    }
    if (
      rows &&
      rows
        // @ts-ignore
        .filter((e: any) => !e._childRow)
        .map((e: any) => e._key)
        // .map((e) => e._key)
        .filter((e: any) => e)

        .sort()
        .join(',') === selected.join(',')
    ) {
      return 'all';
    }
    return 'some';

    // console.

    // retur
  }, [rows, selected]);

  const renderHeader = useMemo(() => {
    return (data: any, column: any) => {
      let txt = column.name;
      if (typeof props.renderHeader === 'function') {
        txt = props.renderHeader(data, column);
      }

      return (
        <div>
          {/* <div style={{ border: '2px solid red' }}> */}
          {txt}
          {/* </div> */}
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
        </div>
      );
    };
  }, [resizableKey, handleDragStart, handleDragStop]);

  const renderCell = useMemo(() => {
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

      // @ts-ignore
      if (row._isHeader) {
        if (column.header) {
          return column.header(data, column, {
            selectedStatus,
          });
        }
        // @ts-ignore
        return renderHeader(data, column, { selectedStatus });
      }

      let className = styles.cell;
      if (column.ellipsis !== false) {
        className += ' ' + styles.ellipsis;
      }
      if (column.textAlign && styles['text-' + column.textAlign]) {
        className += ' ' + styles['text-' + column.textAlign];
      }
      // if (column.align && styles['text-' + column.align]) {
      //   className += ' ' + styles['text-' + column.align];
      // }

      const { _key, _index } = row;
      let rendered = null;
      // @ts-ignore
      if (typeof props.renderCell === 'function') {
        // @ts-ignore
        rendered = props.renderCell(data, row.org, column, {
          ...context,
          rowIndex,
          columnIndex,
          _key,
          _index,
          isSelected,
          selectedStatus,

          _childRow: !!row._childRow,
          style,
        });
      }

      if (rendered === null) {
        // @ts-ignore
        rendered = column.render(data, row.org, {
          ...context,
          rowIndex,
          columnIndex,
          _key,
          _index,
          isSelected,
          selectedStatus,
          _childRow: !!row._childRow,
          style,
        });
      }

      // console.log(data, row);

      // if (row && row.org && row.org._isLoading) {
      //   return (
      //     <div className={className} data-column={column.name}>
      //       ...
      //     </div>
      //   )
      // }

      return (
        <div className={className} data-column={column.name}>
          {rendered}
        </div>
      );
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
          _childRow: row._childRow,
        };

        // @ts-ignore
        return props.getClassNames({ rowIndex, columnIndex, ...tmp });
      };
    }
    return () => '';

    // @ts-ignore
  }, [props.classNames, rows, columns]);

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
      // console.log()
      const className = className_ + ` ${getClassNames(rowIndex, columnIndex)}`;

      return (
        <div className={className} style={_style} data-row-index={rowIndex} data-column-index={columnIndex}>
          {renderCell(rowIndex, columnIndex, _style)}
        </div>
      );
    };
  }, [renderCell, getClassNames]);

  const fixedTopCount = (props.fixedTopCount || 0) + 1;

  const cancelMouseDown = (e: any) => {
    e.preventDefault();
  };

  // const [sizeInfo, setSizeInfo] = useState({});

  const rowHeight = useMemo(() => {
    // if () {

    // }
    if (typeof props.rowHeight === 'function') {
      return (rowIndex: number) => {
        // @ts-ignore
        return props.rowHeight(rowIndex, rows[rowIndex]);
      };
    }
    return props.rowHeight || 40;
  }, [props.rowHeight]);

  // useEffect(() => {
  //   // console.log(selected);

  //   // <input type="checkbox" data-rwt-checkbox data-row-key={_key} />
  //   if (container.current) {
  //     // const all
  //     const all = selected.reduce((accum, curr) => {
  //       return { ...accum, [curr]: true }
  //     }, {});
  //     Array.from(container.current.querySelectorAll('[data-rwt-checkbox][data-row-key]')).forEach((e: any) => {
  //       const rowKey = e.getAttribute('data-row-key');
  //       e.checked = !!all[rowKey]
  //       // if (all[rowKey]) {
  //       //   ;
  //       // }
  //     })
  //   }

  // }, [selected]);

  useEffect(() => {
    if (typeof props.onSelect === 'function') {
      props.onSelect(selected);
    }
  }, [selected]);

  return (
    <div ref={container} className={styles.root}>
      {/* <h1>{selectedStatus}</h1> */}
      {/* <pre>{JSON.stringify(selected)}</pre> */}
      <div ref={styleRef} />
      {/* <pre>{JSON.stringify(hover)}</pre> */}
      <div onMouseMove={cancelMouseDown}>
        <div {...eventHandlers}>
          {/* @ts-ignore */}
          <WindowGrid
            {...props}
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
          >
            {Cell}
          </WindowGrid>

          <div className={styles.resizeHelper} ref={resizeHp} />
        </div>
      </div>
    </div>
  );
};

export default WindowTable;
