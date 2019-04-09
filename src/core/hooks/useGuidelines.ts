import { useMemo } from 'react';
import { Metadata } from './useMetadata';

function useGuidelines(rowMetadata: any, columnMetadata: any, clientWidth: any, clientHeight: any, classNames: any) {
  return useMemo(() => {
    const top = rowMetadata.pre.count && rowMetadata.pre.size;
    const left = columnMetadata.pre.count && columnMetadata.pre.size;
    const bottom = rowMetadata.post.count && rowMetadata.post.size;
    const right = columnMetadata.post.count && columnMetadata.post.size;

    const lines = [
      {
        className: `${classNames.GUIDELINE} ${classNames.GUIDELINE_TOP}`,
        style: { width: clientWidth, top, left: 0 },
      },
      {
        className: `${classNames.GUIDELINE} ${classNames.GUIDELINE_BOTTOM}`,
        style: { width: clientWidth, bottom, left: 0 },
      },
      {
        className: `${classNames.GUIDELINE} ${classNames.GUIDELINE_LEFT}`,
        style: { height: clientHeight, top: 0, left },
      },
      {
        className: `${classNames.GUIDELINE} ${classNames.GUIDELINE_RIGHT}`,
        style: { height: clientHeight, top: 0, right },
      },
    ].filter((e) => e);
    return lines;
  }, [rowMetadata, columnMetadata, clientWidth, clientHeight]);
}

export default useGuidelines;
