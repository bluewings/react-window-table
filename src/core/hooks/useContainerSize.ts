import { useEffect, useRef, useState, MutableRefObject } from 'react';

type SizeProps = {
  width?: number;
  height?: number;
};

type ElementRef = MutableRefObject<HTMLDivElement | null>;

const DEFAULT_HEIGHT = 400;

function useOffsetSize(
  props: SizeProps,
  container: ElementRef,
  { borderTopWidth, borderLeftWidth, borderRightWidth, borderBottomWidth },
) {
  const { width, height } = props;
  const [parentWidth, setParentWidth] = useState(typeof width === 'number' ? width : 0);
  const [offsetWidth, setOffsetWidth] = useState(typeof width === 'number' ? width : 0);
  let parentHeight = typeof height === 'number' ? height : DEFAULT_HEIGHT;
  let offsetHeight = parentHeight - borderTopWidth - borderBottomWidth;

  // offsetHeight = offset

  const timer = useRef<number>();
  useEffect(() => {
    if (typeof width === 'number') {
      return;
    }
    function checkSize() {
      timer.current && cancelAnimationFrame(timer.current);
      if (container.current && container.current.parentElement) {
        const rect = container.current.parentElement.getBoundingClientRect();
        const _width = rect.width - borderLeftWidth - borderRightWidth;
        // const _width = rect.width;

        if (parentWidth !== rect.width || offsetWidth !== _width) {
          // console.log(rect.width, borderLeftWidth, borderRightWidth);
          setParentWidth(rect.width);
          setOffsetWidth(_width);
        }
      }
      timer.current = requestAnimationFrame(checkSize);
    }
    checkSize();
    return () => {
      timer.current && cancelAnimationFrame(timer.current);
    };
  }, [width, offsetWidth, borderLeftWidth, borderRightWidth]);
  // }, [width, offsetWidth]);
  return [
    parentWidth,
    parentHeight,
    offsetWidth,
    offsetHeight,
    // borderTopWidth,
    // borderLeftWidth,
    // borderRightWidth,
  ];
}

export default useOffsetSize;
