// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenFactory {
    event TokenCreated(
        address tokenAddress,
        string name,
        string symbol,
        uint256 initialSupply
    );

    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) public returns (address) {
        CustomToken newToken = new CustomToken(
            name,
            symbol,
            initialSupply,
            msg.sender
        );
        emit TokenCreated(address(newToken), name, symbol, initialSupply);
        return address(newToken);
    }
}

contract CustomToken is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address tokenOwner
    ) ERC20(name, symbol) Ownable(tokenOwner) {
        _mint(tokenOwner, initialSupply * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
