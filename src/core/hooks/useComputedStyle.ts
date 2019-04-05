import { useRef, useState, useEffect, useMemo } from 'react';
import { css } from 'emotion';

const noop = () => undefined;

function pixelToNumber(value?: string) {
  const pattern = /^([0-9]+)px$/;
  if (typeof value === 'string' && value.match(pattern)) {
    return parseFloat(value.replace(pattern, '$1'));
  }
  return value;
}

function getComputedStyle(target: HTMLElement | undefined, attributes: string[]) {
  const { offsetWidth = 0, offsetHeight = 0, clientWidth = 0, clientHeight = 0 } = target || {};
  const computed: any = target && attributes.length > 0 ? window.getComputedStyle(target) : {};
  return attributes.reduce((accum, attribute: any) => ({ ...accum, [attribute]: pixelToNumber(computed[attribute]) }), {
    offsetWidth,
    offsetHeight,
    clientWidth,
    clientHeight,
  });
}

function useTarget(target?: HTMLElement | StringAnyMap | string | Function) {
  const signature = target instanceof HTMLElement ? target : JSON.stringify(target);
  const dummy = useRef<any>(null);
  return useMemo(() => {
    if (typeof target === 'function') {
      return { element: target, clear: noop };
    } else if (target instanceof HTMLElement) {
      return { element: () => target, clear: noop };
    }
    dummy.current && document.body.removeChild(dummy.current);
    dummy.current = document.createElement('div');
    dummy.current.className =
      typeof target === 'string'
        ? css({ position: 'absolute', top: -9999 }) + ' ' + target
        : css({ position: 'absolute', top: -9999, ...target });
    document.body.appendChild(dummy.current);
    return {
      element: () => dummy.current,
      clear: () => {
        dummy.current && document.body.removeChild(dummy.current);
        dummy.current = null;
      },
    };
  }, [signature]);
}

function useComputedStyle(
  target: HTMLElement | StringAnyMap | string | Function | undefined,
  attributes: string[],
  watch = false,
): StringAnyMap {
  const targetRef = useRef<any>(null);
  targetRef.current = useTarget(target);

  const [style, setStyle] = useState(() => getComputedStyle(targetRef.current.element(), attributes));
  const styleRef = useRef<any>(null);
  styleRef.current = style;

  const requestId = useRef<number>();
  useEffect(() => {
    if (style.offsetWidth > 0 && style.offsetHeight > 0 && watch === false) {
      targetRef.current.clear();
      return;
    }
    function sizeCheck() {
      requestId.current && cancelAnimationFrame(requestId.current);
      if (targetRef.current) {
        const computedStyle = getComputedStyle(targetRef.current.element(), attributes);
        if (
          computedStyle.offsetWidth > 0 &&
          computedStyle.offsetHeight > 0 &&
          JSON.stringify(styleRef.current) !== JSON.stringify(computedStyle)
        ) {
          setStyle(computedStyle);
          if (watch === false) {
            targetRef.current.clear();
            return;
          }
        }
      }
      requestId.current = requestAnimationFrame(sizeCheck);
    }
    sizeCheck();
    return () => {
      requestId.current && cancelAnimationFrame(requestId.current);
      targetRef.current.clear();
    };
  }, [attributes.toString()]);
  return style;
}

export default useComputedStyle;
