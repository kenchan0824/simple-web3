# Solana Simple Web3
A simple API to interact with the Solana blockchain.

In regard to testing Solana programs, ones often have to prepare multiple **user roles** and **tokens**, which can be tedious. *Simple-Web3* simplifies your tasks into just a few lines of code.

## Setup

Install the package with NPM under your project folder. 
```
npm i @solardev/simple-web3
```

Import the package in your source codes. 
```
import { SimpleUser } from "@solardev/simple-web3"
```

## Usage


### Create users

Every *simple-web3* command starts with the `SimpleUser` instance. You can generate a random one, or create one with a `web3.Keypair`. Pass in the `web3.connection` either from the Anchor provider or the Solana web3 API.
```
const roleA = await SimpleUser.fromKeypair(connection, keypair)
```
```
const roleB = await SimpleUser.generate(connection)
```


### Check the SOL balance
A few SOL is airdropped to the `SimpleUser` for paying gas fees when they are created. You can check the SOL balance remained.

> Because faucet is limited, *Simple-Web3* may break when used outside **localnet**.

```
const balance = await roleA.sol()
```

### Mint tokens
The `SimpleUser` can mint a SPL token with an alias. The minted token has 9 digits decimal, with initial supply big enough for testing purposes and all owned by the minter.
```
await roleA.mint("USDC").commit()
```

### Transfer tokens
After minting the SPL token, the minter can transfer arbitrary amount of token to another `SimpleUser`. 
```
await roleA.transfer("USDC", 100, roleB).commit()
```

### Check tokens
Every `SimpleUser` can own multiple tokens, the mint address, associated token account, and balance can be checked by referencing the alias.
```
const mintAddress = roleB.tokens["USDC"]
```
```
const ataAddress = roleB.tokenAccounts["USDC"]
```
```
const balance = await roleB.balance("USDC")
```

### Chain commands
You can chain several state-modifying commands together, and make the atomic transaction.

```
await minter.mint("POPCAT)
    .transfer("POPCAT", 100, roleA)
    .transfer("POPCAT", 500, roleB)
    .commit()
```

### Sign Anchor transactions
*Simple-Web3* is the best companion with *Anchor* to produce easy-reading Solana codes.
```
await program.methods.initCounter()
    .accounts({
        owner: roleA.publicKey,
        counter: counterAddress
    })
    .signers([roleA])
    .rpc()
```
---
#AwesomeSolana #Solana #web3