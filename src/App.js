import React from 'react';
import { ethers } from 'ethers';
import DFToken from './artifacts/contracts/DFToken.sol/DFToken.json';

class App extends React.Component {
  state = {
    contract: null,
    signerAddress: '',
    owner: null
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
    } catch (error) {
      console.log(error);
    }

    this.setState({
      contract: contract,
      signerAddress: signerAddress
    });
  }

  render() {
    return (
      this.state.contract ? (
        <div>Contract</div>
      ) : (
        <div>You are not authorized to access this page</div>
      )
    )
  }
}

export default App;
