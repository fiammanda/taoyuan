const term = new Map([
  ["spring", "春"],
  ["summer", "夏"],
  ["autumn", "秋"],
  ["winter", "冬"],
  ["mon", "一"],
  ["tue", "二"],
  ["wed", "三"],
  ["thu", "四"],
  ["fri", "五"],
  ["sat", "六"],
  ["sun", "日"]
]);
DATA.ITEMS.forEach(({id, name}) => {
  term.set(id, name);
});

const table = Object.fromEntries(
  "abcd".split("").map((letter) => [
    letter,
    document.createDocumentFragment()
  ])
);

DATA.CROPS.forEach(({ name, season, growthDays, sellPrice, seedPrice, description, giantCropEligible, regrowth, regrowthDays, maxHarvests }) => {
  table.a.append(
    Object.assign(document.createElement("li"), { 
      innerHTML: `
        <span>${name}</span>
        <span>${season.map((s) => term.get(s)).join("")}</span>
        <span>${growthDays}</span>
        <span>${seedPrice}</span>
        <span>${sellPrice}</span>
        <span>${giantCropEligible ? "√" : ""}</span>
        <span>${regrowth ? "√" : ""}</span>
        <span>${regrowthDays || ""}</span>
        <span>${maxHarvests || ""}</span>
        <span>${description.length >= 15 ? description.split("，")[0].replace("。", "") : description.slice(0, -1)}</span>
      `
    })
  );
});

DATA.FRUIT_TREE_DEFS.forEach(({ name, saplingPrice, fruitName, fruitSeason, growthDays, fruitSellPrice }) => {
  table.b.append(
    Object.assign(document.createElement("li"), { 
      innerHTML: `
        <span>${name}</span>
        <span>${fruitName}</span>
        <span>${term.get(fruitSeason)}</span>
        <span>${growthDays}</span>
        <span>${saplingPrice}</span>
        <span>${fruitSellPrice}</span>
      `
    })
  );
});

DATA.WILD_TREE_DEFS.forEach(({ name, tapProductName, growthDays, tapCycleDays }) => {
  table.c.append(
    Object.assign(document.createElement("li"), { 
      innerHTML: `
        <span>${name}</span>
        <span>${tapProductName}</span>
        <span>${growthDays}</span>
        <span>${tapCycleDays}</span>
      `
    })
  );
});

DATA.NPCS.sort((a, b) => {
  const s = ["spring", "summer", "autumn", "winter"].indexOf(a.birthday.season) - ["spring", "summer", "autumn", "winter"].indexOf(b.birthday.season);
  if (s !== 0) return s;
  return a.birthday.day - b.birthday.day;
}).forEach(({ id, name, birthday, lovedItems, likedItems }) => {
  const schedule = DATA.NPC_SCHEDULES.find(npc => npc.npcId === id);
  table.d.append(
    Object.assign(document.createElement("li"), { 
      innerHTML: `
        <span>${name}</span>
        <span>${term.get(birthday.season)}${birthday.day}日</span>
        <span>${lovedItems.map((i) => term.get(i) || i).join(" ")} > ${likedItems.map((i) => term.get(i) || i).join(" ")}</span>
        <span>${schedule.availableDays === "all" ? "全周" : schedule.availableDays.map((i) => term.get(i)).join("")} ${schedule.availableHours.from}-${schedule.availableHours.to}</span>
      `
    })
  );
});






Object.entries(table).forEach(([l, t]) => {
  document.querySelector(`#table-${l}`).append(t);
});



document.querySelectorAll("nav a").forEach((a) => {
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