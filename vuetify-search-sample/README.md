# Vuetify 3.8.2 検索画面

上部に検索条件、下部に `v-data-table` の検索結果を配置したVue 3のサンプルです。
検索条件はHTMLの `fieldset` で囲み、枠線上に `legend` の「検索条件」を表示します。
枠内の入力部品はVuetifyの `v-text-field` と `v-select` を使用しています。
Vuetifyは **3.8.2** に固定しています。36件の架空データで動作し、バックエンドは不要です。

## 起動

Node.js 22.12以上を用意し、このフォルダ内で実行してください。

```sh
npm ci
npm run dev
```

PC: `http://localhost:5173`。同じWi-FiのiPhoneは `http://PCのLAN内IP:5173` から開けます。
必要に応じてPCのファイアウォールでTCP 5173を許可してください。

```sh
npm test
npm run build
```

## 画面と動作

- キーワード：管理番号・件名・担当者の部分一致。全角英数字と大文字小文字を正規化。
- 区分・ステータス：選択した値で絞り込み。
- 登録日：開始日と終了日を含む範囲検索。片側だけの指定も可能。
- 複数の検索条件はANDで適用。
- 「検索」またはキーワード入力中のEnterで検索。入力変更だけでは結果は変わりません。
- 初回表示時は全件表示。「条件クリア」で条件を初期化して全件表示。
- 検索後は1ページ目に戻ります。列の並べ替え、10/20/50件表示、ページ切り替えはVuetify標準機能。
- 条件エラー、取得失敗、0件時のメッセージを表示。
- テーブルは固定ヘッダー・高さ420px。狭い端末ではテーブル部分を横スクロールできます。

## 主なファイル

|ファイル|用途|
|---|---|
|`src/components/SearchPage.vue`|検索条件・結果テーブル・画面状態|
|`src/services/search.js`|入力検証・絞り込み・検索データ取得|
|`src/data/records.js`|架空のサンプルデータ|
|`src/main.js`|Vuetify登録、日本語表示、テーマ、アイコン|

## C# APIへの接続

`src/services/search.js` の `searchRecords(criteria)` をAPI呼び出しに置き換えてください。
戻り値は `{ id, title, category, owner, status, registeredAt }` の配列です。
`registeredAt` は `YYYY-MM-DD` の文字列を使います。
現在は全件をブラウザに読み込んでからページ分割する構成です。
大量データでは `v-data-table-server` に切り替え、検索・並べ替え・ページ分割をサーバ側で行います。
画面の入力検証とは別に、API側でも入力検証とアクセス権確認を実施してください。

既存Vueアプリへ組み込む場合は `SearchPage.vue` と `services`・`data` を移し、
既存のVuetify設定にコンポーネント・日本語・MDIアイコン設定を合わせてください。

参考：https://vuetifyjs.com/en/components/data-tables/basics/
