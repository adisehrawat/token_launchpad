import { NextRequest, NextResponse } from 'next/server';
import { getAllPools } from '../../lib/getAllpools';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const config = searchParams.get('config');

        if (!config) {
            return NextResponse.json(
                { error: 'Missing config parameter' },
                { status: 400 }
            );
        }

        const poolsData = await getAllPools(config);

        return NextResponse.json(poolsData);
    } catch (error) {
        console.error('Error fetching pools:', error);
        return NextResponse.json(
            { 
                success: false,
                error: 'Failed to fetch pools',
                totalPools: 0,
                pools: []
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { config } = body;

        if (!config) {
            return NextResponse.json(
                { error: 'Missing config in request body' },
                { status: 400 }
            );
        }

        const poolsData = await getAllPools(config);

        return NextResponse.json(poolsData);
    } catch (error) {
        console.error('Error fetching pools:', error);
        return NextResponse.json(
            { 
                success: false,
                error: 'Failed to fetch pools',
                totalPools: 0,
                pools: []
            },
            { status: 500 }
        );
    }
}
