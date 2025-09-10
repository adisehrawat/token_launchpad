import { NextRequest, NextResponse } from 'next/server';
import { createDbcPool } from '../lib/createpool';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const name: string | undefined = body?.name;
        const symbol: string | undefined = body?.symbol;
        const walletAddress: string | undefined = body?.walletAddress;
        const uri: string | undefined = body?.uri;

        if (!name || !symbol || !walletAddress) {
            return NextResponse.json(
                { error: 'Missing required fields: name, symbol, walletAddress' },
                { status: 400 }
            );
        }

        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        const baseMint = Keypair.generate();
        const configAddress = "AdQWsu7ittQwDqr1aaBHDndisLUksGZMieM3krVU4XRZ";

        const tx = await createDbcPool(
            configAddress,
            connection,
            baseMint,
            name,
            symbol,
            uri ?? 'https://example.com/metadata.json',
            walletAddress,
        );

        tx.feePayer = new PublicKey(walletAddress);
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        tx.partialSign(baseMint);

        const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64');

        return NextResponse.json({
            success: true,
            transaction: serialized,
            baseMint: baseMint.publicKey.toBase58(),
        });
    } catch (error) {
        console.error('Error processing token creation:', error);
        return NextResponse.json(
            { error: 'Failed to create token' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    );
}
