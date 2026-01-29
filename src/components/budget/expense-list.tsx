'use client'

import { format, parseISO } from 'date-fns'
import {
  MoreVertical,
  Edit,
  Trash2,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  MoreHorizontal,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Expense } from '@/types/database'
import { CATEGORY_COLORS } from './budget-chart'

interface ExpenseListProps {
  expenses: Expense[]
  currency: string
  onEdit?: (expense: Expense) => void
  onDelete?: (expense: Expense) => void
}

const PAYMENT_ICONS: Record<string, typeof CreditCard> = {
  cash: Banknote,
  credit_card: CreditCard,
  debit_card: CreditCard,
  bank_transfer: Building2,
  mobile_payment: Smartphone,
  other: MoreHorizontal,
}

const CATEGORY_LABELS: Record<string, string> = {
  accommodation: 'Accommodation',
  transport: 'Transportation',
  food: 'Food & Dining',
  activities: 'Activities',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  other: 'Other',
}

export function ExpenseList({
  expenses,
  currency,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No expenses yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Start tracking your spending by adding an expense
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group expenses by date
  const expensesByDate = expenses.reduce((acc, expense) => {
    const date = expense.date || 'No date'
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(expense)
    return acc
  }, {} as Record<string, Expense[]>)

  // Sort dates in descending order
  const sortedDates = Object.keys(expensesByDate).sort((a, b) => {
    if (a === 'No date') return 1
    if (b === 'No date') return -1
    return new Date(b).getTime() - new Date(a).getTime()
  })

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => {
        const dateExpenses = expensesByDate[date]
        const dateTotal = dateExpenses.reduce((sum, exp) => sum + exp.amount, 0)

        return (
          <div key={date} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                {date === 'No date'
                  ? 'No date'
                  : format(parseISO(date), 'EEEE, MMMM d, yyyy')}
              </h3>
              <span className="text-sm text-muted-foreground">
                {currency} {dateTotal.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2">
              {dateExpenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  currency={currency}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface ExpenseItemProps {
  expense: Expense
  currency: string
  onEdit?: (expense: Expense) => void
  onDelete?: (expense: Expense) => void
}

function ExpenseItem({ expense, currency, onEdit, onDelete }: ExpenseItemProps) {
  const PaymentIcon = expense.payment_method
    ? PAYMENT_ICONS[expense.payment_method] || PAYMENT_ICONS.other
    : Receipt

  const categoryColor =
    CATEGORY_COLORS[expense.category.toLowerCase()] || CATEGORY_COLORS.other

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Category indicator */}
          <div
            className="h-10 w-1 rounded-full"
            style={{ backgroundColor: categoryColor }}
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium truncate">{expense.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {CATEGORY_LABELS[expense.category] || expense.category}
                  </Badge>
                  {expense.payment_method && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <PaymentIcon className="h-3 w-3" />
                      {expense.payment_method.replace('_', ' ')}
                    </span>
                  )}
                  {expense.is_reimbursable && (
                    <Badge variant="outline" className="text-xs">
                      Reimbursable
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold whitespace-nowrap">
                  {currency} {expense.amount.toFixed(2)}
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(expense)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(expense)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {expense.notes && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {expense.notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
