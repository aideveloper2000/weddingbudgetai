// Shared helpers for the Wishlist feature (couple page + guest page).
export function encodeData(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeData(str) {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

export function makeId() {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

export function wishStorageKey(id) {
  return `wishlist_${id}`;
}

export function emptyWishlist(couple = '') {
  return {
    couple,
    wishes: [
      { id: 'w1', emoji: '🏔️', title: 'Honeymoon trip to Kashmir', note: 'A week in the valleys together', target: 150000 },
      { id: 'w2', emoji: '🛋️', title: 'New home furniture', note: 'Our first home, together', target: 100000 },
      { id: 'w3', emoji: '📸', title: 'Wedding photoshoot', note: 'A professional pre-wedding shoot', target: 60000 },
      { id: 'w4', emoji: '🍽️', title: 'Special dinner', note: 'A quiet dinner just the two of us', target: 25000 },
      { id: 'w5', emoji: '🧺', title: 'Home appliances', note: 'The little things that make a home', target: 120000 },
    ],
    blessings: [],
    approved: [],
  };
}

export function loadWishlist(id) {
  try {
    const raw = localStorage.getItem(wishStorageKey(id));
    if (raw) {
      const data = JSON.parse(raw);
      return { ...emptyWishlist(), ...data, wishes: data.wishes || [], blessings: data.blessings || [], approved: data.approved || [] };
    }
  } catch {}
  return null;
}

export function saveWishlist(id, data) {
  try { localStorage.setItem(wishStorageKey(id), JSON.stringify(data)); } catch {}
}

export function guestUrl(id, data) {
  const base = `${window.location.origin}${window.location.pathname}`;
  const snapshot = encodeData({ couple: data.couple, wishes: data.wishes.map(({ id: wid, emoji, title, note, target }) => ({ id: wid, emoji, title, note, target })) });
  return `${base}?wishlist=${encodeURIComponent(id)}#w=${snapshot}`;
}

export function blessingUrl(id, blessing) {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}?wishlist=${encodeURIComponent(id)}&to=couple#b=${encodeData(blessing)}`;
}
