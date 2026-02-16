const table = Object.fromEntries(
  [
    "田庄", "果树", "野树", "农舍", "桃源村", 
    "商圈", "万物铺", "铁匠铺", "镖局", "渔具铺", "药铺", "绸缎庄",
    "工坊", "灶台", "博物馆"
  ].map((i) => [i, document.createDocumentFragment()])
);

const term = new Map([
  ["mon", "一"],
  ["tue", "二"],
  ["wed", "三"],
  ["thu", "四"],
  ["fri", "五"],
  ["sat", "六"],
  ["sun", "日"],
  ["spring", "春"],
  ["summer", "夏"],
  ["autumn", "秋"],
  ["winter", "冬"],
  ["sunny", "晴"],
  ["rainy", "雨"],
  ["stormy", "雷"],
  ["snowy", "雪"],
  ["windy", "风"],
  ["green_rain", "绿"],
  ["stone", "石头"]
]);

DATA.ITEMS.forEach(({id, name}) => {
  term.set(id, name);
});
DATA.MUSEUM_CATEGORIES.forEach(({key, label}) => {
  term.set(key, label);
});

DATA.EFFECTS = {
  attack_bonus: "攻击",
  crit_rate_bonus: "暴击",
  defense_bonus: "减伤",
  vampiric: "吸血",
  max_hp_bonus: "生命",
  stamina_reduction: "全局体力减免",
  mining_stamina: "挖矿体力减免",
  farming_stamina: "农耕体力减免",
  fishing_stamina: "钓鱼体力减免",
  crop_quality_bonus: "作物品质",
  crop_growth_bonus: "生长加速",
  fish_quality_bonus: "鱼品质",
  fishing_calm: "鱼速降低",
  sell_price_bonus: "售价加成",
  shop_discount: "商店折扣",
  gift_friendship: "送礼好感",
  monster_drop_bonus: "怪物掉落",
  exp_bonus: "经验加成",
  treasure_find: "宝箱概率",
  ore_bonus: "矿石额外",
  luck: "幸运",
  travel_speed: "旅行加速"
};
DATA.SEASON_COEFFICIENTS = {
  crop: [1.0, 0.9, 0.85, 1.2], // 秋收最便宜，冬季最贵
  fish: [1.0, 0.9, 1.0, 1.15], // 夏季鱼多便宜，冬季贵
  animal_product: [1.0, 0.95, 1.0, 1.1], // 冬季畜产品需求高
  processed: [0.95, 1.0, 1.1, 1.05], // 秋季加工品需求旺
  fruit: [1.1, 0.85, 0.9, 1.2], // 夏季水果多便宜，冬季贵
  ore: [1.0, 1.05, 1.0, 0.9], // 冬季矿多便宜
  gem: [1.0, 1.05, 1.0, 0.9] // 同矿石
}
DATA.SHOP_ITEMS = {
  "万物铺": [
    { name: "种子", price: ``, description: `<a href="#table-田庄">见上</a>（仅限当季）` },
    { name: "树苗", price: ``, description: `<a href="#table-果树">见上</a>` },
    { name: "背包扩容", price: ``, description: `价格为 升级次数 × 500 + 500` },
    { name: "仓库扩容", price: ``, description: `价格为 升级次数 × 400 + 800` },
    { name: "农场扩建", price: `2000<br />5000`, description: `6×6<br />8×8` },
    { name: "干草", price: 50, description: "喂养牲畜用" },
    { name: "木材", price: 50, description: "建筑和加工的基础材料" },
    { name: "雨图腾", price: 300, description: "使用后可以让明天下雨" }
  ], //views/game/ShopView.vue
  "铁匠铺": [
    { itemId: "copper_ore", name: "铜矿", price: 100, description: "矿洞中常见的铜矿" },
    { itemId: "iron_ore", name: "铁矿", price: 200, description: "中层矿洞出产的铁矿" },
    { itemId: "gold_ore", name: "金矿", price: 400, description: "深层矿洞出产的金矿" },
    { itemId: "copper_bar", name: "铜锭", price: 300, description: "冶炼好的铜锭" },
    { itemId: "iron_bar", name: "铁锭", price: 600, description: "冶炼好的铁锭" },
    { itemId: "gold_bar", name: "金锭", price: 1200, description: "冶炼好的金锭" },
    { itemId: "charcoal", name: "木炭", price: 100, description: "烧制的木炭" },
    ...DATA.CRAFTABLE_RINGS.map((item) => ({
      name: item.name,
      price: item.sellPrice,
      recipe: item.recipe.map(i => `${term.get(i.itemId)}×${i.quantity}`).join(" "),
      description: item.effects.map(i => `${DATA.EFFECTS[i.type]}${i.value}`).join(" ")
    }))
  ], //stores/useShopStore.ts
  "镖局": [
    ...DATA.SHOP_WEAPONS.map((item) => ({
      name: item.name,
      price: item.shopPrice,
      recipe: item.shopMaterials.map(i => `${term.get(i.itemId)}×${i.quantity}`).join(" "),
      description: `攻击${item.attack} 暴击${item.critRate}`
    })),
    ...DATA.BOMBS.filter(b => b.shopPrice !== null)
  ],
  "渔具铺": [
    { name: "鱼饵", price: ``, description: `<a href="">见上</a>` },
    { name: "浮漂", price: ``, description: `<a href="">见上</a>` }
  ],
  "药铺": [
    { name: "肥料", price: ``, description: `<a href="">见上</a>` },
    { itemId: "herb", name: "草药", price: 50, description: "山间野生的草药" },
    { itemId: "ginseng", name: "人参", price: 600, description: "极其珍贵的野生人参" },
    { itemId: "animal_medicine", name: "兽药", price: 150, description: "治疗生病的牲畜" },
    { itemId: "premium_feed", name: "精饲料", price: 200, description: "提升动物心情和好感" },
    { itemId: "nourishing_feed", name: "滋补饲料", price: 250, description: "加速动物产出" },
    { itemId: "vitality_feed", name: "活力饲料", price: 300, description: "喂食必定治愈疾病" }
  ], //stores/useShopStore.ts
  "绸缎庄": [
    ...DATA.SHOP_HATS.map((item) => ({
      name: item.name,
      price: item.shopPrice,
      description: item.effects.map(i => `${DATA.EFFECTS[i.type]}${i.value}`).join(" ")
    })),
    ...DATA.SHOP_SHOES.map((item) => ({
      name: item.name,
      price: item.shopPrice,
      description: item.effects.map(i => `${DATA.EFFECTS[i.type]}${i.value}`).join(" ")
    }))
  ]
}

