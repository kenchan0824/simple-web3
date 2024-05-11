import { describe, it } from "mocha";
import { Keypair, PublicKey, Connection } from "@solana/web3.js";
import { SimpleUser } from "../src/simpleUser";
const assert = require("assert");

describe("Simple Solana User", () => {
  
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  let roleA: SimpleUser = undefined;

  it("a simpleuser is initiated with some faucets", async () => {
    const keypair = Keypair.generate();
    roleA = await SimpleUser.fromKeypair(connection, keypair);
    const balance = await roleA.sol();
    assert(balance > 0);
  });

  it("mint() should mint simpleuser the token", async () => {
    let amount = await roleA.balance("USDC");
    assert.ok(amount == 0);
    
    await roleA.mint("USDC").commit();
    assert.ok(roleA.tokens["USDC"] instanceof PublicKey);
    assert.ok(roleA.tokenAccounts["USDC"] instanceof PublicKey);
    
    amount = await roleA.balance("USDC");
    assert.ok(amount > 0);
  });

  it("transfer() should transfer tokens to another simpleuser", async () => {
    const roleB = await SimpleUser.generate(connection);
    let amount = await roleB.balance("USDC");
    assert.ok(amount == 0);

    await roleA.transfer(roleB, "USDC", 500).commit();
    assert.ok(roleB.tokens["USDC"].toBase58() == roleA.tokens["USDC"].toBase58());
    assert.ok(roleB.tokenAccounts["USDC"] instanceof PublicKey);
    
    amount = await roleB.balance("USDC");
    assert.ok(amount > 0);
  });

  it("tidy actions can be chained together", async () => {
    const roleC = await SimpleUser.generate(connection);
    const minter = await SimpleUser.generate(connection);
    await minter.mint("POPCAT")
      .transfer(roleA, "POPCAT", 500)
      .transfer(roleC, "POPCAT", 1000)
      .commit();

    let amount = await roleA.balance("POPCAT");
    assert.ok(amount == 500);
    
    amount = await roleC.balance("POPCAT");
    assert.ok(amount == 1000);    
  });

});