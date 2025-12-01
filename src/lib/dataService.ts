import { Transaction, Account, FinancialSummary } from './types';

/**
 * Servicio de datos que se comunica con las API routes
 */
class DataService {
    private baseUrl = '/api';

    // ==================== TRANSACCIONES ====================

    async getTransactions(): Promise<Transaction[]> {
        const response = await fetch(`${this.baseUrl}/transactions`);
        if (!response.ok) throw new Error('Error obteniendo transacciones');
        return response.json();
    }

    async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
        const response = await fetch(`${this.baseUrl}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction),
        });
        if (!response.ok) throw new Error('Error creando transacción');
        return response.json();
    }

    async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
        const response = await fetch(`${this.baseUrl}/transactions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (response.status === 404) return null;
        if (!response.ok) throw new Error('Error actualizando transacción');
        return response.json();
    }

    async deleteTransaction(id: string): Promise<boolean> {
        const response = await fetch(`${this.baseUrl}/transactions/${id}`, {
            method: 'DELETE',
        });
        if (response.status === 404) return false;
        if (!response.ok) throw new Error('Error eliminando transacción');
        return true;
    }

    // ==================== CUENTAS ====================

    async getAccounts(): Promise<Account[]> {
        const response = await fetch(`${this.baseUrl}/accounts`);
        if (!response.ok) throw new Error('Error obteniendo cuentas');
        return response.json();
    }

    async getAccount(id: string): Promise<Account | null> {
        const accounts = await this.getAccounts();
        return accounts.find(a => a.id === id) || null;
    }

    async addAccount(account: Omit<Account, 'id' | 'balance'>): Promise<Account> {
        const response = await fetch(`${this.baseUrl}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(account),
        });
        if (!response.ok) throw new Error('Error creando cuenta');
        return response.json();
    }

    async updateAccount(id: string, updates: Partial<Account>): Promise<Account | null> {
        const response = await fetch(`${this.baseUrl}/accounts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (response.status === 404) return null;
        if (!response.ok) throw new Error('Error actualizando cuenta');
        return response.json();
    }

    async deleteAccount(id: string): Promise<boolean> {
        const response = await fetch(`${this.baseUrl}/accounts/${id}`, {
            method: 'DELETE',
        });
        if (response.status === 404) return false;
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error eliminando cuenta');
        }
        return true;
    }

    // ==================== CATEGORÍAS ====================

    async getCategories(type: 'income' | 'expense'): Promise<string[]> {
        const response = await fetch(`${this.baseUrl}/categories?type=${type}`);
        if (!response.ok) throw new Error('Error obteniendo categorías');
        return response.json();
    }

    async addCategory(type: 'income' | 'expense', name: string): Promise<string> {
        const response = await fetch(`${this.baseUrl}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, name }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error creando categoría');
        }
        const data = await response.json();
        return data.category;
    }

    async updateCategory(type: 'income' | 'expense', oldName: string, newName: string): Promise<string> {
        const response = await fetch(`${this.baseUrl}/categories`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, oldName, newName }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error actualizando categoría');
        }
        const data = await response.json();
        return data.category;
    }

    async deleteCategory(type: 'income' | 'expense', name: string): Promise<boolean> {
        const response = await fetch(`${this.baseUrl}/categories`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, name }),
        });
        if (response.status === 404) return false;
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error eliminando categoría');
        }
        return true;
    }

    // ==================== RESUMEN Y ANÁLISIS ====================

    async getSummary(): Promise<FinancialSummary> {
        const response = await fetch(`${this.baseUrl}/summary`);
        if (!response.ok) throw new Error('Error obteniendo resumen');
        return response.json();
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
}

// Singleton instance
export const dataService = new DataService();