DATA.CROPS.forEach(({ name, season, growthDays, sellPrice, seedPrice, description, giantCropEligible, regrowth, regrowthDays, maxHarvests }) => {
  table.田庄.append(
    Object.assign(document.createElement("li"), {
      innerHTML: `
        <span>${name}</span>
        <span>${season.map((s) => term.get(s)).join("")}</span>
        <span class="cell-r">${growthDays}</span>
        <span class="cell-r">${seedPrice || ""}</span>
        <span class="cell-r">${sellPrice}</span>
        <span class="cell-c">${giantCropEligible ? "√" : ""}</span>
        <span class="cell-c">${regrowth ? "√" : ""}</span>
        <span class="cell-r">${regrowthDays || ""}</span>
        <span class="cell-r">${maxHarvests || ""}</span>
        <span>${description.length >= 15 ? description.split("，")[0].replace("。", "") : description.slice(0, -1)}</span>
      `
    })
  );
});

DATA.FRUIT_TREE_DEFS.forEach(({ name, saplingPrice, fruitName, fruitSeason, growthDays, fruitSellPrice }) => {
  table.果树.append(
    Object.assign(document.createElement("li"), {
      innerHTML: `
        <span>${name}</span>
        <span>${fruitName}</span>
        <span>${term.get(fruitSeason)}</span>
        <span class="cell-r">${growthDays}</span>
        <span class="cell-r">${saplingPrice}</span>
        <span class="cell-r">${fruitSellPrice}</span>
      `
    })
  );
});

DATA.WILD_TREE_DEFS.forEach(({ name, tapProductName, growthDays, tapCycleDays }) => {
  table.野树.append(
    Object.assign(document.createElement("li"), {
      innerHTML: `
        <span>${name}</span>
        <span>${tapProductName}</span>
        <span class="cell-r">${growthDays}</span>
        <span class="cell-r">${tapCycleDays}</span>
      `
    })
  );
});

DATA.FARMHOUSE_UPGRADES.forEach(({ name, description, cost, materialCost }) => {
  table.农舍.append(
    Object.assign(document.createElement("li"), {
      innerHTML: `
        <span>${name}</span>
        <span>${cost}</span>
        <span>${materialCost.map(({itemId, quantity}) => `${term.get(itemId)}×${quantity}`).join(" ")}</span>
        <span>${description.replace("的", "").replace("。", "")}</span>
      `
    })
  );
});

