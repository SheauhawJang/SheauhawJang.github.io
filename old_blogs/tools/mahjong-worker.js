importScripts("mahjong.js");
importScripts("mahjong-score.js");
importScripts("mahjong-worker-lang.js");
importScripts("mahjong-mmc.js");
//console.log(PrintSeq.map(i=>cn_loc[`JP_YAKUNAME_${i}`]).join('\n'));
//console.log(Array(69).fill(0).map((_,i)=>cn_loc[`JP_YAKUNAME_${i}`]).join('\n'));
const MAX_OUTPUT_LENGTH = 12;
const makeTable = (i) => `<table style="border-collapse: collapse; padding: 0px">${i}</table>`;
const makeTableLineLR = (l, r) => `<tr><td style="padding-left: 0px;">${l}</td><td>${r}</td></tr>`;
const makeGridDiv = (i) => `<div class="output-grid-div">${i}</div>`;
let aids = undefined;
let tiles, subtiles;
let tcnt, full_tcnt, subcnt;
function cardImage(id) {
    return `<img src="./cards/a${cardName(id)}.gif" style="vertical-align: middle;">`;
}
function cardImageDivide(id) {
    return `<div class="card-div"><img src="./cards/${cardName(id)}.gif" class="no-helper"></div>`;
}
const maskMultiply = (result, mask) => result.map((x, i) => mask[i] ? x : Infinity);
const divideSpace = `<div class="card-div card-padding"></div>`;
function printWaiting(step, getWaiting, getSubchecks, fk, sq) {
    if (full_tcnt !== tcnt) {
        let result = "";
        const save = getWaiting(step, undefined, undefined, (s) => s);
        const { ans, gans } = save;
        if (gans !== undefined) {
            const bcnt = CountWaitingCards(tiles, subtiles, ans);
            const gcnt = CountWaitingCards(tiles, subtiles, gans);
            const cnt = gcnt + bcnt;
            const ratio = (gcnt / cnt) * 100;
            result += `<div>${loc.wait} ${cnt} ${loc.counts}</div><div class="devided-waiting-td"><div class="devided-waiting-container"><div class="devided-waiting-brief">${loc.goodshape} ${gcnt} ${loc.counts}</div><div class="devided-waiting-cards">${gans.map(cardImage).join("")}</div></div><div class="devided-waiting-container"><div class="devided-waiting-brief">${loc.badshape} ${bcnt} ${loc.counts}</div><div class="devided-waiting-cards">${ans.map(cardImage).join("")}</div></div><div class="devided-waiting-brief">${loc.goodshaperate} ${ratio.toFixed(2)}%</div></div>`;
        } else {
            const cnt = CountWaitingCards(tiles, subtiles, ans);
            result += `<div>${loc.wait} ${cnt} ${loc.counts}</div><div>${ans.map(cardImage).join("")}</div>`;
        }
        let output = makeGridDiv(result);
        if (1) {
            let opentip = [[], []];
            function updateopen(i, j, verb) {
                --tiles[i], --tiles[j], subtiles[i] += 3, full_tcnt -= 3, tcnt -= 2, ++subcnt;
                const openstep = fk();
                if (openstep < step && openstep >= 0) opentip[0].push({hand: [i, j], verb});
                else if (openstep === step) opentip[1].push({hand: [i, j], verb})
                ++tiles[i], ++tiles[j], subtiles[i] -= 3, full_tcnt += 3, tcnt += 2, --subcnt;
            }
            for (let i = 0; i < sizeUT; ++i) if (tiles[i] >= 2) updateopen(i, i, loc.pong);
            for (let i = 0; i < sizeUT; ++i) {
                if ((sq(i) || sq(i - 1)) && tiles[i] >= 1 && tiles[i + 1] >= 1) updateopen(i, i + 1, loc.chi);
                if (sq(i) && tiles[i] >= 1 && tiles[i + 2] >= 1) updateopen(i, i + 2, loc.chi);
            }
            let openout = "";
            const optmap = (x) => `<div class="devided-waiting-brief">${x.verb} ${x.hand.map(cardImage).join('')}</div>`;
            if (opentip[0].length > 0) openout += `<div>${loc.goodopen}</div><div class="devided-waiting-container">${opentip[0].map(optmap).join("")}</div>`;
            //if (opentip[1].length > 0) openout += `<div>${loc.badopen}</div><div class="devided-waiting-container">${opentip[1].map(optmap).join("")}</div>`;
            if (openout !== "") output += makeGridDiv(openout);
        }
        return { output, ans: { waiting: save } };
    } else {
        let [result, nxt_result, kang_result] = ["", "", ""];
        const [save, nxt_save, kang_save] = [Array(sizeAT), Array(sizeAT), Array(sizeUT)];
        const [cnts, nxt_cnts, kang_cnts] = [[], [], []];
        const subchecks = getSubchecks();
        const { dischecks, getchecks } = subchecks;
        for (let i = 0; i < sizeAT; ++i) {
            if (!tiles[i]) continue;
            --tiles[i], ++subtiles[i];
            save[i] = getWaiting(step, dischecks[i], getchecks, (s) => s?.[i]);
            const { ans, gans, checked } = save[i];
            if (checked) {
                const cnt = CountWaitingCards(tiles, subtiles, ans);
                if (gans !== undefined) {
                    const gcnt = CountWaitingCards(tiles, subtiles, gans);
                    cnts.push({ cnt: cnt + gcnt, bcnt: cnt, gcnt, id: i });
                } else cnts.push({ cnt, id: i });
            } else {
                nxt_save[i] = getWaiting(step + 1, undefined, undefined, () => undefined);
                const { ans, gans } = nxt_save[i];
                const cnt = CountWaitingCards(tiles, subtiles, ans);
                if (gans !== undefined) {
                    const gcnt = CountWaitingCards(tiles, subtiles, gans);
                    if (ans.length + gans.length > 0) nxt_cnts.push({ cnt: cnt + gcnt, bcnt: cnt, gcnt, id: i });
                } else if (ans.length > 0) nxt_cnts.push({ cnt, id: i });
            }
            ++tiles[i], --subtiles[i];
            if (i < sizeUT && tiles[i] >= 4) {
                tiles[i] -= 4, subtiles[i] += 4, full_tcnt -= 3, tcnt -= 4, ++subcnt;
                const stepk = fk();
                kang_save[i] = getWaiting(stepk, Array(dischecks[i].length).fill(true), undefined, () => undefined);
                const pushf = stepk === step ? ((u, id) => cnts.push({...u, id: id + sizeAT})) : ((u, id) => kang_cnts.push({...u, id, step: stepk}));
                const { ans, gans } = kang_save[i];
                const cnt = CountWaitingCards(tiles, subtiles, ans);
                if (gans !== undefined) {
                    const gcnt = CountWaitingCards(tiles, subtiles, gans);
                    pushf({ cnt: cnt + gcnt, bcnt: cnt, gcnt }, i);
                } else pushf({ cnt }, i);
                tiles[i] += 4, subtiles[i] -= 4, full_tcnt += 3, tcnt += 4, --subcnt;
            }
        }
        const cmp = (a, b) => {
            if ("step" in a && "step" in b && a.step !== b.step) return a.step - b.step;
            if (b.cnt !== a.cnt) return b.cnt - a.cnt;
            if ("gcnt" in a && "gcnt" in b) return b.gcnt - a.gcnt;
            return 0;
        }
        cnts.sort(cmp);
        nxt_cnts.sort(cmp);
        kang_cnts.sort(cmp);
        for (const { cnt, bcnt, gcnt, id } of cnts) {
            const rid = id >= sizeAT ? id - sizeAT : id;
            const verb = rid !== id ? loc.kang : (isFlower(rid) ? loc.bu : loc.da);
            const rsave = rid !== id ? kang_save[rid] : save[rid];
            if (gcnt !== undefined) result += `<div>${verb} ${cardImage(rid)} ${loc.wait} ${cnt} ${loc.counts}</div><div class="devided-waiting-td"><div class="devided-waiting-container"><div class="devided-waiting-brief">${loc.goodshape} ${gcnt} ${loc.counts}</div><div class="devided-waiting-cards">${rsave.gans.map(cardImage).join("")}</div></div><div class="devided-waiting-container"><div class="devided-waiting-brief">${loc.badshape} ${bcnt} ${loc.counts}</div><div class="devided-waiting-cards">${rsave.ans.map(cardImage).join("")}</div></div><div class="devided-waiting-brief">${loc.goodshaperate} ${((gcnt / cnt) * 100).toFixed(2)}%</div></div>`;
            else result += `<div>${verb} ${cardImage(rid)} ${loc.wait} ${cnt} ${loc.counts}</div><div>${rsave.ans.map(cardImage).join("")}</div>`;
        }
        for (const { cnt, bcnt, gcnt, id } of nxt_cnts) {
            const verb = isFlower(id) ? loc.bu : loc.da;
            if (gcnt !== undefined) nxt_result += `<div>${verb} ${cardImage(id)} ${loc.wait} ${cnt} ${loc.counts}</div><div class="devided-waiting-td"><div class="devided-waiting-container"><div class="devided-waiting-brief">${loc.goodshape} ${gcnt} ${loc.counts}</div><div class="devided-waiting-cards">${nxt_save[id].gans.map(cardImage).join("")}</div></div><div class="devided-waiting-container"><div class="devided-waiting-brief">${loc.badshape} ${bcnt} ${loc.counts}</div><div class="devided-waiting-cards">${nxt_save[id].ans.map(cardImage).join("")}</div></div><div class="devided-waiting-brief">${loc.goodshaperate} ${((gcnt / cnt) * 100).toFixed(2)}%</div></div>`;
            else nxt_result += `<div>${verb} ${cardImage(id)} ${loc.wait} ${cnt} ${loc.counts}</div><div>${nxt_save[id].ans.map(cardImage).join("")}</div>`;
        }
        for (const { cnt, bcnt, gcnt, id, step } of kang_cnts) {
            const verb = loc.kang;
            if (gcnt !== undefined) kang_result += `<div>${verb} ${cardImage(id)} ${getWaitingType(step)} ${loc.wait} ${cnt} ${loc.counts}</div><div class="devided-waiting-td"><div class="devided-waiting-container"><div class="devided-waiting-brief">${loc.goodshape} ${gcnt} ${loc.counts}</div><div class="devided-waiting-cards">${kang_save[id].gans.map(cardImage).join("")}</div></div><div class="devided-waiting-container"><div class="devided-waiting-brief">${loc.badshape} ${bcnt} ${loc.counts}</div><div class="devided-waiting-cards">${kang_save[id].ans.map(cardImage).join("")}</div></div><div class="devided-waiting-brief">${loc.goodshaperate} ${((gcnt / cnt) * 100).toFixed(2)}%</div></div>`;
            else kang_result += `<div>${verb} ${cardImage(id)} <span style="white-space: nowrap;">${getWaitingType(step)}</span> <span style="white-space: nowrap;">${loc.wait} ${cnt} ${loc.counts}</span></div><div>${kang_save[id].ans.map(cardImage).join("")}</div>`;
        }
        let output = makeGridDiv(result);
        if (nxt_result !== "") output += `${loc.tuixiang}${loc.brace_left}<span style="white-space: nowrap;">${getWaitingType(step + 1)}</span>${loc.brace_right}${makeGridDiv(nxt_result)}`;
        if (kang_result !== "") output += `${loc.kang_list}${makeGridDiv(kang_result)}`;
        return { output, ans: { waiting: save, subchecks } };
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
    const r = printWaiting(step, (s, d, g) => NormalWaiting(tiles, s, full_tcnt, d, g), () => NormalPrecheck(tiles, step, full_tcnt), () => Step(tiles, tcnt, full_tcnt), SeqCheck);
    output += r.output;
    return { output, step, save: r.ans, dvd };
}
function updateTableGeneral(table, info) {
    table += info;
    postMessage({ output: makeTable(table) });
    return table;
}
function JPStep(mask, rsubstep = Array(3).fill(Infinity), dvds = Array(3)) {
    let table = "";
    const updateTable = (l, r) => table = updateTableGeneral(table, makeTableLineLR(l, r));
    let substep = Array(3).fill(Infinity);
    if (rsubstep[0] === Infinity) rsubstep[0] = Step(tiles, tcnt, full_tcnt, 4);
    if (mask && mask[0]) {
        substep[0] = rsubstep[0];
        updateTable(`${loc.normal}${loc.colon}`, `${getWaitingType(substep[0])}`);
    }
    if (full_tcnt === 14 && subcnt === 0) {
        if (rsubstep[1] === Infinity) rsubstep[1] = PairStep(tiles, true);
        if (mask && mask[1]) {
            substep[1] = rsubstep[1];
            updateTable(`${loc.pair7}${loc.colon}`, `${getWaitingType(substep[1])}`);
        }
        if (rsubstep[2] === Infinity) rsubstep[2] = OrphanStep(tiles);
        if (mask && mask[2]) {
            substep[2] = rsubstep[2];
            updateTable(`${loc.kokushi}${loc.colon}`, `${getWaitingType(substep[2])}`);
        }
    } 
    if (!mask) return rsubstep;
    const stepJP = Math.min(...substep);
    if (stepJP === Infinity) return { output: "", brief: "", substep: rsubstep, dvds };
    let output = getWaitingType(stepJP);
    let stepTypeJP = [];
    if (substep[0] === stepJP) stepTypeJP.push(loc.normal);
    if (substep[1] === stepJP) stepTypeJP.push(loc.pair7);
    if (substep[2] === stepJP) stepTypeJP.push(loc.kokushi);
    output += `${loc.brace_left}${stepTypeJP.join(loc.slash)}${loc.brace_right}\n`;
    let brief = output;
    postMessage({ output: output + makeTable(table), brief });
    if (rsubstep[2] !== Infinity) {
        const k = OrphanCount(tiles).count;
        let status = loc.unavailable;
        if (k >= 9) status = loc.available;
        else if (k === 8 && full_tcnt !== tcnt) status = loc.waiting;
        table += makeTableLineLR(`${loc.kyushukyuhai}${loc.colon}`, `${status}${loc.brace_left}${k} ${loc.shukyuhai}${loc.brace_right}`);
    }
    output += makeTable(table);
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
    const r = printWaiting(stepJP, (s, d, g) => JPWaiting(tiles, s, substep, full_tcnt, d, g), () => JPPrecheck(tiles, stepJP, substep, full_tcnt), () => Math.min(...maskMultiply(JPStep(), mask)), SeqCheck);
    output += r.output;
    return { output, substep: rsubstep, dvds };
}
function JP3pStep(mask, rsubstep = Array(3).fill(Infinity), dvds = Array(3)) {
    let table = "";
    const updateTable = (l, r) => table = updateTableGeneral(table, makeTableLineLR(l, r));
    let substep = Array(3).fill(Infinity);
    if (rsubstep[0] === Infinity) rsubstep[0] = searchDp(tiles, 0, 0, full_tcnt, Infinity, 4, guse3p);
    if (mask && mask[0]) {
        substep[0] = rsubstep[0];
        updateTable(`${loc.normal}${loc.colon}`, `${getWaitingType(substep[0])}`);
    }
    if (full_tcnt === 14 && subcnt === 0) {
        if (rsubstep[1] === Infinity) rsubstep[1] = PairStep(tiles, true, guse3p);
        if (mask && mask[1]) {
            substep[1] = rsubstep[1];
            updateTable(`${loc.pair7}${loc.colon}`, `${getWaitingType(substep[1])}`);
        }
        if (rsubstep[2] === Infinity) rsubstep[2] = OrphanStep(tiles);
        if (mask && mask[2]) {
            substep[2] = rsubstep[2];
            updateTable(`${loc.kokushi}${loc.colon}`, `${getWaitingType(substep[2])}`);
        }
    }
    if (!mask) return rsubstep;
    const step3p = Math.min(...substep);
    if (step3p === Infinity) return { output: "", brief: "", substep: rsubstep, dvds };
    let output = getWaitingType(step3p);
    let stepTypeJP = [];
    if (substep[0] === step3p) stepTypeJP.push(loc.normal);
    if (substep[1] === step3p) stepTypeJP.push(loc.pair7);
    if (substep[2] === step3p) stepTypeJP.push(loc.kokushi);
    output += `${loc.brace_left}${stepTypeJP.join(loc.slash)}${loc.brace_right}\n`;
    let brief = output;
    postMessage({ output: output + makeTable(table), brief });
    if (rsubstep[2] !== Infinity) {
        const k = OrphanCount(tiles).count;
        let status = loc.unavailable;
        if (k >= 9) status = loc.available;
        else if (k === 8 && full_tcnt !== tcnt) status = loc.waiting;
        table += makeTableLineLR(`${loc.kyushukyuhai}${loc.colon}`, `${status}${loc.brace_left}${k} ${loc.shukyuhai}${loc.brace_right}`);
    }
    output += makeTable(table);
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
    const r = printWaiting(step3p, (s, d, g) => JP3pWaiting(tiles, s, substep, full_tcnt, d, g), () => JP3pPrecheck(tiles, step3p, substep, full_tcnt), () => Math.min(...maskMultiply(JP3pStep(), mask)), () => false);
    output += r.output;
    return { output, substep: rsubstep, dvds };
}
function GBStep(mask, save, rsubstep = Array(5).fill(Infinity), dvds = Array(5)) {
    let table = "";
    const updateTable = (l, r) => table = updateTableGeneral(table, makeTableLineLR(l, r));
    let substep = Array(5).fill(Infinity);
    if (rsubstep[0] === Infinity) rsubstep[0] = Step(tiles, tcnt, full_tcnt);
    if (mask && mask[0]) {
        substep[0] = rsubstep[0];
        updateTable(`${loc.normal}${loc.colon}`, `${getWaitingType(rsubstep[0])}`);
    }
    if (full_tcnt === 14 && subcnt === 0) {
        if (rsubstep[1] === Infinity) rsubstep[1] = PairStep(tiles, false);
        if (mask && mask[1]) {
            substep[1] = rsubstep[1];
            updateTable(`${loc.pair7}${loc.colon}`, `${getWaitingType(rsubstep[1])}`);
        }
        if (rsubstep[2] === Infinity) rsubstep[2] = OrphanStep(tiles, false);
        if (mask && mask[2]) {
            substep[2] = rsubstep[2];
            updateTable(`${loc.orphan13}${loc.colon}`, `${getWaitingType(rsubstep[2])}`);
        }
        if (rsubstep[3] === Infinity) rsubstep[3] = full_tcnt - 1 - Bukao16Count(tiles);
        if (mask && mask[3]) {
            substep[3] = rsubstep[3];
            updateTable(`${loc.quanbukaoxing}${loc.colon}`, `${getWaitingType(rsubstep[3])}`);
        }
    }
    if (full_tcnt >= 9) {
        if (rsubstep[4] === Infinity) rsubstep[4] = KnitDragonStep(tiles, tcnt);
        if (mask && mask[4]) {
            substep[4] = rsubstep[4];
            updateTable(`${loc.zuhelongxing}${loc.colon}`, `${getWaitingType(rsubstep[4])}`);
        }
    }
    if (!mask) return rsubstep;
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
    output += makeTable(table);
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
    const r = printWaiting(stepGB, (s, d, g, f) => GBWaiting(tiles, s, substep, full_tcnt, f(save.waiting), d, g), () => GBPrecheck(tiles, stepGB, substep, full_tcnt, save.subchecks), () => Math.min(...maskMultiply(GBStep(), mask)), SeqCheck);
    output += r.output;
    return { output, substep: rsubstep, dvds };
}
function TWStep(mask, save, rsubstep = Array(4).fill(Infinity), dvds = Array(4)) {
    let table = "";
    const updateTable = (l, r) => table = updateTableGeneral(table, makeTableLineLR(l, r));
    let substep = Array(4).fill(Infinity);
    if (rsubstep[0] === Infinity) rsubstep[0] = Step(tiles, tcnt, full_tcnt);
    if (mask && mask[0]) {
        substep[0] = rsubstep[0];
        updateTable(`${loc.normal}${loc.colon}`, `${getWaitingType(substep[0])}`);
    }
    if (full_tcnt === 17 && subcnt === 0) {
        if (rsubstep[1] === Infinity) rsubstep[1] = NiconicoStep(tiles);
        if (mask && mask[1]) {
            substep[1] = rsubstep[1];
            updateTable(`${loc.niconico}${loc.colon}`, `${getWaitingType(substep[1])}`);
        }
        if (rsubstep[2] === Infinity) rsubstep[2] = OrphanMeldStep(tiles);
        if (mask && mask[2]) {
            substep[2] = rsubstep[2];
            updateTable(`${loc.orphan13}${loc.colon}`, `${getWaitingType(substep[2])}`);
        }
        if (rsubstep[3] === Infinity) rsubstep[3] = Buda16Step(tiles);
        if (mask && mask[3]) {
            substep[3] = rsubstep[3];
            updateTable(`${loc.shiliubudaxing}${loc.colon}`, `${getWaitingType(substep[3])}`);
        }
    }
    if (!mask) return rsubstep;
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
    output += makeTable(table);
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
    const r = printWaiting(stepTW, (s, d, g, f) => TWWaiting(tiles, s, substep, full_tcnt, f(save.waiting), d, g), () => TWPrecheck(tiles, stepTW, substep, full_tcnt, save.subchecks), () => Math.min(...maskMultiply(TWStep(), mask)), SeqCheck);
    output += r.output;
    return { output, substep: rsubstep, dvds };
}
function GBFanDiv(fan) {
    let fans = new Array(84).fill(0);
    for (let i = 0; i < fan.length; ++i)
        if (fan[i] > 0) ++fans[fan[i]];
        else --fans[-fan[i]];
    (fans[60] += fans[83]), (fans[61] += fans[83]);
    let fanopt = [];
    for (let i = 1; i <= 82; ++i) if (fans[i]) fanopt.push(`<tr><td class="waiting-brief">${loc._fanname_format_left}${loc[`GB_FANNAME_${i}`]}${loc._fanname_format_right}</td><td style="text-align: right; padding-left: 10px">${fans[i] < 0 ? "-" : ""}${GBScoreArray[i]} ${loc.GB_FAN_unit}</td><td>${Math.abs(fans[i]) > 1 ? `×${Math.abs(fans[i])}` : ""}</td></tr>`);
    return makeTable(fanopt.join(""));
}
let report = true;
function postDebugInfoGlobal(st, m, cm, output) {
    if (!report) return;
    const t = new Date() - st;
    const predict_t = Math.round((t * m) / cm);
    const rate = (cm / m) * 100;
    let debug = `Calculating...... / Calculated ${rate.toFixed(2)}% / Used ${t} ms / Estimated ${predict_t} ms / Remaining ${predict_t - t} ms`;
    postMessage({ debug, output });
}
function debugPermutation(p, title = "Permutation") {
    console.log(title, p.nots, p.nsubots, p.nots * p.nsubots);
}
function GBScore(substeps, gw, mw, wt, info, setting) {
    let [infov, infof] = [0, []];
    if (info.includes(46) && wt) (infov += 8), infof.push((wt = 46));
    if (info.includes(44))
        if (!wt) (infov += 8), infof.push(45);
        else if (setting[32] || wt !== 46) (infov += 8), infof.push(44), (wt = wt !== 46 ? 44 : 46);
    if (info.includes(47) && !wt) (infov += 8), infof.push(47);
    else if (info.includes(58)) (infov += 4), infof.push(58);
    const wint = aids[0].at(-1)?.id;
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
    if (substeps[0] === -1) p[6] = MeldsPermutation(aids, tiles), debugPermutation(p[6]);
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
            const other = [KnitDragonSave[i].slice(0, 3), KnitDragonSave[i].slice(3, 6), KnitDragonSave[i].slice(6, 9)];
            itots((ots, ota) => itsubots((subots) => cal(ots, ota, subots, ck, ek, GBKnitDragon, other)));
            postDebugInfo();
        }
    seqsave.clear(), trisave.clear();
    console.log(filter_cnt), filter_cnt = 0;
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
    const JPScoreArray = mq ? JPScoreArray0 : JPScoreArray1;
    if (i >= JPScoreArray.length) return `${1} ${loc.JP_FAN_unit}`;
    const s = JPScoreArray[i];
    if (s === -1) return `${loc.yakuman}`;
    if (s <= -2) return `${loc[`times_${-s}`]}${loc.yakuman}`;
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
    for (let i = 0; i < PrintSeq.length; ++i) if (fans[PrintSeq[i]]) fanopt.push(`<tr><td class="waiting-brief">${loc._fanname_format_left}${loc[`JP_YAKUNAME_${PrintSeq[i]}`]}${loc._fanname_format_right}</td><td style="text-align: right; padding-left: 10px">${JPGetFanCount(mq, PrintSeq[i])}</td><td>${fans[PrintSeq[i]] > 1 ? `×${fans[PrintSeq[i]]}` : ""}</td></tr>`);
    let fusopt = fus.map((i) => `<tr><td class="waiting-brief">${loc._fanname_format_left}${JPGetFuName(i)}${loc._fanname_format_right}</td><td style="text-align: right; padding-left: 10px">${JPFuArray[i]} ${loc.JP_FU_unit}</td></tr>`);
    return `<div style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap; padding: 0px;">${makeTable(fanopt.join(""))}${makeTable(fusopt.join(""))}</div>`;
}
function JPScore(substeps, gw, mw, tsumo, info, setting) {
    let gans = eans_jp;
    if (!setting[1]) for (let i = 0; i < JPScoreArray0.length; ++i) JPScoreArray0[i] = Math.max(-1, JPScoreArray0[i]), JPScoreArray1[i] = Math.max(-1, JPScoreArray0[i]);
    if (setting[17]) JPScoreArray0[48] = [0, 2, 1][setting[17]], JPScoreArray1[52] = 1;
    if (setting[21]) JPScoreArray0[52] = [0, 2, 2, 3, 2, 3][setting[21]], JPScoreArray1[52] = [0, 2, 1, 2, 0, 0][setting[21]];
    if (setting[22]) JPScoreArray0[53] = [0, -1, -1, 4, 5, 6, 6][setting[22]], JPScoreArray1[53] = [0, -1, 0, 4, 5, 6, 5][setting[22]];
    if (setting[23]) loc.JP_YAKUNAME_53 = loc.JP_YAKUNAME_53_EX;
    if (setting[40]) JPScoreArray0[67] = [0, 1, 2, 2, 2, 5, -1, -1][setting[40]], JPScoreArray1[67] = [0, 1, 2, 1, 0, 5, -1, 0][setting[40]];
    JPScoreArray0[29] = [3, 2, { id: 11, n: 2 }, 4][setting[47]];
    let infoans = { fan: [], valfan: 0, yakuman: 0, delete: 0 };
    let riichi = false;
    let aka = 0;
    for (let i = 0; i < aids[0].length; ++i) if (aids[0][i].sp) ++aka;
    for (let i = 0; i < aids[1].length; ++i) for (let j = 0; j < aids[1][i].length; ++j) if (aids[1][i][j].sp) ++aka;
    for (let i = 0; i < aids[2].length; ++i) if (aids[2][i].sp) ++aka;
    let nukicnt = aids[2].length;
    const p = MeldsPermutation(aids);
    debugPermutation(p);
    let searchList = [() => normalSearch(substeps, p)];
    const infoupdate = (id) => JPUpdateFan(infoans, setting, id);
    if (info.includes(32))
        if (tsumo)
            if (mw === 27) infoupdate(32);
            else infoupdate(33);
        else {
            const RenhouScoreArray = [0, 5, -1, 4, 6, 8];
            const renhou = (JPScoreArray0[30] = JPScoreArray1[30] = RenhouScoreArray[setting[9]]);
            if (renhou > 0 && setting[39]) fixYakuSearch(30, renhou);
            else infoupdate(30);
        }
    if (setting[38] && info.includes(16) && info.includes(13)) infoupdate(66);
    function canBeFixWin(t) {
        if (aids[0].length === 0) return false;
        const s = aids[0].at(-1).id;
        return [t, JokerA[t], JokerB[t], JokerC].includes(s);
    }
    if (!infoans.yakuman) {
        if (info.includes(16)) infoupdate(16), (riichi = true);
        else if (info.includes(1)) infoupdate(1), (riichi = true);
        if (riichi && info.includes(3)) infoupdate(3), (infoans.delete += setting[13] ? 0 : 1);
        if (info.includes(12) && tsumo) {
            infoupdate(12);
            if (setting[36] && canBeFixWin(13)) searchList.push(() => fixWinTileSearch(13, 12, 64, 1, 5));
        } else if (info.includes(13))
            if (tsumo) {
                infoupdate(13);
                if (setting[34] && canBeFixWin(9)) searchList.push(() => fixWinTileSearch(9, 13, 62, 1, 5));
            } else {
                iJPUpdateFan(infoans, 14);
                if (setting[35] && canBeFixWin(17)) searchList.push(() => fixWinTileSearch(17, 14, 63, 1, 5));
            }
        if (info.includes(15) && !tsumo) {
            infoupdate(15);
            if (setting[37] && canBeFixWin(19)) searchList.push(() => fixWinTileSearch(19, 15, 65, 1, 5));
        }
        if (setting[32] && info.includes(60) && !tsumo) infoupdate(60);
        if (setting[33] && info.includes(61) && !tsumo) infoupdate(61);
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
    function updateAns(ans) {
        if (ansYakuAri(gans) && ansYakuAri(ans) && replaceCheck(ans)) gans = ans;
        else if (!ansYakuAri(gans) && (ansYakuAri(ans) || replaceCheck(ans))) gans = ans;
    }
    function cal(ots, ota, subots, ck, ek) {
        updateAns(JPKernel([...ots, ...subots], infoans, gans, aids, ck, ek, gw, mw, tsumo, tiles, ota, doras, uras, nukis, setting));
        ++cm;
        if (!(cm & 1048575)) postDebugInfo();
    }
    function normalSearch(substeps, p) {
        if (substeps[1] === -1) updateAns(JP7Pairs(aids[0], infoans, tsumo, doras, uras, nukis, setting));
        if (substeps[2] === -1) {
            let tcp = tiles.slice();
            --tcp[aids[0].at(-1).id];
            let listen_13 = setting[1];
            for (let i = 0; listen_13 && i < Orphan13Array.length; ++i) {
                const rid = getRealId(tcp, Orphan13Array[i]);
                if (rid === -1) listen_13 = false;
                else --tcp[rid];
            }
            let kksans = { ...infoans, fan: infoans.fan.slice() };
            JPUpdateFan(kksans, setting, listen_13 ? 37 : 36);
            JPUpdateFan(kksans, setting, 25);
            if (setting[40] && !setting[42] && !setting[43]) JPUpdateFan(kksans, setting, 67);
            if (tsumo) JPUpdateFan(kksans, setting, 2);
            let [gd, gu] = [0, 0];
            let vaildora = nukis.slice();
            for (let i = 0; i < Orphan13Array.length; ++i) ++vaildora[Orphan13Array[i]];
            const head = OrphanOutput(tiles).at(-1)[0];
            for (let i = 0; i < Orphan13Array.length; ++i) {
                if (!isJokerEqual(head, Orphan13Array[i])) continue; 
                ++vaildora[Orphan13Array[i]];
                let [d, u] = getDoras(vaildora, doras, uras);
                if (d + u > gd + gu) [gd, gu] = [d, u];
                --vaildora[Orphan13Array[i]];
            }
            kksans.valfan += gd + gu;
            updateAns(getJPAnsUnion(setting, kksans, [8], 20, 20, gd, gu));
        }
        if (substeps[0] === -1) {
            const { err, itots, itsubots, ek, ck, nots, nsubots } = p;
            [cm, m] = [0, nots * nsubots];
            mq = ck === aids[1].length;
            itots((ots, ota) => itsubots((subots) => cal(ots, ota, subots, ck, ek)));
        }
    }
    function fixYakuSearch(fan, valfan) {
        let [gf, gvf, grf] = [[8], 20, 0];
        function calfu(ots, ota, subots, ck, ek) {
            let { listen_type, bilisten, valfus, fus } = JPGetFusMain([...ots, ...subots], aids, ck, gw, mw, tsumo, tiles, ota, setting);
            let realfus = 0;
            ({ valfus, fus, realfus } = JPGetFusRemain(1, undefined, tsumo, fus, valfus, listen_type, bilisten, setting, ots.length + subots.length >= 5 && subots.length === ck));
            if (realfus > grf) (gf = fus), (gvf = valfus), (grf = realfus);
        }
        if (substeps[0] === -1) {
            const { err, itots, itsubots, ck, ek } = p;
            itots((ots, ota) => itsubots((subots) => calfu(ots, ota, subots, ck, ek)));
        }
        if (substeps[1] === -1) {
            const SevenPairsFusArray = [25, 50, 100];
            const sf = (JPFuArray[10] = SevenPairsFusArray[setting[8]]);
            if (sf >= gvf) (gvf = grf = sf), (gf = [10]);
        }
        const ans = getJPAns(setting, [fan], valfan, 0, 0, gf, gvf, grf);
        if (ansYakuAri(gans) && ansYakuAri(ans) && replaceCheck(ans)) gans = ans;
        else if (!ansYakuAri(gans) && (ansYakuAri(ans) || replaceCheck(ans))) gans = ans;
    }
    function fixWinTileSearch(t, sf, tf, svf, tvf) {
        let i = infoans.fan.findIndex(e => e === sf);
        if (i === undefined) infoans.push(tf), infoans.valfan += tvf;
        else infoans.fan[i] = tf, infoans.valfan += tvf - svf;
        const s = aids[0].at(-1).id;
        --tiles[s], ++tiles[t];
        aids[0].at(-1).id = t;
        normalSearch(JPStep(), MeldsPermutation(aids));
        aids[0].at(-1).id = s;
        ++tiles[s], --tiles[t];
        if (i === undefined) infoans.pop(), infoans.valfan -= tvf;
        else infoans.fan[i] = sf, infoans.valfan += svf - tvf;
    }
    searchList.forEach((f) => f());
    if (gans.yakuman) aka = nukicnt = 0;
    const name = JPPrintName(gans.yakuman, gans.print);
    let base = gans.val;
    if (setting[45] === 1) base = Math.round(base / 10) * 10;
    else if (setting[45] === 2) base = Math.ceil(base / 100) * 100;
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
function ListenScore(f, sf) {
    report = false;
    let output = "";
    for (let i = 0; i < sizeUT; ++i) {
        aids[0].push({ id: i }), ++tiles[i], ++tcnt;
        const substeps = sf(false);
        const step = Math.min(...substeps);
        if (step === -1) {
            const ans = f(substeps);
            output += `<details ontoggle="ptsToggle(this)"><summary><span class="pts-brief">${cardImage(i)}${loc.colon}${ans.brief}</span><span class="pts-output" style="display: none;">${cardImage(i)}${loc.colon}${ans.output}</span></summary></details>`;
            postMessage({ output, debug: "Calculating......" });
        }
        aids[0].pop(), --tiles[i], --tcnt;
    }
    report = true;
    return output;
}
self.onmessage = function (e) {
    const st = new Date();
    if (e.data.lang) {
        setLoc(e.data.lang);
        for (const [key, val] of Object.entries(loc)) if (key[0] !== '_') loc[key] = `<span data-i18n="${key}">${val}</span>`;
    }
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
            if (full_tcnt === tcnt) result = GBScore(substeps, gw, mw, wt, info, setting);
            else result = { output: ListenScore((substeps) => GBScore(substeps, gw, mw, wt, info, setting), GBStep), brief: "" };
            break;
        }
        case "jp-score": {
            let { substeps, gw, mw, wt, info, setting } = e.data;
            if (full_tcnt === tcnt) result = JPScore(substeps, gw, mw, wt, info, setting);
            else result = { output: ListenScore((substeps) => JPScore(substeps, gw, mw, wt, info, setting), JPStep), brief: "" };
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
