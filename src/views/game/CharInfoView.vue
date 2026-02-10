<template>
  <div>
    <!-- 标题 -->
    <div class="flex items-center justify-between mb-1">
      <div class="flex items-center gap-1.5 text-sm text-accent">
        <User :size="14" />
        <span>角色信息</span>
      </div>
      <span class="text-xs text-muted">第{{ gameStore.year }}年 {{ SEASON_NAMES[gameStore.season] }}</span>
    </div>

    <!-- 角色身份 + 属性 -->
    <div class="border border-accent/20 rounded-xs p-2 mb-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-accent">{{ playerStore.playerName }}</span>
        <span class="text-xs text-muted">{{ genderLabel }}</span>
      </div>

      <div class="flex flex-col gap-1.5">
        <!-- 体力 -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted shrink-0">体力</span>
          <div class="flex-1 h-1 bg-bg rounded-xs border border-accent/10">
            <div
              class="h-full rounded-xs transition-all"
              :class="playerStore.staminaPercent > 35 ? 'bg-success' : 'bg-danger'"
              :style="{ width: playerStore.staminaPercent + '%' }"
            />
          </div>
          <span class="text-xs whitespace-nowrap">{{ playerStore.stamina }}/{{ playerStore.maxStamina }}</span>
        </div>
        <!-- 生命 -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted shrink-0">生命</span>
          <div class="flex-1 h-1 bg-bg rounded-xs border border-accent/10">
            <div
              class="h-full rounded-xs transition-all"
              :class="playerStore.getHpPercent() > 25 ? 'bg-success' : 'bg-danger'"
              :style="{ width: playerStore.getHpPercent() + '%' }"
            />
          </div>
          <span class="text-xs whitespace-nowrap">{{ playerStore.hp }}/{{ playerStore.getMaxHp() }}</span>
        </div>
        <!-- 金币 -->
        <div class="flex items-center justify-between">
          <span class="text-xs text-muted">金币</span>
          <span class="text-xs text-accent">{{ playerStore.money }}文</span>
        </div>
      </div>
    </div>

    <!-- 武器装备 -->
    <div class="border border-accent/20 rounded-xs p-2 mb-3">
      <p class="text-xs text-muted mb-1.5">武器</p>
      <div class="flex flex-col gap-1">
        <div
          v-for="(weapon, index) in inventoryStore.ownedWeapons"
          :key="index"
          class="flex items-center justify-between border rounded-xs px-2 py-1"
          :class="index === inventoryStore.equippedWeaponIndex ? 'border-accent/30' : 'border-accent/10'"
        >
          <div class="min-w-0">
            <span class="text-xs" :class="index === inventoryStore.equippedWeaponIndex ? 'text-accent' : ''">
              {{ getWeaponDisplayName(weapon.defId, weapon.enchantmentId) }}
            </span>
            <p class="text-[10px] text-muted truncate">
              {{ getWeaponTypeName(weapon.defId) }} · 攻击{{ getWeaponStats(weapon).attack }} · 暴击{{
                Math.round(getWeaponStats(weapon).critRate * 100)
              }}%
            </p>
            <p v-if="weapon.enchantmentId" class="text-[10px] text-success truncate">{{ getEnchantDesc(weapon.enchantmentId) }}</p>
          </div>
          <div class="shrink-0 ml-2">
            <span v-if="index === inventoryStore.equippedWeaponIndex" class="text-xs text-accent">装备中</span>
            <button v-else class="btn text-xs py-0 px-1.5" @click="handleEquip(index)">装备</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 戒指装备 -->
    <template v-if="inventoryStore.ownedRings.length > 0 || equippedRing1 || equippedRing2">
      <div class="border border-accent/20 rounded-xs p-2 mb-3">
        <p class="text-xs text-muted mb-1.5">戒指</p>
        <!-- 槽位 -->
        <div class="flex gap-1 mb-1.5">
          <div class="flex-1 border border-accent/10 rounded-xs px-2 py-1 text-center">
            <p class="text-[10px] text-muted">槽位1</p>
            <p class="text-xs" :class="equippedRing1 ? 'text-accent' : 'text-muted/40'">
              {{ equippedRing1?.name ?? '空' }}
            </p>
          </div>
          <div class="flex-1 border border-accent/10 rounded-xs px-2 py-1 text-center">
            <p class="text-[10px] text-muted">槽位2</p>
            <p class="text-xs" :class="equippedRing2 ? 'text-accent' : 'text-muted/40'">
              {{ equippedRing2?.name ?? '空' }}
            </p>
          </div>
        </div>
        <!-- 戒指列表 -->
        <div
          v-for="(ring, index) in ownedRingList"
          :key="index"
          class="flex items-center justify-between border rounded-xs px-2 py-1 mt-1"
          :class="isRingEquipped(index) ? 'border-accent/30' : 'border-accent/10'"
        >
          <div class="min-w-0">
            <span class="text-xs" :class="isRingEquipped(index) ? 'text-accent' : ''">{{ ring.name }}</span>
            <p class="text-[10px] text-muted truncate">{{ ring.effectText }}</p>
          </div>
          <div class="flex gap-1 shrink-0 ml-2">
            <template v-if="isRingEquipped(index)">
              <button class="btn text-xs py-0 px-1.5" @click="handleUnequipRingByIndex(index)">卸下</button>
            </template>
            <template v-else>
              <button class="btn text-xs py-0 px-1.5" @click="handleEquipRing(index, 0)">槽1</button>
              <button class="btn text-xs py-0 px-1.5" @click="handleEquipRing(index, 1)">槽2</button>
            </template>
          </div>
        </div>
      </div>
    </template>

    <!-- 工具一览 -->
    <div class="border border-accent/20 rounded-xs p-2 mb-3">
      <div class="flex items-center justify-between mb-1.5">
        <p class="text-xs text-muted">工具</p>
        <button class="text-xs text-accent hover:underline" @click="goToUpgrade">前往升级</button>
      </div>
      <div class="flex flex-col gap-1">
        <div
          v-for="tool in inventoryStore.tools"
          :key="tool.type"
          class="flex items-center justify-between border border-accent/10 rounded-xs px-2 py-1"
        >
          <div>
            <span class="text-xs">{{ TOOL_NAMES[tool.type] }}</span>
            <span class="text-xs text-muted ml-1">{{ TIER_NAMES[tool.tier] }}</span>
          </div>
          <span class="text-[10px] text-muted">-{{ Math.round((1 - inventoryStore.getToolStaminaMultiplier(tool.type)) * 100) }}%体力</span>
        </div>
      </div>
    </div>

    <!-- 技能总览 -->
    <div class="border border-accent/20 rounded-xs p-2 mb-3">
      <div class="flex items-center justify-between mb-1.5">
        <p class="text-xs text-muted">技能</p>
        <button class="text-xs text-accent hover:underline" @click="goToSkills">查看详情</button>
      </div>
      <div class="flex flex-col gap-0.5">
        <div v-for="skill in skillStore.skills" :key="skill.type" class="flex items-center justify-between">
          <span class="text-xs text-muted">{{ SKILL_NAMES[skill.type] }}</span>
          <div class="flex items-center gap-1.5">
            <span class="text-xs text-accent">Lv.{{ skill.level }}</span>
            <span v-if="skill.perk5" class="text-[10px] text-success">{{ PERK_NAMES[skill.perk5] }}</span>
            <span v-if="skill.perk10" class="text-[10px] text-success">{{ PERK_NAMES[skill.perk10] }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 被动加成 -->
    <div v-if="unlockedWalletItems.length > 0" class="border border-accent/20 rounded-xs p-2 mb-3">
      <p class="text-xs text-muted mb-1.5">被动加成</p>
      <div class="flex flex-col gap-0.5">
        <div v-for="item in unlockedWalletItems" :key="item.id" class="flex items-center justify-between">
          <span class="text-xs text-accent">{{ item.name }}</span>
          <span class="text-xs text-muted">{{ item.description }}</span>
        </div>
      </div>
    </div>

    <!-- 家庭 -->
    <div v-if="spouseInfo" class="border border-accent/20 rounded-xs p-2">
      <p class="text-xs text-muted mb-1.5">家庭</p>
      <div class="flex flex-col gap-0.5">
        <div class="flex items-center justify-between">
          <span class="text-xs text-muted">配偶</span>
          <span class="text-xs text-accent">{{ spouseInfo.name }}</span>
        </div>
        <div v-for="child in npcStore.children" :key="child.id" class="flex items-center justify-between">
          <span class="text-xs text-muted">{{ child.name }}</span>
          <span class="text-xs">{{ CHILD_STAGE_NAMES[child.stage] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { User } from 'lucide-vue-next'
  import { usePlayerStore, useInventoryStore, useSkillStore, useWalletStore, useNpcStore, useGameStore, SEASON_NAMES } from '@/stores'
  import { TOOL_NAMES, TIER_NAMES, getNpcById } from '@/data'
  import { getWeaponById, getEnchantmentById, getWeaponDisplayName, WEAPON_TYPE_NAMES } from '@/data/weapons'
  import { getRingById } from '@/data/rings'
  import type { RingEffectType } from '@/types'
  import { WALLET_ITEMS } from '@/data/wallet'
  import { navigateToPanel } from '@/composables/useNavigation'
  import type { SkillType, SkillPerk5, SkillPerk10, ChildStage, OwnedWeapon } from '@/types'
  import { addLog } from '@/composables/useGameLog'

  const playerStore = usePlayerStore()
  const inventoryStore = useInventoryStore()
  const skillStore = useSkillStore()
  const walletStore = useWalletStore()
  const npcStore = useNpcStore()
  const gameStore = useGameStore()

  // === 身份 ===
  const genderLabel = computed(() => (playerStore.gender === 'male' ? '男' : '女'))

  // === 武器 ===
  const getWeaponTypeName = (defId: string): string => {
    const def = getWeaponById(defId)
    return def ? WEAPON_TYPE_NAMES[def.type] : '未知'
  }

  const getWeaponStats = (weapon: OwnedWeapon): { attack: number; critRate: number } => {
    const def = getWeaponById(weapon.defId)
    if (!def) return { attack: 0, critRate: 0 }
    let attack = def.attack
    let critRate = def.critRate
    if (weapon.enchantmentId) {
      const enchant = getEnchantmentById(weapon.enchantmentId)
      if (enchant) {
        attack += enchant.attackBonus
        critRate += enchant.critBonus
      }
    }
    return { attack, critRate }
  }

  const getEnchantDesc = (enchantmentId: string): string => {
    const enchant = getEnchantmentById(enchantmentId)
    return enchant ? `${enchant.name} - ${enchant.description}` : ''
  }

  const handleEquip = (index: number) => {
    if (inventoryStore.equipWeapon(index)) {
      const weapon = inventoryStore.ownedWeapons[index]!
      const name = getWeaponDisplayName(weapon.defId, weapon.enchantmentId)
      addLog(`装备了${name}。`)
    }
  }

  // === 戒指 ===

  const RING_EFFECT_SHORT: Record<RingEffectType, string> = {
    attack_bonus: '攻击',
    crit_rate_bonus: '暴击',
    defense_bonus: '减伤',
    vampiric: '吸血',
    max_hp_bonus: '生命',
    stamina_reduction: '体力减免',
    mining_stamina: '挖矿体力减免',
    farming_stamina: '农耕体力减免',
    fishing_stamina: '钓鱼体力减免',
    crop_quality_bonus: '品质',
    crop_growth_bonus: '生长加速',
    fish_quality_bonus: '鱼品质',
    fishing_calm: '鱼速降低',
    sell_price_bonus: '售价',
    shop_discount: '折扣',
    gift_friendship: '好感',
    monster_drop_bonus: '掉落',
    exp_bonus: '经验',
    treasure_find: '宝箱',
    ore_bonus: '矿石',
    luck: '幸运'
  }

  const formatRingEffects = (defId: string): string => {
    const def = getRingById(defId)
    if (!def) return ''
    return def.effects
      .map(e => {
        const label = RING_EFFECT_SHORT[e.type]
        return e.value > 0 && e.value < 1 ? `${label}${Math.round(e.value * 100)}%` : `${label}+${e.value}`
      })
      .join(' ')
  }

  const getRingInfo = (index: number): { name: string; effectText: string } | null => {
    if (index < 0 || index >= inventoryStore.ownedRings.length) return null
    const ring = inventoryStore.ownedRings[index]!
    const def = getRingById(ring.defId)
    if (!def) return null
    return { name: def.name, effectText: formatRingEffects(ring.defId) }
  }

  const equippedRing1 = computed(() => getRingInfo(inventoryStore.equippedRingSlot1))
  const equippedRing2 = computed(() => getRingInfo(inventoryStore.equippedRingSlot2))

  const ownedRingList = computed(() =>
    inventoryStore.ownedRings.map((ring, index) => ({
      index,
      name: getRingById(ring.defId)?.name ?? ring.defId,
      effectText: formatRingEffects(ring.defId)
    }))
  )

  const handleEquipRing = (ringIndex: number, slot: 0 | 1) => {
    if (inventoryStore.equipRing(ringIndex, slot)) {
      const def = getRingById(inventoryStore.ownedRings[ringIndex]!.defId)
      addLog(`将${def?.name ?? '戒指'}装备到槽位${slot + 1}。`)
    }
  }

  const handleUnequipRing = (slot: 0 | 1) => {
    const idx = slot === 0 ? inventoryStore.equippedRingSlot1 : inventoryStore.equippedRingSlot2
    const def = idx >= 0 ? getRingById(inventoryStore.ownedRings[idx]!.defId) : null
    if (inventoryStore.unequipRing(slot)) {
      addLog(`卸下了${def?.name ?? '戒指'}。`)
    }
  }

  const isRingEquipped = (idx: number): boolean => {
    return inventoryStore.equippedRingSlot1 === idx || inventoryStore.equippedRingSlot2 === idx
  }

  const handleUnequipRingByIndex = (idx: number) => {
    if (inventoryStore.equippedRingSlot1 === idx) handleUnequipRing(0)
    else if (inventoryStore.equippedRingSlot2 === idx) handleUnequipRing(1)
  }

  // === 技能 ===
  const SKILL_NAMES: Record<SkillType, string> = {
    farming: '农耕',
    foraging: '采集',
    fishing: '钓鱼',
    mining: '挖矿',
    combat: '战斗'
  }

  const PERK_NAMES: Record<SkillPerk5 | SkillPerk10, string> = {
    harvester: '丰收者',
    rancher: '牧人',
    lumberjack: '樵夫',
    herbalist: '药师',
    fisher: '渔夫',
    trapper: '捕手',
    miner: '矿工',
    geologist: '地质学家',
    fighter: '斗士',
    defender: '守护者',
    intensive: '精耕',
    artisan: '匠人',
    coopmaster: '牧场主',
    shepherd: '牧羊人',
    botanist: '植物学家',
    alchemist: '炼金师',
    forester: '伐木工',
    tracker: '追踪者',
    angler: '垂钓大师',
    aquaculture: '水产商',
    mariner: '水手',
    luremaster: '诱饵师',
    prospector: '探矿者',
    blacksmith: '铁匠',
    excavator: '挖掘者',
    mineralogist: '宝石学家',
    warrior: '武者',
    brute: '蛮力者',
    acrobat: '杂技师',
    tank: '重甲者'
  }

  // === 被动 ===
  const unlockedWalletItems = computed(() => WALLET_ITEMS.filter(w => walletStore.has(w.id)))

  // === 家庭 ===
  const spouseInfo = computed(() => {
    const spouseState = npcStore.getSpouse()
    if (!spouseState) return null
    const npcDef = getNpcById(spouseState.npcId)
    return npcDef ? { name: npcDef.name } : null
  })

  const CHILD_STAGE_NAMES: Record<ChildStage, string> = {
    baby: '婴儿',
    toddler: '幼童',
    child: '孩童',
    teen: '少年'
  }

  // === 导航 ===
  const goToUpgrade = () => {
    navigateToPanel('upgrade')
  }

  const goToSkills = () => {
    navigateToPanel('skills')
  }
</script>
