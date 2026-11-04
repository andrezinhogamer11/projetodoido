<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="container">
        <h1>Minhas Finanças</h1>

        <p>Entre para controlar suas finanças</p>

        <ion-list>
          <ion-item>
            <ion-input
              label="E-mail"
              label-placement="stacked"
              type="email"
              v-model="email"
              placeholder="Digite seu e-mail"
            />
          </ion-item>

          <ion-item>
            <ion-input
              label="Senha"
              label-placement="stacked"
              type="password"
              v-model="senha"
              placeholder="Digite sua senha"
            />
          </ion-item>
        </ion-list>

        <ion-button
          expand="block"
          @click="entrar"
          :disabled="carregando"
        >
          {{ carregando ? 'Entrando...' : 'Entrar' }}
        </ion-button>

        <ion-button
          expand="block"
          fill="clear"
          router-link="/cadastro"
        >
          Criar uma conta
        </ion-button>

        <ion-text color="danger" v-if="mensagem">
          <p>{{ mensagem }}</p>
        </ion-text>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonText
} from '@ionic/vue'

import { supabase } from '../lib/supabase'

const router = useRouter()

const email = ref('')
const senha = ref('')
const mensagem = ref('')
const carregando = ref(false)

async function entrar() {
  mensagem.value = ''

  if (!email.value || !senha.value) {
    mensagem.value = 'Preencha o e-mail e a senha.'
    return
  }

  carregando.value = true

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: senha.value
  })

  carregando.value = false

  if (error) {
    mensagem.value = 'E-mail ou senha inválidos.'
    return
  }

  router.push('/dashboard')
}
</script>

<style scoped>
.container {
  max-width: 500px;
  margin: 60px auto;
  text-align: center;
}
</style>
