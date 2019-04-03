import { useMemo, useEffect, useState, useRef } from 'react';
import { css } from 'emotion';

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
  mid: {
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
      const localOffset = offset - startOffset;
      const offset_ = position === ItemPosition.POST ? localOffset : offset;
      // left: column.position === ItemPosition.POST ? column.localOffset : column.offset,

      // meta[itemIndex] = { size, offset: offset_, localOffset, position };
      meta[itemIndex] = { size, offset: offset_, localOffset, offset_: offset };
      sizes[position] += size;
      offset += size;
    }
    return {
      meta,
      pre: { count: preCount, size: sizes[ItemPosition.PRE], range: [0, preCount] },
      mid: { size: sizes[ItemPosition.MID], range: [preCount, count - postCount] },
      post: { count: preCount, size: sizes[ItemPosition.POST], range: [count - postCount, count] },
      total: { size: offset, count, range: [0, count] },
    };
  }, [count, size]);
}

function useMetadataFixed (metadata, contentWidth) {


// console.log(contentWidth, metadata.total.size)
  return useMemo(() => {
    if (contentWidth >= metadata.total.size ) {
      console.log(contentWidth, metadata.total.size)
      // const mi
      metadata = {
        // ...metadata,
        meta: Object.keys(metadata.meta).reduce((accum, key) => {
          let value = metadata.meta[key];
          
  
          let _value = {
            ...value,
            offset: value.offset_,
            localOffset: value.offset_,
            V: true,
            // position: ItemPosition.MID
          }
          // console.log(key, value, _value);
  
          return {
            ...accum,
            [key]: _value
          }
        }, {}),
        pre: { count: 0, size: 0, range: [0, 0] },
        mid: { ...metadata.total },
        post: { count: 0, size: 0, range: [metadata.total.count, 0] },
        total: metadata.total,
      }
      console.log(metadata)
    }
    return metadata;
  }, [metadata, contentWidth > metadata.total.size])
  
 
  // return metadata
}

export default useMetadata;

export { useMetadataFixed }
