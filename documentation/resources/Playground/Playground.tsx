import * as React from 'react';
import { Playground as BasePlayground } from 'docz';
import styles from './Playground.module.scss';

function Playground(props) {
  return (
    <div className={styles.root}>
      <BasePlayground {...props} />
    </div>
  );
}

export default Playground;
