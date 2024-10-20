import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { vars } from "hardhat/config";

const ALCHEMY_API_KEY = vars.get("ALCHEMY_API_KEY");

const BASE_SEPOLIA_PRIVATE_KEY = vars.get("BASE_SEPOLIA_PRIVATE_KEY");


const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    base_sepolia: {
      url: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [BASE_SEPOLIA_PRIVATE_KEY]
    }
  }
};

export default config;
