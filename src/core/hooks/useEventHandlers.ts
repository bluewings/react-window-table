import { useMemo, SyntheticEvent } from 'react';

type EventTarget = {
  target: Element;
  rowIndex: number;
  columnIndex: number;
  data: any;
} | null;

const serialize = (() => {
  const replacer = (key: string, value: any) => (typeof value === 'function' ? value.toString() : value);
  return (value: any) => JSON.stringify(value, replacer);
})();

function useEventHandlers(events: StringFunctionMap, rows: StringAnyMap[]) {
  const dict: StringAnyMap = {
    click: 'onClick',
    mouseover: 'onMouseOver',
    mouseout: 'onMouseOut',
  };
  const eventsHash = serialize(events);

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

    const getAttrFromClosest = (source: any, attrName: string) => {
      const target = source.getAttribute(attrName) ? source : source.closest(`[${attrName}]`);
      if (target) {
        return target.getAttribute(attrName);
      }
      return null;
    };

    const getEventTarget = (source: any, selector: string): EventTarget => {
      const target = source.matches(selector) ? source : source.closest(selector);

      if (target) {
        let rowIndex_ = getAttrFromClosest(target, 'data-row-index');
        let columnIndex_ = getAttrFromClosest(target, 'data-column-index');

        if (rowIndex_ && columnIndex_) {
          let rowIndex = ~~rowIndex_;
          let columnIndex = ~~columnIndex_;
          const row = rows[rowIndex_].org;
          const { _key, _index } = rows[rowIndex_];

          return {
            target,
            rowIndex,
            columnIndex,
            data: row,
            // @ts-ignore
            _key,
            _index,
          };
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

    let allEvts = entries(events).reduce((accum, [eventName, details]) => {
      const handlerName = dict[eventName.toLowerCase()];
      if (handlerName) {
        return {
          ...accum,
          [handlerName]: handlerFactory(details),
        };
      }
      return accum;
    }, {});
    return allEvts;
  }, [eventsHash, rows]);

  return eventHandlers;
}

export default useEventHandlers;
