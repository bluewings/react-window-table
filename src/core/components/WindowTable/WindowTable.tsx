import * as React from 'react';
import { Fragment, FunctionComponent, useMemo, SyntheticEvent, useState, useRef } from 'react';
import { css } from 'emotion';
// import template from './WindowTable.pug';

import styles from './WindowTable.module.scss';

type ScrollEvent = SyntheticEvent<HTMLDivElement>;

const [scrollbarWidth, scrollbarHeight] = (() => {
  const scrollDiv = document.createElement('div');
  scrollDiv.className = css({
    width: 100,
    height: 100,
    overflow: 'scroll',
    position: 'absolute',
    top: -9999,
  });
  document.body.appendChild(scrollDiv);
  const sizes = [scrollDiv.offsetWidth - scrollDiv.clientWidth, scrollDiv.offsetHeight - scrollDiv.clientHeight];
  document.body.removeChild(scrollDiv);
  return sizes;
})();

// console.log(scrollbarWidth, scrollbarHeight); // Mac:  15

enum ItemType {
  COLUMN = 'column',
  ROW = 'row',
}

type WindowTableProps = {
  scrollTop?: number;
  scrollLeft?: number;
  // maxScrollY?: number
  // maxScrollX?: number

  cellStyle?: string;

  // columns: array
  columnCount: number;
  columnWidth: Function;

  containerStyle?: string;
  contentHeight: number;
  contentWidth: number;
  guidelineStyle?: Function;

  rowCount: number;
  rowHeight: Function;

  fixedTopCount: number;
  fixedLeftCount: number;
  fixedRightCount: number;
  fixedBottomCount: number;

  // = 0, fixedBottomCount = 0, fixedLeftCount = 0, fixedRightCount = 0

  // left?: object
  // right?: object
  // center: object
  // top?: object
  // bottom?: object

  // rowHeight: Function
  // rows: array
  scrollbarHandleStyle?: Function;
  scrollbarTrackStyle?: Function;
  scrollbarWidth: number;
  scrollbarX: Boolean;
  scrollbarY: Boolean;
};

// const WindowTable: FunctionComponent<{ name?: string }> = ({ name = 'Someone' }) => {
//   return <h1>WindowTable</h1>;
//   // return template({
//   //   // variables
//   //   name,
//   // });
// };

type Metadata = {
  dict: {
    [key: number]: {
      size: number;
      offset: number;
    };
  };
  totalCount: number;
  totalSize: number;
};

enum ItemPosition {
  PRE = '1',
  CENTER = '2',
  POST = '3',
}

function useMetadata(totalCount: number, size: number | Function, prefixCount: number, postfixCount: number): Metadata {
  return useMemo(() => {
    const dict: any = {};
    let offset = 0;
    const getSize = typeof size === 'function' ? size : () => size;

    // let p1 = prefi
    let p1 = prefixCount;

    let p2 = totalCount - postfixCount;
    let impQ = 0;

    let preOffset = 0;
    let postOffset = 0;
    let preWidth = 0;
    let postSize = 0;

    for (let itemIndex = 0; itemIndex < totalCount; itemIndex += 1) {
      const size = getSize(itemIndex);
      let position;
      if (itemIndex === prefixCount) {
        position = ItemPosition.CENTER;
      }
      // let position;
      if (itemIndex < prefixCount) {
        position = ItemPosition.PRE;
      } else if (itemIndex < totalCount - postfixCount) {
        position = ItemPosition.CENTER;
      } else {
        position = ItemPosition.POST;
      }
      if (p1 === itemIndex) {
        impQ = offset;
        preOffset = offset;
      }
      if (p2 === itemIndex) {
        impQ = offset;
        postOffset = offset;
      }
      dict[itemIndex] = {
        size,
        offset,
        localOffset: offset - impQ,
        position,
      };
      if (position === ItemPosition.PRE) {
        preWidth += size;
      }
      if (position === ItemPosition.POST) {
        postSize += size;
      }
      offset += size;
    }
    return {
      dict,
      totalCount,
      totalSize: offset,
      preOffset,
      postOffset,
      postSize,
      ranges: {
        pre: [0, prefixCount],
        // main: [],
        post: [totalCount - postfixCount, totalCount],
      },
    };
  }, [totalCount, size]);
}

