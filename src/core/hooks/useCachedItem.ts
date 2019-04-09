// import { useCachedItem } from ".";
import { createElement, useMemo, useRef } from 'react';
import { ItemType } from './useHelpers';

function useCachedItem(props: any) {
  const getItemMetadata = props.getItemMetadata;
  const { columnCount, columnWidth, rowCount, rowHeight, classNames } = props;
  const getItemStyle = (rowIndex: number, columnIndex: number) => {
    const row = getItemMetadata(ItemType.ROW, rowIndex);
    const column = getItemMetadata(ItemType.COLUMN, columnIndex);

    const style = { position: 'absolute', top: row.offset, height: row.size, left: column.offset, width: column.size };

    if (row.filler || column.filler) {
      // @ts-ignore
      style.overflow = 'hidden';
    }

    return {
      isFiller: column.filler || row.filler,
      rowIndex: row.filler ? -1 : rowIndex,
      columnIndex: column.filler ? -1 : columnIndex,
      style,
    };
  };

  const cached__tmp = useRef<any>({});

  const cached = useMemo(() => {
    cached__tmp.current = {};

    console.log('%c CACHE CLEARED!!!', 'background:yellow');

    return cached__tmp;
  }, [columnCount, columnWidth, rowCount, rowHeight, props.children, getItemMetadata]);

  const { children } = props;

  const getItemContent = useMemo(() => {
    if (typeof children === 'function') {
      return (rowIndex: number, columnIndex: number, key: string, className: string, style: any, isFiller: boolean) => {
        // @ts-ignore
        return createElement(children, {
          columnIndex,
          rowIndex,
          className,
          key,
          style,
          isFiller,
        });
      };
    }
    return () => null;
  }, [children]);

  // const getClassName = (rowIndex, colIndex)

  const getCachedStyle = useMemo(() => {
    return (rowIndex: number, colIndex: number, rowTypes: any, colTypes: any) => {
      const key = rowIndex + '_' + colIndex;
      if (!cached.current[key]) {
        const { style, isFiller, rowIndex: _rowIndex, columnIndex: _colIndex } = getItemStyle(rowIndex, colIndex);
        const key = rowIndex + '_' + colIndex;
        const className = [
          classNames.CELL,
          // 'cell',
          ...rowTypes.map((e: string) => 'row-' + e),
          ...colTypes.map((e: string) => 'col-' + e),
          rowIndex % 2 == 0 ? classNames.ROW_EVEN : classNames.ROW_ODD,
          colIndex % 2 == 0 ? classNames.COL_EVEN : classNames.COL_ODD,
          // colIndex % 2 == 0 ? 'col-even' : 'col-odd',
        ].join(' ');
        cached.current[key] = {
          className,
          content: getItemContent(_rowIndex, _colIndex, key, className, style, isFiller),
          style,
        };
      }
      return cached.current[key];
    };
  }, [cached.current, getItemContent, getItemMetadata, classNames]);

  return getCachedStyle;
}

export default useCachedItem;
