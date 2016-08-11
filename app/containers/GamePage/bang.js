import React, { Component, PropTypes } from 'react';
import * as firebase from 'firebase';
import { Button } from 'react-bootstrap';

export default class Bang extends Component {
  static propTypes = {
    params: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {
      auth: firebase.auth(),
      database: firebase.database(),
      players: 5,
      roles: ['Sheriff', 'Outlaw', 'Renegade', 'Outlaw', 'Vice', 'Outlaw', 'Vice'],
      cards: [''],
    };
  }

  componentWillMount() {
    console.log(this.props);
  }

  assignRoles = () => {
    const { players, roles } = this.state;
    for (let i = players - 1; i >= 0; i--) {
      const index = Math.floor(Math.random() * (i + 1));
      console.log(roles[index]);
      roles.splice(index, 1);
      console.log(roles);
      this.setState({ roles });
    }
  }

  createBangCards() {
    const { cards, players } = this.state;
    for (let i = 0; i < 25; i++) {
      cards.push({ name: 'Bang!', type: 'attack', hit: -1, targets: 1, limit: 1 });
    }
    for (let i = 0; i < 3; i++) {
      cards.push({ name: 'Indians', type: 'attack', hit: -1, targets: players, limit: 0 });
    }
    for (let i = 0; i < 12; i++) {
      cards.push({ name: 'Missed!', type: 'defense', hit: 1, targets: 1, limit: 0 });
    }
    this.setState({ cards });
  }

  render() {
    return (
      <div>
        <Button
          type="submit"
          bsStyle="primary"
          onClick={this.assignRoles}
        >
          Assign Roles
        </Button>
      </div>
    );
  }
}
