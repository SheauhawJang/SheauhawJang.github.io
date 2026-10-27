function realdvd(tiles, full_tcnt, guse) {
    const nm = Math.floor(full_tcnt / 3);
    const np = full_tcnt % 3 ? 1 : 0;
    const { dvd, ldDvd } = prepareDvd(nm, np, tiles);
    const cnt = kernelRealDvd(tiles, nm, np, dvd, ldDvd, guse);
    return { cnt, dvd, ldDvd };
}
function kernelRealDvd(tiles, nm, np, dvd, ldDvd, guse, em = 0, ep = 0, i = 0, ui = 0, uj = 0, aj = 0, bj = 0, cj = 0) {
    if (i >= sizeUT)
        if (em === nm && ep === np) return 1;
        else return 0;
    const dpi = indexDvd(ldDvd, em, ep, i, ui, uj, aj, bj, cj);
    if (dvd[dpi] !== null) return dvd[dpi].cnt;
    let nxti;
    for (nxti = i + 1; nxti < sizeUT; ++nxti) if (guse[nxti] !== Infinity) break;
    if (guse[i] === Infinity) {
        // only when i === 0, which means all usage should be 0
        const ans = kernelRealDvd(tiles, nm, np, dvd, ldDvd, guse, em, ep, nxti, 0, 0, 0, 0, 0);
        if (ans) dvd[dpi] = { cnt: ans, nxt: [{ p: 0, s: 0, k: 0, nxti, dpi: indexDvd(ldDvd, em, ep, nxti, 0, 0, 0, 0, 0) }] };
        return ans;
    }
    dvd[dpi] = { cnt: 0, nxt: [] };
    let [ra, rb, rc] = [tiles[JokerA[i]] - aj, tiles[JokerB[i]] - bj, tiles[JokerC] - cj];
    let ei = tiles[i];
    if (JokerA[i] !== JokerA[nxti]) ((ei += ra), (ra = aj = 0));
    if (JokerB[i] !== JokerB[nxti]) ((ei += rb), (rb = bj = 0));
    if (i >= sizeUT) ((ei += rc), (rc = cj = 0));
    const rsum = ra + rb + rc;
    const mp = np - ep;
    const ms = SeqCheck(i) && guse[i + 1] !== Infinity && guse[i + 2] !== Infinity;
    for (let p = 0; p <= mp; ++p)
        for (let s = 0; !s || ms; ++s) {
            let [ti, tj, tk] = [s + ui + p * 2, s + uj, s];
            let es = 0;
            if (s) {
                ((es += Math.max(tj - tiles[i + 1], 0)), (tj = Math.min(tj, tiles[i + 1])));
                ((es += Math.max(tk - tiles[i + 2], 0)), (tk = Math.min(tk, tiles[i + 2])));
            }
            const jk = rsum - es - Math.max(ti - ei, 0); // jokers can used in Kezi
            if (jk < 0) break; // joker used exceed by seq and pair
            const rk = Math.max(ei - ti, 0); // cnt of remain real tiles
            const mmk = Math.ceil(rk / 3); // all remain real tiles show be used in Kezi
            const rmk = Math.floor((rk + jk) / 3);
            for (let k = mmk; k <= rmk; ++k) {
                let e = Math.max(ti + k * 3 - ei, 0) + es;
                const uaj = Math.min(ra, e);
                const ubj = Math.min(rb, e - uaj);
                const ucj = Math.min(rc, e - uaj - ubj);
                const ans = kernelRealDvd(tiles, nm, np, dvd, ldDvd, guse, em + s + k, ep + p, nxti, tj, tk, aj + uaj, bj + ubj, cj + ucj);
                if (ans) {
                    dvd[dpi].cnt += ans;
                    dvd[dpi].nxt.push({ p, s, k, nxti, dpi: indexDvd(ldDvd, em + s + k, ep + p, nxti, tj, tk, aj + uaj, bj + ubj, cj + ucj) });
                }
            }
        }
    return dvd[dpi].cnt;
}
function cartesianProduct(g, arrays, prefix = Array(arrays.length).fill(null), i = 0) {
    if (arrays.length === i) {
        g(prefix);
        return;
    }
    const currect = arrays[i];
    for (let j = 0; j < currect.length; ++j) {
        prefix[i] = currect[j];
        cartesianProduct(g, arrays, prefix, i + 1);
    }
}
function MeldsPermutation(aids, tiles = getTiles(aids[0]), full_tcnt = aids[0].length, ota = Array(sizeUT).fill(0), guse = guseall, openseq = true) {
    let submeld = ArrayMap(aids[1].length, () => []);
    let [ek, ck] = [0, 0];
    let nsubots = 1;
    for (let i = 0; i < aids[1].length; ++i) {
        let wfc = aids[1][i].map((x) => x.id);
        if (wfc.length === 3) wfc = wfc.sort((a, b) => a - b);
        if (openseq && isSeq(wfc))
            if (wfc[2] < sizeUT) submeld[i].push(wfc);
            else {
                const [a, b] = wfc;
                if (isSeq([a - 1, a, b])) submeld[i].push([a - 1, a, b]);
                if (isSeq([a, b, b + 1])) submeld[i].push([a, b, b + 1]);
                if (isSeq([a, a + 1, b])) submeld[i].push([a, a + 1, b]);
            }
        else {
            for (let j = 0; j < sizeUT; ++j)
                if (canBeReal(j, wfc)) {
                    submeld[i].push(wfc.length === 3 ? tri[j] : quad[j]);
                    if (wfc.length === 3 && wfc[1] >= sizeUT && SeqCheck(j)) submeld[i].push(seq[j]);
                }
            if (wfc.length === 4)
                if (aids[1][i].type % 4 === 0) ++ck;
                else ++ek;
        }
        let reduce = [];
        for (let j = 0; j < submeld[i].length; ++j) {
            let skip = false;
            for (let k = 0; k < submeld[i][j].length; ++k) {
                if (guse[submeld[i][j][k]] === Infinity) {
                    skip = true;
                    break;
                }
            }
            if (!skip) reduce.push(submeld[i][j]);
        }
        submeld[i] = reduce;
        nsubots *= submeld[i].length;
    }
    const { cnt, dvd } = realdvd(tiles, full_tcnt, guse);
    const nmp = Math.floor(full_tcnt / 3) + (full_tcnt % 3 ? 1 : 0);
    let melds = Array(nmp).fill(null);
    let msze = 0;
    function dfs(f, i = 0, dpi = 0) {
        if (msze === nmp) {
            f(melds, ota);
            return;
        }
        const ans = dvd[dpi];
        for (let j = 0; j < ans.nxt.length; ++j) {
            const n = ans.nxt[j];
            for (let p = 0; p < n.p; ++p) melds[msze++] = pair[i];
            for (let s = 0; s < n.s; ++s) melds[msze++] = seq[i];
            for (let k = 0; k < n.k; ++k) melds[msze++] = tri[i];
            ota[i] += n.p * 2 + n.s + n.k * 3;
            if (n.s) ((ota[i + 1] += n.s), (ota[i + 2] += n.s));
            dfs(f, n.nxti, n.dpi);
            msze -= n.p + n.s + n.k;
            ota[i] -= n.p * 2 + n.s + n.k * 3;
            if (n.s) ((ota[i + 1] -= n.s), (ota[i + 2] -= n.s));
        }
    }
    return { itsubots: (g) => cartesianProduct(g, submeld), itots: dfs, nsubots, nots: cnt, ck, ek };
}
// ============================================================================
// Guobiao Meld-Binding Hypergraph Solver (GBSeqBind / GBTriBind)
// ============================================================================
const seqsave = new Map(), trisave = new Map();
let [seq_miss, seq_total, tri_miss, tri_total] = [0, 0, 0, 0];

function GetHeadFromId(id) { return (id + 1) * sizeAT; }
function GetIdFromHead(head) { return head / sizeAT - 1; }
function Get19KFan(osid) {
    if (osid === 83) return 4;
    if (osid === 183) return 3;
    if (osid === 59 || osid === 60 || osid === 61) return 2;
    return osid === 73 || (osid >= 159 && osid <= 161) ? 1 : 0;
}
function saveBindCache(cache, name, key, ans) {
    try { cache.set(key, ans); } catch { (cache.clear(), console.warn(`${name} cleared`)); }
    return ans;
}
function packBindAns(res) {
    const fan = [];
    for (const it of res.chosen) fan.push(...it.fan);
    return { val: res.val, fan };
}
function getJumpRanks(sp, lim = sp.length - 1) {
    const arr = [0], end = Math.min(lim, sp.length - 1);
    for (let r = 1; r <= end; ++r) if (sp[r] > sp[r - 1]) arr.push(r);
    return arr;
}
function applyBindEdge(compId, compSize, usedType, vs, tmsk) {
    const target = compId[vs[0]], n = compId.length;
    for (let j = 1; j < vs.length; ++j) {
        const oldC = compId[vs[j]];
        if (compSize) ((compSize[target] += compSize[oldC]), (compSize[oldC] = 0));
        for (let u = 0; u < n; ++u) if (compId[u] === oldC) compId[u] = target;
    }
    for (let j = 0; j < vs.length; ++j) usedType[vs[j]] |= tmsk;
}

// --- 1. Declarative Hyperedge Catalogs & Unified Deduction Instantiation ---
const BIND_OP_CODE = new Uint8Array(200);
[59, 60, 61, 73, 83, 159, 160, 161, 183].forEach((v, i) => (BIND_OP_CODE[v] = i + 1));
const BIND_SUIT_PERMS = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
const BIND_SUIT_PAIRS = [[0, 1], [0, 2], [1, 2]];

function makeBindPat(tiles, tmsk, baseVal, baseFan, opts) {
    const groups = [];
    for (const tile of tiles)
        if (groups.length && groups[groups.length - 1].tile === tile) ++groups[groups.length - 1].cnt;
        else groups.push({ tile, cnt: 1 });
    return {
        tiles, groups, k: tiles.length, rank: tiles.length - 1, tmsk, baseVal, baseFan,
        suit: -1, hunIdx: -1, queIdx: -1, pon1: 0, opMode: 0, opSkipIdx: -1, ...opts,
    };
}

// Spec: [scope (1=single-suit, 2=2-suit pair, 3=3-suit), maxN, k, step, baseVal, baseFan, tmsk, queIdx, pon1]
function buildSuitedCatalog(specs) {
    const pats = [];
    for (const [scope, maxN, k, d, baseVal, baseFan, tmsk, queIdx, pon1] of specs)
        if (scope === 1)
            for (let st = 0; st < 3; ++st)
                for (let n = 0; n <= maxN; ++n)
                    pats.push(makeBindPat(Array.from({ length: k }, (_, j) => st * 9 + n + j * d), tmsk, baseVal, baseFan, { suit: st, queIdx, pon1 }));
        else
            for (let n = 0; n <= maxN; ++n)
                if (scope === 2)
                    for (const [s0, s1] of BIND_SUIT_PAIRS)
                        pats.push(makeBindPat([s0 * 9 + n, s1 * 9 + n], tmsk, baseVal, baseFan, { queIdx, pon1 }));
                else if (d === 0)
                    pats.push(makeBindPat([n, 9 + n, 18 + n], tmsk, baseVal, baseFan, { queIdx, pon1 }));
                else
                    for (const p of BIND_SUIT_PERMS)
                        pats.push(makeBindPat([p[0] * 9 + n, p[1] * 9 + n + d, p[2] * 9 + n + 2 * d].sort((a, b) => a - b), tmsk, baseVal, baseFan, { queIdx, pon1 }));
    return pats;
}

const SEQ_STATIC_CATALOG = buildSuitedCatalog([
    [1, 6, 4, 0, 42, [14, -64, -64, -64], 1, 16, 0], [1, 6, 3, 0, 24, [23], 4, -1, 0], [1, 6, 2, 0, 1, [69], 128, -1, 0],
    [1, 3, 4, 1, 32, [16], 2, 44, 0], [1, 0, 4, 2, 32, [16], 2, 44, 0], [1, 0, 3, 3, 16, [28], 8, -1, 0],
    [1, 4, 3, 1, 16, [30], 2048, -1, 0], [1, 2, 3, 2, 16, [30], 2048, -1, 0],
    [1, 3, 2, 3, 1, [71], 1024, -1, 0], [1, 0, 2, 6, 1, [72], 512, -1, 0],
    [3, 0, 3, 3, 8, [39], 16, -1, 0], [3, 6, 3, 0, 8, [41], 32, -1, 0], [3, 4, 3, 1, 6, [50], 64, -1, 0],
    [2, 6, 2, 0, 1, [70], 256, -1, 0],
]);
const TRI_SUITED_CATALOG = buildSuitedCatalog([
    [1, 5, 4, 1, 48, [15], 1, 17, 1], [1, 6, 3, 1, 24, [24], 32, -1, 0], [1, 8, 2, 0, 2, [65], 1024, -1, 0],
    [3, 8, 3, 0, 16, [32], 64, -1, 0], [3, 6, 3, 1, 8, [42], 256, -1, 0], [2, 8, 2, 0, 2, [65], 1024, -1, 0],
]);

