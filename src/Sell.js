import React from 'react';
import { Form, Message } from 'semantic-ui-react';

class Sell extends React.Component {
  state = {
    errorMessage: '',
    value: ''
  }

  onSubmit = (event) => {
    event.preventDefault();
  }

  setPrice = async () => {
    this.setState({ errorMessage: '' });

    try {
      await this.props.contract.setPrice(
        this.props.tokenId,
        this.state.value
      );
      this.props.onPriceChange(this.state.value);
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  render() {
    return(
      <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
        <Message error header="Error" content={this.state.errorMessage} />
        <Form.Group>
          <Form.Input
            placeholder='price'
            value={this.state.value}
            onChange={(e) => this.setState({ value: e.target.value })}
          />
          <Form.Button positive content='Set price' onClick={this.setPrice} />
        </Form.Group>
      </Form>
    );
  }
}

export default Sell;
