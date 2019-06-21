import * as React from 'react';
import { useEffect, useRef } from 'react';

function InputCheckbox(props: any) {
  const checkbox = useRef<HTMLElementRef>();

  useEffect(() => {
    if (checkbox && checkbox.current) {
      checkbox.current.indeterminate = props.indeterminate === 'true';
    }
  });

  return <input ref={checkbox} type="checkbox" {...props} />;
}

export default InputCheckbox;
