import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { ja } from 'vuetify/locale'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import {
  VAlert, VApp, VBtn, VCard, VCardText, VChip, VCol, VContainer,
  VDataTable, VDivider, VForm, VIcon, VMain, VRow, VSelect, VTextField,
} from 'vuetify/components'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import './styles.css'
import App from './App.vue'

const vuetify = createVuetify({
  components: {
    VAlert, VApp, VBtn, VCard, VCardText, VChip, VCol, VContainer,
    VDataTable, VDivider, VForm, VIcon, VMain, VRow, VSelect, VTextField,
  },
  locale: { locale: 'ja', fallback: 'ja', messages: { ja } },
  icons: { defaultSet: 'mdi', aliases, sets: { mdi } },
  theme: {
    defaultTheme: 'business',
    themes: {
      business: {
        dark: false,
        colors: {
          primary: '#174B86', secondary: '#16756A', background: '#F3F6FA',
          surface: '#FFFFFF', error: '#BA2636', success: '#16756A',
        },
      },
    },
  },
  defaults: {
    VTextField: { variant: 'outlined', density: 'compact', hideDetails: 'auto' },
    VSelect: { variant: 'outlined', density: 'compact', hideDetails: 'auto' },
    VBtn: { rounded: 'lg' },
  },
})

createApp(App).use(vuetify).mount('#app')
