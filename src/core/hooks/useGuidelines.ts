import { useMemo } from 'react';

function useGuidelines(rowMetadata, columnMetadata, clientWidth, clientHeight) {
  return useMemo(() => {
    const top = rowMetadata.pre.count && rowMetadata.pre.size;
    const left = columnMetadata.pre.count && columnMetadata.pre.size;
    const bottom = rowMetadata.post.count && rowMetadata.post.size;
    const right = columnMetadata.post.count && columnMetadata.post.size;

    const lines = [
      top && {
        className: 'guideline-top',
        style: { width: clientWidth, top, left: 0 },
      },
      bottom && {
        className: 'guideline-bottom',
        style: { width: clientWidth, bottom, left: 0 },
      },
      left && {
        className: 'guideline-left',
        style: { height: clientHeight, top: 0, left },
      },
      right && {
        className: 'guideline-right',
        style: { height: clientHeight, top: 0, right },
      },
    ].filter((e) => e);
    return lines;
  }, [rowMetadata, columnMetadata, clientWidth, clientHeight]);
}

export default useGuidelines;
