importScripts("mahjong.js");
let table_head = '<table style="vertical-align: middle; border-collapse: collapse; padding: 0px;">';
let table_tail = "</table>";
function cardImage(id) {
    return `<img src="./cards/a${cardName(id)}.gif" style="vertical-align: middle;">`;
}
function printWaiting(tiles, tcnt, full_tcnt, getWaiting) {
    let result = "";
    if (full_tcnt !== tcnt) {
        const ans = getWaiting();
        const cnt = countWaitingCards(tiles, ans);
        result += `<td style="white-space: nowrap; padding-left: 0px;">待 ${cnt} 枚</td><td style="padding-left: 10px;">` + ans.map(cardImage).join("") + "</td>";
    } else {
        const ans = Array(sizeAT)
            .fill(null)
            .map(() => []);
        const cnts = [];
        for (let i = 0; i < sizeAT; ++i)
            if (tiles[i]) {
                tiles[i]--;
                ans[i] = getWaiting();
                const cnt = countWaitingCards(tiles, ans[i]);
                if (ans[i].length > 0) cnts.push({ cnt: cnt, id: i });
                tiles[i]++;
            }
        cnts.sort((a, b) => b.cnt - a.cnt);
        for (const { cnt, id } of cnts) result += `<tr><td style="white-space: nowrap; padding-left: 0px;">${(id >= 34 && id < 42) || id == 50 ? "补" : "打"} ${cardImage(id)} 待 ${cnt} 枚</td><td style="padding-left: 10px;">` + ans[id].map(cardImage).join("") + "</td></tr>";
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
    output += printWaiting(tiles, tcnt, full_tcnt, function () {
        return normalWaiting(tiles, step, full_tcnt);
    });
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
    output += printWaiting(tiles, tcnt, full_tcnt, function () {
        return JPWaiting(tiles, stepJP, [step4, step7JP, step13], full_tcnt);
    });
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
    output += printWaiting(tiles, tcnt, full_tcnt, function () {
        return GBWaiting(tiles, stepGB, [step, step7GB, step13, step16, stepkd], full_tcnt);
    });
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
    output += printWaiting(tiles, tcnt, full_tcnt, function () {
        return TWWaiting(tiles, stepTW, [step, stepnico, step13, step16], full_tcnt);
    });
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
