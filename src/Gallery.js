import React from 'react';
import { Form, Message, Table } from 'semantic-ui-react';
import Sell from './Sell.js';

class Gallery extends React.Component {
  state = {
    errorMessage: '',
    tokenId: '',
    owner: '',
    uri: '',
    price: ''
  }

  search = async (event) => {
    event.preventDefault();
    this.setState({ errorMessage: '' });

    try {
      const details = await this.props.contract.getDetails(this.state.tokenId);
      this.setState({
        owner: details[0],
        uri: details[1],
        price: details[2].toString()
      });
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  }

  render() {
    return(
      <React.Fragment>
        <Form onSubmit={this.search} error={!!this.state.errorMessage}>
          <Message error header="Error" content={this.state.errorMessage} />
          <Form.Group>
            <Form.Input
              placeholder='tokenId'
              value={this.state.tokenId}
              onChange={(e) => this.setState({ tokenId: e.target.value })}
            />
            <Form.Button primary content='Search' onClick={this.search} />
          </Form.Group>
        </Form>
        {
          this.state.owner === this.props.signerAddress ? (
            <Sell
              contract={this.props.contract}
              signerAddress={this.state.signerAddress}
              tokenId={this.state.tokenId}
            />
          ) : null
        }
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
              <Table.Cell>
                {
                  this.state.price ? (
                    this.state.price === '0' ? 'not for sale' : this.state.price
                  ) : null
                }
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </React.Fragment>
    );
  };
}

export default Gallery;