// type ItemType = ItemType.COLUMN | ItemType.ROW;

function useHelpers(columnMetadata: Metadata, rowMetadata: Metadata) {
  return useMemo(() => {
    const columnCount = columnMetadata.totalCount;
    const rowCount = rowMetadata.totalCount;
    const getItemMetadata = (itemType: ItemType, itemIndex: number) => {
      // console.log(columnMetadataMap, rowMetadataMap);
      return (itemType === ItemType.COLUMN ? columnMetadata : rowMetadata).dict[itemIndex];
    };

    const getItemCount = (itemType: ItemType) => (itemType === ItemType.ROW ? rowCount : columnCount);

    const getSize = (itemType: ItemType, count: number): number => {
      const dict = (itemType === ItemType.COLUMN ? columnMetadata : rowMetadata).dict;
      const itemCount = itemType === ItemType.COLUMN ? columnCount : rowCount;
      let size = 0;
      if (count > 0) {
        for (let itemIndex = 0; itemIndex < count; itemIndex += 1) {
          size += dict[itemIndex].size;
        }
      } else {
        for (let itemIndex = itemCount - 1; itemIndex >= itemCount + count; itemIndex -= 1) {
          size += dict[itemIndex].size;
        }
      }
      return size;
    };

    return {
      getItemMetadata,
      getItemCount,
      getSize,
    };
  }, [columnMetadata, rowMetadata]);
}

function useItems(rowRange, colRange, getCachedStyle: Function) {
  const [rowStartIndex, rowStopIndex] = rowRange;
  const [columnStartIndex, columnStopIndex] = colRange;
  return useMemo(() => {
    // const

    const items = [];

    for (let rowIndex = rowStartIndex; rowIndex < rowStopIndex; rowIndex++) {
      for (let colIndex = columnStartIndex; colIndex < columnStopIndex; colIndex++) {
        const key = rowIndex + '_' + colIndex;
        const { content, style } = getCachedStyle(rowIndex, colIndex);
        items.push(
          <div key={key} style={style} className={(rowIndex + colIndex) % 2 ? styles.odd : styles.even}>
            {content}
            {/* {rowIndex}, {colIndex} */}
          </div>,
        );
      }
    }
    return items;
  }, [rowStartIndex, rowStopIndex, columnStartIndex, columnStopIndex]);
}

