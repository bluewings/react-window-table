import { useMemo } from 'react';
import { css } from 'emotion';

function useTheme(theme, classNames) {
  // console.log(theme);
  // console.log(classNames);
  const classNames_ = useMemo(() => {
    console.log(classNames);
    return Object.keys(classNames).reduce((accum, key) => {
      return {
        ...accum,
        [key]: `.${classNames[key]}`,
        // [`.${key}`]: classNames[key],
      };
    }, {});
  }, [classNames]);

  // console.log(theme);

  // const classNames_ = null;

  return useMemo(() => {
    console.log(classNames_);
    return css({
      position: 'relative',
      boxSizing: 'border-box',
      [classNames_.CELL]: {
        boxSizing: 'border-box',
        overflow: 'hidden',
      },
      [classNames_.GUIDELINE_TOP]: {
        height: 5,
        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
      },
      [classNames_.GUIDELINE_BOTTOM]: {
        height: 5,
        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
      },
      [classNames_.GUIDELINE_LEFT]: {
        width: 5,
        background: 'linear-gradient(to right, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
      },
      [classNames_.GUIDELINE_RIGHT]: {
        width: 5,
        background: 'linear-gradient(to left, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
      },
      [`&${classNames_.SCROLL_TOP}`]: {
        [classNames_.GUIDELINE_TOP]: { opacity: 0 },
      },
      [`&${classNames_.SCROLL_BOTTOM}`]: {
        [classNames_.GUIDELINE_BOTTOM]: { opacity: 0 },
      },
      [`&${classNames_.SCROLL_LEFT}`]: {
        [classNames_.GUIDELINE_LEFT]: { opacity: 0 },
      },
      [`&${classNames_.SCROLL_RIGHT}`]: {
        [classNames_.GUIDELINE_RIGHT]: { opacity: 0 },
      },
    });

    // css({
    //   position: 'absolute,'
    // })
  }, [theme, classNames_]);
}

export default useTheme;
