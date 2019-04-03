import { useRef, useState, useEffect, useMemo } from 'react';
import { css } from 'emotion';

function useScrollbarSize(): number[] {
  const scrollDiv = useRef<HTMLDivElement>();
  const [info, setInfo] = useState(() => {
    scrollDiv.current = document.createElement('div');
    scrollDiv.current.className = css({
      position: 'absolute',
      top: -9999,
      width: 100,
      height: 100,
      overflow: 'scroll',
    });
    document.body.appendChild(scrollDiv.current);
    const { offsetWidth, offsetHeight, clientWidth, clientHeight } = scrollDiv.current;
    return { offsetWidth, offsetHeight, clientWidth, clientHeight };
  });

  const timer = useRef<number>();
  useEffect(() => {
    if (info.offsetWidth > 0 && info.offsetHeight > 0) {
      return;
    }
    function sizeCheck() {
      timer.current && cancelAnimationFrame(timer.current);
      if (scrollDiv.current) {
        const { offsetWidth, offsetHeight, clientWidth, clientHeight } = scrollDiv.current;
        if (offsetWidth > 0 && offsetHeight > 0) {
          setInfo({ offsetWidth, offsetHeight, clientWidth, clientHeight });
          document.body.removeChild(scrollDiv.current);
          scrollDiv.current = undefined;
          return;
        }
      }
      timer.current = requestAnimationFrame(sizeCheck);
    }
    sizeCheck();
    return () => {
      timer.current && cancelAnimationFrame(timer.current);
      scrollDiv.current && document.body.removeChild(scrollDiv.current);
    };
  }, []);

  return useMemo(() => [info.offsetWidth - info.clientWidth, info.offsetHeight - info.clientHeight], [
    info.offsetWidth,
    info.clientWidth,
    info.offsetHeight,
    info.clientHeight,
  ]);
}

export default useScrollbarSize;
