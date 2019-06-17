const theme = (classNames: any) => {
  const borderColor1 = '#d3d3d3';
  const borderColor2 = '#dadcde';
  return {
    borderTop: `1px solid ${borderColor1}`,
    borderBottom: `1px solid ${borderColor1}`,
    boxSizing: 'content-box',
    [classNames.CELL]: {
      display: 'flex',
      fontSize: 12.5,
      padding: '0 1rem',
      // borderRight: `1px solid ${borderColor2}`,
      borderBottom: `1px solid ${borderColor2}`,
      alignItems: 'center',
    },
    [classNames.HEADER]: {
      // background: '#f5f6f7',
      background: 'orange',
      borderBottom: `1px solid ${borderColor1}`,
      fontWeight: 700,
    },
    [classNames.IS_SCROLLING]: {
      [classNames.CELL]: {
        pointerEvents: 'none',
      },
    },
    [classNames.SECTION_CENTER_V]: {
      [classNames.ROW_LAST]: {
        borderBottomColor: 'transparent',
      },
    },
    [classNames.SECTION_BOTTOM]: {
      [classNames.CELL]: {
        borderTop: `1px solid ${borderColor2}`,
        borderBottom: 'none',
      },
    },
  };
};

export default theme;
