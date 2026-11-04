<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="container">
        <h1>Criar conta</h1>

        <p>Cadastre-se para começar</p>

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
              placeholder="Mínimo de 6 caracteres"
            />
          </ion-item>

          <ion-item>
            <ion-input
              label="Confirmar senha"
              label-placement="stacked"
              type="password"
              v-model="confirmarSenha"
              placeholder="Digite a senha novamente"
            />
          </ion-item>
        </ion-list>

        <ion-button
          expand="block"
          @click="cadastrar"
          :disabled="carregando"
        >
          {{ carregando ? 'Cadastrando...' : 'Cadastrar' }}
        </ion-button>

        <ion-button
          expand="block"
          fill="clear"
          router-link="/login"
        >
          Voltar para o login
        </ion-button>

        <ion-text color="danger" v-if="mensagem">
          <p>{{ mensagem }}</p>
        </ion-text>

        <ion-text color="success" v-if="sucesso">
          <p>{{ sucesso }}</p>
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
const confirmarSenha = ref('')
const mensagem = ref('')
const sucesso = ref('')
const carregando = ref(false)

async function cadastrar() {
  mensagem.value = ''
  sucesso.value = ''

  if (!email.value || !senha.value || !confirmarSenha.value) {
    mensagem.value = 'Preencha todos os campos.'
    return
  }

  if (senha.value.length < 6) {
    mensagem.value = 'A senha deve ter pelo menos 6 caracteres.'
    return
  }

  if (senha.value !== confirmarSenha.value) {
    mensagem.value = 'As senhas não são iguais.'
    return
  }

  carregando.value = true

  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: senha.value
  })

  carregando.value = false

  if (error) {
    mensagem.value = error.message
    return
  }

  sucesso.value =
    'Cadastro realizado. Verifique seu e-mail ou volte para fazer login.'

  setTimeout(() => {
    router.push('/login')
  }, 2500)
}
</script>

<style scoped>
.container {
  max-width: 500px;
  margin: 60px auto;
  text-align: center;
}
</style>
