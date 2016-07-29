/**
 *
 * App.react.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a neccessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react';
import * as firebase from 'firebase';

import styles from './styles.css';

export default class App extends React.Component { // eslint-disable-line react/prefer-stateless-function

  static propTypes = {
    children: React.PropTypes.node,
  };

  constructor(props) {
    super(props);
    // Initialize Firebase
    const config = {
      apiKey: 'AIzaSyCRQIwH6B1XvTJJGoltQwymZx-CU3mxyTo',
      authDomain: 'starter-1bab0.firebaseapp.com',
      databaseURL: 'https://starter-1bab0.firebaseio.com',
      storageBucket: 'starter-1bab0.appspot.com',
    };
    firebase.initializeApp(config);
  }

  render() {
    return (
      <div className={styles.container}>
        {this.props.children}
      </div>
    );
  }
}
