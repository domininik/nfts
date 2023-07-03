// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DFToken is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    struct Bid {
        address trader;
        uint value;
        uint tokenId;
    }

    Counters.Counter public s_tokenIdCounter;
    Bid[] public s_bids;
    mapping (uint => uint) public s_bidToToken;
    mapping (uint => uint) public s_tokenBidsCount;
    mapping (uint => uint) public s_price;

    constructor() ERC721("DFToken", "DFT") {
        // start counter with 1 instead of 0
        s_tokenIdCounter.increment();
    }

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = s_tokenIdCounter.current();
        s_tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function safeBurn(uint tokenId) public onlyOwner {
        _burn(tokenId);
        _cleanBids(tokenId);
        _cleanPrice(tokenId);
        s_tokenIdCounter.decrement();
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    //

    function getDetails(uint tokenId) public view returns(address, string memory, uint) {
        return (
            ownerOf(tokenId),
            tokenURI(tokenId),
            s_price[tokenId]
        );
    }

    function setPrice(uint tokenId, uint value) public {
        require(ownerOf(tokenId) == msg.sender, "You are not the item owner");

        s_price[tokenId] = value;
    }

    function bid(uint tokenId, uint value) public {
        require(s_price[tokenId] > 0, "Item is not for sale");

        s_bids.push(Bid(msg.sender, value, tokenId));
        uint id = s_bids.length - 1;
        s_bidToToken[id] = tokenId;
        s_tokenBidsCount[tokenId]++;
    }

    function getBidsByToken(uint tokenId) public view returns(uint[] memory) {
        uint[] memory result = new uint[](s_tokenBidsCount[tokenId]);
        uint counter = 0;

        for (uint i = 0; i < s_bids.length; i ++) {
            if (s_bidToToken[i] == tokenId) {
                result[counter] = i;
                counter++;
            }
        }
        return result;
    }

    function buy(uint tokenId) public payable {
        require(s_price[tokenId] > 0, "Item is not for sale");
        require(s_price[tokenId] == msg.value, "Price is not met");

        address payable userPayable = payable(ownerOf(tokenId));
        userPayable.transfer(s_price[tokenId]);
        _cleanPrice(tokenId);
        _cleanBids(tokenId);
        transferFrom(ownerOf(tokenId), msg.sender, tokenId);
    }

    function _cleanPrice(uint tokenId) private {
        s_price[tokenId] = 0;
    }

    function _cleanBids(uint tokenId) private {
        s_tokenBidsCount[tokenId] = 0;

        for (uint i = 0; i < s_bids.length; i ++) {
            if (s_bidToToken[i] == tokenId) {
                s_bidToToken[i] = 0;
            }
        }
    }
}
