import { useMemo } from 'react';

const serialize = (() => {
  const replacer = (key: string, value: any) => (typeof value === 'function' ? value.toString() : value);
  return (value: any) => JSON.stringify(value, replacer);
})();

function useEventHandlers(events, rows) {
  const dict = {
    click: 'onClick',
    mouseover: 'onMouseOver',
    mouseout: 'onMouseOut',
  };
  const eventsHash = serialize(events);

  const eventHandlers = useMemo(() => {
    const entries = (target) => {
      return Object.keys(target).map((k) => {
        return [k, target[k]];
      });
    };

    // props.events
    // console.log('%c-=-=-=-=-=-=-=-=-', 'background:orange');
    // console.log();

    // console.log();

    const getAttrFromClosest = (source, attrName) => {
      const target = source.getAttribute(attrName) ? source : source.closest(`[${attrName}]`);
      if (target) {
        return target.getAttribute(attrName);
      }
      return null;
    };

    const getEventTarget = (source, selector) => {
      const target = source.matches(selector) ? source : source.closest(selector);

      if (target) {
        let rowIndex = getAttrFromClosest(target, 'data-row-index');
        let columnIndex = getAttrFromClosest(target, 'data-column-index');

        if (rowIndex && columnIndex) {
          rowIndex = ~~rowIndex;
          columnIndex = ~~columnIndex;
          const row = rows[rowIndex].org;
          return {
            target,
            rowIndex,
            columnIndex,
            data: row,
            // data: rows[row]
          };
        }
      }
      // if (target) {
      //   return target;
      //   // return target.matches(selector);
      // }
      return null;
    };

    const handlerFactory = (details) => {
      const handles = entries(details).map(([selector, handler]) => {
        return {
          selector,
          handler,
        };
      });

      return (event) => {
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
