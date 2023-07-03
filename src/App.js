import React from 'react';
import { ethers } from 'ethers';
import DFToken from './artifacts/contracts/DFToken.sol/DFToken.json';
import { Container, Message, Segment, Menu } from 'semantic-ui-react';
import Gallery from './Gallery.js';
import Mint from './Mint.js';
import Transfer from './Transfer';
import Bids from './Bids';

class App extends React.Component {
  state = {
    activeItem: 'gallery',
    contract: null,
    signerAddress: '',
    owner: null,
    balance: 0
  }

  componentDidMount() {
    if (typeof window.ethereum !== 'undefined') {
      this.initialize();
    } else {
      console.log('ERROR: web3 provider not available');
    };
  };

  async initialize() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    let contract;
    let signerAddress;

    try {
      signerAddress = await signer.getAddress();
      const contractAddress = ethers.utils.getContractAddress({
        from: signerAddress,
        nonce: 0
      });
      contract = new ethers.Contract(contractAddress, DFToken.abi, signer);
      const owner = await contract.owner();
      const balance = await contract.balanceOf(signerAddress);

      this.addListeners(contract);

      this.setState({
        owner: owner,
        balance: balance.toString(),
      });
    } catch (error) {
      console.log(error);
    }

    this.setState({
      contract: contract,
      signerAddress: signerAddress
    });
  }

  addListeners(contract) {
    contract.on('Transfer', async (from, to, tokenId, event) => {
      const notification = `Token #${tokenId} transferred from ${from} to ${to}`;
      const block = await event.getBlock();
      const timestamp = new Date(block.timestamp * 1000);
      const balance = await contract.balanceOf(this.state.signerAddress);

      this.setState({
        notification: notification,
        timestamp: timestamp.toUTCString(),
        balance: balance.toString(),
      });
    });

    contract.on('Approval', async (owner, approved, tokenId, event) => {
      const notification = `Token #${tokenId} approved for ${approved} by ${owner}`;
      const block = await event.getBlock();
      const timestamp = new Date(block.timestamp * 1000);

      this.setState({
        notification: notification,
        timestamp: timestamp.toUTCString()
      });
    });
  }

  handleItemClick = (event, { name }) => {
    this.setState({ activeItem: name });
  }

  render() {
    return (
      <Container style={{marginTop: 10}}>
        {
          this.state.owner === this.state.signerAddress && this.state.notification ? (
            <Message positive>
              <Message.Header>New event at {this.state.timestamp}</Message.Header>
              {this.state.notification}
            </Message>
          ) : null
        }
        <React.Fragment>
          <Menu attached='top' tabular>
            <Menu.Item
              name='gallery'
              active={this.state.activeItem === 'gallery'}
              onClick={this.handleItemClick}
            />
            <Menu.Item
              name='bids'
              active={this.state.activeItem === 'bids'}
              onClick={this.handleItemClick}
            />
            {
              this.state.owner === this.state.signerAddress ? (
                <React.Fragment>
                  <Menu.Item
                    name='transfer'
                    active={this.state.activeItem === 'transfer'}
                    onClick={this.handleItemClick}
                  />
                  <Menu.Item
                    name='mint'
                    active={this.state.activeItem === 'mint'}
                    onClick={this.handleItemClick}
                  />
                </React.Fragment>
              ) : null
            }
          </Menu>
          <Segment attached>
            {
              this.state.activeItem === 'gallery' ? (
                <Gallery
                  contract={this.state.contract}
                  signerAddress={this.state.signerAddress}
                />
              ) : null
            }
            {
              this.state.activeItem === 'mint' ? (
                <Mint
                  contract={this.state.contract}
                  signerAddress={this.state.signerAddress}
                />
              ) : null
            }
            {
              this.state.activeItem === 'transfer' ? (
                <Transfer
                  contract={this.state.contract}
                  signerAddress={this.state.signerAddress}
                />
              ) : null
            }
            {
              this.state.activeItem === 'bids' ? (
                <Bids
                  contract={this.state.contract}
                  signerAddress={this.state.signerAddress}
                />
              ) : null
            }
          </Segment>
          <Message>
            <Message.Header>{ this.state.balance } owned by you</Message.Header>
          </Message>
        </React.Fragment>
      </Container>
    )
  }
}

export default App;
