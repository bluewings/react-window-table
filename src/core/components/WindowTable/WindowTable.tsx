import * as React from 'react';
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

};

const DEFAULT_COLUMN_WIDTH = 150;

function useDragHandle(columns: Column[], columnWidth: Function, fixedLeftCount: number, container: any, resizeHp: any) {

  const [resizableKey, setResizableKey] = useState('tmp');

  const aaa = useRef<any>({ baseWidth: 0, divEl: null });

  const [onStart, onDrag, onStop] = useMemo(() => {
    const handleDragStart = (event: any, data: any) => {
      console.log(data);
      const { node } = data;
      const columnKey = node.getAttribute('data-column-key');
      console.log(columnKey);
  
      const index = columns.findIndex(e => e.name === columnKey);
  
      console.log(index);
  
      // const left = columns.slice(0, index).reduce((prev, curr, index) => prev + columnWidth(index), 0);
      // console.log(node.getBoundingClientRect());
      let width = columnWidth(index);
      let left = node.getBoundingClientRect().right - width - container.current.getBoundingClientRect().left;

      const fixedLeftWidth = columns.slice(0, fixedLeftCount).reduce((prev, curr, index) => prev + columnWidth(index), 0);

      if (left < fixedLeftWidth && fixedLeftWidth < left + width) {
        width -= (fixedLeftWidth - left);
        left = fixedLeftWidth;

      }

      
      console.log({ left });
      aaa.current.baseWidth = width;
      aaa.current.baseLeft = left;
      aaa.current.fixedLeftWidth = fixedLeftWidth;

  
      if (resizeHp.current) {
        const divEl = document.createElement('div'); 
        resizeHp.current.innerHTML = '';
        resizeHp.current.appendChild(divEl);
        divEl.style.left = `${left}px`
        divEl.style.width = `${width}px`
        // divEl.innerHTML =     JSON.stringify({
        //   left,
        //   _width: columnWidth(index),
        //   width: columnWidth(index),
        // });

        aaa.current.divEl = divEl;
  
      }
  
    }

    const handleDrag = (event: any, data: any) => {

     

    let width = Math.max(80,  aaa.current.baseWidth + data.x);

    const clintWidth = container.current.getBoundingClientRect().width;

    if (aaa.current.baseLeft + width > clintWidth) {
      width = clintWidth - aaa.current.baseLeft;
    }

    // if (left + width <)







    aaa.current.divEl.style.width = `${width}px`
    }
  
    const resetResizable= () => {
      console.log('>>> reset');
      
      setResizableKey(Math.random() + '_');
      console.log('>>> reset done');
      if (resizeHp.current) {
        
        resizeHp.current.innerHTML = '';
      }
    }
    return [handleDragStart, handleDrag, resetResizable];
  }, [columns, columnWidth])



  return {
    key: resizableKey,
    onStart,
    onDrag,
    onStop,
  }
}



const WindowTable: FunctionComponent<WindowTableProps> = (props) => {

  const context = useMemo(() => {
    return props.context || {};
  }, [props.context || null])
  const [columns, columnWidth, fixedLeftCount] = useColumns(props.columns, props.columnWidth || DEFAULT_COLUMN_WIDTH);

  const rows = useRows(props.rows, columns, context);

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
    };
  }, []);

  // @ts-ignore
  const eventHandlers = useEventHandlers({ ...props.events, ...ownEvents }, rows);

  

  const [resizeHelper, setResizeHelper] = useState();

  const resizeHp = useRef<HTMLElementRef>();

  const container = useRef<HTMLElementRef>();

  const { key: resizableKey, onStart: handleDragStart,
    onDrag: handleDrag,
    onStop: handleDragStop } = useDragHandle(columns, columnWidth, fixedLeftCount, container, resizeHp);

  console.log('%c-=-=-=-=-=-=-', 'background:yellow');



  const renderHeader = useMemo(() => {
    return (data: any, column: any) => {
      let txt = column.name
      if (typeof props.renderHeader === 'function') {
        txt = props.renderHeader(data, column);
      }
  
      return (
        <div>
        <div style={{ border: '2px solid red' }}>
          {txt}
        </div>
        <div
  
        >
          
        <Draggable
        key={resizableKey}
        onStart={handleDragStart}
        onDrag={handleDrag}
        onStop={handleDragStop}
        axis="x">
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 10, background: 'yellow'}}
          data-column-key={column.name}
          >
          </div>
        </Draggable>
        </div>
        </div>
      )
  
    }
  }, [resizableKey, handleDragStart, handleDragStop]);

  const renderCell = useMemo(() => {
    return (rowIndex: number, columnIndex: number) => {
      const row = rows[rowIndex];
      const column = columns[columnIndex];
      const data = row.arr[columnIndex];
  
      if (!column) {
        return null;
      }
  
      // @ts-ignore
      if (row._isHeader) {
        if (column.header) {
          return column.header(data, column);
        }
        
        return renderHeader(data, column);
      }
  
      let className = styles.cell;
      if (column.ellipsis !== false) {
        className += ' ' + styles.ellipsis
      }
      if (column.textAlign && styles['text-' + column.textAlign]) {
        className += ' ' + styles['text-' + column.textAlign]
      }
  
      // @ts-ignore
      const rendered = column.render(data, row.org, { ...context, rowIndex, columnIndex });
  
      return (
        <div className={className} data-column={column.name}>
          {rendered}
        </div>
      )
  
    };
  }, [rows, columns, renderHeader]);

  
  const Cell = useMemo(() => {
    // @ts-ignore
    return ({ rowIndex, columnIndex, className, style }) => {
      let _style = style;
  
      // @ts-ignore
      if (columnIndex === -1) {
        _style = {
          ..._style,
          overflow: 'hidden',
          padding: 0,
        }
      }
  
      return (
        <div className={className} style={_style} data-row-index={rowIndex} data-column-index={columnIndex}>
          {renderCell(rowIndex, columnIndex)}
        </div>
      );
    }
  }, [renderCell])

  const fixedTopCount = (props.fixedTopCount || 0) + 1;

  const cancelMouseDown = (e: any) => {
    e.preventDefault();
  }

  return (
    <div ref={container}>
      <div ref={styleRef} />
      {/* <pre>{JSON.stringify(hover)}</pre> */}
      <div onMouseMove={cancelMouseDown}>
      <div {...eventHandlers}>
        <WindowGrid
          {...props}
          rowHeight={40}
          rowCount={rows.length}
          fixedLeftCount={fixedLeftCount}
          fixedTopCount={fixedTopCount}
          columnCount={columns.length}
          columnWidth={columnWidth}
          
          overscanCount={2}
          fillerColumn="append"
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
