'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, ImageIcon, Check, Sparkles, Palette } from 'lucide-react';

//contract imp

import { ethers } from 'ethers';

import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Collection {
  id: string;
  name: string;
}

interface Design {
  id: string;
  name: string;
  preview: string;
}

const designs: Design[] = [
  { id: '1', name: 'Cosmic', preview: '/placeholder.svg?height=100&width=100' },
  { id: '2', name: 'Neon', preview: '/placeholder.svg?height=100&width=100' },
  {
    id: '3',
    name: 'Minimalist',
    preview: '/placeholder.svg?height=100&width=100',
  },
  { id: '4', name: 'Retro', preview: '/placeholder.svg?height=100&width=100' },
];

const contractABI = [
  'function mintNFT(string memory tokenURI, uint256 priceInTokens) external',
  'function buyNFT(uint256 tokenId) external',
  'function updateNFTPrice(uint256 tokenId, uint256 newPriceInTokens) external',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function nftPrices(uint256 tokenId) view returns (uint256)',
  'function currentTokenId() view returns (uint256)',
];

const contractAddress = '0x28045BAF8af06cdc5cd0caBe15BE4520012D8198';

export default function CreatePage() {
  const [activeTab, setActiveTab] = useState('collection');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
  });
  const [newNFT, setNewNFT] = useState({
    name: '',
    description: '',
    price: '',
    collectionId: '',
    designId: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //contract  specific

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
  // const [isLoading, setIsLoading] = useState(false);

  // ipfs upload uri

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [colkey, setcolkey] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [url, setUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingMetadata, setUploadingMetadata] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);

        const storedAccount = localStorage.getItem('account');
        if (storedAccount) {
          // Auto-connect wallet if account is saved in localStorage
          await connectWallet();
        }
      }
    };

    init();
    // fetchCollections();
  }, []);

  // useEffect(() => {
  //   fetchCollections();
  // }, []);

  //contract implementation
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setStatus({
        type: 'error',
        message: 'No Ethereum wallet detected. Please install MetaMask.',
      });
      return;
    }

    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const [connectedAccount] = await web3Provider.send(
        'eth_requestAccounts',
        []
      );
      setProvider(web3Provider);
      setAccount(connectedAccount);
      localStorage.setItem('account', connectedAccount); // Save account to localStorage

      const signer = await web3Provider.getSigner();
      const nftContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      setContract(nftContract);

      setStatus({
        type: 'success',
        message: 'Wallet connected successfully!',
      });
    } catch (error) {
      console.error('Wallet connection error:', error);
      setStatus({
        type: 'error',
        message: 'Failed to connect wallet. Please try again.',
      });
    }
  };

  // ipfs upload

  const uploadImage = async () => {
    try {
      if (!image) {
        alert('Please select an image');
        return;
      }

      setUploadingImage(true);

      const formData = new FormData();
      formData.append('file', image);

      const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

      const imageUploadRequest = await fetch(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
          },
          body: formData,
        }
      );

      const imageUploadResponse = await imageUploadRequest.json();

      if (!imageUploadRequest.ok) {
        throw new Error('Failed to upload image to IPFS');
      }

      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${imageUploadResponse.IpfsHash}`;
      setImageUrl(ipfsUrl);

      console.log('he ip', ipfsUrl);
    } catch (e) {
      console.error(e);
      alert(
        'Error uploading image: ' + (e instanceof Error ? e.message : String(e))
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadMetadata = async () => {
    try {
      if (!newNFT.name || !newNFT.description || !imageUrl) {
        alert('Please provide name, description, and upload an image');
        return;
      }

      setUploadingMetadata(true);

      const metadata = {
        owner: 'oxgfuyhkbngjkbngfmgflh',
        name: newNFT.name,
        description: newNFT.description,
        image: imageUrl,
        price: newNFT.price,
      };

      const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

      const metadataUploadRequest = await fetch(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metadata),
        }
      );

      const metadataUploadResponse = await metadataUploadRequest.json();

      if (!metadataUploadRequest.ok) {
        throw new Error('Failed to upload metadata to IPFS');
      }
      const metadataurl = `https://gateway.pinata.cloud/ipfs/${metadataUploadResponse.IpfsHash}`;
      console.log(metadataurl);
      setTokenURI(metadataurl);
      setUrl(metadataurl);
    } catch (e) {
      console.error(e);
      alert(
        'Error uploading metadata: ' +
          (e instanceof Error ? e.message : String(e))
      );
    } finally {
      setUploadingMetadata(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImage(e.target?.files?.[0] || null);
  };

  const handleMint = async () => {
    if (!contract) return;
    setIsLoading(true);
    try {
      const signer = await provider?.getSigner();
      const connectedContract = contract.connect(signer);
      const tx = await connectedContract.mintNFT(
        tokenURI,
        ethers.parseEther(newNFT.price)
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

  // const fetchCollections = async () => {
  //   try {
  //     const response = await fetch('/api/collections');
  //     if (!response.ok) throw new Error('Failed to fetch collections');
  //     const data = await response.json();
  //     setCollections(data);
  //   } catch (err) {
  //     setError('Failed to load collections. Please try again.');
  //   }
  // };

  // const createCollection = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   setError(null);
  //   try {
  //     const response = await fetch('/api/collections', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(newCollection),
  //     });
  //     if (!response.ok) throw new Error('Failed to create collection');
  //     const data = await response.json();
  //     setCollections([...collections, data]);
  //     setNewCollection({ name: '', description: '' });
  //     setShowSuccess(true);
  //     setTimeout(() => {
  //       setShowSuccess(false);
  //       setActiveTab('nft'); // Automatically move to the 'Create NFT' tab
  //     }, 2000);
  //   } catch (err) {
  //     setError('Failed to create collection. Please try again.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const createNFT = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   setError(null);
  //   try {
  //     const response = await fetch('/api/nfts', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(newNFT),
  //     });
  //     if (!response.ok) throw new Error('Failed to create NFT');
  //     await response.json();
  //     setNewNFT({
  //       name: '',
  //       description: '',
  //       price: '',
  //       collectionId: '',
  //       designId: '',
  //     });
  //     setShowSuccess(true);
  //     setTimeout(() => {
  //       setShowSuccess(false);
  //       setActiveTab('preview'); // Automatically move to the 'Preview NFT' tab
  //     }, 2000);
  //   } catch (err) {
  //     setError('Failed to create NFT. Please try again.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              You need to connect your Ethereum wallet to use this application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={connectWallet} disabled={isLoading}>
              Connect Wallet
            </Button>
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8">
      <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">
          Create Your NFT
        </h1>
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger
              value="collection"
              className={
                'text-black data-[state=active]:bg-blue-800 data-[state=active]:text-white'
              }
            >
              Create Collection
            </TabsTrigger>
            <TabsTrigger
              value="nft"
              className={
                'text-black data-[state=active]:bg-blue-800 data-[state=active]:text-white'
              }
            >
              Create NFT
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className={
                'text-black data-[state=active]:bg-blue-800 data-[state=active]:text-white'
              }
            >
              Preview NFT
            </TabsTrigger>
          </TabsList>
          <TabsContent value="collection">
            <Card className="bg-white/5 border-0">
              <CardHeader>
                <CardTitle className="text-white">Collection Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="collection-name" className="text-white">
                    Collection Name
                  </Label>
                  <Input
                    id="collection-name"
                    value={newCollection.name}
                    onChange={(e) =>
                      setNewCollection({
                        ...newCollection,
                        name: e.target.value,
                      })
                    }
                    required
                    className="bg-white/10 text-white placeholder-white/50 border-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="collection-description"
                    className="text-white"
                  >
                    Description
                  </Label>
                  <Input
                    id="collection-description"
                    value={newCollection.description}
                    onChange={(e) =>
                      setNewCollection({
                        ...newCollection,
                        description: e.target.value,
                      })
                    }
                    required
                    className="bg-white/10 text-white placeholder-white/50 border-white/20"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Creating...'
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" /> Create Collection
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="nft">
            <Card className="bg-white/5 border-0">
              <CardHeader>
                <CardTitle className="text-white">NFT Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="nft-name" className="text-white">
                    NFT Name
                  </Label>
                  <Input
                    id="nft-name"
                    value={newNFT.name}
                    onChange={(e) =>
                      setNewNFT({ ...newNFT, name: e.target.value })
                    }
                    required
                    className="bg-white/10 text-white placeholder-white/50 border-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nft-description" className="text-white">
                    Description
                  </Label>
                  <Input
                    id="nft-description"
                    value={newNFT.description}
                    onChange={(e) =>
                      setNewNFT({ ...newNFT, description: e.target.value })
                    }
                    required
                    className="bg-white/10 text-white placeholder-white/50 border-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nft-price" className="text-white">
                    Price (ETH)
                  </Label>
                  <Input
                    id="nft-price"
                    type="number"
                    step="0.01"
                    value={newNFT.price}
                    onChange={(e) => {
                      setNewNFT({ ...newNFT, price: e.target.value });
                    }}
                    required
                    className="bg-white/10 text-white placeholder-white/50 border-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nft-collection" className="text-white">
                    Collection
                  </Label>
                  {/* <select
                      id="nft-collection"
                      className="w-full bg-white/10 text-white border-white/20 rounded-md p-2"
                      value={newNFT.collectionId}
                      onChange={(e) => setcolkey(e.target.value)}
                      required
                    >
                      <option value="">Select a collection</option>
                      {collections.map((collection) => (
                        <option key={collection.id} value={collection.id}>
                          {collection.name}
                        </option>
                      ))}
                    </select> */}
                  <input
                    type="text"
                    placeholder="Collection Key"
                    value={colkey}
                    onChange={(e) => setcolkey(e.target.value)}
                    className="mb-4 p-2 border rounded"
                  />
                </div>
                {/* <div className="space-y-2">
                    <Label htmlFor="nft-design" className="text-white">
                      Design
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      {designs.map((design) => (
                        <Button
                          key={design.id}
                          type="button"
                          onClick={() =>
                            setNewNFT({ ...newNFT, designId: design.id })
                          }
                          className={`h-auto p-4 bg-white/10 hover:bg-white/20 ${
                            newNFT.designId === design.id
                              ? 'ring-2 ring-white'
                              : ''
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <img
                              src={design.preview}
                              alt={design.name}
                              className="w-20 h-20 object-cover rounded-md mb-2"
                            />
                            <span className="text-white">{design.name}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div> */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mb-4"
                />
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                  disabled={isLoading}
                  onClick={uploadImage}
                >
                  {isLoading ? (
                    'Creating...'
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" /> Create NFT
                    </>
                  )}
                </Button>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                  disabled={isLoading}
                  onClick={uploadMetadata}
                >
                  {isLoading ? (
                    'Creating...'
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" /> Create Metadata
                    </>
                  )}
                </Button>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                  disabled={isLoading}
                  onClick={handleMint}
                >
                  {isLoading ? (
                    'Creating...'
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" /> Mint NFT
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="preview">
            <Card className="bg-white/5 border-0">
              <CardHeader>
                <CardTitle className="text-white">NFT Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white/10 p-6 rounded-lg">
                  <div className="aspect-square w-full max-w-sm mx-auto mb-4 overflow-hidden rounded-lg">
                    {newNFT.designId ? (
                      <img
                        src={
                          designs.find((d) => d.id === newNFT.designId)
                            ?.preview || '/placeholder.svg?height=400&width=400'
                        }
                        alt="NFT Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                        No design selected
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {newNFT.name || 'Untitled NFT'}
                  </h3>
                  <p className="text-white/80 mb-4">
                    {newNFT.description || 'No description provided'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">
                      {newNFT.price ? `${newNFT.price} ETH` : 'Price not set'}
                    </span>
                    <span className="text-white/80">
                      {collections.find((c) => c.id === newNFT.collectionId)
                        ?.name || 'No collection selected'}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => handleTabChange('nft')}
                  className="w-full mt-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
                >
                  <Palette className="mr-2 h-4  w-4" /> Edit NFT
                </Button>

                <Button
                  onClick={() => {}}
                  className="w-full mt-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
                >
                  <Palette className="mr-2 h-4  w-4" /> View In Marketplace
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-md flex items-center"
          >
            <Check className="mr-2 h-5 w-5" />
            {activeTab === 'collection'
              ? 'Collection created successfully!'
              : 'NFT created successfully!'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
