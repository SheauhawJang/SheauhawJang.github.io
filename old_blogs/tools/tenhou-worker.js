// Multi-rule Tenhou / Tianhu Simulator Web Worker (Optimized & Mathematically Unbiased)
// Uses existing mahjong.js functions without modifying Win.
importScripts("mahjong.js?v=202611031620");

let isRunning = false;
let currentMode = "jp4";
let wall = null;
let handSize = 14;
let allowedTypesSet = new Set(["normal", "pair7", "kokushi", "orphan13", "quanbukaoxing", "zuhelongxing", "niconico", "shiliubudaxing"]);

const t = new Array(typeof sizeAT !== "undefined" ? sizeAT : 51).fill(0);

// SplitMix64 + Xoshiro128** PRNG
function rotl(x, k) { return (x << k) | (x >>> (32 - k)); }
let s0 = 1, s1 = 2, s2 = 3, s3 = 4;

function initRng(seed) {
    let z = (seed >>> 0);
    function nextSplitMix() {
        z = (z + 0x9e3779b9) >>> 0;
        let y = Math.imul(z ^ (z >>> 16), 0x85ebca6b) >>> 0;
        y = Math.imul(y ^ (y >>> 13), 0xc2b2ae35) >>> 0;
        return (y ^ (y >>> 16)) >>> 0;
    }
    s0 = nextSplitMix() || 1;
    s1 = nextSplitMix() || 2;
    s2 = nextSplitMix() || 3;
    s3 = nextSplitMix() || 4;
}

function nextRng() {
    const r = Math.imul(rotl(Math.imul(s1, 5), 7), 9) >>> 0;
    const tmp = s1 << 9;
    s2 ^= s0; s3 ^= s1; s1 ^= s2; s0 ^= s3; s2 ^= tmp; s3 = rotl(s3, 11);
    return r >>> 0;
}

const guseSC = guseall.map((_, i) => (i >= 27 ? Infinity : 0));
const MODE_CONFIG = {
    jp4: { handSize: 14, guse: guseall, hasFlowers: false },
    jp3: { handSize: 14, guse: guse3p,  hasFlowers: false },
    gb:  { handSize: 14, guse: guseall, hasFlowers: true },
    sc:  { handSize: 14, guse: guseSC,  hasFlowers: false },
    tw:  { handSize: 17, guse: guseall, hasFlowers: true }
};

function initWall(mode) {
    currentMode = mode;
    const cfg = MODE_CONFIG[mode] || MODE_CONFIG.jp4;
    handSize = cfg.handSize;
    wall = getMahjongWall(cfg.guse, cfg.hasFlowers);
}

