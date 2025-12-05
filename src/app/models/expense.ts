export interface Expense {
    id: number;
    name: string;
    description?: string;
    amount: number;
    category: string;
    date: Date;
    recurring?: boolean;
    dueDate?: Date; // due date is null for one-time expenses
    recurrenceIntervalMonths?: number; // default = 1
    recurrenceIntervalDays?: number; // default = 30
    recurrenceIntervalYears?: number; // default = 1
    numOccurrences?: number; // total number of occurrences (no numOccurrences = infinite)
    endDate?: Date; // date to stop recurrence
    remindBeforeDays?: number; // notify X days before due date
    status?: 'paid' | 'unpaid' | 'overdue';
}