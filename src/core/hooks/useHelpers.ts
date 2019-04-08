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

  fixedTopCount?: number;
  fixedLeftCount?: number;
  fixedRightCount?: number;
  fixedBottomCount?: number;
  overscanCount?: number;

  innerWidth: number;
  innerHeight: number;
  scrollbarWidth: number;
  scrollbarHeight: number;
  fillerColumn?: string;
  fillerRow?: string;
  minVisibleScrollViewWidth?: number;
  minVisibleScrollViewHeight?: number;
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
}: {
  fixedTopCount: number;
  fixedBottomCount: number;
  fixedLeftCount: number;
  fixedRightCount: number;
  contentWidth: number;
  contentHeight: number;
  getItemCount: Function;
  getItemMetadata: Function;
  getSize: Function;
}) {
  const helper2 = useMemo(() => {
    // console.log({
    //   fixedTopCount,
    //   fixedBottomCount,
    //   fixedLeftCount,
    //   fixedRightCount,
    //   contentWidth,
    //   contentHeight,
    //   getItemCount,
    //   getItemMetadata,
    //   getSize,
    // }

    // )
    // binary search
    const findNearestItem = (itemType: ItemType, offset: number) => {
      let low = 0;
      let high = getItemCount(itemType) - 1;

      // if (itemType === ItemType.COLUMN) {
      //   console.log({
      //     low,
      //     high,
      //   });
      // }
      while (low <= high) {
        const middle = low + Math.floor((high - low) / 2);
        const currentOffset = getItemMetadata(itemType, middle).offset_;
        if (currentOffset === offset) {
          return middle;
        } else if (currentOffset < offset) {
          low = middle + 1;
        } else if (currentOffset > offset) {
          high = middle - 1;
        }
      }
      // console.log(low);
      return low > 0 ? low - 1 : 0;
    };

    const getStartIndex = (itemType: ItemType, offset: number) => {
      const itemIndex = itemType === ItemType.ROW ? fixedTopCount : fixedLeftCount;
      const itemMetadata = getItemMetadata(itemType, itemIndex);
      // if (itemType === ItemType.COLUMN) {
      //   console.log(itemIndex, offset, itemMetadata.offset);
      // }

      return findNearestItem(itemType, offset + itemMetadata.offset);
    };

    const getStopIndex = (itemType: ItemType, startIndex: number, offset: number) => {
      let maxOffset = (itemType === ItemType.ROW ? contentHeight : contentWidth) + offset;
      const postfixCount = itemType === ItemType.ROW ? fixedBottomCount : fixedRightCount;
      if (postfixCount > 0) {
        // maxOffset -= getSize(itemType, postfixCount * -1);
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

function useDefaultProps(props: any) {
  return useMemo(() => {
    return {
      fixedTopCount: ~~props.fixedTopCount,
      fixedLeftCount: ~~props.fixedLeftCount,
      fixedRightCount: ~~props.fixedRightCount,
      fixedBottomCount: ~~props.fixedBottomCount,
      minVisibleScrollViewWidth: ~~props.minVisibleScrollViewWidth,
      minVisibleScrollViewHeight: ~~props.minVisibleScrollViewHeight,
      overscanCount: ~~props.overscanCount,
    };
  }, [
    props.fixedTopCount,
    props.fixedLeftCount,
    props.fixedRightCount,
    props.fixedBottomCount,
    props.minVisibleScrollViewWidth,
    props.minVisibleScrollViewHeight,
    props.overscanCount,
  ]);
}

function useHelpers(props: HelpersProps) {
  const {
    columnCount,
    columnWidth,
    rowCount,
    rowHeight,
    innerWidth: _innerWidth,
    innerHeight: _innerHeight,
    scrollbarWidth,
    scrollbarHeight,
    fillerColumn,
    fillerRow,
  } = props;

  const {
    fixedTopCount,
    fixedLeftCount,
    fixedRightCount,
    fixedBottomCount,
    minVisibleScrollViewWidth,
    minVisibleScrollViewHeight,
    overscanCount,
  } = useDefaultProps(props);

  let _columnMetadata = useMetadata(columnCount, columnWidth, fixedLeftCount, fixedRightCount);
  let _rowMetadata = useMetadata(rowCount, rowHeight, fixedTopCount, fixedBottomCount);

  const scrollWidth = _columnMetadata.total.size;
  const scrollHeight = _rowMetadata.total.size;

  const [clientWidth, clientHeight, innerWidth, innerHeight] = useMemo(() => {
    let innerWidth = _innerWidth;
    let innerHeight = _innerHeight;

    let contentWidth = innerWidth;

    let contentHeight = innerHeight;
    const scrollbarX = contentWidth < scrollWidth;
    let scrollbarY = contentHeight < scrollHeight;

    contentWidth -= scrollbarY ? scrollbarWidth : 0;
    contentHeight -= scrollbarX ? scrollbarHeight : 0;

    // if (scrollHeight < contentHeight) {
    //   contentHeight = scrollHeight;
    // }

    if (scrollbarX && !scrollbarY && contentHeight < scrollHeight) {
      scrollbarY = true;
      contentWidth -= scrollbarWidth;
    }

    if (fillerColumn === 'shrink' && scrollWidth < contentWidth) {
      contentWidth = scrollWidth;

      innerWidth = scrollWidth + (scrollbarY ? scrollbarWidth : 0);
    }
    // console.log(scrollHeight, contentHeight);
    if (fillerRow === 'shrink' && scrollHeight < contentHeight) {
      contentHeight = scrollHeight;

      innerHeight = scrollHeight + (scrollbarX ? scrollbarHeight : 0);
    }

    return [contentWidth, contentHeight, innerWidth, innerHeight];
  }, [_innerWidth, _innerHeight, scrollWidth, scrollHeight, scrollbarWidth, scrollbarHeight, fillerColumn, fillerRow]);

  let columnMetadata = useMetadataFixed(_columnMetadata, clientWidth, fillerColumn, minVisibleScrollViewWidth);
  let rowMetadata = useMetadataFixed(_rowMetadata, clientHeight, fillerRow, minVisibleScrollViewHeight);

  // minVisibleScrollViewWidth,
  // minVisibleScrollViewHeight,
  // let columnMetadata = _columnMetadata;
  // let rowMetadata = useMetadataFixed(_rowMetadata, clientHeight, false);

  // let rowMetadata = _rowMetadata

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
    // @ts-ignore
    fixedTopCount: rowMetadata.pre.count,
    // @ts-ignore
    fixedBottomCount: rowMetadata.post.count,
    // @ts-ignore
    fixedLeftCount: columnMetadata.pre.count,
    // @ts-ignore
    fixedRightCount: columnMetadata.post.count,
    // @ts-ignore
    contentWidth: columnMetadata.contentSize || clientWidth,
    // @ts-ignore
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
    innerWidth,
    innerHeight,
    //     getStartIndex,
    // getStopIndex,
    getRange,
  };
}

export default useHelpers;
