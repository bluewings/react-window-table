import { useMemo } from 'react';

function useRows(p_rows: any[], columns: Column[], context: any, getChildRows?: Function) {
  // const getChildRows
  const _getChildRows = useMemo(() => {
    if (typeof getChildRows === 'function') {
      return getChildRows;
    }
    return () => [];
  }, [getChildRows]);

  const getRow = useMemo(() => {
    return (row: any) => {
      let _row: any;
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
      return _row;
    };
  }, [columns]);

  const getValues = useMemo(() => {
    return (_row: any) => {
      return columns.map((e) => {
        let value = _row[e.name];
        if (typeof e.getValue === 'function') {
          value = e.getValue(value, _row, context);
        }
        if (typeof value === 'string' || typeof value === 'number') {
          return value;
        }
        return value;
        // return '-';
      });
    };
  }, [columns]);

  return useMemo(() => {
    const rows = p_rows.reduce((accum, row, i) => {
      let _row: any = getRow(row);

      const childRows = _getChildRows(_row);
      const data = [
        {
          org: { ..._row },
          arr: getValues(_row),
          _index: i,
        },
        ...childRows.map((e: any) => {
          const _chidR = getRow(e);
          return {
            org: { ..._chidR },
            arr: getValues(_chidR),
            _index: i,
            _childRow: true,
          };
        }),
      ];

      // console.log(childRows)

      return [...accum, ...data];
    }, []);
    return [
      {
        org: {},
        _isHeader: true,
        arr: columns.map((e: any) => e.name),
      },
      ...rows,
    ];
  }, [p_rows, getRow, getValues, columns, context || null, _getChildRows]);
}

export default useRows;
