import { useMemo, SyntheticEvent } from 'react';

type EventTarget = {
  target: Element;
  rowIndex: number;
  columnIndex: number;
  column: string;
  data: any;
} | null;

const serialize = (() => {
  const replacer = (key: string, value: any) => (typeof value === 'function' ? value.toString() : value);
  return (value: any) => JSON.stringify(value, replacer);
})();

function useEventHandlers(ownEvents: StringFunctionMap, userEvents: StringFunctionMap, rows: StringAnyMap[]) {
  const dict: StringAnyMap = {
    click: 'onClick',
    mouseover: 'onMouseOver',
    mouseout: 'onMouseOut',
  };
  const eventsHash = serialize(userEvents);

  const eventHandlers = useMemo(() => {
    const entries = (target: any) => {
      return Object.keys(target).map((k) => {
        return [k, target[k]];
      });
    };

    // props.events
    // console.log('%c-=-=-=-=-=-=-=-=-', 'background:orange');
    // console.log();

    // console.log();

    const getCellElement = (source: any) => {
      const SELECTOR = '[data-row-index][data-column-index][data-column]';
      return source.matches(SELECTOR) ? source : source.closest(SELECTOR);
    };

    const getEventTarget = (source: any, selector: string): EventTarget => {
      const target = source.matches(selector) ? source : source.closest(selector);

      if (target) {
        const cellElement = getCellElement(target);
        if (cellElement) {
          let rowIndex_ = cellElement.getAttribute('data-row-index');
          let columnIndex_ = cellElement.getAttribute('data-column-index');
          let column = cellElement.getAttribute('data-column');

          if (rowIndex_ && columnIndex_) {
            let rowIndex = ~~rowIndex_;
            let columnIndex = ~~columnIndex_;
            const row: any = rows[rowIndex_] || {};
            const { _key, _index, _isHeader, _isChildRow, obj: data } = row;
            return {
              target,
              rowIndex,
              columnIndex,
              column,
              data: data,
              // @ts-ignore
              _key,
              _index,
              _isHeader: !!_isHeader,
              _isChildRow: !!_isChildRow,
            };
          }
        }
      }
      return null;
    };

    const handlerFactory = (details: StringFunctionMap) => {
      const handles = entries(details).map(([selector, handler]) => {
        return {
          selector,
          handler,
        };
      });

      return (event: SyntheticEvent) => {
        // console.log(event.target);
        // console.log(handles);
        handles.forEach((e) => {
          const target = getEventTarget(event.target, e.selector);
          if (target) {
            e.handler(event, target);
          }

          // console.log(target);
        });
      };
    };

    const mergedEvents = [...Object.entries(ownEvents || {}), ...Object.entries(userEvents || {})].reduce(
      (accum: any, [k, v]) => ({ ...accum, [k]: { ...accum[k], ...v } }),
      {},
    );

    return entries(mergedEvents).reduce((accum, [eventName, details]) => {
      const handlerName = dict[eventName.toLowerCase()];
      if (handlerName) {
        return {
          ...accum,
          [handlerName]: handlerFactory(details),
        };
      }
      return accum;
    }, {});
  }, [ownEvents, eventsHash, rows]);

  return eventHandlers;
}

export default useEventHandlers;
