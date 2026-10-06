import test from 'node:test'
import assert from 'node:assert/strict'
import { records } from '../src/data/records.js'
import { emptyCriteria, filterRecords, validateCriteria } from '../src/services/search.js'

test('blank conditions include all data; keyword matches ID, title and owner', () => {
  assert.equal(filterRecords(records, emptyCriteria()).length, 36)
  assert.equal(filterRecords(records, { ...emptyCriteria(), keyword: 'ｒｅｃ－０００１' })[0].id, 'REC-0001')
  assert.ok(filterRecords(records, { ...emptyCriteria(), keyword: '田中' }).every(item => item.owner === '田中'))
})

test('conditions use AND, and date endpoints are inclusive', () => {
  const criteria = { ...emptyCriteria(), category: '申請', status: '未対応', dateFrom: '2026-09-01', dateTo: '2026-09-01' }
  assert.deepEqual(filterRecords(records, criteria).map(item => item.id), ['REC-0001'])
  assert.equal(filterRecords(records, { ...emptyCriteria(), keyword: '存在しない件名' }).length, 0)
})

test('reject reversed or nonexistent dates, with clearable null inputs accepted', () => {
  assert.ok(validateCriteria({ ...emptyCriteria(), dateFrom: '2026-09-30', dateTo: '2026-09-01' }))
  assert.ok(validateCriteria({ ...emptyCriteria(), dateFrom: '2026-02-30' }))
  assert.equal(filterRecords(records, { keyword: null, category: null, status: null, dateFrom: null, dateTo: null }).length, 36)
})
