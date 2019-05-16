import { useMemo } from 'react';

// function useColumns(props: any) {
// console.log(p_columns);
function useColumns(p_columns: (Column | string)[], p_columnWidth?: Function | number): [Column[], Function] {
  // const { p_columns, p_columnWidth } = props;

  const columns = useMemo(() => {
    return (p_columns || [])
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

  return [columns, columnWidth];
}

export default useColumns;
