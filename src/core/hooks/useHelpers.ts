import { useMemo } from 'react';
import useMetadata, { useMetadataFixed, Metadata, ItemPosition } from './useMetadata';

export enum ItemType {
  COLUMN,
  ROW,
  // COLUMN = 'column',
  // ROW = 'row',
}

export enum ScrollDirection {
  FORWARD,
  BACKWARD,
  // FORWARD = 'forward',
  // BACKWARD = 'backward',
}

type HelpersProps = {
  columnCount: number;
  columnWidth: number | Function;
  rowCount: number;
  rowHeight: number | Function;
  fixedTopCount: number;
  fixedBottomCount: number;
  fixedLeftCount: number;
  fixedRightCount: number;
  offsetWidth: number;
  offsetHeight: number;
  scrollbarWidth: number;
  scrollbarHeight: number;
};

function useRangeHelper({
  fixedTopCount,
  fixedBottomCount,
  fixedLeftCount,
  fixedRightCount,
  contentWidth,
  contentHeight,
  getItemCount,
  getItemMetadata,

  getSize,
}) {
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

    const getStartIndex = (itemType: ItemType, offset: number) => {
      const itemIndex = itemType === ItemType.ROW ? fixedTopCount : fixedLeftCount;
      const itemMetadata = getItemMetadata(itemType, itemIndex);
      return findNearestItem(itemType, offset + itemMetadata.offset);
    };

    const getStopIndex = (itemType: ItemType, startIndex: number, offset: number) => {
      let maxOffset = (itemType === ItemType.ROW ? contentHeight : contentWidth) + offset;
      const postfixCount = itemType === ItemType.ROW ? fixedBottomCount : fixedRightCount;
      if (postfixCount > 0) {
        maxOffset -= getSize(itemType, postfixCount * -1);
      }

      const itemMetadata = getItemMetadata(itemType, startIndex);
      let currOffset = itemMetadata.offset + itemMetadata.size;
      let stopIndex = startIndex;
      const itemCount = getItemCount(itemType);
      let _currOffset = currOffset;
      while (stopIndex < itemCount - 1 && currOffset < maxOffset) {
        stopIndex += 1;
        currOffset += getItemMetadata(itemType, stopIndex).size;
      }
      // if (ItemType.ROW === itemType) {
      //   console.log('%c-=-=-=-=-=-=-=-=-=-', 'background:red;color:#fff');
      //   console.log({
      //     startIndex,
      //     stopIndex,
      //     postfixCount,
      //     _currOffset,
      //     maxOffset,
      //     contentHeight,
      //   });
      // }

      return stopIndex;
    };

    // const getOverscanCount = (
    //   direction: string,
    //   startIndex: number,
    //   stopIndex: number,
    //   minIndex: number,
    //   maxIndex: number,
    //   _overscanCount: number,
    // ) => {
    //   const overscanBackward = direction === 'backward' ? Math.max(1, _overscanCount) : 1;
    //   const overscanForward = direction === 'forward' ? Math.max(1, _overscanCount) : 1;
    //   return {
    //     overscanStartIndex: Math.max(0, minIndex, startIndex - overscanBackward),
    //     overscanStopIndex: Math.max(0, Math.min(maxIndex, stopIndex + overscanForward)),
    //   };
    // };

    return {
      getStartIndex,
      getStopIndex,
      // getOverscanCount,
    };
  }, [
    fixedTopCount,
    fixedBottomCount,
    fixedLeftCount,
    fixedRightCount,
    contentWidth,
    contentHeight,
    getItemCount,
    getItemMetadata,

    getSize,
  ]);
  return helper2;
}

