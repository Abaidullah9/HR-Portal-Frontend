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
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.accessor)}
                className="px-6 py-4 text-left text-sm font-semibold text-foreground/80"
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
              className={cn(
                'group transition-colors duration-150',
                'border-b edge last:border-0',
                'hover:bg-white/40 dark:hover:bg-white/5',
                rowIndex % 2 === 1 && 'bg-white/[0.12] dark:bg-white/[0.02]',
              )}
            >
              {columns.map((column) => {
                const value = row[column.accessor]
                return (
                  <td
                    key={String(column.accessor)}
                    className={cn('px-6 py-4 text-sm text-foreground', column.className)}
                  >
                    {column.render ? column.render(value, row) : value}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
