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
    let [ra, rb, rc] = [tiles[JokerA[i]] - aj, tiles[JokerB[i]] - bj, tiles[JokerC] - cj];
    const nxti = i + 1;
    let ei = tiles[i];
    if (JokerA[i] !== JokerA[nxti]) (ei += ra), (ra = aj = 0);
    if (JokerB[i] !== JokerB[nxti]) (ei += rb), (rb = bj = 0);
    if (i >= sizeUT) (ei += rc), (rc = cj = 0);
    const rsum = ra + rb + rc;
    const mp = np - ep;
    const ms = SeqCheck(i);
    for (let p = 0; p <= mp; ++p)
        for (let s = 0; !s || ms; ++s) {
            let [ti, tj, tk] = [s + ui + p * 2, s + uj, s];
            let es = 0;
            if (s) {
                (es += Math.max(tj - tiles[i + 1], 0)), (tj = Math.min(tj, tiles[i + 1]));
                (es += Math.max(tk - tiles[i + 2], 0)), (tk = Math.min(tk, tiles[i + 2]));
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
function MeldsPermutation(aids, tiles = getTiles(aids[0]), full_tcnt = aids[0].length, ota = Array(sizeUT).fill(0)) {
    let submeld = Array(aids[1].length)
        .fill(null)
        .map(() => []);
    let [ek, ck] = [0, 0];
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
            if (n.s) (ota[i + 1] += n.s), (ota[i + 2] += n.s);
            dfs(f, i + 1, n.dpi);
            msze -= n.p + n.s + n.k;
            ota[i] -= n.p * 2 + n.s + n.k * 3;
            if (n.s) (ota[i + 1] -= n.s), (ota[i + 2] -= n.s);
        }
    }
    console.log(cnt, nsubots, cnt * nsubots);
    return { itsubots: (g) => cartesianProduct(g, submeld), itots: dfs, nsubots, nots: cnt, ck, ek };
}
function RemoveMeldsByIndex(s, v, skipi) {
    const t = s.slice();
    for (let i = v.length - 1; i >= 0; --i) if (i !== skipi) t.splice(v[i], 1);
    return t;
}
function AddMeld(s, x) {
    const t = s.slice();
    let [l, r] = [-1, t.length];
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
    let [l, r] = [-1, t.length];
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
    let [l, r] = [-1, t.length];
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
    const [x, y, z] = [b - a, c - b, d - c];
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
function FourShiftOne(a, b, c, d, one = 1) {
    if (ColorArray[a] !== ColorArray[d]) return false;
    return a + one === b && b + one === c && c + one === d;
}
function ThreeShiftOne(a, b, c, one = 1) {
    if (ColorArray[a] !== ColorArray[c]) return false;
    return a + one === b && b + one === c;
}
function GBSeqBind4(s, ma, a, b, c, d, ans, que, setting) {
    let [v, f, tmsk] = [0, [], 0];
    const vs = [s[a], s[b], s[c], s[d]];
    const ms = [ma[a], ma[b], ma[c], ma[d]];
    const msk = ma[a] | ma[b] | ma[c] | ma[d];
    if (!(msk & 1) && FourSame(...vs)) {
        [v, f, tmsk] = [42, [14, -64, -64, -64], 1];
        if (!setting[16] && que) --v, f.push(-75);
    } else if (!(msk & 2) && FourShift(...vs)) {
        [v, f, tmsk] = [32, [16], 2];
        if (!setting[44] && que) --v, f.push(-75);
    }
    if (v) {
        const t = RemoveMeldsByIndex(s, [a, b, c, d]);
        const m = RemoveMeldsByIndex(ma, [a, b, c, d]);
        const r = [0, 1, 2, 3].map((i) => GBSeqBind(...AddMelds2(t, m, vs[i], ms[i] | tmsk), que, setting));
        for (let i = 0; i < r.length; ++i) if (r[i].val + v > ans.val) (ans.val = r[i].val + v), (ans.fan = [...f, ...r[i].fan]);
    }
}
function GBSeqBind3(s, ma, a, b, c, ans, que, setting) {
    let [v, f, tmsk] = [0, 0, 0];
    const vs = [s[a], s[b], s[c]];
    const ms = [ma[a], ma[b], ma[c]];
    const msk = ma[a] | ma[b] | ma[c];
    if (!(msk & 4) && ThreeSame(...vs)) [v, f, tmsk] = [24, 23, 4];
    else if (ThreeShift(...vs)) {
        if (vs[1] - vs[0] === 3 && !(msk & 8)) [v, f, tmsk] = [16, 28, 8];
        else if (vs[1] - vs[0] < 3 && !(msk & 2048)) [v, f, tmsk] = [16, 30, 2048];
    } else if (!(msk & 16) && MixedStraight(...vs)) [v, f, tmsk] = [8, 39, 16];
    else if (!(msk & 32) && ThreeMixedSame(...vs)) [v, f, tmsk] = [8, 41, 32];
    else if (!(msk & 64) && ThreeMixedShiftOne(...vs)) [v, f, tmsk] = [6, 50, 64];
    if (v) {
        const t = RemoveMeldsByIndex(s, [a, b, c]);
        const m = RemoveMeldsByIndex(ma, [a, b, c]);
        const r = [0, 1, 2].map((i) => GBSeqBind(...AddMelds2(t, m, vs[i], ms[i] | tmsk), que, setting));
        for (let i = 0; i < r.length; ++i) if (r[i].val + v > ans.val) (ans.val = r[i].val + v), (ans.fan = [f, ...r[i].fan]);
    }
}
function GBSeqBind2(s, ma, a, b, ans, que, setting) {
    let v = 0;
    let f = 0;
    let tmsk = 0;
    const vs = [s[a], s[b]];
    const ms = [ma[a], ma[b]];
    const msk = ma[a] | ma[b];
    if (!(msk & 128) && vs[0] === vs[1]) (v = 1), (f = 69), (tmsk = 128);
    else if (!(msk & 256) && NumberArray[vs[0]] === NumberArray[vs[1]]) (v = 1), (f = 70), (tmsk = 256);
    else if (!(msk & 512) && Distance(...vs, 6)) (v = 1), (f = 72), (tmsk = 512); // Old Young Set
    else if (!(msk & 1024) && Distance(...vs, 3)) (v = 1), (f = 71), (tmsk = 1024); // Consecutive 6
    if (v) {
        const t = RemoveMeldsByIndex(s, [a, b]);
        const m = RemoveMeldsByIndex(ma, [a, b]);
        const r = [0, 1].map((i) => GBSeqBind(...AddMelds2(t, m, vs[i], ms[i] | tmsk), que, setting));
        for (let i = 0; i < r.length; ++i) if (r[i].val + v > ans.val) (ans.val = r[i].val + v), (ans.fan = [f, ...r[i].fan]);
    }
}
let seq_miss = 0,
    seq_total = 0;
function GBSeqBind(s, ma, que, setting) {
    ++seq_total;
    const key = `${s.join(",")}|${ma.join(",")}`;
    if (seqsave.has(key)) return seqsave.get(key);
    ++seq_miss;
    let ans = { val: 0, fan: [] };
    for (let a = 0; a < s.length; ++a) {
        if (a - 1 >= 0 && s[a] === s[a - 1] && ma[a] === ma[a - 1]) continue;
        for (let b = a + 1; b < s.length; ++b) {
            if (b - 1 > a && s[b] === s[b - 1] && ma[b] === ma[b - 1]) continue;
            for (let c = b + 1; c < s.length; ++c) {
                if (c - 1 > b && s[c] === s[c - 1] && ma[c] === ma[c - 1]) continue;
                for (let d = c + 1; d < s.length; ++d) {
                    if (d - 1 > c && s[d] === s[d - 1] && ma[d] === ma[d - 1]) continue;
                    GBSeqBind4(s, ma, a, b, c, d, ans, que, setting);
                }
                GBSeqBind3(s, ma, a, b, c, ans, que, setting);
            }
            GBSeqBind2(s, ma, a, b, ans, que, setting);
        }
    }
    try {
        seqsave.set(key, ans);
    } catch {
        seqsave.clear();
        console.warn("seqsave cleared");
    }
    return ans;
}
function GetHeadFromId(id) {
    return (id + 1) * sizeAT;
}
function GetIdFromHead(head) {
    return head / sizeAT - 1;
}
function Get19KFan(osid) {
    switch (osid) {
        case 73:
            return 1;
        case 83:
            return 4;
        case 59:
        case 60:
        case 61:
            return 2;
        case 183:
            return 3;
        case 159:
        case 160:
        case 161:
            return 1;
        default:
            return 0;
    }
}
function GBTriBind4(s, op, ma, a, b, c, d, ans, pon, setting) {
    let [v, f, tmsk] = [0, [], 0];
    const vs = [s[a], s[b], s[c], s[d]];
    let os = [op[a], op[b], op[c], op[d]];
    const ms = [ma[a], ma[b], ma[c], ma[d]];
    const msk = ma[a] | ma[b] | ma[c] | ma[d];
    if (FourShiftOne(...vs)) {
        if (vs[0] < 27) {
            if (!(msk & 1)) {
                [v, f, tmsk] = [48, [15], 1];
                if (!setting[17] && pon & 4) --v, f.push(-75);
            }
        } else if (!(msk & 2)) {
            [v, f, tmsk] = [88, [1, ...os.map((a) => -a)], 2];
            for (let i = 0; i < os.length; ++i) v -= Get19KFan(os[i]);
            os = [0, 0, 0, 0];
            if (!setting[20] && pon & 2) (v -= 6), f.push(-49);
        }
        if (pon & 1) (v -= 6), f.push(-48);
    } else if (!(msk & 4) && vs[3] >= sizeAT && vs[0] >= 27 && FourShiftOne(...[vs[0], vs[1], vs[2], GetIdFromHead(vs[3])].sort((a, b) => a - b))) {
        [v, f, tmsk] = [64, [9], 4];
        if (!setting[35])
            for (let i = 0; i < os.length; ++i)
                if (os[i] === 73) --v, f.push(-os[i]), (os[i] = 0);
                else if (setting[33] && os[i] && os[i] < 100) --v, f.push(-73), (os[i] += 100);
        if (!setting[21] && pon & 2) (v -= 6), f.push(-49);
    }
    if (v) {
        const t = RemoveMeldsByIndex(s, [a, b, c, d]);
        const p = RemoveMeldsByIndex(op, [a, b, c, d]);
        const m = RemoveMeldsByIndex(ma, [a, b, c, d]);
        const r = [0, 1, 2, 3].map((i) => GBTriBind(...AddMelds3(t, p, m, vs[i], os[i], ms[i] | tmsk), pon, setting));
        for (let i = 0; i < r.length; ++i) if (r[i].val + v > ans.val) (ans.val = r[i].val + v), (ans.fan = [...f, ...r[i].fan]);
    }
}
function GBTriBind3(s, op, ma, a, b, c, ans, pon, setting) {
    let [v, f, tmsk] = [0, [], 0];
    const vs = [s[a], s[b], s[c]];
    let os = [op[a], op[b], op[c]];
    const ms = [ma[a], ma[b], ma[c]];
    const msk = ma[a] | ma[b] | ma[c];
    if (!(msk & 8) && vs[0] >= 31 && ThreeShiftOne(...vs)) {
        [v, f, tmsk] = [88, [2], 8];
        for (let i = 0; i < os.length; ++i) if (os[i] === 59 || os[i] === 159) (v -= Get19KFan(os[i])), f.push(-os[i]), (os[i] = 0);
        if (!setting[13] && pon & 4) --v, f.push(-75);
    } else if (!(msk & 16) && vs[2] >= sizeAT && vs[0] >= 31 && ThreeShiftOne(...[vs[0], vs[1], GetIdFromHead(vs[2])].sort((a, b) => a - b))) {
        [v, f, tmsk] = [64, [10], 16];
        for (let i = 0; i < os.length; ++i) if (os[i] === 59 || os[i] === 159) (v -= Get19KFan(os[i])), f.push(-os[i]), (os[i] = 0);
        if (!setting[14] && pon & 4) --v, f.push(-75);
    } else if (!(msk & 32) && vs[0] < 27 && ThreeShiftOne(...vs)) [v, f, tmsk] = [24, [24], 32];
    else if (!(msk & 64) && ThreeMixedSame(...vs)) [v, f, tmsk] = [16, [32], 64];
    else if (!(msk & 128) && Math.min(...vs) >= 27 && Math.max(...vs) <= 30) {
        [v, f, tmsk] = [12, [38], 128];
        if (!setting[34])
            for (let i = 0; i < os.length; ++i)
                if (os[i] === 73) --v, f.push(-os[i]), (os[i] = 0);
                else if (setting[33] && os[i] && os[i] < 100) --v, f.push(-73), (os[i] += 100);
        if (!setting[15] && pon & 4) --v, f.push(-75);
    } else if (!(msk & 256) && ThreeMixedShiftOne(...vs)) [v, f, tmsk] = [8, [42], 256];
    if (v) {
        const t = RemoveMeldsByIndex(s, [a, b, c]);
        const p = RemoveMeldsByIndex(op, [a, b, c]);
        const m = RemoveMeldsByIndex(ma, [a, b, c]);
        const r = [0, 1, 2].map((i) => GBTriBind(...AddMelds3(t, p, m, vs[i], os[i], ms[i] | tmsk), pon, setting));
        for (let i = 0; i < r.length; ++i)
            if (r[i].val + v > ans.val) {
                ans.val = r[i].val + v;
                ans.fan = [...f, ...r[i].fan];
            }
    }
}
function GBTriBind2(s, op, ma, a, b, ans, pon, setting) {
    let [v, f, tmsk] = [0, [], 0];
    const vs = [s[a], s[b]];
    let os = [op[a], op[b]];
    const ms = [ma[a], ma[b]];
    const msk = ma[a] | ma[b];
    if (!(msk & 512) && vs[0] >= 31 && vs[1] >= 31 && vs[1] < sizeUT) {
        [v, f, tmsk] = [6, [54], 512];
        for (let i = 0; i < os.length; ++i) if (os[i] === 59 || os[i] === 159) (v -= Get19KFan(os[i])), f.push(-os[i]), (os[i] = 0);
    } else if (!(msk & 1024) && (vs[0] === vs[1] || (vs[0] < 27 && vs[1] < 27 && NumberArray[vs[0]] === NumberArray[vs[1]]))) [v, f, tmsk] = [2, [65], 1024];
    if (v) {
        const t = RemoveMeldsByIndex(s, [a, b]);
        const p = RemoveMeldsByIndex(op, [a, b]);
        const m = RemoveMeldsByIndex(ma, [a, b]);
        const r = [0, 1].map((i) => GBTriBind(...AddMelds3(t, p, m, vs[i], os[i], ms[i] | tmsk), pon, setting));
        for (let i = 0; i < r.length; ++i) if (r[i].val + v > ans.val) (ans.val = r[i].val + v), (ans.fan = [...f, ...r[i].fan]);
    }
}
let [tri_miss, tri_total] = [0, 0];
function GBTriBind(s, op, ma, pon, setting) {
    ++tri_total;
    const key = `${s.join(",")}|${op.join(",")}|${ma.join(",")}`;
    if (trisave.has(key)) return trisave.get(key);
    ++tri_miss;
    let ans = { val: 0, fan: [] };
    for (let a = 0; a < s.length; ++a) {
        if (a - 1 >= 0 && s[a] === s[a - 1] && op[a] === op[a - 1] && ma[a] === ma[a - 1]) continue;
        for (let b = a + 1; b < s.length; ++b) {
            if (b - 1 > a && s[b] === s[b - 1] && op[b] === op[b - 1] && ma[b] === ma[b - 1]) continue;
            for (let c = b + 1; c < s.length; ++c) {
                if (c - 1 > b && s[c] === s[c - 1] && op[c] === op[c - 1] && ma[c] === ma[c - 1]) continue;
                for (let d = c + 1; d < s.length; ++d) {
                    if (d - 1 > c && s[d] === s[d - 1] && op[d] === op[d - 1] && ma[d] === ma[d - 1]) continue;
                    GBTriBind4(s, op, ma, a, b, c, d, ans, pon, setting);
                }
                GBTriBind3(s, op, ma, a, b, c, ans, pon, setting);
            }
            GBTriBind2(s, op, ma, a, b, ans, pon, setting);
        }
    }
    try {
        trisave.set(key, ans);
    } catch {
        trisave.clear();
        console.warn("trisave cleared");
    }
    return ans;
}
const GreenArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0];
const PureGreenArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0];
const SymmeArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0];
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
            if (wind61 === wind60 && wind61 === tri[i]) (orphan[i] = 83), (v += 4);
            else if (wind61 === tri[i]) (orphan[i] = 61), (v += 2);
            else if (wind60 === tri[i]) (orphan[i] = 60), (v += 2);
            else if (tri[i] >= 31) (orphan[i] = 59), (v += 2);
            else if (can73) (orphan[i] = 73), ++v;
            if (setting[33] && !can73 && orphan[i]) (orphan[i] += 100), --v;
        }
    const seqans = GBSeqBind(seq, Array(seq.length).fill(0), has75, setting);
    const trians = GBTriBind(tri, orphan, Array(tri.length).fill((can32 ? 0 : 64) | (can65 ? 0 : 1024)), has48 | (has49 ? 2 : 0) | (has75 ? 4 : 0), setting);
    let fan = [...seqans.fan, ...trians.fan, ...orphan.filter(Boolean)];
    for (let i = 0; i < fan.length; ++i)
        if (fan[i] > 100) fan.push(fan[i] - 100, -73), (fan[i] = 0);
        else if (fan[i] < -100) fan.push(fan[i] + 100, 73), (fan[i] = 0);
    return { val: seqans.val + trians.val + v, fan };
}
let filter_cnt = 0;
function buildHand(tiles, ta, wint) {
    if (wint < sizeUT) return undefined;
    let tb = Array(7).fill(0);
    for (let i = 0; i < sizeUT; ++i) tb[ColorArray[i]] += ta[i] - tiles[i];
    (tb[0] -= tiles[43]), (tb[1] -= tiles[44]), (tb[2] -= tiles[45]);
    (tb[3] -= tiles[47]), (tb[4] -= tiles[48]);
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
function GBKPC(ck, ek, cp, setting, fourteen_type, zimo) {
    let [v, f] = [0, []];
    let [must_pengpeng, must_menqing, must_2anke] = [false, false, false];
    let [has_single_ck, has_single_ek] = [false, false];
    if (ck + ek >= 4) {
        (v += 88), f.push(5), (must_pengpeng = fourteen_type);
        if (setting[30])
            if (ck === 2) (v += GBScoreArray[53] = setting[23] ? 8 : 6), f.push(53), (must_2anke = true);
            else if (ck === 1 && (setting[30] === 1 || cp === 0)) (v += 2), f.push(67), (has_single_ck = true);
    } else if (ck + ek === 3) {
        (v += 32), f.push(17);
        if (setting[30])
            if (ck === 2) (v += GBScoreArray[53] = setting[23] ? 8 : 6), f.push(53), (must_2anke = true);
            else if (ck === 1 && (setting[30] === 1 || cp === 0)) (v += 2), f.push(67), (has_single_ck = true);
    } else if (ck === 2) (v += GBScoreArray[53] = setting[23] ? 8 : 6), f.push(53), (must_2anke = true);
    else if (ek === 2) (v += 4), f.push(57);
    else if (ck + ek === 2) {
        if (setting[24] === 0) (v += 5), f.push(82);
        else if (setting[24] === 1) (v += 6), f.push(82), (GBScoreArray[82] = 6);
        else if (setting[24] === 2) (v += 3), f.push(67, 74), (has_single_ek = has_single_ck = true);
        else if (setting[24] === 3) (v += 6), f.push(57, 67), (has_single_ck = true);
    } else if (ck) (v += 2), f.push(67), (has_single_ck = true);
    else if (ek) ++v, f.push(74), (has_single_ek = true);
    if (ck + cp >= 4) (v += 64), f.push(12), (must_pengpeng = fourteen_type), (must_menqing = fourteen_type);
    else if (ck + cp === 3) (v += 16), f.push(33);
    else if (!must_2anke && ck + cp === 2) (v += 2), f.push(66);
    if (has_single_ek && zimo === 46 && setting[31]) --v, f.push(-74);
    else if (has_single_ck && zimo === 46 && setting[31] === 2) --v, f.push(-74);
    return { v, f, must_menqing, must_pengpeng };
}
function GBKernel(melds, gans, aids, ck, ek, cp, wind60, wind61, zimo, tiles, setting) {
    let [must_hunyise, must_qingyise, must_quandai, must_hun19, must_pinghe, must_duan1, must_wuzi, must_quemen] = Array(8).fill(false);
    let yaojiuke = true;
    let [can_2tong, can_3tong] = [true, true];
    let skip_bind = false;
    const fourteen_type = melds.length === 5 && aids[0].length % 3 !== 0;
    let { v, f, must_menqing, must_pengpeng } = GBKPC(ck, ek, cp, setting, fourteen_type, zimo);
    const marr = flattenMelds(melds);
    if (melds.length >= 5 && isMask(marr, GreenArray)) (v += 88), f.push(3), (must_hunyise ||= !setting[22]);
    if (aids[0].length === 14 && aids[1].length === 0 && ninegate(melds, tiles, aids[0].at(-1).id)) (v += 88), f.push(4), (must_qingyise = true), (must_menqing = true), setting[27] ? (yaojiuke = false) : (--v, f.push(-73));
    if (melds.length >= 5 && aids[1].length === ck)
        if ((setting[19] || !must_menqing) && zimo) (v += 4), f.push(56), (zimo = 56);
        else if (!must_menqing) (v += 2), f.push(62);
    if (zimo === 80) ++v, f.push(zimo);
    if (melds.length >= 5 && isMask(marr, TerminalArray)) (v += 64), f.push(8), (must_hun19 = true), (must_wuzi = true), (can_2tong &&= setting[28]), (can_3tong &&= setting[29]);
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
    if (melds.length >= 5 && isMask(marr, SymmeArray)) (v += 8), f.push(40), (must_quemen ||= !setting[18]);
    let has_pengpeng = false;
    if (melds.length >= 5 && !must_pengpeng && isAllTri(melds)) (v += 6), f.push(48), (has_pengpeng = true);
    let has_hunyise = false;
    if (melds.length >= 5 && !must_hunyise && isSameColorWithHonor(melds)) (v += 6), f.push(49), (must_hunyise = true), (has_hunyise = true);
    if (must_hunyise) must_quemen = true;
    if (isFiveColors(melds)) (v += 6), f.push(51);
    if (melds.length >= 5 && !must_quandai && isContains19(melds)) (v += 4), f.push(55);
    if (melds.length >= 5 && !must_pinghe && isAllSeq(melds)) (v += 2), f.push(63), (must_pinghe = true);
    if (must_pinghe) must_wuzi = true;
    if (melds.length >= 5 && !must_duan1 && isMask(marr, NoOrphanArray)) (v += 2), f.push(68), (must_duan1 = true);
    if (must_duan1) must_wuzi = true;
    let has_quemen = false;
    if (melds.length >= 5 && !must_quemen) {
        const n = countLack(melds);
        for (let i = 0; i < n; ++i) ++v, f.push(75), (has_quemen = true);
    }
    if (melds.length >= 5 && !must_wuzi && isMask(marr, NoHonorArray)) ++v, f.push(76);
    const hog = countHog(melds);
    for (let i = 0; i < hog; ++i) (v += 2), f.push(64);
    if (!skip_bind) {
        let [seq, tri] = [[], []];
        for (let i = 0; i < melds.length; ++i)
            if (melds[i].length === 3) seq.push(melds[i][0]);
            else if (melds[i].length === 2) tri.push(GetHeadFromId(melds[i][0]));
            else tri.push(melds[i][0]);
        const bind = calculateBind(seq, tri, wind60, wind61, fourteen_type && has_pengpeng, melds.length === 5 && has_hunyise, melds.length === 5 && has_quemen, can_3tong, can_2tong, yaojiuke, setting);
        (v += bind.val), (f = [...f, ...bind.fan]);
    }
    return { val: v, fan: f };
}
function GBKnitDragon(melds, gans, aids, ck, ek, cp, wind60, wind61, zimo, _, setting) {
    let { f, v } = GBKPC(ck, ek, cp, setting);
    (v += 12), f.push(35);
    let must_pinghe = false;
    let must_wuzi = false;
    if (melds.length >= 5 && aids[1].length === ck)
        if (zimo) (v += 4), f.push(56);
        else (v += 2), f.push(62);
    else if (zimo === 80) ++v, f.push(zimo);
    let predict_v = 6 + predictHog(melds);
    predict_v += predictBind(melds);
    if (v + predict_v <= gans) return { val: 0, fan: [] };
    ++filter_cnt;
    const marr = flattenMelds(melds);
    if (isFiveColors(melds)) (v += 6), f.push(51);
    if (melds.length >= 5 && !must_pinghe && isAllSeq(melds)) (v += 2), f.push(63), (must_pinghe = true);
    if (must_pinghe) must_wuzi = true;
    if (melds.length >= 5 && !must_wuzi && isMask(marr, NoHonorArray)) ++v, f.push(76);
    const hog = countHog(melds);
    for (let i = 0; i < hog; ++i) (v += 2), f.push(64);
    let [seq, tri] = [[], []];
    for (let i = 0; i < melds.length; ++i)
        if (isSeq(melds[i][0])) seq.push(melds[i][0]);
        else if (melds[i].length === 2) tri.push(GetHeadFromId(melds[i][0]));
        else if (melds[i].length !== 3) tri.push(melds[i][0]);
    const bind = calculateBind(seq, tri, wind60, wind61);
    (v += bind.val), (f = [...f, ...bind.fan]);
    return { val: v, fan: f };
}
let pairs_filer = 0;
function GB7Pairs(tids, setting) {
    const ot = PairOutput(getTiles(tids));
    function pairLeastProduct(f, prefix = Array(7).fill(-1), count = Array(sizeUT).fill(0), i = 0) {
        if (i === 7) {
            f(prefix, count);
            ++pairs_filer;
            return;
        }
        function next(j) {
            prefix[i] = j;
            ++count[j];
            pairLeastProduct(f, prefix, count, i + 1);
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
        let [must_hunyise, must_qingyise, must_quandai, must_hun19, must_duan1, must_wuzi, must_quemen] = Array(7).fill(false);
        const melds = a.map((x) => [x]);
        if (setting[1] && isMask(a, GreenArray)) (v += 88), f.push(3), (must_hunyise ||= !setting[22]);
        if (setting[2] && isMask(a, TerminalArray)) (v += 64), f.push(8), (must_hun19 = true), (must_wuzi = true);
        if (setting[3] && isMask(a, HonorArray)) (v += 64), f.push(11), (must_hun19 = true), (must_hunyise = true);
        if (setting[4] && !must_hun19 && isMask(a, OrphanArray)) (v += 32), f.push(18), (must_hun19 = true);
        if (must_hun19) must_quandai = true;
        if (setting[12] && isMask(a, EvenArray)) (v += 24), f.push(21), (must_duan1 = true);
        if (setting[5] && !must_qingyise && isSameColor(melds)) (v += 24), f.push(22), (must_qingyise = true);
        if (must_qingyise) (must_hunyise = true), (must_wuzi = true);
        if (setting[6] && isMask(a, BigArray)) (v += 24), f.push(25), (must_wuzi = true);
        else if (setting[7] && isMask(a, G5Array)) (v += 12), f.push(36), (must_wuzi = true);
        if (setting[6] && isMask(a, MidArray)) (v += 24), f.push(26), (must_duan1 = true);
        if (setting[6] && isMask(a, LowArray)) (v += 24), f.push(27), (must_wuzi = true);
        else if (setting[7] && isMask(a, L5Array)) (v += 12), f.push(37), (must_wuzi = true);
        if (setting[8] && isContains5(melds)) (v += 16), f.push(31), (must_duan1 = true);
        if (setting[9] && isMask(a, SymmeArray)) (v += 8), f.push(40), (must_quemen ||= !setting[18]);
        if (setting[10] && !must_hunyise && isSameColorWithHonor(melds)) (v += 6), f.push(49), (must_hunyise = true);
        if (must_hunyise) must_quemen = true;
        if (setting[40] && !must_quandai && isMask(a, OrphanArray)) (v += 4), f.push(55);
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
    pairLeastProduct(pairKernel);
    let arr = Array(5).fill(0);
    let cot = ot.map((x) => x[0]);
    for (let i = 0; i < cot.length; ++i)
        if (cot[i] < sizeUT) ++arr[ColorArray[cot[i]]];
        else if (cot[i] in JokerColor) ++arr[JokerColor[cot[i]]];
    for (let i = 0; i < cot.length; ++i)
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
    if (setting[11] && arr.every(Boolean)) {
        let [v, f] = [24 + 6, [19, 51]];
        let hun19 = true;
        for (let i = 0; hun19 && i < cot.length; ++i) if (cot[i] < sizeUT && !OrphanArray[cot[i]]) hun19 = false;
        if (hun19)
            if (setting[4]) (v += 32), f.push(18);
            else if (setting[40]) (v += 4), f.push(55);
        let tiles = Array(sizeUT).fill(0);
        for (let i = 0; i < cot.length; ++i)
            if (cot[i] < sizeUT) ++tiles[cot[i]];
            else {
                let u = false;
                const [l, r] = JokerRange[ot[i][0]];
                for (let j = l; !u && j < r; ++j) if (tiles[cot[i]] % 1 === 0) ++tiles[cot[i]], (u = true);
                if (!u) ++tiles[l];
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
            if (tc >= 3) return undefined;
            if (c === -1) c = tc;
            else if (c !== tc) return undefined;
        }
        let [maxp, minp] = [-1, 9];
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
const GBScoreArray = [-1, 88, 88, 88, 88, 88, 88, 88, 64, 64, 64, 64, 64, 64, 48, 48, 32, 32, 32, 24, 24, 24, 24, 24, 24, 24, 24, 24, 16, 16, 16, 16, 16, 16, 12, 12, 12, 12, 12, 8, 8, 8, 8, 8, 8, 8, 8, 8, 6, 6, 6, 6, 6, 6, 6, 4, 4, 4, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5];
const eans_jp = { val: 0, valfan: 0, fan: [], valfus: 0, fus: [], yakuman: 0, realyakuman: 0, realfus: 0, dora: 0, ura: 0 };
let use_time = 0;
function JPGetFusMain(melds, aids, ck, wind5, wind6, tsumo, tiles, ta, setting, mq = melds.length >= 5 && aids[1].length === ck, wint = aids[0].at(-1)?.id ?? -1, tb = buildHand(tiles, ta, wint)) {
    const hcnt = Math.ceil(aids[0].length / 3);
    let [valfus, fus] = [20, [8]];
    if (mq && !tsumo) (valfus += 10), (fus = [9]);
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
            else if (canBeListen(tiles, ta, tb, melds[i][1], wint) && !listen_type) listen_type = 18;
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
    if (!tsumo && !listen_type && !bilisten && koutsufu.length > 0) (koutsufu[epmid] ^= 2), --cp;
    for (let i = hcnt; i < melds.length; ++i)
        if (melds[i].length === 1) koutsufu.push(OrphanArray[melds[i][0]] ? 1 : 0);
        else if (melds[i].length === 4) koutsufu.push((OrphanArray[melds[i][0]] ? 1 : 0) | 4 | (aids[1][i - hcnt].type % 4 === 0 ? 2 : 0));
    for (let i = 0; i < koutsufu.length; ++i) valfus += JPFuArray[koutsufu[i]];
    fus.push(...koutsufu);
    if (setting[5] && head === wind5 && head === wind6) (valfus += 2), fus.push(20);
    else {
        if (head === wind5) (valfus += 2), fus.push(12);
        if (head === wind6) (valfus += 2), fus.push(13);
    }
    if (head === 31) (valfus += 2), fus.push(14);
    if (head === 32) (valfus += 2), fus.push(15);
    if (head === 33) (valfus += 2), fus.push(16);
    return { head, listen_type, cp, bilisten, valfus, fus };
}
function JPGetFusRemain(yakuman, infoans, tsumo, fus, valfus, listen_type, bilisten, setting, mq, v = 0, f = []) {
    if ((setting[6] || !tsumo) && (mq || setting[24]) && fus.length === 1 && bilisten && yakuman === 0) ++v, f.push(10);
    else {
        if (listen_type) (valfus += 2), fus.push(listen_type);
        if (tsumo && !(setting[16] && yakuman === 0 && infoans.fan.includes(12))) (valfus += 2), fus.push(11);
    }
    if (!setting[25] && !mq && valfus <= 20) valfus += 2;
    const realfus = valfus;
    if (setting[14]) valfus = Math.ceil(valfus / 10) * 10;
    return { fus, valfus, realfus, v, f };
}
function JPKernel(melds, infoans, gans, aids, ck, ek, wind5, wind6, tsumo, tiles, ta, doras, uras, nuki, setting) {
    let f = [];
    let [v, yakuman, realyakuman] = [infoans.valfan, infoans.yakuman, infoans.yakuman];
    function updateYakuman(x, n = 1) {
        if (n === 0) return;
        if (setting[2]) realyakuman = yakuman += x * n;
        else (yakuman = Math.max(yakuman, x)), (realyakuman += x * n);
    }
    const mq = melds.length >= 5 && aids[1].length === ck;
    const wint = aids[0].at(-1)?.id ?? -1;
    const tb = buildHand(tiles, ta, wint);
    let { head, listen_type, cp, bilisten, valfus, fus } = JPGetFusMain(melds, aids, ck, wind5, wind6, tsumo, tiles, ta, setting, mq, wint, tb);
    if (aids[0].length === 14 && aids[1].length === 0 && ninegate(melds))
        if (setting[1] && ninegateListen(ColorFirstArray[ColorArray[melds[0][0]]], tiles, wint)) updateYakuman(2), f.push(47);
        else updateYakuman(1), f.push(46);
    const marr = flattenMelds(melds);
    if (melds.length >= 5 && isMask(marr, TerminalArray)) updateYakuman(1), f.push(45);
    function updateGreen() {
        if (setting[18] && isMask(marr, PureGreenArray))
            if (setting[18] === 1) return;
            else if (setting[1] && setting[18] === 2) return updateYakuman(2), f.push(49);
        return updateYakuman(1), f.push(44);
    }
    if (melds.length >= 5 && isMask(marr, GreenArray)) updateGreen();
    if (melds.length >= 5 && ck + ek >= 4) updateYakuman(1), f.push(43);
    let windcount = Array(4).fill(0);
    let dragoncount = Array(3).fill(0);
    for (let i = 0; i < melds.length; ++i)
        if (melds[i].length !== 2)
            if (ColorArray[melds[i][0]] === 3) ++windcount[melds[i][0] - 27];
            else if (ColorArray[melds[i][0]] === 4) ++dragoncount[melds[i][0] - 31];
    const bgwind = Math.min(...windcount);
    updateYakuman(setting[1] ? 2 : 1, bgwind), f.push(...Array(bgwind).fill(41));
    if (ColorArray[head] === 3) {
        ++windcount[head - 27];
        if (Math.min(...windcount) > bgwind) updateYakuman(1), f.push(42);
    }
    if (melds.length >= 5 && isMask(marr, HonorArray)) updateYakuman(1), f.push(39);
    const bgdragon = Math.min(...dragoncount);
    updateYakuman(1, bgdragon), f.push(...Array(bgdragon).fill(38));
    if (ck + cp >= 4)
        if (setting[1] && head !== -1 && canBeListen(tiles, ta, tb, head, wint)) updateYakuman(2), f.push(35);
        else updateYakuman(1), f.push(34);
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
        updateYakuman(1, shift4), f.push(...Array(shift4).fill(51));
    }
    if (setting[22] === 1 || (setting[22] === 2 && mq)) {
        init_seq();
        let same4 = 0;
        for (let i = 0; i < 25; ++i) same4 += Math.floor(seq[i] / 4);
        updateYakuman(1, same4), f.push(...Array(same4).fill(53));
    }
    let realfus;
    ({ fus, valfus, realfus, v, f } = JPGetFusRemain(yakuman, infoans, tsumo, fus, valfus, listen_type, bilisten, setting, mq, v, f));
    if (infoans.yakuman > 0) f.push(...infoans.fan);
    if (yakuman > 0) return { val: yakuman * 8000, yakuman, realyakuman, valfan: v, fan: f, valfus, realfus, fus };
    if (gans.yakuman > 0) return eans_jp;
    f.push(...infoans.fan);
    let [must_hunyise, must_quandai] = [false, false];
    if (melds.length >= 5 && isSameColor(melds)) (v += mq ? 6 : 5), f.push(31), (must_hunyise = true);
    init_seq();
    let same3 = 0;
    const Same3Array = [0, 2, 1.5, 2.5, 2, 3];
    const Same3RealArray = mq ? [0, 2, 2, 3, 2, 3] : [0, 2, 1, 2, 0, 0];
    if (Same3RealArray[setting[21]] !== 0) {
        JPScoreArray[52] = Same3Array[setting[21]];
        for (let i = 0; i < 25; ++i) same3 += Math.floor(seq[i] / 3);
        (v += Same3RealArray[setting[21]] * same3), f.push(...Array(same3).fill(52));
    }
    if (mq) {
        let beikou = 0;
        for (let i = 0; i < 25; ++i) beikou += Math.floor(seq[i] / 2);
        const b1 = beikou % 2,
            b2 = Math.floor(beikou / 2);
        (v += b1 + 3 * b2), f.push(...Array(b2).fill(29));
        if (!same3 && b1) f.push(11);
    }
    if (melds.length >= 5 && !must_hunyise && isSameColorWithHonor(melds)) (v += mq ? 3 : 2), f.push(28);
    if (melds.length >= 5 && isMask(marr, OrphanArray)) (v += 2), f.push(25), (must_quandai = true);
    if (melds.length >= 5 && isContains19(melds))
        if (isMask(marr, NoHonorArray)) (v += mq ? 3 : 2), f.push(27);
        else if (!must_quandai) (v += mq ? 2 : 1), f.push(24);
    if (ColorArray[head] === 4) {
        ++dragoncount[head - 31];
        if (Math.min(...dragoncount) > bgdragon) (v += 2), f.push(26);
    }
    if (ck + ek === 3) (v += 2), f.push(23);
    if (ck + cp === 3) (v += 2), f.push(22);
    let itsu = 0;
    for (let i = 0; i < 3; ++i) itsu += Math.min(seq[i * 9], seq[i * 9 + 3], seq[i * 9 + 6]);
    (v += itsu * (mq ? 2 : 1)), f.push(...Array(itsu).fill(21));
    let sanshoku = 0;
    for (let i = 0; i < 7; ++i) sanshoku += Math.min(seq[i], seq[i + 9], seq[i + 18]);
    (v += sanshoku * (mq ? 2 : 1)), f.push(...Array(sanshoku).fill(19));
    if (setting[17]) {
        let santsu = 0;
        for (let i = 0; i < 6; ++i) santsu += Math.min(seq[Permutation3[i][0] * 9], seq[Permutation3[i][1] * 9 + 3], seq[Permutation3[i][2] * 9 + 6]);
        (v += santsu * (mq ? 2 : 1)), f.push(...Array(santsu).fill(48));
    }
    let toukou = 0;
    init_tri();
    for (let i = 0; i < 9; ++i) toukou += Math.min(tri[i], tri[i + 9], tri[i + 18]);
    (v += toukou * 2), f.push(...Array(toukou).fill(20));
    if (setting[19]) {
        let tri3 = tri.slice();
        let shift3 = 0;
        for (let i = 0; i < 3; ++i)
            for (let j = 0; j < 7; ++j) {
                const cnt = Math.min(...tri3.slice(i * 9 + j, i * 9 + j + 3));
                for (let k = 0; k < 3; ++k) tri3[i * 9 + j + k] -= cnt;
                shift3 += cnt;
            }
        (v += shift3 * 2), f.push(...Array(shift3).fill(50));
    }
    if (melds.length >= 5 && isAllTri(melds)) (v += 2), f.push(18);
    (v += tri[wind5]), f.push(...Array(tri[wind5]).fill(5));
    (v += tri[wind6]), f.push(...Array(tri[wind6]).fill(6));
    (v += tri[31]), f.push(...Array(tri[31]).fill(7));
    (v += tri[32]), f.push(...Array(tri[32]).fill(8));
    (v += tri[33]), f.push(...Array(tri[33]).fill(9));
    if (melds.length >= 5 && (mq || setting[4]) && isMask(marr, NoOrphanArray)) ++v, f.push(4);
    if (mq && tsumo) ++v, f.push(2);
    let [gd, gu] = [0, 0];
    let vaildora = nuki.slice();
    for (let i = 0; i < melds.length; ++i)
        if (melds[i].length === 3) for (let j = 0; j < 3; ++j) ++vaildora[melds[i][j]];
        else vaildora[melds[i][0]] += melds[i].length === 1 ? 3 : melds[i].length;
    for (let i = 0; i < sizeUT; ++i) (gd += vaildora[i] * doras[i]), (gu += vaildora[i] * uras[i]);
    for (let i = 42; i < 50; ++i) {
        if (doras[i] === 0 && uras[i] == 0) continue;
        const [l, r] = JokerRange[i];
        let cnt = 0;
        for (let j = l; j < r; ++j) if (vaildora[j] > cnt) cnt = vaildora[j];
        (gd += cnt * doras[i]), (gu += cnt * uras[i]);
    }
    v += gd + gu;
    if (setting[3] && v >= 13) return { val: 8000, yakuman, realyakuman, valfan: v, fan: f, dora: gd, ura: gu, valfus, realfus, fus, print: "counted_yakuman" };
    if (v >= 11) return { val: 6000, yakuman, realyakuman, valfan: v, fan: f, dora: gd, ura: gu, valfus, realfus, fus, print: "sanbaiman" };
    if (v >= 8) return { val: 4000, yakuman, realyakuman, valfan: v, fan: f, dora: gd, ura: gu, valfus, realfus, fus, print: "baiman" };
    if (v >= 6) return { val: 3000, yakuman, realyakuman, valfan: v, fan: f, dora: gd, ura: gu, valfus, realfus, fus, print: "haneman" };
    let pt = valfus * (1 << (2 + v));
    if (pt >= 2000) return { val: 2000, yakuman, valfan: v, fan: f, dora: gd, ura: gu, valfus, realfus, fus, print: "mangan" };
    if (setting[7] && pt >= 1920) return { val: 2000, yakuman: 0, valfan: v, fan: f, dora: gd, ura: gu, valfus, realfus, fus, print: "kiri_mangan" };
    return { val: pt, yakuman, valfan: v, fan: f, dora: gd, ura: gu, valfus, realfus, fus };
}
function PairSelect(cot, ad, au, mask) {
    let [d, u] = [0, 0];
    let backup = Array(7).fill([0, 0, 0]);
    for (let i = 0; i < 7; ++i) if (cot[i] < sizeUT) (d += ad[cot[i]]), (u += au[cot[i]]), (backup[i] = [cot[i], ad[cot[i]], au[cot[i]]]), (ad[cot[i]] = au[cot[i]] = 0);
    for (let i = 0; i < 7; ++i)
        if (cot[i] >= sizeUT) {
            let [sj, sdu] = [-1, 0];
            const [jl, jr] = JokerRange[cot[i]];
            for (let j = jl; j < jr; ++j) if (!mask || mask[j]) if (ad[j] + au[j] > sdu) (sj = j), (sdu = ad[j] + au[j]);
            if (sj > 0) (d += ad[sj]), (u += au[sj]), (backup[i] = [sj, ad[sj], au[sj]]), (ad[sj] = au[sj] = 0);
        }
    for (let i = 0; i < 7; ++i) {
        const [j, d, u] = backup[i];
        (ad[j] += d), (au[j] += u);
    }
    (d *= 2), (u *= 2);
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
const SameColorArray = [ColorArray.map((x) => (x === 0 ? 1 : 0)), ColorArray.map((x) => (x === 1 ? 1 : 0)), ColorArray.map((x) => (x === 2 ? 1 : 0))];
const SameColorWithHonorsArray = [ColorArray.map((x, i) => (x === 0 || HonorArray[i] ? 1 : 0)), ColorArray.map((x, i) => (x === 1 || HonorArray[i] ? 1 : 0)), ColorArray.map((x, i) => (x === 2 || HonorArray[i] ? 1 : 0))];
const SameColorNoOrphanArray = [ColorArray.map((x, i) => (x === 0 && !OrphanArray[i] ? 1 : 0)), ColorArray.map((x, i) => (x === 1 && !OrphanArray[i] ? 1 : 0)), ColorArray.map((x, i) => (x === 2 && !OrphanArray[i] ? 1 : 0))];
const SameColorAllOrphansArray = [SameColorWithHonorsArray[0].map((x, i) => x && OrphanArray[i]), SameColorWithHonorsArray[1].map((x, i) => x && OrphanArray[i]), SameColorWithHonorsArray[2].map((x, i) => x && OrphanArray[i])];
function selectMaxPairs(cot, doras, uras, nuki, tan19, sc, scwh, hun19, hunhun, mv, setting) {
    let [nd, nu] = [0, 0];
    for (let i = 0; i < sizeUT; ++i) (nd += nuki[i] * doras[i]), (nu += nuki[i] * uras[i]);
    let [v, f, d, u, yaku] = [0, [], 0, 0, false];
    const fv = setting[12] ? (v, d) => v + d : (v) => v;
    let limit = setting[0];
    if (setting[11])
        if (!setting[3]) limit = Infinity;
        else limit = Math.max(limit, 13);
    function update(av, ad, au, af) {
        (ad += nd), (au += nu);
        if (yaku && mv + fv(av, ad, au) >= limit && av + ad + au > v) (v = av + ad + au), (d = ad), (u = au), (f = af);
        else if (!yaku && mv + fv(av, ad, au) >= limit) (v = av + ad + au), (d = ad), (u = au), (f = af), (yaku = true);
        else if (!yaku && av + ad + au > v) (v = av + ad + au), (d = ad), (u = au), (f = af);
    }
    update(0, ...PairSelect(cot, doras, uras), []);
    if (tan19) update(1, ...PairSelect(cot, doras, uras, NoOrphanArray), [4]);
    if (sc !== null) {
        let [l, r] = sc !== -1 ? [sc, sc + 1] : [0, 3];
        if (sc !== -1) (l = sc), (r = l + 1);
        for (let i = l; i < r; ++i) {
            update(6, ...PairSelect(cot, doras, uras, SameColorArray[i]), [31]);
            if (tan19) update(7, ...PairSelect(cot, doras, uras, SameColorNoOrphanArray[i]), [4, 31]);
        }
    }
    if (scwh !== null) {
        let [l, r] = scwh !== -1 ? [scwh, scwh + 1] : [0, 3];
        for (let i = l; i < r; ++i) {
            update(3, ...PairSelect(cot, doras, uras, SameColorWithHonorsArray[i]), [28]);
            if (hunhun) update(5, ...PairSelect(cot, doras, uras, SameColorAllOrphansArray[i]), [25, 28]);
        }
    }
    if (hun19) update(2, ...PairSelect(cot, doras, uras, OrphanArray), [25]);
    return { v, f, d, u, yaku };
}
function JP7Pairs(tids, infoans, tsumo, doras, uras, nuki, setting) {
    const ot = PairOutput(getTiles(tids));
    let cot = ot.map((x) => x[0]);
    let tsuiso = true;
    for (let i = 0; tsuiso && i < 7; ++i)
        if (cot[i] < sizeUT && NoHonorArray[cot[i]]) tsuiso = false;
        else if (cot[i] >= 43 && cot[i] <= 46) tsuiso = false;
    let [valfus, realfus, fus] = [25, 25, [10]];
    if (setting[8] === 1) valfus = realfus = JPFuArray[10] = 50;
    else if (setting[8] === 2) valfus = realfus = JPFuArray[10] = 100;
    let [gv, gf, yakuman, realyakuman] = [0, [], infoans.yakuman, yakuman];
    function updateYakuman(x) {
        if (setting[2]) realyakuman = yakuman += x;
        else (yakuman = Math.max(yakuman, x)), (realyakuman += x);
    }
    if (tsuiso)
        if (setting[1] && setting[10]) updateYakuman(2), (gf = [40]);
        else updateYakuman(1), (gf = [39]);
    if (infoans.yakuman > 0) gf.push(...infoans.fan);
    if (yakuman > 0) return { val: yakuman * 8000, yakuman, realyakuman, valfan: gv, fan: gf, valfus, realfus, fus };
    let [mv, mf] = [infoans.valfan, infoans.fan.slice()];
    if (setting[8] === 0) (mv += 2), mf.push(17);
    else if (setting[8] === 1) ++mv, mf.push(17), (JPScoreArray[17] = 1);
    if (tsumo) ++mv, mf.push(2);
    mv -= infoans.delete;
    let tan19 = true;
    for (let i = 0; tan19 && i < 7; ++i)
        if (cot[i] < sizeUT && OrphanArray[cot[i]]) tan19 = false;
        else if (cot[i] >= 47) tan19 = false;
    const sc = PairSameColor(cot);
    const scwh = PairSameColorWithHonor(cot);
    const c19 = PairHun19Array(cot);
    const hun19 = c19 && c19[0] <= 2 && c19[1] <= 2 && c19[2] <= 2 && c19[0] + c19[1] + c19[2] + c19[3] <= 6;
    const hunhun = c19 && c19[0] + c19[1] + c19[2] + c19[3] <= 2;
    let [gd, gu] = [0, 0];
    let gyk = false;
    let selected = Array(7).fill(0);
    const doraf = [
        { id: 43, range: [0, 9], fid: (i) => i },
        { id: 44, range: [9, 18], fid: (i) => i },
        { id: 45, range: [18, 27], fid: (i) => i },
        { id: 46, range: [0, 3], fid: (i) => selected[i] },
        { id: 47, range: [27, 31], fid: (i) => i },
        { id: 48, range: [31, 34], fid: (i) => i },
        { id: 49, range: [0, 2], fid: (i) => selected[i - 4] },
        { id: 42, range: [0, 2], fid: (i) => [selected[3], selected[6]][i] },
    ];
    function dorakernel(depth = 0) {
        if (depth === 7) {
            let { v, f, d, u, yaku } = selectMaxPairs(cot, doras, uras, nuki, tan19, sc, scwh, hun19, hunhun, mv, setting);
            if (gyk && yaku && v > gv) [gv, gf, gd, gu] = [v, f, d, u];
            else if (!gyk && yaku) ([gv, gf, gd, gu] = [v, f, d, u]), (gyk = true);
            else if (!gyk && v > gv) [gv, gf, gd, gu] = [v, f, d, u];
        }
        const { id, range, fid } = doraf[depth];
        const [l, r] = range;
        for (let i = l; i < r; ++i) {
            selected[depth] = i;
            (doras[fid(i)] += doras[id]), (uras[fid(i)] += uras[id]);
            dorakernel(depth + 1);
            (doras[fid(i)] -= doras[id]), (uras[fid(i)] -= uras[id]);
        }
    }
    dorakernel();
    mv += infoans.delete;
    (gv += mv), gf.push(...mf);
    if (setting[3] && gv >= 13) return { val: 8000, yakuman: 0, realyakuman: 0, valfan: gv, fan: gf, dora: gd, ura: gu, valfus, realfus, fus, print: "counted_yakuman" };
    if (gv >= 11) return { val: 6000, yakuman: 0, realyakuman: 0, valfan: gv, fan: gf, dora: gd, ura: gu, valfus, realfus, fus, print: "sanbaiman" };
    if (gv >= 8) return { val: 4000, yakuman: 0, realyakuman: 0, valfan: gv, fan: gf, dora: gd, ura: gu, valfus, realfus, fus, print: "baiman" };
    if (gv >= 6) return { val: 3000, yakuman: 0, realyakuman: 0, valfan: gv, fan: gf, dora: gd, ura: gu, valfus, realfus, fus, print: "haneman" };
    let pt = valfus * (1 << (2 + gv));
    if (pt >= 2000) return { val: 2000, yakuman: 0, valfan: gv, fan: gf, dora: gd, ura: gu, valfus, realfus, fus, print: "mangan" };
    return { val: pt, yakuman: 0, valfan: gv, fan: gf, dora: gd, ura: gu, valfus, realfus, fus };
}
const PrintSeq = [1, 16, 3, 15, 12, 13, 14, 2, 10, 11, 29, 52, 17, 7, 8, 9, 6, 5, 4, 24, 21, 48, 19, 20, 50, 23, 18, 22, 26, 25, 27, 28, 31, 32, 33, 30, 53, 38, 51, 34, 39, 44, 45, 36, 42, 43, 46, 47, 35, 40, 49, 37, 41, 96, 98, 99, 97];
const JPScoreArray = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1.5, 2, 1.5, 2, 2, 1.5, 2, 2, 2.5, 2.5, 3, 5, 5.5, -1, -1, -1, -2, -1, -2, -1, -1, -2, -2, -1, -1, -1, -1, -1, -2, 1.5, -2, 2, -1, 3, -1];
const JPFuArray = [2, 4, 4, 8, 8, 16, 16, 32, 20, 30, 25, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
