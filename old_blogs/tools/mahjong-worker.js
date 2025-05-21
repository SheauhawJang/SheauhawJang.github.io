importScripts("mahjong.js");
const table_head = '<table style="border-collapse: collapse; padding: 0px">';
const table_tail = "</table>";
function cardImage(id) {
    return `<img src="./cards/a${cardName(id)}.gif" style="vertical-align: middle;">`;
}
function cardImageDivide(id) {
    return `<img src="./cards/${cardName(id)}.gif">`;
}
const divideSpace = `<div class="card-div card-padding"></div>`;
function printWaiting(tiles, tcnt, full_tcnt, getWaiting, getSubchecks) {
    let result = "";
    if (full_tcnt !== tcnt) {
        const save = getWaiting(undefined, undefined, (s) => s);
        const { ans, gans } = save;
        if (gans !== undefined) {
            const bcnt = CountWaitingCards(tiles, ans);
            const gcnt = CountWaitingCards(tiles, gans);
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
            const cnt = CountWaitingCards(tiles, ans);
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
                const bcnt = CountWaitingCards(tiles, ans);
                const gcnt = CountWaitingCards(tiles, gans);
                if (checked) cnts.push({ cnt: bcnt + gcnt, bcnt, gcnt, id: i });
            } else {
                const cnt = CountWaitingCards(tiles, ans);
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
function getWinningLine(cards) {
    return cards.map((b) => b.map(cardImageDivide).join("")).join(divideSpace);
}
function normalStep(tiles, tcnt, full_tcnt) {
    let step = Step(tiles, tcnt, full_tcnt);
    let output = getWaitingType(step) + "\n";
    postMessage({ output, brief: getWaitingType(step) });
    const r = printWaiting(
        tiles,
        tcnt,
        full_tcnt,
        (d, g) => NormalWaiting(tiles, step, full_tcnt, d, g),
        () => NormalPrecheck(tiles, step, full_tcnt)
    );
    output += r.output;
    let dvd = undefined;
    if (step === -1) {
        postMessage({ output });
        dvd = windvd(tiles, full_tcnt);
        const ots = WinOutput(tiles, full_tcnt, dvd.dvd, 10);
        output += "和牌拆解: \n";
        output += ots.map((a) => `<div class="card-container">${getWinningLine(a)}</div>`).join("");
        if (ots.length < dvd.cnt) output += `以及其他 ${dvd.cnt - ots.length} 种和牌拆解方式`;
    }
    return { output, step, save: r.ans, dvd };
}
function JPStep(tiles, tcnt, full_tcnt, dvd) {
    let table = "";
    let step4 = Step(tiles, tcnt, full_tcnt, 4);
    table += '<tr><td style="padding-left: 0px;">一般型：</td><td>' + getWaitingType(step4) + "</td></tr>";
    postMessage({ output: table_head + table + table_tail });
    let stepJP = step4;
    let step7, step13;
    if (full_tcnt === 14) {
        step7 = PairStep(tiles, true);
        table += '<tr><td style="padding-left: 0px;">七对型：</td><td>' + getWaitingType(step7) + "</td></tr>";
        postMessage({ output: table_head + table + table_tail });
        stepJP = Math.min(stepJP, step7);
        step13 = OrphanStep(tiles);
        table += '<tr><td style="padding-left: 0px;">国士无双型：</td><td>' + getWaitingType(step13) + "</td></tr>";
        postMessage({ output: table_head + table + table_tail });
        stepJP = Math.min(stepJP, step13);
    }
    let output = getWaitingType(stepJP);
    let stepTypeJP = [];
    if (step4 == stepJP) stepTypeJP.push("一般型");
    if (full_tcnt == 14) {
        if (step7 == stepJP) stepTypeJP.push("七对型");
        if (step13 == stepJP) stepTypeJP.push("国士无双型");
    }
    output += ` （` + stepTypeJP.join("／") + `）\n`;
    let brief = output;
    output += table_head + table + table_tail;
    postMessage({ output, brief });
    const substep = [step4, step7, step13];
    output += printWaiting(
        tiles,
        tcnt,
        full_tcnt,
        (d, g) => JPWaiting(tiles, stepJP, substep, full_tcnt, d, g),
        () => JPPrecheck(tiles, stepJP, substep, full_tcnt)
    ).output;
    let dvd7 = undefined,
        dvd13 = undefined;
    if (stepJP === -1) {
        postMessage({ output });
        let odvd = [];
        let cnt = 0;
        if (step7 === -1) {
            ++cnt;
            dvd7 = PairOutput(tiles);
            odvd.push(`<div class="waiting-brief">七对型和牌：</div><div class="card-container">${getWinningLine(dvd7)}</div>`);
        }
        if (step13 === -1) {
            ++cnt;
            dvd13 = OrphanOutput(tiles);
            odvd.push(`<div class="waiting-brief">国士无双型和牌：</div><div class="card-container">${getWinningLine(dvd13)}</div>`);
        }
        if (step4 === -1) {
            cnt += dvd.cnt;
            const ots = WinOutput(tiles, full_tcnt, dvd.dvd, 10 - odvd.length);
            odvd = [...ots.map((a) => `<div class="waiting-brief">一般型和牌：</div><div class="card-container">${getWinningLine(a)}</div>`), ...odvd];
        }
        output += "和牌拆解: \n";
        output += `<div class="win-grid">${odvd.join("")}</div>`;
        if (odvd.length < cnt) output += `以及其他 ${cnt - odvd.length} 种和牌拆解方式`;
    }
    return { output, step13, dvd7, dvd13 };
}
function GBStep(tiles, tcnt, full_tcnt, step, save, step13, dvd, dvd7, dvd13) {
    let table = "";
    let stepGB = step;
    table += '<tr><td style="padding-left: 0px;">一般型：</td><td>' + getWaitingType(step) + "</td></tr>";
    postMessage({ output: table_head + table + table_tail });
    let step7, step16, stepkd;
    if (full_tcnt === 14) {
        step7 = PairStep(tiles, false);
        table += '<tr><td style="padding-left: 0px;">七对型：</td><td>' + getWaitingType(step7) + "</td></tr>";
        table += '<tr><td style="padding-left: 0px;">十三幺型：</td><td>' + getWaitingType(step13) + "</td></tr>";
        postMessage({ output: table_head + table + table_tail });
        stepGB = Math.min(stepGB, step7);
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
        if (step7 == stepGB) stepTypeGB.push("七对型");
        if (step13 == stepGB) stepTypeGB.push("十三幺型");
        if (step16 == stepGB) stepTypeGB.push("全不靠型");
    }
    if (full_tcnt >= 9 && stepkd == stepGB) stepTypeGB.push("组合龙型");
    output += ` （` + stepTypeGB.join("／") + `）\n`;
    let brief = output;
    output += table_head + table + table_tail;
    postMessage({ output, brief });
    const substep = [step, step7, step13, step16, stepkd];
    output += printWaiting(
        tiles,
        tcnt,
        full_tcnt,
        (d, g, f) => GBWaiting(tiles, stepGB, substep, full_tcnt, f(save.waiting), d, g),
        () => GBPrecheck(tiles, stepGB, substep, full_tcnt, save.subchecks)
    ).output;
    if (stepGB === -1) {
        postMessage({ output });
        let odvd = [];
        let cnt = 0;
        if (step7 === -1) {
            ++cnt;
            if (dvd7 === undefined) dvd7 = PairOutput(tiles);
            odvd.push(`<div class="waiting-brief">七对型和牌：</div><div class="card-container">${getWinningLine(dvd7)}</div>`);
        }
        if (step13 === -1) {
            ++cnt;
            odvd.push(`<div class="waiting-brief">十三幺型和牌：</div><div class="card-container">${getWinningLine(dvd13)}</div>`);
        }
        if (step16 === -1) {
            const ots = Bukao16Output(tiles);
            cnt += ots.length;
            odvd = [...odvd, ...ots.map((a) => `<div class="waiting-brief">全不靠型和牌：</div><div class="card-container">${getWinningLine(a)}</div>`)];
        }
        if (stepkd === -1) {
            let opt_size = 10 - odvd.length;
            if (step === -1) --opt_size;
            const ans = KDragonOutput(tiles, full_tcnt, opt_size);
            cnt += ans.cnt;
            odvd = [...odvd, ...ans.ots.map((a) => `<div class="waiting-brief">组合龙型和牌：</div><div class="card-container">${getWinningLine(a)}</div>`)];
        }
        if (step === -1) {
            cnt += dvd.cnt;
            const ots = WinOutput(tiles, full_tcnt, dvd.dvd, Math.max(10 - odvd.length, 1));
            odvd = [...ots.map((a) => `<div class="waiting-brief">一般型和牌：</div><div class="card-container">${getWinningLine(a)}</div>`), ...odvd];
        }
        output += "和牌拆解: \n";
        output += `<div class="win-grid">${odvd.join("")}</div>`;
        if (odvd.length < cnt) output += `以及其他 ${cnt - odvd.length} 种和牌拆解方式`;
    }
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
            result = JPStep(tiles, tcnt, full_tcnt, e.data.dvd);
            break;
        case 2: {
            let { step, save, step13, dvd, dvd7, dvd13 } = e.data;
            result = GBStep(tiles, tcnt, full_tcnt, step, save, step13, dvd, dvd7, dvd13);
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
