import { useMemo } from 'react';

function useColumns(props: any) {
  console.log(props.columns);
  const columns = useMemo(() => {
    return (props.columns || [])
      .filter((column: any) => column && (typeof column === 'string' || typeof column === 'object'))
      .map((column: any) => (typeof column === 'string' ? { name: column } : { ...column }))
      .filter((column: any) => column.name)
      .map((column) => {
        return {
          ...column,
          render: typeof column.render === 'function' ? column.render : (data) => data,
        };
      });
  }, [props.columns]);

  const columnWidth = useMemo(
    () => (index: number) =>
      (columns[index] && columns[index].width) ||
      (typeof props.columnWidth === 'function' ? props.columnWidth(index) : props.columnWidth),
    [columns, props.columnWidth],
  );

  return [columns, columnWidth];
}

export default useColumns;
