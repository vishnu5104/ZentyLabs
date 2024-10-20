// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    uint256 public currentTokenId;

    mapping(uint256 => uint256) public nftPrices;
    uint256[] public allTokenIds;

    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender) {}

    function mintNFT(
        string memory tokenURI,
        uint256 priceInWei
    ) external {
        uint256 newTokenId = currentTokenId;
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        nftPrices[newTokenId] = priceInWei;
        allTokenIds.push(newTokenId);
        currentTokenId += 1;
    }

    function buyNFT(uint256 tokenId) external payable {
        require(ownerOf(tokenId) != address(0), "NFT does not exist");
        uint256 price = nftPrices[tokenId];
        require(price > 0, "NFT price not set");
        require(msg.value >= price, "Insufficient payment");

        address payable nftOwner = payable(ownerOf(tokenId));
        require(msg.sender != nftOwner, "Owner cannot buy their own NFT");

        _transfer(nftOwner, msg.sender, tokenId);
        nftOwner.transfer(price);

        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
    }

    function updateNFTPrice(
        uint256 tokenId,
        uint256 newPriceInWei
    ) external {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only the owner can update the price"
        );
        nftPrices[tokenId] = newPriceInWei;
    }

    function getAllMintedNFTs() external view returns (uint256[] memory) {
        return allTokenIds;
    }

    function getTotalMintedNFTs() external view returns (uint256) {
        return allTokenIds.length;
    }

    function getAllTokenURIs() external view returns (string[] memory) {
        uint256 totalTokens = allTokenIds.length;
        string[] memory uris = new string[](totalTokens);

        for (uint256 i = 0; i < totalTokens; i++) {
            uris[i] = tokenURI(allTokenIds[i]);
        }

        return uris;
    }

    function getUserOwnedNFTs(address user) external view returns (uint256[] memory) {
        uint256 totalTokens = allTokenIds.length;
        uint256[] memory ownedTokens = new uint256[](totalTokens);
        uint256 ownedCount = 0;

        for (uint256 i = 0; i < totalTokens; i++) {
            uint256 tokenId = allTokenIds[i];
            if (ownerOf(tokenId) == user) {
                ownedTokens[ownedCount] = tokenId;
                ownedCount++;
            }
        }

        // Resize the array to remove empty slots
        assembly {
            mstore(ownedTokens, ownedCount)
        }

        return ownedTokens;
    }

    function isowner(address owner,uint256 ownertokenID) external view returns (bool){
        if(ownerOf(ownertokenID) == owner){
                return true;
        }
        else{
            return false;
        }
    }

    function getUserOwnedNFTURIs(address user) external view returns (string[] memory) {
        uint256[] memory ownedTokenIds = this.getUserOwnedNFTs(user);
        uint256 ownedCount = ownedTokenIds.length;
        string[] memory uris = new string[](ownedCount);

        for (uint256 i = 0; i < ownedCount; i++) {
            uris[i] = tokenURI(ownedTokenIds[i]);
        }

        return uris;
    }
}