import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import {
    DynamicBondingCurveClient,
} from '@meteora-ag/dynamic-bonding-curve-sdk';

import { Metaplex } from "@metaplex-foundation/js";

const connection = new Connection(clusterApiUrl("devnet"));


export async function getAllPools(
    config: string,
) {
    try {
        const metaplex = new Metaplex(connection);
        const client = new DynamicBondingCurveClient(connection, "confirmed");
        const configPublicKey = new PublicKey(config);

        const pools = await client.state.getPoolsByConfig(configPublicKey);
        const poolsData = [];

        for (let i = 0; i < pools.length; i++) {
            const baseMint = pools[i].account.baseMint.toString();
            const baseMintPubKey = new PublicKey(baseMint);
            const metadataAccount = await metaplex.nfts().findByMint({ mintAddress: baseMintPubKey });

            const poolData = {
                poolKey: pools[i].publicKey.toString(),
                baseMintKey: baseMint,
                name: metadataAccount.name || 'Unknown',
                symbol: metadataAccount.symbol || 'UNKNOWN',
                uri: metadataAccount.uri || '',
                baseSupply: (Number(pools[i].account.baseReserve.toString()) / 1_000_000_000).toString(),
                quoteSupply: pools[i].account.quoteReserve.toString(),
                isMigrated: pools[i].account.isMigrated,
                poolIndex: i,
                config: config,
            };

            poolsData.push(poolData);

        }

        return {
            success: true,
            totalPools: poolsData.length,
            config: config,
            pools: poolsData
        };

    } catch (error) {
        console.error('Error in getAllPools:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            totalPools: 0,
            config: config,
            pools: []
        };
    }
}