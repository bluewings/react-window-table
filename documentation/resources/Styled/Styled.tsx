import * as React from 'react';
import styles from '../Playground/Playground.module.scss';

function Styled(props) {
  return <div className={styles.root}>{props.children}</div>;
}

export default Styled;
