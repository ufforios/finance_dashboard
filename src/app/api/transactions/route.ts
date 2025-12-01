import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/googleSheetsService';

export async function GET() {
    try {
        const transactions = await googleSheetsService.getTransactions();
        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Error obteniendo transacciones:', error);
        return NextResponse.json(
            { error: 'Error obteniendo transacciones' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const transaction = await googleSheetsService.addTransaction(body);
        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        console.error('Error creando transacción:', error);
        return NextResponse.json(
            { error: 'Error creando transacción' },
            { status: 500 }
        );
    }
}
