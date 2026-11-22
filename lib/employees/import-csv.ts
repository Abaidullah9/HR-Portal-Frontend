import type { ImportRow } from '@/lib/api/profile'

export const IMPORT_HEADER = 'name,email,department,position,joiningDate,salary,managerEmail'

/**
 * Parses a small CSV without a dependency. Quoted fields with commas are
 * handled; anything else that goes wrong is reported per row by the API.
 */
export function parseCsv(text: string): { rows: ImportRow[]; error: string | null } {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length === 0) return { rows: [], error: 'Paste at least one row' }

  const split = (line: string) => {
    const cells: string[] = []
    let current = ''
    let quoted = false
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index]
      if (character === '"') {
        if (quoted && line[index + 1] === '"') {
          current += '"'
          index += 1
        } else {
          quoted = !quoted
        }
      } else if (character === ',' && !quoted) {
        cells.push(current.trim())
        current = ''
      } else {
        current += character
      }
    }
    cells.push(current.trim())
    return cells
  }

  const first = split(lines[0] ?? '').map((cell) => cell.toLowerCase())
  const hasHeader = first.includes('name') && first.includes('email')
  const body = hasHeader ? lines.slice(1) : lines

  if (body.length === 0) return { rows: [], error: 'The file has a header but no rows' }

  const rows = body.map((line) => {
    const cells = split(line)
    return {
      name: cells[0] ?? '',
      email: cells[1] ?? '',
      department: cells[2] ?? '',
      position: cells[3] ?? '',
      joiningDate: cells[4] ?? '',
      salary: cells[5] ?? '',
      managerEmail: cells[6] ?? '',
    }
  })

  return { rows, error: null }
}
