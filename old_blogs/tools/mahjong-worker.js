importScripts("mahjong.js");
let table_head = '<table style="border-collapse: collapse; padding: 0px;">';
let table_tail = "</table>";
function cardImage(id) {
    return `<img src="./cards/a${cardName(id)}.gif" style="vertical-align: middle;">`;
}
function printWaiting(tiles, tcnt, full_tcnt, getWaiting, subcheck) {
    let result = "";
    if (full_tcnt !== tcnt) {
        const { ans, gans } = getWaiting();
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
    } else {
        const save = Array(sizeAT);
        const cnts = [];
        const subchecks = subcheck();
        for (let i = 0; i < sizeAT; ++i) {
            console.log(i, subchecks[i])
            if (tiles[i]) {
                tiles[i]--;
                save[i] = getWaiting(subchecks[i]);
                tiles[i]++;
                const { ans, gans } = save[i];
                if (gans !== undefined) {
                    const bcnt = countWaitingCards(tiles, ans);
                    const gcnt = countWaitingCards(tiles, gans);
                    if (ans.length > 0 || gans.length > 0) cnts.push({ cnt: bcnt + gcnt, bcnt, gcnt, id: i });
                } else {
                    const cnt = countWaitingCards(tiles, ans);
                    if (ans.length > 0) cnts.push({ cnt: cnt, id: i });
                }
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
    }
    return table_head + result + table_tail;
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
    output += printWaiting(tiles, tcnt, full_tcnt, (subcheck) => normalWaiting(tiles, step, full_tcnt, subcheck), () => normalSubcheck(tiles, step, full_tcnt));
    return { output, step };
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
    output += printWaiting(tiles, tcnt, full_tcnt, (subcheck) => JPWaiting(tiles, stepJP, substep, full_tcnt, subcheck), () => JPSubcheck(tiles, stepJP, substep, full_tcnt));
    return { output, step13 };
}
function GBStep(tiles, tcnt, full_tcnt, step, step13) {
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
    output += printWaiting(tiles, tcnt, full_tcnt, (subcheck) => GBWaiting(tiles, stepGB, substep, full_tcnt, subcheck), () => GBSubcheck(tiles, stepGB, substep, full_tcnt));
    return { output };
}
function TWStep(tiles, tcnt, full_tcnt, step) {
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
    output += printWaiting(tiles, tcnt, full_tcnt, (subcheck) => TWWaiting(tiles, stepTW, substep, full_tcnt, subcheck), () => TWSubcheck(tiles, stepTW, substep, full_tcnt));
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
            let { step, step13 } = e.data;
            result = GBStep(tiles, tcnt, full_tcnt, step, step13);
            break;
        }
        case 3: {
            let { step } = e.data;
            result = TWStep(tiles, tcnt, full_tcnt, step);
            break;
        }
    }
    const ed = new Date();
    postMessage({ result, time: ed - st });
};
