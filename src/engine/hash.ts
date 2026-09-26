/**
 * Deterministic fake content hashes for the Git simulator.
 * Not cryptographic — stable ids so levels and goals stay comparable.
 */

export function fakeSha(seed: string): string {
  // FNV-1a 32-bit, expanded to 40 hex chars (git sha1-like length).
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  let h3 = 0xdeadbeef;
  let h4 = 0x8badf00d;
  let h5 = 0x9e3779b9;
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 = (h2 + c * (i + 1)) >>> 0;
    h3 = (h3 ^ (c << (i % 24))) >>> 0;
    h4 = Math.imul(h4 ^ c, 0x85ebca6b) >>> 0;
    h5 = (h5 ^ Math.imul(c + i, 0xc2b2ae35)) >>> 0;
  }
  const part = (n: number) => n.toString(16).padStart(8, '0');
  return part(h1) + part(h2) + part(h3) + part(h4) + part(h5).slice(0, 8);
}

export function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

export function commitHash(seed: string): string {
  return fakeSha(`commit:${seed}`).slice(0, 7);
}

export function blobHash(seed: string): string {
  return fakeSha(`blob:${seed}`);
}