// Spec: [baseVal, fanId, hunIdx, queIdx, pon1, opMode, opSkipIdx]
const HONOR_BIND_SPECS = [
    [88, 1, 20, -1, 1, 1, -1], [64, 9, 21, -1, 0, 2, 35], [12, 38, -1, 15, 0, 2, 34],
    [88, 2, -1, 13, 0, 3, -1], [64, 10, -1, 14, 0, 3, -1], [6, 54, -1, -1, 0, 3, -1], [2, 65, -1, -1, 0, 0, -1],
];
function buildHonorCatalog(m, bigMsk, bigKind, smallMsk, smallKind, subMsk, subKind) {
    const all = Array.from({ length: m }, (_, i) => i), pats = [];
    const add = (tiles, tmsk, kind) => {
        const [baseVal, fanId, hunIdx, queIdx, pon1, opMode, opSkipIdx] = HONOR_BIND_SPECS[kind];
        pats.push(makeBindPat(tiles, tmsk, baseVal, [fanId], { kind, hunIdx, queIdx, pon1, opMode, opSkipIdx }));
    };
    add(all, bigMsk, bigKind);
    for (let i = 0; i < m; ++i) add([...all.filter((x) => x !== i), i + m], smallMsk, smallKind);
    for (let i = m - 1; i >= 0; --i) add(all.filter((x) => x !== i), subMsk, subKind);
    for (let i = 0; i < m; ++i) add([i, i], 1024, 6);
    return pats;
}
const TRI_WIND_CATALOG = buildHonorCatalog(4, 2, 0, 4, 1, 128, 2);
const TRI_DRAGON_CATALOG = buildHonorCatalog(3, 8, 3, 16, 4, 512, 5);

function instantiateBindCatalog(catalog, s, ma, numTiles, pon, setting) {
    const tileCnt = new Int32Array(numTiles), out = [];
    let commonMa = -1;
    for (let i = 0; i < s.length; ++i) (++tileCnt[s[i]], (commonMa &= ma[i]));
    for (const p of catalog) {
        if (commonMa & p.tmsk || p.groups.some((g) => tileCnt[g.tile] < g.cnt)) continue;
        let val = p.baseVal;
        const extraFan = [];
        if (p.hunIdx >= 0 && !setting[p.hunIdx] && pon & 2) ((val -= 6), extraFan.push(-49));
        if (p.queIdx >= 0 && !setting[p.queIdx] && pon & 4) (--val, extraFan.push(-75));
        if (p.pon1 && pon & 1) ((val -= 6), extraFan.push(-48));
        const fan = extraFan.length ? p.baseFan.concat(extraFan) : p.baseFan;
        const opMode = p.opSkipIdx >= 0 && setting[p.opSkipIdx] ? 0 : p.opMode;
        out.push({ ...p, val, fan, extraFan, opMode, density: val / p.rank });
    }
    return out;
}

// --- 2. Suited Relaxation Upper-Bounder (Kruskal Rank + 7-Subset Submodular DP) ---
function solveBindRankDP(items, capRank) {
    const dp = new Int32Array(capRank + 1);
    let maxR = 0;
    for (const { rank: rk, capCount: cnt, val, cumKruskalCap } of items) {
        const kCap = cumKruskalCap !== undefined ? Math.min(capRank, cumKruskalCap) : capRank;
        if (cnt <= 0 || rk > kCap) continue;
        for (let rem = cnt, step = 1; rem > 0; step <<= 1) {
            const take = Math.min(step, rem), w = rk * take, v = val * take;
            if (w <= kCap) {
                const lim = Math.min(kCap, maxR + w);
                for (let r = lim; r >= w; --r) if (dp[r - w] + v > dp[r]) dp[r] = dp[r - w] + v;
                if (lim > maxR) maxR = lim;
            }
            rem -= take;
        }
        for (let r = 1; r <= maxR; ++r) if (dp[r - 1] > dp[r]) dp[r] = dp[r - 1];
    }
    for (let r = 1; r <= capRank; ++r) if (dp[r - 1] > dp[r]) dp[r] = dp[r - 1];
    return dp;
}

function maxCrossRankVal(leftG, u0, u1, u2, profM3, c2Cap, c2Val) {
    if (leftG <= 0) return 0;
    let cap01 = leftG, cap02 = leftG, cap12 = leftG, m3Lim = Math.min(leftG >> 1, profM3.length - 1);
    const sub = u0 >= 0;
    if (sub) {
        cap01 = u0 > 0 && u1 > 0 ? u0 + u1 - 1 : 0;
        cap02 = u0 > 0 && u2 > 0 ? u0 + u2 - 1 : 0;
        cap12 = u1 > 0 && u2 > 0 ? u1 + u2 - 1 : 0;
        m3Lim = u0 > 0 && u1 > 0 && u2 > 0 ? Math.min(m3Lim, cap01, cap02, cap12) : 0;
    }
    let best = 0;
    for (let m3 = 0; m3 <= m3Lim; ++m3) {
        const pairCap = sub ? Math.max(0, cap01 - m3) + Math.max(0, cap02 - m3) + Math.max(0, cap12 - m3) : leftG;
        const v = profM3[m3] + Math.min(leftG - 2 * m3, c2Cap, pairCap) * c2Val;
        if (v > best) best = v;
    }
    return best;
}

function createSuitedBounder(s, tileVerts, compId, usedType, activePats, extProfiles) {
    const n = s.length, mPat = activePats.length;
    const ubParent = new Int32Array(n), seenComp = new Int32Array(n);
    const suitParents = [new Int32Array(n), new Int32Array(n), new Int32Array(n)];
    const activeTileFlag = new Uint8Array(27), availByTile = new Int32Array(27), usedSuitRanks = [0, 0, 0];
    let stamp = 0;
    const findP = (arr, x) => { while (arr[x] !== x) ((arr[x] = arr[arr[x]]), (x = arr[x])); return x; };

    function computeTightProfile(pIdx, remRank) {
        for (let v = 0; v < n; ++v)
            ubParent[v] = suitParents[0][v] = suitParents[1][v] = suitParents[2][v] = compId[v];
        let rGlobal = 0;
        const rSuit = [0, 0, 0], suitItems = [[], [], []], crossItems = [], globalItems = [];
        for (let i = pIdx; i < mPat; ) {
            const { val, tmsk, rank: rk, k } = activePats[i];
            (availByTile.fill(0), activeTileFlag.fill(0));
            for (let v = 0; v < n; ++v) if (!(usedType[v] & tmsk)) ++availByTile[s[v]];
            const copiesSuit = [0, 0, 0];
            let crossCopies = 0;
            for (; i < mPat && activePats[i].val === val && activePats[i].tmsk === tmsk && activePats[i].rank === rk; ++i) {
                const pat = activePats[i];
                if (pat.rank > remRank) continue;
                let copies = n;
                for (const { tile, cnt: need } of pat.groups) {
                    const av = availByTile[tile];
                    if (av < need) { copies = 0; break; }
                    ++stamp;
                    let cCnt = 0;
                    for (const v of tileVerts[tile])
                        if (!(usedType[v] & tmsk) && seenComp[compId[v]] !== stamp) ((seenComp[compId[v]] = stamp), ++cCnt);
                    if (cCnt < need) { copies = 0; break; }
                    copies = Math.min(copies, need === 1 ? av : Math.min((av / need) | 0, ((cCnt - 1) / (need - 1)) | 0));
                }
                if (copies <= 0) continue;
                pat.suit >= 0 ? (copiesSuit[pat.suit] += copies) : (crossCopies += copies);
                let rootG = -1, rootS = -1;
                for (const { tile } of pat.groups) {
                    activeTileFlag[tile] = 1;
                    for (const v of tileVerts[tile]) {
                        if (usedType[v] & tmsk) continue;
                        const rg = findP(ubParent, v);
                        rootG === -1 ? (rootG = rg) : rg !== rootG && ((ubParent[rg] = rootG), ++rGlobal);
                        if (pat.suit >= 0) {
                            const sp = suitParents[pat.suit], rs = findP(sp, v);
                            rootS === -1 ? (rootS = rs) : rs !== rootS && ((sp[rs] = rootS), ++rSuit[pat.suit]);
                        }
                    }
                }
            }
            const suitAv = [0, 0, 0];
            for (let t = 0; t < 27; ++t) if (activeTileFlag[t]) suitAv[ColorArray[t]] += availByTile[t];
            const totAv = suitAv[0] + suitAv[1] + suitAv[2];
            let sumCap = 0;
            for (let st = 0; st < 3; ++st) {
                const sCap = Math.min(copiesSuit[st], (suitAv[st] / k) | 0, (rSuit[st] / rk) | 0);
                if (sCap > 0) (suitItems[st].push({ rank: rk, capCount: sCap, val, cumKruskalCap: rSuit[st] }), (sumCap += sCap));
            }
            if (crossCopies > 0) {
                const cCap = k === 3
                    ? Math.min(crossCopies, suitAv[0], suitAv[1], suitAv[2], (rGlobal / rk) | 0)
                    : Math.min(crossCopies, totAv >> 1, totAv - Math.max(suitAv[0], suitAv[1], suitAv[2]), rGlobal);
                if (cCap > 0) (crossItems.push({ rank: rk, capCount: cCap, val }), (sumCap += cCap));
            }
            if (sumCap > 0) {
                const gCap = Math.min(sumCap, (totAv / k) | 0, (rGlobal / rk) | 0);
                if (gCap > 0) globalItems.push({ rank: rk, capCount: gCap, val, cumKruskalCap: rGlobal });
            }
        }
        const dpGlobal = rGlobal > 0 && remRank > 0 ? solveBindRankDP(globalItems, remRank) : new Int32Array(remRank + 1);
        return { dpGlobal, suitItems, crossItems, rSuit, rGlobal };
    }

    function scalarUB(pIdx, remRank, curVal, touchedMask) {
        const { dpGlobal, suitItems, crossItems, rSuit, rGlobal } = computeTightProfile(pIdx, remRank);
        if (rGlobal === 0) return curVal;
        const capR = Math.min(remRank, rGlobal);
        const profS = [0, 1, 2].map((st) =>
            extProfiles && !(touchedMask & (1 << st)) ? extProfiles[st] : solveBindRankDP(suitItems[st], Math.min(capR, rSuit[st])),
        );
        const c3Items = [];
        let c2Cap = 0, c2Val = 0;
        for (const it of crossItems)
            it.rank === 2 ? c3Items.push({ rank: 1, capCount: it.capCount, val: it.val }) : ((c2Cap += it.capCount), (c2Val = Math.max(c2Val, it.val)));
        const profM3 = solveBindRankDP(c3Items, capR >> 1);
        const jS = [0, 1, 2].map((st) => getJumpRanks(profS[st], capR));
        const submod = Boolean(extProfiles && !(touchedMask & 8));
        const [c0, c1, c2] = submod ? [0, 1, 2].map((st) => extProfiles.ns[st] - usedSuitRanks[st]) : [0, 0, 0];

        let bestSplit = 0;
        for (const dr0 of jS[0])
            for (const dr1 of jS[1]) {
                if (dr0 + dr1 > capR) break;
                for (const dr2 of jS[2]) {
                    const leftG = capR - (dr0 + dr1 + dr2);
                    if (leftG < 0) break;
                    const cross = submod
                        ? maxCrossRankVal(leftG, c0 - dr0, c1 - dr1, c2 - dr2, profM3, c2Cap, c2Val)
                        : maxCrossRankVal(leftG, -1, -1, -1, profM3, c2Cap, c2Val);
                    const v = profS[0][dr0] + profS[1][dr1] + profS[2][dr2] + cross;
                    if (v > bestSplit) bestSplit = v;
                }
            }
        return curVal + Math.min(dpGlobal[remRank], bestSplit);
    }

    return { usedSuitRanks, computeTightProfile, scalarUB };
}

