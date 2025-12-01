import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { googleSheetsService } from './googleSheetsService';
import { ACCOUNTS, ACCOUNT_TYPES } from './types';

/**
 * Script para inicializar las cuentas y categorías predefinidas en Google Sheets
 * Ejecutar con: node --loader ts-node/esm src/lib/initializeSheets.ts
 */
async function initializeSheets() {
    console.log('🚀 Iniciando configuración de Google Sheets...\n');

    try {
        // Verificar cuentas existentes
        const existingAccounts = await googleSheetsService.getAccounts();
        console.log(`📊 Cuentas existentes: ${existingAccounts.length}`);

        // Agregar cuentas predefinidas si no existen
        if (existingAccounts.length === 0) {
            console.log('\n📝 Agregando cuentas predefinidas...');

            for (const [id, { name, type }] of Object.entries(ACCOUNTS)) {
                await googleSheetsService.addAccount({
                    name,
                    type,
                    initialBalance: 0,
                });
                console.log(`  ✅ ${name} (${type})`);
            }
        } else {
            console.log('  ℹ️  Las cuentas ya están configuradas');
        }

        // Verificar categorías de ingresos
        const incomeCategories = await googleSheetsService.getCategories('income');
        console.log(`\n📊 Categorías de ingresos existentes: ${incomeCategories.length}`);

        if (incomeCategories.length === 0) {
            console.log('\n📝 Agregando categorías de ingresos...');
            const defaultIncomeCategories = [
                'Ingresos Operativos',
                'Otros Ingresos',
                'Intereses Ganados'
            ];

            for (const category of defaultIncomeCategories) {
                await googleSheetsService.addCategory('income', category);
                console.log(`  ✅ ${category}`);
            }
        } else {
            console.log('  ℹ️  Las categorías de ingresos ya están configuradas');
        }

        // Verificar categorías de gastos
        const expenseCategories = await googleSheetsService.getCategories('expense');
        console.log(`\n📊 Categorías de gastos existentes: ${expenseCategories.length}`);

        if (expenseCategories.length === 0) {
            console.log('\n📝 Agregando categorías de gastos...');
            const defaultExpenseCategories = [
                'Gastos Laborales',
                'Movilidad',
                'Consumición',
                'Gastos en Dpto.',
                'Aporte Familiar'
            ];

            for (const category of defaultExpenseCategories) {
                await googleSheetsService.addCategory('expense', category);
                console.log(`  ✅ ${category}`);
            }
        } else {
            console.log('  ℹ️  Las categorías de gastos ya están configuradas');
        }

        console.log('\n✅ ¡Configuración completada exitosamente!');
        console.log('\n📋 Resumen:');

        const finalAccounts = await googleSheetsService.getAccounts();
        const finalIncomeCategories = await googleSheetsService.getCategories('income');
        const finalExpenseCategories = await googleSheetsService.getCategories('expense');

        console.log(`  • Cuentas: ${finalAccounts.length}`);
        console.log(`  • Categorías de ingresos: ${finalIncomeCategories.length}`);
        console.log(`  • Categorías de gastos: ${finalExpenseCategories.length}`);

    } catch (error) {
        console.error('\n❌ Error durante la inicialización:', error);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    initializeSheets()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

export { initializeSheets };
