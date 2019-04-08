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
      post: { count: postCount, size: sizes[ItemPosition.POST], range: [count - postCount, count] },
      total: { size: offset, count, range: [0, count] },
    };
  }, [count, size]);
}

function useMetadataFixed(metadata: Metadata, clientSize: number, fillerType: any, minVisibleScrollViewWidth: number) {
  const totalSize = metadata.total.size;
  const preSize = metadata.pre.size;
  const postSize = metadata.post.size;
  const mass = useMemo(() => {
    let mass = clientSize - totalSize;
    if (mass < 0) {
      mass = -1;
    }
    // console.log(minVisibleScrollViewWidth);

    if (preSize + postSize + (minVisibleScrollViewWidth || 0) > clientSize) {
      mass = 0;
    }
    return mass;
  }, [clientSize, totalSize, preSize, postSize, minVisibleScrollViewWidth]);
  // mass = clientWidth -

  // console.log( clientWidth , metadata.total.size, metadata.pre.size, metadata.post.size);

  // // console.log(contentWidth, metadata.total.size)
  return useMemo(() => {
    if (mass >= 0) {
      metadata = {
        meta: Object.keys(metadata.meta).reduce((accum, key: any) => {
          let value = metadata.meta[key];
          let _value = {
            ...value,
            // @ts-ignore
            offset: value.offset_,
            // @ts-ignore
            localOffset: value.offset_,
          };
          return {
            ...accum,
            [key]: _value,
          };
        }, {}),
        // @ts-ignore
        pre: { count: 0, size: 0, range: [0, 0] },
        // @ts-ignore
        mid: {
          ...metadata.total,

          // range: [0, metadata.total.count],
        },
        // @ts-ignore
        post: { count: 0, size: 0, range: [metadata.total.count, 0] },
        total: metadata.total,
      };

      if (mass > 0) {
        if (fillerType === true || fillerType === 'append') {
          // // console.log(mass, metadata.total.size);
          const contentSize = metadata.total.size + mass;
          metadata = {
            ...metadata,
            // contentSize,

            meta: {
              ...metadata.meta,
              [metadata.total.count]: {
                size: mass,
                localOffset: metadata.total.size,
                offset: metadata.total.size,
                // @ts-ignore
                filler: true,
              },
            },
            total: {
              ...metadata.total,
              count: metadata.total.count + 1,
              size: contentSize,
            },
            mid: {
              ...metadata.total,
              // @ts-ignore
              count: metadata.total.count + 1,
              range: [0, metadata.total.count + 1],
              size: contentSize,
            },
          };
        } else if (fillerType === 'stretch') {
          const contentSize = metadata.total.size + mass;
          const lastKey = metadata.total.count - 1;
          metadata = {
            ...metadata,
            meta: {
              ...metadata.meta,
              [lastKey]: {
                ...metadata.meta[lastKey],

                size: metadata.meta[lastKey].size + mass,
                // localOffset: metadata.total.size,
                // offset: metadata.total.size,
                // filler: true,
              },
            },
            total: {
              ...metadata.total,
              size: contentSize,
            },
            // @ts-ignore
            mid: {
              ...metadata.total,
              size: contentSize,
            },
          };
          // console.log('-=-=-=-=- case 2');
          // console.log(metadata);
        }
        // console.log('-=-=-=-=-');
        // console.log(metadata);
      }
    }
    return metadata;
  }, [metadata, mass, fillerType]);

  // return metadata
}

export default useMetadata;

export { useMetadataFixed };
