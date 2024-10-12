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
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function mint(address to, uint256 amount)',
  'function burn(uint256 amount)',
  'function transfer(address to, uint256 amount)',
];

const contractAddress = '0x9C49B69D6D232d5E06fE3Ffbfa11610325D5b9Ad';

export default function SmartContractUI() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState({
    name: '',
    symbol: '',
    totalSupply: '',
  });
  const [balance, setBalance] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [mintTo, setMintTo] = useState('');
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
          const tokenContract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );
          setContract(tokenContract);

          const [account] = await web3Provider.send('eth_requestAccounts', []);
          setAccount(account);

          const name = await tokenContract.name();
          const symbol = await tokenContract.symbol();
          const totalSupply = ethers.formatEther(
            await tokenContract.totalSupply()
          );
          setTokenInfo({ name, symbol, totalSupply });

          const balance = ethers.formatEther(
            await tokenContract.balanceOf(account)
          );
          setBalance(balance);
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
    if (!contract || !mintTo) {
      setStatus({
        type: 'error',
        message: 'Please provide a recipient address for minting.',
      });
      return;
    }
    setIsLoading(true);
    try {
      if (!ethers.isAddress(mintTo)) {
        throw new Error('Invalid recipient address');
      }
      const signer = await provider?.getSigner();
      const connectedContract = contract.connect(signer);
      const tx = await connectedContract.mint(
        mintTo,
        ethers.parseEther(mintAmount)
      );
      await tx.wait();
      setStatus({
        type: 'success',
        message: `Successfully minted ${mintAmount} tokens to ${mintTo}`,
      });
      if (mintTo.toLowerCase() === account?.toLowerCase()) {
        const newBalance = ethers.formatEther(
          await contract.balanceOf(account)
        );
        setBalance(newBalance);
      }
    } catch (error) {
      console.error('Minting error:', error);
      setStatus({
        type: 'error',
        message: `Failed to mint tokens: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      });
    }
    setIsLoading(false);
  };

  const handleBurn = async () => {
    if (!contract) return;
    setIsLoading(true);
    try {
      const signer = await provider?.getSigner();
      const connectedContract = contract.connect(signer);
      const tx = await connectedContract.burn(ethers.parseEther(burnAmount));
      await tx.wait();
      setStatus({
        type: 'success',
        message: `Successfully burned ${burnAmount} tokens`,
      });
      const newBalance = ethers.formatEther(await contract.balanceOf(account));
      setBalance(newBalance);
    } catch (error) {
      console.error('Burning error:', error);
      setStatus({
        type: 'error',
        message: `Failed to burn tokens: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      });
    }
    setIsLoading(false);
  };

  const handleTransfer = async () => {
    if (!contract) return;
    setIsLoading(true);
    try {
      if (!ethers.isAddress(transferTo)) {
        throw new Error('Invalid recipient address');
      }
      const signer = await provider?.getSigner();
      const connectedContract = contract.connect(signer);
      const tx = await connectedContract.transfer(
        transferTo,
        ethers.parseEther(transferAmount)
      );
      await tx.wait();
      setStatus({
        type: 'success',
        message: `Successfully transferred ${transferAmount} tokens to ${transferTo}`,
      });
      const newBalance = ethers.formatEther(await contract.balanceOf(account));
      setBalance(newBalance);
    } catch (error) {
      console.error('Transfer error:', error);
      setStatus({
        type: 'error',
        message: `Failed to transfer tokens: ${
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
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>
            {tokenInfo.name} ({tokenInfo.symbol})
          </CardTitle>
          <CardDescription>
            Total Supply: {tokenInfo.totalSupply}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Your Balance</Label>
              <p className="text-2xl font-bold">
                {balance} {tokenInfo.symbol}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mint-to">Mint Tokens</Label>
              <Input
                id="mint-to"
                value={mintTo}
                onChange={(e) => setMintTo(e.target.value)}
                placeholder="Recipient Address"
              />
              <div className="flex space-x-2">
                <Input
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  placeholder="Amount"
                />
                <Button onClick={handleMint} disabled={isLoading}>
                  Mint
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="burn">Burn Tokens</Label>
              <div className="flex space-x-2">
                <Input
                  id="burn"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                  placeholder="Amount"
                />
                <Button onClick={handleBurn} disabled={isLoading}>
                  Burn
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transfer-to">Transfer Tokens</Label>
              <Input
                id="transfer-to"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                placeholder="Recipient Address"
              />
              <div className="flex space-x-2">
                <Input
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Amount"
                />
                <Button onClick={handleTransfer} disabled={isLoading}>
                  Transfer
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