const WindowTable: FunctionComponent<WindowTableProps> = (props) => {
  const { width, height } = props;

  const { columnCount, columnWidth, rowCount, rowHeight } = props;
  const { fixedTopCount = 0, fixedBottomCount = 0, fixedLeftCount = 0, fixedRightCount = 0 } = props;

  const columnMetadata = useMetadata(columnCount, columnWidth, fixedLeftCount, fixedRightCount);
  const rowMetadata = useMetadata(rowCount, rowHeight, fixedTopCount, fixedBottomCount);

  const totalWidth = columnMetadata.totalSize;
  const totalHeight = rowMetadata.totalSize;
  const [contentWidth, contentHeight] = useMemo(() => {
    let contentWidth = width;
    let contentHeight = height;
    const totalWidth = columnMetadata.totalSize;
    const totalHeight = rowMetadata.totalSize;
    const scrollbarX = contentWidth < totalWidth;
    let scrollbarY = contentHeight < totalHeight;

    contentWidth -= scrollbarY ? scrollbarWidth : 0;
    contentHeight -= scrollbarX ? scrollbarWidth : 0;

    if (totalHeight < contentHeight) {
      contentHeight = totalHeight;
    }

    if (scrollbarX && !scrollbarY && contentHeight < totalHeight) {
      scrollbarY = true;
      contentWidth -= scrollbarWidth;
    }

    return [contentWidth, contentHeight];
  }, [width, height, columnMetadata.totalSize, rowMetadata.totalSize]);

  const helpers = useHelpers(columnMetadata, rowMetadata);

  const { getItemCount, getItemMetadata, getSize } = helpers;

  const helper2 = useMemo(() => {
    // binary search
    const findNearestItem = (itemType: ItemType, offset: number) => {
      let low = 0;
      let high = getItemCount(itemType) - 1;
      while (low <= high) {
        const middle = low + Math.floor((high - low) / 2);
        const currentOffset = getItemMetadata(itemType, middle).offset;
        if (currentOffset === offset) {
          return middle;
        } else if (currentOffset < offset) {
          low = middle + 1;
        } else if (currentOffset > offset) {
          high = middle - 1;
        }
      }
      return low > 0 ? low - 1 : 0;
    };

    const getStartIndexForOffset = (itemType: ItemType, offset: number) => {
      // const { fixedTopCount, fixedLeftCount, getItemMetadata } = this.props;
      const itemIndex = itemType === ItemType.ROW ? fixedTopCount : fixedLeftCount;
      const itemMetadata = getItemMetadata(itemType, itemIndex);
      // console.log(itemType, itemIndex, itemMetadata);
      return findNearestItem(itemType, offset + itemMetadata.offset);
    };

    const getStopIndexForStartIndex = (itemType: ItemType, startIndex: number, offset: number) => {
      let maxOffset = (itemType === ItemType.ROW ? contentHeight : contentWidth) + offset;
      const postfixCount = itemType === ItemType.ROW ? fixedBottomCount : fixedRightCount;
      if (postfixCount > 0) {
        maxOffset -= getSize(itemType, postfixCount * -1);
      }

      const itemMetadata = getItemMetadata(itemType, startIndex);
      let currOffset = itemMetadata.offset + itemMetadata.size;
      let stopIndex = startIndex;
      const itemCount = getItemCount(itemType);
      while (stopIndex < itemCount - 1 && currOffset < maxOffset) {
        stopIndex += 1;
        currOffset += getItemMetadata(itemType, stopIndex).size;
      }

      return stopIndex;
    };

    const getOverscanCount = (
      direction: string,
      startIndex: number,
      stopIndex: number,
      minIndex: number,
      maxIndex: number,
      _overscanCount: number,
    ) => {
      const overscanBackward = direction === 'backward' ? Math.max(1, _overscanCount) : 1;
      const overscanForward = direction === 'forward' ? Math.max(1, _overscanCount) : 1;
      return {
        overscanStartIndex: Math.max(0, minIndex, startIndex - overscanBackward),
        overscanStopIndex: Math.max(0, Math.min(maxIndex, stopIndex + overscanForward)),
      };
    };

    return {
      getStartIndexForOffset,
      getStopIndexForStartIndex,
      getOverscanCount,
    };
  }, [
    fixedTopCount,
    fixedBottomCount,
    fixedLeftCount,
    fixedRightCount,
    getItemCount,
    getItemMetadata,
    contentWidth,
    contentHeight,
    getSize,
  ]);

  // const scrollTop = 0;
  // const scrollLeft = 0;

  const [{ scrollTop, scrollLeft }, setScroll] = useState({ scrollTop: 0, scrollLeft: 0 });

  const rowStartIndex = helper2.getStartIndexForOffset(ItemType.ROW, scrollTop);

  const rowStopIndex = helper2.getStopIndexForStartIndex(ItemType.ROW, rowStartIndex, scrollTop);
  const columnStartIndex = helper2.getStartIndexForOffset(ItemType.COLUMN, scrollLeft);
  const columnStopIndex = helper2.getStopIndexForStartIndex(ItemType.COLUMN, columnStartIndex, scrollLeft);

  // console.log({
  //   rowStartIndex, rowStopIndex,
  //   columnStartIndex, columnStopIndex,
  // });

  const handleScroll = (event: ScrollEvent) => {
    const { clientWidth, scrollTop, scrollLeft, scrollWidth } = event.currentTarget;
    // console.log(clientInformation, scrollLeft, scrollWidth);
    // console.log(scrollTop, scrollLeft);
    setScroll({
      scrollTop,
      scrollLeft,
    });
  };

  const getItemStyle = (rowIndex: number, columnIndex: number) => {
    const row = getItemMetadata(ItemType.ROW, rowIndex);
    const column = getItemMetadata(ItemType.COLUMN, columnIndex);

    return {
      position: 'absolute',
      top: row.position === ItemPosition.POST ? row.localOffset : row.offset,
      // left: column.offset,
      left: column.position === ItemPosition.POST ? column.localOffset : column.offset,
      height: row.size,
      width: column.size,
    };
    // console.log(row);
  };

  // const keyIndex = useRef(0);
  // const keys = useRef({});

  // rowStartIndex
  // const r1 = rowStopIndex - rowStartIndex + 1;
  // const r2 = columnStopIndex - columnStartIndex + 1;

  // for (let rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++) {
  //   for (let colIndex = columnStartIndex; colIndex <=  columnStopIndex; colIndex++) {

  //     const key = `${rowIndex}_${colIndex}`;
  //     if (itemMap)
  //     // if (itemMap = {};)
  //   }
  // // }

  // for (let rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++) {
  //   for (let colIndex = columnStartIndex; colIndex <=  columnStopIndex; colIndex++) {
  //     const key = (rowIndex % r1) + '_' + (colIndex % r2);
  //     // // itemMap[key] =
  //     // const style = getItemStyle(rowIndex, colIndex);
  //     // items.push(
  //     //   <div key={key} style={style}>{key}, {rowIndex}, {colIndex}</div>
  //     // )
  //   }

  // }

  // const r1 = 8;
  // const r2 = 8;

  // const tmp = {};

  // for (let rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++) {
  //   for (let colIndex = columnStartIndex; colIndex <=  columnStopIndex; colIndex++) {
  //     // const key = (rowIndex % r1) + '_' + (colIndex % r2);
  //     const key = (rowIndex) + '_' + (colIndex);
  //     if (itemMap.current[key]) {
  //       tmp[key] = itemMap.current[key];
  //       delete itemMap.current[key];
  //       // itemMap.current[key] = true;
  //     }
  //   }
  // }

  // Object.keys(itemMap.current).filter(e => itemMap.current[e] === false)\
  // const trashed = Object.values(itemMap.current);

  // itemMap.current = {};

  const cached = useRef({});

  const r1Map = {
    [ItemPosition.PRE]: 'T',
    [ItemPosition.POST]: 'B',
    [ItemPosition.CENTER]: '',
  };
  const r2Map = {
    [ItemPosition.PRE]: 'L',
    [ItemPosition.POST]: 'R',
    [ItemPosition.CENTER]: '',
  };

  const getItemContent = (rowIndex: number, columnIndex: number) => {
    const row = getItemMetadata(ItemType.ROW, rowIndex);
    const column = getItemMetadata(ItemType.COLUMN, columnIndex);

    let r1 = r1Map[row.position] + r2Map[column.position] || 'C';

    return r1;
    // console.log(row);
  };

  const getCachedStyle = (rowIndex, colIndex) => {
    // return getItemStyle(rowIndex, colIndex);
    const key = rowIndex + '_' + colIndex;
    if (!cached.current[key]) {
      cached.current[key] = {
        content: getItemContent(rowIndex, colIndex),
        style: getItemStyle(rowIndex, colIndex),
      };
    }
    return cached.current[key];
  };

  // const items = useMemo(() => {
  //   // const

  //   const items = [];

  //   for (let rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++) {
  //     for (let colIndex = columnStartIndex; colIndex <= columnStopIndex; colIndex++) {
  //       const key = rowIndex + '_' + colIndex;
  //       const style = getCachedStyle(rowIndex, colIndex);
  //       items.push(
  //         <div key={key} style={style} className={(rowIndex + colIndex) % 2 && styles.odd}>
  //           {rowIndex}, {colIndex}
  //         </div>,
  //       );
  //     }
  //   }
  //   return items;
  // }, [rowStartIndex, rowStopIndex, columnStartIndex, columnStopIndex]);

  // const ranges = {
  //   top: []
  // }

  // columnR
  const ranges = {
    left: columnMetadata.ranges.pre,
    right: columnMetadata.ranges.post,
    top: rowMetadata.ranges.pre,
    bottom: rowMetadata.ranges.post,
    mainV: [rowStartIndex, rowStopIndex + 1],
    mainH: [columnStartIndex, columnStopIndex + 1],
  };

  const items = useItems(ranges.mainV, ranges.mainH, getCachedStyle);

  const lItems = useItems(
    ranges.mainV,
    ranges.left,
    // ranges.left,
    getCachedStyle,
  );

  const tItems = useItems(ranges.top, ranges.mainH, getCachedStyle);

  // const {columnCount, rowCount} = props;
  const tlItems = useItems(ranges.top, ranges.left, getCachedStyle);

  const bItems = useItems(ranges.bottom, ranges.mainH, getCachedStyle);

  const rItems = useItems(ranges.mainV, ranges.right, getCachedStyle);
  // const columnMetadata = useMetadata(props.columnCount, props.columnWidth);
  // const rowMetadata = useMetadata(props.rowCount, props.rowHeight);

  // const tlItems = [];

  const brItems = useItems(
    // 0,  - 1,
    ranges.bottom,
    ranges.right,
    getCachedStyle,
  );

  const blItems = useItems(
    // 0,  - 1,

    ranges.bottom,
    ranges.left,
    getCachedStyle,
  );

  const trItems = useItems(
    // 0,  - 1,
    ranges.top,
    ranges.right,
    getCachedStyle,
  );

  // const rItems = useItems(
  //   // 0,  - 1,
  //   rowStartIndex, rowStopIndex,
  //   columnCount - fixedRightCount,     columnCount - 1,
  //   getCachedStyle,
  // )

  // for (let rowIndex = 0; rowIndex < fixedTopCount; rowIndex++) {
  //   for (let colIndex = 0; colIndex < fixedLeftCount; colIndex++) {
  //     const key = rowIndex + '_' + colIndex;
  //     const style = getCachedStyle(rowIndex, colIndex);
  //     tlItems.push(
  //       <div key={key} style={style} className={(rowIndex + colIndex) % 2 ? styles.odd : styles.even}>
  //         {rowIndex}, {colIndex}
  //       </div>,
  //     );
  //   }
  // }

  // useScrollbarWidth();
  return (
    <div>
      <h4>
        {scrollLeft}, {scrollTop}, {contentWidth}, {contentHeight}
      </h4>
      <h4>
        col: {columnStartIndex}, {columnStopIndex}
      </h4>
      <h4>
        row: {rowStartIndex}, {rowStopIndex}
      </h4>

      <div style={{ width, height }} className={styles.root} onScroll={handleScroll}>
        <div style={{ width: totalWidth, height: totalHeight }} className={styles.inner}>
          {items}
        </div>
        <div className={styles.stickyContainer} style={{ left: 0 }}>
          {lItems}
        </div>
        <div className={styles.stickyContainer} style={{ top: 0 }}>
          {tItems}
        </div>
        <div className={styles.stickyContainer} style={{ top: 0, left: 0 }}>
          {tlItems}
        </div>

        <div className={styles.stickyContainer} style={{ top: contentHeight - rowMetadata.postSize }}>
          {bItems}
        </div>
        <div className={styles.stickyContainer} style={{ left: contentWidth - columnMetadata.postSize }}>
          {rItems}
        </div>

        <div
          className={styles.stickyContainer}
          style={{ top: contentHeight - rowMetadata.postSize, left: contentWidth - columnMetadata.postSize }}
        >
          {brItems}
        </div>

        <div className={styles.stickyContainer} style={{ top: contentHeight - rowMetadata.postSize, left: 0 }}>
          {blItems}
        </div>

        <div className={styles.stickyContainer} style={{ top: 0, left: contentWidth - columnMetadata.postSize }}>
          {trItems}
        </div>
        {/* <pre>{JSON.stringify({ contentWidth, contentHeight }, null, 2)}</pre> */}
      </div>
      <pre>{JSON.stringify({ columnMeta: columnMetadata }, null, 2)}</pre>
    </div>
  );
  return <h1>WindowTable</h1>;
  // return template({
  //   // variables
  //   name,
  // });
};

export default WindowTable;
