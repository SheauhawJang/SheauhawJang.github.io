importScripts("mahjong.js");
importScripts("mahjong-score.js");
importScripts("mahjong-worker-lang.js");
const table_head = '<table style="border-collapse: collapse; padding: 0px">';
const table_tail = "</table>";
function cardImage(id) {
    return `<img src="./cards/a${cardName(id)}.gif" style="vertical-align: middle;">`;
}
function cardImageDivide(id) {
    return `<img src="./cards/${cardName(id)}.gif">`;
}
const divideSpace = `<div class="card-div card-padding"></div>`;
function printWaiting(tiles, tcnt, full_tcnt, subtiles, getWaiting, getSubchecks) {
    let result = "";
    if (full_tcnt !== tcnt) {
        const save = getWaiting(undefined, undefined, (s) => s);
        const { ans, gans } = save;
        if (gans !== undefined) {
            const bcnt = CountWaitingCards(tiles, subtiles, ans);
            const gcnt = CountWaitingCards(tiles, subtiles, gans);
            const cnt = gcnt + bcnt;
            const ratio = (gcnt / cnt) * 100;
            result += `<td class="waiting-brief">${loc.wait} ${cnt} ${loc.counts}</td>` + `<td class="devided-waiting-td">` + `<div style="display: flex; white-space: nowrap;"><div class="devided-waiting-brief">${loc.goodshape} ${gcnt} ${loc.counts}</div>` + `<div class="devided-waiting-cards">${gans.map(cardImage).join("")}</div></div>` + `<div style="display: flex; white-space: nowrap;"><div class="devided-waiting-brief">${loc.badshape} ${bcnt} ${loc.counts}</div>` + `<div class="devided-waiting-cards">${ans.map(cardImage).join("")}</div></div>` + `<div class="devided-waiting-brief">${loc.goodshaperate} ${ratio.toFixed(2)}%</div></td>`;
        } else {
            const cnt = CountWaitingCards(tiles, subtiles, ans);
            result += `<td class="waiting-brief">${loc.wait} ${cnt} ${loc.counts}</td><td style="padding-left: 10px;">${ans.map(cardImage).join("")}</td>`;
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
                const bcnt = CountWaitingCards(tiles, subtiles, ans);
                const gcnt = CountWaitingCards(tiles, subtiles, gans);
                if (checked) cnts.push({ cnt: bcnt + gcnt, bcnt, gcnt, id: i });
            } else {
                const cnt = CountWaitingCards(tiles, subtiles, ans);
                if (checked) cnts.push({ cnt: cnt, id: i });
            }
        }
        cnts.sort((a, b) => {
            if (b.cnt !== a.cnt) return b.cnt - a.cnt;
            if ("gcnt" in a && "gcnt" in b) return b.gcnt - a.gcnt;
            return 0;
        });
        for (const { cnt, bcnt, gcnt, id } of cnts) {
            const verb = (id >= 34 && id < 42) || id == 50 ? loc.bu : loc.da;
            if (gcnt !== undefined) {
                const ratio = (gcnt / cnt) * 100;
                result += `<tr><td class="waiting-brief">${verb} ${cardImage(id)} ${loc.wait} ${cnt} ${loc.counts}</td>` + `<td class="devided-waiting-td">` + `<div style="display: flex; white-space: nowrap;"><div class="devided-waiting-brief">${loc.goodshape} ${gcnt} ${loc.counts}</div>` + `<div class="devided-waiting-cards">${save[id].gans.map(cardImage).join("")}</div></div>` + `<div style="display: flex; white-space: nowrap;"><div class="devided-waiting-brief">${loc.badshape} ${bcnt} ${loc.counts}</div>` + `<div class="devided-waiting-cards">${save[id].ans.map(cardImage).join("")}</div></div>` + `<div class="devided-waiting-brief">${loc.goodshaperate} ${ratio.toFixed(2)}%</div></td></tr>`;
            } else result += `<tr><td class="waiting-brief">${verb} ${cardImage(id)} ${loc.wait} ${cnt} ${loc.counts}</td>` + `<td style="padding-left: 10px;">${save[id].ans.map(cardImage).join("")}</td></tr>`;
        }
        return { output: table_head + result + table_tail, ans: { waiting: save, subchecks } };
    }
}
function getWaitingType(step) {
    if (step === -1) return loc.win;
    else if (step === 0) return loc.ready;
    else return step + " " + loc.steps;
}
function getWinningLine(cards) {
    return cards.map((b) => b.map(cardImageDivide).join("")).join(divideSpace);
}
function normalStep(tiles, tcnt, full_tcnt, subtiles) {
    let step = Step(tiles, tcnt, full_tcnt);
    let output = getWaitingType(step) + "\n";
    postMessage({ output, brief: getWaitingType(step) });
    let dvd = undefined;
    if (step === -1 && full_tcnt > 0) {
        dvd = windvd(tiles, full_tcnt);
        const ots = WinOutput(tiles, full_tcnt, dvd.dvd, 10);
        output += loc.windvd + ": \n";
        output += ots.map((a) => `<div class="card-container">${getWinningLine(a)}</div>`).join("");
        if (ots.length < dvd.cnt) output += `${loc.windvd_else_head} ${dvd.cnt - ots.length} ${loc.windvd_else_tail}`;
    }
    const r = printWaiting(
        tiles,
        tcnt,
        full_tcnt,
        subtiles,
        (d, g) => NormalWaiting(tiles, step, full_tcnt, d, g),
        () => NormalPrecheck(tiles, step, full_tcnt)
    );
    output += r.output;
    return { output, step, save: r.ans, dvd };
}
function JPStep(tiles, tcnt, full_tcnt, subtiles, subcnt, dvd) {
    let table = "";
    let step4 = Step(tiles, tcnt, full_tcnt, 4);
    table += `<tr><td style="padding-left: 0px;">${loc.normal}${loc.colon}</td><td>${getWaitingType(step4)}</td></tr>`;
    postMessage({ output: table_head + table + table_tail });
    let stepJP = step4;
    let step7 = Infinity,
        step13 = Infinity;
    if (full_tcnt === 14 && subcnt === 0) {
        step7 = PairStep(tiles, true);
        table += `<tr><td style="padding-left: 0px;">${loc.pair7}${loc.colon}</td><td>${getWaitingType(step7)}</td></tr>`;
        postMessage({ output: table_head + table + table_tail });
        stepJP = Math.min(stepJP, step7);
        step13 = OrphanStep(tiles);
        table += `<tr><td style="padding-left: 0px;">${loc.kokushi}${loc.colon}</td><td>${getWaitingType(step13)}</td></tr>`;
        postMessage({ output: table_head + table + table_tail });
        stepJP = Math.min(stepJP, step13);
    }
    let output = getWaitingType(stepJP);
    let stepTypeJP = [];
    if (step4 == stepJP) stepTypeJP.push(loc.normal);
    if (step7 === stepJP) stepTypeJP.push(loc.pair7);
    if (step13 === stepJP) stepTypeJP.push(loc.kokushi);
    output += ` ${loc.brace_left}${stepTypeJP.join(loc.slash)}${loc.brace_right}\n`;
    let brief = output;
    output += table_head + table + table_tail;
    postMessage({ output, brief });
    let dvd7 = undefined,
        dvd13 = undefined;
    if (stepJP === -1 && full_tcnt > 0) {
        let odvd = [];
        let cnt = 0;
        if (step7 === -1) {
            ++cnt;
            dvd7 = PairOutput(tiles);
            odvd.push(`<div class="waiting-brief">${loc.pair7}${loc.colon}</div><div class="card-container">${getWinningLine(dvd7)}</div>`);
        }
        if (step13 === -1) {
            ++cnt;
            dvd13 = OrphanOutput(tiles);
            odvd.push(`<div class="waiting-brief">${loc.kokushi}${loc.colon}</div><div class="card-container">${getWinningLine(dvd13)}</div>`);
        }
        if (step4 === -1) {
            cnt += dvd.cnt;
            const ots = WinOutput(tiles, full_tcnt, dvd.dvd, 10 - odvd.length);
            odvd = [...ots.map((a) => `<div class="waiting-brief">${loc.normal}${loc.colon}</div><div class="card-container">${getWinningLine(a)}</div>`), ...odvd];
        }
        output += loc.windvd + ": \n";
        output += `<div class="win-grid">${odvd.join("")}</div>`;
        if (odvd.length < cnt) output += `${loc.windvd_else_head} ${cnt - odvd.length} ${loc.windvd_else_tail}`;
    }
    const substep = [step4, step7, step13];
    output += printWaiting(
        tiles,
        tcnt,
        full_tcnt,
        subtiles,
        (d, g) => JPWaiting(tiles, stepJP, substep, full_tcnt, d, g),
        () => JPPrecheck(tiles, stepJP, substep, full_tcnt)
    ).output;
    return { output, substep, dvd7, dvd13 };
}
function GBStep(tiles, tcnt, full_tcnt, subtiles, subcnt, step, save, step13, dvd, dvd7, dvd13) {
    let table = "";
    let stepGB = step;
    table += `<tr><td style="padding-left: 0px;">${loc.normal}${loc.colon}</td><td>${getWaitingType(step)}</td></tr>`;
    postMessage({ output: table_head + table + table_tail });
    let step7 = Infinity,
        step16 = Infinity,
        stepkd = Infinity;
    if (full_tcnt === 14 && subcnt === 0) {
        step7 = PairStep(tiles, false);
        table += `<tr><td style="padding-left: 0px;">${loc.pair7}${loc.colon}</td><td>${getWaitingType(step7)}</td></tr>`;
        table += `<tr><td style="padding-left: 0px;">${loc.orphan13}${loc.colon}</td><td>${getWaitingType(step13)}</td></tr>`;
        postMessage({ output: table_head + table + table_tail });
        stepGB = Math.min(stepGB, step7);
        stepGB = Math.min(stepGB, step13);
        step16 = full_tcnt - 1 - Bukao16Count(tiles);
        table += `<tr><td style="padding-left: 0px;">${loc.quanbukaoxing}${loc.colon}</td><td>${getWaitingType(step16)}</td></tr>`;
        postMessage({ output: table_head + table + table_tail });
        stepGB = Math.min(stepGB, step16);
    }
    if (full_tcnt >= 9) {
        stepkd = KDragonStep(tiles, tcnt);
        table += `<tr><td style="padding-left: 0px;">${loc.zuhelongxing}${loc.colon}</td><td>${getWaitingType(stepkd)}</td></tr>`;
        postMessage({ output: table_head + table + table_tail });
        stepGB = Math.min(stepGB, stepkd);
    }
    let output = getWaitingType(stepGB);
    let stepTypeGB = [];
    if (step == stepGB) stepTypeGB.push(loc.normal);
    if (step7 === stepGB) stepTypeGB.push(loc.pair7);
    if (step13 === stepGB) stepTypeGB.push(loc.orphan13);
    if (step16 === stepGB) stepTypeGB.push(loc.quanbukaoxing);
    if (stepkd == stepGB) stepTypeGB.push(loc.zuhelongxing);
    output += ` ${loc.brace_left}${stepTypeGB.join(loc.slash)}${loc.brace_right}\n`;
    let brief = output;
    output += table_head + table + table_tail;
    postMessage({ output, brief });
    if (stepGB === -1 && full_tcnt > 0) {
        postMessage({ output });
        let odvd = [];
        let cnt = 0;
        if (step7 === -1) {
            ++cnt;
            if (dvd7 === undefined) dvd7 = PairOutput(tiles);
            odvd.push(`<div class="waiting-brief">${loc.pair7}${loc.colon}</div><div class="card-container">${getWinningLine(dvd7)}</div>`);
        }
        if (step13 === -1) {
            ++cnt;
            odvd.push(`<div class="waiting-brief">${loc.orphan13}${loc.colon}</div><div class="card-container">${getWinningLine(dvd13)}</div>`);
        }
        if (step16 === -1) {
            const ots = Bukao16Output(tiles);
            cnt += ots.length;
            odvd = [...odvd, ...ots.map((a) => `<div class="waiting-brief">${loc.quanbukaoxing}${loc.colon}</div><div class="card-container">${getWinningLine(a)}</div>`)];
        }
        if (stepkd === -1) {
            let opt_size = 10 - odvd.length;
            if (step === -1) --opt_size;
            const ans = KDragonOutput(tiles, full_tcnt, opt_size);
            cnt += ans.cnt;
            odvd = [...odvd, ...ans.ots.map((a) => `<div class="waiting-brief">${loc.zuhelongxing}${loc.colon}</div><div class="card-container">${getWinningLine(a)}</div>`)];
        }
        if (step === -1) {
            cnt += dvd.cnt;
            const ots = WinOutput(tiles, full_tcnt, dvd.dvd, Math.max(10 - odvd.length, 1));
            odvd = [...ots.map((a) => `<div class="waiting-brief">${loc.normal}${loc.colon}</div><div class="card-container">${getWinningLine(a)}</div>`), ...odvd];
        }
        output += loc.windvd + ": \n";
        output += `<div class="win-grid">${odvd.join("")}</div>`;
        if (odvd.length < cnt) output += `${loc.windvd_else_head} ${cnt - odvd.length} ${loc.windvd_else_tail}`;
    }
    const substep = [step, step7, step13, step16, stepkd];
    const r = printWaiting(
        tiles,
        tcnt,
        full_tcnt,
        subtiles,
        (d, g, f) => GBWaiting(tiles, stepGB, substep, full_tcnt, f(save.waiting), d, g),
        () => GBPrecheck(tiles, stepGB, substep, full_tcnt, save.subchecks)
    );
    output += r.output;
    return { output, substep, save: r.ans };
}
function TWStep(tiles, tcnt, full_tcnt, subtiles, subcnt, step, save, dvd) {
    let table = "";
    let stepTW = step;
    table += `<tr><td style="padding-left: 0px;">${loc.normal}${loc.colon}</td><td>${getWaitingType(step)}</td></tr>`;
    postMessage({ output: table_head + table + table_tail });
    let step13 = Infinity,
        step16 = Infinity,
        stepnico = Infinity;
    if (full_tcnt === 17 && subcnt === 0) {
        stepnico = NiconicoStep(tiles);
        table += `<tr><td style="padding-left: 0px;">${loc.niconico}${loc.colon}</td><td>${getWaitingType(stepnico)}</td></tr>`;
        stepTW = Math.min(stepTW, stepnico);
        postMessage({ output: table_head + table + table_tail });
        step13 = OrphanMeldStep(tiles);
        table += `<tr><td style="padding-left: 0px;">${loc.orphan13}${loc.colon}</td><td>${getWaitingType(step13)}</td></tr>`;
        postMessage({ output: table_head + table + table_tail });
        stepTW = Math.min(stepTW, step13);
        step16 = Buda16Step(tiles);
        table += `<tr><td style="padding-left: 0px;">${loc.shiliubudaxing}${loc.colon}</td><td>${getWaitingType(step16)}</td></tr>`;
        postMessage({ output: table_head + table + table_tail });
        stepTW = Math.min(stepTW, step16);
    }
    let output = getWaitingType(stepTW);
    let stepTypeTW = [];
    if (step == stepTW) stepTypeTW.push(loc.normal);
    if (stepnico == stepTW) stepTypeTW.push(loc.niconico);
    if (step13 == stepTW) stepTypeTW.push(loc.orphan13);
    if (step16 == stepTW) stepTypeTW.push(loc.shiliubudaxing);
    output += ` ${loc.brace_left}${stepTypeTW.join(loc.slash)}${loc.brace_right}\n`;
    let brief = output;
    output += table_head + table + table_tail;
    postMessage({ output, brief });
    if (stepTW === -1 && full_tcnt > 0) {
        postMessage({ output });
        let odvd = [];
        let cnt = 0;
        if (stepnico === -1) {
            const ots = NiconicoOutput(tiles);
            cnt += ots.length;
            odvd = ots.map((a) => `<div class="waiting-brief">${loc.niconico}${loc.colon}</div><div class="card-container">${getWinningLine(a)}</div>`);
        }
        if (step13 === -1) {
            const ots = OrphanMeldOutput(tiles);
            cnt += ots.length;
            odvd = [...odvd, ...ots.map((a) => `<div class="waiting-brief">${loc.orphan13}${loc.colon}</div><div class="card-container">${getWinningLine(a)}</div>`)];
        }
        if (step16 === -1) {
            ++cnt;
            odvd.push(`<div class="waiting-brief">${loc.shiliubudaxing}${loc.colon}</div><div class="card-container">${getWinningLine(Buda16Output(tiles))}</div>`);
        }
        if (step === -1) {
            cnt += dvd.cnt;
            const ots = WinOutput(tiles, full_tcnt, dvd.dvd, Math.max(10 - odvd.length, 1));
            odvd = [...ots.map((a) => `<div class="waiting-brief">${loc.normal}${loc.colon}</div><div class="card-container">${getWinningLine(a)}</div>`), ...odvd];
        }
        output += loc.windvd + ": \n";
        output += `<div class="win-grid">${odvd.join("")}</div>`;
        if (odvd.length < cnt) output += `${loc.windvd_else_head} ${cnt - odvd.length} ${loc.windvd_else_tail}`;
    }
    const substep = [step, stepnico, step13, step16];
    output += printWaiting(
        tiles,
        tcnt,
        full_tcnt,
        subtiles,
        (d, g, f) => TWWaiting(tiles, stepTW, substep, full_tcnt, f(save.waiting), d, g),
        () => TWPrecheck(tiles, stepTW, substep, full_tcnt, save.subchecks)
    ).output;
    return { output, substep };
}
function GetFanDiv(fan) {
    let fans = new Array(84).fill(0);
    for (let i = 0; i < fan.length; ++i)
        if (fan[i] > 0) ++fans[fan[i]];
        else --fans[-fan[i]];

    fans[60] += fans[83];
    fans[61] += fans[83];
    let fanopt = [];
    for (let i = 1; i <= 82; ++i) if (fans[i]) fanopt.push(`<tr><td style="text-align: left">${loc[`GB_FANNAME_${i}`]}</td><td style="text-align: right; padding-left: 10px">${GBScoreArray[i]}${loc.GB_FAN_unit}</td><td>${fans[i] > 1 ? `×${fans[i]}` : ""}</td></tr>`);

    return `${table_head}${fanopt.join("")}${table_tail}`;
}
function GBScore(aids, substeps, save, gw, mw, wt, info) {
    let infov = 0;
    let infof = [];
    if (info.includes(44))
        if (wt) (infov += 8), infof.push((wt = 45));
        else (info += 8), infof.push(44);
    if (info.includes(46) && wt) (infov += 8), infof.push((wt = 46));
    if (!info.includes(44) && info.includes(47) && !wt) (infov += 8), infof.push(47);
    else if (info.includes(58)) (infov += 4), infof.push(58);
    //if (aids[0].length === 0) return { output: "", outputs: "" };
    const wint = aids[0].at(-1)?.id;
    let listen_cnt = save.waiting[wint]?.ans.length ?? 999;
    let gans = { val: 0, fan: [] };
    let cm = 0, m = 0, p0;
    if (substeps[0] === -1) {
        p0 = PreAllMelds(aids);
        m = p0.nots * p0.nsubots;
    }
    function cal(ots, subots, ck, ek, others = []) {
        let cp = 0;
        let wintf = 0;
        for (let k = 0; k < ots.length; ++k)
            if (ots[k].length === 1) ++cp;
            else {
                if (wintf) continue;
                if (ots[k].length === 2) {
                    if (isJokerEqual(ots[k][0], wint)) wintf = 79;
                } else if (isJokerEqual(ots[k][0], wint)) wintf = 77;
                else if (isJokerEqual(ots[k][1], wint)) wintf = 78;
                else if (isJokerEqual(ots[k][2], wint)) wintf = 77;
            }
        if (wint && !wt && !wintf) --cp;
        let ans = GBKernel([...ots, ...subots, ...others], aids, ck, ek, cp, mw, gw, wt);
        if (listen_cnt < 2 && wintf) ++ans.val, ans.fan.push(wintf);
        ans.val += infov;
        ans.fan = [...ans.fan, ...infof];
        if (ans.val + infov > gans.val) gans = ans;
        ++cm;
        if (!(cm & 131071)) {
            const t = new Date() - st;
            const predict_t = Math.round((t * m) / cm);
            const rate = (cm / m) * 100;
            let debug = `Calculating...... / Calculated ${rate.toFixed(2)}% / Used ${t} ms / Estimated ${predict_t} ms / Remaining ${predict_t - t} ms`;
            postMessage({ debug, output: `${loc.at_least}${gans.val + aids[2].length}${loc.GB_FAN_unit}\n${GetFanDiv([...gans.fan, ...Array(aids[2].length).fill(81)])}` });
        }
    }
    const st = new Date();
    if (substeps[0] === -1) {
        const nmp = Math.ceil(aids[0].length / 3) + aids[1].length;
        const { err, itots, itsubots, ek, ck } = p0;
        if (err === 1) return loc.subtile_error_1;
        if (err === 2) return loc.subtile_error_2;
        if (aids[0].length === 2 && ck === 0 && !wt && nmp >= 5) (listen_cnt = 999), (infov += 6), infof.push(52);
        if (aids[0].length === 2 && aids[1].length === 4 && ck + ek === 4) listen_cnt = 999;
        itots((ots) => itsubots((subots) => cal(ots, subots, ck, ek)));
        if (gans.val === 0 && nmp >= 5) {
            gans.val = 8;
            gans.fan = [43];
        }
        gans.val += aids[2].length;
        gans.fan.push(...Array(aids[2].length).fill(81));
    }
    let ptchange = wt ? `自家+${gans.val * 3 + 24}，他家-${gans.val + 8}` : `自家+${gans.val + 24}，铳家-${gans.val + 8}，他家-8`;
    outputs = [`${gans.val}${loc.GB_FAN_unit}`, "\n", GetFanDiv(gans.fan), ptchange];
    console.log(gans.fan);
    return { output: outputs.join(""), brief: `${outputs[0]}${loc.brace_left}${outputs[2]}${loc.brace_right}` };
}
self.onmessage = function (e) {
    if (e.data.lang) setLoc(e.data.lang);
    let task = e.data.task;
    let result;
    const st = new Date();
    switch (task) {
        case 0: {
            let { tiles, tcnt, full_tcnt, subtiles, subcnt } = e.data;
            result = normalStep(tiles, tcnt, full_tcnt, subtiles, subcnt);
            break;
        }
        case 1: {
            let { tiles, tcnt, full_tcnt, subtiles, subcnt, dvd } = e.data;
            result = JPStep(tiles, tcnt, full_tcnt, subtiles, subcnt, dvd);
            break;
        }
        case 2: {
            let { tiles, tcnt, full_tcnt, subtiles, subcnt, step, save, step13, dvd, dvd7, dvd13 } = e.data;
            result = GBStep(tiles, tcnt, full_tcnt, subtiles, subcnt, step, save, step13, dvd, dvd7, dvd13);
            break;
        }
        case 3: {
            let { tiles, tcnt, full_tcnt, subtiles, subcnt, step, save, dvd } = e.data;
            result = TWStep(tiles, tcnt, full_tcnt, subtiles, subcnt, step, save, dvd);
            break;
        }
        case "gb-score": {
            let { aids, substeps, save, gw, mw, wt, info } = e.data;
            result = GBScore(aids, substeps, save, gw, mw, wt, info);
        }
    }
    const ed = new Date();
    postMessage({ result, time: ed - st });
};
