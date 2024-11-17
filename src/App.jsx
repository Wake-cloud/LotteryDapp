import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';

const contractAddress = '0xbFF52a1EAdc49c8fF5aEfF61C1E6e8cC1D3d15C6';  // Replace with your deployed contract address

// Contract ABI
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      }
    ],
    "name": "TicketPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "winner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountWon",
        "type": "uint256"
      }
    ],
    "name": "WinnerPicked",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "enterLottery",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPlayers",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalFunds",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTimeRemaining",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ticketPrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "manager",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [players, setPlayers] = useState([]);
  const [totalFunds, setTotalFunds] = useState(0);
  const [ticketPrice, setTicketPrice] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize provider and contract
  useEffect(() => {
    if (window.ethereum) {
      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(_provider);

      const _contract = new ethers.Contract(contractAddress, contractABI, _provider.getSigner());
      setContract(_contract);

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
  }, []);

  // Handle account change in MetaMask
  const handleAccountsChanged = (accounts) => {
    setUserAddress(accounts[0]);
  };

  // Handle network change in MetaMask
  const handleChainChanged = (chainId) => {
    window.location.reload();
  };

  // Connect to the wallet
  const connectWallet = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const _userAddress = await provider.getSigner().getAddress();
      setUserAddress(_userAddress);
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to connect wallet", error);
    }
  };

  // Fetch data from the contract
  useEffect(() => {
    if (contract && isConnected) {
      getPlayers();
      getTotalFunds();
      getTimeRemaining();
      getTicketPrice();
    }
  }, [contract, isConnected]);

  const getPlayers = async () => {
    try {
      const _players = await contract.getPlayers();
      setPlayers(_players);
    } catch (error) {
      console.error("Failed to fetch players", error);
    }
  };

  const getTotalFunds = async () => {
    try {
      const _totalFunds = await contract.getTotalFunds();
      setTotalFunds(ethers.utils.formatUnits(_totalFunds, 'ether')); // Convert BigNumber to MATIC
    } catch (error) {
      console.error("Failed to fetch total funds", error);
    }
  };

  const getTicketPrice = async () => {
    try {
      const _ticketPrice = await contract.ticketPrice();
      setTicketPrice(ethers.utils.formatUnits(_ticketPrice, 'ether')); // Convert BigNumber to MATIC
    } catch (error) {
      console.error("Failed to fetch ticket price", error);
    }
  };

  const getTimeRemaining = async () => {
    try {
      const _timeRemaining = await contract.getTimeRemaining();
      setTimeRemaining(_timeRemaining.toString()); // Convert BigNumber to string
    } catch (error) {
      console.error("Failed to fetch time remaining", error);
    }
  };

  // Start the countdown and update dynamically every second
  useEffect(() => {
    if (timeRemaining > 0) {
      const intervalId = setInterval(() => {
        setTimeRemaining((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);

      return () => clearInterval(intervalId); // Clear the interval on component unmount or when timeRemaining changes
    }
  }, [timeRemaining]);

  const buyTicket = async () => {
    if (!userAddress) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setLoading(true);
      const tx = await contract.enterLottery({ value: ethers.utils.parseUnits(ticketPrice, 'ether') });
      await tx.wait();
      alert('Ticket purchased successfully!');
      getPlayers();
      getTotalFunds();
      setLoading(false);
    } catch (error) {
      console.error("Error purchasing ticket", error);
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Etharba Lottery DApp</h1>

      {!isConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {userAddress}</p>
          <p>Players in the lottery: {players.length}</p>
          <p>Total Funds: {totalFunds} MATIC</p>
          <p>Ticket Price: {ticketPrice} MATIC</p>
          <p>Time Remaining for Next Draw: {timeRemaining} seconds</p>
          <button onClick={buyTicket} disabled={loading}>
            {loading ? 'Processing...' : 'Buy a Ticket'}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