// --- 3. Unified Quotient-Hypergraph Branch-and-Bound Engine ---
function solveQuotientBB(s, initMa, activePats, cfg) {
    const n = s.length, mPat = activePats.length, maxRank = cfg.maxRank, profileMode = Boolean(cfg.profileMode);
    if (n < 2 || mPat === 0 || maxRank <= 0)
        return profileMode
            ? { profile: new Int32Array(maxRank + 1), forests: Array.from({ length: maxRank + 1 }, () => []) }
            : { val: cfg.seedVal || 0, chosen: cfg.seedChosen || [] };

    const numTiles = cfg.numTiles || 27, set33 = Boolean(cfg.setting33);
    const relMask = new Int32Array(mPat + 1);
    for (let i = mPat - 1; i >= 0; --i) relMask[i] = relMask[i + 1] | activePats[i].tmsk;

    const tileVerts = Array.from({ length: numTiles }, () => []);
    const compId = new Int32Array(n), compSize = new Int32Array(n), usedType = new Int32Array(n);
    const curOp = cfg.initOp ? Int32Array.from(cfg.initOp) : null;
    for (let v = 0; v < n; ++v) {
        tileVerts[s[v]].push(v);
        compId[v] = cfg.initCompId ? cfg.initCompId[v] : v;
        usedType[v] = initMa[v];
        ++compSize[compId[v]];
    }
    const bounder = curOp ? null : createSuitedBounder(s, tileVerts, compId, usedType, activePats, cfg.extProfiles || null);

    const triedKeys = [new Int32Array(n), new Int32Array(n), new Int32Array(n), new Int32Array(n)];
    const pickV = new Int32Array(4), pickC = new Int32Array(4), pickCEnc = new Int32Array(4), pickSK = new Int32Array(4);
    let keyHi = 0, keyLo = 0, bestVal = cfg.seedVal || 0, bestChosen = (cfg.seedChosen || []).slice();
    const curChosen = [];
    const bestProfile = profileMode ? new Int32Array(maxRank + 1) : null;
    const bestForests = profileMode ? Array.from({ length: maxRank + 1 }, () => []) : null;

    function findCanonical(pat, rMask, fArr) {
        const { k, tmsk, tiles } = pat, fLen = fArr ? fArr.length : 0;
        const step = (slot) => {
            if (slot === k) {
                const hi = pickSK[0] * 8388608 + pickSK[1], lo = (k > 2 ? pickSK[2] : 0) * 8388608 + (k > 3 ? pickSK[3] : 0);
                for (let fi = 0; fi < fLen; fi += 6) if (fArr[fi + 4] === hi && fArr[fi + 5] === lo) return false;
                ((keyHi = hi), (keyLo = lo));
                return true;
            }
            const t = tiles[slot], vs = tileVerts[t], tried = triedKeys[slot];
            const minSK = slot > 0 && tiles[slot - 1] === t ? pickSK[slot - 1] : -1;
            let tLen = 0;
            for (const v of vs) {
                if (usedType[v] & tmsk) continue;
                const cid = compId[v];
                let clash = false;
                for (let p = 0; p < slot; ++p) if (pickC[p] === cid) { clash = true; break; }
                if (clash) continue;
                const cEnc = compSize[cid] === 1 ? 0 : cid + 1;
                const sKey = curOp
                    ? cEnc * 32768 + (((usedType[v] & rMask) << 4) | BIND_OP_CODE[curOp[v]])
                    : cEnc * 4096 + (usedType[v] & rMask);
                if (sKey < minSK) continue;
                let dup = false;
                for (let ti = 0; ti < tLen; ++ti) if (tried[ti] === sKey) { dup = true; break; }
                if (dup) continue;
                ((tried[tLen++] = sKey), (pickV[slot] = v), (pickC[slot] = cid), (pickCEnc[slot] = cEnc), (pickSK[slot] = sKey));
                if (step(slot + 1)) return true;
            }
            return false;
        };
        return step(0);
    }

    function evalEdge(pat, vs) {
        if (!curOp || !pat.opMode) return { v: pat.val, f: pat.fan };
        let v = pat.val;
        const f = pat.baseFan.slice();
        for (const u of vs) {
            const o = curOp[u];
            if (pat.opMode === 1 && o) ((v -= Get19KFan(o)), f.push(-o), (curOp[u] = 0));
            else if (pat.opMode === 2 && o === 73) (--v, f.push(-73), (curOp[u] = 0));
            else if (pat.opMode === 2 && set33 && o && o < 100) (--v, f.push(-73), (curOp[u] = o + 100));
            else if (pat.opMode === 3 && (o === 59 || o === 159)) ((v -= Get19KFan(o)), f.push(-o), (curOp[u] = 0));
        }
        if (pat.extraFan.length) f.push(...pat.extraFan);
        return { v, f };
    }

    function dfs(pIdx, fArr, curVal, usedRank, touchedMask) {
        if (profileMode) {
            if (curVal > bestProfile[usedRank]) {
                ((bestProfile[usedRank] = curVal), (bestForests[usedRank] = curChosen.slice()));
                for (let r = usedRank + 1; r <= maxRank; ++r)
                    if (curVal > bestProfile[r]) ((bestProfile[r] = curVal), (bestForests[r] = bestForests[usedRank]));
            }
        } else if (curVal > bestVal) ((bestVal = curVal), (bestChosen = curChosen.slice()));

        const remRank = maxRank - usedRank;
        if (remRank <= 0 || pIdx >= mPat) return;

        let ubNode = Infinity;
        if (curOp) {
            ubNode = curVal + (((remRank * activePats[pIdx].val) / activePats[pIdx].rank) | 0);
            if (ubNode <= bestVal) return;
        } else if (profileMode) {
            const { dpGlobal, rGlobal } = bounder.computeTightProfile(pIdx, remRank);
            let ok = false;
            for (let dr = 1; rGlobal > 0 && dr <= remRank; ++dr)
                if (curVal + dpGlobal[dr] > bestProfile[usedRank + dr]) { ok = true; break; }
            if (!ok) return;
        } else {
            ubNode = bounder.scalarUB(pIdx, remRank, curVal, touchedMask);
            if (ubNode <= bestVal) return;
        }

        for (let idx = pIdx; idx < mPat; ++idx) {
            const pat = activePats[idx];
            if (pat.rank > remRank) continue;
            if (curOp && (ubNode = curVal + (((remRank * pat.val) / pat.rank) | 0)) <= bestVal) return;
            const curF = idx === pIdx ? fArr : null;
            if (!findCanonical(pat, relMask[idx], curF)) continue;

            const k = pat.k, vs = Array.from(pickV.subarray(0, k));
            const [c0, c1, c2, c3, hi, lo] = [pickCEnc[0], pickCEnc[1], k > 2 ? pickCEnc[2] : 0, k > 3 ? pickCEnc[3] : 0, keyHi, keyLo];
            const [m0, m1, m2, m3] = [compId[vs[0]] + 1, compId[vs[1]] + 1, k > 2 ? compId[vs[2]] + 1 : -1, k > 3 ? compId[vs[3]] + 1 : -1];
            const savedComp = compId.slice(), savedSize = compSize.slice();
            const savedUsed = vs.map((v) => usedType[v]), savedOp = curOp ? vs.map((v) => curOp[v]) : null;

            applyBindEdge(compId, compSize, usedType, vs, pat.tmsk);
            const { v: edgeVal, f: edgeFan } = evalEdge(pat, vs);
            curChosen.push({ pat, verts: vs, fan: edgeFan });
            if (bounder && pat.suit >= 0) bounder.usedSuitRanks[pat.suit] += pat.rank;

            let incF = null;
            if (curF && curF.length) {
                incF = [];
                for (let fi = 0; fi < curF.length; fi += 6) {
                    let hit = false;
                    for (let q = 0; q < 4; ++q)
                        if (curF[fi + q] && (curF[fi + q] === m0 || curF[fi + q] === m1 || curF[fi + q] === m2 || curF[fi + q] === m3)) { hit = true; break; }
                    if (!hit) incF.push(curF[fi], curF[fi + 1], curF[fi + 2], curF[fi + 3], curF[fi + 4], curF[fi + 5]);
                }
            }
            const nextMask = bounder && pat.suit >= 0 ? touchedMask | (1 << pat.suit) : touchedMask | 15;
            dfs(idx, incF, curVal + edgeVal, usedRank + pat.rank, nextMask);

            if (bounder && pat.suit >= 0) bounder.usedSuitRanks[pat.suit] -= pat.rank;
            curChosen.pop();
            for (let j = 0; j < k; ++j) ((usedType[vs[j]] = savedUsed[j]), curOp && (curOp[vs[j]] = savedOp[j]));
            (compId.set(savedComp), compSize.set(savedSize));

            if (!profileMode && ubNode <= bestVal) return;
            const exclF = curF ? curF.slice() : [];
            exclF.push(c0, c1, c2, c3, hi, lo);
            dfs(idx, exclF, curVal, usedRank, touchedMask);
            return;
        }
    }

    dfs(0, null, 0, 0, 0);
    return profileMode ? { profile: bestProfile, forests: bestForests } : { val: bestVal, chosen: bestChosen };
}

// --- 4. Two-Stage Suit Decomposition, Honor Wrapper & Entrypoints ---
function solveSuitedTwoStage(s, initMa, feasible) {
    const n = s.length;
    if (n < 2 || feasible.length === 0) return { val: 0, fan: [] };
    const byDens = (a, b) => b.density - a.density || a.tmsk - b.tmsk || b.val - a.val;
    const suitVerts = [[], [], []];
    for (let v = 0; v < n; ++v) suitVerts[ColorArray[s[v]]].push(v);

    const suitProfiles = [null, null, null], suitForests = [null, null, null];
    for (let st = 0; st < 3; ++st) {
        const vMap = suitVerts[st];
        if (vMap.length < 2) { ((suitProfiles[st] = new Int32Array(1)), (suitForests[st] = [[]])); continue; }
        const sub = solveQuotientBB(
            vMap.map((v) => s[v]), vMap.map((v) => initMa[v]),
            feasible.filter((p) => p.suit === st).sort(byDens), { maxRank: vMap.length - 1, profileMode: true },
        );
        suitProfiles[st] = sub.profile;
        suitForests[st] = sub.forests.map((f) => f.map((it) => ({ pat: it.pat, verts: it.verts.map((lv) => vMap[lv]), fan: it.fan })));
    }

    const crossPats = feasible.filter((p) => p.suit === -1).sort(byDens);
    if (crossPats.length === 0) {
        const chosen = [];
        let val = 0;
        for (let st = 0; st < 3; ++st) {
            const maxR = suitProfiles[st].length - 1;
            ((val += suitProfiles[st][maxR]), chosen.push(...suitForests[st][maxR]));
        }
        return packBindAns({ val, chosen });
    }

    suitProfiles.ns = [suitVerts[0].length, suitVerts[1].length, suitVerts[2].length];
    const [c0, c1, c2] = suitProfiles.ns, jumps = [0, 1, 2].map((st) => getJumpRanks(suitProfiles[st]));
    let maxC3Val = 0, maxC2Val = 0;
    for (const p of crossPats) p.rank === 2 ? (maxC3Val = Math.max(maxC3Val, p.val)) : (maxC2Val = Math.max(maxC2Val, p.val));
    const stageProfM3 = Int32Array.from({ length: ((n - 1) >> 1) + 1 }, (_, m) => m * maxC3Val), candidates = [];

    for (const r0 of jumps[0])
        for (const r1 of jumps[1])
            for (const r2 of jumps[2]) {
                const leftG = n - 1 - (r0 + r1 + r2);
                if (leftG < 0) break;
                const base = suitProfiles[0][r0] + suitProfiles[1][r1] + suitProfiles[2][r2];
                const opt = base + maxCrossRankVal(leftG, c0 - r0, c1 - r1, c2 - r2, stageProfM3, n, maxC2Val);
                candidates.push({ r0, r1, r2, base, leftG, opt });
            }
    candidates.sort((a, b) => b.opt - a.opt || b.base - a.base);

    let bestVal = 0, bestChosen = [];
    const wsComp = new Int32Array(n), wsUsed = new Int32Array(n);
    for (const { r0, r1, r2, base, leftG, opt } of candidates) {
        if (opt <= bestVal) break;
        for (let v = 0; v < n; ++v) ((wsComp[v] = v), (wsUsed[v] = initMa[v]));
        const picks = [...suitForests[0][r0], ...suitForests[1][r1], ...suitForests[2][r2]];
        for (const pk of picks) applyBindEdge(wsComp, null, wsUsed, pk.verts, pk.pat.tmsk);
        if (leftG > 0) {
            const cRes = solveQuotientBB(s, wsUsed, crossPats, { maxRank: leftG, seedVal: Math.max(0, bestVal - base), initCompId: wsComp });
            if (cRes.chosen.length && base + cRes.val > bestVal) ((bestVal = base + cRes.val), (bestChosen = picks.concat(cRes.chosen)));
            else if (base > bestVal) ((bestVal = base), (bestChosen = picks));
        } else if (base > bestVal) ((bestVal = base), (bestChosen = picks));
    }

    const suitOrder = [0, 0, 0], maxCrossDens = crossPats[0].density;
    [0, 1, 2].sort((a, b) => suitVerts[a].length - suitVerts[b].length).forEach((st, idx) => (suitOrder[st] = idx));
    const globalPats = feasible.slice().sort((a, b) => {
        const aH = a.suit >= 0 && a.density > maxCrossDens ? 1 : 0, bH = b.suit >= 0 && b.density > maxCrossDens ? 1 : 0;
        return aH !== bH ? bH - aH : aH && a.suit !== b.suit ? suitOrder[a.suit] - suitOrder[b.suit] : byDens(a, b);
    });
    return packBindAns(solveQuotientBB(s, initMa, globalPats, { maxRank: n - 1, seedVal: bestVal, seedChosen: bestChosen, extProfiles: suitProfiles }));
}

function solveHonorBind(localS, initOp, initMa, pon, setting, catalog, numTiles) {
    if (localS.length < 2) return { val: 0, fan: [] };
    const pats = instantiateBindCatalog(catalog, localS, initMa, numTiles, pon, setting)
        .sort((a, b) => b.density - a.density || a.tmsk - b.tmsk);
    return packBindAns(solveQuotientBB(localS, initMa, pats, { maxRank: localS.length - 1, numTiles, initOp, setting33: setting[33] }));
}

