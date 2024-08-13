import { SystemProgram, PublicKey, Keypair, Connection, clusterApiUrl, sendAndConfirmTransaction, Transaction }  from "@solana/web3.js";
import {
    getExplorerLink,
    getKeypairFromEnvironment,
  } from "@solana-developers/helpers";
import sha256 from 'crypto-js/sha256.js';
import * as bs58 from 'bs58';

const connection = new Connection(clusterApiUrl('devnet'));

async function getOrCreateUserWallet(email, connection){
    // generate a 32-byte seed from the user's email
    const seed = sha256(email).toString(); // produces a 64-character hex string (32 bytes)
    const seedArray = new Uint8Array(Buffer.from(seed, 'hex'));

    //derive the keypair from the seed
     const keypair = Keypair.fromSeed(seedArray.slice(0, 32)); 
     
    const publicKey = keypair.publicKey;

    let accountInfo;

    try{
        // check if the account already exists
        accountInfo = await connection.getAccountInfo(publicKey, 'processed');
    }catch(err){
        //create account if it doesn't exist

        // calculate the minimum balance need for rent exemption
        const lamports = await connection.getMinimumBalanceForRentExemption(0);

        const createAccountIx = SystemProgram.createAccount({
            fromPubkey: keypair.publicKey,
            newAccountPubkey: publicKey,
            lamports,
            space: 0,
            programId: SystemProgram.programId
        });
        const tx = new Transaction().add(createAccountIx);
        await sendAndConfirmTransaction(connection, tx, [keypair], {
            skipPreflight: true,
            commitment: 'processed'
        })

        console.log('New account created:', publicKey.toString());
    }

    // Return the public key of the user's wallet
    console.log('User wallet public key:', publicKey.toString());
    return publicKey.toString();
}

getOrCreateUserWallet('testemail@example.com', connection)