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

// ABI of the MyFungibleToken contract
const contractABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function mint(address to, uint256 amount)',
  'function burn(uint256 amount)',
  'function owner() view returns (address)',
];

const contractAddress = '0x1234567890123456789012345678901234567890';

export default function MyFungibleTokenUI() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isOwner, setIsOwner] = useState(false);
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [mintTo, setMintTo] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );

          setProvider(provider);
          setSigner(signer);
          setContract(contract);

          const address = await signer.getAddress();
          const balance = await contract.balanceOf(address);
          setBalance(ethers.utils.formatEther(balance));

          const owner = await contract.owner();
          setIsOwner(owner.toLowerCase() === address.toLowerCase());
        } catch (error) {
          console.error('An error occurred: ', error);
          setStatus({
            type: 'error',
            message: 'Failed to connect to Ethereum network',
          });
        }
      } else {
        setStatus({ type: 'error', message: 'Please install MetaMask!' });
      }
    };

    init();
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!contract) return;
    try {
      const tx = await contract.transfer(
        transferTo,
        ethers.utils.parseEther(transferAmount)
      );
      await tx.wait();
      setStatus({ type: 'success', message: 'Transfer successful!' });
      const address = await signer.getAddress();
      const newBalance = await contract.balanceOf(address);
      setBalance(ethers.utils.formatEther(newBalance));
    } catch (error) {
      console.error('Transfer failed: ', error);
      setStatus({ type: 'error', message: 'Transfer failed' });
    }
  };

  const handleMint = async (e) => {
    e.preventDefault();
    if (!contract || !isOwner) return;
    try {
      const tx = await contract.mint(
        mintTo,
        ethers.utils.parseEther(mintAmount)
      );
      await tx.wait();
      setStatus({ type: 'success', message: 'Minting successful!' });
    } catch (error) {
      console.error('Minting failed: ', error);
      setStatus({ type: 'error', message: 'Minting failed' });
    }
  };

  const handleBurn = async (e) => {
    e.preventDefault();
    if (!contract || !isOwner) return;
    try {
      const tx = await contract.burn(ethers.utils.parseEther(burnAmount));
      await tx.wait();
      setStatus({ type: 'success', message: 'Burning successful!' });
      const address = await signer.getAddress();
      const newBalance = await contract.balanceOf(address);
      setBalance(ethers.utils.formatEther(newBalance));
    } catch (error) {
      console.error('Burning failed: ', error);
      setStatus({ type: 'error', message: 'Burning failed' });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">MyFungibleToken Interface</h1>

      {status.message && (
        <Alert
          variant={status.type === 'error' ? 'destructive' : 'default'}
          className="mb-4"
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

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Your Balance</CardTitle>
          <CardDescription>Your current token balance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{balance} MTK</p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Transfer Tokens</CardTitle>
          <CardDescription>Send tokens to another address</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transferTo">Recipient Address</Label>
              <Input
                id="transferTo"
                placeholder="0x..."
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transferAmount">Amount</Label>
              <Input
                id="transferAmount"
                type="number"
                step="0.000000000000000001"
                min="0"
                placeholder="0.0"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Transfer</Button>
          </form>
        </CardContent>
      </Card>

      {isOwner && (
        <>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Mint Tokens</CardTitle>
              <CardDescription>Create new tokens (Owner only)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMint} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mintTo">Recipient Address</Label>
                  <Input
                    id="mintTo"
                    placeholder="0x..."
                    value={mintTo}
                    onChange={(e) => setMintTo(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mintAmount">Amount</Label>
                  <Input
                    id="mintAmount"
                    type="number"
                    step="0.000000000000000001"
                    min="0"
                    placeholder="0.0"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit">Mint</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Burn Tokens</CardTitle>
              <CardDescription>Destroy tokens (Owner only)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBurn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="burnAmount">Amount</Label>
                  <Input
                    id="burnAmount"
                    type="number"
                    step="0.000000000000000001"
                    min="0"
                    placeholder="0.0"
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit">Burn</Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
