import { useMemo } from 'react';
import { css } from 'emotion';
import { ClassNames } from './useClassNames';

export type ThemeFunction = (classNames: ClassNames) => StringAnyMap;

function defaultTheme(classNames: ClassNames) {
  return css({
    position: 'relative',
    boxSizing: 'border-box',
    [classNames.CELL]: {
      boxSizing: 'border-box',
      overflow: 'hidden',
    },
    [classNames.GUIDELINE_TOP]: {
      height: 5,
      background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
    },
    [classNames.GUIDELINE_BOTTOM]: {
      height: 5,
      background: 'linear-gradient(to top, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
    },
    [classNames.GUIDELINE_LEFT]: {
      width: 5,
      background: 'linear-gradient(to right, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
    },
    [classNames.GUIDELINE_RIGHT]: {
      width: 5,
      background: 'linear-gradient(to left, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
    },
    [classNames.SCROLL_TOP]: {
      [classNames.GUIDELINE_TOP]: { opacity: 0 },
    },
    [classNames.SCROLL_BOTTOM]: {
      [classNames.GUIDELINE_BOTTOM]: { opacity: 0 },
    },
    [classNames.SCROLL_LEFT]: {
      [classNames.GUIDELINE_LEFT]: { opacity: 0 },
    },
    [classNames.SCROLL_RIGHT]: {
      [classNames.GUIDELINE_RIGHT]: { opacity: 0 },
    },
  });
}

function useTheme(theme: ThemeFunction | undefined, classNames: ClassNames) {
  const dotClassNames: any = useMemo(
    () => Object.keys(classNames).reduce((accum, key) => ({ ...accum, [key]: `.${classNames[key]}` }), {}),
    [classNames],
  );

  return useMemo(() => [defaultTheme(dotClassNames), theme && css(theme(dotClassNames))].filter((e) => e).join(' '), [
    theme,
    dotClassNames,
  ]);
}

export default useTheme;
