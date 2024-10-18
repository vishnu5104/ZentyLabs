'use client';

import { useState, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const factoryABI = [
  'function createToken(string name, string symbol, uint256 initialSupply) returns (address)',
  'event TokenCreated(address tokenAddress, string name, string symbol, uint256 initialSupply)',
];

const factoryAddress = '0x1234567890123456789012345678901234567890';

export default function TokenFactoryUI() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [factory, setFactory] = useState(null);
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [initialSupply, setInitialSupply] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [createdTokens, setCreatedTokens] = useState([]);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const factory = new ethers.Contract(
            factoryAddress,
            factoryABI,
            signer
          );

          setProvider(provider);
          setSigner(signer);
          setFactory(factory);

          factory.on(
            'TokenCreated',
            (tokenAddress, name, symbol, initialSupply, event) => {
              setCreatedTokens((prev) => [
                ...prev,
                {
                  address: tokenAddress,
                  name,
                  symbol,
                  initialSupply: initialSupply.toString(),
                },
              ]);
            }
          );
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

    return () => {
      if (factory) {
        factory.removeAllListeners('TokenCreated');
      }
    };
  }, []);

  const handleCreateToken = async (e) => {
    e.preventDefault();
    if (!factory) return;
    try {
      const tx = await factory.createToken(
        tokenName,
        tokenSymbol,
        ethers.utils.parseEther(initialSupply)
      );
      setStatus({
        type: 'info',
        message: 'Transaction submitted. Waiting for confirmation...',
      });
      await tx.wait();
      setStatus({ type: 'success', message: 'Token created successfully!' });
      setTokenName('');
      setTokenSymbol('');
      setInitialSupply('');
    } catch (error) {
      console.error('Token creation failed: ', error);
      setStatus({ type: 'error', message: 'Token creation failed' });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Token Factory</h1>

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
            {status.type === 'error'
              ? 'Error'
              : status.type === 'info'
              ? 'Info'
              : 'Success'}
          </AlertTitle>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Create New Token</CardTitle>
          <CardDescription>Deploy your own ERC20 token</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateToken} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tokenName">Token Name</Label>
              <Input
                id="tokenName"
                placeholder="My Awesome Token"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tokenSymbol">Token Symbol</Label>
              <Input
                id="tokenSymbol"
                placeholder="MAT"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initialSupply">Initial Supply</Label>
              <Input
                id="initialSupply"
                type="number"
                step="0.000000000000000001"
                min="0"
                placeholder="1000000"
                value={initialSupply}
                onChange={(e) => setInitialSupply(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Create Token</Button>
          </form>
        </CardContent>
      </Card>

      {createdTokens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Created Tokens</CardTitle>
            <CardDescription>List of tokens you've created</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {createdTokens.map((token, index) => (
                <li key={index} className="border p-2 rounded">
                  <p>
                    <strong>Name:</strong> {token.name}
                  </p>
                  <p>
                    <strong>Symbol:</strong> {token.symbol}
                  </p>
                  <p>
                    <strong>Initial Supply:</strong>{' '}
                    {ethers.utils.formatEther(token.initialSupply)}
                  </p>
                  <p>
                    <strong>Address:</strong> {token.address}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
