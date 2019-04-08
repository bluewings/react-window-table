/// <reference types="react-scripts" />

declare module '*.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.pug' {
  export default function(params?: { [key: string]: any });
}

declare interface StringTMap<T> {
  [key: string]: T;
}
declare interface NumberTMap<T> {
  [key: number]: T;
}

declare interface StringAnyMap extends StringTMap<any> {}
declare interface NumberAnyMap extends NumberTMap<any> {}

declare interface StringFunctionMap extends StringTMap<Function> {}
declare interface NumberFunctionMap extends NumberTMap<Function> {}

declare type HTMLElementRef = MutableRefObject<HTMLElement | null>;
