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
        uint256 value;
        uint256 tokenId;
    }

    Counters.Counter private s_tokenIdCounter;
    Bid[] private s_bids;
    mapping (uint256 => uint256) private s_bidToToken;
    mapping (uint256 => uint256) private s_tokenBidsCount;
    mapping (uint256 => uint256) private s_price;

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

    function safeBurn(uint256 tokenId) public onlyOwner {
        _burn(tokenId);
        _cleanBids(tokenId);
        _cleanPrice(tokenId);
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

    function getDetails(uint256 tokenId) public view returns(address, string memory, uint256) {
        return (
            ownerOf(tokenId),
            tokenURI(tokenId),
            s_price[tokenId]
        );
    }

    function setPrice(uint256 tokenId, uint256 value) public {
        require(ownerOf(tokenId) == msg.sender, "You are not the item owner");

        s_price[tokenId] = value;
    }

    function getPrice(uint256 tokenId) public view returns(uint256) {
        return s_price[tokenId];
    }

    function bid(uint256 tokenId, uint256 value) public {
        require(s_price[tokenId] > 0, "Item is not for sale");

        s_bids.push(Bid(msg.sender, value, tokenId));
        uint256 id = s_bids.length - 1;
        s_bidToToken[id] = tokenId;
        s_tokenBidsCount[tokenId]++;
    }

    function getBidsByToken(uint256 tokenId) public view returns(uint256[] memory) {
        uint256[] memory result = new uint256[](s_tokenBidsCount[tokenId]);
        uint256 counter = 0;

        for (uint256 i = 0; i < s_bids.length; i ++) {
            if (s_bidToToken[i] == tokenId) {
                result[counter] = i;
                counter++;
            }
        }
        return result;
    }

    function getBid(uint256 id) public view returns(Bid memory) {
        return s_bids[id];
    }

    function buy(uint256 tokenId) public payable {
        require(s_price[tokenId] > 0, "Item is not for sale");
        require(s_price[tokenId] == msg.value, "Price is not met");

        address payable userPayable = payable(ownerOf(tokenId));
        userPayable.transfer(s_price[tokenId]);
        _cleanPrice(tokenId);
        _cleanBids(tokenId);
        transferFrom(ownerOf(tokenId), msg.sender, tokenId);
    }

    function _cleanPrice(uint256 tokenId) private {
        s_price[tokenId] = 0;
    }

    function _cleanBids(uint256 tokenId) private {
        s_tokenBidsCount[tokenId] = 0;

        for (uint256 i = 0; i < s_bids.length; i ++) {
            if (s_bidToToken[i] == tokenId) {
                s_bidToToken[i] = 0;
            }
        }
    }
}
