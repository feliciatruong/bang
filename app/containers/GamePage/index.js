import React, { Component, PropTypes } from 'react';
import * as firebase from 'firebase';
import { Button, FormGroup, FormControl } from 'react-bootstrap';
import MessageList from './messages.js';
import Bang from './bang.js';

export default class GamePage extends Component {

  static propTypes = {
    params: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {
      assign: false,
      auth: firebase.auth(),
      database: firebase.database(),
      email: '',
      loggedIn: false,
      message: '',
      messages: [],
      players: 0,
      participants: [],
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
    const { database } = this.state;
    const { params } = this.props;
    const userRef = database.ref(`${params.rid}/participants/`).child(this.escapeEmailAddress(user.email));
    if (user) {
      this.setState({
        loggedIn: true,
        username: user.displayName,
        email: user.email,
        messages: [],
        participants: [],
      });
      this.loadMessages();
      this.loadParticipants();
      userRef.update({ name: user.displayName });
    }
  }

  escapeEmailAddress(email) {
    if (!email) return false;
    // Replace '.' (not allowed in a Firebase key) with ',' (not allowed in an email address)
    return email.toLowerCase().replace(/\./g, ',');
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
      database.ref(`${params.rid}/messages`).push({
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
    const messagesRef = database.ref(`${params.rid}/messages`);
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

  loadParticipants() {
    const { database, participants } = this.state;
    const { params } = this.props;
    const usersRef = database.ref(`${params.rid}/participants`);
    usersRef.off();
    usersRef.limitToLast(12).on('child_added', (data) => {
      const val = data.val();
      participants.push({ key: data.key, name: val.name, role: '', health: 5, hand: [] });
      this.setState({ participants });
      usersRef.once('value', (snapshot) => {
        const num = snapshot.numChildren();
        this.setState({ players: num });
        if (num >= 3) {
          this.setState({ assign: true });
        } else {
          this.setState({ assign: false });
        }
      });
    });
    usersRef.limitToLast(12).on('child_removed', (data) => {
      for (let i = 0; i < participants.length; i++) {
        if (participants[i].key === data.key) {
          participants.splice(i, 1);
          const num = participants.length;
          this.setState({ participants, players: num });
          if (num >= 3) {
            this.setState({ assign: true });
          } else {
            this.setState({ assign: false });
          }
        }
      }
    });
  }

  deleteMessages = () => {
    const { database } = this.state;
    const { params } = this.props;
    const messagesRef = database.ref(`${params.rid}/messages/`);
    messagesRef.remove();
    this.setState({ messages: [] });
  }

  render() {
    const { assign, database, email, message, messages, participants, players, username } = this.state;
    const { params } = this.props;
    return (
      <div>
        <h3>Game Page</h3>
        <div>
          <div id="participants">
            <h4>Participants</h4>
            <MessageList items={participants} />
          </div>
          <div id="messages">
            <h4>Chat</h4>
            <MessageList items={messages} />
          </div>
          <form onSubmit={this.saveMessage}>
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
                bsStyle="primary"
              >
                Send
              </Button>
              <Button
                onClick={this.deleteMessages}
              >
                Delete messages
              </Button>
            </FormGroup>
          </form>
          <Bang
            assign={assign}
            database={database}
            email={email}
            params={params}
            participants={participants}
            players={players}
            username={username}
            loadParticipants={this.loadParticipants}
          />
        </div>
      </div>
    );
  }
}
