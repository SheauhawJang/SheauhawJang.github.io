importScripts("mahjong.js");
importScripts("mahjong-score.js");
importScripts("mahjong-worker-lang.js");
const table_head = '<table style="border-collapse: collapse; padding: 0px">';
const table_tail = "</table>";
function cardImage(id) {
    return `<img src="./cards/a${cardName(id)}.gif" style="vertical-align: middle;">`;
}
function cardImageDivide(id) {
    return `<img src="./cards/${cardName(id)}.gif" class="no-card-div-img">`;
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
    output += `${loc.brace_left}${stepTypeJP.join(loc.slash)}${loc.brace_right}\n`;
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
        stepkd = KnitDragonStep(tiles, tcnt);
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
    output += `${loc.brace_left}${stepTypeGB.join(loc.slash)}${loc.brace_right}\n`;
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
            odvd.push(...ots.map((a) => `<div class="waiting-brief">${loc.quanbukaoxing}${loc.colon}</div><div class="card-container">${getWinningLine(a)}</div>`));
        }
        if (stepkd === -1) {
            let opt_size = 10 - odvd.length;
            if (step === -1) --opt_size;
            const ans = KnitDragonOutput(tiles, full_tcnt, opt_size);
            cnt += ans.cnt;
            odvd.push(...ans.ots.map((a) => `<div class="waiting-brief">${loc.zuhelongxing}${loc.colon}</div><div class="card-container">${getWinningLine(a)}</div>`));
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
    output += `${loc.brace_left}${stepTypeTW.join(loc.slash)}${loc.brace_right}\n`;
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
            odvd.push(...ots.map((a) => `<div class="waiting-brief">${loc.orphan13}${loc.colon}</div><div class="card-container">${getWinningLine(a)}</div>`));
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
function GBFanDiv(fan) {
    let fans = new Array(84).fill(0);
    for (let i = 0; i < fan.length; ++i)
        if (fan[i] > 0) ++fans[fan[i]];
        else --fans[-fan[i]];

    fans[60] += fans[83];
    fans[61] += fans[83];
    let fanopt = [];
    for (let i = 1; i <= 82; ++i) if (fans[i]) fanopt.push(`<tr><td class="waiting-brief">${loc[`GB_FANNAME_${i}`]}</td><td style="text-align: right; padding-left: 10px">${GBScoreArray[i]} ${loc.GB_FAN_unit}</td><td>${fans[i] > 1 ? `×${fans[i]}` : ""}</td></tr>`);

    return `${table_head}${fanopt.join("")}${table_tail}`;
}

function postDebugInfoGlobal(st, m, cm, output) {
    const t = new Date() - st;
    const predict_t = Math.round((t * m) / cm);
    const rate = (cm / m) * 100;
    let debug = `Calculating...... / Calculated ${rate.toFixed(2)}% / Used ${t} ms / Estimated ${predict_t} ms / Remaining ${predict_t - t} ms`;
    postMessage({ debug, output });
}
function GBScore(aids, substeps, save, gw, mw, wt, info) {
    let infov = 0;
    let infof = [];
    if (info.includes(44))
        if (wt) (infov += 8), infof.push((wt = 44));
        else (infov += 8), infof.push(45);
    if (info.includes(46) && wt) (infov += 8), infof.push((wt = 46));
    if (info.includes(47) && !wt) (infov += 8), infof.push(47);
    else if (info.includes(58)) (infov += 4), infof.push(58);
    const wint = aids[0].at(-1)?.id;
    let listen_cnt = save.waiting[wint]?.ans.length ?? 999;
    let gans = { val: 0, fan: [] };
    let cm = 0, m = 0, p = Array(7).fill(null);
    const tiles = getTiles(aids[0]);
    if (substeps[0] === -1) p[6] = MeldsPermutation(aids, tiles);
    if (substeps[1] === -1) ++m;
    if (substeps[2] === -1) ++m;
    if (substeps[4] === -1) {
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
        const otb = buildHand(tiles, ota, wint);
        for (let k = 0; k < ots.length; ++k)
            if (ots[k].length === 1) ++cp;
            else {
                if (wintf) continue;
                if (ots[k].length === 2) {
                    if (canBeListen(tiles, ota, otb, ots[k][0], wint)) wintf = 79;
                } else if (canBeListen(tiles, ota, otb, ots[k][0], wint)) wintf = 77;
                else if (canBeListen(tiles, ota, otb, ots[k][1], wint)) wintf = 78;
                else if (canBeListen(tiles, ota, otb, ots[k][2], wint)) wintf = 77;
            }
        if (wint && !wt && !wintf && !inMelds(others, wint)) --cp;
        let ans = f([...ots, ...subots, ...others], gans.val, aids, ck, ek, cp, gw, mw, wt, tiles, ota);
        if (listen_cnt < 2 && wintf) ++ans.val, ans.fan.push(wintf);
        ans.val += infov;
        ans.fan.push(...infof);
        if (ans.val > gans.val) gans = ans;
        ++cm;
        if (!(cm & 1048575)) postDebugInfo(); 
    }
    const st = new Date();
    if (substeps[1] === -1) {
        let pans = GB7Pairs(aids[0]);
        pans.val += infov;
        pans.fan.push(...infof);
        if (wt === 80) ++pans.val, pans.fan.push(80);
        if (pans.val > gans.val) gans = pans;
        ++cm;
        postDebugInfo();
    }
    if (substeps[2] === -1) {
        let pans = { val: 88 + infov, fan: [7, ...infof] };
        if (wt === 80) ++pans.val, pans.fan.push(80);
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
        else {
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
        }
        pans.val += infov;
        pans.fan.push(...infof);
        if (wt === 80) ++pans.val, pans.fan.push(80);
        if (pans.val > gans.val) gans = pans;
        ++cm;
        postDebugInfo();
    }
    if (substeps[0] === -1) {
        const nmp = Math.ceil(aids[0].length / 3) + aids[1].length;
        const { err, itots, itsubots, ek, ck } = p[6];
        if (err === 1) return { output: loc.subtile_error_1, brief: "" };
        if (err === 2) return { output: loc.subtile_error_2, brief: "" };
        if (aids[0].length === 2 && ck === 0 && !wt && nmp >= 5) (listen_cnt = 999), (infov += 6), infof.push(52);
        if (aids[0].length === 2 && aids[1].length === 4 && ck + ek === 4) listen_cnt = 999;
        itots((ots, ota) => itsubots((subots) => cal(ots, ota, subots, ck, ek, GBKernel)));
        if (gans.val === 0 && nmp >= 5) {
            gans.val = 8;
            gans.fan = [43];
        }
        postDebugInfo();
    }
    if (substeps[4] === -1) {
        for (let i = 0; i < 6; ++i) {
            if (!p[i]) continue;
            const { err, itots, itsubots, ek, ck } = p[i];
            if (err === 1) return { output: loc.subtile_error_1, brief: "" };
            if (err === 2) return { output: loc.subtile_error_2, brief: "" };
            const other = [KnitDragonSave[i].slice(0, 3), KnitDragonSave[i].slice(3, 6), KnitDragonSave[i].slice(6, 9)]
            itots((ots, ota) => itsubots((subots) => cal(ots, ota, subots, ck, ek, GBKnitDragon, other)));
            postDebugInfo();
        }
    }
    gans.val += aids[2].length;
    gans.fan.push(...Array(aids[2].length).fill(81));
    let ptchange = wt ? `${loc.winner} +${gans.val * 3 + 24}${loc.comma}${loc.other_player} -${gans.val + 8}` : `${loc.winner} +${gans.val + 24}${loc.comma}${loc.loser} -${gans.val + 8}${loc.comma}${loc.observer} -8`;
    outputs = [`${gans.val} ${loc.GB_FAN_unit}`, "\n", GBFanDiv(gans.fan), ptchange];
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
    if (JPScoreArray[i] === -1) return `${loc.yakuman}`;
    if (JPScoreArray[i] <= -2) return `${loc[`times_${-JPScoreArray[i]}`]}${loc.yakuman}`;
    const s = mq ? Math.ceil(JPScoreArray[i]) : Math.floor(JPScoreArray[i]);
    return `${s} ${loc.JP_FAN_unit}`;
}
function JPGetFuName(i) {
    if (i >= 8) return loc[`JP_FUNAME_${i}`];
    let opts = [
        i & 1 ? loc.JP_FUNAME_0_1 : loc.JP_FUNAME_0_0, 
        i & 2 ? loc.JP_FUNAME_1_1 : loc.JP_FUNAME_1_0, 
        i & 4 ? loc.JP_FUNAME_2_1 : loc.JP_FUNAME_2_0
    ];
    return opts.join('');
}
function JPFanFuDiv(fan, fus, mq, d, u, aka, nuki) {
    let fans = new Array(48).fill(0);
    for (let i = 0; i < fan.length; ++i)
        if (fan[i] > 0) ++fans[fan[i]];
    fans.push(d, u, aka, nuki);
    let fanopt = [];
    for (let i = 0; i < 51; ++i) if (fans[PrintSeq[i]]) fanopt.push(`<tr><td class="waiting-brief">${loc[`JP_YAKUNAME_${PrintSeq[i]}`]}</td><td style="text-align: right; padding-left: 10px">${JPGetFanCount(mq, PrintSeq[i])}</td><td>${fans[PrintSeq[i]] > 1 ? `×${fans[PrintSeq[i]]}` : ""}</td></tr>`);
    let fusopt = fus.map((i) => `<tr><td class="waiting-brief">${JPGetFuName(i)}</td><td style="text-align: right; padding-left: 10px">${JPFuArray[i]} ${loc.JP_FU_unit}</td></tr>`);
    return `<div style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap; padding: 0px;">${table_head}${fanopt.join("")}${table_tail}${table_head}${fusopt.join("")}${table_tail}</div>`;
}
function JPScore(aids, substeps, gw, mw, tsumo, info, setting) {
    if (!setting[1]) for (let i = 0; i < JPScoreArray.length; ++i) if (JPScoreArray[i] <= -2) JPScoreArray[i] = -1;
    let infoans = { fan: [], valfan: 0, yakuman: 0, delete: 0 };
    let riichi = false;
    let aka = 0;
    for (let i = 0; i < aids[0].length; ++i) if ('sp' in aids[0][i]) ++aka;
    for (let i = 0; i < aids[1].length; ++i) for (let j = 0; j < aids[1][i].length; ++j) if ('sp' in aids[1][i][j]) ++aka;
    for (let i = 0; i < aids[2].length; ++i) if ('sp' in aids[2][i]) ++aka;
    let nukicnt = aids[2].length;
    if (info.includes(32)) {
        if (tsumo) 
            if (mw === 27) infoans.fan.push(32), ++infoans.yakuman;
            else infoans.fan.push(33), ++infoans.yakuman;
        else if (mw !== 27) 
            if (setting[9] === 1) infoans.fan.push(30), infoans.valfan += 5;
            else if (setting[9] === 2) infoans.fan.push(30), ++infoans.yakuman, JPScoreArray[30] = -1;
    }
    if (!infoans.yakuman) {
        if (info.includes(16)) infoans.fan.push(16), infoans.valfan += 2, riichi = true;
        else if (info.includes(1)) infoans.fan.push(1), ++infoans.valfan, riichi = true;
        if (riichi && info.includes(3)) infoans.fan.push(3), ++infoans.valfan, infoans.delete += setting[13] ? 0 : 1;
        if (info.includes(12) && tsumo) infoans.fan.push(12), ++infoans.valfan;
        else if (info.includes(13)) 
            if (tsumo) infoans.fan.push(13), ++infoans.valfan;
            else infoans.fan.push(14), ++infoans.valfan;
        if (info.includes(15) && !tsumo) infoans.fan.push(15), ++infoans.valfan;
        infoans.valfan += aka + nukicnt;
        infoans.delete += setting[12] ? 0 : aka + nukicnt;
    }
    let gans = eans_jp;
    const tiles = getTiles(aids[0]);
    let cm = 0, m = 0;
    const p = MeldsPermutation(aids);
    let mq = aids[1].length === 0;
    const nukis = getTiles(aids[2]);
    let doras = getTiles(aids[3]);
    let uras = getTiles(riichi ? aids[4] : []);
    doras = doras.map((_, i) => doras[getDoraPointer(i)]);
    uras = uras.map((_, i) => uras[getDoraPointer(i)]);
    const st = new Date();
    const postDebugInfo = () => postDebugInfoGlobal(st, m, cm, ``);
    function ansYakuAri(ans) {
        let limit = setting[0];
        if (!ans.yakuman && setting[11]) 
            if (!setting[3]) return false; 
            else limit = Math.max(limit, 13);
        return ans.yakuman || (ans.valfan - (setting[12] ? 0 : ans.dora) - ans.ura - infoans.delete >= limit);
    }
    function cal(ots, ota, subots, ck, ek) {
        const ans = JPKernel([...ots, ...subots], infoans, gans, aids, ck, ek, gw, mw, tsumo, tiles, ota, doras, uras, nukis, setting);
        function replaceCheck() {
            if (ans.val > gans.val) return true;
            else if (ans.val === gans.val)
                if (ans.yakuman > gans.yakuman) return true;
                else if (ans.yakuman === gans.yakuman) 
                    if (ans.realyakuman > gans.realyakuman) return true;
                    else if (ans.realyakuman === gans.realyakuman)
                        if (ans.valfan > gans.valfan) return true;
                        else if (ans.valfan === gans.valfan)
                            if (ans.realfus > gans.realfus) return true;
        }
        if (ansYakuAri(gans) && ansYakuAri(ans) && replaceCheck()) gans = ans;
        else if (!ansYakuAri(gans) && (ansYakuAri(ans) || replaceCheck())) gans = ans;
        ++cm;
        if (!(cm & 1048575)) postDebugInfo(); 
    }
    if (substeps[1] === -1) gans = JP7Pairs(aids[0], infoans, tsumo, doras, uras, nukis, setting);
    if (substeps[2] === -1) {
        let tcp = tiles.slice();
        --tcp[aids[0].at(-1).id];
        let listen_13 = setting[1];
        for (let i = 0; listen_13 && i < Orphan13Array.length; ++i) {
            const rid = getRealId(tcp, Orphan13Array[i]);
            if (rid === -1) listen_13 = false;
            else --tcp[rid];
        }
        let yakuman = (listen_13 ? 2 : 1);
        yakuman = setting[2] ? yakuman + infoans.yakuman : Math.max(yakuman, infoans.yakuman);
        let f = [listen_13 ? 37 : 36];
        if (infoans.yakuman > 0) f.push(infoans.fan);
        const valfan = 0, valfus = 20, realfus = 20, fus = [8], pt = yakuman * 8000;
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
    const realpt = (x) => Math.ceil(x / 100) * 100;
    let score, exinfo = "";
    if (tsumo) 
        if (mw === 27) score = realpt(gans.val * 2) * 3, exinfo = `${realpt(gans.val * 2)}∀`;
        else score = realpt(gans.val * 2) + realpt(gans.val) * 2, exinfo = `${realpt(gans.val)}${loc.slash}${realpt(gans.val * 2)}`;
    else 
        if (mw === 27) score = realpt(gans.val * 6);
        else score = realpt(gans.val * 4);
    if (tsumo) exinfo = loc.brace_left + exinfo + loc.brace_right;
    const ptchange = ansYakuAri(gans) ? `+${score} ${exinfo}` : `${loc.wrong_win}`;
    const namebrace = name === "" ? name : `${loc.brace_left}${name}${loc.brace_right}`;
    const fanfuinfo = gans.yakuman ? name : gans.valfus >= 20 ? `${gans.valfan} ${loc.JP_FAN_unit} ${gans.valfus} ${loc.JP_FU_unit}${namebrace}` : "";
    const fanfudiv = JPFanFuDiv(gans.fan, gans.fus, mq, gans.dora ?? 0, gans.ura ?? 0, aka, nukicnt);
    const opts = [fanfuinfo, fanfudiv, ptchange];
    return { output: opts.join(''), brief: `${fanfuinfo}${loc.comma}${ptchange}` };
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
            break;
        }
        case "jp-score": {
            let { aids, substeps, gw, mw, wt, info, setting } = e.data;
            result = JPScore(aids, substeps, gw, mw, wt, info, setting);
            break;
        }
    }
    const ed = new Date();
    postMessage({ result, time: ed - st });
};