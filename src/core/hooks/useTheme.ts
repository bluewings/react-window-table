import { useMemo } from 'react';
import themes from '../themes';

function useTheme(theme: string | Function) {
  return useMemo(() => {
    if (typeof theme === 'function') {
      return theme;
    }

    return themes[theme] || themes.basic;

    // if (typeof theme === 'string' && themes[theme]) {
    //   return themes[theme];
    // }
  }, [theme || null]);
  // return theme;
}

export default useTheme;
