import { useMemo } from 'react';
import { css } from 'emotion';
import { ClassNames } from './useClassNames';

export type ThemeFunction = (classNames: ClassNames) => StringAnyMap;

function defaultTheme(_: ClassNames) {
  return css({
    position: 'relative',
    boxSizing: 'border-box',
    [_.CELL]: {
      boxSizing: 'border-box',
      overflow: 'hidden',
      background: '#fff',
    },
    [_.GUIDELINE_TOP]: {
      height: 5,
      background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
    },
    [_.GUIDELINE_BOTTOM]: {
      height: 5,
      background: 'linear-gradient(to top, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
    },
    [_.GUIDELINE_LEFT]: {
      width: 5,
      background: 'linear-gradient(to right, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
    },
    [_.GUIDELINE_RIGHT]: {
      width: 5,
      background: 'linear-gradient(to left, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
    },
    [_.SCROLL_TOP]: {
      [_.GUIDELINE_TOP]: { opacity: 0 },
    },
    [_.SCROLL_BOTTOM]: {
      [_.GUIDELINE_BOTTOM]: { opacity: 0 },
    },
    [_.SCROLL_LEFT]: {
      [_.GUIDELINE_LEFT]: { opacity: 0 },
    },
    [_.SCROLL_RIGHT]: {
      [_.GUIDELINE_RIGHT]: { opacity: 0 },
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
