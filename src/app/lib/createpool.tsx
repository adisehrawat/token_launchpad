import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import {
    DynamicBondingCurveClient,
  } from '@meteora-ag/dynamic-bonding-curve-sdk';

export async function createDbcPool(
    configAddress: string,
    connection: Connection,
    baseMint: Keypair,
    poolname: string,
    poolsymbol: string,
    pooluri: string,
    walletAddress: string,
): Promise<Transaction> {
    if(!configAddress) {
        throw new Error("Missing config address");
    }
    const configPubkey = new PublicKey(configAddress);
    const walletPubkey = new PublicKey(walletAddress);
    const dbcInstance = new DynamicBondingCurveClient(connection, "confirmed");
    try {
        console.log(`>> Creating pool transaction...`);
        const createPoolTx = await dbcInstance.pool.createPool({
            baseMint: baseMint.publicKey,
            config: configPubkey,
            name: poolname,
            symbol: poolsymbol,
            uri: pooluri,
            payer: walletPubkey,
            poolCreator: walletPubkey,
        })
        console.log(`>> Sending create pool transaction...`);

        return createPoolTx;

    } catch (err) {
        console.error('Failed to create pool:', err);
        throw err;
    }
}