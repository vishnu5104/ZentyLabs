'use client';

import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import { EventBus } from '../app/gamebuilder/EventBus';

// umi.use(dasApi());

export default function LeftSidebar() {
  // const wallet = useWallet();
  // const walletid = wallet.publicKey?.toBase58(); // Get wallet public key as string
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState('');

  // Fetch assets once the wallet is connected and public key is available

  const fetchAssetsByOwner = async (walletId) => {
    try {
      setError('');
      setAssets([]);

      // Fetch metadata for each asset
      const assetMetadataPromises = foundAssets.map(async (asset) => {
        const response = await fetch(asset.uri);
        const metadata = await response.json();
        return { ...asset, metadata };
      });

      const assetsWithMetadata = await Promise.all(assetMetadataPromises);
      setAssets(assetsWithMetadata);
    } catch (error) {
      console.error('Error fetching assets by owner:', error);
      setError(
        'Error fetching assets. Please check the public key and try again.'
      );
    }
  };

  const NftCard = () => {
    return (
      <div className="nft-card text-black" onClick={handleClick}>
        <img
          src={metadata?.image || 'https://via.placeholder.com/150'}
          alt={metadata?.name || 'NFT Image'}
          className="nft-image"
        />
        <h3 className="nft-title">{metadata?.name || 'Unnamed NFT'}</h3>
        <p className="nft-description">
          {metadata?.description || 'No description'}
        </p>
        <p className="nft-price">{metadata?.price || '0'} SOL</p>
      </div>
    );
  };

  return (
    <div className="left-sidebar">
      <h2 className="sidebar-title text-black">NFT Assets</h2>
      {wallet.connected ? (
        <div className="nft-list">
          {assets.length > 0 ? (
            assets.map((asset, index) => <NftCard key={index} asset={asset} />)
          ) : (
            <p className="no-assets">No assets found or loading...</p>
          )}
        </div>
      ) : (
        <p className="connect-wallet">
          Please connect your wallet to view your NFT assets.
        </p>
      )}
      {error && <p className="error-message">{error}</p>}
      <style jsx>{`
        .left-sidebar {
          width: 250px;
          height: 100vh;
          background-color: #f0f0f0;
          border-right: 1px solid #ccc;
          overflow-y: auto;
          padding: 1rem;
          position: absolute;
          left: 0;
        }
        .sidebar-title {
          font-size: 1.2rem;
          font-weight: bold;
          margin-bottom: 1rem;
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
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .nft-description {
          font-size: 0.8rem;
          color: #666;
          margin: 0 0 0.25rem 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .nft-price {
          font-size: 0.8rem;
          font-weight: bold;
          color: #4a4a4a;
          margin: 0;
        }
        .no-assets,
        .connect-wallet {
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
