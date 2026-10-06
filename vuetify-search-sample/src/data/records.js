export const categories = ['申請', '契約', '問い合わせ']
export const statuses = ['未対応', '対応中', '完了']

const titles = [
  '利用権限の変更', '保守契約の更新', '接続設定の確認', '機器購入の申請',
  '業務委託契約', '操作方法の問い合わせ', 'アカウント追加', 'ライセンス契約',
  '帳票出力の確認', '設備利用の申請',
]
const owners = ['田中', '佐藤', '鈴木', '高橋', '山本']

// 架空のデータ。実データや個人情報は含みません。
export const records = Array.from({ length: 36 }, (_, index) => ({
  id: `REC-${String(index + 1).padStart(4, '0')}`,
  title: `${titles[index % titles.length]} ${Math.floor(index / titles.length) + 1}`,
  category: categories[index % categories.length],
  owner: owners[index % owners.length],
  status: statuses[Math.floor(index / 3) % statuses.length],
  registeredAt: `2026-09-${String((index % 28) + 1).padStart(2, '0')}`,
}))
