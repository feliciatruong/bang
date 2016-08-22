import React, { Component, PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import Hand from './hand.js';

export default class Bang extends Component {
  static propTypes = {
    auth: PropTypes.object,
    assign: PropTypes.bool,
    database: PropTypes.object,
    emailKey: PropTypes.string,
    participants: PropTypes.array,
    rid: PropTypes.string,
    username: PropTypes.string,
    loadParticipants: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      hand: [],
      roles: ['Sheriff', 'Outlaw', 'Renegade', 'Outlaw', 'Vice', 'Outlaw', 'Vice'],
      deck: [],
      joined: false,
      myTurn: false,
      rolesAssigned: false,
    };
  }

  componentWillMount() {
    const { auth } = this.props;
    // Initiates Firebase auth and listen to auth state changes.
    auth.onAuthStateChanged(this.onAuthStateChanged);
  }

    // Triggers when the auth state change for instance when the user signs-in or signs-out.
  onAuthStateChanged = (user) => {
    if (user) {
      this.loadHand();
      this.handleTurn();
    }
  }

  assignRoles = () => {
    const { roles } = this.state;
    const { database, rid, participants } = this.props;
    const usersRef = database.ref(`${rid}/participants`);
    const messagesRef = database.ref(`${rid}/messages`);
    for (let i = participants.length - 1; i >= 0; i--) {
      const index = Math.floor(Math.random() * (i + 1));
      const userRef = usersRef.child(participants[i].key);
      participants[i].role = roles[index];
      userRef.update({
        role: participants[i].role,
        health: participants[i].health,
        hand: [],
      });
      if (roles[index] === 'Sheriff') {
        messagesRef.push({ name: '[SYSTEM]', text: `${participants[i].name} is the Sheriff!` });
        database.ref(`${rid}/current`).child('player').update({ index: i });
      }
      roles.splice(index, 1);
      this.setState({ roles, participants });
    }
    this.setState({ rolesAssigned: true });
    this.createBangCards();
    this.shuffleCards();
    this.dealCards();
  }

  shuffleCards() {
    const { deck } = this.state;
    const { database, rid } = this.props;
    for (let i = deck.length - 1; i >= 0; i--) {
      const rand = Math.floor(Math.random() * (deck.length));
      const temp = deck[i];
      deck[i] = deck[rand];
      deck[rand] = temp;
    }
    this.setState({ deck });
    database.ref(`${rid}/cards`).set(deck);
    database.ref(`${rid}/hand`).remove();
  }

  dealCards() {
    const { deck } = this.state;
    const { database, participants, rid } = this.props;
    const usersRef = database.ref(`${rid}/participants`);
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < participants.length; j++) {
        participants[j].hand.push(deck.pop());
      }
    }
    this.setState({ deck, participants });
    for (let j = 0; j < participants.length; j++) {
      const userRef = usersRef.child(participants[j].key);
      userRef.update({ hand: participants[j].hand });
    }
  }

  createBangCards() {
    const { deck } = this.state;
    const { participants } = this.props;
    for (let i = 0; i < 25; i++) {
      deck.push({ name: 'Bang!', type: 'attack', hit: -1, targets: 1, limit: 1 });
    }
    for (let i = 0; i < 3; i++) {
      deck.push({ name: 'Indians', type: 'attack', hit: -1, targets: participants.length, limit: 0 });
    }
    for (let i = 0; i < 12; i++) {
      deck.push({ name: 'Missed!', type: 'defense', hit: 0, targets: 1, limit: 0 });
    }
    for (let i = 0; i < 6; i++) {
      deck.push({ name: 'Beer', type: 'defense', hit: 1, targets: 1, limit: 0 });
    }
    for (let i = 0; i < 4; i++) {
      deck.push({ name: 'Panic!', type: 'support', hit: 0, targets: 1, limit: 0, range: 1 });
    }
    for (let i = 0; i < 4; i++) {
      deck.push({ name: 'Cat Balou', type: 'support', hit: 0, targets: 1, limit: 0 });
    }
    for (let i = 0; i < 2; i++) {
      deck.push({ name: 'Stagecoach', type: 'support', hit: 0, targets: 1, limit: 0 });
    }
    for (let i = 0; i < 2; i++) {
      deck.push({ name: 'Wells Fargo', type: 'support', hit: 0, targets: 1, limit: 0 });
    }
    this.setState({ deck });
  }

  handleTurn() {
    const { database, emailKey, participants, rid } = this.props;
    const databaseRef = database.ref(`${rid}/current/player`);
    databaseRef.off();
    databaseRef.on('child_added', (data) => {
      const val = data.val();
      if (participants.length !== 0) {
        if (participants[val].key === emailKey) {
          this.setState({ myTurn: true });
        } else {
          this.setState({ myTurn: false });
        }
      }
    });
    databaseRef.on('child_changed', (data) => {
      const val = data.val();
      if (participants.length !== 0) {
        if (participants[val].key === emailKey) {
          this.setState({ myTurn: true });
        } else {
          this.setState({ myTurn: false });
        }
      }
    });
  }

  loadHand() {
    const { hand } = this.state;
    const { database, emailKey, rid } = this.props;
    const userRef = database.ref(`${rid}/participants/${emailKey}/hand/`);
    userRef.off();
    userRef.on('child_added', (data) => {
      const val = data.val();
      hand.push({ key: data.key, name: val.name });
      this.setState({ hand });
    });
    userRef.on('child_removed', (data) => {
      const val = data.val();
      for (let i = 0; i < hand.length; i++) {
        if (hand[i].name === val.name) {
          hand.splice(i, 1);
          this.setState({ hand });
        }
      }
    });
  }

  endTurn = () => {
    const { database, rid, participants } = this.props;
    const databaseRef = database.ref(`${rid}/current/player`);
    databaseRef.once('value', (data) => {
      const currentPlayer = data.val().index;
      const nextPlayer = (currentPlayer + 1) % participants.length;
      databaseRef.update({ index: nextPlayer });
    });
  }

  joinGame = () => {
    const { database, emailKey, rid, username } = this.props;
    const userRef = database.ref(`${rid}/participants/`).child(emailKey);
    userRef.update({ name: username });
    this.setState({ joined: false });
  }

  leaveGame = () => {
    const { database, emailKey, rid } = this.props;
    const userRef = database.ref(`${rid}/participants/`).child(emailKey);
    userRef.remove();
    this.setState({ joined: true });
  }

  render() {
    const { hand, joined, myTurn, rolesAssigned } = this.state;
    const { assign } = this.props;
    return (
      <div>
        <Button hidden={!joined} onClick={this.joinGame}>
          Join Game
        </Button>
        <Button hidden={joined} onClick={this.leaveGame}>
          Leave Game
        </Button>
        <Button
          bsStyle="danger"
          hidden={!myTurn}
          onClick={this.endTurn}
        >
          End Turn
        </Button>
        <Button
          hidden={rolesAssigned}
          disabled={!assign}
          bsStyle="primary"
          onClick={this.assignRoles}
        >
          Assign Roles
        </Button>
        <Hand items={hand} myTurn={myTurn} />
      </div>
    );
  }
}
