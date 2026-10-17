// Armazenamento da demo (localStorage). Na versão real vira API + banco.
window.RB = (() => {
  const KEY = "rb_db_v1";
  const SERVICES = [
    { id: "corte", name: "Corte", price: 70, min: 45 },
    { id: "barba", name: "Barba", price: 50, min: 30 },
    { id: "combo", name: "Corte + barba", price: 110, min: 75 },
    { id: "selagem", name: "Selagem", price: 120, min: 60 },
    { id: "sobrancelha", name: "Sobrancelha", price: 25, min: 15 },
  ];
  const HOURS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };

  function seed() {
    const names = ["Diego Vinícius", "Hélio Costa", "Daniel Raylander", "Lucas Martins", "Pedro Henrique", "Gabriel Souza", "Matheus Lima"];
    const bookings = [];
    let id = 1;
    for (let day = -6; day <= 6; day++) {
      HOURS.forEach((h, i) => {
        if ((i * 7 + day * 3 + 11) % 4 !== 0) return;
        const s = SERVICES[(i + day + 10) % SERVICES.length];
        bookings.push({
          id: id++, date: addDays(day), time: h, service: s.id, name: names[(i + day + 14) % names.length],
          phone: "6299" + String(1000000 + i * 3137 + day * 911).slice(0, 7), address: ["Setor Bueno", "Marista", "Jardim Goiás", "Setor Sul", "Alphaville"][(i + 7) % 5],
          status: day < 0 ? "done" : "confirmed", price: s.price, createdAt: Date.now(),
        });
      });
    }
    return {
      bookings,
      blocked: [],
      stock: [
        { id: 1, name: "Pomada modeladora", qty: 6, min: 3, unit: "un", cost: 28 },
        { id: 2, name: "Óleo para barba", qty: 2, min: 3, unit: "un", cost: 35 },
        { id: 3, name: "Lâminas de navalha", qty: 40, min: 20, unit: "un", cost: 0.8 },
        { id: 4, name: "Toalhas descartáveis", qty: 18, min: 30, unit: "un", cost: 1.2 },
        { id: 5, name: "Produto selagem", qty: 1, min: 1, unit: "fr", cost: 160 },
        { id: 6, name: "Shampoo", qty: 3, min: 2, unit: "fr", cost: 42 },
      ],
    };
  }

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { return seed(); } };
  const save = (db) => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} };
  let db = load(); save(db);

  return {
    SERVICES, HOURS, iso, addDays,
    get db() { return db; },
    commit(fn) { fn(db); save(db); window.dispatchEvent(new Event("rb:change")); },
    service: (id) => SERVICES.find((s) => s.id === id),
    taken(date) {
      const busy = new Set(db.bookings.filter((b) => b.date === date && b.status !== "canceled").map((b) => b.time));
      db.blocked.filter((b) => b.date === date).forEach((b) => busy.add(b.time));
      return busy;
    },
    reset() { db = seed(); save(db); window.dispatchEvent(new Event("rb:change")); },
  };
})();
addEventListener("storage", () => location.reload());
