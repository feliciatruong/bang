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
      roles: ['Sheriff', 'Outlaw', 'Renegade', 'Outlaw', 'Vice', 'Outlaw', 'Vice'],
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
    });
    usersRef.limitToLast(12).on('child_changed', (data) => {
      const val = data.val();
      participants.push({ key: data.key, name: val.name, role: '', health: 5, hand: [] });
      this.setState({ participants });
    });
    usersRef.once('value', (snapshot) => {
      const num = snapshot.numChildren();
      this.setState({ players: num });
      if (num >= 3) {
        this.setState({ assign: true });
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

  joinGame = () => {
    const { database, email, username } = this.state;
    const { params } = this.props;
    const userRef = database.ref(`${params.rid}/participants/`).child(this.escapeEmailAddress(email));
    userRef.update({ name: username });
  }

  leaveGame = () => {
    const { database, email } = this.state;
    const { params } = this.props;
    const userRef = database.ref(`${params.rid}/participants/`).child(this.escapeEmailAddress(email));
    userRef.remove();
  }

  // assignRoles = () => {
  //   const { database, participants, players, roles } = this.state;
  //   const { params } = this.props;
  //   const usersRef = database.ref(`${params.rid}/participants`);
  //   const messagesRef = database.ref(`${params.rid}/messages`);
  //   usersRef.off();
  //   for (let i = players - 1; i >= 0; i--) {
  //     const index = Math.floor(Math.random() * (i + 1));
  //     const userRef = usersRef.child(participants[i].key);
  //     participants[i].role = roles[index];
  //     userRef.update({ role: participants[i].role });
  //     if (roles[index] === 'Sheriff') {
  //       messagesRef.push({ name: '[SYSTEM]', text: `${participants[i].name} is the Sheriff!` });
  //     }
  //     roles.splice(index, 1);
  //     this.setState({ roles, participants });
  //   }
  // }

  render() {
    const { assign, database, message, messages, participants, players } = this.state;
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
            </FormGroup>
          </form>
          <Bang
            assign={assign}
            database={database}
            params={params}
            participants={participants}
            players={players}
          />
        </div>
      </div>
    );
  }
}
