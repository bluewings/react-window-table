import { useMemo } from 'react';

export type GetChildRowsFunc = (row?: any) => any[];

type UseRowsParams = {
  rows: any[];
  columns: Column[];
  context?: any;
  checkbox?: boolean;
  getChildRows?: GetChildRowsFunc;
  trackBy?: Function;
  rowHeight?: number | Function;
};

const DEFAULT_ROW_HEIGHT = 40;

const isDefined = (e: any) => typeof e !== 'undefined';

function useGetChildRows(childRows?: GetChildRowsFunc): GetChildRowsFunc {
  return useMemo(() => (typeof childRows === 'function' ? childRows : () => []), [childRows]);
}

function useContext(context?: StringAnyMap): StringAnyMap {
  return useMemo(() => context || {}, [context || null]);
}

function useRows({
  rows,
  rowHeight,
  columns,
  checkbox,
  getChildRows,
  trackBy,
  context,
}: UseRowsParams): [any[], any[], Function, Function, Function] {
  const _getChildRows = useGetChildRows(getChildRows);
  const _context = useContext(context);

  const toRowObj: (row: any) => any = useMemo(() => {
    const availColumns = !!checkbox ? columns.slice(1) : columns;
    return (row: any) =>
      Array.isArray(row) ? availColumns.reduce((accum, { name }, i) => ({ ...accum, [name]: row[i] }), {}) : row;
  }, [columns, !!checkbox]);

  const toRowValues: (rowObj: any) => any[] = useMemo(
    () => (rowObj: any) =>
      columns.map(({ name, getValue }) => {
        const value = rowObj[name];
        return typeof getValue === 'function' ? getValue(value, rowObj, _context) : value;
      }),
    [columns, _context],
  );

  const normalize = useMemo(() => {
    return (row: any, _index: number, _childIndex?: number) => {
      let obj = toRowObj(row);
      let _key = (typeof trackBy === 'function'
        ? trackBy(obj)
        : [_index, _childIndex].filter(isDefined).join('_')
      ).toString();
      return {
        obj,
        arr: toRowValues(obj),
        _key,
        _index,
        _childIndex,
        _isChildRow: typeof _childIndex !== 'undefined',
      };
    };
  }, [toRowObj, toRowValues, trackBy || null]);

  const getRows = useMemo(() => {
    return (rows: any[]) => {
      return [
        // header
        { obj: {}, arr: columns.map(({ name }) => name), _isHeader: true },
        // rows
        ...rows.reduce((accum, row, i) => {
          let rowObj = toRowObj(row);
          const data = [
            // parent row
            normalize(rowObj, i),
            // child rows
            ..._getChildRows(rowObj).map((childRow, j) => normalize(childRow, i, j)),
          ];
          return [...accum, ...data];
        }, []),
      ];
    };
  }, [columns, toRowObj, normalize, _getChildRows]);

  const normalized = useMemo(() => {
    return getRows(rows);
  }, [getRows, rows]);

  const dataRows = useMemo(() => {
    const baseIndex = normalized.findIndex((e) => e._isHeader !== true);
    return normalized.slice(baseIndex);
  }, [normalized]);

  const getRowHeight = useMemo(() => {
    const _rowHeight = typeof rowHeight === 'function' ? rowHeight : () => rowHeight || DEFAULT_ROW_HEIGHT;
    return (rowIndex: number) => _rowHeight(rowIndex, normalized[rowIndex]);
  }, [normalized, rowHeight || null]);

  const getData = useMemo(() => {
    return async (data?: any) => {
      const columns_ = (columns || []).map((column: any) => ({ ...column }));
      let rows_ = (Array.isArray(data) ? getRows(data) : rows) || [];
      const startIndex = columns_.findIndex((column: any) => !column._system);
    
      rows_ = rows_.filter((row: any) => !row._isHeader);
      rows_ = await columns_.reduce(async (prevRows: any, col: any, i: number) => {
        if (typeof col.batchData === 'function') {
          const prev = await prevRows;
          const nextRows = await Promise.all(
            prev.map(async (row: any, j: number) => {
              const newRow = [...(row.arr || [])];
              newRow[i] = await col.batchData(newRow[i], { ...row.obj }, context);
              return { ...row, arr: newRow };
            }),
          );
          return nextRows;
        }
        return prevRows;
      }, Promise.resolve(rows_));
    
      return {
        columns: columns_.slice(startIndex),
        rows: rows_.map((row: any) => row.arr.slice(startIndex)),
        // rows: rows_.filter((row: any) => !row._isHeader).map((row: any) => (row.arr || []).slice(startIndex)),
      };
    };
  }, [columns, getRows, rows, context])



  return [normalized, dataRows, getRowHeight, getRows, getData];
}
export default useRows;
