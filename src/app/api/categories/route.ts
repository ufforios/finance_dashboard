import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/googleSheetsService';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type') as 'income' | 'expense';

        if (!type || (type !== 'income' && type !== 'expense')) {
            return NextResponse.json(
                { error: 'Tipo de categoría inválido. Debe ser "income" o "expense"' },
                { status: 400 }
            );
        }

        const categories = await googleSheetsService.getCategories(type);
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error obteniendo categorías:', error);
        return NextResponse.json(
            { error: 'Error obteniendo categorías' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { type, name } = await request.json();

        if (!type || !name) {
            return NextResponse.json(
                { error: 'Tipo y nombre son requeridos' },
                { status: 400 }
            );
        }

        const category = await googleSheetsService.addCategory(type, name);
        return NextResponse.json({ category }, { status: 201 });
    } catch (error: any) {
        console.error('Error creando categoría:', error);
        return NextResponse.json(
            { error: error.message || 'Error creando categoría' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { type, oldName, newName } = await request.json();

        if (!type || !oldName || !newName) {
            return NextResponse.json(
                { error: 'Tipo, nombre antiguo y nuevo nombre son requeridos' },
                { status: 400 }
            );
        }

        const category = await googleSheetsService.updateCategory(type, oldName, newName);
        return NextResponse.json({ category });
    } catch (error: any) {
        console.error('Error actualizando categoría:', error);
        return NextResponse.json(
            { error: error.message || 'Error actualizando categoría' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { type, name } = await request.json();

        if (!type || !name) {
            return NextResponse.json(
                { error: 'Tipo y nombre son requeridos' },
                { status: 400 }
            );
        }

        const success = await googleSheetsService.deleteCategory(type, name);

        if (!success) {
            return NextResponse.json(
                { error: 'Categoría no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error eliminando categoría:', error);
        return NextResponse.json(
            { error: error.message || 'Error eliminando categoría' },
            { status: 500 }
        );
    }
}
