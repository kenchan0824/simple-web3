import {
  Connection, Keypair, Signer, PublicKey, Transaction, sendAndConfirmTransaction,
  SystemProgram, LAMPORTS_PER_SOL
} from "@solana/web3.js";
import {
  createInitializeMintInstruction, getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction, 
  createMintToInstruction, createTransferInstruction,
  MINT_SIZE, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";


export type TokenInfo = {
  mint: PublicKey;
  decimals: number;
}

export type BalanceInfo = {
  amount: number;
  rawAmount: number;
  decimals: number;
}


export class SimpleUser extends Keypair {

  conn: Connection;
  rent: number;
  txn: Transaction;
  signers: Signer[];
  tokens: { [index: string]: TokenInfo };
  tokenAccounts: { [index: string]: PublicKey };

  private constructor(conn: Connection, keypair: Keypair, rent: number) {
    super(keypair);
    this.conn = conn;
    this.rent = rent;
    this.txn = new Transaction();
    this.signers = [];
    this.tokens = {};
    this.tokenAccounts = {}
  }

  static fromKeypair(conn: Connection, keypair: Keypair): SimpleUser {
    const rent = 1461600;
    const user = new SimpleUser(conn, keypair, rent);
    return user;
  }

  static generate(conn: Connection): SimpleUser {
    const keypair = Keypair.generate();
    return SimpleUser.fromKeypair(conn, keypair);
  }

  public async sol(): Promise<number> {
    const lamports = await this.conn.getBalance(this.publicKey);
    return lamports / LAMPORTS_PER_SOL;
  }

  public async faucet(sol: number = 5) {
    // const rent = await getMinimumBalanceForRentExemptMint(this.conn)
    // this.rent = rent;
    // console.log("rent", rent);
    const tx = await this.conn.requestAirdrop(this.publicKey, sol * LAMPORTS_PER_SOL);
    await this.conn.confirmTransaction(tx);
  }

  public mint(symbol: string, decimals: number = 9): SimpleUser {
    const mint = Keypair.generate();
    this.tokens[symbol] = { mint: mint.publicKey, decimals }

    const tokenAccount = getAssociatedTokenAddressSync(
    mint.publicKey,
    this.publicKey,
    false, // allowOwnerOffCurve
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
    );   
    this.tokenAccounts[symbol] = tokenAccount;

    this.txn.add(
      // create mint account
      SystemProgram.createAccount({
        fromPubkey: this.publicKey,
        newAccountPubkey: mint.publicKey,
        space: MINT_SIZE,
        lamports: this.rent,
        programId: TOKEN_PROGRAM_ID,
      }),
      // init mint
      createInitializeMintInstruction(
        mint.publicKey, // mint pubkey
        decimals, 
        this.publicKey, // mint authority
        null // freeze authority
      ),
      // create token account
      createAssociatedTokenAccountInstruction(
        this.publicKey, // payer
        tokenAccount, 
        this.publicKey, // owner
        mint.publicKey, // mint
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      ),
      // mint to token account
      createMintToInstruction(
        mint.publicKey, // mint
        tokenAccount, // destination
        this.publicKey, // authority 
        Math.pow(10, 19), // amount 
        [], // multiSigners 
        TOKEN_PROGRAM_ID
      )
    );
    this.signers.push(this, mint, this, this);
    return this;
  }

  public async commit() {
    if (this.txn.instructions.length == 0) return;
    await sendAndConfirmTransaction(this.conn, this.txn, this.signers);
    this.reset();
  }

  public reset() {
    this.txn = new Transaction();
    this.signers = [];
  }

  public async balance(symbol: string): Promise<BalanceInfo> {
    const tokenAccount = this.tokenAccounts[symbol]
    if (!tokenAccount) return {
      rawAmount: 0,
      decimals: this.tokens[symbol]?.decimals,
      amount: 0
    };

    const { value } = await this.conn.getTokenAccountBalance(tokenAccount);
    return {
      rawAmount: +value.amount,
      decimals: value.decimals,
      amount: +value.amount / Math.pow(10, value.decimals)
    };
  }

  public transfer(symbol: string, amount: number, another: SimpleUser): SimpleUser {
    let destination = another.tokenAccounts[symbol];
    const { mint, decimals } = this.tokens[symbol]

    if (!destination) {
      another.tokens[symbol] = { mint, decimals };

      const tokenAccount = getAssociatedTokenAddressSync(
        mint,
        another.publicKey,
        false, // allowOwnerOffCurve
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );   
      another.tokenAccounts[symbol] = tokenAccount;
      destination = tokenAccount;

      this.txn.add(
        // create token account
        createAssociatedTokenAccountInstruction(
          this.publicKey, // payer
          tokenAccount, 
          another.publicKey, // owner
          mint, // mint
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        ),
      );
      this.signers.push(this);
    }

    this.txn.add(
      createTransferInstruction(
          this.tokenAccounts[symbol], 
          destination, 
          this.publicKey, 
          amount * Math.pow(10, decimals), 
          [], // multiSigners 
          TOKEN_PROGRAM_ID
      )
    );
    this.signers.push(this);
    return this;
  }
}