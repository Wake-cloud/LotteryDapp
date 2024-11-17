require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

// Replace these values with your own
const { POLYGON_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

module.exports = {
  solidity: "0.8.18",  // Adjust according to your contract's version
  networks: {
    mumbai: {
      url: POLYGON_RPC_URL,  // RPC URL for the Mumbai testnet
      accounts: [`0x${PRIVATE_KEY}`],  // Your wallet private key
    },
    polygon: {
      url: POLYGON_RPC_URL,  // RPC URL for the Polygon mainnet
      accounts: [`0x${PRIVATE_KEY}`],  // Your wallet private key
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,  // Optional: for contract verification on PolygonScan
  },
};
