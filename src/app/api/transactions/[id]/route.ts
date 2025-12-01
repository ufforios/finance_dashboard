import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/googleSheetsService';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const transaction = await googleSheetsService.updateTransaction(id, body);

        if (!transaction) {
            return NextResponse.json(
                { error: 'Transacción no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json(transaction);
    } catch (error) {
        console.error('Error actualizando transacción:', error);
        return NextResponse.json(
            { error: 'Error actualizando transacción' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const success = await googleSheetsService.deleteTransaction(id);

        if (!success) {
            return NextResponse.json(
                { error: 'Transacción no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error eliminando transacción:', error);
        return NextResponse.json(
            { error: 'Error eliminando transacción' },
            { status: 500 }
        );
    }
}
