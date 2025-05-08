import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import * as anchor from "@project-serum/anchor";
import { Commitment, Connection, Keypair, PublicKey } from "@solana/web3.js";
import idl from "../idl.json";
// import {Wallet} from '@coral-xyz/anchor';
// import { WalletContextState } from '@solana/wallet-adapter-react';
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
// import fs from 'fs';
import id from "./id.json";
const PROGRAM_ID = new PublicKey(idl.metadata.address);
// console.log("Program ID: ", PROGRAM_ID);
const NETWORK = web3.clusterApiUrl("devnet");
const opts = { preflightCommitment: "processed" as Commitment };

import { Buffer } from "buffer";

// Polyfill for Buffer in the browser
if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

export const admin = Keypair.fromSecretKey(
  bs58.decode(
    "2xWEKBGocCDmUz9DEW6EtMzjP4wUiKtzL29nEcop3vWURc6WobU54NdSzdrSDWp4qRf55GD8wyKTmv5DqSq1xhpp"
  )
);
window.Buffer = Buffer;
// const keyData = JSON.parse(fs.readFileSync('id.json','utf-8'));
export const feeRecipt = Keypair.fromSecretKey(Uint8Array.from(id.privateKey));
// console.log("fee recipt: ", feeRecipt.publicKey.toBase58());
// console.log("array: ", wallet.publicKey.toBase58());

// if(!wallet) throw new Error("wallet not connected!");
const connection = new Connection(NETWORK, opts.preflightCommitment);
const provider = new anchor.AnchorProvider(connection, admin as any, opts);

// console.log("provider: ", provider);
const program = new anchor.Program(idl as any, PROGRAM_ID, provider);
export { program };
