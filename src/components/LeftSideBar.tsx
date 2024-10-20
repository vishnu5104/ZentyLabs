'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const contractAddress = '0xDB9c3B477481c33A908ff0F035C9a60566091F67';

const contractABI = [
  'function currentTokenId() view returns (uint256)',
  'function nftPrices(uint256) view returns (uint256)',
  'function allTokenIds(uint256) view returns (uint256)',
  'function mintNFT(string memory tokenURI, uint256 priceInWei)',
  'function buyNFT(uint256 tokenId) payable',
  'function updateNFTPrice(uint256 tokenId, uint256 newPriceInWei)',
  'function getAllMintedNFTs() view returns (uint256[] memory)',
  'function getTotalMintedNFTs() view returns (uint256)',
  'function getAllTokenURIs() view returns (string[] memory)',
  'function getUserOwnedNFTs(address user) view returns (uint256[] memory)',
  'function isowner(address owner, uint256 ownertokenID) view returns (bool)',
  'function getUserOwnedNFTURIs(address user) view returns (string[] memory)',
  'function tokenURI(uint256 tokenId) view returns (string memory)',
];

export default function LeftSidebar() {
  const [nfts, setNfts] = useState([]);
  const [error, setError] = useState('');
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');

  useEffect(() => {
    const initializeContract = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const nftContract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );
          setContract(nftContract);
          setAccount(await signer.getAddress());

          fetchAllNFTs(nftContract);
        } catch (error) {
          console.error('Failed to initialize contract:', error);
          setError(
            'Failed to connect to the blockchain. Please check your wallet connection.'
          );
        }
      } else {
        setError(
          'Please install MetaMask or another Ethereum wallet to use this application.'
        );
      }
    };

    initializeContract();
  }, []);

  const fetchAllNFTs = async (nftContract) => {
    try {
      setError('');
      setNfts([]);

      const totalNFTs = await nftContract.getTotalMintedNFTs();
      const allTokenURIs = await nftContract.getAllTokenURIs();

      const nftPromises = Array.from(
        { length: totalNFTs.toNumber() },
        async (_, index) => {
          const tokenId = await nftContract.allTokenIds(index);
          const price = await nftContract.nftPrices(tokenId);
          const uri = allTokenURIs[index];

          try {
            const response = await fetch(uri);
            const metadata = await response.json();

            return {
              id: tokenId.toString(),
              price: ethers.formatEther(price),
              metadata,
            };
          } catch (error) {
            console.error(`Error fetching metadata for NFT ${tokenId}:`, error);
            return null;
          }
        }
      );

      const nftData = (await Promise.all(nftPromises)).filter(Boolean);

      setNfts(nftData);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setError('Error fetching NFTs. Please try again later.');
    }
  };

  const NftCard = ({ nft }) => (
    <div className="nft-card">
      <img
        src={nft.metadata.image || 'https://via.placeholder.com/150'}
        alt={nft.metadata.name || 'NFT Image'}
        className="nft-image"
      />
      <h3 className="nft-title">{nft.metadata.name || 'Unnamed NFT'}</h3>
      <p className="nft-description">
        {nft.metadata.description || 'No description'}
      </p>
      <p className="nft-price">{nft.price} ETH</p>
    </div>
  );

  return (
    <div className="left-sidebar">
      <h2 className="sidebar-title">NFT Marketplace</h2>
      <div className="nft-list">
        {nfts.length > 0 ? (
          nfts.map((nft) => <NftCard key={nft.id} nft={nft} />)
        ) : (
          <p className="no-assets">No NFTs found or loading...</p>
        )}
      </div>
      {error && <p className="error-message">{error}</p>}
      <style jsx>{`
        .left-sidebar {
          width: 250px;
          height: 100vh;
          background-color: #f0f0f0;
          border-right: 1px solid #ccc;
          overflow-y: auto;
          padding: 1rem;
        }
        .sidebar-title {
          font-size: 1.2rem;
          font-weight: bold;
          margin-bottom: 1rem;
          color: #333;
        }
        .nft-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .nft-card {
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 0.5rem;
          cursor: pointer;
          transition: box-shadow 0.3s ease;
        }
        .nft-card:hover {
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .nft-image {
          width: 100%;
          height: 100px;
          object-fit: cover;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }
        .nft-title {
          font-size: 0.9rem;
          font-weight: bold;
          margin: 0 0 0.25rem 0;
          color: #333;
        }
        .nft-description {
          font-size: 0.8rem;
          color: #666;
          margin: 0 0 0.25rem 0;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .nft-price {
          font-size: 0.8rem;
          font-weight: bold;
          color: #4a4a4a;
          margin: 0;
        }
        .no-assets {
          font-size: 0.9rem;
          color: #666;
        }
        .error-message {
          font-size: 0.8rem;
          color: red;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
}
