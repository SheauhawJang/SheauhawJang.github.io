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
function RemoveMeldsByIndex(s, v) {
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
function AddMelds2(s, o, x, y) {
    const t = s.slice();
    const p = o.slice();
    let l = -1,
        r = t.length;
    while (l + 1 !== r) {
        const mid = (l + r) >> 1;
        if (t[mid] < x || (t[mid] === x && p[mid] < y)) l = mid;
        else r = mid;
    }
    t.splice(r, 0, x);
    p.splice(r, 0, y);
    return [t, p];
}
function AddMelds3(s, o, m, x, y, z) {
    const t = s.slice();
    const p = o.slice();
    const n = m.slice();
    let l = -1,
        r = t.length;
    while (l + 1 !== r) {
        const mid = (l + r) >> 1;
        if (t[mid] < x || (t[mid] === x && p[mid] < y) || (t[mid] === x && p[mid] === y && n[mid] < z)) l = mid;
        else r = mid;
    }
    t.splice(r, 0, x);
    p.splice(r, 0, y);
    n.splice(r, 0, z);
    return [t, p, n];
}
const seqsave = new Map();
const trisave = new Map();
function FourSame(a, b, c, d) {
    return a === b && b === c && c === d;
}
function FourShift(a, b, c, d) {
    if (ColorArray[a] !== ColorArray[d]) return false;
    const x = b - a,
        y = c - b,
        z = d - c;
    return x === y && y === z;
}
function ThreeSame(a, b, c) {
    return a === b && b === c;
}
function ThreeShift(a, b, c) {
    if (ColorArray[a] !== ColorArray[c]) return false;
    return b - a === c - b;
}
function MixedStraight(a, b, c) {
    let [ca, cb, cc] = [a, b, c].map((x) => ColorArray[x]).sort((a, b) => a - b);
    let [na, nb, nc] = [a, b, c].map((x) => NumberArray[x]).sort((a, b) => a - b);
    return ca === 0 && cb === 1 && cc === 2 && na === 0 && nb === 3 && nc === 6;
}
function ThreeMixedSame(a, b, c) {
    let [ca, cb, cc] = [a, b, c].map((x) => ColorArray[x]).sort((a, b) => a - b);
    let [na, nb, nc] = [a, b, c].map((x) => NumberArray[x]);
    return ca === 0 && cb === 1 && cc === 2 && na === nb && nb === nc;
}
function ThreeMixedShiftOne(a, b, c) {
    let [ca, cb, cc] = [a, b, c].map((x) => ColorArray[x]).sort((a, b) => a - b);
    let [na, nb, nc] = [a, b, c].map((x) => NumberArray[x]).sort((a, b) => a - b);
    return ca === 0 && cb === 1 && cc === 2 && na + 1 === nb && nb + 1 === nc;
}
function Distance(a, b, dis) {
    if (ColorArray[a] !== ColorArray[b]) return false;
    return Math.abs(b - a) === dis;
}
function FourShiftOne(a, b, c, d) {
    if (ColorArray[a] !== ColorArray[d]) return false;
    return a + 1 === b && b + 1 === c && c + 1 === d;
}
function ThreeShiftOne(a, b, c) {
    if (ColorArray[a] !== ColorArray[c]) return false;
    return a + 1 === b && b + 1 === c;
}
function GBSeqBind4(s, ma, a, b, c, d, ans) {
    let v = 0;
    let f = [];
    let tmsk = 0;
    let vs = [s[a], s[b], s[c], s[d]];
    const ms = [ma[a], ma[b], ma[c], ma[d]];
    const msk = ma[a] | ma[b] | ma[c] | ma[d];
    if (!(msk & 1) && FourSame(...vs)) (v = 42), (vs = [vs[0]]), (f = [14, -64, -64, -64]), (tmsk = 1);
    else if (!(msk & 2) && FourShift(...vs)) (v = 32), (f = [16]), (tmsk = 2);
    if (v) {
        const t = RemoveMeldsByIndex(s, [a, b, c, d]);
        const m = RemoveMeldsByIndex(ma, [a, b, c, d]);
        const r = [0, 1, 2, 3].map((i) => GBSeqBind(...AddMelds2(t, m, vs[i], ms[i] | tmsk)));
        for (let i = 0; i < r.length; ++i)
            if (r[i].val + v > ans.val) {
                ans.val = r[i].val + v;
                ans.fan = [...f, ...r[i].fan];
            }
    }
}
function GBSeqBind3(s, ma, a, b, c, ans) {
    let v = 0;
    let f = 0;
    let tmsk = 0;
    let vs = [s[a], s[b], s[c]];
    const ms = [ma[a], ma[b], ma[c]];
    const msk = ma[a] | ma[b] | ma[c];
    if (!(msk & 4) && ThreeSame(...vs)) (v = 24), (vs = [vs[0]]), (f = 23), (tmsk = 4);
    else if (ThreeShift(...vs)) {
        if (vs[1] - vs[0] === 3 && !(msk & 8)) (v = 16), (f = 28), (tmsk = 8);
        else if (vs[1] - vs[0] < 3 && !msk & 2048) (v = 16), (f = 30), (tmsk = 2048);
    } else if (!(msk & 16) && MixedStraight(...vs)) (v = 8), (f = 39), (tmsk = 16);
    else if (!(msk & 32) && ThreeMixedSame(...vs)) (v = 8), (f = 41), (tmsk = 32);
    else if (!(msk & 64) && ThreeMixedShiftOne(...vs)) (v = 6), (f = 50), (tmsk = 64);
    if (v) {
        const t = RemoveMeldsByIndex(s, [a, b, c]);
        const m = RemoveMeldsByIndex(ma, [a, b, c]);
        const r = [0, 1, 2].map((i) => GBSeqBind(...AddMelds2(t, m, vs[i], ms[i] | tmsk)));
        for (let i = 0; i < r.length; ++i)
            if (r[i].val + v > ans.val) {
                ans.val = r[i].val + v;
                ans.fan = [f, ...r[i].fan];
            }
    }
}
function GBSeqBind2(s, ma, a, b, ans) {
    let v = 0;
    let f = 0;
    let tmsk = 0;
    let vs = [s[a], s[b]];
    const ms = [ma[a], ma[b]];
    const msk = ma[a] | ma[b];
    if (!(msk & 128) && vs[0] === vs[1]) (v = 1), (vs = [vs[0]]), (f = 69), (tmsk = 128);
    else if (!(msk & 256) && NumberArray[vs[0]] === NumberArray[vs[1]]) (v = 1), (f = 70), (tmsk = 256);
    else if (!(msk & 512) && Distance(...vs, 6)) (v = 1), (f = 72), (tmsk = 512); // Old Young Set
    else if (!(msk & 1024) && Distance(...vs, 3)) (v = 1), (f = 71), (tmsk = 1024); // Consecutive 6
    if (v) {
        const t = RemoveMeldsByIndex(s, [a, b]);
        const m = RemoveMeldsByIndex(ma, [a, b]);
        const r = [0, 1].map((i) => GBSeqBind(...AddMelds2(t, m, vs[i], ms[i] | tmsk)));
        for (let i = 0; i < r.length; ++i) 
            if (r[i].val + v > ans.val) {
                ans.val = r[i].val + v;
                ans.fan = [f, ...r[i].fan];
            }
    }
}
let seq_miss = 0,
    seq_total = 0;
function GBSeqBind(s, ma = Array(s.length).fill(0)) {
    ++seq_total;
    const key = JSON.stringify({ s, ma });
    if (seqsave.has(key)) return seqsave.get(key);
    ++seq_miss;
    let ans = { val: 0, fan: [] };
    for (let a = 0; a < s.length; ++a) {
        if (a - 1 >= 0 && s[a] === s[a - 1]) continue;
        for (let b = a + 1; b < s.length; ++b) {
            if (b - 1 > a && s[b] === s[b - 1]) continue;
            for (let c = b + 1; c < s.length; ++c) {
                if (c - 1 > b && s[c] === s[c - 1]) continue;
                for (let d = c + 1; d < s.length; ++d) {
                    if (d - 1 > c && s[d] === s[d - 1]) continue;
                    GBSeqBind4(s, ma, a, b, c, d, ans);
                }
                GBSeqBind3(s, ma, a, b, c, ans);
            }
            GBSeqBind2(s, ma, a, b, ans);
        }
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
function GBTriBind4(s, op, ma, a, b, c, d, ans, pon) {
    let v = 0;
    let f = [];
    let tmsk = 0;
    const vs = [s[a], s[b], s[c], s[d]];
    let os = [op[a], op[b], op[c], op[d]];
    const ms = [ma[a], ma[b], ma[c], ma[d]];
    const msk = ma[a] | ma[b] | ma[c] | ma[d];
    if (FourShiftOne(...vs)) {
        if (!(msk & 1) && vs[0] < 27) (v = 48), (f = [15]), (tmsk = 1);
        else if (!(msk & 2)) {
            (v = 88), (f = [1, ...os.map((a) => -a)]), (tmsk = 2);
            for (let i = 0; i < os.length; ++i) v -= os[i] === 73 ? 1 : os[i] === 83 ? 4 : os[i] ? 2 : 0;
            os = [0, 0, 0, 0];
        }
        if (pon) (v -= 6), f.push(-49), (pon = false);
    } else if (!(msk & 4) && vs[3] >= sizeAT && vs[0] >= 27 && FourShiftOne(...[vs[0], vs[1], vs[2], GetIdFromHead(vs[3])].sort((a, b) => a - b))) {
        (v = 64), (f = [9]), (tmsk = 4);
        for (let i = 0; i < os.length; ++i) if (os[i] === 73) --v, f.push(-os[i]), (os[i] = 0);
    }
    if (v) {
        const t = RemoveMeldsByIndex(s, [a, b, c, d]);
        const p = RemoveMeldsByIndex(op, [a, b, c, d]);
        const m = RemoveMeldsByIndex(ma, [a, b, c, d]);
        const r = [0, 1, 2, 3].map((i) => GBTriBind(...AddMelds3(t, p, m, vs[i], os[i], ms[i] | tmsk), pon));
        for (let i = 0; i < r.length; ++i)
            if (r[i].val + v > ans.val) {
                ans.val = r[i].val + v;
                ans.fan = [...f, ...r[i].fan];
            }
    }
}
function GBTriBind3(s, op, ma, a, b, c, ans, pon) {
    let v = 0;
    let f = [];
    let tmsk = 0;
    const vs = [s[a], s[b], s[c]];
    let os = [op[a], op[b], op[c]];
    const ms = [ma[a], ma[b], ma[c]];
    const msk = ma[a] | ma[b] | ma[c];
    if (!(msk & 8) && vs[0] >= 31 && ThreeShiftOne(...vs)) {
        (v = 88), (f = [2]), (tmsk = 8);
        for (let i = 0; i < os.length; ++i) if (os[i] === 59) (v -= 2), f.push(-os[i]), (os[i] = 0);
    } else if (!(msk & 16) && vs[2] >= sizeAT && vs[0] >= 31 && ThreeShiftOne(...[vs[0], vs[1], GetIdFromHead(vs[2])].sort((a, b) => a - b))) {
        (v = 64), (f = [10]), (tmsk = 16);
        for (let i = 0; i < os.length; ++i) if (os[i] === 59) (v -= 2), f.push(-os[i]), (os[i] = 0);
    } else if (!(msk & 32) && vs[0] < 27 && ThreeShiftOne(...vs)) (v = 24), (f = [24]), (tmsk = 32);
    else if (!(msk & 64) && ThreeMixedSame(...vs)) (v = 16), (f = [32]), (tmsk = 64);
    else if (!(msk & 128) && Math.min(...vs) >= 27 && Math.max(...vs) <= 30) {
        (v = 12), (f = [38]), (tmsk = 128);
        for (let i = 0; i < os.length; ++i) if (os[i] === 73) --v, f.push(-os[i]), (os[i] = 0);
    } else if (!(msk & 256) && ThreeMixedShiftOne(...vs)) (v = 8), (f = [42]), (tmsk = 256);
    if (v) {
        const t = RemoveMeldsByIndex(s, [a, b, c]);
        const p = RemoveMeldsByIndex(op, [a, b, c]);
        const m = RemoveMeldsByIndex(ma, [a, b, c]);
        const r = [0, 1, 2].map((i) => GBTriBind(...AddMelds3(t, p, m, vs[i], os[i], ms[i] | tmsk), pon));
        for (let i = 0; i < r.length; ++i)
            if (r[i].val + v > ans.val) {
                ans.val = r[i].val + v;
                ans.fan = [...f, ...r[i].fan];
            }
    }
}
function GBTriBind2(s, op, ma, a, b, ans, pon) {
    let v = 0;
    let f = [];
    let tmsk = 0;
    const vs = [s[a], s[b]];
    let os = [op[a], op[b]];
    const ms = [ma[a], ma[b]];
    const msk = ma[a] | ma[b];
    if (!(msk & 512) && vs[0] >= 31 && vs[1] >= 31 && vs[1] < sizeUT) {
        (v = 6), (f = [54]), (tmsk = 512);
        for (let i = 0; i < os.length; ++i) if (os[i] === 59) (v -= 2), f.push(-os[i]), (os[i] = 0);
    } else if (!(msk & 1024) && (vs[0] === vs[1] || (vs[0] < 27 && vs[1] < 27 && NumberArray[vs[0]] === NumberArray[vs[1]]))) (v = 2), (f = [65]), (tmsk = 1024);
    if (v) {
        const t = RemoveMeldsByIndex(s, [a, b]);
        const p = RemoveMeldsByIndex(op, [a, b]);
        const m = RemoveMeldsByIndex(ma, [a, b]);
        const r = [0, 1].map((i) => GBTriBind(...AddMelds3(t, p, m, vs[i], os[i], ms[i] | tmsk), pon));
        for (let i = 0; i < r.length; ++i)
            if (r[i].val + v > ans.val) {
                ans.val = r[i].val + v;
                ans.fan = [...f, ...r[i].fan];
            }
    }
}
let tri_miss = 0,
    tri_total = 0;
function GBTriBind(s, op, ma, pon) {
    ++tri_total;
    const key = JSON.stringify({ s, op, ma, pon });
    if (trisave.has(key)) return trisave.get(key);
    ++tri_miss;
    let ans = { val: 0, fan: [] };
    for (let a = 0; a < s.length; ++a) {
        if (a - 1 >= 0 && s[a] === s[a - 1] && op[a] === op[a - 1]) continue;
        for (let b = a + 1; b < s.length; ++b) {
            if (b - 1 > a && s[b] === s[b - 1] && op[b] === op[b - 1]) continue;
            for (let c = b + 1; c < s.length; ++c) {
                if (c - 1 > b && s[c] === s[c - 1] && op[c] === op[c - 1]) continue;
                for (let d = c + 1; d < s.length; ++d) {
                    if (d - 1 > c && s[d] === s[d - 1] && op[d] === op[d - 1]) continue;
                    GBTriBind4(s, op, ma, a, b, c, d, ans, pon);
                }
                GBTriBind3(s, op, ma, a, b, c, ans, pon);
            }
            GBTriBind2(s, op, ma, a, b, ans, pon);
        }
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
function flattenMelds(melds) {
    let ans = [];
    for (let i = 0; i < melds.length; ++i)
        if (melds[i].length !== 3) ans.push(melds[i][0]);
        else for (let j = 0; j < melds[i].length; ++j) ans.push(melds[i][j]);
    return ans;
}
function isMask(melds, mask) {
    for (let i = 0; i < melds.length; ++i) if (!mask[melds[i]]) return false;
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
function isContains5(melds) {
    for (let i = 0; i < melds.length; ++i) {
        let contains = false;
        for (let j = 0; !contains && j < melds[i].length; ++j) {
            if (melds[i][j] >= 27) return false;
            if (NumberArray[melds[i][j]] === 4) contains = true;
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
function ninegate(melds, tiles, wintile) {
    if (!isSameColor(melds)) return false;
    const color = ColorFirstArray[ColorArray[melds[0][0]]];
    for (let i = 0; i < 9; ++i) {
        let cnt = tiles[i + color];
        if (i === wintile) --cnt;
        if (i === 0 || i === 8) {
            if (cnt > 3) return false;
        } else if (cnt > 1) return false;
    }
    const light = Array(9).fill(0);
    for (let i = 0; i < melds.length; ++i)
        if (melds[i].length === 1) light[NumberArray[melds[i][0]]] += 3;
        else for (let j = 0; j < melds[i].length; ++j) ++light[NumberArray[melds[i][j]]];
    if (light[0] < 3 || light[8] < 3) return false;
    for (let i = 1; i < 8; ++i) if (light[i] !== 1 && light[i] !== 2) return false;
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
            else if (melds[i].length === 2) tiles[melds[i][0]] += 2;
            else for (let j = 0; j < melds[i].length; ++j) ++tiles[melds[i][j]];
    let cnt = 0;
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
    let sq = 0,
        nt = 0,
        wt = 0,
        dt = 0;
    for (let i = 0; i < melds.length; ++i)
        if (melds[i].length === 3) ++sq;
        else if (melds[i][0] >= 31) ++dt;
        else if (melds[i][0] >= 27) ++wt;
        else if (melds[i].length !== 2) ++nt;
    return Math.max(sq - 1, 0) * 16 + Math.max(nt - 1, 0) * 16 + nt + getWindPredict(wt) + getDragonPredict(dt);
}
function calculateBind(seq, tri, wind60, wind61, has49 = false, can65 = true, can73 = true) {
    let v = 0;
    seq = seq.sort((a, b) => a - b);
    tri = tri.sort((a, b) => a - b);
    let orphan = Array(tri.length).fill(0);
    for (let i = 0; i < orphan.length; ++i)
        if (OrphanArray[tri[i]])
            if (wind61 === wind60 && wind61 === tri[i]) (orphan[i] = 83), (v += 4);
            else if (wind61 === tri[i]) (orphan[i] = 61), (v += 2);
            else if (wind60 === tri[i]) (orphan[i] = 60), (v += 2);
            else if (tri[i] >= 31) (orphan[i] = 59), (v += 2);
            else if (can73) (orphan[i] = 73), ++v;
    const seqans = GBSeqBind(seq);
    const trians = GBTriBind(tri, orphan, Array(tri.length).fill(can65 ? 0 : 1024), has49);
    return { val: seqans.val + trians.val + v, fan: [...seqans.fan, ...trians.fan, ...orphan.filter(Boolean)] };
}
let filter_cnt = 0;
let part_time = Array(8).fill(0);
function GBKernel(melds, gans, aids, ck, ek, cp, wind60, wind61, zimo, tiles) {
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
    const fourteen_type = melds.length === 5 && aids[0].length % 3 !== 0;
    if (ck + ek >= 4) {
        (v += 88), f.push(5);
        if (fourteen_type) must_pengpeng = true;
    } else if (ck + ek === 3) (v += 32), f.push(17);
    else if (ck === 2) (v += 6), f.push(53);
    else if (ek === 2) (v += 4), f.push(57);
    else if (ck + ek === 2) (v += 5), f.push(82);
    else if (ck) (v += 2), f.push(67);
    else if (ek) ++v, f.push(74);
    if (ck + cp >= 4) {
        (v += 64), f.push(12);
        if (fourteen_type) (must_pengpeng = true), (must_menqing = true);
    } else if (ck + cp === 3) (v += 16), f.push(33);
    else if (ck + cp === 2 && !(ck === 2 && ek === 0)) (v += 2), f.push(66);
    const marr = flattenMelds(melds);
    if (melds.length >= 5 && isMask(marr, GreenArray)) (v += 88), f.push(3), (must_hunyise = true);
    if (aids[0].length === 14 && aids[1].length === 0 && ninegate(melds, tiles ?? getTiles(aids[0]), aids[0].at(-1).id)) (v += 87), f.push(4), f.push(-73), (must_qingyise = true), (must_menqing = true);
    if (melds.length >= 5 && !must_menqing && aids[1].length === ck)
        if (zimo) (v += 4), f.push(56);
        else (v += 2), f.push(62);
    else if (zimo === 80) ++v, f.push(zimo);
    if (melds.length >= 5 && isMask(marr, PureOrphanArray)) (v += 64), f.push(8), (must_hun19 = true), (must_wuzi = true), (can_shuangtong = false);
    if (melds.length >= 5 && isMask(marr, HonorArray)) (v += 64), f.push(11), (must_hun19 = true), (must_hunyise = true);
    if (melds.length >= 5)
        if (isMask(marr, BigArray)) (v += 24), f.push(25), (must_wuzi = true);
        else if (isMask(marr, G5Array)) (v += 12), f.push(36), (must_wuzi = true);
    if (melds.length >= 5 && isMask(marr, MidArray)) (v += 24), f.push(26), (must_duan1 = true);
    if (melds.length >= 5)
        if (isMask(marr, LowArray)) (v += 24), f.push(27), (must_wuzi = true);
        else if (isMask(marr, L5Array)) (v += 12), f.push(37), (must_wuzi = true);
    let predict_v = 56 + predictHog(melds);
    if (!skip_bind) predict_v += predictBind(melds);
    predict_v = Math.max(predict_v, 64);
    if (v + predict_v <= gans) return { val: 0, fan: [] };
    ++filter_cnt;
    if (fourteen_type && isPureDoubleDragon(melds)) (v += 64), f.push(13), (must_qingyise = true), (must_pinghe = true), (skip_bind = true);
    if (fourteen_type && isMixedDoubleDragon(melds)) (v += 16), f.push(29), (must_pinghe = true), (skip_bind = true);
    if (melds.length >= 5 && !must_hun19 && isMask(marr, OrphanArray)) (v += 32), f.push(18), (must_hun19 = true);
    if (must_hun19) (must_pengpeng = true), (must_quandai = true), (yaojiuke = false);
    if (melds.length >= 5 && isMask(marr, EvenArray)) (v += 24), f.push(21), (must_pengpeng = true), (must_duan1 = true);
    if (melds.length >= 5 && !must_qingyise && isSameColor(melds)) (v += 24), f.push(22), (must_qingyise = true);
    if (must_qingyise) (must_hunyise = true), (must_wuzi = true);
    if (melds.length >= 5 && isContains5(melds)) (v += 16), f.push(31), (must_duan1 = true);
    if (melds.length >= 5 && isMask(marr, SymmeArray)) (v += 8), f.push(40), (must_quemen = true);
    if (melds.length >= 5 && !must_hunyise && isSameColorWithHonor(melds)) (v += 6), f.push(48), (must_hunyise = true);
    if (must_hunyise) must_quemen = true;
    let has_pengpeng = false;
    if (melds.length >= 5 && !must_pengpeng && isPengpeng(melds)) (v += 6), f.push(49), (has_pengpeng = true);
    if (isFiveColors(melds)) (v += 6), f.push(51);
    if (melds.length >= 5 && !must_quandai && isContains19(melds)) (v += 4), f.push(55);
    if (melds.length >= 5 && !must_pinghe && isPinghe(melds)) (v += 2), f.push(63), (must_pinghe = true);
    if (must_pinghe) must_wuzi = true;
    if (melds.length >= 5 && !must_duan1 && isMask(marr, NoOrphanArray)) (v += 2), f.push(68), (must_duan1 = true);
    if (must_duan1) must_wuzi = true;
    if (melds.length >= 5 && !must_quemen) {
        const n = countLack(melds);
        for (let i = 0; i < n; ++i) ++v, f.push(75);
    }
    if (melds.length >= 5 && !must_wuzi && isMask(marr, NoHonorArray)) ++v, f.push(76);
    const hog = countHog(melds);
    for (let i = 0; i < hog; ++i) (v += 2), f.push(64);
    if (!skip_bind) {
        let seq = [],
            tri = [];
        for (let i = 0; i < melds.length; ++i)
            if (melds[i].length === 3) seq.push(melds[i][0]);
            else if (melds[i].length === 2) tri.push(GetHeadFromId(melds[i][0]));
            else tri.push(melds[i][0]);
        const bind = calculateBind(seq, tri, wind60, wind61, fourteen_type && has_pengpeng, can_shuangtong, yaojiuke);
        v += bind.val;
        f = [...f, ...bind.fan];
    }
    return { val: v, fan: f };
}
function GBKnitDragon(melds, gans, aids, ck, ek, cp, wind60, wind61, zimo) {
    let f = [35];
    let v = 12;
    let must_pinghe = false;
    let must_wuzi = false;
    let skip_bind = false;
    if (ck + ek >= 4) (v += 88), f.push(5);
    else if (ck + ek === 3) (v += 32), f.push(17);
    else if (ck === 2) (v += 6), f.push(53);
    else if (ek === 2) (v += 4), f.push(57);
    else if (ck + ek === 2) (v += 5), f.push(82);
    else if (ck) (v += 2), f.push(67);
    else if (ek) ++v, f.push(74);
    if (ck + cp >= 4) (v += 64), f.push(12);
    else if (ck + cp === 3) (v += 16), f.push(33);
    else if (ck + cp === 2 && !(ck === 2 && ek === 0)) (v += 2), f.push(66);
    if (melds.length >= 5 && aids[1].length === ck)
        if (zimo) (v += 4), f.push(56);
        else (v += 2), f.push(62);
    else if (zimo === 80) ++v, f.push(zimo);
    let predict_v = 6 + predictHog(melds);
    if (!skip_bind) predict_v += predictBind(melds);
    if (v + predict_v <= gans) return { val: 0, fan: [] };
    ++filter_cnt;
    const marr = flattenMelds(melds);
    if (isFiveColors(melds)) (v += 6), f.push(51);
    if (melds.length >= 5 && !must_pinghe && isPinghe(melds)) (v += 2), f.push(63), (must_pinghe = true);
    if (must_pinghe) must_wuzi = true;
    if (melds.length >= 5 && !must_wuzi && isMask(marr, NoHonorArray)) ++v, f.push(76);
    const hog = countHog(melds);
    for (let i = 0; i < hog; ++i) (v += 2), f.push(64);
    if (!skip_bind) {
        let seq = [],
            tri = [];
        for (let i = 0; i < melds.length; ++i)
            if (isSeq(melds[i][0])) seq.push(melds[i][0]);
            else if (melds[i].length === 2) tri.push(GetHeadFromId(melds[i][0]));
            else if (melds[i].length !== 3) tri.push(melds[i][0]);
        const bind = calculateBind(seq, tri, wind60, wind61);
        v += bind.val;
        f = [...f, ...bind.fan];
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
let pairs_filer = 0;
function GB7Pairs(tids) {
    const ot = PairOutput(getTiles(tids));
    function leastProduct(f, prefix = Array(7).fill(-1), count = Array(sizeUT).fill(0), i = 0) {
        if (i === 7) {
            f(prefix, count);
            ++pairs_filer;
            return;
        }
        function next(j) {
            prefix[i] = j;
            ++count[j];
            leastProduct(f, prefix, count, i + 1);
            --count[j];
        }
        if (ot[i][0] < sizeUT) {
            next(ot[i][0]);
            return;
        }
        const [l, r] = JokerRange[ot[i][0]];
        let shadow = -1;
        for (let j = l; j < r; ++j) {
            if (count[j]) shadow = j;
            if (count[j] % 2 === 1) break;
        }
        if (shadow >= 0) next(shadow);
        else for (let j = l; j < r; ++j) next(j);
    }
    let gans = { val: 0, fan: [] };
    function pairKernel(a, tiles) {
        let v = 24;
        let f = [19];
        let must_hunyise = false;
        let must_qingyise = false;
        let must_hun19 = false;
        let must_duan1 = false;
        let must_wuzi = false;
        let must_quemen = false;
        const melds = a.map((x) => [x]);
        if (isMask(a, GreenArray)) (v += 88), f.push(3), (must_hunyise = true);
        if (isMask(a, PureOrphanArray)) (v += 64), f.push(8), (must_hun19 = true), (must_wuzi = true);
        if (isMask(a, HonorArray)) (v += 64), f.push(11), (must_hun19 = true), (must_hunyise = true);
        if (!must_hun19 && isMask(a, OrphanArray)) (v += 32), f.push(18);
        if (!must_qingyise && isSameColor(melds)) (v += 24), f.push(22), (must_qingyise = true);
        if (must_qingyise) (must_hunyise = true), (must_wuzi = true);
        if (isMask(a, BigArray)) (v += 24), f.push(25), (must_wuzi = true);
        else if (isMask(a, G5Array)) (v += 12), f.push(36), (must_wuzi = true);
        if (isMask(a, MidArray)) (v += 24), f.push(26), (must_duan1 = true);
        if (isMask(a, LowArray)) (v += 24), f.push(27), (must_wuzi = true);
        else if (isMask(a, L5Array)) (v += 12), f.push(37), (must_wuzi = true);
        if (isContains5(melds)) (v += 16), f.push(31), (must_duan1 = true);
        if (isMask(a, SymmeArray)) (v += 8), f.push(40), (must_quemen = true);
        if (!must_hunyise && isSameColorWithHonor(melds)) (v += 6), f.push(48), (must_hunyise = true);
        if (must_hunyise) must_quemen = true;
        if (!must_duan1 && isMask(a, NoOrphanArray)) (v += 2), f.push(68), (must_duan1 = true);
        if (must_duan1) must_wuzi = true;
        if (!must_quemen) {
            const n = countLack(melds);
            for (let i = 0; i < n; ++i) ++v, f.push(75);
        }
        if (!must_wuzi && isMask(a, NoHonorArray)) ++v, f.push(76);
        let hog = 0;
        for (let i = 0; i < sizeUT; ++i) hog += Math.floor(tiles[i] / 2);
        for (let i = 0; i < hog; ++i) (v += 2), f.push(64);
        if (v > gans.val) (gans.val = v), (gans.fan = f);
    }
    leastProduct(pairKernel);
    let arr = Array(5).fill(0);
    let cot = ot.map((x) => x[0]);
    for (let i = 0; i < cot.length; ++i) {
        if (cot[i] < sizeUT) ++arr[ColorArray[cot[i]]];
        else if (cot[i] in JokerColor) ++arr[JokerColor[cot[i]]];
    }
    for (let i = 0; i < cot.length; ++i) {
        if (cot[i] === 46) {
            let u = false;
            for (let j = 0; !u && j < 3; ++j) if (!arr[j]) ++arr[j], (u = true), (cot[i] = CJokerA[j]);
        } else if (cot[i] === 49) {
            let u = false;
            for (let j = 3; !u && j < 5; ++j) if (!arr[j]) ++arr[j], (u = true), (cot[i] = CJokerA[j]);
        } else if (cot[i] === JokerC) {
            let u = false;
            for (let j = 3; !u && j < 5; ++j) if (!arr[j]) ++arr[j], (u = true), (cot[i] = CJokerA[j]);
        }
    }
    if (arr.every(Boolean)) {
        let v = 24 + 6,
            f = [19, 51];
        let hun19 = true;
        for (let i = 0; hun19 && i < cot.length; ++i) if (cot[i] < sizeUT && !OrphanArray[cot[i]]) hun19 = false;
        if (hun19) (v += 32), f.push(18);
        let tiles = Array(sizeUT).fill(0);
        for (let i = 0; i < cot.length; ++i) {
            if (cot[i] < sizeUT) ++tiles[cot[i]];
            else {
                let u = false;
                const [l, r] = JokerRange[ot[i][0]];
                for (let j = l; !u && j < r; ++j) if (tiles[cot[i]] % 1 === 0) ++tiles[cot[i]], (u = true);
                if (!u) ++tiles[l];
            }
        }
        let hog = 0;
        for (let i = 0; i < sizeUT; ++i) hog += Math.floor(tiles[i] / 2);
        for (let i = 0; i < hog; ++i) (v += 2), f.push(64);
        if (v > gans.val) (gans.val = v), (gans.fan = f);
    }
    function isShiftPairs() {
        let c = -1;
        let nbs = Array(9).fill(0);
        for (let i = 0; i < ot.length; ++i) {
            let tc = -1;
            if (ot[i][0] < sizeUT) (tc = ColorArray[ot[i][0]]), ++nbs[NumberArray[ot[i][0]]];
            else if (ot[i][0] in JokerColor) tc = JokerColor[ot[i][0]];
            else if (ot[i][0] === 46 || ot[i][0] === JokerC) continue;
            else if (ot[i][0] === 49) return undefined;
            if (tc > 3) return undefined;
            if (c === -1) c = tc;
            else if (c !== tc) return undefined;
        }
        let maxp = -1,
            minp = 9;
        for (let i = 0; i < 9; ++i)
            if (nbs[i] > 1) return undefined;
            else if (nbs[i]) (maxp = Math.max(maxp, i)), (minp = Math.min(minp, i));
        if (maxp - minp >= 7) return undefined;
        let ans = { val: 88, fan: [6] };
        if (minp > 0 && maxp < 8) (ans.val += 2), ans.fan.push(68);
        return ans;
    }
    const sp = isShiftPairs();
    if (sp && sp.val > gans.val) return sp;
    return gans;
}
function PreAllMelds(aids, tiles = getTiles(aids[0]), full_tcnt = aids[0].length) {
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
        if (submeld[i].length === 0) return { err: 2 };
        nsubots *= submeld[i].length;
    }
    const { cnt, dvd } = realdvd(tiles, full_tcnt);
    const nmp = Math.floor(full_tcnt / 3) + (full_tcnt % 3 ? 1 : 0);
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
    return { itsubots: (g) => cartesianProduct(g, submeld), itots: dfs, nsubots, nots: cnt, ck, ek };
}
const GBScoreArray = [-1, 88, 88, 88, 88, 88, 88, 88, 64, 64, 64, 64, 64, 64, 48, 48, 32, 32, 32, 24, 24, 24, 24, 24, 24, 24, 24, 24, 16, 16, 16, 16, 16, 16, 12, 12, 12, 12, 12, 8, 8, 8, 8, 8, 8, 8, 8, 8, 6, 6, 6, 6, 6, 6, 6, 4, 4, 4, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5];
