import * as BN from "bn.js";
import { PublicKey } from "@solana/web3.js";

export class RustNumber {
    value: BN;
    bits: number;

    constructor(value: BN, bits: number) {
        this.value = value;
        this.bits = bits;
    }
}

function rust_number(num: number | BN, bits: number): RustNumber {
    if (typeof num == "number") num = new BN(num);
    return new RustNumber(num, bits);
}

export function u8(num: number | BN): RustNumber {
    return rust_number(num, 8);
}

export function u16(num: number | BN): RustNumber {
    return rust_number(num, 16);
}

export function u32(num: number | BN): RustNumber {
    return rust_number(num, 32);
}

export function u64(num: number | BN): RustNumber {
    return rust_number(num, 64);
}

export function process_seed(seed: string | PublicKey | RustNumber): Buffer {
    if (typeof seed == "string") {
        return Buffer.from(seed);

    } else if(seed instanceof PublicKey) {
        return seed.toBuffer();

    } else if(seed instanceof RustNumber) {
        return seed.value.toArrayLike(Buffer, 'le', seed.bits / 8);
    } 
    return undefined;
}

export function findProgramAddress(
    programId: PublicKey, 
    seeds: (string | PublicKey | RustNumber)[]
): [PublicKey, number] {
    
    const parsed_seeds = seeds.map((seed) => process_seed(seed));
    return PublicKey.findProgramAddressSync(parsed_seeds, programId);
}

export function createProgramAddress(
    programId: PublicKey, 
    seeds: (string | PublicKey | RustNumber)[]
): PublicKey {
    
    const parsed_seeds = seeds.map((seed) => process_seed(seed));
    return PublicKey.createProgramAddressSync(parsed_seeds, programId)
}