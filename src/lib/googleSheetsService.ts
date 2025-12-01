import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { Transaction, Account, FinancialSummary, ACCOUNT_TYPES } from './types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Servicio para interactuar con Google Sheets
 */
class GoogleSheetsService {
    private doc: GoogleSpreadsheet | null = null;
    private initializationPromise: Promise<void> | null = null;

    private async initialize() {
        if (this.doc) return;

        if (!this.initializationPromise) {
            this.initializationPromise = (async () => {
                try {
                    const SHEET_ID = process.env.GOOGLE_SHEET_ID;
                    if (!SHEET_ID) {
                        throw new Error('GOOGLE_SHEET_ID no está configurado en las variables de entorno');
                    }

                    // Leer credenciales (Soporte para Vercel y Local)
                    let credentials;
                    if (process.env.GOOGLE_CREDENTIALS) {
                        // Producción (Vercel)
                        credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
                    } else {
                        // Desarrollo (Local)
                        const credentialsPath = path.join(process.cwd(), 'google-credentials.json');
                        if (fs.existsSync(credentialsPath)) {
                            credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
                        } else {
                            throw new Error('No se encontraron credenciales de Google (ni en ENV ni en archivo)');
                        }
                    }

                    // Crear cliente JWT
                    const serviceAccountAuth = new JWT({
                        email: credentials.client_email,
                        key: credentials.private_key,
                        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                    });

                    // Inicializar documento
                    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
                    await doc.loadInfo();

                    this.doc = doc;
                    console.log('✅ Google Sheets inicializado:', doc.title);
                } catch (error) {
                    console.error('❌ Error inicializando Google Sheets:', error);
                    this.initializationPromise = null; // Permitir reintento si falla
                    throw error;
                }
            })();
        }

        await this.initializationPromise;
    }

    private async getSheet(title: string) {
        await this.initialize();
        if (!this.doc) throw new Error('Documento no inicializado');

        const sheet = this.doc.sheetsByTitle[title];
        if (!sheet) {
            throw new Error(`Hoja "${title}" no encontrada`);
        }
        return sheet;
    }

    private parseNumber(value: string | number | undefined | null): number {
        if (value === undefined || value === null || value === '') return 0;
        if (typeof value === 'number') return value;

        // Remove currency symbols and other non-numeric chars (except . , and -)
        // This handles "$ 1.234,56" (European/Latin) and "$ 1,234.56" (US)
        let clean = value.toString().replace(/[^0-9.,-]/g, '').trim();

        // Check format: if last punctuation is comma, it's likely decimal separator (1.234,56)
        if (clean.indexOf(',') > clean.indexOf('.') && clean.includes(',')) {
            clean = clean.replace(/\./g, '').replace(',', '.');
        } else {
            // Otherwise assume US format (1,234.56) -> remove commas
            clean = clean.replace(/,/g, '');
        }

        const result = parseFloat(clean);
        return isNaN(result) ? 0 : result;
    }

    // ==================== TRANSACCIONES ====================

    async getTransactions(): Promise<Transaction[]> {
        const sheet = await this.getSheet('Transacciones');
        const rows = await sheet.getRows();

        const transactions: Transaction[] = rows.map((row) => ({
            id: row.get('ID') || '',
            date: row.get('Fecha') || '',
            type: row.get('Tipo') as 'income' | 'expense' | 'transfer',
            category: row.get('Categoría') || '',
            amount: this.parseNumber(row.get('Monto')),
            account: row.get('Cuenta') || '',
            toAccount: row.get('Cuenta Destino') || undefined,
            detail: row.get('Detalle') || undefined,
        }));

        return transactions.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }

    async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
        const sheet = await this.getSheet('Transacciones');

        const newTransaction: Transaction = {
            ...transaction,
            id: Date.now().toString(),
        };

        await sheet.addRow({
            'ID': newTransaction.id,
            'Fecha': newTransaction.date,
            'Tipo': newTransaction.type,
            'Categoría': newTransaction.category,
            'Monto': newTransaction.amount,
            'Cuenta': newTransaction.account,
            'Cuenta Destino': newTransaction.toAccount || '',
            'Detalle': newTransaction.detail || '',
        });

        // Actualizar balances de cuentas
        await this.updateAccountBalances(newTransaction);

