'use client'

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ExpenseData {
  category: string
  amount: number
  color: string
}

interface BudgetChartProps {
  expenses: ExpenseData[]
  totalBudget?: number
  totalSpent: number
  currency: string
}

const CATEGORY_COLORS: Record<string, string> = {
  accommodation: '#6366f1', // indigo
  transport: '#22c55e', // green
  food: '#f97316', // orange
  activities: '#3b82f6', // blue
  shopping: '#ec4899', // pink
  entertainment: '#8b5cf6', // purple
  other: '#64748b', // slate
}

export function BudgetChart({
  expenses,
  totalBudget,
  totalSpent,
  currency,
}: BudgetChartProps) {
  // Add colors to expenses
  const dataWithColors = expenses.map((expense) => ({
    ...expense,
    color: CATEGORY_COLORS[expense.category.toLowerCase()] || CATEGORY_COLORS.other,
  }))

  const budgetRemaining = totalBudget ? totalBudget - totalSpent : 0
  const budgetPercentUsed = totalBudget ? (totalSpent / totalBudget) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Budget Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {totalBudget ? `${currency} ${totalBudget.toLocaleString()}` : 'Not set'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {currency} {totalSpent.toLocaleString()}
            </p>
            {totalBudget && (
              <p className="text-sm text-muted-foreground">
                {budgetPercentUsed.toFixed(1)}% of budget
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${budgetRemaining < 0 ? 'text-destructive' : ''}`}>
              {totalBudget
                ? `${currency} ${budgetRemaining.toLocaleString()}`
                : '-'}
            </p>
            {totalBudget && budgetRemaining < 0 && (
              <p className="text-sm text-destructive">Over budget!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="pie" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pie">By Category</TabsTrigger>
          <TabsTrigger value="bar">Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="pie">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {dataWithColors.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataWithColors}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="amount"
                        nameKey="category"
                      >
                        {dataWithColors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [
                          `${currency} ${Number(value ?? 0).toLocaleString()}`,
                          'Amount',
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No expenses recorded yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bar">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {dataWithColors.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dataWithColors}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={80} />
                      <Tooltip
                        formatter={(value) => [
                          `${currency} ${Number(value ?? 0).toLocaleString()}`,
                          'Amount',
                        ]}
                      />
                      <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                        {dataWithColors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No expenses recorded yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { CATEGORY_COLORS }
