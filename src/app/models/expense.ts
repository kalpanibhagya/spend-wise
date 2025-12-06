export interface Expense {
    id: number;
    name: string;
    description?: string;
    amount: number;
    category: string;
    date: Date;
    recurring?: boolean;
    dueDate?: Date; 
    numOccurrences?: number; // total number of occurrences (no numOccurrences = infinite)
    endDate?: Date; // date to stop recurrence
    remindBeforeDays?: number; // notify X days before due date
    status?: 'paid' | 'unpaid' | 'overdue';
}