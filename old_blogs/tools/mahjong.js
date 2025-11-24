const sizeUT = 34;
const sizeAT = 51;
// A list from special strings to id
// prettier-ignore
const NAME_TO_ID = Object.freeze({
    "一": 0, "二": 1, "三": 2, "四": 3, "五": 4, "六": 5, "七": 6, "八": 7, "九": 8,
    "①": 9, "②": 10, "③": 11, "④": 12, "⑤": 13, "⑥": 14, "⑦": 15, "⑧": 16, "⑨": 17,
    "１": 18, "２": 19, "３": 20, "４": 21, "５": 22, "６": 23, "７": 24, "８": 25, "９": 26,
    "東": 27, "南": 28, "西": 29, "北": 30, "白": 31, "發": 32, "中": 33,
    "春": 34, "夏": 35, "秋": 36, "冬": 37, "梅": 38, "蘭": 39, "菊": 40, "竹": 41,
    "东": 27, "发": 32, "発": 32, "兰": 39,
    "E": 27, "S": 28, "W": 29, "N": 30, "P": 31, "F": 32, "C": 33,
    "Wh": 31, "G": 32, "R": 33, "J": 42, "X": 50, "H": 50,
    "🀇": 0, "🀈": 1, "🀉": 2, "🀊": 3, "🀋": 4, "🀌": 5, "🀍": 6, "🀎": 7, "🀏": 8,
    "🀙": 9, "🀚": 10, "🀛": 11, "🀜": 12, "🀝": 13, "🀞": 14, "🀟": 15, "🀠": 16, "🀡": 17,
    "🀐": 18, "🀑": 19, "🀒": 20, "🀓": 21, "🀔": 22, "🀕": 23, "🀖": 24, "🀗": 25, "🀘": 26,
    "🀀": 27, "🀁": 28, "🀂": 29, "🀃": 30, "🀆": 31, "🀅": 32, "🀄": 33,
    "🀦": 34, "🀧": 35, "🀨": 36, "🀩": 37, "🀢": 38, "🀣": 39, "🀥": 40, "🀤": 41,
    "🀪": 42, "🀫": 50
});
function pmod(a, b) {
    const ans = a % b;
    return ans * b < 0 ? ans + b : ans;
}
function id(name) {
    const dictid = NAME_TO_ID[name];
    if (dictid >= 0 && dictid < sizeAT) return { id: dictid };
    if (name.length < 2) return {};
    if (name[0] === "i")
        switch (name[1]) {
            case "j":
                return { id: 42 };
            case "w":
            case "m":
                return { id: 43 };
            case "b":
            case "p":
                return { id: 44 };
            case "s":
                return { id: 45 };
            case "z":
                return { id: 49 };
            case "h":
            case "f":
                return { id: 50 };
        }
    if (name[0] < "0" || name[0] > "9") return {};
    let x = name.charCodeAt(0) - "1".charCodeAt(0);
    switch (name[1]) {
        case "w":
        case "m":
            if (x === -1) return { id: 4, sp: 1 };
            break;
        case "b":
        case "p":
            if (x === -1) return { id: 13, sp: 1 };
            x += 9;
            break;
        case "s":
            if (x === -1) return { id: 22, sp: 1 };
            x += 18;
            break;
        case "z":
            if (x === -1) return { id: 31, sp: 1 };
            x += 27;
            if (x >= sizeUT) x = 50;
            break;
        case "h":
        case "f":
            x += 34;
            if (x >= 42) x = 50;
            break;
        case "j":
            if (x === -1) return { id: 42, sp: 1 };
            x += 42;
            break;
        default:
            return {};
    }
    if (x < 0 || x >= sizeAT) return {};
    return { id: x };
}
function cardName(ip) {
    const id = typeof ip === "number" ? ip : ip.id;
    if (typeof ip === "object" && "sp" in ip)
        switch (id) {
            case 4:
                return "0m";
            case 13:
                return "0p";
            case 22:
                return "0s";
            case 31:
                return "0z";
            case 42:
                return "0j";
        }
    let ans = "";
    if (id >= 0 && id < 9) ans = `${id + 1}m`;
    else if (id >= 9 && id < 18) ans = `${id - 8}p`;
    else if (id >= 18 && id < 27) ans = `${id - 17}s`;
    else if (id >= 27 && id < 34) ans = `${id - 26}z`;
    else if (id >= 34 && id < 42) ans = `${id - 33}h`;
    else if (id >= 42 && id < 51) ans = `${id - 41}j`;
    return ans;
}
function getTiles(ids) {
    let tiles = Array(sizeAT).fill(0);
    for (let i = 0; i < ids.length; ++i) ++tiles[ids[i].id];
    return tiles;
}
function splitKernel(s) {
    s = Array.from(s);
    let ids = [];
    for (let i = 0; i < s.length; ++i) {
        if (s[i] >= "a" && s[i] <= "z") {
            let tids = [];
            for (let j = i - 1; j >= 0; --j)
                if ((s[j] >= "0" && s[j] <= "9") || s[j] === "i") tids.push(id(s[j] + s[i]));
                else break;
            for (let j = tids.length - 1; j >= 0; --j) ids.push(tids[j]);
            continue;
        }
        if (s[i] === "W" && i + 1 < s.length && s[i + 1] === "h") ids.push(id("Wh")), (i = i + 1);
        else ids.push(id(s[i]));
    }
    let valid_ids = [];
    for (let i = 0; i < ids.length; ++i) if ("id" in ids[i]) valid_ids.push(ids[i]);
    return valid_ids;
}
function splitTiles(s) {
    const regex = /(\(([^)]+)\)|\[([^\]]+)\]|<([^>]+)>)/g;
    const [subtiles, bonus, dora, ura] = [[], [], [], []];
    for (const match of s.matchAll(regex)) {
        const [, , round, square, angle] = match;
        if (round) {
            bonus.push(round);
            continue;
        } else if (square) {
            const parts = square.split(",");
            const ans = splitKernel(parts[0]);
            ans.type = Number(parts[1]) || 0;
            subtiles.push(ans);
        } else {
            const parts = angle.split(",");
            dora.push(parts[0]);
            if (parts.length > 1) ura.push(parts[1]);
        }
    }
    s = s.replace(regex, " ");
    return [splitKernel(s), subtiles, splitKernel(bonus.join(" ")), splitKernel(dora.join(" ")), splitKernel(ura.join(" "))];
}
function getUnifiedType(s) {
    let t = s.type;
    if (s.length >= 4) return pmod(t, 8);
    return Math.min(Math.max(t, 1), 3);
}
// Check left, left+1, left+2 can be a sequence or not
const SeqArray = [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
function SeqCheck(left) {
    return left >= 0 && left < sizeUT ? SeqArray[left] : false;
}
// Check for step
let step = [];
let ldStep;
let lastStep = {};
let INF = Infinity;
const EMPTY = -2;
let vst = [];
const JokerA = [43, 43, 43, 43, 43, 43, 43, 43, 43, 44, 44, 44, 44, 44, 44, 44, 44, 44, 45, 45, 45, 45, 45, 45, 45, 45, 45, 47, 47, 47, 47, 48, 48, 48, 50, 50, 50, 50, 50, 50, 50, 50, 42, 43, 44, 45, 46, 47, 48, 49, 50];
const JokerB = [46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 49, 49, 49, 49, 49, 49, 49, 50, 50, 50, 50, 50, 50, 50, 50, 42, 46, 46, 46, 46, 49, 49, 49, 50];
const JokerC = 42;
const CJokerA = [43, 44, 45, 47, 48];
const CJokerB = [46, 46, 46, 49, 49];
const ColorArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4];
const ColorFirstArray = [0, 9, 18, 27, 31, 34];
const NumberArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 1, 2, 3, 4, 5, 6];
const HelperArray = [...NumberArray.slice(0, 27).map((x) => x + 1), "E", "S", "W", "N", "Wh", "G", "R", 1, 2, 3, 4, 1, 2, 3, 4, "J", "Ch", "Cir", "B", "Su", "Wi", "D", "H", "Fl"];
const JokerColor = { 43: 0, 44: 1, 45: 2, 47: 3, 48: 4 };
const JokerRange = { 42: [0, sizeUT], 43: [0, 9], 44: [9, 18], 45: [18, 27], 46: [0, 27], 47: [27, 31], 48: [31, 34], 49: [27, 34] };
function prepareStep(nm, np, tiles) {
    ldStep = Array(sizeUT * 7);
    let sizeStep = 0;
    for (let i = 0; i < sizeUT; ++i) {
        const ldi = i * 7;
        ldStep[ldi] = sizeStep;
        ldStep[ldi + 1] = tiles[JokerC] + 1;
        ldStep[ldi + 2] = ldStep[ldi + 1] * (tiles[JokerB[i]] + 1);
        ldStep[ldi + 3] = ldStep[ldi + 2] * (tiles[JokerA[i]] + 1);
        let [mui, muj] = [0, 0];
        if (SeqCheck(i - 1)) mui = muj = 2;
        if (SeqCheck(i - 2)) mui += 2;
        ldStep[ldi + 4] = ldStep[ldi + 3] * (muj + 1);
        ldStep[ldi + 5] = ldStep[ldi + 4] * (mui + 1);
        ldStep[ldi + 6] = ldStep[ldi + 5] * (np + 1);
        sizeStep += ldStep[ldi + 6] * (nm + 1);
    }
    if (sizeStep > step.length) step = new Int32Array(sizeStep).fill(EMPTY);
    else for (let i = 0; i < vst.length; ++i) step[vst[i]] = EMPTY;
    vst = [];
}
function getStep(em, ep, i, ui, uj, aj, bj, cj) {
    return step[indexStep(em, ep, i, ui, uj, aj, bj, cj)];
}
function setStep(em, ep, i, ui, uj, aj, bj, cj, v) {
    return (step[indexStep(em, ep, i, ui, uj, aj, bj, cj)] = v);
}
function indexStep(em, ep, i, ui, uj, aj, bj, cj) {
    const ldi = i * 7;
    return ldStep[ldi] + em * ldStep[ldi + 6] + ep * ldStep[ldi + 5] + ui * ldStep[ldi + 4] + uj * ldStep[ldi + 3] + aj * ldStep[ldi + 2] + bj * ldStep[ldi + 1] + cj;
}
const guseall = Array(sizeAT).fill(0);
const guse3p = guseall.map((_, i) => (i > 0 && i < 8 ? Infinity : 0));
function kernelStep(tiles, em, ep, nm, np, sup, glmt, guse, i = 0, ui = 0, uj = 0, aj = 0, bj = 0, cj = 0) {
    if (i >= sizeUT) return (nm - em) * 3 + (np - ep) * 2 - 1;
    const dpi = indexStep(em, ep, i, ui, uj, aj, bj, cj);
    if (step[dpi] !== EMPTY) return step[dpi];
    vst.push(dpi);
    if (guse[i] === Infinity) return (step[dpi] = kernelStep(tiles, em, ep, nm, np, sup, glmt, guse, i + 1, uj, 0, aj, bj, cj));
    let lmti = glmt - guse[i];
    let [ra, rb, rc] = [tiles[JokerA[i]] - aj, tiles[JokerB[i]] - bj, tiles[JokerC] - cj];
    const cs = SeqCheck(i) && guse[i + 1] !== Infinity && guse[i + 2] !== Infinity;
    const csi = glmt === Infinity && cs && SeqCheck(i + 1) && guse[i + 3] !== Infinity; // When glmt is not Infinity, joker slide is not equal
    let nxti;
    for (nxti = i + 1; nxti < sizeUT; ++nxti) if (guse[nxti] !== Infinity) break;
    let ei = tiles[i];
    if (JokerA[i] !== JokerA[nxti]) (ei += ra), (lmti += ra), (ra = aj = 0);
    if (JokerB[i] !== JokerB[nxti]) (ei += rb), (lmti += rb), (rb = bj = 0);
    if (nxti >= sizeUT) (ei += rc), (lmti += rc), (rc = cj = 0);
    const [ri, rj] = [Math.max(ei - ui, 0), Math.max(tiles[i + 1] - uj, 0)];
    const lmtj = lmti + ra + rb + rc;
    if (ui > lmtj) return (step[dpi] = INF);
    let ans = INF;
    const mp = Math.min(np - ep, ri); // we consider np - ep <= 1
    const ms = cs ? Math.min(nm - em, 2) : 0;
    for (let p = 0; p <= mp; ++p)
        for (let s = 0; s <= ms; ++s) {
            const lri = lmtj - ui - p * 2 - s;
            if (lri < 0 || (s && p * 2 + s > ri && (csi || (s > rj && s > tiles[i + 2])))) break;
            let kri = Math.max(ri - p * 2 - s, 0);
            let mmk = Math.floor(kri / 3);
            let pmk = Math.ceil(kri / 3);
            const rgk = Math.min(nm - em - s, Math.floor(lri / 3));
            mmk = Math.min(mmk, rgk);
            pmk = Math.min(pmk, rgk);
            for (let k = mmk; k <= pmk; ++k) {
                const ti = p * 2 + s + k * 3 + ui;
                let d = Math.max(ti - ei, 0);
                if (glmt === Infinity) {
                    const uaj = Math.min(ra, d);
                    d -= uaj;
                    const ubj = Math.min(rb, d);
                    d -= ubj;
                    const ucj = Math.min(rc, d);
                    d -= ucj;
                    if (d - 1 >= Math.min(ans, sup)) break;
                    ans = Math.min(ans, kernelStep(tiles, em + s + k, ep + p, nm, np, sup, glmt, guse, i + 1, s + uj, s, aj + uaj, bj + ubj, cj + ucj) + d);
                } else {
                    // because of limitation, the usage of jokers is not equal
                    const el = Math.max(ti - lmti, 0);
                    const er = Math.min(ra + rb + rc, d);
                    for (let e = er; e >= el; --e) {
                        const uaj = Math.min(ra, e);
                        const ubj = Math.min(rb, e - uaj);
                        const ucj = Math.min(rc, e - uaj - ubj);
                        if (d - e - 1 >= Math.min(ans, sup)) break;
                        ans = Math.min(ans, kernelStep(tiles, em + s + k, ep + p, nm, np, sup, glmt, guse, i + 1, s + uj, s, aj + uaj, bj + ubj, cj + ucj) + d - e);
                    }
                }
            }
        }
    return (step[dpi] = ans);
}
function useStepMemory(nm, np, tiles, glmt, sup, guse) {
    if (nm !== lastStep.nm) return false;
    if (np !== lastStep.np) return false;
    if (glmt !== lastStep.glmt) return false;
    if (glmt !== Infinity)
        if (tiles[JokerC] !== lastStep.tiles[JokerC]) return false;
        else if (sup > lastStep.sup) return false;
    if (glmt === Infinity && sup + tiles[JokerC] > lastStep.sup + lastStep.tiles[JokerC]) return false;
    let last_same = 0;
    for (let i = 0; i < sizeUT; ++i) {
        if (tiles[JokerA[i]] !== lastStep.tiles[JokerA[i]]) return false;
        if (tiles[JokerB[i]] !== lastStep.tiles[JokerB[i]]) return false;
        if (tiles[i] !== lastStep.tiles[i]) last_same = i + 1;
        if (guse[i] !== lastStep.guse[i]) last_same = i + 1;
    }
    if (last_same === sizeUT) return false;
    const end = indexStep(0, 0, last_same, 0, 0, 0, 0, 0);
    let nvst = [];
    for (let i = 0; i < vst.length; ++i)
        if (vst[i] < end) step[vst[i]] = EMPTY;
        else nvst.push(vst[i]);
    vst = nvst;
    return true;
}
function searchDp(tiles, em, ep, tcnt, sup = Infinity, glmt = Infinity, guse = guseall) {
    tiles = tiles.slice();
    let nm = (tcnt / 3) | 0;
    let np = +(nm * 3 !== tcnt);
    INF = nm * 3 + np * 2 - 1;
    for (let i = 0; i < sizeUT; ++i) {
        tiles[i] = Math.min(tiles[i], glmt);
        const km = Math.min(Math.floor(Math.max(tiles[i] - 8, 0) / 3), nm - em);
        (nm -= km), (tiles[i] -= km * 3);
    }
    if (glmt !== Infinity) {
        if (!useStepMemory(nm, np, tiles, glmt, sup, guse)) prepareStep(nm, np, tiles);
        lastStep = { nm, np, glmt, tiles, sup, guse };
        return kernelStep(tiles, em, ep, nm, np, sup, glmt, guse);
    }
    let ans = -tiles[JokerC];
    tiles[JokerC] = 0;
    if (!useStepMemory(nm, np, tiles, glmt, sup, guse)) prepareStep(nm, np, tiles);
    lastStep = { nm, np, glmt, tiles, sup, guse };
    return kernelStep(tiles, em, ep, nm, np, sup - ans, glmt, guse) + ans;
}
// Check for winning
function check(tiles, target) {
    let meld = 0;
    tiles = tiles.slice();
    for (let i = 0; i < sizeUT; ++i) {
        if (tiles[i] >= 3) (meld += Math.floor(tiles[i] / 3)), (tiles[i] %= 3);
        if (SeqCheck(i) && tiles[i] && tiles[i + 1] && tiles[i + 2]) {
            const cnt = Math.min(tiles[i], tiles[i + 1], tiles[i + 2]);
            meld += cnt;
            tiles[i] -= cnt;
            tiles[i + 1] -= cnt;
            tiles[i + 2] -= cnt;
        }
        if (tiles[i]) break;
    }
    return meld === target;
}
function Win(tiles, tcnt, glmt = Infinity) {
    const meld = Math.floor(tcnt / 3);
    const head = tcnt % 3;
    for (let i = 0; i < sizeUT; ++i) if (tiles[i] > glmt) return false;
    if (head === 0) return check(tiles, meld);
    for (let i = 0; i < sizeUT; ++i)
        if (tiles[i] >= 2) {
            tiles[i] -= 2;
            const ans = check(tiles, meld);
            tiles[i] += 2;
            if (ans) return true;
        }
    return false;
}
// Listen function
function Listen(tiles, tcnt, full_tcnt = tcnt, glmt = Infinity) {
    if (tcnt + 1 === full_tcnt)
        for (let j = 0; j < sizeUT; ++j) {
            if (tiles[j] >= glmt) continue;
            ++tiles[j];
            const ans = Win(tiles, tcnt + 1, glmt);
            --tiles[j];
            if (ans) return true;
        }
    else if (tcnt === full_tcnt)
        for (let i = 0; i < sizeAT; ++i) {
            if (!tiles[i]) continue;
            --tiles[i];
            for (let j = 0; j < sizeUT; ++j) {
                if (i === j) continue;
                if (tiles[j] >= glmt) continue;
                ++tiles[j];
                const ans = Win(tiles, tcnt, glmt);
                --tiles[j];
                if (ans) {
                    ++tiles[i];
                    return true;
                }
            }
            ++tiles[i];
        }
    return false;
}
// Step function
function Step(tiles, tcnt = 14, full_tcnt = tcnt % 3 === 1 ? tcnt + 1 : tcnt, glmt = Infinity) {
    if (tcnt > full_tcnt) return searchDp(tiles, 0, 0, full_tcnt, Infinity, glmt);
    for (let i = 42; i < 50; ++i) if (tiles[i]) return searchDp(tiles, 0, 0, full_tcnt, Infinity, glmt);
    if (tcnt === full_tcnt && Win(tiles, full_tcnt, glmt)) return -1;
    if (Listen(tiles, tcnt, full_tcnt, glmt)) return 0;
    return searchDp(tiles, 0, 0, full_tcnt, Infinity, glmt);
}
// Check whether the step of new tiles decreased or not.
function StepCheck(tiles, maxstep, tcnt = 14, full_tcnt = tcnt % 3 === 1 ? tcnt + 1 : tcnt, glmt = Infinity) {
    if (tcnt > full_tcnt) return searchDp(tiles, 0, 0, full_tcnt, maxstep, glmt) < maxstep;
    for (let i = 42; i < 50; ++i) if (tiles[i]) return searchDp(tiles, 0, 0, full_tcnt, maxstep, glmt) < maxstep;
    if (maxstep === -1) return false;
    if (tcnt === full_tcnt && Win(tiles, full_tcnt, glmt)) return true;
    if (maxstep === 0) return false;
    if (Listen(tiles, tcnt, full_tcnt, glmt)) return true;
    if (maxstep === 1) return false;
    return searchDp(tiles, 0, 0, full_tcnt, maxstep, glmt) < maxstep;
}
// Step of 7 pairs, only avaliable when tcnt is 13 or 14
function PairStep(tiles, disjoint = false, guse = guseall) {
    if (!disjoint) {
        let [ans, sig] = [0, 0];
        let ra, rb;
        let i, nxti;
        for (i = 0; i < sizeUT; ++i)
            if (guse[i] !== Infinity) {
                [ra, rb] = [tiles[JokerA[i]], tiles[JokerB[i]]];
                break;
            }
        for (; i < sizeUT; i = nxti) {
            for (nxti = i + 1; nxti < sizeUT; ++nxti) if (guse[nxti] !== Infinity) break;
            let ei = tiles[i];
            if (JokerA[i] !== JokerA[nxti]) (ei += ra), (ra = 0);
            if (JokerB[i] !== JokerB[nxti]) (ei += rb), (rb = 0);
            ans += Math.floor(ei / 2);
            if (ei % 2)
                if (ra) --ra, ++ans;
                else if (rb) --rb, ++ans;
                else ++sig;
            if (JokerA[i] !== JokerA[nxti]) ra = tiles[JokerA[nxti]];
            if (JokerB[i] !== JokerB[nxti]) rb = tiles[JokerB[nxti]];
        }
        if (ans > 7) (sig += (ans - 7) * 2), (ans = 7);
        return 13 - ans * 2 - Math.min(sig, 7 - ans) - tiles[JokerC];
    } else {
        let t = tiles.slice();
        for (let i = 0; i < sizeUT; ++i) {
            if (guse[i] === Infinity) continue;
            if (t[i] !== 1) continue;
            if (t[JokerA[i]]) --t[JokerA[i]], ++t[i];
            else if (t[JokerB[i]]) --t[JokerB[i]], ++t[i];
            else if (t[JokerC]) --t[JokerC], ++t[i];
        }
        for (let i = 0; i < sizeUT; ++i) {
            if (guse[i] === Infinity) continue;
            if (t[i] !== 0) continue;
            const cnt = Math.min(t[JokerA[i]], 2);
            (t[i] = cnt), (t[JokerA[i]] -= cnt);
            if (t[i] !== 1) continue;
            if (t[JokerB[i]]) --t[JokerB[i]], ++t[i];
            else if (t[JokerC]) --t[JokerC], ++t[i];
        }
        for (let i = 0; i < sizeUT; ++i) {
            if (guse[i] === Infinity) continue;
            if (t[i] !== 0) continue;
            const cnt = Math.min(t[JokerB[i]], 2);
            (t[i] = cnt), (t[JokerB[i]] -= cnt);
            if (t[i] !== 1) continue;
            if (t[JokerC]) --t[JokerC], ++t[i];
        }
        for (let i = 0; i < sizeUT; ++i) {
            if (guse[i] === Infinity) continue;
            if (t[i] !== 0) continue;
            const cnt = Math.min(t[JokerC], 2);
            (t[i] = cnt), (t[JokerC] -= cnt);
        }
        let [ans, sig] = [0, 0];
        for (let i = 0; i < sizeUT; ++i)
            if (guse[i] === Infinity) continue;
            else if (t[i] >= 2) ++ans;
            else if (t[i] === 1) ++sig;
        if (ans > 7) (sig += ans - 7), (ans = 7);
        return 13 - ans * 2 - Math.min(sig, 7 - ans);
    }
}
// Special Check for 13 orphans, only avaliable when tcnt is 13 or 14
const Orphan13Array = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33];
function OrphanCount(tiles, jokerc = true) {
    tiles = tiles.slice();
    let ans = 13;
    for (let i = 0; i < Orphan13Array.length; ++i) {
        const id = Orphan13Array[i];
        if (tiles[id]) --tiles[id];
        else if (tiles[JokerA[id]]) --tiles[JokerA[id]];
        else if (tiles[JokerB[id]]) --tiles[JokerB[id]];
        else if (jokerc && tiles[JokerC]) --tiles[JokerC];
        else --ans;
    }
    return { tiles, count: ans };
}
function OrphanStep(tiles) {
    let main = OrphanCount(tiles, false);
    tiles = main.tiles;
    let ans = 13 - main.count;
    for (let i = 0; i < Orphan13Array.length; ++i) {
        const id = Orphan13Array[i];
        if (tiles[id]) return ans - 1 - tiles[JokerC];
        else if (tiles[JokerA[id]]) return ans - 1 - tiles[JokerC];
        else if (tiles[JokerB[id]]) return ans - 1 - tiles[JokerC];
    }
    return ans - tiles[JokerC];
}
// Creation of Knitted Dragon
let KnitDragonSave = Array.from({ length: 6 }, () => Array(9).fill(0));
// prettier-ignore
const Permutation3 = [ [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0] ];
function KnitDragonCreate() {
    for (let i = 0; i < 6; ++i)
        for (let j = 0; j < 9; ++j) {
            const [di, dj] = [Math.floor(j / 3), j % 3];
            const id = di * 9 + Permutation3[i][di] + dj * 3;
            KnitDragonSave[i][j] = id;
        }
}
KnitDragonCreate();
// Special Check for Bukao
function Bukao16Count(tiles) {
    let ans = 0;
    for (let i = 0; i < 6; ++i) {
        let count = 0;
        let tcp = tiles.slice();
        for (let j = 0; j < 9; ++j) {
            const id = KnitDragonSave[i][j];
            ++count;
            if (tiles[id]) continue;
            else if (tcp[JokerA[id]]) --tcp[JokerA[id]];
            else if (tcp[JokerB[id]]) --tcp[JokerB[id]];
            else --count;
        }
        for (let i = 27; i < 34; ++i) {
            ++count;
            if (tiles[i]) continue;
            else if (tcp[JokerA[i]]) --tcp[JokerA[i]];
            else if (tcp[JokerB[i]]) --tcp[JokerB[i]];
            else --count;
        }
        ans = Math.max(ans, count);
    }
    return ans + tiles[JokerC];
}
// Special Check for Knitted Dragon
function KnitDragonStep(tiles, tcnt) {
    let ans = Infinity;
    for (let i = 0; i < 6; ++i) {
        let miss = 0;
        let tcp = tiles.slice();
        for (let j = 0; j < 9; ++j) {
            const id = KnitDragonSave[i][j];
            if (tcp[id]) --tcp[id];
            else if (tcp[JokerA[id]]) --tcp[JokerA[id]];
            else if (tcp[JokerB[id]]) --tcp[JokerB[id]];
            else ++miss;
        }
        if (miss - 1 - tiles[JokerC] >= ans) continue;
        ans = Math.min(ans, searchDp(tcp, 3, 0, tcnt, ans - miss) + miss);
    }
    return ans;
}
function KnitDragonStepCheck(tiles, maxstep, tcnt) {
    let ans = Infinity;
    for (let i = 0; i < 6; ++i) {
        let miss = 0;
        let tcp = tiles.slice();
        for (let j = 0; j < 9; ++j) {
            const id = KnitDragonSave[i][j];
            if (tcp[id]) --tcp[id];
            else if (tcp[JokerA[id]]) --tcp[JokerA[id]];
            else if (tcp[JokerB[id]]) --tcp[JokerB[id]];
            else ++miss;
        }
        if (miss - 1 - tiles[JokerC] >= ans) continue;
        if (miss - 1 - tiles[JokerC] >= maxstep) continue;
        ans = Math.min(ans, searchDp(tcp, 3, 0, tcnt, maxstep - miss) + miss);
        if (ans < maxstep) return true;
    }
    return false;
}
// Special Check for 13 orphans in taiwan, only avaliable when tcnt is 16 or 17
function OrphanMeldStep(tiles) {
    let main = OrphanCount(tiles, false);
    let tcp = main.tiles;
    let miss = 13 - main.count;
    let ans = Infinity;
    for (let i = 0; i < Orphan13Array.length; ++i) {
        const id = Orphan13Array[i];
        let rid = id;
        if (tcp[id]);
        else if (tcp[JokerA[id]]) rid = JokerA[id];
        else if (tcp[JokerB[id]]) rid = JokerB[id];
        else continue;
        --tcp[rid];
        ans = Math.min(ans, searchDp(tcp, 4, 1, 17) + miss);
        ++tcp[rid];
    }
    ans = Math.min(ans, searchDp(tcp, 4, 1, 17) + miss + 1);
    return ans;
}
// Special Check for niconico in taiwan, only avaliable when tcnt is 16 or 17
function NiconicoStep(tiles) {
    let ans = Infinity;
    for (let i = 0; i < sizeUT; ++i) {
        let t = tiles.slice();
        let miss = 3;
        const cnt0 = Math.min(t[i], miss);
        (t[i] -= cnt0), (miss -= cnt0);
        const cnt1 = Math.min(t[JokerA[i]], miss);
        (t[JokerA[i]] -= cnt1), (miss -= cnt1);
        const cnt2 = Math.min(t[JokerB[i]], miss);
        (t[JokerB[i]] -= cnt2), (miss -= cnt2);
        ans = Math.min(ans, PairStep(t, false) + miss);
    }
    return ans;
}
// Special Check for 16 Buda in taiwan, only avaliable when tcnt is 16 or 17
function Buda16Step(tiles) {
    let miss = Array(5).fill(Infinity);
    let pmiss = Array(5).fill(Infinity);
    for (let i = 0; i < 3; ++i)
        for (let a = 0; a < 3; ++a)
            for (let b = a + 3; b < 6; ++b)
                for (let c = b + 3; c < 9; ++c) {
                    let tmiss = (tiles[i * 9 + a] ? 0 : 1) + (tiles[i * 9 + b] ? 0 : 1) + (tiles[i * 9 + c] ? 0 : 1);
                    miss[i] = Math.min(miss[i], tmiss);
                    if (tiles[i * 9 + a] < 2 && tiles[i * 9 + b] < 2 && tiles[i * 9 + c] < 2) ++tmiss;
                    pmiss[i] = Math.min(pmiss[i], tmiss);
                }
    miss[3] = miss[4] = 0;
    for (let i = 27; i <= 30; ++i) if (!tiles[i]) ++miss[3];
    for (let i = 31; i <= 33; ++i) if (!tiles[i]) ++miss[4];
    pmiss[3] = miss[3] + 1;
    for (let i = 27; i <= 30; ++i)
        if (tiles[i] >= 2) {
            --pmiss[3];
            break;
        }
    pmiss[4] = miss[4] + 1;
    for (let i = 31; i <= 33; ++i)
        if (tiles[i] >= 2) {
            --pmiss[4];
            break;
        }
    for (let i = 0; i < 5; ++i) {
        miss[i] = Math.max(miss[i] - tiles[CJokerA[i]], 0);
        pmiss[i] = Math.max(pmiss[i] - tiles[CJokerA[i]], 0);
    }
    let step = Infinity;
    for (let pi = 0; pi < 5; ++pi) {
        let [ra, rb] = [tiles[46], tiles[49]];
        let ans = -tiles[JokerC];
        for (let i = 0; i < 3; ++i) {
            const m = i === pi ? pmiss[i] : miss[i];
            const ua = Math.min(ra, m);
            (ans += m - ua), (ra -= ua);
        }
        for (let i = 3; i < 5; ++i) {
            const m = i === pi ? pmiss[i] : miss[i];
            const ub = Math.min(rb, m);
            (ans += m - ub), (rb -= ub);
        }
        step = Math.min(ans - 1, step);
    }
    return step;
}
function CountWaitingCards(tiles, subtiles, ans) {
    let cnt = 0;
    for (let i = 0; i < ans.length; ++i) cnt += Math.max(4 - tiles[ans[i]] - subtiles[ans[i]], 0);
    return cnt;
}
function checkGoodWaiting(tiles, stepf, i) {
    for (let ia = 0; ia < sizeAT; ++ia) {
        if (!tiles[ia]) continue;
        --tiles[ia];
        if (stepf(tiles, 1, 1)) {
            let listencnt = 0;
            for (let ib = 0; ib < sizeUT; ++ib) {
                if (ia === ib) continue;
                if (tiles[ib] >= 4) continue;
                ++tiles[ib];
                if (stepf(tiles, 0, 0)) listencnt += 5 - tiles[ib];
                --tiles[ib];
                if (listencnt >= 6) {
                    ++tiles[ia];
                    return true;
                }
            }
        }
        ++tiles[ia];
    }
    return false;
}
function initDischecks(tiles, f) {
    for (let i = 0; i < sizeAT; ++i) {
        if (!tiles[i]) continue;
        --tiles[i];
        f(i);
        ++tiles[i];
    }
}
function initGetchecks(tiles, f) {
    for (let i = 0; i < sizeUT; ++i) {
        ++tiles[i];
        f(i);
        --tiles[i];
    }
}
function NormalPrecheck(tiles, step, tcnt) {
    const dischecks = Array(sizeAT);
    const getchecks = Array(sizeUT);
    const nstep = step;
    initDischecks(tiles, (i) => (dischecks[i] = StepCheck(tiles, nstep + 1, tcnt - 1, tcnt)));
    initGetchecks(tiles, (i) => (getchecks[i] = StepCheck(tiles, nstep, tcnt + 1, tcnt)));
    return { dischecks, getchecks };
}
function JPPrecheck(tiles, step, substep, tcnt) {
    const dischecks = Array(sizeAT)
        .fill(null)
        .map(() => Array(3).fill(false));
    const getchecks = Array(sizeAT)
        .fill(null)
        .map(() => Array(3).fill(false));
    const nstep = step;
    if (nstep >= substep[0]) {
        initDischecks(tiles, (i) => (dischecks[i][0] = StepCheck(tiles, nstep + 1, tcnt - 1, tcnt, 4)));
        initGetchecks(tiles, (i) => (getchecks[i][0] = StepCheck(tiles, nstep, tcnt + 1, tcnt, 4)));
    }
    if (tcnt === 14 && nstep >= substep[1]) {
        initDischecks(tiles, (i) => (dischecks[i][1] = PairStep(tiles, true) <= nstep));
        initGetchecks(tiles, (i) => (getchecks[i][1] = PairStep(tiles, true) < nstep));
    }
    if (tcnt === 14 && nstep >= substep[2]) {
        initDischecks(tiles, (i) => (dischecks[i][2] = OrphanStep(tiles) <= nstep));
        initGetchecks(tiles, (i) => (getchecks[i][2] = OrphanStep(tiles) < nstep));
    }
    return { dischecks, getchecks };
}
function JP3pPrecheck(tiles, step, substep, tcnt) {
    const dischecks = Array(sizeAT)
        .fill(null)
        .map(() => Array(3).fill(false));
    const getchecks = Array(sizeAT)
        .fill(null)
        .map(() => Array(3).fill(false));
    const nstep = step;
    if (nstep >= substep[0]) {
        initDischecks(tiles, (i) => (dischecks[i][0] = searchDp(tiles, 0, 0, tcnt, nstep + 1, 4, guse3p) <= nstep));
        initGetchecks(tiles, (i) => (getchecks[i][0] = searchDp(tiles, 0, 0, tcnt, nstep, 4, guse3p) < nstep));
    }
    if (tcnt === 14 && nstep >= substep[1]) {
        initDischecks(tiles, (i) => (dischecks[i][1] = PairStep(tiles, true, guse3p) <= nstep));
        initGetchecks(tiles, (i) => (getchecks[i][1] = PairStep(tiles, true, guse3p) < nstep));
    }
    if (tcnt === 14 && nstep >= substep[2]) {
        initDischecks(tiles, (i) => (dischecks[i][2] = OrphanStep(tiles) <= nstep));
        initGetchecks(tiles, (i) => (getchecks[i][2] = OrphanStep(tiles) < nstep));
    }
    return { dischecks, getchecks };
}
function GBPrecheck(tiles, step, substep, tcnt, savecheck) {
    const dischecks = Array(sizeAT)
        .fill(null)
        .map(() => Array(5).fill(false));
    const getchecks = Array(sizeAT)
        .fill(null)
        .map(() => Array(5).fill(false));
    const nstep = step;
    if (nstep >= substep[0]) {
        for (let i = 0; i < sizeAT; ++i) dischecks[i][0] = savecheck.dischecks[i];
        for (let i = 0; i < sizeUT; ++i) getchecks[i][0] = savecheck.getchecks[i];
    }
    if (tcnt === 14 && nstep >= substep[1]) {
        initDischecks(tiles, (i) => (dischecks[i][1] = PairStep(tiles, false) <= nstep));
        initGetchecks(tiles, (i) => (getchecks[i][1] = PairStep(tiles, false) < nstep));
    }
    if (tcnt === 14 && nstep >= substep[2]) {
        initDischecks(tiles, (i) => (dischecks[i][2] = OrphanStep(tiles) <= nstep));
        initGetchecks(tiles, (i) => (getchecks[i][2] = OrphanStep(tiles) < nstep));
    }
    if (tcnt === 14 && nstep >= substep[3]) {
        initDischecks(tiles, (i) => (dischecks[i][3] = tcnt - 1 - Bukao16Count(tiles) <= nstep));
        initGetchecks(tiles, (i) => (getchecks[i][3] = tcnt - 1 - Bukao16Count(tiles) < nstep));
    }
    if (tcnt >= 9 && nstep >= substep[4]) {
        initDischecks(tiles, (i) => (dischecks[i][4] = KnitDragonStepCheck(tiles, nstep + 1, tcnt)));
        initGetchecks(tiles, (i) => (getchecks[i][4] = KnitDragonStepCheck(tiles, nstep, tcnt)));
    }
    return { dischecks, getchecks };
}
function TWPrecheck(tiles, step, substep, tcnt, savecheck) {
    const dischecks = Array(sizeAT)
        .fill(null)
        .map(() => Array(4).fill(false));
    const getchecks = Array(sizeAT)
        .fill(null)
        .map(() => Array(4).fill(false));
    const nstep = step;
    if (nstep >= substep[0]) {
        for (let i = 0; i < sizeAT; ++i) dischecks[i][0] = savecheck.dischecks[i];
        for (let i = 0; i < sizeUT; ++i) getchecks[i][0] = savecheck.getchecks[i];
    }
    if (tcnt === 17 && nstep >= substep[1]) {
        initDischecks(tiles, (i) => (dischecks[i][1] = NiconicoStep(tiles) <= nstep));
        initGetchecks(tiles, (i) => (getchecks[i][1] = NiconicoStep(tiles) < nstep));
    }
    if (tcnt === 17 && nstep >= substep[2]) {
        initDischecks(tiles, (i) => (dischecks[i][2] = OrphanMeldStep(tiles) <= nstep));
        initGetchecks(tiles, (i) => (getchecks[i][2] = OrphanMeldStep(tiles) < nstep));
    }
    if (tcnt === 17 && nstep >= substep[3]) {
        initDischecks(tiles, (i) => (dischecks[i][3] = Buda16Step(tiles) <= nstep));
        initGetchecks(tiles, (i) => (getchecks[i][3] = Buda16Step(tiles) < nstep));
    }
    return { dischecks, getchecks };
}
function makeAns(step, tiles, f, ff) {
    let ans = [],
        gans = [];
    for (let i = 0; i < sizeUT; ++i) {
        ++tiles[i];
        const iw = ff(i);
        if (iw)
            if (step === 1 && tiles[i] <= 4)
                if (checkGoodWaiting(tiles, f, i)) gans.push(i);
                else ans.push(i);
            else ans.push(i);
        --tiles[i];
    }
    return { ans, gans: step === 1 ? gans : undefined };
}
function NormalWaiting(tiles, step, tcnt, discheck, getchecks) {
    if (discheck === false) return { ans: [], checked: false };
    const nstep = step;
    const waiting = (t, i, d, g) => g !== false && StepCheck(t, i, tcnt - d, tcnt);
    const { ans, gans } = makeAns(step, tiles, waiting, (i) => waiting(tiles, nstep, 0, getchecks?.[i]));
    return { ans, gans, checked: discheck };
}
function JPWaiting(tiles, step, substep, tcnt, discheck, getchecks) {
    discheck ??= [step === substep[0], tcnt === 14 && step === substep[1], tcnt === 14 && step === substep[2]];
    const nstep = step;
    function waiting(tiles, step, d, g) {
        if (discheck[1] && (!g || g[1]) && PairStep(tiles, true) < step) return true;
        else if (discheck[2] && (!g || g[2]) && OrphanStep(tiles) < step) return true;
        else if (discheck[0] && (!g || g[0]) && StepCheck(tiles, step, tcnt - d, tcnt, 4)) return true;
    }
    const { ans, gans } = makeAns(step, tiles, waiting, (i) => waiting(tiles, nstep, 0, getchecks?.[i]));
    return { ans, gans, checked: discheck.some(Boolean) };
}
function JP3pWaiting(tiles, step, substep, tcnt, discheck, getchecks) {
    discheck ??= [step === substep[0], tcnt === 14 && step === substep[1], tcnt === 14 && step === substep[2]];
    const nstep = step;
    function waiting(tiles, step, _, g) {
        if (discheck[1] && (!g || g[1]) && PairStep(tiles, true, guse3p) < step) return true;
        else if (discheck[2] && (!g || g[2]) && OrphanStep(tiles) < step) return true;
        else if (discheck[0] && (!g || g[0]) && searchDp(tiles, 0, 0, tcnt, step, 4, guse3p) < step) return true;
    }
    const { ans, gans } = makeAns(step, tiles, waiting, (i) => waiting(tiles, nstep, 0, getchecks?.[i]));
    return { ans, gans, checked: discheck.some(Boolean) };
}
function GBWaiting(tiles, step, substep, tcnt, saveans, discheck, getchecks) {
    discheck ??= [step === substep[0], tcnt === 14 && step === substep[1], tcnt === 14 && step === substep[2], tcnt === 14 && step === substep[3], tcnt >= 9 && step === substep[4]];
    const nstep = step;
    function waiting(tiles, step, d, g, s) {
        if (discheck[1] && (!g || g[1]) && PairStep(tiles, false) < step) return true;
        else if (discheck[2] && (!g || g[2]) && OrphanStep(tiles) < step) return true;
        else if (discheck[3] && (!g || g[3]) && tcnt - 1 - Bukao16Count(tiles) < step) return true;
        else if (discheck[0] && (!g || g[0]) && (s ?? StepCheck(tiles, step, tcnt - d, tcnt))) return true;
        else if (discheck[4] && (!g || g[4]) && KnitDragonStepCheck(tiles, step, tcnt)) return true;
    }
    let saveWaiting = undefined;
    if (nstep >= substep[0] && saveans) {
        saveWaiting = Array(sizeUT).fill(false);
        for (const x of saveans.ans) saveWaiting[x] = true;
        if (saveans.gans) for (const x of saveans.gans) saveWaiting[x] = true;
    }
    const { ans, gans } = makeAns(step, tiles, waiting, (i) => waiting(tiles, nstep, 0, getchecks?.[i], saveWaiting?.[i]));
    return { ans, gans, checked: discheck.some(Boolean) };
}
function TWWaiting(tiles, step, substep, tcnt, saveans, discheck, getchecks) {
    discheck ??= [step === substep[0], tcnt === 17 && step === substep[1], tcnt === 17 && step === substep[2], tcnt === 17 && step === substep[3]];
    const nstep = step;
    function waiting(tiles, step, d, g, s) {
        if (discheck[1] && (!g || g[1]) && NiconicoStep(tiles) < step) return true;
        else if (discheck[3] && (!g || g[3]) && Buda16Step(tiles) < step) return true;
        else if (discheck[0] && (!g || g[0]) && (s ?? StepCheck(tiles, step, tcnt - d, tcnt))) return true;
        else if (discheck[2] && (!g || g[2]) && OrphanMeldStep(tiles) < step) return true;
    }
    let saveWaiting = undefined;
    if (nstep >= substep[0] && saveans) {
        saveWaiting = Array(sizeUT).fill(false);
        for (const x of saveans.ans) saveWaiting[x] = true;
        if (saveans.gans) for (const x of saveans.gans) saveWaiting[x] = true;
    }
    const { ans, gans } = makeAns(step, tiles, waiting, (i) => waiting(tiles, nstep, 0, getchecks?.[i], saveWaiting?.[i]));
    return { ans, gans, checked: discheck.some(Boolean) };
}
function prepareDvd(nm, np, tiles) {
    ldDvd = Array(sizeUT * 7);
    let sizeDvd = 0;
    for (let i = 0; i < sizeUT; ++i) {
        const ldi = i * 7;
        ldDvd[ldi] = sizeDvd;
        ldDvd[ldi + 1] = tiles[JokerC] + 1;
        ldDvd[ldi + 2] = ldDvd[ldi + 1] * (tiles[JokerB[i]] + 1);
        ldDvd[ldi + 3] = ldDvd[ldi + 2] * (tiles[JokerA[i]] + 1);
        let mui = 0,
            muj = 0;
        if (SeqCheck(i - 1)) (mui = tiles[i]), (muj = tiles[i + 1]);
        if (SeqCheck(i - 2)) mui = tiles[i];
        ldDvd[ldi + 4] = ldDvd[ldi + 3] * (muj + 1);
        ldDvd[ldi + 5] = ldDvd[ldi + 4] * (mui + 1);
        ldDvd[ldi + 6] = ldDvd[ldi + 5] * (np + 1);
        sizeDvd += ldDvd[ldi + 6] * (nm + 1);
    }
    worker_dvds_0 = Array(sizeDvd).fill(null);
    return { dvd: worker_dvds_0, ldDvd };
}
function getDvd(dvd, ldDvd, em, ep, i, ui, uj, aj, bj, cj) {
    return dvd[indexDvd(ldDvd, em, ep, i, ui, uj, aj, bj, cj)];
}
function setDvd(dvd, ldDvd, em, ep, i, ui, uj, aj, bj, cj, v) {
    return (dvd[indexDvd(ldDvd, em, ep, i, ui, uj, aj, bj, cj)] = v);
}
function indexDvd(ldDvd, em, ep, i, ui, uj, aj, bj, cj) {
    const ldi = i * 7;
    return ldDvd[ldi] + em * ldDvd[ldi + 6] + ep * ldDvd[ldi + 5] + ui * ldDvd[ldi + 4] + uj * ldDvd[ldi + 3] + aj * ldDvd[ldi + 2] + bj * ldDvd[ldi + 1] + cj;
}
function fullSeqCheck(i, a, b, c, p) {
    if (p === 1) return SeqCheck(i) ? Math.max(Math.min(a, c), 0) : 0;
    return SeqCheck(i) || SeqCheck(i - 1) ? Math.max(Math.min(a, b), 0) : 0;
}
function kernelDvd(tiles, nm, np, dvd, ldDvd, em = 0, ep = 0, i = 0, ui = 0, uj = 0, aj = 0, bj = 0, cj = 0) {
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
    if (nxti >= sizeUT) (ei += rc), (rc = cj = 0);
    const [ri, rj] = [Math.max(ei - ui, 0), Math.max(tiles[i + 1] - uj, 0)];
    const rsum = ra + rb + rc;
    const mp = Math.min(np - ep, Math.ceil(ri / 2));
    for (let p = 0; p <= mp; ++p) {
        const ss = [ri - 2 * p, rj, tiles[i + 2]];
        const ms = fullSeqCheck(i, ...ss, 1);
        for (let s = 0; s <= ms; ++s) {
            const msf = fullSeqCheck(i, ...ss.map((i) => i - s), 2);
            for (let sf = 0; sf <= msf; ++sf) {
                // tri must has real card
                // all remain cards show be used
                let k = Math.ceil(Math.max(ri - p * 2 - s - sf, 0) / 3);
                let rk = ei - (ui + s + sf + (k - 1) * 3);
                if (p && rk <= 1 + p * 2) continue; // head with no real card
                rk = Math.min(rk, 3);
                function step() {
                    let step;
                    if (rk === 3) (step = 3), --k, (rk = 3);
                    else if (rk === 2) (step = 2), --k, (rk = 3);
                    else (step = 4), (k -= 2), (rk = 3);
                    return step;
                }
                for (let sff = 0; k >= 0; sff += step()) {
                    let [ti, tj, tk] = [ui + s + sf + sff + k * 3 + p * 2, uj + s + sf, s];
                    let e = sf + sff * 2 + Math.max(ti - ei, 0) + Math.max(tj - tiles[i + 1], 0) + Math.max(tk - tiles[i + 2], 0);
                    tj = Math.min(tj, tiles[i + 1]);
                    tk = Math.min(tk, tiles[i + 2]);
                    if (e > rsum) break;
                    const uaj = Math.min(ra, e);
                    const ubj = Math.min(rb, e - uaj);
                    const ucj = Math.min(rc, e - uaj - ubj);
                    const ans = kernelDvd(tiles, nm, np, dvd, ldDvd, em + s + sf + sff + k, ep + p, i + 1, tj, tk, aj + uaj, bj + ubj, cj + ucj);
                    if (ans) {
                        dvd[dpi].cnt += ans;
                        dvd[dpi].nxt.push({ p, s, sf, sff, k, dpi: indexDvd(ldDvd, em + s + sf + sff + k, ep + p, i + 1, tj, tk, aj + uaj, bj + ubj, cj + ucj) });
                    }
                    if (i >= 27) break;
                }
            }
        }
    }
    return dvd[dpi].cnt;
}
function windvd(tiles, full_tcnt) {
    const nm = Math.floor(full_tcnt / 3);
    const np = full_tcnt % 3 ? 1 : 0;
    const { dvd, ldDvd } = prepareDvd(nm, np, tiles);
    const cnt = kernelDvd(tiles, nm, np, dvd, ldDvd);
    return { cnt, dvd, ldDvd };
}
function replaceJoker(tiles, ot) {
    tiles = tiles.slice();
    for (let i = 0; i < ot.length; ++i)
        for (let j = 0; j < ot[i].length; ++j) {
            const id = ot[i][j];
            let rid = getRealId(tiles, id);
            if (rid === -1) rid = id;
            else --tiles[rid];
            ot[i][j] = rid;
        }
}
function WinOutput(tiles, full_tcnt, dvd, opt_size) {
    const nm = Math.floor(full_tcnt / 3);
    const np = full_tcnt % 3 ? 1 : 0;
    let [melds, head] = [[], []];
    let ots = [];
    function dfs(i, dpi) {
        if (melds.length === nm && head.length === np) {
            ots.push([...melds, ...head]);
            return;
        }
        const ans = dvd[dpi];
        for (let j = 0; j < ans.nxt.length; ++j) {
            if (ots.length >= opt_size) return;
            const n = ans.nxt[j];
            for (let p = 0; p < n.p; ++p) head.push([i, i]);
            for (let s = 0; s < n.s; ++s) melds.push([i, i + 1, i + 2]);
            for (let s = 0; s < n.sf; ++s) melds.push([i, i + 1, JokerA[i]]);
            for (let s = 0; s < n.sff; ++s) melds.push([i, JokerA[i], JokerA[i]]);
            for (let k = 0; k < n.k; ++k) melds.push([i, i, i]);
            dfs(i + 1, n.dpi);
            for (let p = 0; p < n.p; ++p) head.pop();
            for (let m = 0; m < n.s + n.k + n.sf + n.sff; ++m) melds.pop();
        }
    }
    dfs(0, 0);
    for (let i = 0; i < ots.length; ++i) replaceJoker(tiles, ots[i]);
    return ots;
}
function PairOutput(tiles) {
    let ot = [];
    let [ra, rb, rc] = [tiles[JokerA[0]], tiles[JokerB[0]], tiles[JokerC]];
    for (let i = 0; i < sizeUT; ++i) {
        const nxti = i + 1;
        let ei = tiles[i];
        if (JokerA[i] !== JokerA[nxti]) (ei += ra), (ra = 0);
        if (JokerB[i] !== JokerB[nxti]) (ei += rb), (rb = 0);
        if (nxti >= sizeUT) (ei += rc), (rc = 0);
        const pcnt = Math.ceil(ei / 2);
        for (let j = 0; j < pcnt; ++j) ot.push([i, i]);
        if (pcnt * 2 > ei)
            if (ra) --ra;
            else if (rb) --rb;
            else --rc;
        if (JokerA[i] !== JokerA[nxti]) ra = tiles[JokerA[nxti]];
        if (JokerB[i] !== JokerB[nxti]) rb = tiles[JokerB[nxti]];
    }
    replaceJoker(tiles, ot);
    return ot;
}
const Orphan13GroupArray = [0, 0, 1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4];
function OrphanOutput(tiles) {
    let ot = [[], [], [], [], [], []];
    tiles = tiles.slice();
    for (let i = 0; i < Orphan13Array.length; ++i) {
        const id = Orphan13Array[i];
        let rid = getRealId(tiles, id);
        --tiles[rid];
        ot[Orphan13GroupArray[i]].push(rid);
    }
    for (let i = 0; i < Orphan13Array.length; ++i) {
        const id = Orphan13Array[i];
        let rid = getRealId(tiles, id);
        if (rid === -1) continue;
        ot[5].push(rid);
        return ot;
    }
}
function Bukao16Output(tiles) {
    let save = new Set();
    let ots = [];
    for (let i = 0; i < 6; ++i) {
        let tcp = tiles.slice();
        let rot = [[], [], [], [], []];
        let count = 0;
        for (let j = 0; j < 9; ++j) {
            const id = KnitDragonSave[i][j];
            let rid = getRealId(tcp, id);
            if (rid === -1) continue;
            ++count;
            --tcp[rid];
            rot[Math.floor(j / 3)].push(rid);
        }
        const s = JSON.stringify(rot);
        if (save.has(s)) continue;
        save.add(s);
        for (let i = 27; i < 34; ++i) {
            let rid = getRealId(tcp, i);
            if (rid === -1) continue;
            ++count;
            --tcp[rid];
            rot[i <= 30 ? 3 : 4].push(rid);
        }
        if (count === 14) ots.push(rot);
    }
    return ots;
}
function KnitDragonOutput(tiles, full_tcnt, opt_size, dvds) {
    let ots = Array(6)
        .fill(null)
        .map(() => []);
    let save = new Set();
    let cnt = 0;
    const reuse = dvds !== undefined;
    dvds ??= Array(6).fill(null);
    for (let i = 0; i < 6; ++i) {
        let dvd, tcp;
        let head = [[], [], []];
        if (reuse) {
            if (dvds[i] === null) continue;
            ({ head, dvd, tcp } = dvds[i]);
        } else {
            tcp = tiles.slice();
            let win = true;
            for (let j = 0; j < 9; ++j) {
                const id = KnitDragonSave[i][j];
                let rid = getRealId(tcp, id);
                if (rid === -1) {
                    win = false;
                    break;
                }
                --tcp[rid];
                head[Math.floor(j / 3)].push(rid);
            }
            if (!win) continue;
            const s = JSON.stringify(head);
            if (save.has(s)) continue;
            else save.add(s);
            dvd = windvd(tcp, full_tcnt - 9);
            dvds[i] = { head, dvd, tcp };
        }
        cnt += dvd.cnt;
        let tails = WinOutput(tcp, full_tcnt - 9, dvd.dvd, opt_size);
        for (let j = 0; j < tails.length; ++j) ots[i].push([...head, ...tails[j]]);
    }
    // select opt_size outputs
    let select = Array(6).fill(0);
    let maxlen = Math.max(...ots.map((a) => a.length));
    let selectsum = 0;
    for (let i = 1; i <= maxlen; ++i) {
        if (i > 1 && selectsum >= opt_size) break;
        for (let j = 0; j < 6; ++j) {
            if (i > 1 && selectsum >= opt_size) break;
            if (ots[j].length >= i) ++select[j], ++selectsum;
        }
    }
    let ans = [];
    for (let i = 0; i < 6; ++i) for (let j = 0; j < select[i]; ++j) ans.push(ots[i][j]);
    return { cnt, ots: ans, save: dvds };
}
function NiconicoOutput(tiles) {
    let ots = [];
    let save = new Set();
    for (let i = 0; i < sizeUT; ++i) {
        let t = tiles.slice();
        let head = [];
        for (let j = 0; j < 3; ++j) {
            let rid = getRealId(t, i);
            if (rid === -1) break;
            --t[rid];
            head.push(rid);
        }
        if (head.length < 3) continue;
        if (PairStep(t, false) !== -1) continue;
        const s = JSON.stringify(head);
        if (save.has(s)) continue;
        save.add(s);
        ots.push([head, ...PairOutput(t)]);
    }
    return ots;
}
function OrphanMeldOutput(tiles) {
    let head = [[], [], [], [], []];
    let ots = [];
    tiles = tiles.slice();
    for (let i = 0; i < Orphan13Array.length; ++i) {
        const id = Orphan13Array[i];
        let rid = getRealId(tiles, id);
        --tiles[rid];
        head[Orphan13GroupArray[i]].push(rid);
    }
    let save = new Set();
    for (let i = 0; i < Orphan13Array.length; ++i) {
        const id = Orphan13Array[i];
        let rid = getRealId(tiles, id);
        if (rid === -1) continue;
        if (save.has(rid)) continue;
        save.add(rid);
        --tiles[rid];
        let rt = [];
        for (let j = 0; j < sizeAT; ++j) for (let r = 0; r < tiles[j]; ++r) rt.push(j);
        if (isMeld(rt)) ots.push([...head, [rid], rt]);
        ++tiles[rid];
    }
    return ots;
}
function Buda16Output(tiles) {
    let ot = [[-1, -1, -1], [-1, -1, -1], [-1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1], [-1]];
    tiles = tiles.slice();
    for (let i = 0; i < 27; ++i) if (tiles[i]) (ot[Math.floor(i / 9)][Math.floor((i % 9) / 3)] = i), --tiles[i];
    for (let i = 27; i <= 30; ++i) if (tiles[i]) (ot[3][i - 27] = i), --tiles[i];
    for (let i = 31; i <= 33; ++i) if (tiles[i]) (ot[4][i - 31] = i), --tiles[i];
    for (let i = 0; i < 5; ++i)
        for (let j = 0; j < ot[i].length; ++j)
            if (tiles[CJokerA[i]] === 0) break;
            else if (ot[i][j] === -1) (ot[i][j] = CJokerA[i]), --tiles[CJokerA[i]];
    for (let i = 0; i < 5; ++i)
        for (let j = 0; j < ot[i].length; ++j)
            if (ot[i][j] === -1) {
                let rid = tiles[CJokerB[i]] ? CJokerB[i] : JokerC;
                (ot[i][j] = rid), --tiles[rid];
            }
    for (let j = 0; j < sizeAT; ++j) if (tiles[j]) ot[5][0] = j;
    return ot;
}
function getRealId(tiles, i) {
    if (tiles[i]) return i;
    if (tiles[JokerA[i]]) return JokerA[i];
    if (tiles[JokerB[i]]) return JokerB[i];
    if (tiles[JokerC]) return JokerC;
    return -1;
}
function isJokerEqual(i, j) {
    if (j === i) return true;
    if (j < i) return isJokerEqual(j, i);
    if (i < sizeUT) {
        if (j === JokerA[i]) return true;
        if (j === JokerB[i]) return true;
        if (j === JokerC) return true;
        return false;
    }
    if (i === JokerC) return true;
    if (i >= 43 && i <= 45) return j === 46;
    if (i >= 47 && i <= 48) return j === 49;
    return false;
}
function isSeq(tids) {
    if (tids.length !== 3) return false;
    const [a, b, c] = tids;
    if (a >= sizeUT) return false;
    if (SeqCheck(a) && b === a + 1 && c === b + 1) return true;
    if ((SeqCheck(a) || SeqCheck(a - 1)) && b === a + 1 && isJokerEqual(a, c)) return true; // i, i+1, joker
    if (SeqCheck(a) && b === a + 2 && isJokerEqual(a, c)) return true; // i, joker, i+2
    return false;
}
function isTri(tids) {
    if (tids.length !== 3) return false;
    const [a, b, c] = tids;
    return isJokerEqual(a, b) && isJokerEqual(a, c) && isJokerEqual(b, c);
}
function isQuad(tids) {
    if (tids.length !== 4) return false;
    for (let i = 0; i < 4; ++i) for (let j = i + 1; j < 4; ++j) if (!isJokerEqual(tids[i], tids[j])) return false;
    return true;
}
function isMeld(tids) {
    return isSeq(tids) || isTri(tids);
}
function canBeReal(i, tids) {
    for (let j = 0; j < tids.length; ++j) if (!isJokerEqual(i, tids[j])) return false;
    return true;
}
function isFlower(id) {
    return (id >= 34 && id < 42) || id == 50;
}
