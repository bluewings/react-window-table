const theme = (classNames) => {
  console.log(classNames);
  return {
    [classNames.CELL]: {
      display: 'flex',
      fontSize: 12.5,
      padding: 8,
      borderRight: '1px solid #dadcde',
      alignItems: 'center',
    },
    [classNames.HEADER]: {
      background: 'yellow !important',
      // display: 'flex',
      // fontSize: 12.5,
      // padding: 8,
      // borderRight: '1px solid #dadcde',
      // alignItems: 'center',
    },
    [classNames.ROW_EVEN]: {
      background: '#f5f6f7',
    },
    [classNames.IS_SCROLLING]: {
      [classNames.CELL]: {
        background: 'lightyellow',
        pointerEvents: 'none',
      },
    },
    [classNames.SECTION_TOP]: {
      [classNames.CELL]: {
        background: '#f5f6f7',
        borderBottom: '1px solid #d3d3d3',
        fontWeight: 700,
      },
    },
  };
};

export default theme;
