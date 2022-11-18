import React from 'react';
import { Form, Table, Message } from 'semantic-ui-react';
import BidRow from './BidRow';

class Approve extends React.Component {
  state = {
    tokenId: '',
    bidIds: [],
    tokenOwner: null,
    approvedAddress: null
  }

  search = async (event) => {
    event.preventDefault();

    try {
      const bidIds = await this.props.contract.getBidsByToken(this.state.tokenId);
      const tokenOwner = await this.props.contract.ownerOf(this.state.tokenId);
      const approvedAddress = await this.props.contract.getApproved(this.state.tokenId);

      this.setState({
        bidIds: bidIds,
        tokenOwner: tokenOwner,
        approvedAddress: approvedAddress
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  onError = async (message) => {
    this.setState({ errorMessage: message });
  }

  renderRows() {
    return this.state.bidIds.map((bidId, index) => {
      return(
        <BidRow
          key={index}
          index={index}
          bidId={bidId}
          contract={this.props.contract}
          signerAddress={this.props.signerAddress}
          tokenId={this.state.tokenId}
          tokenOwner={this.state.tokenOwner}
          approvedAddress={this.state.approvedAddress}
          onError={this.onError}
        />
      )
    })
  }

  render() {
    return(
      <React.Fragment>
        <Form onSubmit={this.getBidsByToken} error={!!this.state.errorMessage}>
          <Message error header="Error" content={this.state.errorMessage} />
          <Form.Group>
            <Form.Input
              placeholder='token id'
              value={this.state.tokenId}
              onChange={(e) => this.setState({ tokenId: e.target.value })}
            />
            <Form.Button primary content='Search' onClick={this.search} />
          </Form.Group>
        </Form>

        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width={1}></Table.HeaderCell>
              <Table.HeaderCell width={2}>price</Table.HeaderCell>
              <Table.HeaderCell width={6}>trader</Table.HeaderCell>
              <Table.HeaderCell>actions</Table.HeaderCell>
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
