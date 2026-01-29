'use client'

import { useState } from 'react'
import { Wallet, ChevronDown, ChevronUp, Plane, Hotel, Calendar, Utensils, Car, ShoppingBag, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'

interface Flight {
  id: string
  price: number | null
  currency: string
}

interface Accommodation {
  id: string
  total_price: number | null
  currency: string
}

interface ItineraryItem {
  id: string
  estimated_cost: number | null
}

interface Expense {
  id: string
  category: string
  amount: number
  currency: string
}

interface BudgetSectionProps {
  flights: Flight[]
  accommodations: Accommodation[]
  itineraryItems: ItineraryItem[]
  expenses: Expense[]
  totalBudget: number | null
  currency: string
  defaultExpanded?: boolean
}

interface BudgetCategory {
  key: string
  label: string
  icon: React.ElementType
  amount: number
  color: string
}

export function BudgetSection({
  flights,
  accommodations,
  itineraryItems,
  expenses,
  totalBudget,
  currency,
  defaultExpanded = false,
}: BudgetSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  // Calculate totals
  const flightsTotal = flights.reduce((sum, f) => sum + (f.price || 0), 0)
  const hotelsTotal = accommodations.reduce((sum, a) => sum + (a.total_price || 0), 0)
  const activitiesTotal = itineraryItems.reduce((sum, i) => sum + (i.estimated_cost || 0), 0)

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const cat = expense.category
    acc[cat] = (acc[cat] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)

  // Build budget categories
  const categories: BudgetCategory[] = [
    { key: 'flights', label: 'Flights', icon: Plane, amount: flightsTotal, color: 'bg-sky-500' },
    { key: 'hotels', label: 'Hotels', icon: Hotel, amount: hotelsTotal, color: 'bg-indigo-500' },
    { key: 'activities', label: 'Activities', icon: Calendar, amount: activitiesTotal + (expensesByCategory['activity'] || 0), color: 'bg-amber-500' },
    { key: 'food', label: 'Food & Dining', icon: Utensils, amount: expensesByCategory['food'] || 0, color: 'bg-green-500' },
    { key: 'transport', label: 'Transport', icon: Car, amount: expensesByCategory['transport'] || 0, color: 'bg-purple-500' },
    { key: 'shopping', label: 'Shopping', icon: ShoppingBag, amount: expensesByCategory['shopping'] || 0, color: 'bg-pink-500' },
    { key: 'other', label: 'Other', icon: MoreHorizontal, amount: expensesByCategory['other'] || 0, color: 'bg-gray-500' },
  ].filter(cat => cat.amount > 0) // Only show categories with amounts

  // Calculate total spent
  const totalSpent = categories.reduce((sum, cat) => sum + cat.amount, 0)
  const percentUsed = totalBudget ? Math.min((totalSpent / totalBudget) * 100, 100) : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getProgressColor = () => {
    if (percentUsed >= 100) return 'bg-red-500'
    if (percentUsed >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Budget</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(totalSpent)} spent
                    {totalBudget && ` of ${formatCurrency(totalBudget)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {totalBudget && (
                  <div className="hidden sm:flex items-center gap-2 min-w-[120px]">
                    <Progress value={percentUsed} className="h-2" />
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {Math.round(percentUsed)}%
                    </span>
                  </div>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Budget Progress */}
            {totalBudget && (
              <div className="mb-6 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Budget Progress</span>
                  <span className={`text-sm font-semibold ${percentUsed >= 100 ? 'text-red-500' : percentUsed >= 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {formatCurrency(totalBudget - totalSpent)} {percentUsed >= 100 ? 'over budget' : 'remaining'}
                  </span>
                </div>
                <div className="relative h-4 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 ${getProgressColor()} transition-all duration-300`}
                    style={{ width: `${Math.min(percentUsed, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Spent: {formatCurrency(totalSpent)}</span>
                  <span>Budget: {formatCurrency(totalBudget)}</span>
                </div>
              </div>
            )}

            {/* Category Breakdown */}
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto mb-4">
                  <Wallet className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No expenses recorded yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Costs from flights, hotels, and activities will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => {
                  const Icon = category.icon
                  const categoryPercent = totalSpent > 0 ? (category.amount / totalSpent) * 100 : 0

                  return (
                    <div key={category.key} className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${category.color}/10`}>
                        <Icon className={`w-4 h-4 ${category.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate">{category.label}</span>
                          <span className="text-sm font-semibold">{formatCurrency(category.amount)}</span>
                        </div>
                        <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`absolute inset-y-0 left-0 ${category.color} transition-all duration-300`}
                            style={{ width: `${categoryPercent}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {Math.round(categoryPercent)}%
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Total Summary */}
            {categories.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Estimated Cost</span>
                  <span className="text-lg font-bold">{formatCurrency(totalSpent)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
