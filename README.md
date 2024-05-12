# Solana Simple Web3
A simple API to interact with the Solana blockchain.

In regard to unit test of Solana programs, ones often have to prepare multiple **user roles** and **tokens** beforehand, which can be tedious. *Simple-Web3* simplifies your tasks into just a few lines of codes.

## Setup

Install with NPM under your project folder. 
```
npm i @solardev/simple-web3
```

Import the package in your source codes. 
```
import { SimpleUser } from "@solardev/simple-web3"
```

## Usage


### Create users

Every *simple-web3* command starts with a `SimpleUser` instance. You can generate a new one with a random private key, or import from an existing `web3.Keypair`. Pass in a `web3.connection` either from the Anchor provider or Solana web3 API.
```
const roleA = await SimpleUser.fromKeypair(connection, keypair)
```
```
const roleB = await SimpleUser.generate(connection)
```

### Check the SOL balance
Some SOL is airdropped to newly created `SimpleUser` for paying gas fees. You can check their SOL balance remained.

> Because faucet is limited, *Simple-Web3* may not work outside **localnet**.

```
const balance = await roleA.sol()
```

### Mint tokens
`SimpleUser` can mint SPL tokens with the alias. The minted tokens are default to 9 digits decimal and have an initial supply big enough for testing. All initial tokens are owned by the minter.
```
await roleA.mint("USDC").commit()
```

### Transfer tokens
After minting the SPL tokens, minters can transfer any amounts to another `SimpleUser`. 
```
await roleA.transfer("USDC", 100, roleB).commit()
```

### Check tokens
A `SimpleUser` can own several tokens. Their mint address, associated token account and balance can be checked by referencing the associated alias.
```
const mintAddress = roleB.tokens["USDC"]
```
```
const ataAddress = roleB.tokenAccounts["USDC"]
```
```
const balance = await roleB.balance("USDC")
```

### Commands pipeline 
You can chain multiple state-modifying commands together, and submit an atomic transaction.

```
await minter.mint("POPCAT)
    .transfer("POPCAT", 100, roleA)
    .transfer("POPCAT", 500, roleB)
    .commit()
```

### Sign  Anchor transactions
*Simple-Web3* is the best companion with *Anchor* to produce tidy Solana client codes. You may just treat `SimpleUser` as the `web3.Keypair` and use anywhere.
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