import React, { Component, PropTypes } from 'react';
import * as firebase from 'firebase';
import { Button, FormGroup, FormControl } from 'react-bootstrap';
import MessageList from './messages.js';

export default class RoomPage extends Component {

  static propTypes = {
    params: PropTypes.object,
  }

  constructor(props) {
    super(props);
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

  handleChange = (event) => {
    event.preventDefault();
    this.setState({ message: event.target.value });
  }

  saveMessage = (event) => {
    event.preventDefault();
    const { database, loggedIn, message, username } = this.state;
    const { params } = this.props;
    if (message && loggedIn) {
      // Add a new message entry to the Firebase Database.
      database.ref(params.rid).push({
        name: username,
        text: message,
      }).then(() => {
        this.setState({ message: '' });
      });
    }
  }

  loadMessages() {
    const { database, messages } = this.state;
    const { params } = this.props;
    const messagesRef = database.ref(params.rid);
    messagesRef.off();
    messagesRef.limitToLast(12).on('child_added', (data) => {
      const val = data.val();
      messages.push({ key: data.key, name: val.name, text: val.text });
      this.setState({ messages });
    });
    messagesRef.limitToLast(12).on('child_changed', (data) => {
      const val = data.val();
      messages.push({ key: data.key, name: val.name, text: val.text });
      this.setState({ messages });
    });
  }

  render() {
    const { loggedIn, message, messages, username } = this.state;
    return (
      <div>
        <h3>Game Page</h3>
        <div id="user-container">
          <h6 hidden={!loggedIn}>{username}</h6>
          <Button hidden={!loggedIn} onClick={this.signOut}>
            Sign-out
          </Button>
          <Button hidden={loggedIn} onClick={this.signIn}>
            <i className="material-icons">account_circle</i>Sign-in with Google
          </Button>
        </div>
        <div>
          <div id="messages">
            <MessageList items={messages} />
          </div>
          <FormGroup>
            <FormControl
              type="text"
              value={message}
              placeholder="Enter message"
              onChange={this.handleChange}
            />
            <Button
              disabled={!message}
              type="submit"
              onClick={this.saveMessage}
              bsStyle="primary"
            >
              Send
            </Button>
          </FormGroup>
        </div>
      </div>
    );
  }
}