function runLoop(batchSize) {
    if (!isRunning) return;
    let localCount = 0;
    const wallLen = wall.length;
    const kHand = handSize;
    const mode = currentMode;
    const hasFlowers = (mode === "gb" || mode === "tw");

    for (let k = 0; k < batchSize; k++) {
        localCount++;
        let hasPair = false;
        let pairs2 = 0;
        let pairs3 = 0;
        let pairs4 = 0;
        let nonOrphan = 0;

        let lastIdx = 0;

        // 1. Unbiased Partial Fisher-Yates shuffle (continuous sampling from full wall)
        if (hasFlowers) {
            let handCount = 0;
            for (let i = 0; i < wallLen; i++) {
                const j = i + Math.floor((nextRng() / 4294967296) * (wallLen - i));
                const tmp = wall[i]; wall[i] = wall[j]; wall[j] = tmp;
                const id = wall[i];
                if (id >= 34) {
                    continue; // Skip flower tile, draw replacement from wall
                }
                t[id]++;
                if (t[id] === 2) { hasPair = true; pairs2++; }
                else if (t[id] === 3) { pairs2--; pairs3++; }
                else if (t[id] === 4) { pairs3--; pairs4++; }
                if (id < 27 && id !== 0 && id !== 8 && id !== 9 && id !== 17 && id !== 18 && id !== 26) {
                    nonOrphan++;
                }
                handCount++;
                if (handCount === kHand) {
                    lastIdx = i;
                    break;
                }
            }
        } else {
            for (let i = 0; i < kHand; i++) {
                const j = i + Math.floor((nextRng() / 4294967296) * (wallLen - i));
                const tmp = wall[i]; wall[i] = wall[j]; wall[j] = tmp;
                const id = wall[i];
                t[id]++;
                if (t[id] === 2) { hasPair = true; pairs2++; }
                else if (t[id] === 3) { pairs2--; pairs3++; }
                else if (t[id] === 4) { pairs3--; pairs4++; }
                if (id < 27 && id !== 0 && id !== 8 && id !== 9 && id !== 17 && id !== 18 && id !== 26) {
                    nonOrphan++;
                }
            }
            lastIdx = kHand - 1;
        }

        // 2. Fast pre-filter & Winning hand evaluation using existing mahjong.js functions
        let yakuType = null;

        if (mode === "jp4") {
            // 4-player Riichi
            if (allowedTypesSet.has("normal") && hasPair && Win(t, 14)) {
                yakuType = "normal";
            } else if (allowedTypesSet.has("pair7") && pairs2 === 7 && PairStep(t, true) === -1) {
                yakuType = "pair7";
            } else if (allowedTypesSet.has("kokushi") && nonOrphan === 0 && OrphanStep(t) === -1) {
                yakuType = "kokushi";
            }
        } else if (mode === "jp3") {
            // 3-player Riichi (guse3p)
            if (allowedTypesSet.has("normal") && hasPair && Win(t, 14, Infinity, guse3p)) {
                yakuType = "normal";
            } else if (allowedTypesSet.has("pair7") && pairs2 === 7 && PairStep(t, true, guse3p) === -1) {
                yakuType = "pair7";
            } else if (allowedTypesSet.has("kokushi") && nonOrphan === 0 && OrphanStep(t) === -1) {
                yakuType = "kokushi";
            }
        } else if (mode === "gb") {
            // Guobiao: Standard, 7 pairs, 13 orphans, Bukao (all unsuited), Knit Dragon
            if (allowedTypesSet.has("normal") && hasPair && Win(t, 14)) {
                yakuType = "normal";
            } else if (allowedTypesSet.has("pair7") && (pairs2 + pairs4 * 2 === 7) && PairStep(t, false) === -1) {
                yakuType = "pair7";
            } else if (allowedTypesSet.has("orphan13") && nonOrphan === 0 && OrphanStep(t, false) === -1) {
                yakuType = "orphan13";
            } else if (allowedTypesSet.has("quanbukaoxing") && !hasPair && typeof Bukao16Count === "function" && Bukao16Count(t) === 14) {
                yakuType = "quanbukaoxing";
            } else if (allowedTypesSet.has("zuhelongxing") && typeof KnitDragonSave !== "undefined") {
                let hasKnit = false;
                for (let p = 0; p < 6; p++) {
                    let full = true;
                    const seq = KnitDragonSave[p];
                    for (let s = 0; s < 9; s++) {
                        if (t[seq[s]] === 0) { full = false; break; }
                    }
                    if (full) { hasKnit = true; break; }
                }
                if (hasKnit && KnitDragonStep(t, 14) === -1) {
                    yakuType = "zuhelongxing";
                }
            }
        } else if (mode === "sc") {
            // Sichuan: natural deal lacking at least one suit (先天和后定缺)
            let m = 0, p = 0, s = 0;
            for (let i = 0; i < 9; i++) m += t[i];
            for (let i = 9; i < 18; i++) p += t[i];
            for (let i = 18; i < 27; i++) s += t[i];
            const voided = !m ? 0 : (!p ? 1 : (!s ? 2 : -1));
            if (voided !== -1) {
                const g = guseque[voided];
                if (allowedTypesSet.has("normal") && hasPair && Win(t, 14, Infinity, g)) {
                    yakuType = "normal";
                } else if (allowedTypesSet.has("pair7") && (pairs2 + pairs4 * 2 === 7) && PairStep(t, false, g) === -1) {
                    yakuType = "pair7";
                }
            }
        } else if (mode === "tw") {
            // Taiwan 16-tile: 17 tiles, standard 5 melds + 1 pair, or special hands
            if (allowedTypesSet.has("normal") && hasPair && Win(t, 17)) {
                yakuType = "normal";
            } else if (allowedTypesSet.has("niconico") && (pairs2 + pairs4 * 2 >= 6) && typeof NiconicoStep === "function" && NiconicoStep(t) === -1) {
                yakuType = "niconico";
            } else if (allowedTypesSet.has("orphan13") && nonOrphan <= 3 && typeof OrphanMeldStep === "function" && OrphanMeldStep(t) === -1) {
                yakuType = "orphan13";
            } else if (allowedTypesSet.has("shiliubudaxing") && pairs3 === 0 && pairs4 === 0 && pairs2 <= 1 && typeof Buda16Step === "function" && Buda16Step(t) === -1) {
                yakuType = "shiliubudaxing";
            }
        }

        // 3. If won, stop and post success
        if (yakuType) {
            isRunning = false;
            const hand = [];
            const flowers = [];
            for (let i = 0; i <= lastIdx; i++) {
                const id = wall[i];
                if (id >= 34) flowers.push(id);
                else {
                    hand.push(id);
                    t[id] = 0;
                }
            }
            self.postMessage({ type: "success", count: localCount, hand, flowers, yakuType, mode });
            return;
        }

        // 4. Clean up count table (no rollback needed: sampling from any valid permutation of the full wall is strictly unbiased)
        for (let i = 0; i <= lastIdx; i++) {
            if (wall[i] < 34) t[wall[i]] = 0;
        }
    }

    self.postMessage({ type: "progress", count: localCount });
    if (isRunning) {
        setTimeout(() => runLoop(batchSize), 0);
    }
}

self.onmessage = function (e) {
    const data = e.data;
    if (data.type === "start") {
        isRunning = true;
        initWall(data.mode || "jp4");
        if (Array.isArray(data.allowedTypes) && data.allowedTypes.length > 0) {
            allowedTypesSet = new Set(data.allowedTypes);
        } else {
            allowedTypesSet = new Set(["normal", "pair7", "kokushi", "orphan13", "quanbukaoxing", "zuhelongxing", "niconico", "shiliubudaxing"]);
        }
        initRng(data.seed || (Date.now() ^ (Math.random() * 0x100000000)));
        const batch = data.batchSize || 20000;
        runLoop(batch);
    } else if (data.type === "stop") {
        isRunning = false;
    }
};
