import { useRef } from 'react';

function useHandle(callback?: Function) {
  const handle = useRef<Function>();
  handle.current = callback;
  return (...args: any[]) => {
    if (typeof handle.current === 'function') {
      handle.current(...args);
    }
  };
}

export default useHandle;
