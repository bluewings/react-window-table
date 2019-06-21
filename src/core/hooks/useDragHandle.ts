import { useMemo, useRef, useState } from 'react';
import styles from './useDragHandle.module.scss';

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

export default useDragHandle;
