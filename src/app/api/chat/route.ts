import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/googleSheetsService';

// Inicializar Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        const { message } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: 'Mensaje requerido' },
                { status: 400 }
            );
        }

        // Obtener contexto financiero
        const [transactions, accounts, summary] = await Promise.all([
            googleSheetsService.getTransactions(),
            googleSheetsService.getAccounts(),
            googleSheetsService.getSummary()
        ]);

        // Preparar contexto para Gemini
        const context = `
Eres un asistente financiero personal experto. Analiza los siguientes datos financieros del usuario y responde su pregunta de manera clara y útil.

RESUMEN FINANCIERO:
- Ingresos totales: ${summary.totalIncome.toLocaleString('es-PY')} PYG
- Gastos totales: ${summary.totalExpenses.toLocaleString('es-PY')} PYG
- Balance neto: ${summary.netBalance.toLocaleString('es-PY')} PYG
- Efectivo: ${summary.cashBalance.toLocaleString('es-PY')} PYG
- Cajas de ahorro: ${summary.bankBalance.toLocaleString('es-PY')} PYG
- Deuda de tarjetas de crédito: ${summary.creditCardDebt.toLocaleString('es-PY')} PYG

CUENTAS:
${accounts.map(a => `- ${a.name} (${a.type}): ${a.balance.toLocaleString('es-PY')} PYG${a.creditLimit ? ` | Límite: ${a.creditLimit.toLocaleString('es-PY')} PYG` : ''}`).join('\n')}

ÚLTIMAS 10 TRANSACCIONES:
${transactions.slice(0, 10).map(t =>
            `- ${t.date}: ${t.type === 'income' ? 'Ingreso' : t.type === 'expense' ? 'Gasto' : 'Transferencia'} de ${t.amount.toLocaleString('es-PY')} PYG en ${t.category} (${t.account})${t.detail ? ` - ${t.detail}` : ''}`
        ).join('\n')}

INSTRUCCIONES:
- Responde en español de Paraguay
- Usa formato de moneda PYG (Guaraníes)
- Sé conciso pero informativo
- Proporciona recomendaciones prácticas cuando sea relevante
- Si la pregunta no está relacionada con finanzas, indica amablemente que solo puedes ayudar con temas financieros

PREGUNTA DEL USUARIO:
${message}
`;

        // Llamar a Gemini 2.0 Flash (Experimental)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const result = await model.generateContent(context);
        const response = result.response;
        const text = response.text();

        return NextResponse.json({
            response: text,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error en chat con Gemini:', error);
        return NextResponse.json(
            { error: 'Error al procesar la consulta' },
            { status: 500 }
        );
    }
}
