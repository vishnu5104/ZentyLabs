import CreatePage from '@/components/Home';
import SmartContractUI from '@/components/MintNFt';
import NFTMarketplaceUI from '@/components/NFT';

export default function Home() {
  return (
    <div>
      ZentyLabs
      <CreatePage />
      {/* <SmartContractUI /> */}
      <NFTMarketplaceUI />
    </div>
  );
}
