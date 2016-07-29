import React, { Component, PropTypes } from 'react';

export default class MessageList extends Component {
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
              <div id="username">{item.name}</div>
              <div id="message">{item.text}</div>
            </div>
        )}
      </ul>
    );
  }
}
