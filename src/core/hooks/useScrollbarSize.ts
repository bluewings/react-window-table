import useComputedStyle from './useComputedStyle';

function useScrollbarSize(): [number, number] {
  const { offsetWidth, offsetHeight, clientWidth, clientHeight } = useComputedStyle(
    { width: 200, height: 200, overflow: 'scroll' },
    [],
  );
  return [offsetWidth - clientWidth, offsetHeight - clientHeight];
}

export default useScrollbarSize;
