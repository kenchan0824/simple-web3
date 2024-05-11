# Solana Simple Web3
A simple API to interact with the Solana blockchain.

In regard to testing Solana programs, ones often have to prepare multiple **user roles** and **tokens**, which  can be tedious. This package simplifies your tasks with just a few lines of code.

## Setup

Install the package with NPM under your project folder. 
```
npm i @solardev/simple-web3
```

Import the package in your source codes. 
```
import { SimpleUSer } from "@solardev/simple-web3"
```

## Usage


### Create users

Every command starts with the `SimpleUser` instance. You can generate a new one, or create one with the `web3.Keypair`. Pass in the `web3.connection` either from the Anchor provider or the Solana web3 API.
```
const roleA = await SimpleUser.fromKeypair(connection, keypair)
```
```
const roleB = await SimpleUser.generate(connection)
```


### Check the SOL balance
A few SOL is airdropped to the `SimpleUser` for paying gas fees when they are created. You can check the SOL balance remained.

> [!CAUTION]
> This can break when use outside the localnet.
```
const balance = await roleA.sol()
```

### Mint tokens
A `SimpleUser` can mint a SPL token with an alias. The minted token has 9 digits decimal, the initial supply is big enough for testing purposes and they are all owned by the minter.
```
await roleA.mint("USDC").commit()
```

### Transfer tokens
After minting the SPL token, they can transfer arbitrary amount to another `SimpleUser`. 
```
await roleA.transfer(roleB, "USDC", 100).commit()
```

### Check tokens
Every `SimpleUser` can own multiple tokens, they can check the mint address, associated token account, and balance by referencing the alias.
```
const mintAddress = roleB.tokens["USDC"]
```
```
const ataAddress = roleB.tokenAccounts["USDC"]
```
```
const balance = await roleB.balance("USDC")
```

### Chained actions
Users can chain several writable actions, and make an atomic transaction.

```
await minter.mint("POPCAT)
    .transfer(roleA, "POPCAT", 100)
    .transfer(roleA, "POPCAT", 500)
    .commit()
```

### Sign Anchor transactions
This package is the best companion to Anchor to produce human readable source codes.
```
await program.methods.initCounter()
    .accounts({
        owner: roleA.publicKey,
        counter: counterAddress
    })
    .signers([roleA])
    .rpc()
```
