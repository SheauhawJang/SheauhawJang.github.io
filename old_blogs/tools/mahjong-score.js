function realdvd(tiles, full_tcnt) {
    const nm = Math.floor(full_tcnt / 3);
    const np = full_tcnt % 3 ? 1 : 0;
    const { dvd, ldDvd } = prepareDvd(nm, np, tiles);
    const cnt = kernelRealDvd(tiles, nm, np, dvd, ldDvd);
    return { cnt, dvd, ldDvd };
}
function kernelRealDvd(tiles, nm, np, dvd, ldDvd, em = 0, ep = 0, i = 0, ui = 0, uj = 0, aj = 0, bj = 0, cj = 0) {
    if (i >= sizeUT)
        if (em === nm && ep === np) return 1;
        else return 0;
    const dpi = indexDvd(ldDvd, em, ep, i, ui, uj, aj, bj, cj);
    if (dvd[dpi] !== null) return dvd[dpi].cnt;
    dvd[dpi] = { cnt: 0, nxt: [] };
    let ra = tiles[JokerA[i]] - aj;
    let rb = tiles[JokerB[i]] - bj;
    let rc = tiles[JokerC] - cj;
    let ri = Math.max(tiles[i] - ui, 0);
    const nxti = i + 1;
    let ei = tiles[i];
    if (JokerA[i] !== JokerA[nxti]) (ri += ra), (ei += ra), (ra = aj = 0);
    if (JokerB[i] !== JokerB[nxti]) (ri += rb), (ei += rb), (rb = bj = 0);
    if (i >= sizeUT) (ri += rc), (ei += rc), (rc = cj = 0);
    const rsum = ra + rb + rc;
    const mp = np - ep;
    const ms = SeqCheck(i);
    for (let p = 0; p <= mp; ++p)
        for (let s = 0; !s || ms; ++s) {
            let ti = s + ui + p * 2;
            let tj = s + uj;
            let tk = s;
            let es = 0;
            if (s) {
                es += Math.max(tj - tiles[i + 1], 0);
                es += Math.max(tk - tiles[i + 2], 0);
                tj = Math.min(tj, tiles[i + 1]);
                tk = Math.min(tk, tiles[i + 2]);
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
                const ans = kernelRealDvd(tiles, nm, np, dvd, ldDvd, em + s + k, ep + p, nxti, tj, tk, aj + uaj, bj + ubj, cj + ucj);
                if (ans) {
                    dvd[dpi].cnt += ans;
                    dvd[dpi].nxt.push({ p, s, k, dpi: indexDvd(ldDvd, em + s + k, ep + p, nxti, tj, tk, aj + uaj, bj + ubj, cj + ucj) });
                }
            }
        }
    return dvd[dpi].cnt;
}
function RemoveMeldByIndex(s, v) {
    const t = s.slice();
    for (let i = v.length - 1; i >= 0; --i) t.splice(v[i], 1);
    return t;
}
function AddMeld(s, x) {
    const t = s.slice();
    let l = -1,
        r = t.length;
    while (l + 1 !== r) {
        const mid = (l + r) >> 1;
        if (t[mid] < x) l = mid;
        else r = mid;
    }
    t.splice(r, 0, x);
    return t;
}
function AddMeldAndOrphan(s, o, x, y) {
    const t = s.slice();
    const p = o.slice();
    let l = -1,
        r = t.length;
    while (l + 1 !== r) {
        const mid = (l + r) >> 1;
        if (t[mid] < x) l = mid;
        else r = mid;
    }
    t.splice(r, 0, x);
    p.splice(r, 0, y);
    return [t, p];
}
const seqsave = new Map();
const trisave = new Map();
function FourSame(a, b, c, d) {
    return a === b && b === c && c === d;
}
function FourShift(a, b, c, d) {
    if (JokerA[a] !== JokerA[d]) return false;
    const x = b - a,
        y = c - b,
        z = d - c;
    return x === y && y === z;
}
function ThreeSame(a, b, c) {
    return a === b && b === c;
}
function ThreeShift(a, b, c) {
    if (JokerA[a] !== JokerA[c]) return false;
    return b - a === c - b;
}
function MixedStraight(a, b, c) {
    let [ca, cb, cc] = [a, b, c].map((x) => Math.floor(x / 9)).sort((a, b) => a - b);
    let [na, nb, nc] = [a, b, c].map((x) => x % 9).sort((a, b) => a - b);
    return ca === 0 && cb === 1 && cc === 2 && na === 0 && nb === 3 && nc === 6;
}
function ThreeMixedSame(a, b, c) {
    let [ca, cb, cc] = [a, b, c].map((x) => Math.floor(x / 9)).sort((a, b) => a - b);
    let [na, nb, nc] = [a, b, c].map((x) => x % 9);
    return ca === 0 && cb === 1 && cc === 2 && na === nb && nb === nc;
}
function ThreeMixedShiftOne(a, b, c) {
    let [ca, cb, cc] = [a, b, c].map((x) => Math.floor(x / 9)).sort((a, b) => a - b);
    let [na, nb, nc] = [a, b, c].map((x) => x % 9).sort((a, b) => a - b);
    return ca === 0 && cb === 1 && cc === 2 && na + 1 === nb && nb + 1 === nc;
}
function Distance(a, b, dis) {
    if (JokerA[a] !== JokerA[b]) return false;
    return Math.abs(b - a) === dis;
}
function FourShiftOne(a, b, c, d) {
    if (JokerA[a] !== JokerA[d]) return false;
    return a + 1 === b && b + 1 === c && c + 1 === d;
}
function ThreeShiftOne(a, b, c) {
    if (JokerA[a] !== JokerA[c]) return false;
    return a + 1 === b && b + 1 === c;
}
function GBSeqBind4(s, a, b, c, d, ans) {
    let m = 0;
    let f = [];
    let vs = [s[a], s[b], s[c], s[d]];
    if (FourSame(...vs)) (m = 42), (vs = [vs[0]]), (f = [14, -64, -64, -64]);
    else if (FourShift(...vs)) (m = 32), (f = [16]);
    if (m) {
        const t = RemoveMeldByIndex(s, [a, b, c, d]);
        const r = vs.map((v) => GBSeqBind(AddMeld(t, v)));
        for (let i = 0; i < r.length; ++i)
            if (r[i].val + m > ans.val) {
                ans.val = r[i].val + m;
                ans.fan = [...f, ...r[i].fan];
            }
    }
}
function GBSeqBind3(s, a, b, c, ans) {
    let m = 0;
    let f = 0;
    let vs = [s[a], s[b], s[c]];
    if (ThreeSame(...vs)) (m = 24), (vs = [vs[0]]), (f = 23);
    else if (ThreeShift(...vs)) (m = 16), (f = vs[1] - vs[0] === 3 ? 28 : 30);
    else if (MixedStraight(...vs)) (m = 8), (f = 39);
    else if (ThreeMixedSame(...vs)) (m = 8), (f = 41);
    else if (ThreeMixedShiftOne(...vs)) (m = 6), (f = 50);
    if (m) {
        const t = RemoveMeldByIndex(s, [a, b, c]);
        const r = vs.map((v) => GBSeqBind(AddMeld(t, v)));
        for (let i = 0; i < r.length; ++i)
            if (r[i].val + m > ans.val) {
                ans.val = r[i].val + m;
                ans.fan = [f, ...r[i].fan];
            }
    }
}
function GBSeqBind2(s, a, b, ans) {
    let m = 0;
    let f = 0;
    let vs = [s[a], s[b]];
    if (vs[0] === vs[1]) (m = 1), (vs = [vs[0]]), (f = 69);
    else if (vs[0] % 9 === vs[1] % 9) (m = 1), (f = 70);
    else if (Distance(...vs, 6)) (m = 1), (f = 72); // Old Young Set
    else if (Distance(...vs, 3)) (m = 1), (f = 71); // Consecutive 6
    if (m) {
        const t = RemoveMeldByIndex(s, [a, b]);
        const r = vs.map((v) => GBSeqBind(AddMeld(t, v)));
        for (let i = 0; i < r.length; ++i)
            if (r[i].val + m > ans.val) {
                ans.val = r[i].val + m;
                ans.fan = [f, ...r[i].fan];
            }
    }
}
function GBSeqBind(s) {
    const key = JSON.stringify(s);
    if (seqsave.has(key)) return seqsave.get(key);
    let ans = { val: 0, fan: [] };
    for (let a = 0; a < s.length; ++a)
        for (let b = a + 1; b < s.length; ++b) {
            for (let c = b + 1; c < s.length; ++c) {
                for (let d = c + 1; d < s.length; ++d) GBSeqBind4(s, a, b, c, d, ans);
                GBSeqBind3(s, a, b, c, ans);
            }
            GBSeqBind2(s, a, b, ans);
        }
    if (seqsave.size > 1000000) seqsave.clear(), console.log("trisave cleared");
    seqsave.set(key, ans);
    return ans;
}
function GetHeadFromId(id) {
    return (id + 1) * sizeAT;
}
function GetIdFromHead(head) {
    return head / sizeAT - 1;
}
function GBTriBind4(s, orphan, a, b, c, d, ans, pon, st) {
    let m = 0;
    let f = [];
    const vs = [s[a], s[b], s[c], s[d]];
    let os = [orphan[a], orphan[b], orphan[c], orphan[d]];
    if (FourShiftOne(...vs)) {
        if (vs[0] < 27) (m = 48), (f = [15]);
        else {
            (m = 88), (f = [1, ...os.map((a) => -a)]);
            for (let i = 0; i < os.length; ++i) m -= os[i] === 73 ? 1 : os[i] === 83 ? 4 : os[i] ? 2 : 0;
            os = [0, 0, 0, 0];
        }
        if (pon) (m -= 6), f.push(-49), (pon = false);
    } else if (vs[3] >= sizeAT && vs[0] >= 27 && FourShiftOne(...[vs[0], vs[1], vs[2], GetIdFromHead(vs[3])].sort((a, b) => a - b))) {
        (m = 64), (f = [9]);
        for (let i = 0; i < os.length; ++i) if (os[i] === 73) --m, f.push(-os[i]), (os[i] = 0);
    }
    if (m) {
        const t = RemoveMeldByIndex(s, [a, b, c, d]);
        const p = RemoveMeldByIndex(orphan, [a, b, c, d]);
        const r = [0, 1, 2, 3].map((i) => GBTriBind(...AddMeldAndOrphan(t, p, vs[i], os[i]), pon, st));
        for (let i = 0; i < r.length; ++i)
            if (r[i].val + m > ans.val) {
                ans.val = r[i].val + m;
                ans.fan = [...f, ...r[i].fan];
            }
    }
}
function GBTriBind3(s, orphan, a, b, c, ans, pon, st) {
    let m = 0;
    let f = [];
    const vs = [s[a], s[b], s[c]];
    let os = [orphan[a], orphan[b], orphan[c]];
    if (vs[0] >= 31 && ThreeShiftOne(...vs)) {
        (m = 88), (f = [2]);
        for (let i = 0; i < os.length; ++i) if (os[i] === 59) (m -= 2), f.push(-os[i]), (os[i] = 0);
    } else if (vs[2] >= sizeAT && vs[0] >= 31 && ThreeShiftOne(...[vs[0], vs[1], GetIdFromHead(vs[2])].sort((a, b) => a - b))) {
        (m = 64), (f = [10]);
        for (let i = 0; i < os.length; ++i) if (os[i] === 59) (m -= 2), f.push(-os[i]), (os[i] = 0);
    } else if (vs[0] < 27 && ThreeShiftOne(...vs)) (m = 24), (f = [24]);
    else if (ThreeMixedSame(...vs)) (m = 16), (f = [32]);
    else if (Math.min(...vs) >= 27 && Math.max(...vs) <= 30) {
        (m = 12), (f = [38]);
        for (let i = 0; i < os.length; ++i) if (os[i] === 73) --m, f.push(-os[i]), (os[i] = 0);
    } else if (ThreeMixedShiftOne(...vs)) (m = 8), (f = [42]);
    if (m) {
        const t = RemoveMeldByIndex(s, [a, b, c]);
        const p = RemoveMeldByIndex(orphan, [a, b, c]);
        const r = [0, 1, 2].map((i) => GBTriBind(...AddMeldAndOrphan(t, p, vs[i], os[i]), pon, st));
        for (let i = 0; i < r.length; ++i)
            if (r[i].val + m > ans.val) {
                ans.val = r[i].val + m;
                ans.fan = [...f, ...r[i].fan];
            }
    }
}
function GBTriBind2(s, orphan, a, b, ans, pon, st) {
    let m = 0;
    let f = [];
    const vs = [s[a], s[b]];
    let os = [orphan[a], orphan[b]];
    if (vs[0] >= 31 && vs[1] >= 31 && vs[1] < sizeUT) {
        (m = 6), (f = [54]);
        for (let i = 0; i < os.length; ++i) if (os[i] === 59) (m -= 2), f.push(-os[i]), (os[i] = 0);
    } else if (st && (vs[0] === vs[1] || (vs[0] < 27 && vs[1] < 27 && vs[0] % 9 === vs[1] % 9))) (m = 2), (f = [65]);
    if (m) {
        const t = RemoveMeldByIndex(s, [a, b]);
        const p = RemoveMeldByIndex(orphan, [a, b]);
        const r = [0, 1].map((i) => GBTriBind(...AddMeldAndOrphan(t, p, vs[i], os[i]), pon, st));
        for (let i = 0; i < r.length; ++i)
            if (r[i].val + m > ans.val) {
                ans.val = r[i].val + m;
                ans.fan = [...f, ...r[i].fan];
            }
    }
}
function GBTriBind(s, orphan, pon, st) {
    const key = JSON.stringify({ s, orphan, pon, st });
    if (trisave.has(key)) return trisave.get(key);
    let ans = { val: 0, fan: [] };
    for (let a = 0; a < s.length; ++a)
        for (let b = a + 1; b < s.length; ++b) {
            for (let c = b + 1; c < s.length; ++c) {
                for (let d = c + 1; d < s.length; ++d) GBTriBind4(s, orphan, a, b, c, d, ans, pon, st);
                GBTriBind3(s, orphan, a, b, c, ans, pon, st);
            }
            GBTriBind2(s, orphan, a, b, ans, pon, st);
        }
    if (trisave.size > 1000000) trisave.clear(), console.log("trisave cleared");
    trisave.set(key, ans);
    return ans;
}
const GreenArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0];
const SymmeArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0];
const OrphanArray = [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1];
const NoOrphanArray = OrphanArray.map((x) => 1 - x);
const PureOrphanArray = [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0];
const BigArray = [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
const MidArray = [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const LowArray = [1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const G5Array = [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
const L5Array = [1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const EvenArray = [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0];
const HonorArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1];
const NoHonorArray = HonorArray.map((x) => 1 - x);
function isMask(melds, mask) {
    for (let i = 0; i < melds.length; ++i) for (let j = 0; j < melds[i].length; ++j) if (!mask[melds[i][j]]) return false;
    return true;
}
function isSameColor(melds) {
    let color = -1;
    for (let i = 0; i < melds.length; ++i) {
        if (melds[i][0] >= 27) return false;
        const cij = Math.floor(melds[i][0] / 9);
        if (color < 0) color = cij;
        else if (cij != color) return false;
    }
    return true;
}
function isContains5(melds) {
    for (let i = 0; i < melds.length; ++i) {
        let contains = false;
        for (let j = 0; !contains && j < melds[i].length; ++j) {
            if (melds[i][j] >= 27) return false;
            if (melds[i][j] % 9 === 4) contains = true;
        }
        if (!contains) return false;
    }
    return true;
}
function isSameColorWithHonor(melds) {
    let color = -1;
    for (let i = 0; i < melds.length; ++i) {
        if (melds[i][0] >= 27) continue;
        const cij = Math.floor(melds[i][0] / 9);
        if (color < 0) color = cij;
        else if (cij != color) return false;
    }
    return true;
}
function isFiveColors(melds) {
    let arr = Array(5).fill(false);
    for (let i = 0; i < melds.length; ++i) {
        let c;
        if (melds[i][0] < 27) Math.floor(melds[i][0] / 9);
        else if (melds[i][0] <= 30) c = 3;
        else c = 4;
        arr[c] = true;
    }
    return arr.every(Boolean);
}
function isContains19(melds) {
    for (let i = 0; i < melds.length; ++i) {
        let contains = false;
        for (let j = 0; !contains && j < melds[i].length; ++j) if (melds[i][j] >= 27 || melds[i][j] % 9 === 0 || melds[i][j] % 9 === 8) contains = true;
        if (!contains) return false;
    }
    return true;
}
function countLack(melds) {
    let arr = Array(3).fill(false);
    for (let i = 0; i < melds.length; ++i) if (melds[i][0] < 27) arr[Math.floor(melds[i][0] / 9)] = true;
    return 3 - arr.filter(Boolean).length;
}
function ninegate(melds, tiles, wintile) {
    if (!isSameColor(melds)) return false;
    const light = Array(9).fill(0);
    for (let i = 0; i < melds.length; ++i)
        if (melds[i].length === 1) light[melds[i][0] % 9] += 3;
        else for (let j = 0; j < melds[i].length; ++j) ++light[melds[i][j] % 9];
    if (light[0] < 3 || light[8] < 3) return false;
    for (let i = 1; i < 8; ++i) if (light[i] !== 1 && light[i] !== 2) return false;
    tiles = tiles.slice();
    --tiles[wintile];
    for (let i = 0; i < 27; ++i)
        if (i % 9 === 0 || i % 9 === 8) {
            if (tiles[i] > 3) return false;
        } else if (tiles[i] > 1) return false;
    return true;
}
// prettier-ignore
let seq = Array.from({ length: 25 }, (_, i) => [i, i + 1, i + 2]);
let tri = Array.from({ length: sizeUT }, (_, i) => [i]);
let quad = Array.from({ length: sizeUT }, (_, i) => [i, i, i, i]);
let pair = Array.from({ length: sizeUT }, (_, i) => [i, i]);
const PureDoubleDragon = [
    [seq[0], seq[0], seq[6], seq[6], pair[4]],
    [seq[9], seq[9], seq[15], seq[15], pair[13]],
    [seq[18], seq[18], seq[24], seq[24], pair[22]],
].map(normalize);
// prettier-ignore
const MixedDoubleDragon = [
    [seq[0], seq[0], seq[15], seq[15], pair[22]],
    [seq[0], seq[0], seq[24], seq[24], pair[13]],
    [seq[9], seq[9], seq[6], seq[6], pair[22]],
    [seq[9], seq[9], seq[24], seq[24], pair[4]],
    [seq[18], seq[18], seq[6], seq[6], pair[13]],
    [seq[18], seq[18], seq[15], seq[15], pair[4]],
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
function isPinghe(melds) {
    for (let i = 0; i < melds.length; ++i)
        if (melds[i].length === 2) {
            if (melds[i][0] >= 27) return false;
        } else if (melds[i].length !== 3) return false;
    return true;
}
function isPengpeng(melds) {
    for (let i = 0; i < melds.length; ++i) if (melds[i].length === 3) return false;
    return true;
}
function countHog(melds) {
    let tiles = Array(sizeUT).fill(0);
    for (let i = 0; i < melds.length; ++i)
        if (melds[i].length < 4)
            if (melds[i].length === 1) tiles[melds[i][0]] += 3;
            else for (let j = 0; j < melds[i].length; ++j) ++tiles[melds[i][j]];
    let cnt = 0;
    for (let i = 0; i < sizeUT; ++i) cnt += Math.floor(tiles[i] / 4);
    return cnt;
}
function GBKernel(melds, aids, ck, ek, cp, mw, gw, zm) {
    let f = [];
    let v = 0;
    let must_hunyise = false;
    let must_qingyise = false;
    let must_menqing = false;
    let must_pengpeng = false;
    let must_quandai = false;
    let must_hun19 = false;
    let must_pinghe = false;
    let must_duan1 = false;
    let must_wuzi = false;
    let must_quemen = false;
    let yaojiuke = true;
    let can_shuangtong = true;
    let skip_bind = false;
    if (ck + ek >= 4) {
        (v += 88), f.push(5);
        if (melds.length === 5) must_pengpeng = true;
    } else if (ck + ek === 3) (v += 32), f.push(17);
    else if (ck === 2) (v += 6), f.push(53);
    else if (ek === 2) (v += 4), f.push(57);
    else if (ck + ek === 2) (v += 5), f.push(82);
    else if (ck) (v += 2), f.push(67);
    else if (ek) ++v, f.push(74);
    if (ck + cp >= 4) {
        (v += 64), f.push(12);
        if (melds.length === 5) must_pengpeng = true;
        must_menqing = true;
    } else if (ck + cp === 3) (v += 16), f.push(33);
    else if (ck + cp === 2 && ck !== 2) (v += 2), f.push(66);
    if (melds.length >= 5 && isMask(melds, GreenArray)) (v += 88), f.push(3), (must_hunyise = true);
    if (melds.length === 5 && aids[1].length === 0 && ninegate(melds, getTiles(aids[0]), aids[0].at(-1).id)) (v += 87), f.push(4), f.push(-73), (must_qingyise = true), (must_menqing = true);
    if (melds.length >= 5 && isMask(melds, PureOrphanArray)) (v += 64), f.push(8), (must_hun19 = true), (must_wuzi = true), (can_shuangtong = false);
    if (melds.length >= 5 && isMask(melds, HonorArray)) (v += 64), f.push(11), (must_hun19 = true), (must_hunyise = true);
    if (melds.length === 5 && isPureDoubleDragon(melds)) (v += 64), f.push(13), (must_qingyise = true), (must_pinghe = true), (skip_bind = true);
    if (melds.length >= 5 && !must_hun19 && isMask(melds, OrphanArray)) (v += 32), f.push(18), (must_hun19 = true);
    if (must_hun19) (must_pengpeng = true), (must_quandai = true), (yaojiuke = false);
    if (melds.length >= 5 && isMask(melds, EvenArray)) (v += 24), f.push(21), (must_pengpeng = true), (must_duan1 = true);
    if (melds.length >= 5 && !must_qingyise && isSameColor(melds)) (v += 24), f.push(22), (must_qingyise = true);
    if (must_qingyise) (must_hunyise = true), (must_wuzi = true);
    if (melds.length >= 5)
        if (isMask(melds, BigArray)) (v += 24), f.push(25), (must_wuzi = true);
        else if (isMask(melds, G5Array)) (v += 12), f.push(36), (must_wuzi = true);
    if (melds.length >= 5 && isMask(melds, MidArray)) (v += 24), f.push(26), (must_duan1 = true);
    if (melds.length >= 5)
        if (isMask(melds, LowArray)) (v += 24), f.push(27), (must_wuzi = true);
        else if (isMask(melds, L5Array)) (v += 12), f.push(37), (must_wuzi = true);
    if (melds.length === 5 && isMixedDoubleDragon(melds)) (v += 16), f.push(29), (must_pinghe = true), (skip_bind = true);
    if (melds.length >= 5 && isContains5(melds)) (v += 16), f.push(31), (must_duan1 = true);
    if (melds.length >= 5 && isMask(melds, SymmeArray)) (v += 8), f.push(40), (must_quemen = true);
    if (melds.length >= 5 && !must_hunyise && isSameColorWithHonor(melds)) (v += 6), f.push(48), (must_hunyise = true);
    if (must_hunyise) must_quemen = true;
    let has_pengpeng = false;
    if (melds.length >= 5 && !must_pengpeng && isPengpeng(melds)) (v += 6), f.push(49), (has_pengpeng = true);
    if (isFiveColors(melds)) (v += 6), f.push(51);
    if (melds.length >= 5 && isContains19(melds)) if (!must_quandai) (v += 4), f.push(55);
    if (melds.length >= 5 && !must_pinghe && isPinghe(melds)) (v += 2), f.push(63), (must_pinghe = true);
    if (must_pinghe) must_wuzi = true;
    if (melds.length >= 5 && !must_duan1 && isMask(melds, NoOrphanArray)) (v += 2), f.push(68), (must_duan1 = true);
    if (must_duan1) must_wuzi = true;
    if (melds.length >= 5 && !must_quemen) {
        const n = countLack(melds);
        for (let i = 0; i < n; ++i) ++v, f.push(75);
    }
    if (melds.length >= 5 && !must_wuzi && isMask(melds, NoHonorArray)) ++v, f.push(76);
    if (melds.length >= 5 && !must_menqing && aids[1].length === ek)
        if (zm) (v += 4), f.push(56);
        else (v += 2), f.push(62);
    else if (zm === 80) ++v, f.push(zm);
    const hog = countHog(melds);
    for (let i = 0; i < hog; ++i) (v += 2), f.push(64);
    if (!skip_bind) {
        let seq = [],
            tri = [];
        for (let i = 0; i < melds.length; ++i)
            if (melds[i].length === 2) tri.push(GetHeadFromId(melds[i][0]));
            else if (melds[i].length === 3) seq.push(melds[i][0]);
            else tri.push(melds[i][0]);
        seq = seq.sort((a, b) => a - b);
        tri = tri.sort((a, b) => a - b);
        let orphan = Array(tri.length).fill(0);
        for (let i = 0; i < orphan.length; ++i)
            if (OrphanArray[tri[i]])
                if (mw === gw && mw === tri[i]) (orphan[i] = 83), (v += 4);
                else if (mw === tri[i]) (orphan[i] = 61), (v += 2);
                else if (gw === tri[i]) (orphan[i] = 60), (v += 2);
                else if (tri[i] >= 31) (orphan[i] = 59), (v += 2);
                else if (yaojiuke) (orphan[i] = 73), ++v;
        const seqans = GBSeqBind(seq);
        const trians = GBTriBind(tri, orphan, has_pengpeng, can_shuangtong);
        v += seqans.val + trians.val;
        f = [...f, ...seqans.fan, ...trians.fan, ...orphan.filter(Boolean)];
    }
    return { val: v, fan: f };
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
function PreAllMelds(aids) {
    let submeld = Array(aids[1].length)
        .fill(null)
        .map(() => []);
    let ek = 0,
        ck = 0;
    let nsubots = 1;
    for (let i = 0; i < aids[1].length; ++i) {
        let wfc = aids[1][i].map((x) => x.id);
        if (wfc.length > 4 || wfc.length < 3) return { err: 1 };
        if (wfc.length === 3) wfc = wfc.sort((a, b) => a - b);
        if (!isMeld(wfc) && !isQuad(wfc)) return { err: 2 };
        if (isSeq(wfc))
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
        nsubots *= submeld[i].length;
    }
    const { cnt, dvd } = realdvd(getTiles(aids[0]), aids[0].length);
    const nmp = Math.floor(aids[0].length / 3) + (aids[0].length % 3 ? 1 : 0);
    let melds = Array(nmp).fill(null);
    let msze = 0;
    function dfs(f, i = 0, dpi = 0) {
        if (msze === nmp) {
            f(melds);
            return;
        }
        const ans = dvd[dpi];
        for (let j = 0; j < ans.nxt.length; ++j) {
            const n = ans.nxt[j];
            for (let p = 0; p < n.p; ++p) melds[msze++] = pair[i];
            for (let s = 0; s < n.s; ++s) melds[msze++] = seq[i];
            for (let k = 0; k < n.k; ++k) melds[msze++] = tri[i];
            dfs(f, i + 1, n.dpi);
            msze -= n.p + n.s + n.k;
        }
    }
    console.log(cnt, nsubots);
    return { itsubots: (g) => cartesianProduct(g, submeld), itots: dfs, nsubots, nots: cnt, ck, ek };
}
const GBScoreArray = [-1, 88, 88, 88, 88, 88, 88, 88, 64, 64, 64, 64, 64, 64, 48, 48, 32, 32, 32, 24, 24, 24, 24, 24, 24, 24, 24, 24, 16, 16, 16, 16, 16, 16, 12, 12, 12, 12, 12, 8, 8, 8, 8, 8, 8, 8, 8, 8, 6, 6, 6, 6, 6, 6, 6, 4, 4, 4, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5];
