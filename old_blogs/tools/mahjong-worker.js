importScripts("mahjong.js");
let table_head = '<table style="border-collapse: collapse; padding: 0px">';
let table_tail = "</table>";
function cardImage(id) {
    return `<img src="./cards/a${cardName(id)}.gif" style="vertical-align: middle;">`;
}
function cardImageDivide(id) {
    return `<img src="./cards/${cardName(id)}.gif">`;
}
const divideSpace = `<div class="card-div" style="width: 2%;"></div>`;
function printWaiting(tiles, tcnt, full_tcnt, getWaiting, getSubchecks) {
    let result = "";
    if (full_tcnt !== tcnt) {
        const save = getWaiting(undefined, undefined, (s) => s);
        const { ans, gans } = save;
        if (gans !== undefined) {
            const bcnt = countWaitingCards(tiles, ans);
            const gcnt = countWaitingCards(tiles, gans);
            const cnt = gcnt + bcnt;
            const ratio = (gcnt / cnt) * 100;
            result +=
                `<td class="waiting-brief">待 ${cnt} 枚</td>` +
                `<td class="devided-waiting-td">` +
                `<div style="display: flex; white-space: nowrap;"><div class="devided-waiting-brief">好型 ${gcnt} 枚</div>` +
                `<div class="devided-waiting-cards">${gans.map(cardImage).join("")}</div></div>` +
                `<div style="display: flex; white-space: nowrap;"><div class="devided-waiting-brief">愚型 ${bcnt} 枚</div>` +
                `<div class="devided-waiting-cards">${ans.map(cardImage).join("")}</div></div>` +
                `<div class="devided-waiting-brief">好型率 ${ratio.toFixed(2)}%</div></td>`;
        } else {
            const cnt = countWaitingCards(tiles, ans);
            result += `<td class="waiting-brief">待 ${cnt} 枚</td><td style="padding-left: 10px;">${ans.map(cardImage).join("")}</td>`;
        }
        return { output: table_head + result + table_tail, ans: { waiting: save } };
    } else {
        const save = Array(sizeAT);
        const cnts = [];
        const subchecks = getSubchecks();
        const { dischecks, getchecks } = subchecks;
        for (let i = 0; i < sizeAT; ++i) {
            if (!tiles[i]) continue;
            tiles[i]--;
            save[i] = getWaiting(dischecks[i], getchecks, (s) => s[i]);
            tiles[i]++;
            const { ans, gans, checked } = save[i];
            if (gans !== undefined) {
                const bcnt = countWaitingCards(tiles, ans);
                const gcnt = countWaitingCards(tiles, gans);
                if (checked) cnts.push({ cnt: bcnt + gcnt, bcnt, gcnt, id: i });
            } else {
                const cnt = countWaitingCards(tiles, ans);
                if (checked) cnts.push({ cnt: cnt, id: i });
            }
        }
        cnts.sort((a, b) => {
            if (b.cnt !== a.cnt) return b.cnt - a.cnt;
            if ("gcnt" in a && "gcnt" in b) return b.gcnt - a.gcnt;
            return 0;
        });
        for (const { cnt, bcnt, gcnt, id } of cnts) {
            const verb = (id >= 34 && id < 42) || id == 50 ? "补" : "打";
            if (gcnt !== undefined) {
                const ratio = (gcnt / cnt) * 100;
                result +=
                    `<tr><td class="waiting-brief">${verb} ${cardImage(id)} 待 ${cnt} 枚</td>` +
                    `<td class="devided-waiting-td">` +
                    `<div style="display: flex; white-space: nowrap;"><div class="devided-waiting-brief">好型 ${gcnt} 枚</div>` +
                    `<div class="devided-waiting-cards">${save[id].gans.map(cardImage).join("")}</div></div>` +
                    `<div style="display: flex; white-space: nowrap;"><div class="devided-waiting-brief">愚型 ${bcnt} 枚</div>` +
                    `<div class="devided-waiting-cards">${save[id].ans.map(cardImage).join("")}</div></div>` +
                    `<div class="devided-waiting-brief">好型率 ${ratio.toFixed(2)}%</div></td></tr>`;
            } else
                result +=
                    `<tr><td class="waiting-brief">${verb} ${cardImage(id)} 待 ${cnt} 枚</td>` +
                    `<td style="padding-left: 10px;">${save[id].ans.map(cardImage).join("")}</td></tr>`;
        }
        return { output: table_head + result + table_tail, ans: { waiting: save, subchecks } };
    }
}
function getWaitingType(step) {
    if (step === -1) return "和牌";
    else if (step === 0) return "听牌";
    else return step + " 向听";
}
function normalStep(tiles, tcnt, full_tcnt) {
    let step = Step(tiles, tcnt, full_tcnt);
    let output = getWaitingType(step) + "\n";
    postMessage({ output, brief: getWaitingType(step) });
    const r = printWaiting(
        tiles,
        tcnt,
        full_tcnt,
        (d, g) => normalWaiting(tiles, step, full_tcnt, d, g),
        () => normalPrecheck(tiles, step, full_tcnt)
    );
    output += r.output;
    if (step === -1) {
        const nm = Math.floor(full_tcnt / 3);
        const np = full_tcnt % 3 ? 1 : 0;
        const cnt = WinningDivide(tiles, nm, np);
        let melds = [],
            head = [];
        let ots = [];
        function dfs(i, dpi) {
            if (melds.length === nm && head.length === np) {
                ots.push([...head, ...melds]);
                return;
            }
            const ans = dvd[dpi];
            for (let j = 0; j < ans.nxt.length; ++j) {
                if (ots.length >= 10) return;
                const n = ans.nxt[j];
                for (let p = 0; p < n.p; ++p) head.push([i, i]);
                for (let s = 0; s < n.s; ++s) melds.push([i, i + 1, i + 2]);
                for (let k = 0; k < n.k; ++k) melds.push([i, i, i]);
                dfs(i + 1, n.dpi);
                for (let p = 0; p < n.p; ++p) head.pop();
                for (let m = 0; m < n.s + n.k; ++m) melds.pop();
            }
        }
        dfs(0, 0);
        ots.sort((a, b) => {
            const m = Math.min(a.length, b.length);
            for (let i = 0; i < m; i++) {
                const rowA = a[i];
                const rowB = b[i];
                const n = Math.min(rowA.length, rowB.length);
                for (let j = 0; j < n; j++) {
                    if (rowA[j] !== rowB[j]) return rowA[j] - rowB[j];
                }
                if (rowA.length !== rowB.length) return rowA.length - rowB.length;
            }
            return a.length - b.length;
        });
        for (let i = 0; i < ots.length; ++i) {
            let t = tiles.slice();
            for (let j = 0; j < ots[i].length; ++j) 
                for (let k = 0; k < ots[i][j].length; ++k) {
                    const id = ots[i][j][k];
                    let rid = id;
                    if (t[id] > 0);
                    else if (t[JokerA[id]] > 0) rid = JokerA[id];
                    else if (t[JokerB[id]] > 0) rid = JokerB[id];
                    else if (t[JokerC] > 0) rid = JokerC;
                    --t[rid]
                    ots[i][j][k] = rid;
                }
        }
        output += "和牌拆解: \n"
        output += ots.map(a => `<div class="card-container">${a.map(b => b.map(cardImageDivide).join('')).join(divideSpace)}</div>`).join('');
        if (ots.length < cnt) output += `以及其他 ${cnt - ots.length} 种和牌拆解方式`;
    }
    return { output, step, save: r.ans };
}
function JPStep(tiles, tcnt, full_tcnt) {
    let table = "";
    let step4 = Step(tiles, tcnt, full_tcnt, 4);
    table += '<tr><td style="padding-left: 0px;">一般型：</td><td>' + getWaitingType(step4) + "</td></tr>";
    postMessage({ output: table_head + table + table_tail });
    let stepJP = step4;
    let step7JP, step13;
    if (full_tcnt === 14) {
        step7JP = PairStep(tiles, true);
        table += '<tr><td style="padding-left: 0px;">七对型：</td><td>' + getWaitingType(step7JP) + "</td></tr>";
        postMessage({ output: table_head + table + table_tail });
        stepJP = Math.min(stepJP, step7JP);
        step13 = OrphanStep(tiles);
        table += '<tr><td style="padding-left: 0px;">国士无双型：</td><td>' + getWaitingType(step13) + "</td></tr>";
        postMessage({ output: table_head + table + table_tail });
        stepJP = Math.min(stepJP, step13);
    }
    let output = getWaitingType(stepJP);
    let stepTypeJP = [];
    if (step4 == stepJP) stepTypeJP.push("一般型");
    if (full_tcnt == 14) {
        if (step7JP == stepJP) stepTypeJP.push("七对型");
        if (step13 == stepJP) stepTypeJP.push("国士无双型");
    }
    output += ` （` + stepTypeJP.join("／") + `）\n`;
    let brief = output;
    output += table_head + table + table_tail;
    postMessage({ output, brief });
    const substep = [step4, step7JP, step13];
    output += printWaiting(
        tiles,
        tcnt,
        full_tcnt,
        (d, g) => JPWaiting(tiles, stepJP, substep, full_tcnt, d, g),
        () => JPPrecheck(tiles, stepJP, substep, full_tcnt)
    ).output;
    return { output, step13 };
}
function GBStep(tiles, tcnt, full_tcnt, step, save, step13) {
    let table = "";
    let stepGB = step;
    table += '<tr><td style="padding-left: 0px;">一般型：</td><td>' + getWaitingType(step) + "</td></tr>";
    postMessage({ output: table_head + table + table_tail });
    let step7GB, step16, stepkd;
    if (full_tcnt === 14) {
        step7GB = PairStep(tiles, false);
        table += '<tr><td style="padding-left: 0px;">七对型：</td><td>' + getWaitingType(step7GB) + "</td></tr>";
        table += '<tr><td style="padding-left: 0px;">十三幺型：</td><td>' + getWaitingType(step13) + "</td></tr>";
        postMessage({ output: table_head + table + table_tail });
        stepGB = Math.min(stepGB, step7GB);
        stepGB = Math.min(stepGB, step13);
        step16 = full_tcnt - 1 - Bukao16Count(tiles);
        table += '<tr><td style="padding-left: 0px;">全不靠型：</td><td>' + getWaitingType(step16) + "</td></tr>";
        postMessage({ output: table_head + table + table_tail });
        stepGB = Math.min(stepGB, step16);
    }
    if (full_tcnt >= 9) {
        stepkd = KDragonStep(tiles, tcnt);
        table += '<tr><td style="padding-left: 0px;">组合龙型：</td><td>' + getWaitingType(stepkd) + "</td></tr>";
        postMessage({ output: table_head + table + table_tail });
        stepGB = Math.min(stepGB, stepkd);
    }
    let output = getWaitingType(stepGB);
    let stepTypeGB = [];
    if (step == stepGB) stepTypeGB.push("一般型");
    if (full_tcnt === 14) {
        if (step7GB == stepGB) stepTypeGB.push("七对型");
        if (step13 == stepGB) stepTypeGB.push("十三幺型");
        if (step16 == stepGB) stepTypeGB.push("全不靠型");
    }
    if (full_tcnt >= 9 && stepkd == stepGB) stepTypeGB.push("组合龙型");
    output += ` （` + stepTypeGB.join("／") + `）\n`;
    let brief = output;
    output += table_head + table + table_tail;
    postMessage({ output, brief });
    const substep = [step, step7GB, step13, step16, stepkd];
    output += printWaiting(
        tiles,
        tcnt,
        full_tcnt,
        (d, g, f) => GBWaiting(tiles, stepGB, substep, full_tcnt, f(save.waiting), d, g),
        () => GBPrecheck(tiles, stepGB, substep, full_tcnt, save.subchecks)
    ).output;
    return { output };
}
function TWStep(tiles, tcnt, full_tcnt, step, save) {
    let table = "";
    let stepTW = step;
    table += '<tr><td style="padding-left: 0px;">一般型：</td><td>' + getWaitingType(step) + "</td></tr>";
    postMessage({ output: table_head + table + table_tail });
    let step13, step16, stepnico;
    if (full_tcnt === 17) {
        stepnico = NiconicoStep(tiles);
        table += '<tr><td style="padding-left: 0px;">呖咕呖咕型：</td><td>' + getWaitingType(stepnico) + "</td></tr>";
        stepTW = Math.min(stepTW, stepnico);
        postMessage({ output: table_head + table + table_tail });
        step13 = OrphanMeldStep(tiles);
        table += '<tr><td style="padding-left: 0px;">十三幺型：</td><td>' + getWaitingType(step13) + "</td></tr>";
        postMessage({ output: table_head + table + table_tail });
        stepTW = Math.min(stepTW, step13);
        step16 = Buda16Step(tiles);
        table += '<tr><td style="padding-left: 0px;">十六不搭型：</td><td>' + getWaitingType(step16) + "</td></tr>";
        postMessage({ output: table_head + table + table_tail });
        stepTW = Math.min(stepTW, step16);
    }
    let output = getWaitingType(stepTW);
    let stepTypeTW = [];
    if (step == stepTW) stepTypeTW.push("一般型");
    if (full_tcnt === 17) {
        if (stepnico == stepTW) stepTypeTW.push("呖咕呖咕型");
        if (step13 == stepTW) stepTypeTW.push("十三幺型");
        if (step16 == stepTW) stepTypeTW.push("十六不搭型");
    }
    output += ` （` + stepTypeTW.join("／") + `）\n`;
    let brief = output;
    output += table_head + table + table_tail;
    postMessage({ output, brief });
    const substep = [step, stepnico, step13, step16];
    output += printWaiting(
        tiles,
        tcnt,
        full_tcnt,
        (d, g, f) => TWWaiting(tiles, stepTW, substep, full_tcnt, f(save.waiting), d, g),
        () => TWPrecheck(tiles, stepTW, substep, full_tcnt, save.subchecks)
    ).output;
    return { output };
}
self.onmessage = function (e) {
    let { task, tiles, tcnt, full_tcnt } = e.data;
    let result;
    const st = new Date();
    switch (task) {
        case 0:
            result = normalStep(tiles, tcnt, full_tcnt);
            break;
        case 1:
            result = JPStep(tiles, tcnt, full_tcnt);
            break;
        case 2: {
            let { step, save, step13 } = e.data;
            result = GBStep(tiles, tcnt, full_tcnt, step, save, step13);
            break;
        }
        case 3: {
            let { step, save } = e.data;
            result = TWStep(tiles, tcnt, full_tcnt, step, save);
            break;
        }
    }
    const ed = new Date();
    postMessage({ result, time: ed - st });
};
