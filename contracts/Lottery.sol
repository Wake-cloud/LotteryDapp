// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Lottery {
    using SafeMath for uint256;

    address public manager;
    uint256 public ticketPrice = 50 ether;  // 50 MATIC per ticket (1 MATIC = 1 ether for this example)
    address[] public players;
    uint256 public lastDrawTime;
    uint256 public drawInterval = 1 hours;  // 1 hour interval for automatic winner pick
    uint256 public maxTickets = 100;  // Max number of tickets before drawing the winner
    uint256 public feePercentage = 10;  // 10% fee
    uint256 public totalFunds;

    event WinnerPicked(address winner, uint256 amountWon);
    event TicketPurchased(address buyer);

    constructor() {
        manager = msg.sender;
        lastDrawTime = block.timestamp;  // Set the initial draw time to the current time
    }

    modifier onlyManager() {
        require(msg.sender == manager, "Only manager can call this");
        _;
    }

    // Function to enter the lottery by buying a ticket
    function enterLottery() public payable {
        require(msg.value == ticketPrice, "Incorrect ticket price");

        players.push(msg.sender);
        totalFunds = totalFunds.add(msg.value);  // Add the amount to the total funds

        emit TicketPurchased(msg.sender);

        // Check if we have 100 tickets or the 1-hour mark has been reached
        if (players.length >= maxTickets || block.timestamp >= lastDrawTime.add(drawInterval)) {
            pickWinner();
        }
    }

    // Function to pick a winner, called automatically when 100 tickets or 1 hour has passed
    function pickWinner() private {
        require(players.length > 0, "No players in the lottery");

        // Randomly pick a winner
        uint256 index = random() % players.length;
        address winner = players[index];

        // Calculate the fee and prize amounts
        uint256 feeAmount = totalFunds.mul(feePercentage).div(100);
        uint256 prizeAmount = totalFunds.sub(feeAmount);

        // Transfer the fee to the manager
        payable(manager).transfer(feeAmount);

        // Transfer the prize to the winner
        payable(winner).transfer(prizeAmount);

        // Emit event for winner
        emit WinnerPicked(winner, prizeAmount);

        // Reset the lottery for the next round
        delete players;  // Reset the players array
        totalFunds = 0;  // Reset the total funds
        lastDrawTime = block.timestamp;  // Reset the last draw time
    }

    // Function to get the list of players
    function getPlayers() public view returns (address[] memory) {
        return players;
    }

    // Function to get the total funds accumulated
    function getTotalFunds() public view returns (uint256) {
        return totalFunds;
    }

    // Function to get the remaining time until the next draw
    function getTimeRemaining() public view returns (uint256) {
        uint256 timeRemaining = lastDrawTime.add(drawInterval).sub(block.timestamp);
        return timeRemaining > 0 ? timeRemaining : 0;
    }

    // Helper function to generate a pseudo-random number (not secure for production)
    function random() private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, players)));
    }

    // Function to allow the manager to withdraw any leftover funds (if necessary)
    function withdraw() public onlyManager {
        payable(manager).transfer(address(this).balance);
    }
}
