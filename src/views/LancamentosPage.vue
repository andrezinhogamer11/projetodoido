<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Lançamentos</ion-title>

        <ion-buttons slot="end">
          <ion-button @click="voltar">
            Voltar
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-segment
        v-model="tipo"
        @ionChange="carregarLancamentos"
      >
        <ion-segment-button value="receita">
          <ion-label>Receitas</ion-label>
        </ion-segment-button>

        <ion-segment-button value="despesa">
          <ion-label>Despesas</ion-label>
        </ion-segment-button>
      </ion-segment>

      <ion-card>
        <ion-card-header>
          <ion-card-title>
            {{ editandoId ? 'Editar lançamento' : 'Novo lançamento' }}
          </ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <ion-item>
            <ion-input
              label="Descrição"
              label-placement="stacked"
              v-model="formulario.descricao"
              placeholder="Exemplo: Salário"
            />
          </ion-item>

          <ion-item>
            <ion-input
              label="Valor"
              label-placement="stacked"
              type="number"
              v-model="formulario.valor"
              placeholder="Exemplo: 1500"
            />
          </ion-item>

          <ion-item>
            <ion-select
              label="Categoria"
              label-placement="stacked"
              v-model="formulario.categoria"
              placeholder="Selecione uma categoria"
            >
              <ion-select-option
                v-for="categoria in categorias"
                :key="categoria"
                :value="categoria"
              >
                {{ categoria }}
              </ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-input
              label="Data"
              label-placement="stacked"
              type="date"
              v-model="formulario.data"
            />
          </ion-item>

          <ion-button expand="block" @click="salvar">
            {{ editandoId ? 'Atualizar' : 'Salvar' }}
          </ion-button>

          <ion-button
            v-if="editandoId"
            expand="block"
            fill="outline"
            color="medium"
            @click="limparFormulario"
          >
            Cancelar edição
          </ion-button>
        </ion-card-content>
      </ion-card>

      <ion-text color="danger" v-if="mensagem">
        <p>{{ mensagem }}</p>
      </ion-text>

      <ion-list>
        <ion-list-header>
          <ion-label>
            {{ tipo === 'receita' ? 'Minhas receitas' : 'Minhas despesas' }}
          </ion-label>
        </ion-list-header>

        <ion-item v-for="item in lancamentos" :key="item.id">
          <ion-label>
            <h2>{{ item.descricao }}</h2>
            <p>
              {{ item.categoria }} -
              {{ formatarData(item.data) }}
            </p>
            <strong>{{ formatarValor(item.valor) }}</strong>
          </ion-label>

          <ion-button
            slot="end"
            size="small"
            fill="clear"
            @click="editar(item)"
          >
            Editar
          </ion-button>

          <ion-button
            slot="end"
            size="small"
            color="danger"
            fill="clear"
            @click="excluir(item.id)"
          >
            Excluir
          </ion-button>
        </ion-item>
      </ion-list>

      <p v-if="lancamentos.length === 0">
        Nenhum lançamento cadastrado.
      </p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonText,
  IonList,
  IonListHeader
} from '@ionic/vue'

import { supabase } from '../lib/supabase'

interface Lancamento {
  id: string
  descricao: string
  valor: number
  categoria: string
  data: string
}

const router = useRouter()

const tipo = ref<'receita' | 'despesa'>('receita')
const lancamentos = ref<Lancamento[]>([])
const editandoId = ref<string | null>(null)
const mensagem = ref('')

const formulario = ref({
  descricao: '',
  valor: '',
  categoria: '',
  data: new Date().toISOString().substring(0, 10)
})

const categoriasReceitas = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Outros'
]

const categoriasDespesas = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Educação',
  'Lazer',
  'Saúde',
  'Outros'
]

const categorias = computed(() => {
  if (tipo.value === 'receita') {
    return categoriasReceitas
  }

  return categoriasDespesas
})

const tabela = computed(() => {
  if (tipo.value === 'receita') {
    return 'receitas'
  }

  return 'despesas'
})

function formatarValor(valor: number) {
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

function formatarData(data: string) {
  return new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR')
}

async function carregarLancamentos() {
  mensagem.value = ''

  const { data: usuarioData } = await supabase.auth.getUser()

  if (!usuarioData.user) {
    router.push('/login')
    return
  }

  const { data, error } = await supabase
    .from(tabela.value)
    .select('*')
    .eq('user_id', usuarioData.user.id)
    .order('data', { ascending: false })

  if (error) {
    mensagem.value = error.message
    return
  }

  lancamentos.value = data || []
}

async function salvar() {
  mensagem.value = ''

  if (
    !formulario.value.descricao ||
    !formulario.value.valor ||
    !formulario.value.categoria ||
    !formulario.value.data
  ) {
    mensagem.value = 'Preencha todos os campos.'
    return
  }

  const valorNumerico = Number(formulario.value.valor)

  if (valorNumerico <= 0) {
    mensagem.value = 'O valor deve ser maior que zero.'
    return
  }

  const { data: usuarioData } = await supabase.auth.getUser()

  if (!usuarioData.user) {
    mensagem.value = 'Usuário não encontrado.'
    return
  }

  const dados = {
    descricao: formulario.value.descricao,
    valor: valorNumerico,
    categoria: formulario.value.categoria,
    data: formulario.value.data,
    user_id: usuarioData.user.id
  }

  let error

  if (editandoId.value) {
    const resposta = await supabase
      .from(tabela.value)
      .update(dados)
      .eq('id', editandoId.value)

    error = resposta.error
  } else {
    const resposta = await supabase
      .from(tabela.value)
      .insert(dados)

    error = resposta.error
  }

  if (error) {
    mensagem.value = error.message
    return
  }

  limparFormulario()
  await carregarLancamentos()
}

function editar(item: Lancamento) {
  editandoId.value = item.id

  formulario.value = {
    descricao: item.descricao,
    valor: String(item.valor),
    categoria: item.categoria,
    data: item.data
  }
}

async function excluir(id: string) {
  const confirmou = window.confirm(
    'Tem certeza que deseja excluir este lançamento?'
  )

  if (!confirmou) {
    return
  }

  const { error } = await supabase
    .from(tabela.value)
    .delete()
    .eq('id', id)

  if (error) {
    mensagem.value = error.message
    return
  }

  await carregarLancamentos()
}

function limparFormulario() {
  editandoId.value = null

  formulario.value = {
    descricao: '',
    valor: '',
    categoria: '',
    data: new Date().toISOString().substring(0, 10)
  }
}

function voltar() {
  router.push('/dashboard')
}

onMounted(() => {
  carregarLancamentos()
})
</script>
