import * as React from 'react';
import { useMemo } from 'react';
import InputCheckbox from '../components/InputCheckbox';

// function useColumns(props: any) {
// console.log(p_columns);
const noop = () => {};

function useColumns(
  p_columns: (Column | string)[],
  checkbox?: boolean,
  p_columnWidth?: Function | number,
): [Column[], Function, number] {
  // const { p_columns, p_columnWidth } = props;
  const _checkbox = !!checkbox;

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
    if (_checkbox) {
      _tmp = [
        {
          name: 'v',
          textAlign: 'center',
          // @ts-ignore
          header: (arg1, arg2, { selectedStatus }) => {
            // console.log(arg1, arg2, arg3);
            // const { selectedStatus } = arg3;
            // const selectedStatus = 'aaa';
            let checked = selectedStatus === 'all';
            let indeterminate = selectedStatus === 'some' ? 'true' : 'false';

            return (
              <div>
                {/* [{selectedStatus}] */}
                <InputCheckbox
                  type="checkbox"
                  data-rwt-checkbox-control
                  checked={checked}
                  indeterminate={indeterminate}
                  onChange={noop}
                />
              </div>
            );
            // return <input type="checkbox" data-rwt-checkbox-control />;
          },
          render: (arg1: any, arg2: any, arg3: any) => {
            const { rowIndex, columnIndex, _key, isSelected, _isChildRow } = arg3;

            const checked = !!isSelected;
            if (_isChildRow) {
              return null;
            }

            return (
              <div>
                <input type="checkbox" data-rwt-checkbox data-row-key={_key} checked={checked} onChange={noop} />
              </div>
            );
          },
        },
        ..._tmp,
      ];
    }

    return (_tmp || [])
      .filter((column: any) => column && (typeof column === 'string' || typeof column === 'object'))
      .map((column: any) => (typeof column === 'string' ? { name: column } : { ...column }))
      .filter((column: any) => column.name)
      .map((column: Column) => {
        return {
          ...column,
          // render: () => '---',
          render: typeof column.render === 'function' ? column.render : (data: any) => data,
        };
      });
  }, [p_columns, _checkbox]);

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
