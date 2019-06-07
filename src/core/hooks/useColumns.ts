import { useMemo } from 'react';

// function useColumns(props: any) {
// console.log(p_columns);
function useColumns(p_columns: (Column | string)[], p_columnWidth?: Function | number): [Column[], Function, number] {
  // const { p_columns, p_columnWidth } = props;

  const columns = useMemo(() => {
    let _tmp: any = p_columns;

    if (typeof _tmp === 'object' && !Array.isArray(_tmp)) {
      _tmp = Object.keys(_tmp).map((e: string) => {
        return {
          ..._tmp[e],
          name: e,
        };
      });
    }

    return (_tmp || [])
      .filter((column: any) => column && (typeof column === 'string' || typeof column === 'object'))
      .map((column: any) => (typeof column === 'string' ? { name: column } : { ...column }))
      .filter((column: any) => column.name)
      .map((column: Column) => {
        return {
          ...column,
          render: typeof column.render === 'function' ? column.render : (data: any) => data,
        };
      });
  }, [p_columns]);

  const columnWidth = useMemo(
    () => (index: number) =>
      (columns[index] && columns[index].width) ||
      (typeof p_columnWidth === 'function' ? p_columnWidth(index) : p_columnWidth),
    [columns, p_columnWidth],
  );

  // console.log(columns.)
  const fixedLeftCount = useMemo(() => {
    return columns.filter((e: any) => e.fixed).length;
  }, [columns]);

  return [columns, columnWidth, fixedLeftCount];
}

export default useColumns;
