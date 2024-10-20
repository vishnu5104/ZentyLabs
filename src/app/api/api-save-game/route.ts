import { NextResponse } from 'next/server';
import { promises as fs } from 'fs'; // Use promises API for async file operations
import path from 'path'; // To handle file paths

export async function POST(request: Request) {
  try {
    // Paths
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
    const body = await request.json();
    const { title, buttons, wallet } = body;

    console.log('Received main menu data:', { title, buttons, wallet });
    const gamebuilderDir = path.join(process.cwd(), 'src', 'app', 'gamebuilder'); // gamebuilder directory
    const scenesDir = path.join(gamebuilderDir, 'scenes'); // scenes folder inside gamebuilder
    const copiesDir = path.join(gamebuilderDir, 'gamebuildercopy'); // new directory for copied files
    const copiedScenesDir = path.join(copiesDir, 'scenes'); // new scenes folder inside gamebuildercopy

    // Ensure the target directories exist
    await fs.mkdir(copiesDir, { recursive: true });
    await fs.mkdir(copiedScenesDir, { recursive: true });

    // 1. Copy files from the `scenes` directory to the new `scenes` folder inside `gamebuildercopy`
    const sceneFiles = await fs.readdir(scenesDir);
    for (const file of sceneFiles) {
      const originalFilePath = path.join(scenesDir, file);
      let fileContents = await fs.readFile(originalFilePath, 'utf8'); // Read the contents of the original file

      // If the file is 'Mainmenu.ts', modify the playButton event handler
      if (file === 'Mainmenu.ts') {
        // Modify the file contents to include contract interaction
        fileContents = `
          import { ethers } from 'ethers';

          const contractAddress = '${contractAddress}';
          const contractABI = ${JSON.stringify(contractABI)};

          // ... (rest of the existing file content)

          ${fileContents.replace(
            /this\.playButton\.on\("pointerdown", \(\) => {[^}]*}\);/g,
            `
            this.playButton.on("pointerdown", async () => {
              if (wallet) {
                try {
                  const provider = new ethers.providers.Web3Provider(window.ethereum);
                  const signer = provider.getSigner();
                  const contract = new ethers.Contract(contractAddress, contractABI, signer);
                  
                  // Get the user's owned NFTs
                  const ownedNFTs = await contract.getUserOwnedNFTs(wallet);
                  
                  if (ownedNFTs.length > 0) {
                    // Check if the user is the owner of the first NFT they own
                    const isOwner = await contract.isowner(wallet, ownedNFTs[0]);
                    if (isOwner) {
                      this.scene.start("PlayScene");
                    } else {
                      console.log('Not the owner of the NFT');
                    }
                  } else {
                    console.log('No owned NFTs');
                  }
                } catch (error) {
                  console.error('Error checking NFT ownership:', error);
                }
              } else {
                console.log('Wallet not connected');
              }
            });
            `
          )}
        `;

        fileContents += '\nconsole.log("Mainmenu.ts modified with NFT ownership check");';
      }

      // Create a new filename without altering the extension
      const newFileName = `${path.basename(file, path.extname(file))}${path.extname(file)}`;

      const newFilePath = path.join(copiedScenesDir, newFileName); // Path for the new file in copied scenes folder
      await fs.writeFile(newFilePath, fileContents, 'utf8'); // Write file contents
    }

    // 2. Copy files from the `gamebuilder` directory (excluding the `scenes` folder) to `gamebuildercopy`
    const gamebuilderFiles = await fs.readdir(gamebuilderDir);
    for (const file of gamebuilderFiles) {
      const originalFilePath = path.join(gamebuilderDir, file);

      // Skip the `scenes` folder
      if (file === 'scenes') continue;

      const stats = await fs.lstat(originalFilePath);
      if (stats.isFile()) {
        let fileContents = await fs.readFile(originalFilePath, 'utf8'); // Read the contents of the file

        // Create a new filename without altering the extension
        const newFileName = `${path.basename(file, path.extname(file))}${path.extname(file)}`;

        const newFilePath = path.join(copiesDir, newFileName); // Path for the new file in the main copies folder
        await fs.writeFile(newFilePath, fileContents, 'utf8'); // Write file contents
      }
    }

    return NextResponse.json({ message: 'Files copied successfully, with Mainmenu.ts modified' }, { status: 200 });
  } catch (error) {
    console.error('Error copying files:', error);
    return NextResponse.json({ message: 'Error copying files', error }, { status: 500 });
  }
}
