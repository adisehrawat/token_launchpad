import { NextRequest, NextResponse } from 'next/server';
import { buildCurveAndCreateConfig } from '../lib/poolConfig';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        
        const tokenData = {
            name: formData.get('name'),
            symbol: formData.get('symbol'),
            totalSupply: formData.get('totalSupply'),
            image: formData.get('image')
        };


        if (!tokenData.name || !tokenData.symbol || !tokenData.totalSupply) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const configAddress = await buildCurveAndCreateConfig(Number(tokenData.totalSupply));

        const configString = configAddress.toBase58();
        
        return NextResponse.json({
            success: true,
            message: 'Token created successfully!',
            tokenData: {
                name: tokenData.name,
                symbol: tokenData.symbol,
                totalSupply: tokenData.totalSupply,
                hasImage: !!tokenData.image
            },
            configAddress: configString,
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
