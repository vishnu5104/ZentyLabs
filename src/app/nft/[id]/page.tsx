'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function NFTDetailsPage({ params }) {
  const searchParams = useSearchParams();
  const nft = Object.fromEntries(searchParams.entries());

  console.log('the nft', nft);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{nft.title}</h1>
      <img src={nft.image} alt={nft.title} className="w-full max-w-2xl mb-4" />
      <p className="text-xl mb-2">Created by: {nft.creator}</p>
      <p className="text-lg mb-4">{nft.description}</p>
      <p className="text-2xl font-bold mb-4">Price: {nft.price} Tokens</p>
      <h2 className="text-2xl font-semibold mb-2">Attributes:</h2>
      <Button>Buy Now</Button>
    </div>
  );
}
