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
import { IndexLink } from 'react-router';
import { Button } from 'react-bootstrap';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import styles from './styles.css';

const store = createStore((state = { login: false, name: '' }, action) => {
  switch (action.type) {
    case 'LOGIN':
      return Object.assign({}, state, { login: true, name: action.name });
    case 'LOGOUT':
      return Object.assign({}, state, { login: false, name: '' });
    default:
      return state;
  }
});

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
    this.state = {
      auth: firebase.auth(),
      database: firebase.database(),
      loggedIn: false,
      storage: firebase.storage(),
      username: '',
    };
  }

  componentWillMount() {
    const { auth } = this.state;
    // Initiates Firebase auth and listen to auth state changes.
    auth.onAuthStateChanged(this.onAuthStateChanged);
  }

    // Triggers when the auth state change for instance when the user signs-in or signs-out.
  onAuthStateChanged = (user) => {
    if (user) {
      this.setState({
        loggedIn: true,
        username: user.displayName,
      });
      store.dispatch({ type: 'LOGIN', name: user.displayName });
    }
  }

  signIn = () => {
    const { auth, username } = this.state;
    // Sign in Firebase using popup auth and Google as the identity provider.
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
    this.setState({ loggedIn: true });
    store.dispatch({ type: 'LOGIN', name: username });
  }

  signOut = () => {
    const { auth } = this.state;
    // Sign out of Firebase.
    auth.signOut();
    this.setState({ loggedIn: false });
    store.dispatch({ type: 'LOGOUT' });
  }

  render() {
    const { loggedIn, username } = this.state;
    return (
      <div>
        <IndexLink to="/">
          <span>Starter</span>
        </IndexLink>
        <div id="user-container">
          <h6 hidden={!loggedIn}>{username}</h6>
          <Button hidden={!loggedIn} onClick={this.signOut}>
            Sign-out
          </Button>
          <Button hidden={loggedIn} onClick={this.signIn}>
            Sign-in with Google
          </Button>
        </div>
        <Provider store={store}>
          <div className={styles.container}>
            {this.props.children}
          </div>
        </Provider>
      </div>
    );
  }
}
