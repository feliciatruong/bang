/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a neccessity for you then you can refactor it and remove
 * the linting exception.
 */

import React, { Component } from 'react';
import * as firebase from 'firebase';
import { Button } from 'react-bootstrap';

export default class HomePage extends Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    const config = {
      apiKey: 'AIzaSyCRQIwH6B1XvTJJGoltQwymZx-CU3mxyTo',
      authDomain: 'starter-1bab0.firebaseapp.com',
      databaseURL: 'https://starter-1bab0.firebaseio.com',
      storageBucket: 'starter-1bab0.appspot.com',
    };
    firebase.initializeApp(config);
    this.state = {
      auth: firebase.auth(),
      database: firebase.database(),
      storage: firebase.storage(),
    };
  }
  render() {
    return (
      <div>
        <h3>Starter App</h3>
        <Button bsStyle="primary">Test</Button>
      </div>
    );
  }
}
