import React from 'react';
import { Form, Input, Message, Button, Table } from 'semantic-ui-react';

class Gallery extends React.Component {
  state = {
    errorMessage: '',
    tokenId: this.props.signerAddress,
    tokenId: '',
    owner: '',
    uri: '',
    price: ''
  }

  onSubmit = (event) => {
    event.preventDefault();
  }

  getOwner = async () => {
    this.setState({ errorMessage: '' });

    try {
      const owner = await this.props.contract.ownerOf(this.state.tokenId);
      this.setState({ owner: owner });
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  getUri = async () => {
    this.setState({ errorMessage: '' });

    try {
      const uri = await this.props.contract.tokenURI(this.state.tokenId);
      this.setState({ uri: uri });
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  getPrice = async () => {
    this.setState({ errorMessage: '' });

    try {
      const price = await this.props.contract.price(this.state.tokenId);
      this.setState({ price: price.toString() });
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  render() {
    return(
      <React.Fragment>
        <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
          <Message error header="Error" content={this.state.errorMessage} />
          <Form.Group>
            <Form.Input
              placeholder='tokenId'
              value={this.state.tokenId}
              onChange={(e) => this.setState({ tokenId: e.target.value })}
            />
            <Form.Button primary content='Get Owner' onClick={this.getOwner} />
            <Form.Button primary content='Get URI' onClick={this.getUri} />
            <Form.Button primary content='Get Price' onClick={this.getPrice} />
          </Form.Group>
        </Form>
        <Table definition>
          <Table.Body>
            <Table.Row>
              <Table.Cell width={2}>owner</Table.Cell>
              <Table.Cell>{ this.state.owner }</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>URI</Table.Cell>
              <Table.Cell>{ this.state.uri }</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>price</Table.Cell>
              <Table.Cell>{ this.state.price }</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </React.Fragment>
    );
  };
}

export default Gallery;
