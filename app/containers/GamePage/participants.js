import React, { Component, PropTypes } from 'react';
import { Button } from 'react-bootstrap';

export default class ParticipantList extends Component {
  static propTypes = {
    emailKey: PropTypes.string,
    players: PropTypes.array,
    selectTarget: PropTypes.func,
  }

  render() {
    const { players, selectTarget, emailKey } = this.props;
    if (!players) {
      return null;
    }
    return (
      <ul>
        {
          players.map((player) =>
            <div
              key={player.key}
            >
              <div hidden={emailKey === player.key}>
                <Button
                  onClick={selectTarget}
                  value={player.key}
                >
                  {player.name}
                </Button> [ Health: {player.health} ]
              </div>
            </div>
        )}
      </ul>
    );
  }
}
