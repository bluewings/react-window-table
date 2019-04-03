// import { useCachedItem } from ".";
import { createElement, useMemo, useRef } from 'react';
import { ItemType } from './useHelpers';

function useCachedItem(props) {
  const getItemMetadata = props.getItemMetadata;
  const { columnCount, columnWidth, rowCount, rowHeight } = props;
  const getItemStyle = (rowIndex: number, columnIndex: number) => {
    const row = getItemMetadata(ItemType.ROW, rowIndex);
    const column = getItemMetadata(ItemType.COLUMN, columnIndex);
    return { position: 'absolute', top: row.offset, height: row.size, left: column.offset, width: column.size };
  };

  const cached__tmp = useRef<any>({});

  const cached = useMemo(() => {
    cached__tmp.current = {};

    return cached__tmp;
  }, [columnCount, columnWidth, rowCount, rowHeight, props.children]);

  const { children } = props;

  const getItemContent = useMemo(() => {
    if (typeof children === 'function') {
      return (rowIndex: number, columnIndex: number, key: string, style: any) => {
        // @ts-ignore
        return createElement(children, {
          columnIndex,
          rowIndex,
          key,
          style,
        });
      };
    }
    return () => null;
  }, [children]);

  const getCachedStyle = useMemo(() => {
    // console.log('%c NEW FUNC !!!', 'background:yellow');
    return (rowIndex: number, colIndex: number) => {
      // return getItemStyle(rowIndex, colIndex);
      const key = rowIndex + '_' + colIndex;
      if (!cached.current[key]) {
        const style = getItemStyle(rowIndex, colIndex);
        const key = rowIndex + '_' + colIndex;
        cached.current[key] = {
          content: getItemContent(rowIndex, colIndex, key, style),
          style,
        };
      }
      return cached.current[key];
    };
  }, [cached.current, getItemContent]);

  return getCachedStyle;
}

export default useCachedItem;
