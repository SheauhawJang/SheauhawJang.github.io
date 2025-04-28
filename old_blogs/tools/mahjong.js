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
const SeqArray = [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
function SeqCheck(left) {
    return left >= 0 && left < 34 ? SeqArray[left] : false;
}
// Five Parts Principle: Up to five parts when normal winning.
function FivePartCheck(meld, joint, pair, tcnt) {
    return meld + joint <= Math.floor(tcnt / 3) && meld + joint + pair <= Math.floor(tcnt / 3) + (tcnt % 3 ? 1 : 0);
}
// Search for step, check meld, joint and pair
function search(tiles, meld, joint, pair, start, tcnt) {
    const max_ans = Math.floor(tcnt / 3) * 2 + (tcnt % 3 ? 1 : 0) - 1;
    if (!FivePartCheck(meld, joint, pair, tcnt)) return max_ans;
    let ans = max_ans - meld * 2 - joint - pair;
    for (let i = start; i < 34; ++i) {
        if (tiles[i] >= 3) {
            tiles[i] -= 3;
            ans = Math.min(search(tiles, meld + 1, joint, pair, i, tcnt), ans);
            tiles[i] += 3;
        }
        if (tiles[i] >= 2) {
            tiles[i] -= 2;
            ans = Math.min(search(tiles, meld, joint, pair + 1, i, tcnt), ans);
            tiles[i] += 2;
        }
        if (SeqCheck(i)) {
            if (tiles[i] && tiles[i + 1] && tiles[i + 2]) {
                --tiles[i];
                --tiles[i + 1];
                --tiles[i + 2];
                ans = Math.min(search(tiles, meld + 1, joint, pair, i, tcnt), ans);
                ++tiles[i];
                ++tiles[i + 1];
                ++tiles[i + 2];
            }
            if (!SeqCheck(i - 1) && tiles[i] && tiles[i + 1]) {
                --tiles[i];
                --tiles[i + 1];
                ans = Math.min(search(tiles, meld, joint + 1, pair, i, tcnt), ans);
                ++tiles[i];
                ++tiles[i + 1];
            }
            if (tiles[i] && tiles[i + 2]) {
                --tiles[i];
                --tiles[i + 2];
                ans = Math.min(search(tiles, meld, joint + 1, pair, i, tcnt), ans);
                ++tiles[i];
                ++tiles[i + 2];
            }
            if (tiles[i + 1] && tiles[i + 2]) {
                --tiles[i + 1];
                --tiles[i + 2];
                ans = Math.min(search(tiles, meld, joint + 1, pair, i, tcnt), ans);
                ++tiles[i + 1];
                ++tiles[i + 2];
            }
        }
    }
    return ans;
}
// Search for winning, only check meld so very fast
function searchWin(tiles, meld, start, tcnt) {
    if (meld * 3 + 2 === tcnt)
        for (let i = 0; i < 34; ++i)
            if (tiles[i] === 2) return true;
            else if (tiles[i] === 1) return false;
    if (meld * 3 === tcnt) return true;
    // When winning, every card should be in a meld or pair.
    for (let i = 0; i < 34; ++i)
        if (tiles[i] > 0 && tiles[i] < 2) {
            let inMeld = false;
            for (let left = i; left >= i - 2; --left)
                if (SeqCheck(left) && tiles[left] && tiles[left + 1] && tiles[left + 2]) {
                    i = left + 2;
                    inMeld = true;
                    break;
                }
            if (!inMeld) return false;
        }
    for (let i = start; i < 34; ++i)
        if (tiles[i] > 0) {
            if (tiles[i] >= 3) {
                tiles[i] -= 3;
                let ans = searchWin(tiles, meld + 1, i, tcnt);
                tiles[i] += 3;
                if (ans) return true;
            }
            if (SeqCheck(i) && tiles[i] && tiles[i + 1] && tiles[i + 2]) {
                --tiles[i];
                --tiles[i + 1];
                --tiles[i + 2];
                let ans = searchWin(tiles, meld + 1, i, tcnt);
                ++tiles[i];
                ++tiles[i + 1];
                ++tiles[i + 2];
                if (ans) return true;
            }
        }
    return false;
}
// Win function
function Win(tiles, tcnt) {
    return tcnt % 3 === 1 ? false : searchWin(tiles, 0, 0, tcnt);
}
// Listen function
function Listen(tiles, tcnt) {
    if (tcnt % 3 === 1)
        for (let j = 0; j < 34; ++j) {
            tiles[j]++;
            const ans = Win(tiles, tcnt + 1);
            tiles[j]--;
            if (ans) return true;
        }
    else
        for (let i = 0; i < 34; ++i)
            if (tiles[i]) {
                tiles[i]--;
                for (let j = 0; j < 34; ++j) {
                    if (i === j) continue;
                    tiles[j]++;
                    const ans = Win(tiles, tcnt);
                    tiles[j]--;
                    if (ans) {
                        tiles[i]++;
                        return true;
                    }
                }
                tiles[i]++;
            }
    return false;
}
// Step function
function Step(tiles, tcnt) {
    if (Win(tiles, tcnt)) return -1;
    if (Listen(tiles, tcnt)) return 0;
    return search(tiles, 0, 0, 0, 0, tcnt);
}
// Check whether the step of new tiles decreased or not.
function StepCheck(tiles, limit, tcnt) {
    if (limit === -1) return false;
    if (Win(tiles, tcnt)) return true;
    if (limit === 0) return false;
    if (Listen(tiles, tcnt)) return true;
    if (limit === 1) return false;
    return search(tiles, 0, 0, 0, 0, tcnt) < limit;
}
// Only relative card may increase the step.
function RelativeCard(tiles, i) {
    if (tiles[i - 2] && SeqCheck(i - 2)) return true;
    if (tiles[i - 1] && (SeqCheck(i - 2) || SeqCheck(i - 1))) return true;
    if (tiles[i]) return true;
    if (tiles[i + 1] && (SeqCheck(i - 1) || SeqCheck(i))) return true;
    if (tiles[i + 2] && SeqCheck(i)) return true;
    return false;
}
// Only relative card may increase the step.
function RelativeCardWithMyself(tiles, i) {
    if (tiles[i - 2] && SeqCheck(i - 2)) return true;
    if (tiles[i - 1] && (SeqCheck(i - 2) || SeqCheck(i - 1))) return true;
    if (tiles[i] > 1) return true;
    if (tiles[i + 1] && (SeqCheck(i - 1) || SeqCheck(i))) return true;
    if (tiles[i + 2] && SeqCheck(i)) return true;
    return false;
}
// Special Check for 7 pairs
function PairCount(tiles, disjoint = false) {
    let ans = 0;
    for (let i = 0; i < 34; ++i) {
        if (tiles[i] >= 2) ++ans;
        if (!disjoint && tiles[i] === 4) ++ans;
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
const Orphan13Array = [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1];
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
        ans = Math.min(ans, search(tiles, 3, 0, 0, 0, tcnt) + miss);
        for (let j = 0; j < 9; ++j) if (count[j]) tiles[KDragonSave[i][j]]++;
    }
    return ans;
}
function countWaitingCards(tiles, ans) {
    let cnt = 0;
    for (let i = 0; i < ans.length; ++i) cnt += 4 - tiles[ans[i]];
    return cnt;
}
function normalWaiting(tiles, step, tcnt) {
    let ans = [];
    for (let i = 0; i < 34; ++i)
        if (RelativeCard(tiles, i)) {
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
        else if (step === substep[0] && RelativeCardWithMyself(tiles, i) && StepCheck(tiles, step, tcnt)) ans.push(i);
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
        else if (step === substep[0] && RelativeCardWithMyself(tiles, i) && StepCheck(tiles, step, tcnt)) ans.push(i);
        else if (tcnt >= 9 && step === substep[4] && KDragonStep(tiles, tcnt) < step) ans.push(i);
        tiles[i]--;
    }
    return ans;
}
