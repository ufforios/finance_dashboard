import { NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/googleSheetsService';

export async function GET() {
    try {
        const summary = await googleSheetsService.getSummary();
        return NextResponse.json(summary);
    } catch (error) {
        console.error('Error obteniendo resumen:', error);
        return NextResponse.json(
            { error: 'Error obteniendo resumen' },
            { status: 500 }
        );
    }
}
