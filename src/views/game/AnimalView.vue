<template>
  <div>
    <h3 class="text-accent text-sm mb-3">
      <Home :size="14" class="inline" />
      畜棚
    </h3>

    <!-- 宠物区域 -->
    <div class="mb-4 border border-accent/20 rounded-xs p-3">
      <p class="text-xs text-muted mb-2">宠物</p>
      <template v-if="animalStore.pet">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs text-accent">{{ animalStore.pet.type === 'cat' ? '猫' : '狗' }} — {{ animalStore.pet.name }}</span>
          <button class="btn text-xs py-0 px-1" :disabled="animalStore.pet.wasPetted" @click="handlePetThePet">
            <Hand :size="14" />
            {{ animalStore.pet.wasPetted ? '已摸' : '抚摸' }}
          </button>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-[10px] text-muted w-6">好感</span>
          <div class="flex-1 h-1.5 bg-bg rounded-xs border border-accent/10">
            <div
              class="h-full rounded-xs bg-danger transition-all"
              :style="{ width: Math.floor(animalStore.pet.friendship / 10) + '%' }"
            />
          </div>
          <span class="text-[10px] text-muted">{{ animalStore.pet.friendship }}/1000</span>
        </div>
        <p v-if="animalStore.pet.friendship >= 800" class="text-xs text-success mt-1">好感度很高，每天有机会叼回采集物！</p>
      </template>
      <div v-else class="flex flex-col items-center justify-center py-6 text-muted">
        <Home :size="32" class="mb-2" />
        <p class="text-xs">暂无宠物</p>
        <p class="text-[10px] mt-1">入住后第7天会有小动物来访。</p>
      </div>
    </div>

    <!-- 畜舍列表 (鸡舍和牲口棚) -->
    <div v-for="bDef in mainBuildings" :key="bDef.type" class="mb-4 border border-accent/20 rounded-xs p-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-accent">{{ getBuildingDisplayName(bDef.type) }}</span>
        <div v-if="isBuildingBuilt(bDef.type)" class="flex items-center gap-2">
          <span class="text-xs text-muted">{{ getAnimalsInBuilding(bDef.type).length }}/{{ getBuildingCapacity(bDef.type) }}</span>
          <button v-if="getBuildingLevel(bDef.type) < 3" class="btn text-xs" @click="handleUpgradeBuilding(bDef.type)">
            <ArrowUp :size="14" />
            升级
          </button>
        </div>
        <button v-else class="btn text-xs" @click="handleBuildBuilding(bDef.type)">
          <Hammer :size="14" />
          建造 ({{ bDef.cost }}文)
        </button>
      </div>

      <template v-if="isBuildingBuilt(bDef.type)">
        <!-- 鸡舍孵化器（鸡舍2级以上） -->
        <div v-if="bDef.type === 'coop' && getBuildingLevel('coop') >= 2" class="mb-3 p-2 border border-accent/10 rounded-xs">
          <p class="text-xs text-accent mb-1">
            <Egg :size="14" class="inline" />
            孵化器
          </p>
          <div v-if="animalStore.incubating">
            <p class="text-xs text-muted">
              正在孵化：{{ getAnimalName(animalStore.incubating.animalType) }}（剩余{{ animalStore.incubating.daysLeft }}天）
            </p>
          </div>
          <div v-else-if="coopIncubatableEggs.length > 0" class="flex flex-col gap-1">
            <div
              v-for="eggItem in coopIncubatableEggs"
              :key="eggItem.itemId"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
              @click="handleStartIncubation(eggItem.itemId)"
            >
              <span class="text-xs">{{ eggItem.name }}</span>
              <span class="text-xs text-muted">&times;{{ eggItem.count }}</span>
            </div>
          </div>
          <p v-else class="text-xs text-muted">背包中没有可孵化的蛋。</p>
        </div>

        <!-- 牲口棚孵化器（牲口棚2级以上） -->
        <div v-if="bDef.type === 'barn' && getBuildingLevel('barn') >= 2" class="mb-3 p-2 border border-accent/10 rounded-xs">
          <p class="text-xs text-accent mb-1">
            <Egg :size="14" class="inline" />
            孵化器
          </p>
          <div v-if="animalStore.barnIncubating">
            <p class="text-xs text-muted">
              正在孵化：{{ getAnimalName(animalStore.barnIncubating.animalType) }}（剩余{{ animalStore.barnIncubating.daysLeft }}天）
            </p>
          </div>
          <div v-else-if="barnIncubatableEggs.length > 0" class="flex flex-col gap-1">
            <div
              v-for="eggItem in barnIncubatableEggs"
              :key="eggItem.itemId"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
              @click="handleStartBarnIncubation(eggItem.itemId)"
            >
              <span class="text-xs">{{ eggItem.name }}</span>
              <span class="text-xs text-muted">&times;{{ eggItem.count }}</span>
            </div>
          </div>
          <p v-else class="text-xs text-muted">背包中没有可在牲口棚孵化的蛋。</p>
        </div>

        <!-- 购买动物按钮 -->
        <button class="btn text-xs mb-3" @click="buyListBuilding = bDef.type">
          <ShoppingCart :size="14" />
          购买动物
        </button>

        <!-- 动物列表 -->
        <div v-if="getAnimalsInBuilding(bDef.type).length > 0" class="flex flex-col gap-1 max-h-60 overflow-y-auto">
          <div v-for="animal in getAnimalsInBuilding(bDef.type)" :key="animal.id" class="border border-accent/10 rounded-xs p-2">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs text-accent">{{ animal.name }}</span>
              <button class="btn text-xs py-0 px-1" :disabled="animal.wasPetted" @click="handlePetAnimal(animal.id)">
                <Hand :size="14" />
                {{ animal.wasPetted ? '已摸' : '抚摸' }}
              </button>
            </div>
            <div class="space-y-0.5">
              <div class="flex items-center gap-1">
                <span class="text-[10px] text-muted w-6">好感</span>
                <div class="flex-1 h-1.5 bg-bg rounded-xs border border-accent/10">
                  <div class="h-full rounded-xs bg-danger transition-all" :style="{ width: Math.floor(animal.friendship / 10) + '%' }" />
                </div>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-[10px] text-muted w-6">心情</span>
                <div class="flex-1 h-1.5 bg-bg rounded-xs border border-accent/10">
                  <div
                    class="h-full rounded-xs transition-all"
                    :class="getMoodBarColor(animal.mood)"
                    :style="{ width: Math.floor((animal.mood / 255) * 100) + '%' }"
                  />
                </div>
                <span class="text-[10px] text-muted w-6">{{ getMoodText(animal.mood) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-6 text-muted">
          <Home :size="32" class="mb-2" />
          <p class="text-xs">暂无动物</p>
        </div>
      </template>
      <template v-else>
        <p class="text-xs text-muted">需要：{{ bDef.materialCost.map(m => `${getItemName(m.itemId)}×${m.quantity}`).join('、') }}</p>
      </template>
    </div>

    <!-- 马厩 -->
    <div class="mb-4 border border-accent/20 rounded-xs p-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-accent">马厩</span>
        <div v-if="animalStore.stableBuilt" class="flex items-center gap-2">
          <span class="text-xs text-muted">{{ animalStore.getHorse ? '1/1' : '0/1' }}</span>
        </div>
        <button v-else class="btn text-xs" @click="handleBuildBuilding('stable')">
          <Hammer :size="14" />
          建造 ({{ stableDef?.cost ?? 10000 }}文)
        </button>
      </div>

      <template v-if="animalStore.stableBuilt">
        <div v-if="animalStore.getHorse" class="border border-accent/10 rounded-xs p-2">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-accent">{{ animalStore.getHorse.name }}</span>
            <button
              class="btn text-xs py-0 px-1"
              :disabled="animalStore.getHorse.wasPetted"
              @click="handlePetAnimal(animalStore.getHorse.id)"
            >
              <Hand :size="14" />
              {{ animalStore.getHorse.wasPetted ? '已摸' : '抚摸' }}
            </button>
          </div>
          <div class="space-y-0.5">
            <div class="flex items-center gap-1">
              <span class="text-[10px] text-muted w-6">好感</span>
              <div class="flex-1 h-1.5 bg-bg rounded-xs border border-accent/10">
                <div
                  class="h-full rounded-xs bg-danger transition-all"
                  :style="{ width: Math.floor(animalStore.getHorse.friendship / 10) + '%' }"
                />
              </div>
            </div>
            <div class="flex items-center gap-1">
              <span class="text-[10px] text-muted w-6">心情</span>
              <div class="flex-1 h-1.5 bg-bg rounded-xs border border-accent/10">
                <div
                  class="h-full rounded-xs transition-all"
                  :class="getMoodBarColor(animalStore.getHorse.mood)"
                  :style="{ width: Math.floor((animalStore.getHorse.mood / 255) * 100) + '%' }"
                />
              </div>
              <span class="text-[10px] text-muted w-6">{{ getMoodText(animalStore.getHorse.mood) }}</span>
            </div>
          </div>
          <p class="text-xs text-success mt-1">骑马出行，旅行时间减少30%。</p>
        </div>
        <div v-else>
          <div
            class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
            @click="
              openBuyModal(
                {
                  type: 'horse' as AnimalType,
                  name: '马',
                  building: 'stable' as AnimalBuildingType,
                  cost: 5000,
                  productId: '',
                  productName: '无',
                  produceDays: 0,
                  friendship: { min: 0, max: 1000 }
                },
                'stable'
              )
            "
          >
            <span class="text-xs">马</span>
            <span class="text-xs text-accent whitespace-nowrap">5000文</span>
          </div>
          <p class="text-xs text-muted mt-1">拥有马匹可减少30%旅行时间。</p>
        </div>
      </template>
      <template v-else>
        <p class="text-xs text-muted">
          需要：{{ stableDef?.materialCost.map(m => `${getItemName(m.itemId)}×${m.quantity}`).join('、') ?? '' }}
        </p>
        <p class="text-xs text-muted mt-1">拥有马匹可减少30%旅行时间。</p>
      </template>
    </div>

    <!-- 饲养管理 -->
    <div class="border border-accent/20 rounded-xs p-3">
      <h3 class="text-accent text-sm mb-3">
        <Apple :size="14" class="inline" />
        饲养管理
      </h3>

      <!-- 喂食 -->
      <div class="mb-3">
        <div class="flex items-center justify-between mb-1">
          <p class="text-xs text-muted">喂食</p>
          <span class="text-xs text-muted">干草库存：{{ hayCount }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <div
            class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5"
            :class="unfedCount > 0 ? 'cursor-pointer hover:bg-accent/5' : 'opacity-50'"
            @click="unfedCount > 0 && handleFeedAll()"
          >
            <span class="text-xs">喂食全部</span>
            <span class="text-xs text-muted">需干草×{{ unfedCount }}</span>
          </div>
          <div
            class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5"
            :class="playerStore.money >= HAY_PRICE ? 'cursor-pointer hover:bg-accent/5' : 'opacity-50'"
            @click="playerStore.money >= HAY_PRICE && handleBuyHay()"
          >
            <span class="text-xs">购买干草</span>
            <span class="text-xs text-accent">{{ HAY_PRICE }}文</span>
          </div>
        </div>
      </div>

      <!-- 放牧 -->
      <div>
        <p class="text-xs text-muted mb-1">放牧</p>
        <div
          class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5"
          :class="canGraze ? 'cursor-pointer hover:bg-accent/5' : 'opacity-50'"
          @click="canGraze && handleGraze()"
        >
          <span class="text-xs">放牧全部动物</span>
          <span v-if="grazeDisabledReason" class="text-xs text-muted">{{ grazeDisabledReason }}</span>
        </div>
      </div>
    </div>

    <!-- 购买动物列表弹窗 -->
    <Transition name="panel-fade">
      <div
        v-if="buyListBuilding"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="buyListBuilding = null"
      >
        <div class="game-panel max-w-xs w-full">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-accent">购买动物</p>
            <button class="btn text-xs py-0 px-1" @click="buyListBuilding = null">
              <X :size="12" />
            </button>
          </div>
          <div class="flex flex-col gap-1">
            <div
              v-for="aDef in getAnimalDefsForBuilding(buyListBuilding)"
              :key="aDef.type"
              class="flex items-center justify-between border border-accent/20 rounded-xs px-3 py-1.5 cursor-pointer hover:bg-accent/5"
              @click="handleSelectAnimalToBuy(aDef)"
            >
              <span class="text-xs">{{ aDef.name }}</span>
              <span class="text-xs text-accent whitespace-nowrap">{{ aDef.cost }}文</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 购买动物详情弹窗 -->
    <Transition name="panel-fade">
      <div v-if="buyModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4" @click.self="buyModal = null">
        <div class="game-panel max-w-xs w-full">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm text-accent">{{ buyModal.name }}</p>
            <button class="btn text-xs py-0 px-1" @click="buyModal = null">
              <X :size="12" />
            </button>
          </div>
          <div class="text-xs space-y-1 mb-3 border-b border-accent/20 pb-2">
            <p v-if="buyModal.productName && buyModal.productName !== '无'" class="text-muted">
              产出：{{ buyModal.productName }}（每{{ buyModal.produceDays }}天）
            </p>
            <p v-else class="text-muted">旅行时间减少30%</p>
            <p>价格：{{ buyModal.cost }}文</p>
          </div>
          <button class="btn text-xs w-full" :disabled="!buyModal.canBuy()" @click="handleBuyFromModal">
            <ShoppingCart :size="14" />
            购买
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { Hammer, ShoppingCart, Hand, Apple, Home, ArrowUp, Egg, X } from 'lucide-vue-next'
  import { useAnimalStore, useInventoryStore, usePlayerStore, useGameStore } from '@/stores'
  import { ANIMAL_BUILDINGS, ANIMAL_DEFS, HAY_ITEM_ID, HAY_PRICE, getItemById, getBuildingUpgrade, INCUBATION_MAP } from '@/data'
  import { ACTION_TIME_COSTS } from '@/data/timeConstants'
  import type { AnimalBuildingType, AnimalType, AnimalDef } from '@/types'
  import { addLog } from '@/composables/useGameLog'
  import { handleEndDay } from '@/composables/useEndDay'

  const animalStore = useAnimalStore()
  const inventoryStore = useInventoryStore()
  const playerStore = usePlayerStore()
  const gameStore = useGameStore()

  // === 购买弹窗 ===

  interface BuyAnimalModalData {
    name: string
    productName: string
    produceDays: number
    cost: number
    onBuy: () => void
    canBuy: () => boolean
  }

  const buyModal = ref<BuyAnimalModalData | null>(null)
  const buyListBuilding = ref<AnimalBuildingType | null>(null)

  const handleSelectAnimalToBuy = (aDef: AnimalDef) => {
    if (!buyListBuilding.value) return
    openBuyModal(aDef, buyListBuilding.value)
    buyListBuilding.value = null
  }

  const openBuyModal = (aDef: AnimalDef, buildingType: AnimalBuildingType) => {
    buyModal.value = {
      name: aDef.name,
      productName: aDef.productName,
      produceDays: aDef.produceDays,
      cost: aDef.cost,
      onBuy: () => handleBuyAnimal(aDef.type),
      canBuy: () => {
        if (buildingType === 'stable') return !animalStore.getHorse && playerStore.money >= aDef.cost
        return getAnimalsInBuilding(buildingType).length < getBuildingCapacity(buildingType) && playerStore.money >= aDef.cost
      }
    }
  }

  const handleBuyFromModal = () => {
    if (!buyModal.value) return
    buyModal.value.onBuy()
    buyModal.value = null
  }

  // === 数据计算 ===

  /** 只显示鸡舍和牲口棚（马厩单独渲染） */
  const mainBuildings = computed(() => ANIMAL_BUILDINGS.filter(b => b.type !== 'stable'))

  /** 马厩建筑定义 */
  const stableDef = computed(() => ANIMAL_BUILDINGS.find(b => b.type === 'stable'))

  /** 干草库存数量 */
  const hayCount = computed(() => inventoryStore.getItemCount(HAY_ITEM_ID))

  /** 未喂食动物数量 */
  const unfedCount = computed(() => animalStore.animals.filter(a => !a.wasFed).length)

  /** 可在鸡舍孵化的蛋列表 */
  const coopIncubatableEggs = computed(() => {
    const result: { itemId: string; name: string; count: number }[] = []
    for (const [itemId, mapping] of Object.entries(INCUBATION_MAP)) {
      if (mapping.building !== 'coop') continue
      const count = inventoryStore.getItemCount(itemId)
      if (count > 0) {
        const itemDef = getItemById(itemId)
        result.push({ itemId, name: itemDef?.name ?? itemId, count })
      }
    }
    return result
  })

  /** 可在牲口棚孵化的蛋列表 */
  const barnIncubatableEggs = computed(() => {
    const result: { itemId: string; name: string; count: number }[] = []
    for (const [itemId, mapping] of Object.entries(INCUBATION_MAP)) {
      if (mapping.building !== 'barn') continue
      const count = inventoryStore.getItemCount(itemId)
      if (count > 0) {
        const itemDef = getItemById(itemId)
        result.push({ itemId, name: itemDef?.name ?? itemId, count })
      }
    }
    return result
  })

  // === 工具函数 ===

  const getAnimalName = (type: AnimalType): string => {
    return ANIMAL_DEFS.find(d => d.type === type)?.name ?? type
  }

  const getItemName = (itemId: string): string => {
    return getItemById(itemId)?.name ?? itemId
  }

  const isBuildingBuilt = (type: AnimalBuildingType): boolean => {
    return animalStore.buildings.find(b => b.type === type)?.built ?? false
  }

  const getAnimalsInBuilding = (type: AnimalBuildingType) => {
    return animalStore.animals.filter(a => {
      const def = ANIMAL_DEFS.find(d => d.type === a.type)
      return def?.building === type
    })
  }

  const getAnimalDefsForBuilding = (type: AnimalBuildingType) => {
    return ANIMAL_DEFS.filter(d => d.building === type)
  }

  const getBuildingLevel = (type: AnimalBuildingType): number => {
    return animalStore.buildings.find(b => b.type === type)?.level ?? 0
  }

  const getBuildingDisplayName = (type: AnimalBuildingType): string => {
    const level = getBuildingLevel(type)
    if (level >= 2) {
      const upgrade = getBuildingUpgrade(type, level)
      if (upgrade) return upgrade.name
    }
    return ANIMAL_BUILDINGS.find(b => b.type === type)?.name ?? type
  }

  const getBuildingCapacity = (type: AnimalBuildingType): number => {
    const level = getBuildingLevel(type)
    if (type === 'stable') return 1
    return level * 4
  }

  const getMoodText = (mood: number): string => {
    if (mood > 200) return '开心'
    if (mood > 100) return '一般'
    return '低落'
  }

  const getMoodBarColor = (mood: number): string => {
    if (mood > 200) return 'bg-success'
    if (mood > 100) return 'bg-accent'
    return 'bg-danger'
  }

  // === 放牧 ===

  const canGraze = computed(() => {
    if (animalStore.grazedToday) return false
    if (gameStore.isRainy) return false
    if (gameStore.season === 'winter') {
      return animalStore.animals.some(a => a.wasFed && a.type === 'yak')
    }
    const hasGrazeableAnimals = animalStore.animals.some(a => a.wasFed && a.type !== 'horse')
    return hasGrazeableAnimals
  })

  const grazeDisabledReason = computed(() => {
    if (animalStore.animals.filter(a => a.type !== 'horse').length === 0) return '没有牲畜'
    if (animalStore.grazedToday) return '今天已放牧'
    if (gameStore.isRainy) return '雨天不能放牧'
    if (gameStore.season === 'winter') {
      const hasYak = animalStore.animals.some(a => a.wasFed && a.type === 'yak')
      return hasYak ? '' : '冬天只有牦牛可放牧'
    }
    if (!animalStore.animals.some(a => a.wasFed && a.type !== 'horse')) return '先喂食再放牧'
    return ''
  })

  // === 操作处理 ===

  const handleUpgradeBuilding = (type: AnimalBuildingType) => {
    const level = getBuildingLevel(type)
    const upgrade = getBuildingUpgrade(type, level + 1)
    const success = animalStore.upgradeBuilding(type)
    if (success) {
      addLog(`成功升级为${upgrade?.name ?? '高级畜舍'}！容量增至${(level + 1) * 4}。`)
      const tr = gameStore.advanceTime(2)
      if (tr.message) addLog(tr.message)
      if (tr.passedOut) handleEndDay()
    } else {
      addLog(`升级失败，请检查金币和材料是否充足。`)
    }
  }

  const handleBuildBuilding = (type: AnimalBuildingType) => {
    const success = animalStore.buildBuilding(type)
    const bDef = ANIMAL_BUILDINGS.find(b => b.type === type)
    if (success) {
      addLog(`成功建造了${bDef?.name ?? '畜舍'}！`)
      const tr = gameStore.advanceTime(2)
      if (tr.message) addLog(tr.message)
      if (tr.passedOut) handleEndDay()
    } else {
      addLog(`建造${bDef?.name ?? '畜舍'}失败，请检查金币和材料是否充足。`)
    }
  }

  const handleBuyAnimal = (type: AnimalType) => {
    const aDef = ANIMAL_DEFS.find(d => d.type === type)
    if (!aDef) return
    const count = animalStore.animals.filter(a => a.type === type).length
    const defaultName = `${aDef.name}${count + 1}`
    const success = animalStore.buyAnimal(type, defaultName)
    if (success) {
      addLog(`买了一只${aDef.name}，取名「${defaultName}」。`)
    } else {
      addLog(`购买${aDef.name}失败，请检查金币和畜舍容量。`)
    }
  }

  const handlePetAnimal = (id: string) => {
    const success = animalStore.petAnimal(id)
    if (success) {
      const animal = animalStore.animals.find(a => a.id === id)
      addLog(`抚摸了${animal?.name ?? '动物'}，友好度提升了。`)
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.petAnimal)
      if (tr.message) addLog(tr.message)
      if (tr.passedOut) handleEndDay()
    } else {
      addLog('今天已经抚摸过了。')
    }
  }

  const handlePetThePet = () => {
    const success = animalStore.petThePet()
    if (success) {
      addLog(`抚摸了${animalStore.pet?.name ?? '宠物'}，好感度+5。`)
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.petAnimal)
      if (tr.message) addLog(tr.message)
      if (tr.passedOut) handleEndDay()
    } else {
      addLog('今天已经抚摸过了。')
    }
  }

  const handleStartIncubation = (itemId: string) => {
    const result = animalStore.startIncubation(itemId)
    addLog(result.message)
  }

  const handleStartBarnIncubation = (itemId: string) => {
    const result = animalStore.startBarnIncubation(itemId)
    addLog(result.message)
  }

  const handleFeedAll = () => {
    const result = animalStore.feedAll()
    if (result.fedCount > 0) {
      addLog(`喂食了${result.fedCount}只动物。`)
    }
    if (result.noHayCount > 0) {
      addLog(`干草不足，${result.noHayCount}只动物未能喂食。`)
    }
    if (result.fedCount === 0 && result.noHayCount === 0) {
      addLog('所有动物今天都已喂过了。')
    }
    if (result.fedCount > 0) {
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.feedAnimals)
      if (tr.message) addLog(tr.message)
      if (tr.passedOut) handleEndDay()
    }
  }

  const handleBuyHay = () => {
    if (!playerStore.spendMoney(HAY_PRICE)) {
      addLog('金币不足，无法购买干草。')
      return
    }
    inventoryStore.addItem(HAY_ITEM_ID)
    addLog(`购买了1份干草，花费${HAY_PRICE}文。`)
  }

  const handleGraze = () => {
    const result = animalStore.grazeAnimals()
    addLog(result.message)
    if (result.success) {
      const tr = gameStore.advanceTime(ACTION_TIME_COSTS.graze)
      if (tr.message) addLog(tr.message)
      if (tr.passedOut) handleEndDay()
    }
  }
</script>
