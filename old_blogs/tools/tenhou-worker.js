// Multi-rule Tenhou / Tianhu Simulator Web Worker (Optimized & Mathematically Unbiased)
// Uses existing mahjong.js functions without modifying Win.
importScripts("mahjong.js?v=202611080115");

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
    shura: { handSize: 13, guse: guseall, hasFlowers: false },
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
        let lastIdx = 0;

        // 1. Unbiased Partial Fisher-Yates shuffle (clean sampling without redundant tracking)
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
                t[wall[i]]++;
            }
            lastIdx = kHand - 1;
        }

        // 2. Winning hand evaluation delegating directly to mahjong.js core algorithms with noJoker=true
        let yakuType = null;

        if (mode === "jp4") {
            // 4-player Riichi (no wildcards)
            if (allowedTypesSet.has("normal") && Win(t, 14)) {
                yakuType = "normal";
            } else if (allowedTypesSet.has("pair7") && PairStep(t, true, guseall, Infinity, true) === -1) {
                yakuType = "pair7";
            } else if (allowedTypesSet.has("kokushi") && OrphanStep(t) === -1) {
                yakuType = "kokushi";
            }
        } else if (mode === "jp3") {
            // 3-player Riichi (no wildcards)
            if (allowedTypesSet.has("normal") && Win(t, 14, Infinity, guse3p)) {
                yakuType = "normal";
            } else if (allowedTypesSet.has("pair7") && PairStep(t, true, guse3p, Infinity, true) === -1) {
                yakuType = "pair7";
            } else if (allowedTypesSet.has("kokushi") && OrphanStep(t) === -1) {
                yakuType = "kokushi";
            }
        } else if (mode === "shura") {
            // Majsoul All-Form Shura: 13 dealt tiles + 1 universal wildcard (JokerC)
            // 13 dealt tiles are pure natural tiles (no wildcards in hand, noJoker=true)
            if (allowedTypesSet.has("normal") && Listen(t, 13, 14)) {
                yakuType = "normal";
            } else if (allowedTypesSet.has("pair7") && PairStep(t, true, guseall, Infinity, true) === 0) {
                yakuType = "pair7";
            } else if (allowedTypesSet.has("kokushi") && OrphanStep(t) === 0) {
                yakuType = "kokushi";
            }
        } else if (mode === "gb") {
            // Guobiao: Standard, 7 pairs, 13 orphans, Bukao, Knit Dragon (no wildcards)
            if (allowedTypesSet.has("normal") && Win(t, 14)) {
                yakuType = "normal";
            } else if (allowedTypesSet.has("pair7") && PairStep(t, false, guseall, Infinity, true) === -1) {
                yakuType = "pair7";
            } else if (allowedTypesSet.has("orphan13") && OrphanStep(t, false) === -1) {
                yakuType = "orphan13";
            } else if (allowedTypesSet.has("quanbukaoxing") && typeof Bukao16Count === "function" && Bukao16Count(t) === 14) {
                yakuType = "quanbukaoxing";
            } else if (allowedTypesSet.has("zuhelongxing") && typeof KnitDragonStep === "function" && KnitDragonStep(t, 14, true) === -1) {
                yakuType = "zuhelongxing";
            }
        } else if (mode === "sc") {
            // Sichuan: natural deal lacking at least one suit (no wildcards)
            let m = 0, p = 0, s = 0;
            for (let i = 0; i < 9; i++) m += t[i];
            for (let i = 9; i < 18; i++) p += t[i];
            for (let i = 18; i < 27; i++) s += t[i];
            if (!m || !p || !s) {
                if (allowedTypesSet.has("normal") && Win(t, 14)) {
                    yakuType = "normal";
                } else if (allowedTypesSet.has("pair7") && PairStep(t, false, guseall, Infinity, true) === -1) {
                    yakuType = "pair7";
                }
            }
        } else if (mode === "tw") {
            // Taiwan 16-tile: 17 tiles, standard 5 melds + 1 pair, or special hands (no wildcards)
            if (allowedTypesSet.has("normal") && Win(t, 17)) {
                yakuType = "normal";
            } else if (allowedTypesSet.has("niconico") && typeof NiconicoStep === "function" && NiconicoStep(t, true) === -1) {
                yakuType = "niconico";
            } else if (allowedTypesSet.has("shiliubudaxing") && typeof Buda16Step === "function" && Buda16Step(t) === -1) {
                yakuType = "shiliubudaxing";
            } else if (allowedTypesSet.has("orphan13") && typeof OrphanMeldStep === "function" && OrphanMeldStep(t) === -1) {
                yakuType = "orphan13";
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
            if (mode === "shura") {
                hand.unshift(typeof JokerC !== "undefined" ? JokerC : 42);
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


