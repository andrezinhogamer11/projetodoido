<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard Financeiro</ion-title>

        <ion-buttons slot="end">
          <ion-button @click="sair">
            Sair
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-button expand="block" router-link="/lancamentos">
        Gerenciar lançamentos
      </ion-button>

      <ion-grid>
        <ion-row>
          <ion-col size="12" size-md="4">
            <ion-card color="success">
              <ion-card-header>
                <ion-card-title>Total de receitas</ion-card-title>
              </ion-card-header>

              <ion-card-content>
                <h2>{{ formatarValor(totalReceitas) }}</h2>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="4">
            <ion-card color="danger">
              <ion-card-header>
                <ion-card-title>Total de despesas</ion-card-title>
              </ion-card-header>

              <ion-card-content>
                <h2>{{ formatarValor(totalDespesas) }}</h2>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="4">
            <ion-card color="primary">
              <ion-card-header>
                <ion-card-title>Saldo atual</ion-card-title>
              </ion-card-header>

              <ion-card-content>
                <h2>{{ formatarValor(saldo) }}</h2>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Indicadores</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <p>
            <strong>Maior categoria de gasto:</strong>
            {{ maiorCategoria }}
          </p>

          <p>
            <strong>Quantidade de lançamentos:</strong>
            {{ quantidadeLancamentos }}
          </p>

          <p>
            <strong>Despesas em relação às receitas:</strong>
            {{ percentualDespesas.toFixed(2) }}%
          </p>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Despesas por categoria</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <apexchart
            v-if="pizzaSeries.length > 0"
            type="pie"
            height="300"
            :options="pizzaOptions"
            :series="pizzaSeries"
          />

          <p v-else>Nenhuma despesa cadastrada.</p>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Receitas e despesas por mês</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <apexchart
            type="bar"
            height="350"
            :options="barOptions"
            :series="barSeries"
          />
        </ion-card-content>
      </ion-card>

      <ion-text color="danger" v-if="mensagem">
        <p>{{ mensagem }}</p>
      </ion-text>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import VueApexCharts from 'vue3-apexcharts'

import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonPage,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
  onIonViewWillEnter
} from '@ionic/vue'

import { supabase } from '../lib/supabase'

const router = useRouter()

const receitas = ref<any[]>([])
const despesas = ref<any[]>([])
const mensagem = ref('')

const totalReceitas = computed(() => {
  return receitas.value.reduce(
    (total, item) => total + Number(item.valor),
    0
  )
})

const totalDespesas = computed(() => {
  return despesas.value.reduce(
    (total, item) => total + Number(item.valor),
    0
  )
})

const saldo = computed(() => {
  return totalReceitas.value - totalDespesas.value
})

const quantidadeLancamentos = computed(() => {
  return receitas.value.length + despesas.value.length
})

const percentualDespesas = computed(() => {
  if (totalReceitas.value === 0) {
    return 0
  }

  return (totalDespesas.value / totalReceitas.value) * 100
})

const gastosPorCategoria = computed(() => {
  const resultado: Record<string, number> = {}

  despesas.value.forEach((despesa) => {
    if (!resultado[despesa.categoria]) {
      resultado[despesa.categoria] = 0
    }

    resultado[despesa.categoria] += Number(despesa.valor)
  })

  return resultado
})

const maiorCategoria = computed(() => {
  const categorias = Object.entries(gastosPorCategoria.value)

  if (categorias.length === 0) {
    return 'Nenhuma'
  }

  categorias.sort((a, b) => b[1] - a[1])

  return categorias[0][0]
})

const pizzaSeries = computed(() => {
  return Object.values(gastosPorCategoria.value)
})

const pizzaOptions = computed(() => {
  return {
    labels: Object.keys(gastosPorCategoria.value),
    legend: {
      position: 'bottom' as const
    }
  }
})

const meses = computed(() => {
  const lista: string[] = []
  const hoje = new Date()

  for (let i = 5; i >= 0; i--) {
    const data = new Date(
      hoje.getFullYear(),
      hoje.getMonth() - i,
      1
    )

    const ano = data.getFullYear()
    const mes = String(data.getMonth() + 1).padStart(2, '0')

    lista.push(`${ano}-${mes}`)
  }

  return lista
})

function valorPorMes(lista: any[], mes: string) {
  return lista
    .filter((item) => item.data.startsWith(mes))
    .reduce((total, item) => total + Number(item.valor), 0)
}

const barSeries = computed(() => {
  return [
    {
      name: 'Receitas',
      data: meses.value.map((mes) => {
        return valorPorMes(receitas.value, mes)
      })
    },
    {
      name: 'Despesas',
      data: meses.value.map((mes) => {
        return valorPorMes(despesas.value, mes)
      })
    }
  ]
})

const barOptions = computed(() => {
  return {
    chart: {
      toolbar: {
        show: false
      }
    },
    xaxis: {
      categories: meses.value.map((mes) => {
        const partes = mes.split('-')
        return `${partes[1]}/${partes[0]}`
      })
    },
    colors: ['#2dd36f', '#eb445a'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%'
      }
    }
  }
})

function formatarValor(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

async function carregarDados() {
  mensagem.value = ''

  const { data: usuarioData } = await supabase.auth.getUser()

  if (!usuarioData.user) {
    router.push('/login')
    return
  }

  const [respostaReceitas, respostaDespesas] = await Promise.all([
    supabase
      .from('receitas')
      .select('*')
      .eq('user_id', usuarioData.user.id),

    supabase
      .from('despesas')
      .select('*')
      .eq('user_id', usuarioData.user.id)
  ])

  if (respostaReceitas.error) {
    mensagem.value = respostaReceitas.error.message
    return
  }

  if (respostaDespesas.error) {
    mensagem.value = respostaDespesas.error.message
    return
  }

  receitas.value = respostaReceitas.data || []
  despesas.value = respostaDespesas.data || []
}

async function sair() {
  await supabase.auth.signOut()
  router.push('/login')
}

onIonViewWillEnter(() => {
  carregarDados()
})
</script>

<script lang="ts">
export default {
  components: {
    apexchart: VueApexCharts
  }
}
</script>
