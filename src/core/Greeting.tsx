import { FunctionComponent } from 'react';
import template from './Greeting.pug';

const Greeting: FunctionComponent<{ name?: string }> = ({ name = 'Someone' }) => {
  return template({
    // variables
    name,
  });
};

export default Greeting;
