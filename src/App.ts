import { Component } from 'react';
import logo from './logo.svg';
import template from './App.pug';
import { Greeting } from './core';

class App extends Component {
  render() {
    return template({
      // variables
      logo,
      // components
      Greeting,
    });
  }
}

export default App;
