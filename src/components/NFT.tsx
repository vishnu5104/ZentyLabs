'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const contractABI = [
  'function mintNFT(string memory tokenURI, uint256 priceInTokens) external',
  'function buyNFT(uint256 tokenId) external',
  'function updateNFTPrice(uint256 tokenId, uint256 newPriceInTokens) external',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function nftPrices(uint256 tokenId) view returns (uint256)',
  'function currentTokenId() view returns (uint256)',
];

const contractAddress = '0xCD860226DE7EF93dfCa85957981a39F39ce73707';

export default function NFTMarketplaceUI() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [tokenURI, setTokenURI] = useState('');
  const [mintPrice, setMintPrice] = useState('');
  const [buyTokenId, setBuyTokenId] = useState('');
  const [updateTokenId, setUpdateTokenId] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [status, setStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(web3Provider);
          const signer = await web3Provider.getSigner();
          const nftContract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );
          setContract(nftContract);

          const [account] = await web3Provider.send('eth_requestAccounts', []);
          setAccount(account);
        } catch (error) {
          console.error('Failed to initialize:', error);
          setStatus({
            type: 'error',
            message:
              'Failed to initialize. Please check your connection and try again.',
          });
        }
      } else {
        setStatus({
          type: 'error',
          message: 'No Ethereum wallet detected. Please install MetaMask.',
        });
      }
    };

    init();
  }, []);

  const handleMint = async () => {
    if (!contract) return;
    setIsLoading(true);
    try {
      const signer = await provider?.getSigner();
      const connectedContract = contract.connect(signer);
      const tx = await connectedContract.mintNFT(
        tokenURI,
        ethers.parseEther(mintPrice)
      );
      await tx.wait();
      setStatus({
        type: 'success',
        message: `Successfully minted NFT with URI: ${tokenURI} and price: ${mintPrice} tokens`,
      });
    } catch (error) {
      console.error('Minting error:', error);
      setStatus({
        type: 'error',
        message: `Failed to mint NFT: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      });
    }
    setIsLoading(false);
  };

  const handleBuy = async () => {
    if (!contract) return;
    setIsLoading(true);
    try {
      const signer = await provider?.getSigner();
      const connectedContract = contract.connect(signer);
      const tx = await connectedContract.buyNFT(buyTokenId);
      await tx.wait();
      setStatus({
        type: 'success',
        message: `Successfully bought NFT with ID: ${buyTokenId}`,
      });
    } catch (error) {
      console.error('Buying error:', error);
      setStatus({
        type: 'error',
        message: `Failed to buy NFT: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      });
    }
    setIsLoading(false);
  };

  const handleUpdatePrice = async () => {
    if (!contract) return;
    setIsLoading(true);
    try {
      const signer = await provider?.getSigner();
      const connectedContract = contract.connect(signer);
      const tx = await connectedContract.updateNFTPrice(
        updateTokenId,
        ethers.parseEther(newPrice)
      );
      await tx.wait();
      setStatus({
        type: 'success',
        message: `Successfully updated price for NFT ID: ${updateTokenId} to ${newPrice} tokens`,
      });
    } catch (error) {
      console.error('Update price error:', error);
      setStatus({
        type: 'error',
        message: `Failed to update NFT price: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      });
    }
    setIsLoading(false);
  };

  if (!provider) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Web3 Not Detected</CardTitle>
            <CardDescription>
              Please install MetaMask or another Web3 provider to use this
              application.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>NFT Marketplace</CardTitle>
          <CardDescription>Mint, buy, and update NFT prices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mint-uri">Mint NFT</Label>
              <Input
                id="mint-uri"
                value={tokenURI}
                onChange={(e) => setTokenURI(e.target.value)}
                placeholder="Token URI"
              />
              <div className="flex space-x-2">
                <Input
                  value={mintPrice}
                  onChange={(e) => setMintPrice(e.target.value)}
                  placeholder="Price in Tokens"
                />
                <Button onClick={handleMint} disabled={isLoading}>
                  Mint
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buy-id">Buy NFT</Label>
              <div className="flex space-x-2">
                <Input
                  id="buy-id"
                  value={buyTokenId}
                  onChange={(e) => setBuyTokenId(e.target.value)}
                  placeholder="Token ID"
                />
                <Button onClick={handleBuy} disabled={isLoading}>
                  Buy
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-id">Update NFT Price</Label>
              <Input
                id="update-id"
                value={updateTokenId}
                onChange={(e) => setUpdateTokenId(e.target.value)}
                placeholder="Token ID"
              />
              <div className="flex space-x-2">
                <Input
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="New Price in Tokens"
                />
                <Button onClick={handleUpdatePrice} disabled={isLoading}>
                  Update
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {status && (
            <Alert
              variant={status.type === 'error' ? 'destructive' : 'default'}
            >
              {status.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <AlertTitle>
                {status.type === 'error' ? 'Error' : 'Success'}
              </AlertTitle>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
