importScripts("mahjong.js");
importScripts("mahjong-score.js");
importScripts("mahjong-worker-lang.js");
importScripts("mahjong-mmc.js");
//console.log(PrintSeq.map(i=>cn_loc[`JP_YAKUNAME_${i}`]).join('\n'));
const MAX_OUTPUT_LENGTH = 12;
const table_head = '<table style="border-collapse: collapse; padding: 0px">';
const table_tail = "</table>";
let aids = undefined;
let tiles, subtiles;
let tcnt, full_tcnt, subcnt;
function cardImage(id) {
    return `<img src="./cards/a${cardName(id)}.gif" style="vertical-align: middle;">`;
}
function cardImageDivide(id) {
    return `<div class="card-div"><img src="./cards/${cardName(id)}.gif" class="no-helper"></div>`;
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
            result += `<td class="waiting-brief">${loc.wait} ${cnt} ${loc.counts}</td><td class="devided-waiting-td"><div style="display: flex; white-space: nowrap;"><div class="devided-waiting-brief">${loc.goodshape} ${gcnt} ${loc.counts}</div><div class="devided-waiting-cards">${gans.map(cardImage).join("")}</div></div><div style="display: flex; white-space: nowrap;"><div class="devided-waiting-brief">${loc.badshape} ${bcnt} ${loc.counts}</div><div class="devided-waiting-cards">${ans.map(cardImage).join("")}</div></div><div class="devided-waiting-brief">${loc.goodshaperate} ${ratio.toFixed(2)}%</div></td>`;
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
            save[i] = getWaiting(dischecks[i], getchecks, (s) => s?.[i]);
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
            const verb = isFlower(id) ? loc.bu : loc.da;
            if (gcnt !== undefined) {
                const ratio = (gcnt / cnt) * 100;
                result += `<tr><td class="waiting-brief">${verb} ${cardImage(id)} ${loc.wait} ${cnt} ${loc.counts}</td><td class="devided-waiting-td"><div style="display: flex; white-space: nowrap;"><div class="devided-waiting-brief">${loc.goodshape} ${gcnt} ${loc.counts}</div><div class="devided-waiting-cards">${save[id].gans.map(cardImage).join("")}</div></div><div style="display: flex; white-space: nowrap;"><div class="devided-waiting-brief">${loc.badshape} ${bcnt} ${loc.counts}</div><div class="devided-waiting-cards">${save[id].ans.map(cardImage).join("")}</div></div><div class="devided-waiting-brief">${loc.goodshaperate} ${ratio.toFixed(2)}%</div></td></tr>`;
            } else result += `<tr><td class="waiting-brief">${verb} ${cardImage(id)} ${loc.wait} ${cnt} ${loc.counts}</td><td style="padding-left: 10px;">${save[id].ans.map(cardImage).join("")}</td></tr>`;
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
function normalStep() {
    let step = Step(tiles, tcnt, full_tcnt);
    let output = getWaitingType(step) + "\n";
    postMessage({ output, brief: getWaitingType(step) });
    let dvd = undefined;
    if (step === -1 && full_tcnt > 0) {
        dvd = windvd(tiles, full_tcnt);
        const ots = WinOutput(tiles, full_tcnt, dvd.dvd, MAX_OUTPUT_LENGTH);
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
function JPStep(mask, rsubstep = Array(3).fill(Infinity), dvds = Array(3)) {
    let table = "";
    let substep = Array(3).fill(Infinity);
    if (rsubstep[0] === Infinity) rsubstep[0] = Step(tiles, tcnt, full_tcnt, 4);
    if (mask[0]) {
        substep[0] = rsubstep[0];
        table += `<tr><td style="padding-left: 0px;">${loc.normal}${loc.colon}</td><td>${getWaitingType(substep[0])}</td></tr>`;
        postMessage({ output: table_head + table + table_tail });
    }
    if (full_tcnt === 14 && subcnt === 0) {
        if (rsubstep[1] === Infinity) rsubstep[1] = PairStep(tiles, true);
        if (mask[1]) {
            substep[1] = rsubstep[1];
            table += `<tr><td style="padding-left: 0px;">${loc.pair7}${loc.colon}</td><td>${getWaitingType(substep[1])}</td></tr>`;
            postMessage({ output: table_head + table + table_tail });
        }
        if (rsubstep[2] === Infinity) rsubstep[2] = OrphanStep(tiles);
        if (mask[2]) {
            substep[2] = rsubstep[2];
            table += `<tr><td style="padding-left: 0px;">${loc.kokushi}${loc.colon}</td><td>${getWaitingType(substep[2])}</td></tr>`;
            postMessage({ output: table_head + table + table_tail });
        }
    }
    const stepJP = Math.min(...substep);
    if (stepJP === Infinity) return { output: "", brief: "", substep: rsubstep, dvds };
    let output = getWaitingType(stepJP);
    let stepTypeJP = [];
    if (substep[0] === stepJP) stepTypeJP.push(loc.normal);
    if (substep[1] === stepJP) stepTypeJP.push(loc.pair7);
    if (substep[2] === stepJP) stepTypeJP.push(loc.kokushi);
    output += `${loc.brace_left}${stepTypeJP.join(loc.slash)}${loc.brace_right}\n`;
    let brief = output;
    postMessage({ output: output + table_head + table + table_tail, brief });
    if (rsubstep[2] !== Infinity) {
        const k = OrphanCount(tiles).count;
        let status = loc.dame;
        if (k >= 9) status = loc.OK;
        else if (k === 8 && full_tcnt !== tcnt) status = loc.waiting;
        table += `<tr><td style="padding-left: 0px;">${loc.kyushukyuhai}${loc.colon}</td><td>${status}${loc.brace_left}${k} ${loc.shukyuhai}${loc.brace_right}</td></tr>`;
    }
    output += table_head + table + table_tail;
    postMessage({ output });
    if (stepJP === -1 && full_tcnt > 0) {
        let odvd = [];
        let cnt = 0;
        if (substep[1] === -1) {
            dvds[1] ??= PairOutput(tiles);
            ++cnt;
            odvd.push(`<div class="waiting-brief">${loc.pair7}${loc.colon}</div><div class="card-container">${getWinningLine(dvds[1])}</div>`);
        }
        if (substep[2] === -1) {
            dvds[2] ??= OrphanOutput(tiles);
            ++cnt;
            odvd.push(`<div class="waiting-brief">${loc.kokushi}${loc.colon}</div><div class="card-container">${getWinningLine(dvds[2])}</div>`);
        }
        if (substep[0] === -1) {
            dvds[0] ??= windvd(tiles, full_tcnt);
            if (MAX_OUTPUT_LENGTH - odvd.length < dvds[0].cnt) {
                ++cnt;
                odvd = [`<div class="waiting-brief">${loc.normal}${loc.colon}</div><div class="card-container">${dvds[0].cnt} ${loc.windvd_else_tail}</div>`, ...odvd];
            } else {
                cnt += dvds[0].cnt;
                const ots = WinOutput(tiles, full_tcnt, dvds[0].dvd, MAX_OUTPUT_LENGTH - odvd.length);
                odvd = [...ots.map((a) => `<div class="waiting-brief">${loc.normal}${loc.colon}</div><div class="card-container">${getWinningLine(a)}</div>`), ...odvd];
            }
        }
        output += loc.windvd + ": \n";
        output += `<div class="win-grid">${odvd.join("")}</div>`;
    }
    output += printWaiting(
        tiles,
        tcnt,
        full_tcnt,
        subtiles,
        (d, g) => JPWaiting(tiles, stepJP, substep, full_tcnt, d, g),
        () => JPPrecheck(tiles, stepJP, substep, full_tcnt)
    ).output;
    return { output, substep: rsubstep, dvds };
}
function JP3pStep(mask, rsubstep = Array(3).fill(Infinity), dvds = Array(3)) {
    let table = "";
    let substep = Array(3).fill(Infinity);
    if (rsubstep[0] === Infinity) rsubstep[0] = searchDp(tiles, 0, 0, full_tcnt, Infinity, 4, guse3p);
    if (mask[0]) {
        substep[0] = rsubstep[0];
        table += `<tr><td style="padding-left: 0px;">${loc.normal}${loc.colon}</td><td>${getWaitingType(substep[0])}</td></tr>`;
        postMessage({ output: table_head + table + table_tail });
    }
    if (full_tcnt === 14 && subcnt === 0) {
        if (rsubstep[1] === Infinity) rsubstep[1] = PairStep(tiles, true, guse3p);
        if (mask[1]) {
            substep[1] = rsubstep[1];
            table += `<tr><td style="padding-left: 0px;">${loc.pair7}${loc.colon}</td><td>${getWaitingType(substep[1])}</td></tr>`;
            postMessage({ output: table_head + table + table_tail });
        }
        if (rsubstep[2] === Infinity) rsubstep[2] = OrphanStep(tiles);
        if (mask[2]) {
            substep[2] = rsubstep[2];
            table += `<tr><td style="padding-left: 0px;">${loc.kokushi}${loc.colon}</td><td>${getWaitingType(substep[2])}</td></tr>`;
            postMessage({ output: table_head + table + table_tail });
        }
    }
    const step3p = Math.min(...substep);
    if (step3p === Infinity) return { output: "", brief: "", substep: rsubstep, dvds };
    let output = getWaitingType(step3p);
    let stepTypeJP = [];
    if (substep[0] === step3p) stepTypeJP.push(loc.normal);
    if (substep[1] === step3p) stepTypeJP.push(loc.pair7);
    if (substep[2] === step3p) stepTypeJP.push(loc.kokushi);
    output += `${loc.brace_left}${stepTypeJP.join(loc.slash)}${loc.brace_right}\n`;
    let brief = output;
    postMessage({ output: output + table_head + table + table_tail, brief });
    if (rsubstep[2] !== Infinity) {
        const k = OrphanCount(tiles).count;
        let status = loc.dame;
        if (k >= 9) status = loc.OK;
        else if (k === 8 && full_tcnt !== tcnt) status = loc.waiting;
        table += `<tr><td style="padding-left: 0px;">${loc.kyushukyuhai}${loc.colon}</td><td>${status}${loc.brace_left}${k} ${loc.shukyuhai}${loc.brace_right}</td></tr>`;
    }
    output += table_head + table + table_tail;
    postMessage({ output });
    if (step3p === -1 && full_tcnt > 0) {
        let odvd = [];
        let cnt = 0;
        if (substep[1] === -1) {
            dvds[1] ??= PairOutput(tiles);
            ++cnt;
            odvd.push(`<div class="waiting-brief">${loc.pair7}${loc.colon}</div><div class="card-container">${getWinningLine(dvds[1])}</div>`);
        }
        if (substep[2] === -1) {
            dvds[2] ??= OrphanOutput(tiles);
            ++cnt;
            odvd.push(`<div class="waiting-brief">${loc.kokushi}${loc.colon}</div><div class="card-container">${getWinningLine(dvds[2])}</div>`);
        }
        if (substep[0] === -1) {
            dvds[0] ??= windvd(tiles, full_tcnt);
            if (MAX_OUTPUT_LENGTH - odvd.length < dvds[0].cnt) {
                ++cnt;
                odvd = [`<div class="waiting-brief">${loc.normal}${loc.colon}</div><div class="card-container">${dvds[0].cnt} ${loc.windvd_else_tail}</div>`, ...odvd];
            } else {
                cnt += dvds[0].cnt;
                const ots = WinOutput(tiles, full_tcnt, dvds[0].dvd, MAX_OUTPUT_LENGTH - odvd.length);
                odvd = [...ots.map((a) => `<div class="waiting-brief">${loc.normal}${loc.colon}</div><div class="card-container">${getWinningLine(a)}</div>`), ...odvd];
            }
        }
        output += loc.windvd + ": \n";
        output += `<div class="win-grid">${odvd.join("")}</div>`;
    }
    output += printWaiting(
        tiles,
        tcnt,
        full_tcnt,
        subtiles,
        (d, g) => JP3pWaiting(tiles, step3p, substep, full_tcnt, d, g),
        () => JP3pPrecheck(tiles, step3p, substep, full_tcnt)
    ).output;
    return { output, substep: rsubstep, dvds };
}
function GBStep(mask, save, rsubstep = Array(5).fill(Infinity), dvds = Array(5)) {
    let table = "";
    let substep = Array(5).fill(Infinity);
    if (rsubstep[0] === Infinity) rsubstep[0] = Step(tiles, tcnt, full_tcnt);
    if (mask[0]) {
        substep[0] = rsubstep[0];
        table += `<tr><td style="padding-left: 0px;">${loc.normal}${loc.colon}</td><td>${getWaitingType(rsubstep[0])}</td></tr>`;
        postMessage({ output: table_head + table + table_tail });
    }
    if (full_tcnt === 14 && subcnt === 0) {
        if (rsubstep[1] === Infinity) rsubstep[1] = PairStep(tiles, false);
        if (mask[1]) {
            substep[1] = rsubstep[1];
            table += `<tr><td style="padding-left: 0px;">${loc.pair7}${loc.colon}</td><td>${getWaitingType(rsubstep[1])}</td></tr>`;
            postMessage({ output: table_head + table + table_tail });
        }
        if (rsubstep[2] === Infinity) rsubstep[2] = OrphanStep(tiles, false);
        if (mask[2]) {
            substep[2] = rsubstep[2];
            table += `<tr><td style="padding-left: 0px;">${loc.orphan13}${loc.colon}</td><td>${getWaitingType(rsubstep[2])}</td></tr>`;
            postMessage({ output: table_head + table + table_tail });
        }
        if (rsubstep[3] === Infinity) rsubstep[3] = full_tcnt - 1 - Bukao16Count(tiles);
        if (mask[3]) {
            substep[3] = rsubstep[3];
            table += `<tr><td style="padding-left: 0px;">${loc.quanbukaoxing}${loc.colon}</td><td>${getWaitingType(rsubstep[3])}</td></tr>`;
            postMessage({ output: table_head + table + table_tail });
        }
    }
    if (full_tcnt >= 9) {
        if (rsubstep[4] === Infinity) rsubstep[4] = KnitDragonStep(tiles, tcnt);
        if (mask[4]) {
            substep[4] = rsubstep[4];
            table += `<tr><td style="padding-left: 0px;">${loc.zuhelongxing}${loc.colon}</td><td>${getWaitingType(rsubstep[4])}</td></tr>`;
            postMessage({ output: table_head + table + table_tail });
        }
    }
    const stepGB = Math.min(...substep);
    if (stepGB === Infinity) return { output: "", brief: "", substep: rsubstep, dvds };
    let output = getWaitingType(stepGB);
    let stepTypeGB = [];
    if (substep[0] === stepGB) stepTypeGB.push(loc.normal);
    if (substep[1] === stepGB) stepTypeGB.push(loc.pair7);
    if (substep[2] === stepGB) stepTypeGB.push(loc.orphan13);
    if (substep[3] === stepGB) stepTypeGB.push(loc.quanbukaoxing);
    if (substep[4] === stepGB) stepTypeGB.push(loc.zuhelongxing);
    output += `${loc.brace_left}${stepTypeGB.join(loc.slash)}${loc.brace_right}\n`;
    let brief = output;
    output += table_head + table + table_tail;
    postMessage({ output, brief });
    if (stepGB === -1 && full_tcnt > 0) {
        postMessage({ output });
        let odvd = [];
        let cnt = 0;
        if (substep[1] === -1) {
            dvds[1] ??= PairOutput(tiles);
            ++cnt;
            odvd.push(`<div class="waiting-brief">${loc.pair7}${loc.colon}</div><div class="card-container">${getWinningLine(dvds[1])}</div>`);
        }
        if (substep[2] === -1) {
            dvds[2] ??= OrphanOutput(tiles);
            ++cnt;
            odvd.push(`<div class="waiting-brief">${loc.orphan13}${loc.colon}</div><div class="card-container">${getWinningLine(dvds[2])}</div>`);
        }
        if (substep[3] === -1) {
            dvds[3] ??= Bukao16Output(tiles);
            cnt += dvds[3].length;
            odvd.push(...dvds[3].map((a) => `<div class="waiting-brief">${loc.quanbukaoxing}${loc.colon}</div><div class="card-container">${getWinningLine(a)}</div>`));
        }
        if (substep[4] === -1) {
            let opt_size = MAX_OUTPUT_LENGTH - odvd.length;
            if (substep[0] === -1) --opt_size;
            const ans = KnitDragonOutput(tiles, full_tcnt, opt_size, dvds[4]);
            dvds[4] ??= ans.save;
            cnt += ans.cnt;
            odvd.push(...ans.ots.map((a) => `<div class="waiting-brief">${loc.zuhelongxing}${loc.colon}</div><div class="card-container">${getWinningLine(a)}</div>`));
        }
        if (substep[0] === -1) {
            dvds[0] ??= windvd(tiles, full_tcnt);
            if (MAX_OUTPUT_LENGTH - odvd.length < dvds[0].cnt) {
                ++cnt;
                odvd = [`<div class="waiting-brief">${loc.normal}${loc.colon}</div><div class="card-container">${dvds[0].cnt} ${loc.windvd_else_tail}</div>`, ...odvd];
            } else {
                cnt += dvds[0].cnt;
                const ots = WinOutput(tiles, full_tcnt, dvds[0].dvd, Math.max(MAX_OUTPUT_LENGTH - odvd.length, 1));
                odvd = [...ots.map((a) => `<div class="waiting-brief">${loc.normal}${loc.colon}</div><div class="card-container">${getWinningLine(a)}</div>`), ...odvd];
            }
        }
        output += loc.windvd + ": \n";
        output += `<div class="win-grid">${odvd.join("")}</div>`;
        if (odvd.length < cnt) output += `${loc.windvd_else_head} ${cnt - odvd.length} ${loc.windvd_else_tail}`;
    }
    const r = printWaiting(
        tiles,
        tcnt,
        full_tcnt,
        subtiles,
        (d, g, f) => GBWaiting(tiles, stepGB, substep, full_tcnt, f(save.waiting), d, g),
        () => GBPrecheck(tiles, stepGB, substep, full_tcnt, save.subchecks)
    );
    output += r.output;
    return { output, substep: rsubstep, dvds };
}
function TWStep(mask, save, rsubstep = Array(4).fill(Infinity), dvds = Array(4)) {
    let table = "";
    let substep = Array(4).fill(Infinity);
    if (rsubstep[0] === Infinity) rsubstep[0] = Step(tiles, tcnt, full_tcnt);
    if (mask[0]) {
        substep[0] = rsubstep[0];
        table += `<tr><td style="padding-left: 0px;">${loc.normal}${loc.colon}</td><td>${getWaitingType(substep[0])}</td></tr>`;
        postMessage({ output: table_head + table + table_tail });
    }
    if (full_tcnt === 17 && subcnt === 0) {
        if (rsubstep[1] === Infinity) rsubstep[1] = NiconicoStep(tiles);
        if (mask[1]) {
            substep[1] = rsubstep[1];
            table += `<tr><td style="padding-left: 0px;">${loc.niconico}${loc.colon}</td><td>${getWaitingType(substep[1])}</td></tr>`;
            postMessage({ output: table_head + table + table_tail });
        }
        if (rsubstep[2] === Infinity) rsubstep[2] = OrphanMeldStep(tiles);
        if (mask[2]) {
            substep[2] = rsubstep[2];
            table += `<tr><td style="padding-left: 0px;">${loc.orphan13}${loc.colon}</td><td>${getWaitingType(substep[2])}</td></tr>`;
            postMessage({ output: table_head + table + table_tail });
        }
        if (rsubstep[3] === Infinity) rsubstep[3] = Buda16Step(tiles);
        if (mask[3]) {
            substep[3] = rsubstep[3];
            table += `<tr><td style="padding-left: 0px;">${loc.shiliubudaxing}${loc.colon}</td><td>${getWaitingType(substep[3])}</td></tr>`;
            postMessage({ output: table_head + table + table_tail });
        }
    }
    const stepTW = Math.min(...substep);
    if (stepTW === Infinity) return { output: "", brief: "", substep: rsubstep, dvds };
    let output = getWaitingType(stepTW);
    let stepTypeTW = [];
    if (substep[0] === stepTW) stepTypeTW.push(loc.normal);
    if (substep[1] === stepTW) stepTypeTW.push(loc.niconico);
    if (substep[2] === stepTW) stepTypeTW.push(loc.orphan13);
    if (substep[3] === stepTW) stepTypeTW.push(loc.shiliubudaxing);
    output += `${loc.brace_left}${stepTypeTW.join(loc.slash)}${loc.brace_right}\n`;
    let brief = output;
    output += table_head + table + table_tail;
    postMessage({ output, brief });
    if (stepTW === -1 && full_tcnt > 0) {
        postMessage({ output });
        let odvd = [];
        let cnt = 0;
        if (substep[1] === -1) {
            dvds[1] ??= NiconicoOutput(tiles);
            cnt += dvds[1].length;
            odvd = dvds[1].map((a) => `<div class="waiting-brief">${loc.niconico}${loc.colon}</div><div class="card-container">${getWinningLine(a)}</div>`);
        }
        if (substep[2] === -1) {
            dvds[2] ??= OrphanMeldOutput(tiles);
            cnt += dvds[2].length;
            odvd.push(...dvds[2].map((a) => `<div class="waiting-brief">${loc.orphan13}${loc.colon}</div><div class="card-container">${getWinningLine(a)}</div>`));
        }
        if (substep[3] === -1) {
            dvds[3] ??= Buda16Output(tiles);
            ++cnt;
            odvd.push(`<div class="waiting-brief">${loc.shiliubudaxing}${loc.colon}</div><div class="card-container">${getWinningLine(dvds[3])}</div>`);
        }
        if (substep[0] === -1) {
            dvds[0] ??= windvd(tiles, full_tcnt);
            if (MAX_OUTPUT_LENGTH - odvd.length < dvds[0].cnt) {
                ++cnt;
                odvd = [`<div class="waiting-brief">${loc.normal}${loc.colon}</div><div class="card-container">${dvds[0].cnt} ${loc.windvd_else_tail}</div>`, ...odvd];
            } else {
                cnt += dvds[0].cnt;
                const ots = WinOutput(tiles, full_tcnt, dvds[0].dvd, Math.max(MAX_OUTPUT_LENGTH - odvd.length, 1));
                odvd = [...ots.map((a) => `<div class="waiting-brief">${loc.normal}${loc.colon}</div><div class="card-container">${getWinningLine(a)}</div>`), ...odvd];
            }
        }
        output += loc.windvd + ": \n";
        output += `<div class="win-grid">${odvd.join("")}</div>`;
        if (odvd.length < cnt) output += `${loc.windvd_else_head} ${cnt - odvd.length} ${loc.windvd_else_tail}`;
    }
    output += printWaiting(
        tiles,
        tcnt,
        full_tcnt,
        subtiles,
        (d, g, f) => TWWaiting(tiles, stepTW, substep, full_tcnt, f(save.waiting), d, g),
        () => TWPrecheck(tiles, stepTW, substep, full_tcnt, save.subchecks)
    ).output;
    return { output, substep: rsubstep, dvds };
}
function GBFanDiv(fan) {
    let fans = new Array(84).fill(0);
    for (let i = 0; i < fan.length; ++i)
        if (fan[i] > 0) ++fans[fan[i]];
        else --fans[-fan[i]];
    (fans[60] += fans[83]), (fans[61] += fans[83]);
    let fanopt = [];
    for (let i = 1; i <= 82; ++i) if (fans[i]) fanopt.push(`<tr><td class="waiting-brief">${loc.fanname_format_left + loc[`GB_FANNAME_${i}`] + loc.fanname_format_right}</td><td style="text-align: right; padding-left: 10px">${fans[i] < 0 ? "-" : ""}${GBScoreArray[i]} ${loc.GB_FAN_unit}</td><td>${Math.abs(fans[i]) > 1 ? `×${Math.abs(fans[i])}` : ""}</td></tr>`);
    return `${table_head}${fanopt.join("")}${table_tail}`;
}
function postDebugInfoGlobal(st, m, cm, output) {
    const t = new Date() - st;
    const predict_t = Math.round((t * m) / cm);
    const rate = (cm / m) * 100;
    let debug = `Calculating...... / Calculated ${rate.toFixed(2)}% / Used ${t} ms / Estimated ${predict_t} ms / Remaining ${predict_t - t} ms`;
    postMessage({ debug, output });
}
function GBScore(aids, substeps, gw, mw, wt, info, setting) {
    let [infov, infof] = [0, []];
    if (info.includes(46) && wt) (infov += 8), infof.push((wt = 46));
    if (info.includes(44))
        if (!wt) (infov += 8), infof.push(45);
        else if (setting[32] || wt !== 46) (infov += 8), infof.push(44), (wt = wt !== 46 ? 44 : 46);
    if (info.includes(47) && !wt) (infov += 8), infof.push(47);
    else if (info.includes(58)) (infov += 4), infof.push(58);
    const wint = aids[0].at(-1)?.id;
    const tiles = getTiles(aids[0]);
    let listen_cnt = 0;
    if (wint === undefined) listen_cnt = 999;
    else {
        --tiles[wint];
        listen_cnt = GBWaiting(
            tiles,
            0,
            substeps.map((i) => Math.max(0, i)),
            aids[0].length
        ).ans.length;
        ++tiles[wint];
    }
    let must_single_listen = listen_cnt === 999;
    let gans = { val: 0, fan: [] };
    let [cm, m] = [0, 0];
    let p = Array(7).fill(null);
    if (substeps[0] === -1) p[6] = MeldsPermutation(aids, tiles);
    if (substeps[1] === -1) ++m;
    if (substeps[2] === -1) ++m;
    if (substeps[4] === -1)
        for (let i = 0; i < 6; ++i) {
            let tcp = tiles.slice();
            let win = true;
            let ota = Array(sizeUT).fill(0);
            for (let j = 0; j < 9; ++j) {
                const id = KnitDragonSave[i][j];
                let rid = getRealId(tcp, id);
                if (rid === -1) {
                    win = false;
                    break;
                }
                --tcp[rid];
                ++ota[id];
            }
            if (!win) continue;
            p[i] = MeldsPermutation(aids, tcp, aids[0].length - 9, ota);
        }
    for (let i = 0; i < 7; ++i) if (p[i]) m += p[i].nots * p[i].nsubots;
    const postDebugInfo = () => postDebugInfoGlobal(st, m, cm, `${loc.at_least} ${gans.val + aids[2].length} ${loc.GB_FAN_unit}\n${GBFanDiv([...gans.fan, ...Array(aids[2].length).fill(81)])}`);
    function inMelds(melds, ta, tb, x) {
        for (let i = 0; i < melds.length; ++i) for (let j = 0; j < melds[i].length; ++j) if (canBeListen(tiles, ta, tb, melds[i][j], x)) return true;
        return false;
    }
    function cal(ots, ota, subots, ck, ek, f, others = []) {
        let cp = 0;
        let wintf = 0;
        let bilisten = false;
        const otb = buildHand(tiles, ota, wint);
        for (let k = 0; k < ots.length; ++k)
            if (ots[k].length === 1) ++cp;
            else {
                if (wintf) continue;
                if (ots[k].length === 2) {
                    if (canBeListen(tiles, ota, otb, ots[k][0], wint)) wintf = 79;
                } else if (canBeListen(tiles, ota, otb, ots[k][0], wint))
                    if (NumberArray[ots[k][0]] === 6) wintf = 77;
                    else bilisten = true;
                else if (canBeListen(tiles, ota, otb, ots[k][1], wint)) wintf = 78;
                else if (canBeListen(tiles, ota, otb, ots[k][2], wint))
                    if (NumberArray[ots[k][2]] === 2) wintf = 77;
                    else bilisten = true;
            }
        if (wint !== undefined && !wt && !wintf && !bilisten && !inMelds(others, ota, otb, wint)) --cp;
        if (setting[25] && wint !== undefined && inMelds(others, ota, otb, wint)) wintf = 0;
        let ans = f([...ots, ...subots, ...others], gans.val, aids, ck, ek, cp, gw, mw, wt, tiles, setting);
        if (!must_single_listen && (listen_cnt < 2 || setting[26]) && wintf) ++ans.val, ans.fan.push(wintf);
        (ans.val += infov), ans.fan.push(...infof);
        if (ans.val > gans.val) gans = ans;
        ++cm;
        if (!(cm & 1048575)) postDebugInfo();
    }
    const st = new Date();
    if (substeps[1] === -1) {
        let pans = GB7Pairs(aids[0], setting);
        (pans.val += infov), pans.fan.push(...infof);
        if (wt === 80)
            if (setting[41]) (pans.val += 4), pans.fan.push(56);
            else ++pans.val, pans.fan.push(80);
        if (pans.val > gans.val) gans = pans;
        ++cm;
        postDebugInfo();
    }
    if (substeps[2] === -1) {
        let pans = { val: 88 + infov, fan: [7, ...infof] };
        if (wt === 80)
            if (setting[42]) (pans.val += 4), pans.fan.push(56);
            else ++pans.val, pans.fan.push(80);
        if (pans.val > gans.val) gans = pans;
        ++cm;
        postDebugInfo();
    }
    if (substeps[3] === -1) {
        let pans = { val: 12, fan: [34] };
        let tcp = tiles.slice();
        let seven_stars = true;
        for (let i = 27; i < 34; ++i) {
            let rid = getRealId(tcp, i);
            if (rid === -1) {
                seven_stars = false;
                break;
            }
            --tcp[rid];
        }
        if (seven_stars) pans = { val: 24, fan: [20] };
        else
            for (let i = 0; i < 6; ++i) {
                let tcp = tiles.slice();
                let win = true;
                for (let j = 0; j < 9; ++j) {
                    const id = KnitDragonSave[i][j];
                    let rid = getRealId(tcp, id);
                    if (rid === -1) {
                        win = false;
                        break;
                    }
                    --tcp[rid];
                }
                if (win) {
                    pans.val += 12;
                    pans.fan.push(35);
                    break;
                }
            }
        (pans.val += infov), pans.fan.push(...infof);
        if (wt === 80)
            if (setting[43]) (pans.val += 4), pans.fan.push(56);
            else ++pans.val, pans.fan.push(80);
        if (pans.val > gans.val) gans = pans;
        ++cm;
        postDebugInfo();
    }
    if (substeps[0] === -1) {
        const nmp = Math.ceil(aids[0].length / 3) + aids[1].length;
        const { err, itots, itsubots, ek, ck } = p[6];
        if (err === 1) return { output: loc.subtile_error_1, brief: "" };
        if (err === 2) return { output: loc.subtile_error_2, brief: "" };
        let addk = false;
        for (let i = 0; i < aids[1].length; ++i) if (getUnifiedType(aids[1][i]) > 4) addk = true;
        if (aids[0].length === 2 && ck === 0 && !wt && nmp >= 5 && !(setting[36] && addk)) (must_single_listen = true), (infov += 6), infof.push(52);
        if (aids[0].length === 2 && aids[1].length === 4 && ck + ek === 4) must_single_listen = true;
        itots((ots, ota) => itsubots((subots) => cal(ots, ota, subots, ck, ek, GBKernel)));
        if (gans.val === 0 && nmp >= 5) (gans.val = 8), (gans.fan = [43]);
        postDebugInfo();
    }
    if (substeps[4] === -1)
        for (let i = 0; i < 6; ++i) {
            if (!p[i]) continue;
            const { err, itots, itsubots, ek, ck } = p[i];
            if (err === 1) return { output: loc.subtile_error_1, brief: "" };
            if (err === 2) return { output: loc.subtile_error_2, brief: "" };
            const other = [KnitDragonSave[i].slice(0, 3), KnitDragonSave[i].slice(3, 6), KnitDragonSave[i].slice(6, 9)];
            itots((ots, ota) => itsubots((subots) => cal(ots, ota, subots, ck, ek, GBKnitDragon, other)));
            postDebugInfo();
        }
    let basept = (setting[38] >= 0 ? Math.min(setting[38], gans.val) : gans.val) + aids[2].length;
    (gans.val += aids[2].length), gans.fan.push(...Array(aids[2].length).fill(81));
    let fanreview = `${gans.val} ${loc.GB_FAN_unit}`;
    if (gans.val > basept) fanreview = `${loc.GB_max_fan}${loc.brace_left}${fanreview}${loc.brace_right}`;
    if (setting[39] && wt) basept = Math.ceil(basept / 3);
    let ptchange = wt ? `${loc.winner} +${(basept + setting[37]) * 3}${loc.comma}${loc.other_player} -${basept + setting[37]}` : `${loc.winner} +${basept + setting[37] * 3}${loc.comma}${loc.loser} -${basept + setting[37]}${loc.comma}${loc.observer} -${setting[37]}`;
    if (gans.val < setting[0]) ptchange = loc.wrong_win;
    outputs = [fanreview, "\n", GBFanDiv(gans.fan), ptchange];
    return { output: outputs.join(""), brief: `${outputs[0]}${loc.brace_left}${outputs[3]}${loc.brace_right}` };
}
function JPPrintName(yakuman, printname) {
    if (yakuman > 12) return `${yakuman} ${loc.times_n}${loc.yakuman}`;
    if (yakuman >= 2) return `${loc[`times_${yakuman}`]}${loc.yakuman}`;
    if (yakuman === 1) return `${loc.yakuman}`;
    if (printname) return `${loc[printname]}`;
    return "";
}
function JPGetFanCount(mq, i) {
    if (i >= JPScoreArray.length) return `${1} ${loc.JP_FAN_unit}`;
    if (JPScoreArray[i] === -1) return `${loc.yakuman}`;
    if (JPScoreArray[i] <= -2) return `${loc[`times_${-JPScoreArray[i]}`]}${loc.yakuman}`;
    const s = mq ? Math.ceil(JPScoreArray[i]) : Math.floor(JPScoreArray[i]);
    return `${s} ${loc.JP_FAN_unit}`;
}
function JPGetFuName(i) {
    if (i >= 8) return loc[`JP_FUNAME_${i}`];
    let opts = [i & 1 ? loc.JP_FUNAME_0_1 : loc.JP_FUNAME_0_0, i & 2 ? loc.JP_FUNAME_1_1 : loc.JP_FUNAME_1_0, i & 4 ? loc.JP_FUNAME_2_1 : loc.JP_FUNAME_2_0];
    return opts.join("");
}
function JPFanFuDiv(fan, fus, mq, d, u, aka, nuki) {
    let fans = new Array(96).fill(0);
    for (let i = 0; i < fan.length; ++i) if (fan[i] > 0) ++fans[fan[i]];
    fans.push(d, u, aka, nuki);
    let fanopt = [];
    for (let i = 0; i < PrintSeq.length; ++i) if (fans[PrintSeq[i]]) fanopt.push(`<tr><td class="waiting-brief">${loc.fanname_format_left + loc[`JP_YAKUNAME_${PrintSeq[i]}`] + loc.fanname_format_right}</td><td style="text-align: right; padding-left: 10px">${JPGetFanCount(mq, PrintSeq[i])}</td><td>${fans[PrintSeq[i]] > 1 ? `×${fans[PrintSeq[i]]}` : ""}</td></tr>`);
    let fusopt = fus.map((i) => `<tr><td class="waiting-brief">${loc.fanname_format_left + JPGetFuName(i) + loc.fanname_format_right}</td><td style="text-align: right; padding-left: 10px">${JPFuArray[i]} ${loc.JP_FU_unit}</td></tr>`);
    return `<div style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap; padding: 0px;">${table_head}${fanopt.join("")}${table_tail}${table_head}${fusopt.join("")}${table_tail}</div>`;
}
function JPScore(aids, substeps, gw, mw, tsumo, info, setting) {
    let gans = eans_jp;
    if (!setting[1]) for (let i = 0; i < JPScoreArray.length; ++i) if (JPScoreArray[i] <= -2) JPScoreArray[i] = -1;
    if (setting[23]) loc.JP_YAKUNAME_53 = loc.JP_YAKUNAME_53_EX;
    let infoans = { fan: [], valfan: 0, yakuman: 0, delete: 0 };
    let riichi = false;
    let aka = 0;
    for (let i = 0; i < aids[0].length; ++i) if ("sp" in aids[0][i]) ++aka;
    for (let i = 0; i < aids[1].length; ++i) for (let j = 0; j < aids[1][i].length; ++j) if ("sp" in aids[1][i][j]) ++aka;
    for (let i = 0; i < aids[2].length; ++i) if ("sp" in aids[2][i]) ++aka;
    let nukicnt = aids[2].length;
    const tiles = getTiles(aids[0]);
    const p = MeldsPermutation(aids);
    if (info.includes(32))
        if (tsumo)
            if (mw === 27) infoans.fan.push(32), ++infoans.yakuman;
            else infoans.fan.push(33), ++infoans.yakuman;
        else if (mw !== 27) {
            const RenhouScoreArray = [0, 5, -1, 4, 6, 8];
            const renhou = (JPScoreArray[30] = RenhouScoreArray[setting[9]]);
            if (renhou < 0) infoans.fan.push(30), (infoans.yakuman += -renhou);
            else if (renhou > 0)
                if (setting[21]) {
                    let [gf, gvf, grf] = [[8], 20, 0];
                    if (substeps[0] === -1) {
                        const { err, itots, itsubots, ck } = p;
                        if (err === 1) return { output: loc.subtile_error_1, brief: "" };
                        if (err === 2) return { output: loc.subtile_error_2, brief: "" };
                        itots((ots, ota) =>
                            itsubots((subots) => {
                                let { listen_type, bilisten, valfus, fus } = JPGetFusMain([...ots, subots], aids, ck, gw, mw, tsumo, tiles, ota, setting);
                                let realfus = 0;
                                ({ valfus, fus, realfus } = JPGetFusRemain(1, undefined, tsumo, fus, valfus, listen_type, bilisten, setting, ots.length + subots.length >= 5 && subots.length === ck));
                                if (realfus > grf) (gf = fus), (gvf = valfus), (grf = realfus);
                            })
                        );
                    }
                    if (substeps[1] === -1) {
                        const SevenPairsFusArray = [25, 50, 100];
                        const sf = (JPFuArray[10] = SevenPairsFusArray[setting[8]]);
                        if (sf >= gvf) (gvf = grf = sf), (gf = [10]);
                    }
                    const RenhouValueArray = [0, 2000, 8000, gvf << 6, 3000, 4000];
                    const RenhouPrintArray = ["", "mangan", "yakuman", "", "haneman", "baiman"];
                    if (RenhouValueArray[3] >= 2000) (RenhouValueArray[3] = 2000), (RenhouPrintArray[3] = "mangan");
                    else if (setting[7] && RenhouValueArray[3] >= 1920) (RenhouValueArray[3] = 2000), (RenhouPrintArray[3] = "kiri_mangan");
                    gans = { ...eans_jp, val: RenhouValueArray[setting[9]], fan: [30], valfan: renhou, fus: gf, valfus: gvf, realfus: grf, print: RenhouPrintArray[setting[9]] };
                } else infoans.fan.push(30), (infoans.valfan += renhou);
        }
    if (!infoans.yakuman) {
        if (info.includes(16)) infoans.fan.push(16), (infoans.valfan += 2), (riichi = true);
        else if (info.includes(1)) infoans.fan.push(1), ++infoans.valfan, (riichi = true);
        if (riichi && info.includes(3)) infoans.fan.push(3), ++infoans.valfan, (infoans.delete += setting[13] ? 0 : 1);
        if (info.includes(12) && tsumo) infoans.fan.push(12), ++infoans.valfan;
        else if (info.includes(13))
            if (tsumo) infoans.fan.push(13), ++infoans.valfan;
            else infoans.fan.push(14), ++infoans.valfan;
        if (info.includes(15) && !tsumo) infoans.fan.push(15), ++infoans.valfan;
        infoans.valfan += aka + nukicnt;
        infoans.delete += setting[12] ? 0 : aka + nukicnt;
    }
    let [cm, m] = [0, 0];
    let mq = aids[1].length === 0;
    const nukis = getTiles(aids[2]);
    let [doras, uras] = [getTiles(aids[3]), getTiles(riichi ? aids[4] : [])];
    doras = doras.map((_, i) => doras[getDoraPointer(i)]);
    uras = uras.map((_, i) => uras[getDoraPointer(i)]);
    const st = new Date();
    const postDebugInfo = () => postDebugInfoGlobal(st, m, cm, ``);
    function ansYakuAri(ans) {
        let limit = setting[0];
        if (!ans.yakuman && setting[11])
            if (!setting[3]) return false;
            else limit = Math.max(limit, 13);
        return ans.yakuman || ans.valfan - (setting[12] ? 0 : ans.dora) - ans.ura - infoans.delete >= limit;
    }
    function replaceCheck(ans) {
        if (ans.val > gans.val) return true;
        else if (ans.val === gans.val)
            if (ans.yakuman > gans.yakuman) return true;
            else if (ans.yakuman === gans.yakuman)
                if (ans.realyakuman > gans.realyakuman) return true;
                else if (ans.realyakuman === gans.realyakuman)
                    if (ans.valfan > gans.valfan) return true;
                    else if (ans.valfan === gans.valfan) if (ans.realfus > gans.realfus) return true;
    }
    function cal(ots, ota, subots, ck, ek) {
        const ans = JPKernel([...ots, ...subots], infoans, gans, aids, ck, ek, gw, mw, tsumo, tiles, ota, doras, uras, nukis, setting);
        if (ansYakuAri(gans) && ansYakuAri(ans) && replaceCheck(ans)) gans = ans;
        else if (!ansYakuAri(gans) && (ansYakuAri(ans) || replaceCheck(ans))) gans = ans;
        ++cm;
        if (!(cm & 1048575)) postDebugInfo();
    }
    if (substeps[1] === -1) {
        const ans = JP7Pairs(aids[0], infoans, tsumo, doras, uras, nukis, setting);
        if (ansYakuAri(gans) && ansYakuAri(ans) && replaceCheck(ans)) gans = ans;
        else if (!ansYakuAri(gans) && (ansYakuAri(ans) || replaceCheck(ans))) gans = ans;
    }
    if (substeps[2] === -1) {
        let tcp = tiles.slice();
        --tcp[aids[0].at(-1).id];
        let listen_13 = setting[1];
        for (let i = 0; listen_13 && i < Orphan13Array.length; ++i) {
            const rid = getRealId(tcp, Orphan13Array[i]);
            if (rid === -1) listen_13 = false;
            else --tcp[rid];
        }
        let yakuman = listen_13 ? 2 : 1;
        yakuman = setting[2] ? yakuman + infoans.yakuman : Math.max(yakuman, infoans.yakuman);
        let f = [listen_13 ? 37 : 36];
        if (infoans.yakuman > 0) f.push(infoans.fan);
        const [valfan, valfus, realfus, fus, pt] = [0, 20, 20, [8], yakuman * 8000];
        if (pt > gans.val || (pt === gans.val && yakuman > gans.yakuman)) gans = { val: pt, yakuman, valfan, fan: f, valfus, realfus, fus };
    }
    if (substeps[0] === -1) {
        const { err, itots, itsubots, ek, ck, nots, nsubots } = p;
        m = nots * nsubots;
        mq = ck === aids[1].length;
        if (err === 1) return { output: loc.subtile_error_1, brief: "" };
        if (err === 2) return { output: loc.subtile_error_2, brief: "" };
        itots((ots, ota) => itsubots((subots) => cal(ots, ota, subots, ck, ek)));
    }
    if (gans.yakuman) aka = nukicnt = 0;
    const name = JPPrintName(gans.yakuman, gans.print);
    const realpt = setting[15] ? (x) => Math.ceil(x / 100) * 100 : (x) => x;
    let [score, exinfo] = [0, ""];
    if (tsumo)
        if (mw === 27) (score = realpt(gans.val * 2) * 3), (exinfo = `${realpt(gans.val * 2)}∀`);
        else (score = realpt(gans.val * 2) + realpt(gans.val) * 2), (exinfo = `${realpt(gans.val)}${loc.slash}${realpt(gans.val * 2)}`);
    else if (mw === 27) score = realpt(gans.val * 6);
    else score = realpt(gans.val * 4);
    if (tsumo) exinfo = loc.brace_left + exinfo + loc.brace_right;
    const ptchange = ansYakuAri(gans) ? `+${score} ${exinfo}` : `${loc.wrong_win}`;
    const namebrace = name === "" ? name : `${loc.brace_left}${name}${loc.brace_right}`;
    const fanfuinfo = gans.yakuman ? name : gans.valfus >= 20 ? `${gans.valfan} ${loc.JP_FAN_unit} ${gans.valfus} ${loc.JP_FU_unit}${namebrace}` : "";
    const fanfudiv = JPFanFuDiv(gans.fan, gans.fus, mq, gans.dora ?? 0, gans.ura ?? 0, aka, nukicnt);
    const opts = [fanfuinfo, fanfudiv, ptchange];
    return { output: opts.join(""), brief: `${fanfuinfo}${loc.comma}${ptchange}` };
}
self.onmessage = function (e) {
    const st = new Date();
    if (e.data.lang) setLoc(e.data.lang);
    let task = e.data.task;
    let result;
    if (aids === undefined) {
        ({ aids, tiles, subtiles } = e.data);
        full_tcnt = tcnt = aids[0].length;
        if (tcnt % 3 === 1) ++full_tcnt;
        subcnt = aids[1].length;
    }
    switch (task) {
        case 0: {
            result = normalStep();
            break;
        }
        case 1: {
            let { mask, dvds } = e.data;
            result = JPStep(mask, undefined, dvds);
            break;
        }
        case 2: {
            let { mask, steps, save, dvds } = e.data;
            result = GBStep(mask, save, steps, dvds);
            break;
        }
        case 3: {
            let { mask, steps, save, dvds } = e.data;
            result = TWStep(mask, save, steps, dvds);
            break;
        }
        case 4: {
            let { mask, steps, dvds } = e.data;
            result = JP3pStep(mask, steps, dvds);
            break;
        }
        case "gb-score": {
            let { substeps, gw, mw, wt, info, setting } = e.data;
            result = GBScore(aids, substeps, gw, mw, wt, info, setting);
            break;
        }
        case "jp-score": {
            let { substeps, gw, mw, wt, info, setting } = e.data;
            result = JPScore(aids, substeps, gw, mw, wt, info, setting);
            break;
        }
        case "qingque-score": {
            let { substeps, info } = e.data;
            Qingque_Weight_creation();
            result = Qingque_Calculate(aids, info, substeps);
            break;
        }
    }
    const ed = new Date();
    postMessage({ result, time: ed - st });
};
