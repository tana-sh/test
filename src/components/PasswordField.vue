<script setup>
import { ref } from 'vue'

const password = ref('')
const showPassword = ref(false)
</script>

<template>
  <v-text-field
    v-model="password"
    label="パスワード"
    variant="outlined"
    autocomplete="current-password"
    :type="showPassword ? 'text' : 'password'"
    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
    @click:append-inner="showPassword = !showPassword"
  />
</template>
