import { useMemo } from 'react';

export enum ItemPosition {
  PRE = 'pre',
  MID = 'mid',
  POST = 'post',
}

export type Metadata = {
  meta: {
    [key: number]: {
      size: number;
      offset: number;
      localOffset: number;
    };
  };
  pre: {
    size: number;
    range: number[];
  };
  post: {
    size: number;
    range: number[];
  };
  total: {
    size: number;
    count: number;
  };
};

function useMetadata(count: number, size: number | Function, preCount: number, postCount: number): Metadata {
  return useMemo(() => {
    const getSize = typeof size === 'function' ? size : () => size;

    const getPosition = (itemIndex: number) => {
      if (itemIndex < preCount) {
        return ItemPosition.PRE;
      } else if (itemIndex < count - postCount) {
        return ItemPosition.MID;
      }
      return ItemPosition.POST;
    };

    const meta: any = {};
    let offset = 0;
    let position;
    let startOffset = 0;
    const sizes = { [ItemPosition.PRE]: 0, [ItemPosition.MID]: 0, [ItemPosition.POST]: 0 };
    for (let itemIndex = 0; itemIndex < count; itemIndex += 1) {
      const size = getSize(itemIndex);
      if (position !== getPosition(itemIndex)) {
        position = getPosition(itemIndex);
        startOffset = offset;
      }
      meta[itemIndex] = { size, offset, localOffset: offset - startOffset, position };
      sizes[position] += size;
      offset += size;
    }
    return {
      meta,
      pre: { size: sizes[ItemPosition.PRE], range: [0, preCount] },
      post: { size: sizes[ItemPosition.POST], range: [count - postCount, count] },
      total: { size: offset, count },
    };
  }, [count, size]);
}

export { useMetadata };