function GBSeqBind(s, ma, que = false, setting = []) {
    ++seq_total;
    if (s.length < 2) return { val: 0, fan: [] };
    const key = `${s.join(",")}|${ma.join(",")}|${que ? 1 | (setting[16] ? 2 : 0) | (setting[44] ? 4 : 0) : 0}`;
    if (seqsave.has(key)) return seqsave.get(key);
    ++seq_miss;
    const feasible = instantiateBindCatalog(SEQ_STATIC_CATALOG, s, ma, 27, que ? 4 : 0, setting);
    return saveBindCache(seqsave, "seqsave", key, solveSuitedTwoStage(s, ma, feasible));
}

function GBTriBind(s, op, ma, pon = 0, setting = []) {
    ++tri_total;
    if (s.length < 2) return { val: 0, fan: [] };
    const sBits = [13, 14, 15, 17, 20, 21, 33, 34, 35].reduce((acc, idx, b) => acc | (setting[idx] ? 1 << b : 0), 0);
    const key = `${s.join(",")}|${op.join(",")}|${ma.join(",")}|${pon}|${sBits}`;
    if (trisave.has(key)) return trisave.get(key);
    ++tri_miss;

    const suitS = [], suitMa = [], windS = [], windOp = [], windMa = [], dragS = [], dragOp = [], dragMa = [];
    for (let i = 0; i < s.length; ++i) {
        const x = s[i];
        if (x < 27) (suitS.push(x), suitMa.push(ma[i]));
        else if (x <= 30) (windS.push(x - 27), windOp.push(op[i]), windMa.push(ma[i]));
        else if (x < sizeUT) (dragS.push(x - 31), dragOp.push(op[i]), dragMa.push(ma[i]));
        else if (x >= sizeAT) {
            const hid = GetIdFromHead(x);
            if (hid >= 27 && hid <= 30) (windS.push(hid - 27 + 4), windOp.push(op[i]), windMa.push(ma[i]));
            else if (hid >= 31 && hid < sizeUT) (dragS.push(hid - 31 + 3), dragOp.push(op[i]), dragMa.push(ma[i]));
        }
    }
    const wRes = solveHonorBind(windS, windOp, windMa, pon, setting, TRI_WIND_CATALOG, 8);
    const dRes = solveHonorBind(dragS, dragOp, dragMa, pon, setting, TRI_DRAGON_CATALOG, 6);
    const sRes = suitS.length < 2
        ? { val: 0, fan: [] }
        : solveSuitedTwoStage(suitS, suitMa, instantiateBindCatalog(TRI_SUITED_CATALOG, suitS, suitMa, 27, pon, setting));
    return saveBindCache(trisave, "trisave", key, { val: wRes.val + dRes.val + sRes.val, fan: [...wRes.fan, ...dRes.fan, ...sRes.fan] });
}
const GreenArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0];
const PureGreenArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0];
const SymmeArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0];
const WalletArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0];
const PurpleArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1];
const OrphanArray = [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1];
const NoOrphanArray = OrphanArray.map((x) => 1 - x);
const TerminalArray = [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0];
const BigArray = [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
const MidArray = [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const LowArray = [1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const G5Array = [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
const L5Array = [1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const EvenArray = [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0];
const HonorArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1];
const NoHonorArray = HonorArray.map((x) => 1 - x);
function flattenMelds(melds) {
    let ans = [];
    for (let i = 0; i < melds.length; ++i)
        if (melds[i].length !== 3) ans.push(melds[i][0]);
        else for (let j = 0; j < melds[i].length; ++j) ans.push(melds[i][j]);
    return ans;
}
function isMask(marr, mask) {
    for (let i = 0; i < marr.length; ++i) if (!mask[marr[i]]) return false;
    return true;
}
function isSameColor(melds) {
    let color = -1;
    for (let i = 0; i < melds.length; ++i) {
        if (melds[i][0] >= 27) return false;
        if (color < 0) color = ColorArray[melds[i][0]];
        else if (ColorArray[melds[i][0]] !== color) return false;
    }
    return true;
}
function isContains5(melds, five = 4) {
    for (let i = 0; i < melds.length; ++i) {
        let contains = false;
        for (let j = 0; !contains && j < melds[i].length; ++j) {
            if (melds[i][j] >= 27) return false;
            if (NumberArray[melds[i][j]] === five) contains = true;
        }
        if (!contains) return false;
    }
    return true;
}
function isSameColorWithHonor(melds) {
    let color = -1;
    for (let i = 0; i < melds.length; ++i) {
        if (melds[i][0] >= 27) continue;
        if (color < 0) color = ColorArray[melds[i][0]];
        else if (ColorArray[melds[i][0]] !== color) return false;
    }
    return true;
}
function isFiveColors(melds) {
    let arr = Array(5).fill(false);
    for (let i = 0; i < melds.length; ++i) arr[ColorArray[melds[i][0]]] = true;
    return arr.every(Boolean);
}
function isContains19(melds) {
    for (let i = 0; i < melds.length; ++i) {
        let contains = false;
        for (let j = 0; !contains && j < melds[i].length; ++j) if (OrphanArray[melds[i][j]]) contains = true;
        if (!contains) return false;
    }
    return true;
}
function countLack(melds) {
    let arr = Array(3).fill(false);
    for (let i = 0; i < melds.length; ++i) if (melds[i][0] < 27) arr[ColorArray[melds[i][0]]] = true;
    return 3 - arr.filter(Boolean).length;
}
function ninegateListen(color, tiles, wintile) {
    if (wintile === undefined) return true;
    for (let i = 0; i < 9; ++i) {
        let cnt = tiles[i + color];
        if (i === NumberArray[wintile]) --cnt;
        if (i === 0 || i === 8) {
            if (cnt > 3) return false;
        } else if (cnt > 1) return false;
    }
    return true;
}
function ninegate(melds, tiles, wintile) {
    if (!isSameColor(melds)) return false;
    const color = ColorFirstArray[ColorArray[melds[0][0]]];
    if (!ninegateListen(color, tiles, wintile)) return false;
    const light = Array(9).fill(0);
    for (let i = 0; i < melds.length; ++i)
        if (melds[i].length === 1) light[NumberArray[melds[i][0]]] += 3;
        else for (let j = 0; j < melds[i].length; ++j) ++light[NumberArray[melds[i][j]]];
    if (light[0] < 3 || light[8] < 3) return false;
    for (let i = 1; i < 8; ++i) if (light[i] !== 1 && light[i] !== 2) return false;
    return true;
}
let seq = Array.from({ length: 25 }, (_, i) => [i, i + 1, i + 2]);
let tri = Array.from({ length: sizeUT }, (_, i) => [i]);
let quad = Array.from({ length: sizeUT }, (_, i) => [i, i, i, i]);
let pair = Array.from({ length: sizeUT }, (_, i) => [i, i]);
const PureDoubleDragon = [
    [seq[0], seq[0], seq[6], seq[6], pair[4]],
    [seq[9], seq[9], seq[15], seq[15], pair[13]],
    [seq[18], seq[18], seq[24], seq[24], pair[22]],
].map(normalize);
const MixedDoubleDragon = [
    [seq[0], seq[6], seq[9], seq[15], pair[22]],
    [seq[0], seq[6], seq[18], seq[24], pair[13]],
    [seq[9], seq[15], seq[18], seq[24], pair[4]],
].map(normalize);
function compareArray(a, b) {
    if (a.length !== b.length) return a.length - b.length;
    for (let i = 0; i < a.length; ++i) if (a[i] !== b[i]) return a[i] - b[i];
    return 0;
}
function normalize(arr) {
    return arr.sort(compareArray);
}
function deepArrayEqual(na, nb) {
    if (na.length !== nb.length) return false;
    for (let i = 0; i < na.length; ++i) if (compareArray(na[i], nb[i])) return false;
    return true;
}
function isPureDoubleDragon(melds) {
    normalize(melds);
    for (let i = 0; i < PureDoubleDragon.length; ++i) if (deepArrayEqual(melds, PureDoubleDragon[i])) return true;
    return false;
}
function isMixedDoubleDragon(melds) {
    for (let i = 0; i < MixedDoubleDragon.length; ++i) if (deepArrayEqual(melds, MixedDoubleDragon[i])) return true;
    return false;
}
function isAllSeq(melds) {
    for (let i = 0; i < melds.length; ++i)
        if (melds[i].length === 2) {
            if (melds[i][0] >= 27) return false;
        } else if (melds[i].length !== 3) return false;
    return true;
}
function isAllTri(melds) {
    for (let i = 0; i < melds.length; ++i) if (melds[i].length === 3) return false;
    return true;
}
function countHog(melds) {
    let cnt = 0;
    let tiles = Array(sizeUT).fill(0);
    for (let i = 0; i < melds.length; ++i)
        if (melds[i].length < 4)
            if (melds[i].length === 1) tiles[melds[i][0]] += 3;
            else if (melds[i].length === 2) tiles[melds[i][0]] += 2;
            else for (let j = 0; j < melds[i].length; ++j) ++tiles[melds[i][j]];
    for (let i = 0; i < sizeUT; ++i) cnt += Math.floor(tiles[i] / 4);
    return cnt;
}
function predictHog(melds) {
    let cnt = 0;
    for (let i = 0; i < melds.length; ++i)
        if (melds[i].length < 4)
            if (melds[i].length === 1) cnt += 3;
            else cnt += melds[i].length;
    return Math.floor(cnt / 4);
}
const windmax = [0, 4, 8, 24, 88];
const dragonmax = [0, 2, 6, 88];
function getWindPredict(x) {
    return x <= 4 ? windmax[x] : 88 + (x - 4) * 30;
}
function getDragonPredict(x) {
    return x <= 3 ? dragonmax[x] : 88 + (x - 3) * 44;
}
function predictBind(melds) {
    let [sq, nt, wt, dt] = [0, 0, 0, 0];
    for (let i = 0; i < melds.length; ++i)
        if (melds[i].length === 3) ++sq;
        else if (melds[i][0] >= 31) ++dt;
        else if (melds[i][0] >= 27) ++wt;
        else if (melds[i].length !== 2) ++nt;
    return Math.max(sq - 1, 0) * 16 + Math.max(nt - 1, 0) * 16 + nt + getWindPredict(wt) + getDragonPredict(dt);
}
function calculateBind(seq, tri, wind60, wind61, has48 = false, has49 = false, has75 = false, can32 = true, can65 = true, can73 = true, setting = []) {
    let v = 0;
    seq = seq.sort((a, b) => a - b);
    tri = tri.sort((a, b) => a - b);
    let orphan = Array(tri.length).fill(0);
    for (let i = 0; i < orphan.length; ++i)
        if (OrphanArray[tri[i]]) {
            if (wind61 === wind60 && wind61 === tri[i]) ((orphan[i] = 83), (v += 4));
            else if (wind61 === tri[i]) ((orphan[i] = 61), (v += 2));
            else if (wind60 === tri[i]) ((orphan[i] = 60), (v += 2));
            else if (tri[i] >= 31) ((orphan[i] = 59), (v += 2));
            else if (can73) ((orphan[i] = 73), ++v);
            if (setting[33] && !can73 && orphan[i]) ((orphan[i] += 100), --v);
        }
    const seqans = GBSeqBind(seq, Array(seq.length).fill(0), has75, setting);
    const trians = GBTriBind(tri, orphan, Array(tri.length).fill((can32 ? 0 : 64) | (can65 ? 0 : 1024)), has48 | (has49 ? 2 : 0) | (has75 ? 4 : 0), setting);
    let fan = [...seqans.fan, ...trians.fan, ...orphan.filter(Boolean)];
    for (let i = 0; i < fan.length; ++i)
        if (fan[i] > 100) (fan.push(fan[i] - 100, -73), (fan[i] = 0));
        else if (fan[i] < -100) (fan.push(fan[i] + 100, 73), (fan[i] = 0));
    return { val: seqans.val + trians.val + v, fan };
}
let filter_cnt = 0;
function buildHand(tiles, ta, wint) {
    if (wint < sizeUT) return undefined;
    let tb = Array(7).fill(0);
    for (let i = 0; i < sizeUT; ++i) tb[ColorArray[i]] += ta[i] - tiles[i];
    ((tb[0] -= tiles[43]), (tb[1] -= tiles[44]), (tb[2] -= tiles[45]));
    ((tb[3] -= tiles[47]), (tb[4] -= tiles[48]));
    tb[5] = tb[0] + tb[1] + tb[2] - tiles[46];
    tb[6] = tb[3] + tb[4] - tiles[49];
    return tb;
}
function canBeListen(tiles, ta, tb, x, wint) {
    if (wint < sizeUT) return x === wint;
    switch (wint) {
        case 42:
            return ta[x] > tiles[x] && tb[ColorArray[x]] && tb[5 + HonorArray[x]];
        case 43:
        case 44:
        case 45:
        case 47:
        case 48:
            return JokerA[x] === wint && ta[x] > tiles[x];
        case 46:
        case 49:
            return JokerB[x] === wint && ta[x] > tiles[x] && tb[ColorArray[x]];
    }
    return false;
}
function GBKPC(ck, ek, cp, setting, fourteen_type, info) {
    let [v, f] = [0, []];
    let [must_pengpeng, must_menqing, must_2anke] = [false, false, false];
    let [has_single_ck, has_single_ek] = [false, false];
    if (ck + ek >= 4) {
        ((v += 88), f.push(5), (must_pengpeng = fourteen_type));
        if (setting[30])
            if (ck === 2) ((v += GBScoreArray[53] = setting[23] ? 8 : 6), f.push(53), (must_2anke = true));
            else if (ck === 1) ((v += 2), f.push(67), (has_single_ck = true));
    } else if (ck + ek === 3) {
        ((v += 32), f.push(17));
        if (setting[30])
            if (ck === 2) ((v += GBScoreArray[53] = setting[23] ? 8 : 6), f.push(53), (must_2anke = true));
            else if (ck === 1) ((v += 2), f.push(67), (has_single_ck = true));
    } else if (ck === 2) ((v += GBScoreArray[53] = setting[23] ? 8 : 6), f.push(53), (must_2anke = true));
    else if (ek === 2) ((v += 4), f.push(57));
    else if (ck + ek === 2) {
        if (setting[24] === 0) ((v += 5), f.push(82));
        else if (setting[24] === 1) ((v += 6), f.push(82), (GBScoreArray[82] = 6));
        else if (setting[24] === 2) ((v += 3), f.push(67, 74), (has_single_ek = has_single_ck = true));
        else if (setting[24] === 3) ((v += 6), f.push(57, 67), (has_single_ck = true));
    } else if (ck) ((v += 2), f.push(67), (has_single_ck = true));
    else if (ek) (++v, f.push(74), (has_single_ek = true));
    if (ck + cp >= 4) ((v += 64), f.push(12), (must_pengpeng = fourteen_type), (must_menqing = fourteen_type));
    else if (ck + cp === 3) ((v += 16), f.push(33));
    else if (!must_2anke && ck + cp === 2) ((v += 2), f.push(66));
    if (has_single_ek && info.fan.includes(46) && setting[31]) (--v, f.push(-74));
    else if (has_single_ck && info.fan.includes(46) && setting[31] === 2) (--v, f.push(-74));
    return { v, f, must_menqing, must_pengpeng };
}
function settingBless(fan, setting) {
    if (fan.includes(86)) return [setting[47], setting[48]];
    if (fan.includes(87)) return [setting[51]];
    if (fan.includes(88)) return [setting[53]];
    if (fan.includes(89)) return [setting[56], setting[57]];
    return [true, true];
}
function GBZimo(setting, zimo, ans, bless, menqing = true, must_menqing = true) {
    if (menqing)
        if ((setting || !must_menqing) && zimo && bless[1]) ((ans.val += 4), ans.fan.push(56), (zimo = 56));
        else if (!must_menqing && bless[0]) ((ans.val += 2), ans.fan.push(62));
    if (zimo === 80) (++ans.val, ans.fan.push(zimo));
    return { val: ans.val, fan: ans.fan, zimo };
}
function GeneralPair(melds, f = (x) => GeneralArray[x]) {
    for (let i = 0; i < melds.length; ++i) if (melds[i].length === 2) return f(melds[i][0]);
    return false;
}
function GBKernel(melds, gans, aids, ck, ek, cp, wind60, wind61, zimo, info, tiles, setting, wint = aids[0].at(-1)?.id) {
    let [must_hunyise, must_qingyise, must_quandai, must_hun19, must_pinghe, must_duan1, must_wuzi, must_quemen] = Array(8).fill(false);
    let yaojiuke = true;
    let [can_2tong, can_3tong] = [true, true];
    let skip_bind = false;
    const fourteen_type = melds.length === 5 && aids[0].length % 3 !== 0;
    let { v, f, must_menqing, must_pengpeng } = GBKPC(ck, ek, cp, setting, fourteen_type, info);
    ((v += info.val), f.push(...info.fan));
    const marr = flattenMelds(melds);
    if (setting[70] && melds.length >= 5 && isMask(marr, GreenArray)) ((v += 88), f.push(3), (must_hunyise ||= !setting[22]));
    if (setting[63] && melds.length >= 5 && isMask(marr, WalletArray)) ((v += 16), f.push(90), (must_hunyise ||= !setting[72]));
    if (setting[64] && melds.length >= 5 && isMask(marr, PurpleArray)) ((v += 12), f.push(91), (must_hunyise ||= !setting[73]));
    if (aids[0].length === 14 && aids[1].length === 0 && ninegate(melds, tiles, wint)) ((v += 88), f.push(4), (must_qingyise = true), (must_menqing = true), setting[27] ? (yaojiuke = false) : (--v, f.push(-73)));
    ({ val: v, fan: f, zimo } = GBZimo(setting[19], zimo, { val: v, fan: f }, settingBless(info.fan, setting), melds.length >= 5 && aids[1].length === ck, must_menqing));
    if (melds.length >= 5 && isMask(marr, TerminalArray)) ((v += 64), f.push(8), (must_hun19 = true), (must_wuzi = true), (can_2tong &&= setting[28]), (can_3tong &&= setting[29]));
    if (melds.length >= 5 && isMask(marr, HonorArray)) ((v += 64), f.push(11), (must_hun19 = true), (must_hunyise = true));
    if (melds.length >= 5)
        if (isMask(marr, BigArray)) ((v += 24), f.push(25), (must_wuzi = true));
        else if (isMask(marr, G5Array)) ((v += 12), f.push(36), (must_wuzi = true));
    if (melds.length >= 5 && isMask(marr, MidArray)) ((v += 24), f.push(26), (must_duan1 = true));
    if (melds.length >= 5)
        if (isMask(marr, LowArray)) ((v += 24), f.push(27), (must_wuzi = true));
        else if (isMask(marr, L5Array)) ((v += 12), f.push(37), (must_wuzi = true));
    if (setting[61] && GeneralPair(melds)) ((v += GBScoreArray[85] = setting[61]), f.push(85));
    let predict_v = 56 + predictHog(melds);
    if (!skip_bind) predict_v += predictBind(melds);
    predict_v = Math.max(predict_v, 64);
    if (v + predict_v <= gans) return { val: 0, fan: [] };
    ++filter_cnt;
    if (fourteen_type && isPureDoubleDragon(melds)) ((v += 64), f.push(13), (must_qingyise = true), (must_pinghe = true), (skip_bind = true));
    if (fourteen_type && isMixedDoubleDragon(melds)) ((v += 16), f.push(29), (must_pinghe = true), (skip_bind = true));
    if (melds.length >= 5 && !must_hun19 && isMask(marr, OrphanArray)) ((v += 32), f.push(18), (must_hun19 = true));
    if (must_hun19) ((must_pengpeng = true), (must_quandai = true), (yaojiuke = false));
    if (melds.length >= 5 && isMask(marr, EvenArray)) ((v += 24), f.push(21), (must_pengpeng = true), (must_duan1 = true));
    if (melds.length >= 5 && !must_qingyise && isSameColor(melds)) ((v += 24), f.push(22), (must_qingyise = true));
    if (must_qingyise) ((must_hunyise = true), (must_wuzi = true));
    if (melds.length >= 5 && isContains5(melds)) ((v += 16), f.push(31), (must_duan1 = true));
    if (melds.length >= 5 && isMask(marr, SymmeArray)) ((v += 8), f.push(40), (must_quemen ||= !setting[18]));
    let has_pengpeng = false;
    if (melds.length >= 5 && !must_pengpeng && isAllTri(melds)) ((v += 6), f.push(48), (has_pengpeng = true));
    let has_hunyise = false;
    if (melds.length >= 5 && !must_hunyise && isSameColorWithHonor(melds)) ((v += 6), f.push(49), (must_hunyise = true), (has_hunyise = true));
    if (must_hunyise) must_quemen = true;
    if (isFiveColors(melds)) ((v += 6), f.push(51));
    if (melds.length >= 5 && !must_quandai && isContains19(melds)) ((v += 4), f.push(55));
    if (melds.length >= 5 && !must_pinghe && isAllSeq(melds)) ((v += 2), f.push(63), (must_pinghe = true));
    if (must_pinghe) must_wuzi = true;
    if (melds.length >= 5 && !must_duan1 && isMask(marr, NoOrphanArray)) ((v += 2), f.push(68), (must_duan1 = true));
    if (must_duan1) must_wuzi = true;
    let has_quemen = false;
    if (melds.length >= 5 && !must_quemen) {
        const n = countLack(melds);
        for (let i = 0; i < n; ++i) (++v, f.push(75), (has_quemen = true));
    }
    if (melds.length >= 5 && !must_wuzi && isMask(marr, NoHonorArray)) (++v, f.push(76));
    const hog = countHog(melds);
    for (let i = 0; i < hog; ++i) ((v += 2), f.push(64));
    if (!skip_bind) {
        let [seq, tri] = [[], []];
        for (let i = 0; i < melds.length; ++i)
            if (melds[i].length === 3) seq.push(melds[i][0]);
            else if (melds[i].length === 2) tri.push(GetHeadFromId(melds[i][0]));
            else tri.push(melds[i][0]);
        const bind = calculateBind(seq, tri, wind60, wind61, fourteen_type && has_pengpeng, melds.length === 5 && has_hunyise, melds.length === 5 && has_quemen, can_3tong, can_2tong, yaojiuke, setting);
        ((v += bind.val), (f = [...f, ...bind.fan]));
    }
    return { val: v, fan: f };
}
function GBKnitDragon(melds, gans, aids, ck, ek, cp, wind60, wind61, zimo, info, _, setting) {
    let { f, v } = GBKPC(ck, ek, cp, setting, false, info);
    ((v += info.val), f.push(...info.fan));
    ((v += 12), f.push(35));
    let must_pinghe = false;
    let must_wuzi = false;
    ({ val: v, fan: f, zimo } = GBZimo(undefined, zimo, { val: v, fan: f }, settingBless(info.fan, setting), melds.length >= 5 && aids[1].length === ck, false));
    if (setting[61] && GeneralPair(melds)) ((v += GBScoreArray[85] = setting[61]), f.push(85));
    let predict_v = 6 + predictHog(melds);
    predict_v += predictBind(melds);
    if (v + predict_v <= gans) return { val: 0, fan: [] };
    ++filter_cnt;
    const marr = flattenMelds(melds);
    if (isFiveColors(melds)) ((v += 6), f.push(51));
    if (melds.length >= 5 && !must_pinghe && isAllSeq(melds)) ((v += 2), f.push(63), (must_pinghe = true));
    if (must_pinghe) must_wuzi = true;
    if (melds.length >= 5 && !must_wuzi && isMask(marr, NoHonorArray)) (++v, f.push(76));
    const hog = countHog(melds);
    for (let i = 0; i < hog; ++i) ((v += 2), f.push(64));
    let [seq, tri] = [[], []];
    for (let i = 0; i < melds.length; ++i)
        if (isSeq(melds[i])) seq.push(melds[i][0]);
        else if (melds[i].length === 2) tri.push(GetHeadFromId(melds[i][0]));
        else if (melds[i].length !== 3) tri.push(melds[i][0]);
    const bind = calculateBind(seq, tri, wind60, wind61);
    ((v += bind.val), (f = [...f, ...bind.fan]));
    return { val: v, fan: f };
}
function isShiftPairs(cot) {
    let c = -1;
    let nbs = Array(9).fill(0);
    for (let i = 0; i < cot.length; ++i) {
        let tc = -1;
        if (cot[i] < sizeUT) ((tc = ColorArray[cot[i]]), ++nbs[NumberArray[cot[i]]]);
        else if (cot[i] in JokerColor) tc = JokerColor[cot[i]];
        else if (cot[i] === 46 || cot[i] === JokerC) continue;
        else if (cot[i] === 49) return null;
        if (tc >= 3) return null;
        if (c === -1) c = tc;
        else if (c !== tc) return null;
    }
    let [maxp, minp] = [-1, 9];
    for (let i = 0; i < 9; ++i)
        if (nbs[i] > 1) return null;
        else if (nbs[i]) ((maxp = Math.max(maxp, i)), (minp = Math.min(minp, i)));
    if (maxp - minp >= 7) return null;
    if (minp > 0 && maxp < 8) return { color: c, large: true };
    return { color: c, large: false };
}
function PairFiveColorArray(cot) {
    let c5ot = cot.slice();
    let c5cnt = Array(5).fill(0);
    for (let i = 0; i < c5ot.length; ++i)
        if (c5ot[i] < sizeUT) ++c5cnt[ColorArray[c5ot[i]]];
        else if (c5ot[i] in JokerColor) ++c5cnt[JokerColor[c5ot[i]]];
    for (let i = 0; i < c5ot.length; ++i)
        if (c5ot[i] === 46) {
            let u = false;
            for (let j = 0; !u && j < 3; ++j) if (!c5cnt[j]) (++c5cnt[j], (u = true), (c5ot[i] = CJokerA[j]));
        } else if (c5ot[i] === 49) {
            let u = false;
            for (let j = 3; !u && j < 5; ++j) if (!c5cnt[j]) (++c5cnt[j], (u = true), (c5ot[i] = CJokerA[j]));
        } else if (c5ot[i] === JokerC) {
            let u = false;
            for (let j = 3; !u && j < 5; ++j) if (!c5cnt[j]) (++c5cnt[j], (u = true), (c5ot[i] = CJokerA[j]));
        }
    return { c5ot, c5cnt };
}
function pairLeastProduct(ot, f, guse = guseall, prefix = Array(7).fill(-1), count = Array(sizeUT).fill(0), i = 0) {
    if (i === 7) {
        f(prefix, count);
        return;
    }
    function next(j) {
        if (guse[j] == Infinity) return;
        prefix[i] = j;
        ++count[j];
        pairLeastProduct(ot, f, guse, prefix, count, i + 1);
        --count[j];
    }
    if (ot[i] < sizeUT) {
        next(ot[i]);
        return;
    }
    const [l, r] = JokerRange[ot[i]];
    let shadow = -1;
    for (let j = l; j < r; ++j) {
        if (guse[j] === Infinity) continue;
        if (count[j]) shadow = j;
        if (count[j] & 1) break;
    }
    if (shadow >= 0) next(shadow);
    else for (let j = l; j < r; ++j) if (guse[j] !== Infinity) next(j);
}
function GB7Pairs(tids, setting) {
    const ot = PairOutput(getTiles(tids)).map((x) => x[0]);
    let gans = { val: 0, fan: [] };
    function pairKernel(finalot, tilesbar) {
        let v = 24;
        let f = [19];
        let [must_hunyise, must_qingyise, must_quandai, must_hun19, must_duan1, must_wuzi, must_quemen] = Array(7).fill(false);
        const melds = finalot.map((x) => [x]);
        let hog = 0;
        if (setting[1] && setting[70] && isMask(finalot, GreenArray)) (((v += 88), f.push(3), (must_hunyise ||= !setting[22])), --hog);
        if (setting[71] && setting[63] && isMask(finalot, WalletArray)) (((v += 16), f.push(90), (must_hunyise ||= !setting[72])), --hog);
        if (setting[74] && setting[64] && isMask(finalot, PurpleArray)) (((v += 12), f.push(91), (must_hunyise ||= !setting[73])), --hog);
        if (setting[2] && isMask(finalot, TerminalArray)) (((v += 64), f.push(8), (must_hun19 = true), (must_wuzi = true)), --hog);
        if (setting[3] && isMask(finalot, HonorArray)) ((v += 64), f.push(11), (must_hun19 = true), (must_hunyise = true));
        if (setting[4] && !must_hun19 && isMask(finalot, OrphanArray)) ((v += 32), f.push(18), (must_hun19 = true));
        if (must_hun19) must_quandai = true;
        if (setting[12] && isMask(finalot, EvenArray)) ((v += 24), f.push(21), (must_duan1 = true));
        if (setting[5] && !must_qingyise && isSameColor(melds)) ((v += 24), f.push(22), (must_qingyise = true));
        if (must_qingyise) ((must_hunyise = true), (must_wuzi = true));
        if (setting[6] && isMask(finalot, BigArray)) ((v += 24), f.push(25), (must_wuzi = true));
        else if (setting[7] && isMask(finalot, G5Array)) ((v += 12), f.push(36), (must_wuzi = true));
        if (setting[6] && isMask(finalot, MidArray)) ((v += 24), f.push(26), (must_duan1 = true));
        if (setting[6] && isMask(finalot, LowArray)) ((v += 24), f.push(27), (must_wuzi = true));
        else if (setting[7] && isMask(finalot, L5Array)) ((v += 12), f.push(37), (must_wuzi = true));
        if (setting[8] && isContains5(melds)) (((v += 16), f.push(31), (must_duan1 = true)), (hog -= 2));
        if (setting[9] && isMask(finalot, SymmeArray)) ((v += 8), f.push(40), (must_quemen ||= !setting[18]));
        if (setting[10] && !must_hunyise && isSameColorWithHonor(melds)) ((v += 6), f.push(49), (must_hunyise = true));
        if (must_hunyise) must_quemen = true;
        if (setting[40] && !must_quandai && isMask(finalot, OrphanArray)) ((v += 4), f.push(55));
        if (!must_duan1 && isMask(finalot, NoOrphanArray)) ((v += 2), f.push(68), (must_duan1 = true));
        if (must_duan1) must_wuzi = true;
        if (!must_quemen) {
            const n = countLack(melds);
            for (let i = 0; i < n; ++i) (++v, f.push(75));
        }
        if (!must_wuzi && isMask(finalot, NoHonorArray)) (++v, f.push(76));
        if (setting[45]) hog = 0;
        for (let i = 0; i < sizeUT; ++i) hog += Math.floor(tilesbar[i] / 2);
        for (let i = 0; i < hog; ++i) ((v += 2), f.push(64));
        if (v > gans.val) ((gans.val = v), (gans.fan = f));
    }
    pairLeastProduct(ot, pairKernel);
    const spr = isShiftPairs(ot);
    if (spr) {
        let sp = { val: 88, fan: [6] };
        if (spr.large) ((sp.val += 2), sp.fan.push(68));
        if (setting[71] && setting[63] && (spr.color === -1 || spr.color === 1)) ((sp.val += 16), sp.fan.push(90));
        if (setting[74] && setting[64] && (spr.color === -1 || spr.color === 2)) ((sp.val += 12), sp.fan.push(91));
        if (sp.val > gans.val) gans = sp;
    }
    // Five Color. Must be at end because of cot change.
    const { c5ot, c5cnt } = PairFiveColorArray(ot);
    if (setting[11] && c5cnt.every(Boolean)) {
        let [v, f] = [24 + 6, [19, 51]];
        let hun19 = true;
        for (let i = 0; hun19 && i < c5ot.length; ++i) if (c5ot[i] < sizeUT && !OrphanArray[c5ot[i]]) hun19 = false;
        if (hun19)
            if (setting[4]) ((v += 32), f.push(18));
            else if (setting[40]) ((v += 4), f.push(55));
        let tiles = Array(sizeUT).fill(0);
        for (let i = 0; i < c5ot.length; ++i)
            if (c5ot[i] < sizeUT) ++tiles[c5ot[i]];
            else {
                let u = false;
                const [l, r] = JokerRange[ot[i]];
                for (let j = l; !u && j < r; ++j) if (tiles[c5ot[i]] % 1 === 0) (++tiles[c5ot[i]], (u = true));
                if (!u) ++tiles[l];
            }
        let hog = 0;
        for (let i = 0; i < sizeUT; ++i) hog += Math.floor(tiles[i] / 2);
        for (let i = 0; i < hog; ++i) ((v += 2), f.push(64));
        if (v > gans.val) ((gans.val = v), (gans.fan = f));
    }
    return gans;
}
const GBScoreArray = [undefined, 88, 88, 88, 88, 88, 88, 88, 64, 64, 64, 64, 64, 64, 48, 48, 32, 32, 32, 24, 24, 24, 24, 24, 24, 24, 24, 24, 16, 16, 16, 16, 16, 16, 12, 12, 12, 12, 12, 8, 8, 8, 8, 8, 8, 8, 8, 8, 6, 6, 6, 6, 6, 6, 6, 4, 4, 4, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.01, 5, undefined, 1, 1, 8, 8, 8, 8, 16, 12];
const eans_jp = { val: 0, valfan: 0, fan: [], valfus: 0, fus: [], yakuman: 0, realyakuman: 0, realfus: 0, dora: 0, ura: 0 };
let use_time = 0;
function JPGetFusMain(melds, aids, ck, wind5, wind6, tsumo, tiles, ta, setting, mq = melds.length >= 5 && aids[1].length === ck, wint = aids[0].at(-1)?.id ?? -1, tb = buildHand(tiles, ta, wint)) {
    const hcnt = Math.ceil(aids[0].length / 3);
    let [valfus, fus] = [20, [8]];
    if (mq && !tsumo) ((valfus += 10), (fus = [9]));
    let head = -1;
    let listen_type = 0;
    let [epmid, ep19] = [-1, -1];
    let bilisten = false;
    let koutsufu = [];
    for (let i = 0; i < hcnt; ++i)
        if (melds[i].length === 2) {
            if (canBeListen(tiles, ta, tb, melds[i][0], wint)) listen_type = 19;
            head = melds[i][0];
        } else if (melds[i].length === 3) {
            if (canBeListen(tiles, ta, tb, melds[i][0], wint))
                if (NumberArray[melds[i][0]] === 6) listen_type ||= 17;
                else bilisten = true;
            else if (canBeListen(tiles, ta, tb, melds[i][1], wint)) listen_type ||= 18;
            else if (canBeListen(tiles, ta, tb, melds[i][2], wint))
                if (NumberArray[melds[i][2]] === 2) listen_type ||= 17;
                else bilisten = true;
        } else {
            const o = OrphanArray[melds[i][0]];
            if (!o && epmid === -1 && canBeListen(tiles, ta, tb, melds[i][0], wint)) epmid = koutsufu.length;
            if (o && epmid === -1 && ep19 === -1 && canBeListen(tiles, ta, tb, melds[i][0], wint)) ep19 = koutsufu.length;
            koutsufu.push(o ? 3 : 2);
        }
    let cp = koutsufu.length;
    if (epmid === -1) epmid = ep19;
    if (!tsumo && !listen_type && !bilisten && koutsufu.length > 0) ((koutsufu[epmid] ^= 2), --cp);
    for (let i = hcnt; i < melds.length; ++i)
        if (melds[i].length === 1) koutsufu.push(OrphanArray[melds[i][0]] ? 1 : 0);
        else if (melds[i].length === 4) koutsufu.push((OrphanArray[melds[i][0]] ? 1 : 0) | 4 | (aids[1][i - hcnt].type % 4 === 0 ? 2 : 0));
    for (let i = 0; i < koutsufu.length; ++i) valfus += JPFuArray[koutsufu[i]];
    fus.push(...koutsufu);
    if (setting[5] && head === wind5 && head === wind6) ((valfus += 2), fus.push(20));
    else {
        if (head === wind5) ((valfus += 2), fus.push(12));
        if (head === wind6) ((valfus += 2), fus.push(13));
    }
    if (head === 31) ((valfus += 2), fus.push(14));
    if (head === 32) ((valfus += 2), fus.push(15));
    if (head === 33) ((valfus += 2), fus.push(16));
    return { head, listen_type, cp, bilisten, valfus, fus };
}
function JPGetFusRemain(yakuman, infoans, tsumo, fus, valfus, listen_type, bilisten, setting, mq) {
    let pinfu = false;
    if ((setting[6] || !tsumo) && (mq || setting[24]) && fus.length === 1 && bilisten && yakuman === 0) pinfu = true;
    else {
        if (listen_type) ((valfus += 2), fus.push(listen_type));
        if (tsumo && !(setting[16] && yakuman === 0 && (infoans.fan.includes(12) || infoans.fan.includes(64)))) ((valfus += 2), fus.push(11));
    }
    if (!setting[25] && !mq && valfus <= 20) valfus += 2;
    const realfus = valfus;
    if (setting[14]) valfus = Math.ceil(valfus / 10) * 10;
    return { fus, valfus, realfus, pinfu };
}
function JPGetFanValue(id, mq = true) {
    return mq ? JPScoreArray0[id] : JPScoreArray1[id];
}
function JPUpdateFan(ans, setting, id, n = 1, mq = true) {
    if (n === 0) return 0;
    const nv = JPGetFanValue(id, mq);
    if (!nv) return 0;
    if (nv?.id) return JPUpdateFan(ans, setting, nv.id, n * (nv.n ?? 1), mq);
    if (nv < 0) {
        if (!setting[46]) return 0;
        if (ans.yakuman === 0) ans.fan.length = 0;
        if (setting[2]) ans.realyakuman = ans.yakuman += -nv * n;
        else ((ans.yakuman = Math.max(ans.yakuman, -nv)), (ans.realyakuman += -nv * n));
        ans.fan.push(...Array(n).fill(id));
        return n;
    }
    if (ans.yakuman > 0) return 0;
    ans.valfan += nv * n;
    ans.fan.push(...Array(n).fill(id));
    return n;
}
function ansCopy(x) {
    return { ...x, fan: x.fan.slice() };
}
function getDoras(vaildora, doras, uras) {
    let [d, u] = [0, 0];
    for (let i = 0; i < sizeAT; ++i) if (vaildora[i]) ((d += vaildora[i] * doras[i]), (u += vaildora[i] * uras[i]));
    for (let i = 42; i < 50; ++i) {
        if (doras[i] === 0 && uras[i] == 0) continue;
        const [l, r] = JokerRange[i];
        let cnt = 0;
        for (let j = l; j < r; ++j) if (vaildora[j] > cnt) cnt = vaildora[j];
        ((d += cnt * doras[i]), (u += cnt * uras[i]));
    }
    return [d, u];
}
const JP3PArray = guse3p.map((x) => (x === Infinity ? 0 : 1));
function JPKernel(melds, infoans, gans, aids, ck, ek, wind5, wind6, tsumo, tiles, ta, doras, uras, nuki, setting, wint = aids[0].at(-1)?.id ?? -1) {
    //if (setting[49] && !isMask(flattenMelds(melds), JP3PArray)) return eans_jp;
    let ans = ansCopy(infoans);
    const mq = melds.length >= 5 && aids[1].length === ck;
    const update = (id, n) => JPUpdateFan(ans, setting, id, n, mq);
    const tb = buildHand(tiles, ta, wint);
    let { head, listen_type, cp, bilisten, valfus, fus } = JPGetFusMain(melds, aids, ck, wind5, wind6, tsumo, tiles, ta, setting, mq, wint, tb);
    if (aids[0].length === 14 && aids[1].length === 0 && ninegate(melds))
        if (setting[1] && ninegateListen(ColorFirstArray[ColorArray[melds[0][0]]], tiles, wint)) update(47);
        else update(46);
    const marr = flattenMelds(melds);
    if (melds.length >= 5 && isMask(marr, TerminalArray)) update(45);
    function updateGreen() {
        if (setting[18] && isMask(marr, PureGreenArray))
            if (setting[18] === 1) return;
            else if (setting[1] && setting[18] === 2) return update(49);
        return update(44);
    }
    if (melds.length >= 5 && isMask(marr, GreenArray)) updateGreen();
    if (ck + ek >= 4) update(43, Math.floor((ck + ek) / 4));
    let windcount = Array(4).fill(0);
    let dragoncount = Array(3).fill(0);
    for (let i = 0; i < melds.length; ++i)
        if (melds[i].length !== 2)
            if (ColorArray[melds[i][0]] === 3) ++windcount[melds[i][0] - 27];
            else if (ColorArray[melds[i][0]] === 4) ++dragoncount[melds[i][0] - 31];
    const bgwind = update(41, Math.min(...windcount));
    if (ColorArray[head] === 3) {
        ++windcount[head - 27];
        if (Math.min(...windcount) > bgwind) update(42);
    }
    if (melds.length >= 5 && isMask(marr, HonorArray)) update(39);
    const bgdragon = update(38, Math.min(...dragoncount));
    if (ck + cp >= 4)
        if (setting[1] && head !== -1 && canBeListen(tiles, ta, tb, head, wint)) update(35, Math.floor((ck + cp) / 4));
        else update(34, Math.floor((ck + cp) / 4));
    let [tri, seq] = [null, null];
    function init_tri() {
        if (tri !== null) return;
        tri = Array(sizeUT).fill(0);
        for (let i = 0; i < melds.length; ++i) if (melds[i].length !== 3 && melds[i].length !== 2) ++tri[melds[i][0]];
    }
    function init_seq() {
        if (seq !== null) return;
        seq = Array(25).fill(0);
        for (let i = 0; i < melds.length; ++i) if (melds[i].length === 3) ++seq[melds[i][0]];
    }
    if (setting[20]) {
        init_tri();
        let tri4 = tri.slice();
        let shift4 = 0;
        for (let i = 0; i < 3; ++i)
            for (let j = 0; j < 6; ++j) {
                const cnt = Math.min(...tri4.slice(i * 9 + j, i * 9 + j + 4));
                for (let k = 0; k < 4; ++k) tri4[i * 9 + j + k] -= cnt;
                shift4 += cnt;
            }
        update(51, shift4);
    }
    if (JPGetFanValue(53, mq) < 0) {
        let same4 = 0;
        init_seq();
        for (let i = 0; i < 25; ++i) same4 += Math.floor(seq[i] / 4);
        same4 = update(53, same4);
    }
    let alltri = false;
    if (melds.length >= 5 && isAllTri(melds)) alltri = true;
    if (setting[40] && melds.length >= 5 && isFiveColors(melds))
        (() => {
            if (setting[42] && !alltri) return false;
            if (setting[43] && head !== wind6) return false;
            if (setting[42] && JPScoreArray1[67] > 2) alltri = false;
            update(67);
        })();
    if (alltri) update(18);
    let realfus, pinfu;
    ({ fus, valfus, realfus, pinfu } = JPGetFusRemain(ans.yakuman, infoans, tsumo, fus, valfus, listen_type, bilisten, setting, mq));
    if (ans.yakuman > 0) return getJPAnsUnion(setting, ans, fus, valfus, realfus);
    if (gans.yakuman > 0) return eans_jp;
    let [must_hunyise, must_quandai] = [false, false];
    if (melds.length >= 5 && isSameColor(melds)) (update(31, 1), (must_hunyise = true));
    init_seq();
    const [v4, v3, vp, vs] = [JPGetFanValue(53, mq), JPGetFanValue(52, mq), JPGetFanValue(29, mq), JPGetFanValue(11, mq)];
    if (v4 > 0 || v3 > 0) {
        let dpl = [[0, 0, 0, 0, 0], null];
        const fusame = (x, i, j, k, s) => {
            if (!x) return x;
            const dv = i * v4 + j * v3 + k * vp + s * vs;
            if (dv === 0) return x;
            return [x[0] + dv, x[1] + i, x[2] + j, x[3] + k, x[4] + s];
        };
        const cmpsame = (x, y) => x[0] - y[0];
        const frsame = (x, y) => (!x ? y : !y ? x : cmpsame(x, y) > 0 ? x : y);
        for (let i = 0; i < 25; ++i) {
            if (seq[i] < 2) continue;
            let dpr = [[0, 0, 0, 0, 0], null];
            const max4 = v4 > 0 ? Math.floor(seq[i] / 4) : 0;
            for (let j4 = 0; j4 <= max4; ++j4) {
                const [u4, s4] = [j4 * 4, j4 >> 1];
                const max3 = v3 > 0 ? Math.floor((seq[i] - u4) / 3) : 0;
                for (let j3 = 0; j3 <= max3; ++j3) {
                    const [u3, s3] = [j3 * 3, j3 >> 1];
                    let [s, p, pot, free, sb] = [0, 0, u4 + u3, seq[i] - u4 - u3, s4 * 4 + s3 * 3];
                    ((s += sb), (pot -= sb * 2));
                    if (j4 % 2 && j3 % 2) ((s += 3), (pot -= 6));
                    const sfp = Math.min(pot, free);
                    ((s += sfp), (free -= sfp), (s += free >> 1), (p = s >> 1), (s &= 1));
                    if (s === 1) {
                        dpr[0] = [dpr[0], fusame(dpl[0], j4, j3, p, 0), fusame(dpl[1], j4, j3, p + 1, -1)].reduce(frsame);
                        dpr[1] = [dpr[1], fusame(dpl[0], j4, j3, p, 1), fusame(dpl[1], j4, j3, p, 0)].reduce(frsame);
                    } else {
                        dpr[0] = [dpr[0], fusame(dpl[0], j4, j3, p, 0)].reduce(frsame);
                        dpr[1] = [dpr[1], fusame(dpl[1], j4, j3, p, 0)].reduce(frsame);
                    }
                }
            }
            dpl = dpr;
        }
        let ansame = dpl.reduce(frsame);
        (update(53, ansame[1]), update(52, ansame[2]), update(29, ansame[3]), update(11, ansame[4]));
    } else {
        let s = 0;
        for (let i = 0; i < 25; ++i) s += seq[i] >> 1;
        (update(29, s >> 1), update(11, s & 1));
    }
    if (melds.length >= 5 && !must_hunyise && isSameColorWithHonor(melds)) update(28, 1);
    if (melds.length >= 5 && isMask(marr, OrphanArray)) (update(25), (must_quandai = true));
    if (melds.length >= 5 && isContains19(melds))
        if (isMask(marr, NoHonorArray)) update(27, 1);
        else if (!must_quandai) update(24, 1);
    if (ColorArray[head] === 4) {
        ++dragoncount[head - 31];
        if (Math.min(...dragoncount) > bgdragon) update(26);
    }
    if (ck + ek >= 3) update(23, Math.floor((ck + ek) / 3));
    if (ck + cp >= 3) update(22, Math.floor((ck + cp) / 3));
    let itsu = 0;
    for (let i = 0; i < 3; ++i) itsu += Math.min(seq[i * 9], seq[i * 9 + 3], seq[i * 9 + 6]);
    update(21, itsu);
    let sanshoku = 0;
    for (let i = 0; i < 7; ++i) sanshoku += Math.min(seq[i], seq[i + 9], seq[i + 18]);
    update(19, sanshoku);
    if (setting[17]) {
        let santsu = 0;
        for (let i = 0; i < 6; ++i) santsu += Math.min(seq[Permutation3[i][0] * 9], seq[Permutation3[i][1] * 9 + 3], seq[Permutation3[i][2] * 9 + 6]);
        update(48, santsu);
    }
    let toukou = 0;
    init_tri();
    for (let i = 0; i < 9; ++i) toukou += Math.min(tri[i], tri[i + 9], tri[i + 18]);
    update(20, toukou);
    if (setting[19]) {
        let tri3 = tri.slice();
        let shift3 = 0;
        for (let i = 0; i < 3; ++i)
            for (let j = 0; j < 7; ++j) {
                const cnt = Math.min(...tri3.slice(i * 9 + j, i * 9 + j + 3));
                for (let k = 0; k < 3; ++k) tri3[i * 9 + j + k] -= cnt;
                shift3 += cnt;
            }
        update(50, shift3);
    }
    if (setting[54]) {
        let winds = 0;
        for (let i = 27; i <= 30; ++i) {
            if (setting[55] && i === wind6) continue;
            if (setting[56] && i === wind5) continue;
            if (setting[57] && wind6 !== 27) continue;
            winds += tri[i];
        }
        update(70, Math.floor(winds / 3));
    }
    update(5, tri[wind5]);
    update(6, tri[wind6]);
    update(7, tri[31]);
    update(8, tri[32]);
    update(9, tri[33]);
    if (setting[49] && setting[52]) update(69, tri[30]);
    if (melds.length >= 5 && (mq || setting[4]) && isMask(marr, NoOrphanArray)) update(4);
    if (mq && tsumo) update(2);
    if (setting[44] && aids[0].length === 2 && aids[1].length >= 4 && ck === 0) update(68);
    if (pinfu) update(10);
    let vaildora = nuki.slice();
    for (let i = 0; i < melds.length; ++i)
        if (melds[i].length === 3) for (let j = 0; j < 3; ++j) ++vaildora[melds[i][j]];
        else vaildora[melds[i][0]] += melds[i].length === 1 ? 3 : melds[i].length;
    let [gd, gu] = getDoras(vaildora, doras, uras);
    ans.valfan += gd + gu;
    return getJPAnsUnion(setting, ans, fus, valfus, realfus, gd, gu);
}
function PairSelect(cot, ad, au, mask) {
    let [d, u] = [0, 0];
    let backup = Array(7).fill([0, 0, 0]);
    for (let i = 0; i < 7; ++i) if (cot[i] < sizeUT) ((d += ad[cot[i]]), (u += au[cot[i]]), (backup[i] = [cot[i], ad[cot[i]], au[cot[i]]]), (ad[cot[i]] = au[cot[i]] = -Infinity));
    for (let i = 0; i < 7; ++i)
        if (cot[i] >= sizeUT) {
            let [sj, sdu] = [-1, -Infinity];
            const [jl, jr] = JokerRange[cot[i]];
            for (let j = jl; j < jr; ++j) if (!mask || mask[j]) if (ad[j] + au[j] > sdu) ((sj = j), (sdu = ad[j] + au[j]));
            if (sj > 0) ((d += ad[sj]), (u += au[sj]), (backup[i] = [sj, ad[sj], au[sj]]), (ad[sj] = au[sj] = -Infinity));
            else [d, u] = [-Infinity, -Infinity];
        }
    for (let i = 0; i < 7; ++i) {
        const [j, d, u] = backup[i];
        [ad[j], au[j]] = [d, u];
    }
    ((d *= 2), (u *= 2));
    return [d, u];
}
function PairSameColor(cot) {
    let color = -1;
    for (let i = 0; i < 7; ++i) {
        let tcolor = -1;
        if (cot[i] < sizeUT) {
            if (HonorArray[cot[i]]) return null;
            tcolor = ColorArray[cot[i]];
        } else if (cot[i] >= 47) return null;
        else if (cot[i] in JokerColor) tcolor = JokerColor[cot[i]];
        if (tcolor === -1) continue;
        if (color === -1) color = tcolor;
        else if (color !== tcolor) return null;
    }
    return color;
}
function PairSameColorWithHonor(cot) {
    let color = -1;
    for (let i = 0; i < 7; ++i) {
        let tcolor = -1;
        if (cot[i] < sizeUT) {
            if (HonorArray[cot[i]]) continue;
            tcolor = ColorArray[cot[i]];
        } else if (cot[i] >= 47) continue;
        else if (cot[i] in JokerColor) tcolor = JokerColor[cot[i]];
        if (tcolor === -1) continue;
        if (color === -1) color = tcolor;
        else if (color !== tcolor) return null;
    }
    return color;
}
function PairHun19Array(cot) {
    let count19 = Array(3).fill(0);
    let numcnt = 0;
    for (let i = 0; i < 7; ++i)
        if (cot[i] < sizeUT) {
            if (HonorArray[cot[i]]) continue;
            if (NumberArray[cot[i]] === 0 || NumberArray[cot[i]] === 8) ++count19[ColorArray[cot[i]]];
            else return undefined;
        } else if (cot[i] >= 47) continue;
        else if (cot[i] in JokerColor) ++count19[JokerColor[cot[i]]];
        else if (cot[i] === 46) ++numcnt;
    return [...count19, numcnt];
}
function getPointedDora(x) {
    if (x >= sizeUT) return x;
    if (ColorArray[x] === ColorArray[x + 1]) return x + 1;
    return ColorFirstArray[ColorArray[x]];
}
function getDoraPointer(x) {
    if (x >= sizeUT) return x;
    if (ColorArray[x] === ColorArray[x - 1]) return x - 1;
    return ColorFirstArray[ColorArray[x] + 1] - 1;
}
const SameColorArray = [0, 1, 2].map((j) => ColorArray.map((x) => (x === j ? 1 : 0)));
const SameColorWithHonorsArray = [0, 1, 2].map((j) => ColorArray.map((x, i) => (x === j || HonorArray[i] ? 1 : 0)));
const SameColorNoOrphanArray = [0, 1, 2].map((j) => ColorArray.map((x, i) => (x === j && !OrphanArray[i] ? 1 : 0)));
const SameColorAllOrphansArray = [0, 1, 2].map((j) => SameColorWithHonorsArray[j].map((x, i) => x && OrphanArray[i]));
function JP7Pairs(tids, infoans, tsumo, doras, uras, nuki, setting) {
    if (setting[49] && PairStep(getTiles(tids), true, guse3p) !== -1) return eans_jp;
    const ot = PairOutput(getTiles(tids)).map((x) => x[0]);
    let gans = ansCopy(infoans);
    let [valfus, realfus, fus] = [25, 25, [10]];
    valfus = realfus = JPFuArray[10] = [25, 50, 100][setting[8]];
    let tsuiso = true;
    for (let i = 0; tsuiso && i < 7; ++i)
        if (ot[i] < sizeUT && NoHonorArray[ot[i]]) tsuiso = false;
        else if (ot[i] >= 43 && ot[i] <= 46) tsuiso = false;
    if (tsuiso) JPUpdateFan(gans, setting, setting[1] && setting[10] ? 40 : 39);
    let [sp, sped] = [tsuiso ? null : isShiftPairs(ot), false];
    if (sp) {
        let sarr = [[28, 56, 31, 59], [26, 54, 29, 57], [27, 55, 30, 58]];
        if (setting[49]) sarr[0][0] = sarr[0][2] = -1;
        const c = sp.color;
        const [l, r] = c === -1 ? [0, 3] : [c, c + 1];
        for (let i = l; i < r && !sped; ++i) if (setting[sarr[i][0]] && sp.large) (JPUpdateFan(gans, setting, sarr[i][1]), (sped = true));
        for (let i = l; i < r && !sped; ++i) if (setting[sarr[i][2]]) (JPUpdateFan(gans, setting, sarr[i][3]), (sped = true));
    }
    const { c5ot, c5cnt } = PairFiveColorArray(ot);
    let c5check = !setting[41] && !setting[42] && !setting[43] && c5cnt.every(Boolean);
    if (!tsuiso && !sped && c5check && JPScoreArray0[67] < 0) JPUpdateFan(gans, setting, 67);
    if (gans.yakuman > 0) return getJPAnsUnion(setting, gans, fus, valfus, realfus);
    JPScoreArray0[17] = [2, 1, 0][setting[8]];
    if (setting[48] === 2) (--JPScoreArray0[31], --JPScoreArray0[28]);
    JPUpdateFan(gans, setting, 17);
    if (tsumo) JPUpdateFan(gans, setting, 2);
    const mv = gans.valfan;
    let tan19 = true;
    for (let i = 0; tan19 && i < 7; ++i)
        if (ot[i] < sizeUT && OrphanArray[ot[i]]) tan19 = false;
        else if (ot[i] >= 47) tan19 = false;
    const sc = PairSameColor(ot);
    const scwh = PairSameColorWithHonor(ot);
    const arr19 = PairHun19Array(ot);
    const hun19 = arr19 && arr19[0] <= 2 && arr19[1] <= 2 && arr19[2] <= 2 && arr19[0] + arr19[1] + arr19[2] + arr19[3] <= 6;
    const hunhun = arr19 && arr19[0] + arr19[1] + arr19[2] + arr19[3] <= 2;
    c5check &&= JPScoreArray0[67] > 0;
    let [gv, gd, gu, gf, gyk] = [0, 0, 0, [], false];
    let selected = Array(7).fill(0);
    const doraf = [
        { id: 43, range: [0, 9], joker: [0, 9], fid: (i) => i },
        { id: 44, range: [9, 18], joker: [9, 18], fid: (i) => i },
        { id: 45, range: [18, 27], joker: [18, 27], fid: (i) => i },
        { id: 46, range: [0, 3], joker: [0, 27], fid: (i) => selected[i], frange: (i) => i },
        { id: 47, range: [27, 31], joker: [27, 31], fid: (i) => i },
        { id: 48, range: [31, 34], joker: [31, 34], fid: (i) => i },
        { id: 49, range: [4, 6], joker: [27, 34], fid: (i) => selected[i], frange: (i) => i },
        { id: 42, range: [0, 2], fid: (i) => [selected[3], selected[6]][i], frange: (i) => [3, 6][i] },
    ];
    function dorakernel(depth = 0) {
        if (depth === 8) {
            let [nd, nu] = [0, 0];
            for (let i = 0; i < sizeUT; ++i) if (nuki[i]) ((nd += nuki[i] * doras[i]), (nu += nuki[i] * uras[i]));
            const fv = setting[12] ? (v, d) => v + d : (v) => v;
            let limit = setting[0];
            if (setting[11])
                if (!setting[3]) limit = Infinity;
                else limit = Math.max(limit, 13);
            function update(af, ad, au) {
                if (ad + au === -Infinity) return;
                const av = af.map((x) => JPScoreArray0[x]).reduce((a, b) => a + b, 0);
                ((ad += nd), (au += nu));
                if (gyk && mv + fv(av, ad, au) >= limit && av + ad + au > gv) [gv, gd, gu, gf] = [av + ad + au, ad, au, af];
                else if (!gyk && mv + fv(av, ad, au) >= limit) [gv, gd, gu, gf, gyk] = [av + ad + au, ad, au, af, true];
                else if (!gyk && av + ad + au > gv) [gv, gd, gu, gf] = [av + ad + au, ad, au, af];
            }
            update([], ...PairSelect(ot, doras, uras));
            if (tan19) update([4], ...PairSelect(ot, doras, uras, NoOrphanArray));
            if (sc !== null) {
                let [l, r] = sc !== -1 ? [sc, sc + 1] : [0, 3];
                if (sc !== -1) ((l = sc), (r = l + 1));
                for (let i = l; i < r; ++i) {
                    update([31], ...PairSelect(ot, doras, uras, SameColorArray[i]));
                    if (tan19) update([4, 31], ...PairSelect(ot, doras, uras, SameColorNoOrphanArray[i]));
                }
            }
            if (scwh !== null) {
                let [l, r] = scwh !== -1 ? [scwh, scwh + 1] : [0, 3];
                for (let i = l; i < r; ++i) {
                    update([28], ...PairSelect(ot, doras, uras, SameColorWithHonorsArray[i]));
                    if (hunhun) update([25, 28], ...PairSelect(ot, doras, uras, SameColorAllOrphansArray[i]));
                }
            }
            if (hun19) update([25], ...PairSelect(ot, doras, uras, OrphanArray));
            if (c5check) {
                update([67], ...PairSelect(c5ot, doras, uras));
                if (hun19) update([25, 67], ...PairSelect(c5ot, doras, uras, OrphanArray));
            }
            return;
        }
        const { id, range, fid, frange } = doraf[depth];
        if (doras[id] + uras[id] === 0) {
            selected[depth] = -1;
            dorakernel(depth + 1);
        } else {
            const [l, r] = range;
            for (let i = l; i < r; ++i) {
                const fix = fid(i);
                const [fl, fr] = fix === -1 ? doraf[frange(i)].joker : [fix, fix + 1];
                for (let i = fl; i < fr; ++i) {
                    selected[depth] = i;
                    ((doras[i] += doras[id]), (uras[i] += uras[id]));
                    dorakernel(depth + 1);
                    ((doras[i] -= doras[id]), (uras[i] -= uras[id]));
                }
            }
        }
    }
    dorakernel();
    ((gans.valfan += gv), gans.fan.push(...gf));
    if (setting[48] === 2) (++JPScoreArray0[31], ++JPScoreArray0[28]);
    return getJPAnsUnion(setting, gans, fus, valfus, realfus, gd, gu);
}
function getJPAnsUnion(setting, ans, fus, valfus, realfus, dora = 0, ura = 0) {
    return getJPAns(setting, ans.fan, ans.valfan, dora, ura, fus, valfus, realfus, ans.yakuman, ans.realyakuman);
}
function getJPAns(setting, fan, valfan, dora, ura, fus, valfus, realfus, yakuman = 0, realyakuman = 0) {
    let ans = { yakuman, realyakuman, valfan, fan, dora, ura, valfus, realfus, fus };
    if (yakuman > 0) return { val: 8000 * yakuman, ...ans, dora: 0, ura: 0 };
    if (setting[3] && valfan >= 13) return { val: 8000, ...ans, print: "counted_yakuman" };
    if (valfan >= 11) return { val: 6000, ...ans, print: "sanbaiman" };
    if (valfan >= 8) return { val: 4000, ...ans, print: "baiman" };
    if (valfan >= 6) return { val: 3000, ...ans, print: "haneman" };
    const pt = valfus * (1 << (2 + valfan));
    if (pt >= 2000) return { val: 2000, ...ans, print: "mangan" };
    if (setting[7] && pt >= 1920) return { val: 2000, ...ans, print: "kiri_mangan" };
    return { val: pt, ...ans };
}
const JPPrintSeq = [1, 16, 71, 60, 61, 68, 3, 15, 65, 12, 64, 13, 62, 14, 63, 2, 10, 11, 29, 52, 17, 7, 8, 9, 6, 5, 69, 4, 24, 21, 48, 19, 20, 50, 70, 23, 18, 22, 26, 25, 67, 27, 28, 31, 32, 33, 30, 66, 53, 38, 51, 34, 39, 44, 45, 36, 42, 43, 46, 54, 55, 56, 57, 58, 59, 35, 40, 49, 37, 41, 47, 96, 98, 100, 99, 97];
const JPScoreArray0 = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 5, 6, -1, -1, -1, -2, -1, -2, -1, -1, -2, -2, -1, -1, -1, -1, -1, -2, 2, -2, 2, -1, 0, 0, -1, -1, -1, -1, -1, -1, 1, 1, 5, 5, 5, 5, -1, 0, 1, 1, 0, 2];
const JPScoreArray1 = [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 2, 2, 2, 1, 2, 1, 2, 2, 1, 2, 2, 2, 2, 0, 5, 5, -1, -1, -1, -2, -1, -2, -1, -1, -2, -2, -1, -1, -1, -1, -1, -2, 1, -2, 2, -1, 0, 0, -1, -1, -1, -1, -1, -1, 1, 1, 5, 5, 5, 5, -1, 0, 1, 1, 0, 2];
const JPFuArray = [2, 4, 4, 8, 8, 16, 16, 32, 20, 30, 25, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
const GeneralArray = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
function SichuanZeroAns() {
    return { val: 0, fan: Array(18).fill(0) };
}
function SichuanKernel(melds, sp, aids, infoans, ck, ek, setting) {
    const n = countLack(melds);
    const ans = SichuanZeroAns();
    const update = (a, b, n = 1) => (a > 0 ? ((ans.val += a * n), (ans.fan[b] += n), (SCScoreArray[b] = a)) : undefined);
    if (n === 2) update(2, 1);
    const marr = flattenMelds(melds);
    let g = false;
    if (isMask(marr, GeneralArray)) {
        if (!sp && setting[1]) (update(2, 2), (g = true));
        if (sp && setting[2]) (update(2, 2), (g = true));
    }
    if (setting[4] && isContains19(melds) && (!sp || setting[5])) update(setting[4], 3);
    if (sp) update(2, 4);
    if (!sp && isAllTri(melds)) update(1, 5);
    if (aids[0].length <= 2) update(1, 6, g && !setting[3] ? 0 : 1);
    update(1, 7, countHog(melds) + ck + ek);
    infoans.forEach((x) => {
        if (x >= 8 && x <= 11) update(1, x);
    });
    if (infoans.includes(12)) update(setting[6], 12);
    if (infoans.includes(13)) update(setting[7], 13);
    if (aids[1].length === ck && setting[8] && !(sp && !setting[14])) update(1, 14);
    if (isMask(marr, NoOrphanArray) && setting[9] && !(g && !setting[10])) update(1, 15);
    return ans;
}
const SCScoreArray = [];
