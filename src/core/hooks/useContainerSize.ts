import { useEffect, useRef, useState, MutableRefObject } from 'react';

type SizeProps = {
  width?: number;
  height?: number;
};

type ElementRef = MutableRefObject<HTMLDivElement | null>;

const DEFAULT_HEIGHT = 400;

function useContainerSize(props: SizeProps, container: ElementRef) {
  const { width, height } = props;
  const [containerWidth, setContainerWidth] = useState(typeof width === 'number' ? width : 0);
  let containerHeight = typeof height === 'number' ? height : DEFAULT_HEIGHT;

  const timer = useRef<number>();
  useEffect(() => {
    if (typeof width === 'number') {
      return;
    }
    function checkSize() {
      timer.current && cancelAnimationFrame(timer.current);
      if (container.current && container.current.parentElement) {
        const rect = container.current.parentElement.getBoundingClientRect();
        if (containerWidth !== rect.width) {
          setContainerWidth(rect.width);
        }
      }
      timer.current = requestAnimationFrame(checkSize);
    }
    checkSize();
    return () => {
      timer.current && cancelAnimationFrame(timer.current);
    };
  }, [width, containerWidth]);
  return [containerWidth, containerHeight];
}

export default useContainerSize;
