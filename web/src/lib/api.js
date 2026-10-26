const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The server answers 202 while it scrapes the week's tilbudsaviser the first time.
export async function fetchWeek({ onWaiting } = {}) {
  for (let attempt = 0; attempt < 90; attempt++) {
    const res = await fetch('/api/week');
    if (res.status === 200) return res.json();
    if (res.status !== 202) throw new Error(`Serveren svarede ${res.status}`);
    onWaiting?.();
    await sleep(3000);
  }
  throw new Error('Det tog for lang tid at hente tilbudsaviserne');
}
