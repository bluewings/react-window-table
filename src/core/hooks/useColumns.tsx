import * as React from 'react';
import { useMemo } from 'react';
import InputCheckbox from '../components/InputCheckbox';
import styles from './useColumns.module.scss';

type UseColumnsParams = {
  columns: (Column | string)[];
  checkbox?: boolean;
  columnWidth?: Function | number;
};

const DEFAULT_COLUMN_WIDTH = 150;

const noop = () => {};

function getLabel(column = {}) {
  let label = '';
  if (column.label) {
    label = column.label;
  } else {
    label = column.name
      .replace(/([a-z])([A-Z])/g, (all, p1, p2) => {
        return p1 + ' ' + p2.toLowerCase();
      })
      .replace(/\s+/g, ' ');
  }
  return label.trim();
  // if (column.name) {

  // }
}

function useColumns({ columns, columnWidth, checkbox }: UseColumnsParams): [Column[], Function, number] {
  const normalize = useMemo(() => {
    let _tmp: any = columns;

    if (typeof _tmp === 'object' && !Array.isArray(_tmp)) {
      _tmp = Object.keys(_tmp).map((e: string) => ({ ..._tmp[e], name: e }));
    }
    if (!!checkbox) {
      _tmp = [
        {
          _system: true,
          name: '_checkbox',
          textAlign: 'center',
          width: 40,
          // @ts-ignore
          header: (arg1, arg2, { selectedStatus }) => {
            let checked = selectedStatus === 'all';
            let indeterminate = selectedStatus === 'some' ? 'true' : 'false';
            return (
              <InputCheckbox
                type="checkbox"
                data-rwt-checkbox-control
                checked={checked}
                indeterminate={indeterminate}
                onChange={noop}
              />
            );
          },
          render: (arg1: any, arg2: any, arg3: any) => {
            const { rowIndex, columnIndex, _key, isSelected, _isChildRow } = arg3;

            const checked = !!isSelected;
            if (_isChildRow) {
              return null;
            }

            return <input type="checkbox" data-rwt-checkbox data-row-key={_key} checked={checked} onChange={noop} />;
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
        // const label = getLabel(column);
        // console.log(label);
        return {
          ...column,
          label: getLabel(column),
          // render: () => '---',
          render: typeof column.render === 'function' ? column.render : (data: any) => data,
        };
      });
  }, [columns, !!checkbox]);

  const getColumnWidth = useMemo(() => {
    const _columnWidth = typeof columnWidth === 'function' ? columnWidth : () => columnWidth || DEFAULT_COLUMN_WIDTH;
    return (columnIndex: number) => {
      const column = normalize[columnIndex] || {};
      return column.width || _columnWidth(columnIndex, column);
    };
  }, [normalize, columnWidth || null]);

  const fixedLeftCount = useMemo(() => {
    let count = normalize.filter((e: any) => e.fixed).length;
    if (count > 0 && !!checkbox) {
      count += 1;
    }
    return count;
  }, [normalize, !!checkbox]);

  return [normalize, getColumnWidth, fixedLeftCount];
}

export default useColumns;