function useHelpers(props: HelpersProps) {
  const {
    columnCount,
    columnWidth,
    rowCount,
    rowHeight,
    fixedTopCount,
    fixedBottomCount,
    fixedLeftCount,
    fixedRightCount,
    offsetWidth: _offsetWidth,
    offsetHeight: _offsetHeight,
    scrollbarWidth,
    scrollbarHeight,
    overscanCount,
    fillerColumn,
  } = props;

  let _columnMetadata = useMetadata(columnCount, columnWidth, fixedLeftCount, fixedRightCount);
  let _rowMetadata = useMetadata(rowCount, rowHeight, fixedTopCount, fixedBottomCount);

  const scrollWidth = _columnMetadata.total.size;
  const scrollHeight = _rowMetadata.total.size;

  const [clientWidth, clientHeight, offsetWidth, offsetHeight] = useMemo(() => {
    let offsetWidth = _offsetWidth;
    let offsetHeight = _offsetHeight;

    let contentWidth = offsetWidth;
    let contentHeight = offsetHeight;
    const scrollbarX = contentWidth < scrollWidth;
    let scrollbarY = contentHeight < scrollHeight;

    contentWidth -= scrollbarY ? scrollbarWidth : 0;
    contentHeight -= scrollbarX ? scrollbarHeight : 0;

    if (scrollHeight < contentHeight) {
      contentHeight = scrollHeight;
    }

    if (scrollbarX && !scrollbarY && contentHeight < scrollHeight) {
      scrollbarY = true;
      contentWidth -= scrollbarWidth;
    }

    if (fillerColumn === 'shrink' && scrollWidth < contentWidth) {
      contentWidth = scrollWidth;

      offsetWidth = scrollWidth + (scrollbarY ? scrollbarWidth : 0);
    }

    return [contentWidth, contentHeight, offsetWidth, offsetHeight];
  }, [_offsetWidth, _offsetHeight, scrollWidth, scrollHeight, scrollbarWidth, scrollbarHeight, fillerColumn]);

  let columnMetadata = useMetadataFixed(_columnMetadata, clientWidth, fillerColumn);
  // let columnMetadata = _columnMetadata;
  let rowMetadata = useMetadataFixed(_rowMetadata, clientHeight, false);

  const { getItemMetadata, getItemCount, getSize } = useMemo(() => {
    const columnCount = columnMetadata.total.count;
    const rowCount = rowMetadata.total.count;
    const getItemMetadata = (itemType: ItemType, itemIndex: number) => {
      return (itemType === ItemType.COLUMN ? columnMetadata : rowMetadata).meta[itemIndex];
    };

    const getItemCount = (itemType: ItemType) => (itemType === ItemType.ROW ? rowCount : columnCount);

    const getSize = (itemType: ItemType, count: number): number => {
      const dict = (itemType === ItemType.COLUMN ? columnMetadata : rowMetadata).meta;
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

  const { getStartIndex, getStopIndex } = useRangeHelper({
    fixedTopCount: rowMetadata.pre.count,
    fixedBottomCount: rowMetadata.post.count,
    fixedLeftCount: columnMetadata.pre.count,
    fixedRightCount: columnMetadata.post.count,
    contentWidth: columnMetadata.contentSize || clientWidth,
    contentHeight: rowMetadata.contentSize || clientHeight,
    getItemCount,
    getItemMetadata,

    getSize,
  });

  // function getRange

  // const overscanCount = 2;

  const _overscanCount = typeof overscanCount === 'number' ? overscanCount : 2;

  const getRange = useMemo(() => {
    return (itemType: ItemType, offset: number, scrollDirection: ScrollDirection) => {
      const startIndex = getStartIndex(itemType, offset);
      const stopIndex = getStopIndex(itemType, startIndex, offset);
      // const scrollDirection === ScrollDirection.FORWARD
      return [
        startIndex - (scrollDirection === ScrollDirection.FORWARD ? 0 : _overscanCount),

        stopIndex + (scrollDirection === ScrollDirection.FORWARD ? _overscanCount : 0),
      ];
    };
  }, [getStartIndex, getStopIndex, _overscanCount]);

  return {
    getItemMetadata,
    // getItemCount,
    // getSize,
    columnMetadata,
    rowMetadata,
    scrollWidth,
    scrollHeight,
    clientWidth,
    clientHeight,
    offsetWidth,
    offsetHeight,
    //     getStartIndex,
    // getStopIndex,
    getRange,
  };
}

export default useHelpers;
