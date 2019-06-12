import { useMemo } from 'react';

function useRows(
  p_rows: any[],
  columns: Column[],
  context: any,
  checkbox?: boolean,
  getChildRows?: Function,
  trackBy?: Function,
) {
  const _checkbox = !!checkbox;

  // const getChildRows
  const _getChildRows = useMemo(() => {
    if (typeof getChildRows === 'function') {
      return getChildRows;
    }
    return () => [];
  }, [getChildRows]);

  const columns2 = useMemo(() => {
    if (_checkbox) {
      return columns.slice(1);
    }
    return columns;
  }, [columns, _checkbox]);

  // const

  const getRow = useMemo(() => {
    return (row: any) => {
      let _row: any;
      if (Array.isArray(row)) {
        _row = columns2.reduce(
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
  }, [_checkbox, columns]);

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

  const rows = useMemo(() => {
    const rows = p_rows.reduce((accum, row, i) => {
      let _row: any = getRow(row);

      // trackBy
      let _key = i;

      if (typeof trackBy === 'function') {
        _key = trackBy(_row);
      }

      const childRows = _getChildRows(_row);
      const data = [
        {
          org: { ..._row },
          arr: getValues(_row),
          _key,
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

  // const row

  // console.log
  // const rowIdx = rows.findIndex(e => {

  // });
  const [rowIdx, getRow_, getAllRows]: Function[] = useMemo(() => {
    const __idx = rows.findIndex((e) => {
      return e._isHeader !== true;
    });

    // console.log(__idx);

    return [
      (index: number) => {
        return index - __idx;
      },
      (index: number) => {
        // return ;
        return rows[index - __idx];
      },
      () => {
        // return ;
        return rows.slice(__idx);
      },
    ];
  }, [rows]);
  return [rows, rowIdx, getRow_, getAllRows];
}

export default useRows;
