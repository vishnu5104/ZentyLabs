// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    IERC20 public paymentToken;
    uint256 public currentTokenId;

    mapping(uint256 => uint256) public nftPrices;

    constructor(
        IERC20 _paymentToken
    ) ERC721("MyNFT", "MNFT") Ownable(msg.sender) {
        paymentToken = _paymentToken;
    }

    function mintNFT(
        string memory tokenURI,
        uint256 priceInTokens
    ) external onlyOwner {
        uint256 newTokenId = currentTokenId;
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        nftPrices[newTokenId] = priceInTokens;
        currentTokenId += 1;
    }

    function buyNFT(uint256 tokenId) external {
        require(ownerOf(tokenId) != address(0), "NFT does not exist");
        uint256 price = nftPrices[tokenId];
        require(price > 0, "NFT price not set");

        address nftOwner = ownerOf(tokenId);
        require(msg.sender != nftOwner, "Owner cannot buy their own NFT");

        require(
            paymentToken.transferFrom(msg.sender, nftOwner, price),
            "Token transfer failed"
        );

        _transfer(nftOwner, msg.sender, tokenId);
    }

    function updateNFTPrice(
        uint256 tokenId,
        uint256 newPriceInTokens
    ) external {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only the owner can update the price"
        );
        nftPrices[tokenId] = newPriceInTokens;
    }
}