        return newTransaction;
    }

    async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
        const sheet = await this.getSheet('Transacciones');
        const rows = await sheet.getRows();

        // Búsqueda robusta del ID
        const rowIndex = rows.findIndex(row => String(row.get('ID')).trim() === String(id).trim());

        if (rowIndex === -1) {
            return null;
        }

        const row = rows[rowIndex];

        // Obtener transacción original para revertir balances
        const originalTransaction: Transaction = {
            id: row.get('ID') || '',
            date: row.get('Fecha') || '',
            type: row.get('Tipo') as 'income' | 'expense' | 'transfer',
            category: row.get('Categoría') || '',
            amount: this.parseNumber(row.get('Monto')),
            account: row.get('Cuenta') || '',
            toAccount: row.get('Cuenta Destino') || undefined,
            detail: row.get('Detalle') || undefined,
        };

        // Revertir balances de la transacción original
        await this.revertTransaction(originalTransaction);

        // Actualizar la fila
        if (updates.date !== undefined) row.set('Fecha', updates.date);
        if (updates.type !== undefined) row.set('Tipo', updates.type);
        if (updates.category !== undefined) row.set('Categoría', updates.category);
        if (updates.amount !== undefined) row.set('Monto', updates.amount);
        if (updates.account !== undefined) row.set('Cuenta', updates.account);
        if (updates.toAccount !== undefined) row.set('Cuenta Destino', updates.toAccount);
        if (updates.detail !== undefined) row.set('Detalle', updates.detail);

        await row.save();

        const updatedTransaction: Transaction = {
            id: row.get('ID') || '',
            date: row.get('Fecha') || '',
            type: row.get('Tipo') as 'income' | 'expense' | 'transfer',
            category: row.get('Categoría') || '',
            amount: this.parseNumber(row.get('Monto')),
            account: row.get('Cuenta') || '',
            toAccount: row.get('Cuenta Destino') || undefined,
            detail: row.get('Detalle') || undefined,
        };

        // Aplicar balances de la transacción actualizada
        await this.updateAccountBalances(updatedTransaction);

        return updatedTransaction;
    }

    async deleteTransaction(id: string): Promise<boolean> {
        const sheet = await this.getSheet('Transacciones');
        const rows = await sheet.getRows();

        const rowIndex = rows.findIndex(row => row.get('ID') === id);
        if (rowIndex === -1) return false;

        const row = rows[rowIndex];

        // Obtener transacción para revertir balances
        const transaction: Transaction = {
            id: row.get('ID') || '',
            date: row.get('Fecha') || '',
            type: row.get('Tipo') as 'income' | 'expense' | 'transfer',
            category: row.get('Categoría') || '',
            amount: this.parseNumber(row.get('Monto')),
            account: row.get('Cuenta') || '',
            toAccount: row.get('Cuenta Destino') || undefined,
            detail: row.get('Detalle') || undefined,
        };

        await this.revertTransaction(transaction);
        await row.delete();

        return true;
    }

    // ==================== CUENTAS ====================

    async getAccounts(): Promise<Account[]> {
        const sheet = await this.getSheet('Cuentas');
        const rows = await sheet.getRows();

        return rows.map((row) => {
            const balanceVal = row.get('Balance Actual') !== undefined ? row.get('Balance Actual') : row.get('Balance');
            return {
                id: row.get('ID') || '',
                name: row.get('Nombre') || '',
                type: row.get('Tipo') || '',
                initialBalance: this.parseNumber(row.get('Balance Inicial')),
                balance: this.parseNumber(balanceVal),
                creditLimit: row.get('Límite de Crédito') ? this.parseNumber(row.get('Límite de Crédito')) : undefined,
            };
        });
    }

    async getAccount(id: string): Promise<Account | null> {
        const accounts = await this.getAccounts();
        return accounts.find(a => a.id === id) || null;
    }

    async addAccount(account: Omit<Account, 'id' | 'balance'>): Promise<Account> {
        const sheet = await this.getSheet('Cuentas');

        const newAccount: Account = {
            ...account,
            id: Date.now().toString(),
            balance: account.initialBalance || 0,
        };

        // Determine balance column name from headers
        await sheet.loadHeaderRow();
        const balanceKey = sheet.headerValues.includes('Balance Actual') ? 'Balance Actual' : 'Balance';

        await sheet.addRow({
            'ID': String(newAccount.id),
            'Nombre': String(newAccount.name),
            'Tipo': String(newAccount.type),
            'Balance Inicial': Number(newAccount.initialBalance || 0),
            [balanceKey]: Number(newAccount.balance),
            'Límite de Crédito': newAccount.creditLimit ? Number(newAccount.creditLimit) : '',
        });

        return newAccount;
    }

    async updateAccount(id: string, updates: Partial<Account>): Promise<Account | null> {
        const sheet = await this.getSheet('Cuentas');
        const rows = await sheet.getRows();

        const rowIndex = rows.findIndex(row => row.get('ID') === id);
        if (rowIndex === -1) return null;

        const row = rows[rowIndex];

        if (updates.name !== undefined) row.set('Nombre', updates.name);
        if (updates.type !== undefined) row.set('Tipo', updates.type);
        if (updates.initialBalance !== undefined) row.set('Balance Inicial', updates.initialBalance);

        const balanceColumn = row.get('Balance Actual') !== undefined ? 'Balance Actual' : 'Balance';
        if (updates.balance !== undefined) row.set(balanceColumn, updates.balance);

        if (updates.creditLimit !== undefined) row.set('Límite de Crédito', updates.creditLimit || '');

        await row.save();

        return {
            id: row.get('ID') || '',
            name: row.get('Nombre') || '',
            type: row.get('Tipo') || '',
            initialBalance: this.parseNumber(row.get('Balance Inicial')),
            balance: this.parseNumber(row.get('Balance Actual')),
            creditLimit: row.get('Límite de Crédito') ? this.parseNumber(row.get('Límite de Crédito')) : undefined,
        };
    }

    async deleteAccount(id: string): Promise<boolean> {
        const sheet = await this.getSheet('Cuentas');
        const rows = await sheet.getRows();

        const rowIndex = rows.findIndex(row => row.get('ID') === id);
        if (rowIndex === -1) return false;

        // Verificar si tiene transacciones
        const transactions = await this.getTransactions();
        const hasTransactions = transactions.some(
            t => t.account === id || t.toAccount === id
        );

        if (hasTransactions) {
            throw new Error('No se puede eliminar una cuenta con transacciones');
        }

        await rows[rowIndex].delete();
        return true;
    }

    // ==================== CATEGORÍAS ====================

    async getCategories(type: 'income' | 'expense'): Promise<string[]> {
        const sheetName = type === 'income' ? 'Categorías_Ingresos' : 'Categorías_Gastos';
        const sheet = await this.getSheet(sheetName);
        const rows = await sheet.getRows();

        return rows.map(row => row.get('Categoría') || '').filter(Boolean);
    }

    async addCategory(type: 'income' | 'expense', name: string): Promise<string> {
        const sheetName = type === 'income' ? 'Categorías_Ingresos' : 'Categorías_Gastos';
        const sheet = await this.getSheet(sheetName);

        const categories = await this.getCategories(type);
        if (categories.includes(name)) {
            throw new Error('La categoría ya existe');
        }

        await sheet.addRow({ 'Categoría': name });
        return name;
    }

    async updateCategory(type: 'income' | 'expense', oldName: string, newName: string): Promise<string> {
        const sheetName = type === 'income' ? 'Categorías_Ingresos' : 'Categorías_Gastos';
        const sheet = await this.getSheet(sheetName);
        const rows = await sheet.getRows();

        const rowIndex = rows.findIndex(row => row.get('Categoría') === oldName);
        if (rowIndex === -1) {
            throw new Error('Categoría no encontrada');
        }

        const categories = await this.getCategories(type);
        if (categories.includes(newName) && oldName !== newName) {
            throw new Error('La nueva categoría ya existe');
        }

        const row = rows[rowIndex];
        row.set('Categoría', newName);
        await row.save();

        // Actualizar transacciones con esta categoría
        const transactionSheet = await this.getSheet('Transacciones');
        const transactionRows = await transactionSheet.getRows();

        for (const tRow of transactionRows) {
            if (tRow.get('Categoría') === oldName && tRow.get('Tipo') === type) {
                tRow.set('Categoría', newName);
                await tRow.save();
            }
        }

        return newName;
    }

    async deleteCategory(type: 'income' | 'expense', name: string): Promise<boolean> {
        const sheetName = type === 'income' ? 'Categorías_Ingresos' : 'Categorías_Gastos';
        const sheet = await this.getSheet(sheetName);
        const rows = await sheet.getRows();

        const rowIndex = rows.findIndex(row => row.get('Categoría') === name);
        if (rowIndex === -1) return false;

        // Verificar si tiene transacciones
        const transactions = await this.getTransactions();
        const hasTransactions = transactions.some(
            t => t.category === name && t.type === type
        );

        if (hasTransactions) {
            throw new Error('No se puede eliminar una categoría con transacciones');
        }

        await rows[rowIndex].delete();
        return true;
    }

    // ==================== RESUMEN Y ANÁLISIS ====================

    async getSummary(): Promise<FinancialSummary> {
        const transactions = await this.getTransactions();
        const accounts = await this.getAccounts();

        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const cashBalance = accounts
            .filter(a => a.type === ACCOUNT_TYPES.CASH)
            .reduce((sum, a) => sum + a.balance, 0);

        const bankBalance = accounts
            .filter(a => a.type === ACCOUNT_TYPES.BANK)
            .reduce((sum, a) => sum + a.balance, 0);

        const creditCardDebt = Math.abs(
            accounts
                .filter(a => a.type === ACCOUNT_TYPES.CREDIT_CARD)
                .reduce((sum, a) => sum + Math.min(0, a.balance), 0)
        );

        const accountBalances: Record<string, number> = {};
        accounts.forEach(account => {
            accountBalances[account.id] = account.balance;
        });

        return {
            totalIncome,
            totalExpenses,
            netBalance: totalIncome - totalExpenses,
            cashBalance,
            bankBalance,
            creditCardDebt,
            accountBalances,
        };
    }

    async getCategoryBreakdown(type: 'income' | 'expense'): Promise<Record<string, number>> {
        const transactions = await this.getTransactions();
        const breakdown: Record<string, number> = {};

        transactions
            .filter(t => t.type === type)
            .forEach(t => {
                breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
            });

        return breakdown;
    }

    // ==================== MÉTODOS AUXILIARES ====================

    private async updateAccountBalances(transaction: Transaction) {
        const sheet = await this.getSheet('Cuentas');
        const rows = await sheet.getRows();

        const accountRow = rows.find(row => row.get('ID') === transaction.account);
        if (!accountRow) {
            console.error(`❌ updateAccountBalances: Cuenta ${transaction.account} no encontrada`);
            return;
        }

        // Determine which balance column exists (fallback to 'Balance' if 'Balance Actual' not found)
        const balanceColumn = accountRow.get('Balance Actual') !== undefined ? 'Balance Actual' : 'Balance';
        let currentBalance = this.parseNumber(accountRow.get(balanceColumn));

        console.log(`🔄 Actualizando balance cuenta ${accountRow.get('Nombre')} (${transaction.account})`);
        console.log(`   Balance actual: ${currentBalance}, Monto transacción: ${transaction.amount}, Tipo: ${transaction.type}`);

        if (transaction.type === 'income') {
            currentBalance += transaction.amount;
        } else if (transaction.type === 'expense') {
            currentBalance -= transaction.amount;
        } else if (transaction.type === 'transfer' && transaction.toAccount) {
            currentBalance -= transaction.amount;

            // Update destination account
            const toAccountRow = rows.find(row => row.get('ID') === transaction.toAccount);
            if (toAccountRow) {
                const destBalanceColumn = toAccountRow.get('Balance Actual') !== undefined ? 'Balance Actual' : 'Balance';
                const toBalance = this.parseNumber(toAccountRow.get(destBalanceColumn));
                const newToBalance = toBalance + transaction.amount;

                console.log(`   Cuenta destino ${toAccountRow.get('Nombre')}: ${toBalance} -> ${newToBalance}`);

                toAccountRow.set(destBalanceColumn, newToBalance);
                await toAccountRow.save();
            }
        }

        console.log(`   Nuevo balance origen: ${currentBalance}`);
        accountRow.set(balanceColumn, currentBalance);
        await accountRow.save();
    }

    private async revertTransaction(transaction: Transaction) {
        const sheet = await this.getSheet('Cuentas');
        const rows = await sheet.getRows();

        const accountRow = rows.find(row => row.get('ID') === transaction.account);
        if (!accountRow) return;

        // Determine balance column (fallback to 'Balance')
        const balanceColumn = accountRow.get('Balance Actual') !== undefined ? 'Balance Actual' : 'Balance';
        let currentBalance = this.parseNumber(accountRow.get(balanceColumn));

        if (transaction.type === 'income') {
            currentBalance -= transaction.amount;
        } else if (transaction.type === 'expense') {
            currentBalance += transaction.amount;
        } else if (transaction.type === 'transfer' && transaction.toAccount) {
            currentBalance += transaction.amount;

            // Revert destination account
            const toAccountRow = rows.find(row => row.get('ID') === transaction.toAccount);
            if (toAccountRow) {
                const destBalanceColumn = toAccountRow.get('Balance Actual') !== undefined ? 'Balance Actual' : 'Balance';
                const toBalance = this.parseNumber(toAccountRow.get(destBalanceColumn));
                toAccountRow.set(destBalanceColumn, toBalance - transaction.amount);
                await toAccountRow.save();
            }
        }

        accountRow.set(balanceColumn, currentBalance);
        await accountRow.save();
    }
}

// Singleton instance
export const googleSheetsService = new GoogleSheetsService();
