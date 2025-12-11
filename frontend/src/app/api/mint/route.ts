import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { batchData } = body;

        if (!batchData) {
            return NextResponse.json(
                { error: 'Missing batchData' },
                { status: 400 }
            );
        }

        console.log('=== Starting Minting on Backend ===');
        console.log('Batch Data:', batchData);

        // Call the backend API to handle minting
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/mint`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ batchData })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Backend error:', error);
            return NextResponse.json(
                { error: error.message || 'Minting failed' },
                { status: response.status }
            );
        }

        const result = await response.json();
        console.log('Minting result:', result);

        return NextResponse.json({
            txHash: result.txHash,
            policyId: result.policyId,
            assetName: result.assetName,
            address: result.address
        });
    } catch (error) {
        console.error('=== Minting Error ===', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: `Minting failed: ${message}` },
            { status: 500 }
        );
    }
}
