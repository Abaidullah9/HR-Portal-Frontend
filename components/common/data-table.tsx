import { cn } from '@/lib/utils'

interface ColumnDef<T> {
  header: string
  accessor: keyof T
  render?: (value: any, row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th
                key={String(column.accessor)}
                className="px-6 py-3 text-left text-sm font-semibold text-foreground"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-border hover:bg-muted/50 transition-colors"
            >
              {columns.map((column) => {
                const value = row[column.accessor]
                return (
                  <td
                    key={String(column.accessor)}
                    className={cn(
                      'px-6 py-4 text-sm text-foreground',
                      column.className
                    )}
                  >
                    {column.render ? column.render(value, row) : value}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  )
}
