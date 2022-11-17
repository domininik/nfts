import React from 'react';
import { Form, Table } from 'semantic-ui-react';
import BidRow from './BidRow';

class Approve extends React.Component {
  state = {
    tokenId: '',
    bidIds: []
  }

  getBidsByToken = async (event) => {
    event.preventDefault();

    try {
      const bidIds = await this.props.contract.getBidsByToken(this.state.tokenId);
      this.setState({ bidIds: bidIds });
    } catch (error) {
      console.log(error.message);
    }
  }

  renderRows() {
    return this.state.bidIds.map((bidId, index) => {
      return(
        <BidRow
          key={index}
          index={index}
          bidId={bidId}
          contract={this.props.contract}
        />
      )
    })
  }

  render() {
    return(
      <React.Fragment>
        <Form onSubmit={this.getBidsByToken}>
          <Form.Group>
            <Form.Input
              placeholder='token id'
              value={this.state.tokenId}
              onChange={(e) => this.setState({ tokenId: e.target.value })}
            />
            <Form.Button primary content='Search' onClick={this.getBidsByToken} />
          </Form.Group>
        </Form>

        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width={1}></Table.HeaderCell>
              <Table.HeaderCell width={2}>price</Table.HeaderCell>
              <Table.HeaderCell width={6}>trader</Table.HeaderCell>
              <Table.HeaderCell>action</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            { this.renderRows() }
          </Table.Body>
        </Table>
      </React.Fragment>
    )
  }
}

export default Approve;
