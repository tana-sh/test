<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { categories, statuses } from '../data/records.js'
import { emptyCriteria, searchRecords, validateCriteria } from '../services/search.js'

const criteria = reactive(emptyCriteria())
const applied = ref(emptyCriteria())
const results = ref([])
const loading = ref(false)
const hasSearched = ref(false)
const error = ref('')
const page = ref(1)
const itemsPerPage = ref(10)
const sortBy = ref([{ key: 'registeredAt', order: 'desc' }])
let requestId = 0

const headers = [
  { title: '管理番号', key: 'id', width: 140 },
  { title: '件名', key: 'title', minWidth: 220 },
  { title: '区分', key: 'category', width: 130 },
  { title: '担当者', key: 'owner', width: 110 },
  { title: 'ステータス', key: 'status', width: 135 },
  { title: '登録日', key: 'registeredAt', width: 140 },
]
const statusColors = { '未対応': 'grey-darken-1', '対応中': 'primary', '完了': 'success' }
const changed = computed(() => JSON.stringify(criteria) !== JSON.stringify(applied.value))
const appliedLabels = computed(() => [
  applied.value.keyword && `キーワード：${applied.value.keyword}`,
  applied.value.category && `区分：${applied.value.category}`,
  applied.value.status && `ステータス：${applied.value.status}`,
  applied.value.dateFrom && `登録日：${applied.value.dateFrom} 以降`,
  applied.value.dateTo && `登録日：${applied.value.dateTo} 以前`,
].filter(Boolean))

async function search() {
  if (loading.value) return
  error.value = validateCriteria(criteria)
  if (error.value) return
  const currentRequest = ++requestId
  const snapshot = { ...criteria, keyword: (criteria.keyword ?? '').trim() }
  loading.value = true
  try {
    const items = await searchRecords(snapshot)
    if (currentRequest !== requestId) return
    results.value = items
    applied.value = snapshot
    page.value = 1
    hasSearched.value = true
  } catch {
    if (currentRequest === requestId) error.value = '検索に失敗しました。もう一度お試しください。'
  } finally {
    if (currentRequest === requestId) loading.value = false
  }
}

function clear() {
  Object.assign(criteria, emptyCriteria())
  search()
}

onMounted(search)
</script>

<template>
  <header class="page-header">
    <div class="header-content">
      <div class="d-flex align-center ga-3">
        <v-icon icon="mdi-database-search-outline" size="28" color="primary" />
        <div>
          <p class="eyebrow">業務データ</p>
          <h1>データ検索</h1>
        </div>
      </div>
      <v-chip size="small" variant="outlined" color="primary">サンプルデータ</v-chip>
    </div>
  </header>

  <v-container class="search-container">
    <v-card class="section-card mb-6" elevation="0" border rounded="lg">
      <div class="section-heading">
        <h2><v-icon icon="mdi-filter-outline" size="21" class="mr-2" />検索条件</h2>
        <p>条件を入力して「検索」を押してください。</p>
      </div>
      <v-divider />
      <v-card-text class="pa-5">
        <v-form @submit.prevent="search">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="criteria.keyword" label="キーワード" placeholder="管理番号・件名・担当者" prepend-inner-icon="mdi-magnify" clearable :disabled="loading" />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-select v-model="criteria.category" :items="categories" label="区分" placeholder="すべて" clearable :disabled="loading" />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-select v-model="criteria.status" :items="statuses" label="ステータス" placeholder="すべて" clearable :disabled="loading" />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-text-field v-model="criteria.dateFrom" label="登録日（開始）" type="date" clearable :disabled="loading" />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-text-field v-model="criteria.dateTo" label="登録日（終了）" type="date" clearable :disabled="loading" />
            </v-col>
            <v-col cols="12" md="6" class="form-actions">
              <v-btn type="button" variant="outlined" color="primary" prepend-icon="mdi-filter-remove-outline" :disabled="loading" @click="clear">条件クリア</v-btn>
              <v-btn type="submit" color="primary" prepend-icon="mdi-magnify" :loading="loading" min-width="130">検索</v-btn>
            </v-col>
          </v-row>
          <v-alert v-if="error" class="mt-4" type="error" variant="tonal" density="compact" role="alert">{{ error }}</v-alert>
        </v-form>
      </v-card-text>
    </v-card>

    <v-card class="section-card" elevation="0" border rounded="lg">
      <div class="section-heading results-heading">
        <h2><v-icon icon="mdi-table" size="21" class="mr-2" />検索結果</h2>
        <p role="status" aria-live="polite"><strong class="result-count">{{ results.length }}</strong> 件</p>
      </div>
      <v-divider />
      <div class="result-summary">
        <div class="d-flex flex-wrap ga-2">
          <v-chip v-for="label in appliedLabels" :key="label" size="small" variant="tonal" color="primary">{{ label }}</v-chip>
          <span v-if="!appliedLabels.length" class="text-medium-emphasis">すべてのデータ</span>
        </div>
        <p v-if="changed" class="pending-note" role="status">条件を変更しています。「検索」で結果に反映します。</p>
      </div>
      <v-data-table
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        v-model:sort-by="sortBy"
        :headers="headers"
        :items="results"
        :loading="loading"
        :items-per-page-options="[10, 20, 50]"
        item-value="id"
        density="comfortable"
        hover
        fixed-header
        height="420"
        loading-text="検索中です…"
        :no-data-text="hasSearched ? '条件に一致するデータはありません。検索条件を変更してください。' : '検索すると結果が表示されます。'"
        class="results-table"
      >
        <template #item.id="{ value }"><span class="record-id">{{ value }}</span></template>
        <template #item.status="{ value }"><v-chip :color="statusColors[value]" variant="tonal" size="small">{{ value }}</v-chip></template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
