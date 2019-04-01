/// <reference types="react-scripts" />

declare module '*.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.pug' {
  export default function(params?: { [key: string]: any });
}
