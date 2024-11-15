import { describe, it } from "mocha";
import { Keypair, PublicKey, Connection } from "@solana/web3.js";
import { SimpleUser } from "../src/simpleUser";
const assert = require("assert");

describe("Simple Solana User", () => {
  
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const keypair = Keypair.generate();
  const roleA = SimpleUser.fromKeypair(connection, keypair);;
  const roleB = SimpleUser.generate(connection);
  const roleC = SimpleUser.generate(connection);

  it("a simpleuser is initiated with some faucets", async () => {
    await roleA.faucet();    
    const balance = await roleA.sol();
    assert(balance > 0);
  });

  it("mint() should mint simpleuser the token", async () => {
    await roleA.mint("USDC").commit();
    assert.ok(roleA.tokens["USDC"].mint instanceof PublicKey);
    assert.ok(roleA.tokens["USDC"].decimals == 9);
    assert.ok(roleA.tokens["USDC"].tokenAccount instanceof PublicKey);
    
    const balance = await roleA.balance("USDC");
    assert.ok(balance.amount > 0);
    assert.ok(balance.rawAmount > 0);
    assert.ok(balance.decimals == 9);
  });

  it("transfer() should transfer tokens to another simpleuser", async () => {
    await roleB.faucet;
    let balance = await roleB.balance("USDC");
    assert.ok(balance.amount == 0);

    await roleA.transfer("USDC", 500, roleB).commit();
    assert.ok(roleB.tokens["USDC"].mint.toBase58() == roleA.tokens["USDC"].mint.toBase58());
    assert.ok(roleB.tokens["USDC"].decimals == roleA.tokens["USDC"].decimals);
    assert.ok(roleB.tokens["USDC"].tokenAccount instanceof PublicKey);
    
    balance = await roleB.balance("USDC");
    assert.ok(balance.amount == 500);
  });

  it("tidy actions can be chained together", async () => {
    await roleC.faucet();
    const minter = await SimpleUser.generate(connection)
    await minter.faucet();
    
    await minter.mint("POPCAT")
      .transfer("POPCAT", 500, roleA)
      .transfer("POPCAT", 1000, roleC)
      .commit();

    let balance = await roleA.balance("POPCAT");
    assert.ok(balance.amount == 500);
    
    balance = await roleC.balance("POPCAT");
    assert.ok(balance.amount == 1000);    
  });

});