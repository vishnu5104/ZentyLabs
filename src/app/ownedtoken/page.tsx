'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// ABI for the ERC721 ownerOf function
const ERC721_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export default function NFTOwnerLookup() {
  const [contractAddress, setContractAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [owner, setOwner] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const lookupOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setOwner('');

    try {
      // Connect to the Ethereum network (replace with your preferred provider)
      const provider = new ethers.JsonRpcProvider(
        'https://eth-holesky.g.alchemy.com/v2/ask_-6gJmaqYBX72RbRt6Fp-C9zHj0es'
      );

      // Create a contract instance
      const contract = new ethers.Contract(
        contractAddress,
        ERC721_ABI,
        provider
      );

      console.log('the con', contract);

      // Call the ownerOf function
      const ownerAddress = await contract.ownerOf(tokenId);

      console.log('th own', ownerAddress);
      setOwner(ownerAddress);
    } catch (err) {
      setError(
        'Error fetching owner. Please check the contract address and token ID.'
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>NFT Owner Lookup</CardTitle>
        <CardDescription>
          Enter the NFT contract address and token ID to find the owner.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={lookupOwner} className="space-y-4">
          <div>
            <label
              htmlFor="contractAddress"
              className="block text-sm font-medium text-gray-700"
            >
              Contract Address
            </label>
            <Input
              id="contractAddress"
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              required
            />
          </div>
          <div>
            <label
              htmlFor="tokenId"
              className="block text-sm font-medium text-gray-700"
            >
              Token ID
            </label>
            <Input
              id="tokenId"
              type="text"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="1"
              required
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Looking up...' : 'Lookup Owner'}
          </Button>
        </form>
        {owner && (
          <div className="mt-4">
            <h3 className="text-lg font-medium">Owner:</h3>
            <p className="text-sm break-all">{owner}</p>
          </div>
        )}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </CardContent>
    </Card>
  );
}
