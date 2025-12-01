import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/googleSheetsService';

export async function GET() {
    try {
        const accounts = await googleSheetsService.getAccounts();
        return NextResponse.json(accounts);
    } catch (error) {
        console.error('Error obteniendo cuentas:', error);
        return NextResponse.json(
            { error: 'Error obteniendo cuentas' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const account = await googleSheetsService.addAccount(body);
        return NextResponse.json(account, { status: 201 });
    } catch (error) {
        console.error('Error creando cuenta:', error);
        return NextResponse.json(
            { error: 'Error creando cuenta' },
            { status: 500 }
        );
    }
}
