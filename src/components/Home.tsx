'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, ImageIcon, Check, Sparkles, Palette } from 'lucide-react';

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

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections');
      if (!response.ok) throw new Error('Failed to fetch collections');
      const data = await response.json();
      setCollections(data);
    } catch (err) {
      setError('Failed to load collections. Please try again.');
    }
  };

  const createCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCollection),
      });
      if (!response.ok) throw new Error('Failed to create collection');
      const data = await response.json();
      setCollections([...collections, data]);
      setNewCollection({ name: '', description: '' });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setActiveTab('nft'); // Automatically move to the 'Create NFT' tab
      }, 2000);
    } catch (err) {
      setError('Failed to create collection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const createNFT = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/nfts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNFT),
      });
      if (!response.ok) throw new Error('Failed to create NFT');
      await response.json();
      setNewNFT({
        name: '',
        description: '',
        price: '',
        collectionId: '',
        designId: '',
      });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setActiveTab('preview'); // Automatically move to the 'Preview NFT' tab
      }, 2000);
    } catch (err) {
      setError('Failed to create NFT. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

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
                <form onSubmit={createCollection} className="space-y-4">
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
                        <PlusCircle className="mr-2 h-4 w-4" /> Create
                        Collection
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="nft">
            <Card className="bg-white/5 border-0">
              <CardHeader>
                <CardTitle className="text-white">NFT Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createNFT} className="space-y-4">
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
                      onChange={(e) =>
                        setNewNFT({ ...newNFT, price: e.target.value })
                      }
                      required
                      className="bg-white/10 text-white placeholder-white/50 border-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nft-collection" className="text-white">
                      Collection
                    </Label>
                    <select
                      id="nft-collection"
                      className="w-full bg-white/10 text-white border-white/20 rounded-md p-2"
                      value={newNFT.collectionId}
                      onChange={(e) =>
                        setNewNFT({ ...newNFT, collectionId: e.target.value })
                      }
                      required
                    >
                      <option value="">Select a collection</option>
                      {collections.map((collection) => (
                        <option key={collection.id} value={collection.id}>
                          {collection.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
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
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      'Creating...'
                    ) : (
                      <>
                        <ImageIcon className="mr-2 h-4 w-4" /> Create NFT
                      </>
                    )}
                  </Button>
                </form>
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
