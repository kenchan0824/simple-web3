import { describe, it } from "mocha";
const assert = require("assert");
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { 
    u8, u16, u64, process_seed, findProgramAddress, createProgramAddress
} from "../src/pda";

describe("PDA Util", () => {

    const pubkey = Keypair.generate().publicKey 
    let pda: PublicKey;
    let bump: number;

    it("process_seed(string)", async () => {
        const str = process_seed("hello");
        assert.ok(str instanceof Buffer)
    });

    it("process_seed(number)", async () => {
        const num = process_seed(u16(124));
        assert.ok(num instanceof Buffer)
    });

    it("process_seed(PublicKey)", async () => {
        const pk = process_seed(pubkey);
        assert.ok(pk instanceof Buffer)
    });

    it("findProgramAddress()", async () => {
        [pda, bump] = findProgramAddress(
            SystemProgram.programId,
            ["seed", pubkey, u64(1234)]
        )
        assert.ok(pda instanceof PublicKey);
        assert.ok(bump <= 255);
    });

    it("createProgramAddress()", async () => {
        const _pda = createProgramAddress(
            SystemProgram.programId,
            ["seed", pubkey, u64(1234), u8(bump)]
        )
        assert.ok(_pda.toBase58() == pda.toBase58());
    });
});