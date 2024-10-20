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

const contractAddress = '0x2688385CfE28ae2693c8232B0ba1E5246A332A00';

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

export default function NFTMarketplace() {
  const [nfts, setNfts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price');
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const router = useRouter();
  console.log('wooo');
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

  const fetchNFTs = async (nftContract) => {
    try {
      const tokenIds = await nftContract.getAllMintedNFTs();

      console.log('the token', tokenIds);
      const nftData = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const tokenURI = await nftContract.tokenURI(tokenId);
          const price = await nftContract.nftPrices(tokenId);
          const isowner = await nftContract.isowner(
            '0x0C467c60e97221de6cD9C93C3AF1861f7aE2995C',
            tokenId
          );

          console.log('is owner?', isowner);
          const metadata = await fetch(tokenURI).then((res) => res.json());
          // const owner = await nftContract.ownerOf(tokenId);
          return {
            id: tokenId.toString(),
            title: metadata.name,
            description: metadata.description,
            image: metadata.image,
            price: ethers.formatEther(price),
            creator: '0xujnf',
            attributes: metadata.attributes || [],
          };
        })
      );
      setNfts(nftData);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  };

  const handleCardClick = (nft) => {
    router.push(`/nft/${nft.id}?${new URLSearchParams(nft).toString()}`);
  };

  const buyNFT = async (tokenId) => {
    if (!contract) return;
    try {
      const price = await contract.nftPrices(tokenId);
      const transaction = await contract.buyNFT(tokenId, { value: price });
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
                <span className="text-lg font-bold">{nft.price} ETH</span>
                {nft.creator.toLowerCase() !== account?.toLowerCase() && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      buyNFT(nft.id);
                    }}
                  >
                    Buy Now
                  </Button>
                )}
                {nft.creator.toLowerCase() === account?.toLowerCase() && (
                  <span className="text-sm text-gray-500">
                    You own this NFT
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
