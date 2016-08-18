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
      emailKey: '',
      loggedIn: false,
      message: '',
      messages: [],
      myTurn: false,
      totalPlayers: 0,
      participants: [],
      rid: '',
      username: '',
    };
  }

  componentWillMount() {
    const { auth } = this.state;
    const { params } = this.props;
    // Initiates Firebase auth and listen to auth state changes.
    auth.onAuthStateChanged(this.onAuthStateChanged);
    this.setState({ rid: params.rid });
  }

  // Triggers when the auth state change for instance when the user signs-in or signs-out.
  onAuthStateChanged = (user) => {
    const { database, rid } = this.state;
    if (user) {
      this.setState({
        loggedIn: true,
        username: user.displayName,
        emailKey: this.escapeEmailAddress(user.email),
        messages: [],
      });
      const userRef = database.ref(`${rid}/participants/`).child(this.escapeEmailAddress(user.email));
      userRef.update({ name: user.displayName });
      this.loadMessages();
      this.loadParticipants();
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
    const { database, loggedIn, message, rid, username } = this.state;
    if (message && loggedIn) {
      // Add a new message entry to the Firebase Database.
      database.ref(`${rid}/messages`).push({
        name: username,
        text: message,
      }).then(() => {
        this.setState({ message: '' });
      });
    }
  }

  loadMessages() {
    const { database, messages, rid } = this.state;
    const messagesRef = database.ref(`${rid}/messages`);
    messagesRef.off();
    messagesRef.limitToLast(12).on('child_added', (data) => {
      const val = data.val();
      messages.push({ key: data.key, name: val.name, text: val.text });
      this.setState({ messages });
    });
    messagesRef.on('child_removed', (data) => {
      for (let i = 0; i < messages.length; i++) {
        if (messages[i].key === data.key) {
          messages.splice(i, 1);
          this.setState({ messages });
          return;
        }
      }
    });
  }

  loadParticipants() {
    const { database, emailKey, participants, rid } = this.state;
    const usersRef = database.ref(`${rid}/participants`);
    usersRef.off();
    usersRef.on('child_added', (data) => {
      const val = data.val();
      participants.push({
        key: data.key,
        name: val.name,
        role: val.role,
        health: 5,
        hand: [],
        turn: false,
      });
      if (data.key === emailKey) {
        this.setState({ myTurn: val.turn });
      }
      const num = participants.length;
      this.setState({ participants, totalPlayers: num, assign: num >= 3 });
    });
    usersRef.on('child_changed', (data) => {
      const val = data.val();
      if (data.key === emailKey) {
        this.setState({ myTurn: val.turn });
      }
    });
    usersRef.on('child_removed', (data) => {
      for (let i = 0; i < participants.length; i++) {
        if (participants[i].key === data.key) {
          participants.splice(i, 1);
          const num = participants.length;
          this.setState({ participants, totalPlayers: num, assign: num >= 3 });
          return;
        }
      }
    });
  }

  deleteMessages = () => {
    const { database, rid } = this.state;
    const messagesRef = database.ref(`${rid}/messages/`);
    messagesRef.remove();
    this.setState({ messages: [] });
  }

  render() {
    const { auth, assign, database, emailKey, message, messages, myTurn, participants, rid, username } = this.state;
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
            auth={auth}
            assign={assign}
            database={database}
            emailKey={emailKey}
            myTurn={myTurn}
            rid={rid}
            participants={participants}
            username={username}
            loadParticipants={this.loadParticipants}
          />
        </div>
      </div>
    );
  }
}
