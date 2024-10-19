'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useRouter } from 'next/navigation';

const contractABI = [
  {
    inputs: [
      {
        internalType: 'contract IERC20',
        name: '_paymentToken',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'getAllMintedNFTs',
    outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllTokenURIs',
    outputs: [{ internalType: 'string[]', name: '', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalMintedNFTs',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'buyNFT',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'nftPrices',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paymentToken',
    outputs: [{ internalType: 'contract IERC20', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
];

const contractAddress = '0x28045BAF8af06cdc5cd0caBe15BE4520012D8198';
const paymentTokenABI = [
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function allowance(address owner, address spender) public view returns (uint256)',
];

export default function NFTMarketplace() {
  const [nfts, setNfts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [contract, setContract] = useState(null);
  const [paymentToken, setPaymentToken] = useState(null);
  const router = useRouter();

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

          // Fetch payment token address
          const paymentTokenAddress = await nftContract.paymentToken();
          const paymentTokenContract = new ethers.Contract(
            paymentTokenAddress,
            paymentTokenABI,
            signer
          );
          setPaymentToken(paymentTokenContract);

          fetchNFTs(nftContract);
        } catch (error) {
          console.error('Failed to initialize contract:', error);
        }
      } else {
        console.log('Please install MetaMask!');
      }
    };

    initializeContract();
  }, []);

  const handleCardClick = (nft) => {
    router.push(`/nft/${nft.id}?${new URLSearchParams(nft).toString()}`);
  };

  const fetchNFTs = async (nftContract) => {
    try {
      const tokenURIsResponse = await nftContract.getAllTokenURIs();
      console.log('the uris', tokenURIsResponse);
      const tokenURIs = tokenURIsResponse[0].split(',');
      const tokenIds = await nftContract.getAllMintedNFTs();

      const nftData = await Promise.all(
        tokenIds.map(async (tokenId, index) => {
          const uri = tokenURIs[index];
          const response = await fetch(uri);
          const metadata = await response.json();
          const price = await nftContract.nftPrices(tokenId);
          return {
            id: tokenId.toString(),
            title: metadata.name,
            description: metadata.description,
            image: metadata.image,
            price: ethers.formatEther(price),
            creator: metadata.creator || 'Unknown',
            attributes: metadata.attributes || [],
          };
        })
      );
      setNfts(nftData);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  };

  const buyNFT = async (tokenId) => {
    if (!contract || !paymentToken) return;
    try {
      const price = await contract.nftPrices(tokenId);
      const signer = await contract.runner.provider.getSigner();
      const signerAddress = await signer.getAddress();
      const allowance = await paymentToken.allowance(
        signerAddress,
        contractAddress
      );

      if (allowance < price) {
        const approveTx = await paymentToken.approve(contractAddress, price);
        await approveTx.wait();
      }

      const transaction = await contract.buyNFT(tokenId);
      await transaction.wait();
      console.log('NFT purchased successfully!');
      fetchNFTs(contract);
    } catch (error) {
      console.error('Error buying NFT:', error);
    }
  };

  const filteredNFTs = nfts
    .filter(
      (nft) =>
        nft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.creator.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortBy === 'price'
        ? parseFloat(a.price) - parseFloat(b.price)
        : a.title.localeCompare(b.title)
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">NFT Marketplace</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search NFTs or creators"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2" size={20} />
                Sort by: {sortBy === 'price' ? 'Price' : 'Name'}
                <ChevronDown className="ml-2" size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setSortBy('price')}>
                Price
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSortBy('name')}>
                Name
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredNFTs.map((nft) => (
          <div
            key={nft.id}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
            onClick={() => handleCardClick(nft)}
          >
            <img
              src={nft.image}
              alt={nft.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{nft.title}</h2>
              <p className="text-gray-600 mb-2">Created by {nft.creator}</p>
              <p className="text-sm text-gray-500 mb-2">{nft.description}</p>
              <div className="mb-2">
                {nft.attributes.map((attr, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                  >
                    {attr.trait_type}: {attr.value}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">{nft.price} Tokens</span>
                <Button onClick={() => buyNFT(nft.id)}>Buy Now</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
