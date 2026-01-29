'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Plus, List, PieChart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BudgetChart, AddExpenseForm, ExpenseList } from '@/components/budget'
import { createClient, createUntypedClient } from '@/lib/supabase/client'
import type { Expense } from '@/types/database'

export default function BudgetPage() {
  const params = useParams()
  const tripId = params.tripId as string
  const supabase = createClient()

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [trip, setTrip] = useState<{
    total_budget: number | null
    currency: string
  } | null>(null)

  // Fetch trip and expenses
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch trip details
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('total_budget, currency')
          .eq('id', tripId)
          .single()

        if (tripError) throw tripError
        setTrip(tripData)

        // Fetch expenses
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .eq('trip_id', tripId)
          .order('date', { ascending: false })

        if (expensesError) throw expensesError
        setExpenses(expensesData || [])
      } catch (error) {
        console.error('Error fetching budget:', error)
        toast.error('Failed to load budget data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [tripId, supabase])

  const totalBudget = trip?.total_budget || undefined
  const currency = trip?.currency || 'USD'

  // Calculate totals
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  // Group expenses by category for chart
  const expensesByCategory = expenses.reduce((acc, exp) => {
    const existing = acc.find((e) => e.category.toLowerCase() === exp.category.toLowerCase())
    if (existing) {
      existing.amount += exp.amount
    } else {
      acc.push({
        category: exp.category.charAt(0).toUpperCase() + exp.category.slice(1),
        amount: exp.amount,
        color: '',
      })
    }
    return acc
  }, [] as { category: string; amount: number; color: string }[])

  const handleAddExpense = async (data: {
    description: string
    amount: number
    category: string
    date: Date
    payment_method?: string
    is_reimbursable: boolean
    notes?: string
  }) => {
    setIsAdding(true)

    try {
      const newExpense = {
        trip_id: tripId,
        category: data.category,
        description: data.description,
        amount: data.amount,
        currency,
        amount_in_base_currency: data.amount,
        exchange_rate: 1,
        date: data.date.toISOString().split('T')[0],
        payment_method: data.payment_method || null,
        is_reimbursable: data.is_reimbursable,
        is_shared: false,
        notes: data.notes || null,
      }

      const untypedSupabase = createUntypedClient()
      const { data: insertedExpense, error } = await untypedSupabase
        .from('expenses')
        .insert(newExpense)
        .select()
        .single()

      if (error) throw error

      setExpenses([insertedExpense as Expense, ...expenses])
      setIsAddDialogOpen(false)
      toast.success('Expense added!')
    } catch (error) {
      console.error('Add expense error:', error)
      toast.error('Failed to add expense')
    } finally {
      setIsAdding(false)
    }
  }

  const handleEditExpense = (expense: Expense) => {
    // TODO: Implement edit dialog
    toast.info('Edit functionality coming soon')
  }

  const handleDeleteExpense = async (expense: Expense) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expense.id)

      if (error) throw error

      setExpenses(expenses.filter((e) => e.id !== expense.id))
      toast.success('Expense deleted')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete expense')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Budget</h2>
          <p className="text-sm text-muted-foreground">
            Track your expenses and stay on budget
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
              <DialogDescription>
                Track a new expense for this trip
              </DialogDescription>
            </DialogHeader>
            <AddExpenseForm
              onSubmit={handleAddExpense}
              isLoading={isAdding}
              currency={currency}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <PieChart className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <List className="mr-2 h-4 w-4" />
            All Expenses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <BudgetChart
            expenses={expensesByCategory}
            totalBudget={totalBudget}
            totalSpent={totalSpent}
            currency={currency}
          />
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>All Expenses</CardTitle>
              <CardDescription>
                {expenses.length} expense{expenses.length !== 1 ? 's' : ''} totaling {currency} {totalSpent.toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseList
                expenses={expenses}
                currency={currency}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
