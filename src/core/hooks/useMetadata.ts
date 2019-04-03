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
      meta[itemIndex] = { size, offset: offset_, localOffset };
      sizes[position] += size;
      offset += size;
    }
    return {
      meta,
      pre: { size: sizes[ItemPosition.PRE], range: [0, preCount] },
      mid: { size: sizes[ItemPosition.MID], range: [preCount, count - postCount] },
      post: { size: sizes[ItemPosition.POST], range: [count - postCount, count] },
      total: { size: offset, count },
    };
  }, [count, size]);
}

// function useScrollbarSize(): number[] {
//   const scrollDiv = useRef<HTMLDivElement>();
//   const [info, setInfo] = useState(() => {
//     scrollDiv.current = document.createElement('div');
//     scrollDiv.current.className = css({
//       position: 'absolute',
//       top: -9999,
//       width: 100,
//       height: 100,
//       overflow: 'scroll',
//     });
//     document.body.appendChild(scrollDiv.current);
//     const { offsetWidth, offsetHeight, clientWidth, clientHeight } = scrollDiv.current;
//     return { offsetWidth, offsetHeight, clientWidth, clientHeight };
//   });

//   const timer = useRef<number>();
//   useEffect(() => {
//     if (info.offsetWidth > 0 && info.offsetHeight > 0) {
//       return;
//     }
//     function sizeCheck() {
//       timer.current && cancelAnimationFrame(timer.current);
//       if (scrollDiv.current) {
//         const { offsetWidth, offsetHeight, clientWidth, clientHeight } = scrollDiv.current;
//         if (offsetWidth > 0 && offsetHeight > 0) {
//           setInfo({ offsetWidth, offsetHeight, clientWidth, clientHeight });
//           document.body.removeChild(scrollDiv.current);
//           scrollDiv.current = undefined;
//           return;
//         }
//       }
//       timer.current = requestAnimationFrame(sizeCheck);
//     }
//     sizeCheck();
//     return () => {
//       timer.current && cancelAnimationFrame(timer.current);
//       scrollDiv.current && document.body.removeChild(scrollDiv.current);
//     };
//   }, []);

//   return useMemo(() => [info.offsetWidth - info.clientWidth, info.offsetHeight - info.clientHeight], [
//     info.offsetWidth,
//     info.clientWidth,
//     info.offsetHeight,
//     info.clientHeight,
//   ]);
// }

export default useMetadata;
