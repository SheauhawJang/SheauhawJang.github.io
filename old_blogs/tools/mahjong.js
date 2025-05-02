let start_search_time = new Date();
let search_time_limit = 1000;
function id(name) {
    switch (name[0]) {
        case "E":
            return 27;
        case "S":
            return 28;
        case "W":
            if (name.length > 1 && name[1] === "h") return 31;
            return 29;
        case "N":
            return 30;
        case "P":
            return 31;
        case "F":
        case "G":
            return 32;
        case "C":
        case "R":
            return 33;
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
            break;
        default:
            return -1;
    }
    if (x < 0 || x >= 34) return -1;
    return x;
}
function cardName(id) {
    let ans = "";
    let JP_name = true;
    if (id >= 0 && id < 9) ans = JP_name ? `${id + 1}m` : `${id + 1}w`;
    else if (id >= 9 && id < 18) ans = JP_name ? `${id - 8}p` : `${id - 8}b`;
    else if (id >= 18 && id < 27) ans = `${id - 17}s`;
    else if (id >= 27 && id < 34) ans = `${id - 26}z`;
    return ans;
}
function cardNameGB(id) {
    let ans = "";
    let JP_name = false;
    if (id >= 0 && id < 9) ans = JP_name ? `${id + 1}m` : `${id + 1}w`;
    else if (id >= 9 && id < 18) ans = JP_name ? `${id - 8}p` : `${id - 8}b`;
    else if (id >= 18 && id < 27) ans = `${id - 17}s`;
    else if (id >= 27 && id < 34) ans = `${id - 26}z`;
    return ans;
}
function split(s) {
    let tiles = Array(34).fill(0);
    let ids = [];
    for (let i = 0; i < s.length; i++)
        if (s[i] === "W" && i + 1 < s.length && s[i + 1] === "h") ids.push(id("Wh"));
        else if (s[i] >= "a" && s[i] <= "z")
            for (let j = i - 1; j >= 0; --j)
                if (s[j] >= "0" && s[j] <= "9") ids.push(id(s[j] + s[i]));
                else break;
        else if (s[i] >= "A" && s[i] <= "Z") ids.push(id(s[i]));
    for (let i = 0; i < ids.length; i++) if (ids[i] >= 0 && ids[i] < 34) tiles[ids[i]]++;
    return tiles;
}
// Check left, left+1, left+2 can be a sequence or not
let SeqArray = [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
function SeqCheck(left) {
    return left >= 0 && left < 34 ? SeqArray[left] : false;
}
// Check for step
let dp;
function prepareDp(nm, np) {
    dp = new Array(34);
    for (let i = 0; i < 34; ++i) {
        dp[i] = new Array(5);
        for (let ui = 0; ui <= 4; ++ui) {
            dp[i][ui] = new Array(3);
            for (let uj = 0; uj <= 2; ++uj) {
                dp[i][ui][uj] = new Array(np + 1);
                for (let p = 0; p <= np; ++p) dp[i][ui][uj][p] = new Array(nm + 1).fill(-10);
            }
        }
    }
}
function kernelDp(tiles, em, ep, nm, np, limit = Infinity, i = 0, ui = 0, uj = 0) {
    if (i >= 34) return (nm - em) * 3 + (np - ep) * 2 - 1;
    if (dp[i][ui][uj][ep][em] >= -1) return dp[i][ui][uj][ep][em];
    let ans = (nm - em) * 3 + (np - ep) * 2 - 1;
    let ri = Math.max(tiles[i] - ui, 0);
    let rj = SeqCheck(i) ? Math.max(tiles[i + 1] - uj, 0) : 0;
    let mp = Math.min(np - ep, ri);
    let ms = SeqCheck(i) ? Math.min(nm - em, 2) : 0;
    for (let p = 0; p <= mp; ++p)
        for (let s = 0; s <= ms; ++s) {
            let lri = limit - p * 2 - s - ui;
            if (lri < 0) break;
            let ds = s ? Math.max(s - rj, 0) + Math.max(s - tiles[i + 2], 0) : 0;
            let rri = Math.max(ri - p * 2 - s, 0);
            let mmk = Math.floor(rri / 3);
            let pmk = mmk * 3 < rri ? mmk + 1 : mmk;
            let rgk = Math.min(nm - em - s, Math.floor(lri / 3));
            mmk = Math.min(mmk, rgk);
            pmk = Math.min(pmk, rgk);
            for (let k = mmk; k <= pmk; ++k) {
                let ti = p * 2 + s + k * 3;
                let d = Math.max(ti - ri, 0) + ds;
                if (d - 1 >= ans) break;
                ans = Math.min(ans, kernelDp(tiles, em + s + k, ep + p, nm, np, limit, i + 1, s + uj, s) + d);
            }
        }
    dp[i][ui][uj][ep][em] = ans;
    return ans;
}
function searchDp(tiles, em, ep, tcnt, limit = Infinity) {
    tiles = tiles.slice();
    let nm = Math.floor(tcnt / 3);
    let np = tcnt % 3 > 0 ? 1 : 0;
    for (let i = 0; i < 34; ++i) {
        tiles[i] = Math.min(tiles[i], limit);
        let km = Math.floor(Math.max(tiles[i] - 4, 0) / 3);
        nm -= km;
        tiles[i] -= km * 3;
    }
    prepareDp(nm, np);
    return kernelDp(tiles, em, ep, nm, np, limit);
}
// Check for winning
function check(tiles, target) {
    let meld = 0;
    tiles = tiles.slice();
    for (let i = 0; i < 34; ++i) {
        if (tiles[i] >= 3) {
            meld += Math.floor(tiles[i] / 3);
            tiles[i] %= 3;
        }
        if (SeqCheck(i) && tiles[i] && tiles[i + 1] && tiles[i + 2]) {
            let cnt = Math.min(tiles[i], tiles[i + 1], tiles[i + 2]);
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
    let meld = Math.floor(tcnt / 3);
    let head = tcnt % 3;
    for (let i = 0; i < 34; ++i) if (tiles[i] > limit) return false;
    if (head === 0) return check(tiles, meld);
    if (head === 1) return false;
    for (let i = 0; i < 34; ++i)
        if (tiles[i] >= 2) {
            tiles[i] -= 2;
            let ans = check(tiles, meld);
            tiles[i] += 2;
            if (ans) return true;
        }
    return false;
}
// Listen function
function Listen(tiles, tcnt, limit = Infinity) {
    if (tcnt % 3 === 1)
        for (let j = 0; j < 34; ++j) {
            if (tiles[j] >= limit) continue;
            ++tiles[j];
            let ans = Win(tiles, tcnt + 1, limit);
            --tiles[j];
            if (ans) return true;
        }
    else
        for (let i = 0; i < 34; ++i) {
            if (!tiles[i]) continue;
            --tiles[i];
            for (let j = 0; j < 34; ++j) {
                if (i === j) continue;
                if (tiles[j] >= limit) continue;
                ++tiles[j];
                let ans = Win(tiles, tcnt, limit);
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
function Step(tiles, tcnt = 14, limit = Infinity) {
    if (Win(tiles, tcnt, limit)) return -1;
    if (Listen(tiles, tcnt, limit)) return 0;
    return searchDp(tiles, 0, 0, tcnt, limit);
}
// Check whether the step of new tiles decreased or not.
function StepCheck(tiles, maxstep, tcnt = 14, limit = Infinity) {
    if (maxstep === -1) return false;
    if (Win(tiles, tcnt, limit)) return true;
    if (maxstep === 0) return false;
    if (Listen(tiles, tcnt, limit)) return true;
    if (maxstep === 1) return false;
    return searchDp(tiles, 0, 0, tcnt, limit) < maxstep;
}
// Only relative card may increase the step.
function RelativeCard(tiles, i) {
    if (tiles[i]) return true;
    if (SeqCheck(i) && (tiles[i + 1] || tiles[i + 2])) return true;
    if (SeqCheck(i - 1) && (tiles[i - 1] || tiles[i + 1])) return true;
    if (SeqCheck(i - 2) && (tiles[i - 2] || tiles[i - 1])) return true;
    return false;
}
// Only relative card may increase the step.
function RelativeCardWithMyself(tiles, i) {
    if (tiles[i] > 1) return true;
    if (SeqCheck(i) && (tiles[i + 1] || tiles[i + 2])) return true;
    if (SeqCheck(i - 1) && (tiles[i - 1] || tiles[i + 1])) return true;
    if (SeqCheck(i - 2) && (tiles[i - 2] || tiles[i - 1])) return true;
    return false;
}
// Special Check for 7 pairs
function PairCount(tiles, disjoint = false) {
    let ans = 0;
    for (let i = 0; i < 34; ++i) {
        if (disjoint && tiles[i] >= 2) ++ans;
        if (!disjoint) ans += Math.floor(tiles[i] / 2);
    }
    return ans;
}
// Step of 7 pairs, only avaliable when tcnt is 13 or 14
function PairStep(tiles, disjoint = false) {
    let count = PairCount(tiles, disjoint);
    if (!disjoint) return 6 - count;
    let single = 0;
    for (let i = 0; i < 34; ++i) if (tiles[i] === 1) ++single;
    return 13 - count * 2 - Math.min(single, 7 - count);
}
// Special Check for 13 orphans, only avaliable when tcnt is 13 or 14
let Orphan13Array = [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1];
function OrphanStep(tiles) {
    let pair = 0,
        count = 0;
    for (let i = 0; i < 34; ++i)
        if (Orphan13Array[i] && tiles[i]) {
            ++count;
            pair = Math.max(pair, tiles[i]);
        }
    return 13 - count - (pair > 1 ? 1 : 0);
}
// Creation of Knitted Dragon
let KDragonSave = Array.from({ length: 6 }, () => Array(9).fill(0));
function KDragonCreate() {
    // dragonOffset contains all possible permutations (6 permutations for 3 elements)
    let dragonOffsets = [
        [0, 1, 2],
        [0, 2, 1],
        [1, 0, 2],
        [1, 2, 0],
        [2, 0, 1],
        [2, 1, 0],
    ];
    for (let i = 0; i < 6; ++i)
        for (let j = 0; j < 9; ++j) {
            let di = Math.floor(j / 3);
            let dj = j % 3;
            let id = di * 9 + dragonOffsets[i][di] + dj * 3;
            KDragonSave[i][j] = id;
        }
}
KDragonCreate();
// Special Check for Bukao
function Bukao16Count(tiles) {
    let ans = 0;
    for (let i = 0; i < 6; ++i) {
        let count = 0;
        for (let j = 0; j < 9; ++j) if (tiles[KDragonSave[i][j]]) ++count;
        ans = Math.max(ans, count);
    }
    for (let i = 27; i < 34; ++i) if (tiles[i]) ++ans;
    return ans;
}
// Special Check for Knitted Dragon
function KDragonStep(tiles, tcnt) {
    let ans = tcnt;
    for (let i = 0; i < 6; ++i) {
        let miss = 0;
        let count = new Array(9).fill(0);
        for (let j = 0; j < 9; ++j) {
            let id = KDragonSave[i][j];
            if (tiles[id]) {
                tiles[id]--;
                count[j] = 1;
            } else {
                miss++;
                count[j] = 0;
            }
        }
        ans = Math.min(ans, searchDp(tiles, 3, 0, tcnt) + miss);
        for (let j = 0; j < 9; ++j) if (count[j]) tiles[KDragonSave[i][j]]++;
    }
    return ans;
}
function countWaitingCards(tiles, ans) {
    let cnt = 0;
    for (let i = 0; i < ans.length; ++i) cnt += Math.max(4 - tiles[ans[i]], 0);
    return cnt;
}
function normalWaiting(tiles, step, tcnt) {
    let ans = [];
    for (let i = 0; i < 34; ++i) {
        tiles[i]++;
        if (StepCheck(tiles, step, tcnt)) ans.push(i);
        tiles[i]--;
    }
    return ans;
}
function JPWaiting(tiles, step, substep, tcnt) {
    // substep: [normal, 7pairs, 13orphans]
    let ans = [];
    for (let i = 0; i < 34; ++i) {
        tiles[i]++;
        if (tcnt === 14 && step === substep[1] && PairStep(tiles, true) < step) ans.push(i);
        else if (tcnt === 14 && step === substep[2] && OrphanStep(tiles) < step) ans.push(i);
        else if (step === substep[0] && StepCheck(tiles, step, tcnt, 4)) ans.push(i);
        tiles[i]--;
    }
    return ans;
}
function GBWaiting(tiles, step, substep, tcnt) {
    // substep: [normal, 7pairs, 13orphans, bukao16, dragon]
    let ans = [];
    for (let i = 0; i < 34; ++i) {
        tiles[i]++;
        if (tcnt === 14 && step === substep[1] && PairStep(tiles, false) < step) ans.push(i);
        else if (tcnt === 14 && step === substep[2] && OrphanStep(tiles) < step) ans.push(i);
        else if (tcnt === 14 && step === substep[3] && tcnt - 1 - Bukao16Count(tiles) < step) ans.push(i);
        else if (step === substep[0] && StepCheck(tiles, step, tcnt)) ans.push(i);
        else if (tcnt >= 9 && step === substep[4] && KDragonStep(tiles, tcnt) < step) ans.push(i);
        tiles[i]--;
    }
    return ans;
}
