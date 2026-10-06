import { records } from '../data/records.js'

export function emptyCriteria() {
  return { keyword: '', category: null, status: null, dateFrom: '', dateTo: '' }
}

function normalize(value) {
  return String(value ?? '').normalize('NFKC').toLocaleLowerCase('ja-JP').trim()
}

function isDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function validateCriteria(criteria) {
  if (criteria.dateFrom && !isDate(criteria.dateFrom)) return '登録日（開始）を正しい日付で入力してください。'
  if (criteria.dateTo && !isDate(criteria.dateTo)) return '登録日（終了）を正しい日付で入力してください。'
  if (criteria.dateFrom && criteria.dateTo && criteria.dateFrom > criteria.dateTo) {
    return '登録日（開始）は登録日（終了）以前の日付を指定してください。'
  }
  return ''
}

export function filterRecords(items, criteria) {
  const error = validateCriteria(criteria)
  if (error) throw new Error(error)
  const keyword = normalize(criteria.keyword)
  return items.filter(item => {
    const matchesKeyword = !keyword || [item.id, item.title, item.owner].some(value => normalize(value).includes(keyword))
    return matchesKeyword &&
      (!criteria.category || item.category === criteria.category) &&
      (!criteria.status || item.status === criteria.status) &&
      (!criteria.dateFrom || item.registeredAt >= criteria.dateFrom) &&
      (!criteria.dateTo || item.registeredAt <= criteria.dateTo)
  })
}

// C# APIとの接続時は、この関数をfetch等によるAPI呼び出しに置き換えます。
export async function searchRecords(criteria) {
  return filterRecords(records, criteria).map(item => ({ ...item }))
}
