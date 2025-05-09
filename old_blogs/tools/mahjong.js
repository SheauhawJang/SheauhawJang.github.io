const sizeUT = 34;
const sizeAT = 51;
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

function id(name) {
    const dictid = NAME_TO_ID[name];
    if (dictid >= 0 && dictid < sizeAT) return dictid;
    if (name[0] === "i")
        switch (name[1]) {
            case "w":
            case "m":
                return 43;
            case "b":
            case "p":
                return 44;
            case "s":
                return 45;
            case "z":
                return 49;
            case "h":
            case "f":
                return 50;
        }
    if (name[0] < "0" || name[0] > "9") return -1;
    let x = name.charCodeAt(0) - "1".charCodeAt(0);
    if (name.length < 2) return -1;
    switch (name[1]) {
        case "w":
        case "m":
            break;
        case "b":
        case "p":
            x += 9;
            break;
        case "s":
            x += 18;
            break;
        case "z":
            x += 27;
            if (x >= sizeUT) x = 50;
            break;
        case "h":
        case "f":
            x += 34;
            if (x >= 42) x = 50;
            break;
        case "j":
            x += 42;
            break;
        default:
            return -1;
    }
    if (x < 0 || x >= sizeAT) return -1;
    return x;
}
function cardName(id) {
    let ans = "";
    const JP_name = true;
    if (id >= 0 && id < 9) ans = JP_name ? `${id + 1}m` : `${id + 1}w`;
    else if (id >= 9 && id < 18) ans = JP_name ? `${id - 8}p` : `${id - 8}b`;
    else if (id >= 18 && id < 27) ans = `${id - 17}s`;
    else if (id >= 27 && id < 34) ans = `${id - 26}z`;
    else if (id >= 34 && id < 42) ans = `${id - 33}h`;
    else if (id >= 42 && id < 51) ans = `${id - 41}j`;
    return ans;
}
function cardNameGB(id) {
    let ans = "";
    const JP_name = false;
    if (id >= 0 && id < 9) ans = JP_name ? `${id + 1}m` : `${id + 1}w`;
    else if (id >= 9 && id < 18) ans = JP_name ? `${id - 8}p` : `${id - 8}b`;
    else if (id >= 18 && id < 27) ans = `${id - 17}s`;
    else if (id >= 27 && id < 34) ans = `${id - 26}z`;
    else if (id >= 34 && id < 42) ans = `${id - 33}h`;
    else if (id >= 42 && id < 51) ans = `${id - 41}j`;
    return ans;
}
function split(s) {
    s = Array.from(s);
    let tiles = Array(sizeAT).fill(0);
    let ids = [];
    for (let i = 0; i < s.length; ++i)
        if (s[i] === "W" && i + 1 < s.length && s[i + 1] === "h") {
            ids.push(id("Wh"));
            i = i + 1;
        } else if (s[i] >= "a" && s[i] <= "z") {
            let tids = [];
            for (let j = i - 1; j >= 0; --j)
                if ((s[j] >= "0" && s[j] <= "9") || s[j] === "i") tids.push(id(s[j] + s[i]));
                else break;
            for (let j = tids.length - 1; j >= 0; --j) ids.push(tids[j]);
        }
        else ids.push(id(s[i]));
    let valid_ids = [];
    for (let i = 0; i < ids.length; ++i) 
        if (ids[i] >= 0 && ids[i] < sizeAT) {
            ++tiles[ids[i]];
            valid_ids.push(ids[i]);
        }
    return { tiles, ids: valid_ids };
}
// Check left, left+1, left+2 can be a sequence or not
const SeqArray = [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
function SeqCheck(left) {
    return left >= 0 && left < sizeUT ? SeqArray[left] : false;
}
// Check for step
let dp;
let ld;
function prepareDp(nm, np, aj, bj, cj) {
    ld = new Array(7);
    ld[0] = cj + 1;
    ld[1] = ld[0] * (bj + 1);
    ld[2] = ld[1] * (aj + 1);
    ld[3] = ld[2] * 3;
    ld[4] = ld[3] * 5;
    ld[5] = ld[4] * sizeUT;
    ld[6] = ld[5] * (np + 1);
    dp = new Array((nm + 1) * ld[6]).fill(Infinity);
}
function getDp(em, ep, i, ui, uj, aj, bj, cj) {
    return dp[indexDp(em, ep, i, ui, uj, aj, bj, cj)];
}
function setDp(em, ep, i, ui, uj, aj, bj, cj, v) {
    dp[indexDp(em, ep, i, ui, uj, aj, bj, cj)] = v;
}
function indexDp(em, ep, i, ui, uj, aj, bj, cj) {
    return em * ld[6] + ep * ld[5] + i * ld[4] + ui * ld[3] + uj * ld[2] + aj * ld[1] + bj * ld[0] + cj;
}
const JokerA = [43, 43, 43, 43, 43, 43, 43, 43, 43, 44, 44, 44, 44, 44, 44, 44, 44, 44, 45, 45, 45, 45, 45, 45, 45, 45, 45, 47, 47, 47, 47, 48, 48, 48, -1];
const JokerB = [46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 49, 49, 49, 49, 49, 49, 49, -1];
function kernelDp(tiles, em, ep, nm, np, maxans = Infinity, limit = Infinity, i = 0, ui = 0, uj = 0, aj = 0, bj = 0, cj = 0) {
    if (i >= sizeUT) return (nm - em) * 3 + (np - ep) * 2 - 1;
    const dpi = indexDp(em, ep, i, ui, uj, aj, bj, cj);
    if (dp[dpi] !== Infinity) return dp[dpi];
    let ans = (nm - em) * 3 + (np - ep) * 2 - 1;
    let ri = Math.max(tiles[i] - ui, 0);
    let rj = SeqCheck(i) ? Math.max(tiles[i + 1] - uj, 0) : 0;
    let ra = tiles[JokerA[i]] - aj;
    let rb = tiles[JokerB[i]] - bj;
    let rc = tiles[42] - cj;
    let li = limit - ui + ra + rb + rc;
    if (JokerA[i] !== JokerA[i + 1]) {
        ri += ra;
        ra = aj = 0;
    }
    if (JokerB[i] !== JokerB[i + 1]) {
        ri += rb;
        rb = bj = 0;
    }
    if (i + 1 >= sizeUT) {
        ri += rc;
        rc = cj = 0;
    }
    const mp = Math.min(np - ep, ri);
    const ms = SeqCheck(i) ? Math.min(nm - em, 2) : 0;
    for (let p = 0; p <= mp; ++p)
        for (let s = 0; s <= ms; ++s) {
            const lri = li - p * 2 - s;
            if (lri < 0) break;
            const ds = s ? Math.max(s - rj, 0) + Math.max(s - tiles[i + 2], 0) : 0;
            if (s && ri <= p * 2 && ds === s * 2) break;
            let kri = Math.max(ri - p * 2 - s, 0);
            let mmk = Math.floor(kri / 3);
            let pmk = Math.ceil(kri / 3);
            const rgk = Math.min(nm - em - s, Math.floor(lri / 3));
            mmk = Math.min(mmk, rgk);
            pmk = Math.min(pmk, rgk);
            for (let k = mmk; k <= pmk; ++k) {
                const ti = p * 2 + s + k * 3;
                let d = Math.max(ti - ri, 0) + ds;
                if (limit === Infinity) {
                    const uaj = Math.min(ra, d);
                    d -= uaj;
                    const ubj = Math.min(rb, d);
                    d -= ubj;
                    const ucj = Math.min(rc, d);
                    d -= ucj;
                    if (d - 1 >= ans) break;
                    if (d - 1 >= maxans) break;
                    ans = Math.min(ans, kernelDp(tiles, em + s + k, ep + p, nm, np, maxans, limit, i + 1, s + uj, s, aj + uaj, bj + ubj, cj + ucj) + d);
                } else {
                    const el = Math.max(ti - li + ra + rb + rc, 0);
                    const er = Math.min(ra + rb + rc, d);
                    for (let e = er; e >= el; --e) {
                        const uaj = Math.min(ra, e);
                        const ubj = Math.min(rb, e - uaj);
                        const ucj = Math.min(rc, e - uaj - ubj);
                        if (d - e - 1 >= ans) break;
                        if (d - e - 1 >= maxans) break;
                        ans = Math.min(ans, kernelDp(tiles, em + s + k, ep + p, nm, np, maxans, limit, i + 1, s + uj, s, aj + uaj, bj + ubj, cj + ucj) + d - e);
                    }
                }
            }
        }

    dp[dpi] = ans;
    return ans;
}
function searchDp(tiles, em, ep, tcnt, maxans = Infinity, limit = Infinity) {
    tiles = tiles.slice();
    let nm = Math.floor(tcnt / 3);
    let np = tcnt % 3 > 0 ? 1 : 0;
    let aj = 0,
        bj = 0;
    for (let i = 0; i < sizeUT; ++i) {
        tiles[i] = Math.min(tiles[i], limit);
        const km = Math.floor(Math.max(tiles[i] - 8, 0) / 3);
        nm -= km;
        tiles[i] -= km * 3;
        aj = Math.max(aj, tiles[JokerA[i]]);
        bj = Math.max(bj, tiles[JokerB[i]]);
    }
    if (limit !== Infinity) {
        prepareDp(nm, np, aj, bj, tiles[42]);
        return kernelDp(tiles, em, ep, nm, np, maxans, limit);
    }
    let ans = -tiles[42];
    tiles[42] = 0;
    prepareDp(nm, np, aj, bj, 0);
    return kernelDp(tiles, em, ep, nm, np, maxans - ans, limit) + ans;
}
// Check for winning
function check(tiles, target) {
    let meld = 0;
    tiles = tiles.slice();
    for (let i = 0; i < sizeUT; ++i) {
        if (tiles[i] >= 3) {
            meld += Math.floor(tiles[i] / 3);
            tiles[i] %= 3;
        }
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
function Win(tiles, tcnt, limit = Infinity) {
    const meld = Math.floor(tcnt / 3);
    const head = tcnt % 3;
    for (let i = 0; i < sizeUT; ++i) if (tiles[i] > limit) return false;
    if (head === 0) return check(tiles, meld);
    if (head === 1) return false;
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
function Listen(tiles, tcnt, full_tcnt = tcnt, limit = Infinity) {
    if (tcnt + 1 === full_tcnt)
        for (let j = 0; j < sizeUT; ++j) {
            if (tiles[j] >= limit) continue;
            ++tiles[j];
            const ans = Win(tiles, tcnt + 1, limit);
            --tiles[j];
            if (ans) return true;
        }
    else
        for (let i = 0; i < sizeAT; ++i) {
            if (!tiles[i]) continue;
            --tiles[i];
            for (let j = 0; j < sizeUT; ++j) {
                if (i === j) continue;
                if (tiles[j] >= limit) continue;
                ++tiles[j];
                const ans = Win(tiles, tcnt, limit);
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
function Step(tiles, tcnt = 14, full_tcnt = (tcnt % 3 === 1 ? tcnt + 1 : tcnt), limit = Infinity) {
    for (let i = 42; i < 50; ++i) if (tiles[i]) return searchDp(tiles, 0, 0, tcnt, Infinity, limit);
    if (Win(tiles, tcnt, limit)) return -1;
    if (Listen(tiles, tcnt, full_tcnt, limit)) return 0;
    return searchDp(tiles, 0, 0, tcnt, Infinity, limit);
}
// Check whether the step of new tiles decreased or not.
function StepCheck(tiles, maxstep, tcnt = 14, full_tcnt = (tcnt % 3 === 1 ? tcnt + 1 : tcnt), limit = Infinity) {
    for (let i = 42; i < 50; ++i) if (tiles[i]) return searchDp(tiles, 0, 0, tcnt, maxstep, limit) < maxstep;
    if (maxstep === -1) return false;
    if (Win(tiles, tcnt, limit)) return true;
    if (maxstep === 0) return false;
    if (Listen(tiles, tcnt, full_tcnt, limit)) return true;
    if (maxstep === 1) return false;
    return searchDp(tiles, 0, 0, tcnt, maxstep, limit) < maxstep;
}
// Step of 7 pairs, only avaliable when tcnt is 13 or 14
function PairStep(tiles, disjoint = false) {
    if (!disjoint) {
        tiles = tiles.slice();
        let ans = 0;
        let sig = 0;
        for (let i = 0; i < sizeUT; ++i) {
            if (JokerA[i] !== JokerA[i + 1]) {
                tiles[i] += tiles[JokerA[i]];
                tiles[JokerA[i]] = 0;
            }
            if (JokerB[i] !== JokerB[i + 1]) {
                tiles[i] += tiles[JokerB[i]];
                tiles[JokerB[i]] = 0;
            }
            ans += Math.floor(tiles[i] / 2);
            if (tiles[i] % 2)
                if (tiles[JokerA[i]]) {
                    --tiles[JokerA[i]];
                    ++ans;
                } else if (tiles[JokerB[i]]) {
                    --tiles[JokerB[i]];
                    ++ans;
                } else ++sig;
        }
        if (ans > 7) {
            sig += (ans - 7) * 2;
            ans = 7;
        }
        return 13 - ans * 2 - Math.min(sig, 7 - ans) - tiles[42];
    } else {
        let t = tiles.slice();
        for (let i = 0; i < sizeUT; ++i) {
            if (t[i] !== 1) continue;
            if (t[JokerA[i]]) {
                --t[JokerA[i]];
                ++t[i];
            } else if (t[JokerB[i]]) {
                --t[JokerB[i]];
                ++t[i];
            } else if (t[42]) {
                --t[42];
                ++t[i];
            }
        }
        for (let i = 0; i < sizeUT; ++i) {
            if (t[i] !== 0) continue;
            const cnt = Math.min(t[JokerA[i]], 2);
            t[i] = cnt;
            t[JokerA[i]] -= cnt;
            if (t[i] !== 1) continue;
            if (t[JokerB[i]]) {
                --t[JokerB[i]];
                ++t[i];
            } else if (t[42]) {
                --t[42];
                ++t[i];
            }
        }
        for (let i = 0; i < sizeUT; ++i) {
            if (t[i] !== 0) continue;
            const cnt = Math.min(t[JokerB[i]], 2);
            t[i] = cnt;
            t[JokerB[i]] -= cnt;
            if (t[i] !== 1) continue;
            if (t[42]) {
                --t[42];
                ++t[i];
            }
        }
        for (let i = 0; i < sizeUT; ++i) {
            if (t[i] !== 0) continue;
            const cnt = Math.min(t[42], 2);
            t[i] = cnt;
            t[42] -= cnt;
        }
        let ans = 0;
        let sig = 0;
        for (let i = 0; i < sizeUT; ++i)
            if (t[i] >= 2) ++ans;
            else if (t[i] === 1) ++sig;
        if (ans > 7) {
            sig += ans - 7;
            ans = 7;
        }
        return 13 - ans * 2 - Math.min(sig, 7 - ans);
    }
}
// Special Check for 13 orphans, only avaliable when tcnt is 13 or 14
const Orphan13Array = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33];
function OrphanStep(tiles) {
    let ans = 0;
    let tcp = tiles.slice();
    for (let i = 0; i < Orphan13Array.length; ++i) {
        const id = Orphan13Array[i];
        if (tcp[id]) --tcp[id];
        else if (tcp[JokerA[id]]) --tcp[JokerA[id]];
        else if (tcp[JokerB[id]]) --tcp[JokerB[id]];
        else ++ans;
    }
    for (let i = 0; i < Orphan13Array.length; ++i) {
        const id = Orphan13Array[i];
        if (tcp[id]) return ans - 1 - tiles[42];
        else if (tcp[JokerA[id]]) return ans - 1 - tiles[42];
        else if (tcp[JokerB[id]]) return ans - 1 - tiles[42];
    }
    return ans - tiles[42];
}
// Creation of Knitted Dragon
let KDragonSave = Array.from({ length: 6 }, () => Array(9).fill(0));
function KDragonCreate() {
    // dragonOffset contains all possible permutations (6 permutations for 3 elements)
    const dragonOffsets = [
        [0, 1, 2],
        [0, 2, 1],
        [1, 0, 2],
        [1, 2, 0],
        [2, 0, 1],
        [2, 1, 0],
    ];
    for (let i = 0; i < 6; ++i)
        for (let j = 0; j < 9; ++j) {
            const di = Math.floor(j / 3);
            const dj = j % 3;
            const id = di * 9 + dragonOffsets[i][di] + dj * 3;
            KDragonSave[i][j] = id;
        }
}
KDragonCreate();
// Special Check for Bukao
function Bukao16Count(tiles) {
    let ans = 0;
    for (let i = 0; i < 6; ++i) {
        let count = 0;
        let tcp = tiles.slice();
        for (let j = 0; j < 9; ++j) {
            const id = KDragonSave[i][j];
            ++count;
            if (tiles[id]);
            else if (tcp[JokerA[id]]) --tcp[JokerA[id]];
            else if (tcp[JokerB[id]]) --tcp[JokerB[id]];
            else --count;
        }
        for (let i = 27; i < 34; ++i) {
            ++count;
            if (tiles[i]);
            else if (tcp[JokerA[i]]) --tcp[JokerA[i]];
            else if (tcp[JokerB[i]]) --tcp[JokerB[i]];
            else --count;
        }
        ans = Math.max(ans, count);
    }
    return ans + tiles[42];
}
// Special Check for Knitted Dragon
function KDragonStep(tiles, tcnt) {
    let ans = Infinity;
    for (let i = 0; i < 6; ++i) {
        let miss = 0;
        let tcp = tiles.slice();
        for (let j = 0; j < 9; ++j) {
            const id = KDragonSave[i][j];
            if (tcp[id]) --tcp[id];
            else if (tcp[JokerA[id]]) --tcp[JokerA[id]];
            else if (tcp[JokerB[id]]) --tcp[JokerB[id]];
            else ++miss;
        }
        ans = Math.min(ans, searchDp(tcp, 3, 0, tcnt) + miss);
    }
    return ans;
}
function KDragonStepCheck(tiles, maxstep, tcnt) {
    let ans = Infinity;
    for (let i = 0; i < 6; ++i) {
        let miss = 0;
        let tcp = tiles.slice();
        for (let j = 0; j < 9; ++j) {
            const id = KDragonSave[i][j];
            if (tcp[id]) --tcp[id];
            else if (tcp[JokerA[id]]) --tcp[JokerA[id]];
            else if (tcp[JokerB[id]]) --tcp[JokerB[id]];
            else ++miss;
        }
        ans = Math.min(ans, searchDp(tcp, 3, 0, tcnt, maxstep - miss) + miss);
    }
    return ans;
}
// Special Check for 13 orphans in taiwan, only avaliable when tcnt is 16 or 17
function OrphanMeldStep(tiles) {
    let miss = 0;
    let ans = Infinity;
    let tcp = tiles.slice();
    for (let i = 0; i < Orphan13Array.length; ++i) {
        const id = Orphan13Array[i];
        if (tcp[id]) --tcp[id];
        else if (tcp[JokerA[id]]) --tcp[JokerA[id]];
        else if (tcp[JokerB[id]]) --tcp[JokerB[id]];
        else ++miss;
    }
    for (let i = 0; i < Orphan13Array.length; ++i) {
        const id = Orphan13Array[i];
        if (tcp[id]) {
            --tcp[id];
            ans = Math.min(ans, searchDp(tcp, 4, 1, 17) + miss);
            ++tcp[id];
        } else if (tcp[JokerA[id]]) {
            --tcp[JokerA[id]];
            ans = Math.min(ans, searchDp(tcp, 4, 1, 17) + miss);
            ++tcp[JokerA[id]];
        } else if (tcp[JokerB[id]]) {
            --tcp[JokerB[id]];
            ans = Math.min(ans, searchDp(tcp, 4, 1, 17) + miss);
            ++tcp[JokerB[id]];
        }
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
        t[i] -= cnt0;
        miss -= cnt0;
        const cnt1 = Math.min(t[JokerA[i]], miss);
        t[JokerA[i]] -= cnt1;
        miss -= cnt1;
        const cnt2 = Math.min(t[JokerB[i]], miss);
        t[JokerB[i]] -= cnt2;
        miss -= cnt2;
        ans = Math.min(ans, PairStep(t, false) + miss);
    }
    return ans;
}
// Special Check for 16 Buda in taiwan, only avaliable when tcnt is 16 or 17
function Buda16Step(tiles) {
    let miss = new Array(5).fill(Infinity);
    let pmiss = new Array(5).fill(Infinity);
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
    const joker = [43, 44, 45, 47, 48];
    for (let i = 0; i < 5; ++i) {
        miss[i] = Math.max(miss[i] - tiles[joker[i]], 0);
        pmiss[i] = Math.max(pmiss[i] - tiles[joker[i]], 0);
    }
    let step = Infinity;
    for (let pi = 0; pi < 5; ++pi) {
        let ra = tiles[46],
            rb = tiles[49];
        let ans = -tiles[42];
        for (let i = 0; i < 3; ++i) {
            const m = i === pi ? pmiss[i] : miss[i];
            const ua = Math.min(ra, m);
            ans += m - ua;
            ra -= ua;
        }
        for (let i = 3; i < 5; ++i) {
            const m = i === pi ? pmiss[i] : miss[i];
            const ub = Math.min(rb, m);
            ans += m - ub;
            rb -= ub;
        }
        step = Math.min(ans - 1, step);
    }
    return step;
}
function countWaitingCards(tiles, ans) {
    let cnt = 0;
    for (let i = 0; i < ans.length; ++i) cnt += Math.max(4 - tiles[ans[i]], 0);
    return cnt;
}
function checkGoodWaiting(tiles, stepf) {
    for (let ia = 0; ia < sizeUT; ++ia) {
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
                    console.log(tiles, listencnt);
                    ++tiles[ia];
                    return true;
                }
            }
            console.log(tiles, listencnt);
        }
        ++tiles[ia];
    }
    return false;
}
function normalWaiting(tiles, step, tcnt) {
    let ans = [];
    let gans = [];
    const discard = tcnt % 3 !== 1;
    if (discard && !StepCheck(tiles, step + 1, tcnt - 1, tcnt)) return { ans };
    for (let i = 0; i < sizeUT; ++i) {
        ++tiles[i];
        const iw = StepCheck(tiles, step, tcnt, tcnt);
        if (iw) 
            if (step === 1 && tiles[i] < 4) {
                if (checkGoodWaiting(tiles, (t, i, d) => StepCheck(t, i, tcnt - d, tcnt))) gans.push(i);
                else ans.push(i);
            } else ans.push(i);
        --tiles[i];
    }
    if (step === 1) return { ans, gans };
    return { ans };
}
function JPWaiting(tiles, step, substep, tcnt) {
    const discard = tcnt % 3 !== 1;
    subcheck = [false, false, false];
    if (tcnt === 14 && step === substep[1] && (!discard || PairStep(tiles, true) === step)) subcheck[1] = true;
    if (tcnt === 14 && step === substep[2] && (!discard || OrphanStep(tiles) === step)) subcheck[2] = true;
    if (step === substep[0] && (!discard || StepCheck(tiles, step + 1, tcnt - 1, tcnt, 4))) subcheck[0] = true;
    let ans = [];
    let gans = [];
    function waiting(tiles, step, d) {
        if (subcheck[1] && PairStep(tiles, true) < step) return true;
        else if (subcheck[2] && OrphanStep(tiles) < step) return true;
        else if (subcheck[0] && StepCheck(tiles, step, tcnt - d, tcnt, 4)) return true;
    }
    for (let i = 0; i < sizeUT; ++i) {
        ++tiles[i];
        const iw = waiting(tiles, step, 0);
        if (iw) 
            if (step === 1 && tiles[i] < 4) {
                if (checkGoodWaiting(tiles, waiting)) gans.push(i);
                else ans.push(i);
            } else ans.push(i);
        --tiles[i];
    }
    if (step === 1) return { ans, gans };
    return { ans };
}
function GBWaiting(tiles, step, substep, tcnt) {
    // substep: [normal, 7pairs, 13orphans, bukao16, dragon]
    const discard = tcnt % 3 !== 1;
    subcheck = [false, false, false, false, false];
    if (tcnt === 14 && step === substep[1] && (!discard || PairStep(tiles, false) === step)) subcheck[1] = true;
    if (tcnt === 14 && step === substep[2] && (!discard || OrphanStep(tiles) === step)) subcheck[2] = true;
    if (tcnt === 14 && step === substep[3] && (!discard || tcnt - 1 - Bukao16Count(tiles) === step)) subcheck[3] = true;
    if (step === substep[0] && (!discard || StepCheck(tiles, step + 1, tcnt - 1, tcnt))) subcheck[0] = true;
    if (tcnt >= 9 && step === substep[4] && (!discard || KDragonStepCheck(tiles, step + 1, tcnt) === step)) subcheck[4] = true;
    let ans = [];
    let gans = [];
    function waiting(tiles, step, d) {
        if (subcheck[1] && PairStep(tiles, false) < step) return true;
        else if (subcheck[2] && OrphanStep(tiles) < step) return true;
        else if (subcheck[3] && tcnt - 1 - Bukao16Count(tiles) < step) return true;
        else if (subcheck[0] && StepCheck(tiles, step, tcnt - d, tcnt)) return true;
        else if (subcheck[4] && KDragonStepCheck(tiles, step, tcnt) < step) return true;
    }
    for (let i = 0; i < sizeUT; ++i) {
        ++tiles[i];
        const iw = waiting(tiles, step, 0);
        if (iw)
            if (step === 1 && tiles[i] < 4) {
                if (checkGoodWaiting(tiles, waiting)) gans.push(i);
                else ans.push(i);
            } else ans.push(i);
        --tiles[i];
    }
    if (step === 1) return { ans, gans };
    return { ans };
}
function TWWaiting(tiles, step, substep, tcnt) {
    // substep: [normal, niconico, 13orphans, buda16]
    const discard = tcnt % 3 !== 1;
    subcheck = [false, false, false, false];
    if (tcnt === 17 && step === substep[1] && (!discard || NiconicoStep(tiles) === step)) subcheck[1] = true;
    if (tcnt === 17 && step === substep[3] && (!discard || Buda16Step(tiles) === step)) subcheck[3] = true;
    if (step === substep[0] && (!discard || StepCheck(tiles, step + 1, tcnt - 1, tcnt))) subcheck[0] = true;
    if (tcnt === 17 && step === substep[2] && (!discard || OrphanMeldStep(tiles) === step)) subcheck[2] = true;
    let ans = [];
    let gans = [];
    function waiting(tiles, step, d) {
        if (subcheck[1] && NiconicoStep(tiles) < step) return true;
        else if (subcheck[3] && Buda16Step(tiles) < step) return true;
        else if (subcheck[0] && StepCheck(tiles, step, tcnt - d, tcnt)) return true;
        else if (subcheck[2] && OrphanMeldStep(tiles) < step) return true;
    }
    for (let i = 0; i < sizeUT; ++i) {
        ++tiles[i];
        const iw = waiting(tiles, step, 0);
        if (iw)
            if (step === 1 && tiles[i] < 4) {
                if (checkGoodWaiting(tiles, waiting)) gans.push(i);
                else ans.push(i);
            } else ans.push(i);
        --tiles[i];
    }
    if (step === 1) return { ans, gans };
    return { ans };
}