DATA.NPCS.sort((a, b) => {
  const s = ["spring", "summer", "autumn", "winter"].indexOf(a.birthday.season) - ["spring", "summer", "autumn", "winter"].indexOf(b.birthday.season);
  if (s !== 0) return s;
  return a.birthday.day - b.birthday.day;
}).forEach(({ id, name, birthday, lovedItems, likedItems, hatedItems }) => {
  const schedule = DATA.NPC_SCHEDULES.find(npc => npc.npcId === id);
  table.桃源村.append(
    Object.assign(document.createElement("li"), {
      innerHTML: `
        <span>${name}</span>
        <span>${term.get(birthday.season)}${birthday.day}日</span>
        <span>${lovedItems.map((i) => term.get(i) || i).join(" ")} <span class="color-gray">></span> ${likedItems.map((i) => term.get(i) || i).join(" ")} <span class="color-gray">> … ></span> ${hatedItems.map((i) => term.get(i) || i).join(" ")}</span>
        <span>${schedule.availableDays === "all" ? "全周" : schedule.availableDays.map((i) => term.get(i)).join("")} ${schedule.availableHours.from}-${schedule.availableHours.to}</span>
      `
    })
  );
});

Object.entries(DATA.SEASON_COEFFICIENTS).forEach(([category, coefficient]) => {
  table.商圈.append(
    Object.assign(document.createElement("li"), {
      innerHTML: `
        <span>${DATA.MARKET_CATEGORY_NAMES[category]}</span>
        <span class="cell-r">${coefficient[0]}</span>
        <span class="cell-r">${coefficient[1]}</span>
        <span class="cell-r">${coefficient[2]}</span>
        <span class="cell-r">${coefficient[3]}</span>
      `
    })
  );
});

DATA.SHOPS.forEach(({ name, closedDays, openHour, closeHour, closedWeathers, closedSeasons }) => {
  const unavailable = [
    closedDays.length ? `周${closedDays.map(d => term.get(d)).join("")}` : ``,
    closedSeasons.length ? closedSeasons.map(s => term.get(s)).join("") : ``,
    closedWeathers.length ? closedWeathers.map(s => term.get(s)).join("") : ``
  ].filter(Boolean).join(" / ");
  document.getElementById("商圈").append(
    Object.assign(document.createElement("h3"), {
      textContent: name
    }),
    Object.assign(document.createElement("p"), {
      innerHTML: `营业时间：${openHour}-${closeHour}　休息时间：${unavailable}`
    }),
    Object.assign(document.createElement("ul"), {
      id: `table-${name}`,
      className: `grid`,
      innerHTML: `<li class="th">
        <span>名称</span>
        <span class="cell-r">价格</span>
        <span>材料</span>
        <span>说明</span>
      </li>`
    })
  );
});

Object.entries(DATA.SHOP_ITEMS).forEach(([shop, items]) => {
  items.forEach(({ name, price, recipe, description }) => {
    table[shop].append(
      Object.assign(document.createElement("li"), {
        innerHTML: `
          <span>${name}</span>
          <span class="cell-r">${price}</span>
          <span>${recipe || ""}</span>
          <span>${description || ""}</span>
        `
      })
    );
  });
});

Object.entries(DATA.TOOL_NAMES).forEach(([id, name]) => {
  ["iron", "steel", "iridium"].forEach((tier, i) => {
    const cost = DATA.TOOL_UPGRADE_COSTS[id][i];
    table.工坊.append(
      Object.assign(document.createElement("li"), {
        innerHTML: `
          <span>${i ? "" : name}</span>
          <span>${DATA.TIER_NAMES[tier]}</span>
          <span class="cell-r">${cost.money}</span>
          <span>${cost.materials.map(i => `${term.get(i.itemId)}×${i.quantity}`).join(" ")}</span>
        `
      })
    );
  });
});

DATA.RECIPES.forEach(({name, ingredients, effect, unlockSource}) => {
  table.灶台.append(
    Object.assign(document.createElement("li"), {
      innerHTML: `
        <span>${name}</span>
        <span>${ingredients.map(i => `${term.get(i.itemId)}×${i.quantity}`).join(" ")}</span>
        <span>体力+${effect.staminaRestore} 血量+${effect.healthRestore} ${effect.buff ? effect.buff?.description : ""} </span>
        <span>${unlockSource}</span>
      `
    })
  );
});

DATA.MUSEUM_ITEMS.forEach(({name, category, sourceHint}) => {
  table.博物馆.append(
    Object.assign(document.createElement("li"), {
      innerHTML: `
        <span>${name}</span>
        <span>${term.get(category)}</span>
        <span>${sourceHint}</span>
      `
    })
  );
});








Object.entries(table).forEach(([i, t]) => {
  document.querySelector(`#table-${i}`).append(t);
});



document.querySelectorAll(`a[href^="#"]`).forEach((a) => {
  a.addEventListener("click", e => {
    const id = a.getAttribute("href").slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    })
    history.replaceState(null, "", location.pathname + location.search)
  })
})