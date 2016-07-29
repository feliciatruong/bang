import React, { Component } from 'react';
import * as firebase from 'firebase';
import { Button } from 'react-bootstrap';
import { browserHistory } from 'react-router';

export default class HomePage extends Component { // eslint-disable-line react/prefer-stateless-function
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
      message: '',
      messages: [],
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
      this.loadMessages();
    }
  }

  signIn = () => {
    const { auth } = this.state;
    // Sign in Firebase using popup auth and Google as the identity provider.
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  signOut = () => {
    const { auth } = this.state;
    // Sign out of Firebase.
    auth.signOut();
    this.setState({ loggedIn: false });
  }

  createRoom() {
    const uid = new Date().valueOf();
    const sid = String(uid);
    browserHistory.push(`/room/${sid}`);
  }

  render() {
    const { loggedIn, username } = this.state;
    return (
      <div>
        <h3>Starter App</h3>
        <div id="user-container">
          <h6 hidden={!loggedIn}>{username}</h6>
          <Button hidden={!loggedIn} onClick={this.signOut}>
            Sign-out
          </Button>
          <Button hidden={loggedIn} onClick={this.signIn}>
            <i className="material-icons">account_circle</i>Sign-in with Google
          </Button>
        </div>
        <Button bsStyle="primary" onClick={this.createRoom}>
          Create Room
        </Button>
      </div>
    );
  }
}
