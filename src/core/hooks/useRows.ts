function useRows(props: any, columns) {
  const rows = props.rows.map((row) => {
    let _row;
    if (Array.isArray(row)) {
      _row = columns.reduce(
        (prev, e, i) => ({
          ...prev,
          [e.name]: row[i],
        }),
        {},
      );
    } else {
      _row = { ...row };
    }

    const data = {
      org: { ..._row },
      arr: columns.map((e) => {
        let value = _row[e.name];
        if (typeof e.getValue === 'function') {
          value = e.getValue(value);
        }
        if (typeof value === 'string' || typeof value === 'number') {
          return value;
        }
        return '-';
      }),
    };

    return data;
  });
  return [
    {
      org: {},
      _isHeader: true,
      arr: columns.map((e) => e.name),
    },
    ...rows,
  ];
}

export default useRows;
