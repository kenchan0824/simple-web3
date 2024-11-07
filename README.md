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
import { 
    SimpleUser, u8, u16, u32, u64, findProgramAddress 
} from "@solardev/simple-web3"
```

## Simple PDA Utility

### Program Derived Address
We provide a handy version of **findProgramAddressSync**, users can just pass the `string`, `publicKey` or `number` as seed.
```
const [pda, bump] = findProgramAddress(
    programId,
    ["seed", roleA.publicKey, u16(1234)]
)
```
```
const pda = createProgramAddress(
    programId,
    ["seed", roleA.publicKey, u16(1234), u8(bump)]
)
```

## Simple Solana User

### Create users

Every *simple-web3* command starts with a `SimpleUser` instance. You can generate a new one with a random private key, or import from an existing `web3.Keypair`. Pass in a `web3.connection` either from the Anchor provider or Solana web3 API.
```
const roleA = await SimpleUser.fromKeypair(connection, keypair)
```
```
const roleB = await SimpleUser.generate(connection)
```

### Get SOL faucets

Get the basic SOL from testnet for activities gas fees.

> Because faucet is limited, this function may fail outside **localnet**.

```
await roleA.faucet(5)
```

### Check the SOL balance
Some SOL is airdropped to newly created `SimpleUser` for paying gas fees. You can check their SOL balance remained.


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
const { mint, decimals } = roleB.tokens["USDC"]
```
```
const ata = roleB.tokenAccounts["USDC"]
```
```
const { rawAmount, decimals, amount } = await roleB.balance("USDC")
```

### Commands pipeline 
You can chain multiple state-modifying commands together, and submit an atomic transaction.

```
await minter.mint("POPCAT")
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
        counter: counterPDA
    })
    .signers([roleA])
    .rpc()
```
---
#AwesomeSolana #Solana #web3 #PDA