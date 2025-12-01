import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/googleSheetsService';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const account = await googleSheetsService.updateAccount(id, body);

        if (!account) {
            return NextResponse.json(
                { error: 'Cuenta no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json(account);
    } catch (error) {
        console.error('Error actualizando cuenta:', error);
        return NextResponse.json(
            { error: 'Error actualizando cuenta' },
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
        const success = await googleSheetsService.deleteAccount(id);

        if (!success) {
            return NextResponse.json(
                { error: 'Cuenta no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error eliminando cuenta:', error);
        return NextResponse.json(
            { error: error.message || 'Error eliminando cuenta' },
            { status: 500 }
        );
    }
}
