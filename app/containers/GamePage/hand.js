import React, { Component, PropTypes } from 'react';

export default class Hand extends Component {
  static propTypes = {
    items: PropTypes.array,
  }

  render() {
    const { items } = this.props;
    if (!items) {
      return null;
    }
    return (
      <ul>
        {
          items.map((item) =>
            <div
              key={item.key}
            >
              <div id="card">{item.name}</div>
            </div>
        )}
      </ul>
    );
  }
}
