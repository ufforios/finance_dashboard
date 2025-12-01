// Data Types
export const INCOME_CATEGORIES = [
    'Ingresos Operativos',
    'Otros Ingresos',
    'Intereses Ganados'
];

export const EXPENSE_CATEGORIES = [
    'Gastos Laborales',
    'Movilidad',
    'Consumición',
    'Gastos en Dpto.',
    'Aporte Familiar'
];

export const ACCOUNT_TYPES = {
    CASH: 'Efectivo',
    BANK: 'Caja de Ahorro',
    CREDIT_CARD: 'Tarjeta de Crédito'
};

export const ACCOUNTS = {
    cash: { name: 'Efectivo', type: ACCOUNT_TYPES.CASH },
    itau: { name: 'Itau', type: ACCOUNT_TYPES.BANK },
    uevoV: { name: 'UevoV', type: ACCOUNT_TYPES.BANK },
    ueno: { name: 'Ueno', type: ACCOUNT_TYPES.BANK },
    eko: { name: 'Eko', type: ACCOUNT_TYPES.BANK },
    itauPuntos: { name: 'ItauPuntos', type: ACCOUNT_TYPES.CREDIT_CARD },
    itauClasica: { name: 'ItauClasica', type: ACCOUNT_TYPES.CREDIT_CARD }
};

export const TRANSACTION_TYPES = {
    INCOME: 'income',
    EXPENSE: 'expense',
    TRANSFER: 'transfer'
};

// TypeScript Interfaces
export interface Transaction {
    id: string;
    date: string;
    type: 'income' | 'expense' | 'transfer';
    category: string;
    account: string;
    amount: number;
    detail?: string;
    toAccount?: string; // For transfers
}

export interface Account {
    id: string;
    name: string;
    type: string;
    balance: number;
    initialBalance?: number;
    creditLimit?: number; // Para tarjetas de crédito
}

export interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
}

export interface FinancialSummary {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    cashBalance: number;
    bankBalance: number;
    creditCardDebt: number;
    accountBalances: Record<string, number>;
}
