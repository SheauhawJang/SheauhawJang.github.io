let aids;
let worker = null;
function processInput() {
    if (worker) {
        worker.terminate();
        worker = null;
    }
    const document_element_ids = ["output-std", "output-jp", "output-gb", "output-tw"];
    for (let i = 0; i < document_element_ids.length; ++i) {
        document.getElementById(document_element_ids[i]).innerHTML = "";
        document.getElementById("brief-" + document_element_ids[i]).innerHTML = "";
        document.getElementById("time-" + document_element_ids[i]).textContent = `Calculating......`;
    }
    const document_scores_ids = ["score-gb", "score-jp", "score-qingque"];
    const workers_scores = [gb_worker, jp_worker, qingque_worker];
    for (let i = 0; i < document_scores_ids.length; ++i) {
        const e = document.getElementById(document_scores_ids[i]);
        if (e) e.style.display = "none";
        if (workers_scores[i]) workers_scores[i].terminate();
    }
    const input = document.getElementById("inputText").value;
    aids = splitTiles(input);
    let tids = aids[0];
    let bids = aids[2];
    let tiles = getTiles(tids);
    let subtiles = getTiles([...aids[2], ...aids[3], ...aids[4]]);
    for (let i = 0; i < aids[1].length; ++i) {
        const ids = aids[1][i];
        for (let j = 0; j < ids.length; ++j) ++subtiles[ids[j].id];
    }
    let tcnt = tids.length;
    let full_tcnt = tcnt;
    if (tcnt % 3 === 1) ++full_tcnt;
    const subcnt = aids[1].length;
    document.getElementById("output-cnt").textContent = tilesInfo(tcnt);
    document.getElementById("output-pic").innerHTML = tilesImage(tids) + subtilesImage(aids[1], tcnt);
    document.getElementById("output-pic-bonus").innerHTML = tilesImage(bids, 1);
    document.getElementById("output-pic-doras").innerHTML = tilesImage(aids[3], 2);
    document.getElementById("output-pic-uras").innerHTML = tilesImage(aids[4], 2);
    document.getElementsByClassName("output-box-head")[0].style.display = "block";
    worker = new Worker("mahjong-worker.js");
    let task = 0;
    let save = Array(4);
    let dvd, dvd7, dvd13;
    let substeps = Array(4);
    worker.onmessage = function (e) {
        if ("brief" in e.data) document.getElementById("brief-" + document_element_ids[task]).textContent = e.data.brief;
        if ("output" in e.data) {
            document.getElementById(document_element_ids[task]).innerHTML = e.data.output;
            return;
        }
        const { result, time } = e.data;
        document.getElementById(document_element_ids[task]).innerHTML = result.output;
        document.getElementById("time-" + document_element_ids[task]).textContent = `Used ${time} ms`;
        if (useHelper()) addWorkerCardHelper();
        updateCardSkin();
        switch (task) {
            case 0:
                substeps[0] = result.step;
                dvd = result.dvd;
                break;
            case 1:
                dvd7 = result.dvd7;
                dvd13 = result.dvd13;
                break;
        }
        if (task > 0) substeps[task] = result.substep;
        save[task] = result.save;
        switch (task) {
            case 1:
                if (Math.min(...substeps[task]) === -1) {
                    document.getElementById("output-score-jp").textContent = "";
                    document.getElementById("brief-output-score-jp").textContent = "";
                    document.getElementById("time-output-score-jp").textContent = "Ready to start!";
                    document.getElementById("score-jp").style.display = "block";
                    jp_worker = null;
                    jp_worker_info = { aids, substeps: substeps[task] };
                }
                break;
            case 2:
                if (Math.min(...substeps[task]) === -1) {
                    document.getElementById("output-score-gb").textContent = "";
                    document.getElementById("brief-output-score-gb").textContent = "";
                    document.getElementById("time-output-score-gb").textContent = "Ready to start!";
                    document.getElementById("score-gb").style.display = "block";
                    gb_worker = null;
                    gb_worker_info = { aids, substeps: substeps[task], save: save[task] };
                }
                if (Math.min(substeps[1][0], substeps[2][1]) === -1) {
                    let show_qingque = Boolean(document.getElementById("score-qingque"));
                    if (aids[0].length + aids[1].length * 3 !== 14) show_qingque = false;
                    for (let i = 0; show_qingque && i < aids[0].length; ++i) if (aids[0][i].id >= sizeUT) show_qingque = false;
                    let stiles = tiles.slice();
                    for (let i = 0; show_qingque && i < aids[1].length; ++i)
                        for (let j = 0; j < aids[1][i].length; ++j)
                            if (aids[1][i][j].id >= sizeUT) show_qingque = false;
                            else ++stiles[aids[1][i][j].id];
                    for (let i = 0; show_qingque && i < sizeUT; ++i) if (stiles[i] > 4) show_qingque = false;
                    if (show_qingque) {
                        document.getElementById("output-score-qingque").textContent = "";
                        document.getElementById("brief-output-score-qingque").textContent = "";
                        document.getElementById("time-output-score-qingque").textContent = "Ready to start!";
                        document.getElementById("score-qingque").style.display = "block";
                        qingque_worker = null;
                        qingque_worker_info = { aids, substeps: [substeps[1][0], substeps[2][1]] };
                    }
                }
                break;
        }
        ++task;
        switch (task) {
            case 0:
            case 1:
                worker.postMessage({ task, tiles, tcnt, full_tcnt, subtiles, subcnt, dvd });
                break;
            case 2:
                worker.postMessage({ task, tiles, tcnt, full_tcnt, subtiles, subcnt, step: substeps[0], save: save[0], step13: substeps[1][2], dvd, dvd7, dvd13 });
                break;
            case 3:
                worker.postMessage({ task, tiles, tcnt, full_tcnt, subtiles, subcnt, step: substeps[0], save: save[0], dvd });
                break;
            case 4:
                worker.terminate();
                worker = null;
                break;
        }
    };
    worker.postMessage({ task, tiles, tcnt, full_tcnt, subtiles, subcnt, lang });
}
function randomInput() {
    function shuffle(array) {
        for (let i = 0; i < array.length; ++i) {
            const j = Math.floor(Math.random() * (array.length - i));
            [array[i], array[i + j]] = [array[i + j], array[i]];
        }
        return array;
    }
    let mount = new Array(136);
    for (let i = 0; i < mount.length; ++i) mount[i] = Math.floor(i / 4);
    shuffle(mount);
    const n = Math.min(parseInt(document.getElementById("randomCardCount").value), mount.length);
    let hand = [];
    for (let i = 0; i < n; ++i) hand.push(mount[i]);
    hand.sort((a, b) => a - b);
    let handname = [];
    for (let i = 0; i < n; ++i) {
        handname.push(cardName(hand[i]));
        if (handname.length >= 2) if (handname[i][1] === handname[i - 1][1]) handname[i - 1] = handname[i - 1][0];
    }
    document.getElementById("inputText").value = handname.join("");
    drawInputCards();
    processInput();
}
function getCardHelperFontSize(width, unit) {
    const bodyWidth = document.body.clientWidth || document.documentElement.clientWidth;
    let fontSize = width * 0.3;
    if (unit === "%") fontSize *= bodyWidth / 100;
    return fontSize;
}
function useHelper() {
    return typeof card_helper !== "undefined" && card_helper;
}
function getCardHelperDiv(tile, width, unit = "%") {
    if (!useHelper()) return "";
    const id = tile.id;
    const helper = HelperArray[id] ?? "";
    const fontSize = getCardHelperFontSize(width, unit);
    return `<span class="card-helper" style="font-size: ${fontSize}px">${helper}</span>`;
}
let cardskin = "jp";
function hasGBCard(id) {
    if ("sp" in id) return false;
    if (id.id >= JokerC) return false;
    return true;
}
function hasQQCard(id) {
    if (id.id === JokerC) return true;
    if (id.id === JokerC + 7) return true;
    if ("sp" in id) return false;
    if (id.id >= JokerC + 4) return false;
    return true;
}
function getCardImage(id, t = "", onclick = "") {
    if (cardskin === "qq" && hasQQCard(id)) {
        let gboverlay = `<img src="./qqcards/${cardName(id)}.png" class="card-img-overlay">`;
        if (t === "r") gboverlay = `<img src="./qqcards/${cardName(id)}.png" class="card-img-overlay-r">`;
        if (t === "k") gboverlay = `<img src="./qqcards/${cardName(id)}.png" class="card-img-overlay-rr-0"><img src="./qqcards/${cardName(id)}.png" class="card-img-overlay-rr-1">`;
        return `${gboverlay}<img src="./cards/${t}5z.gif"${onclick === "" ? "" : ` onclick="${onclick}" class="clickable"`}>`;
    }
    if (cardskin === "gb" && hasGBCard(id)) {
        let gboverlay = `<img src="./gbcards/${cardName(id)}.gif" class="card-img-overlay">`;
        if (t === "r") gboverlay = `<img src="./gbcards/${cardName(id)}.gif" class="card-img-overlay-r">`;
        if (t === "k") gboverlay = `<img src="./gbcards/${cardName(id)}.gif" class="card-img-overlay-rr-0"><img src="./gbcards/${cardName(id)}.gif" class="card-img-overlay-rr-1">`;
        return `${gboverlay}<img src="./cards/${t}5z.gif"${onclick === "" ? "" : ` onclick="${onclick}" class="clickable"`}>`;
    }
    if (cardskin === "hk" && hasGBCard(id)) {
        let gboverlay = `<img src="./hkcards/${cardName(id)}.png" class="card-img-overlay">`;
        if (t === "r") gboverlay = `<img src="./hkcards/${cardName(id)}.png" class="card-img-overlay-r">`;
        if (t === "k") gboverlay = `<img src="./hkcards/${cardName(id)}.png" class="card-img-overlay-rr-0"><img src="./hkcards/${cardName(id)}.png" class="card-img-overlay-rr-1">`;
        return `${gboverlay}<img src="./cards/${t}5z.gif"${onclick === "" ? "" : ` onclick="${onclick}" class="clickable"`}>`;
    }
    return `<img src="./cards/${t}${cardName(id)}.gif"${onclick === "" ? "" : ` onclick="${onclick}" class="clickable"`}>`;
}
function outputCardImage(tids, i, width, link) {
    return `<div class="card-div" style="width: ${width}%;">${link ? `<div class="card-overlay"></div>` : ""}${getCardHelperDiv(tids[i], width)}${getCardImage(tids[i], "", link ? `discard(${i})` : "")}</div>`;
}
function outputCardImageRotated(id, width, cnt) {
    return `<div class="card-div" style="width: ${(width * 120) / 80}%;">${getCardImage(id, cnt === 2 ? "k" : "r")}</div>`;
}
function outputCardImageBack(width) {
    return `<div class="card-div" style="width: ${width}%;"><img src="./cards/b.png"></div>`;
}
function outputCardImageEmpty(width) {
    return `<div class="card-div" style="width: ${width / 5}%;"></div>`;
}
function joinHand(ids) {
    let handname = [];
    for (let i = 0; i < ids.length; ++i) {
        handname.push(cardName(ids[i]));
        if (handname.length >= 2) if (handname[i][1] === handname[i - 1][1]) handname[i - 1] = handname[i - 1][0];
    }
    return handname.join("");
}
function discard(i) {
    let tids = aids[0];
    let bids = aids[2];
    let tiles = getTiles([...tids, ...bids]);
    for (let i = 0; i < aids[1].length; ++i) {
        const ids = aids[1][i];
        for (let j = 0; j < ids.length; ++j) ++tiles[ids[i].id];
    }
    let mount = [];
    for (let i = 0; i < sizeUT; ++i) for (let j = 0; j < 4 - tiles[i]; ++j) mount.push(i);
    if (mount.length === 0) return;
    tids.splice(i, 1);
    tids.sort((a, b) => a.id - b.id);
    tids.push({ id: mount[Math.floor(Math.random() * mount.length)] });
    remakeInput(aids);
    drawInputCards();
    processInput();
}
function tilesImage(tids, bonus) {
    let output = "";
    let width = 5;
    let max_card = 35;
    if (window.matchMedia("screen and (max-width: 512px)").matches) (width = 7), (max_card = 20);
    if (tids.length >= max_card) width = 100 / max_card;
    else if (tids.length >= 100 / width) width = 100 / tids.length;
    if (bonus === 1) width *= 0.5;
    if (bonus === 2 && !window.matchMedia("screen and (max-width: 512px)").matches) width *= 0.5;
    for (let i = 0; i < tids.length; ++i) output += outputCardImage(tids, i, width, !bonus);
    if (bonus === 2) for (let i = tids.length; i < 5; ++i) output += outputCardImageBack(width);
    return output;
}
function getUnifiedType(s) {
    let t = s.type;
    if (s.length >= 4) return pmod(t, 8);
    return Math.min(Math.max(t, 1), 3);
}
function getRotatedLocation(t, l) {
    let rloc = t % 4;
    if (rloc === 3) {
        rloc = l;
        if (t > 3) --rloc;
    }
    --rloc;
    return rloc;
}
function subtilesImage(sids, tcnt) {
    let output = "";
    let width = 5;
    let max_card = 35;
    if (window.matchMedia("screen and (max-width: 512px)").matches) {
        width = 7;
        max_card = 20;
    }
    if (tcnt >= max_card) width = 100 / max_card;
    else if (tcnt >= 100 / width) width = 100 / tcnt;
    for (let i = 0; i < sids.length; ++i) {
        output += outputCardImageEmpty(width);
        let t = getUnifiedType(sids[i]);
        if (t % 4 === 0)
            for (let j = 0; j < sids[i].length; ++j)
                if (j === 0 || j === sids[i].length - 1) output += outputCardImageBack(width);
                else output += outputCardImage(sids[i], j, width, false);
        else {
            let rloc = getRotatedLocation(t, sids[i].length);
            let seq = isSeq(sids[i].map((a) => a.id).sort((a, b) => a - b));
            if (seq) output += outputCardImageRotated(sids[i][rloc], width, 1);
            for (let j = 0; j < sids[i].length; ++j)
                if (j === rloc)
                    if (seq) continue;
                    else if (t > 3) output += outputCardImageRotated(sids[i][j++], width, 2);
                    else output += outputCardImageRotated(sids[i][j], width, 1);
                else output += outputCardImage(sids[i], j, width, false);
        }
    }
    return output;
}
// Input Panel Functions
let ipids;
function inputCardImage(ids, i, j, width, unit) {
    return `<div class="card-div" style="width: ${width}${unit};"><div class="card-overlay"></div>${getCardHelperDiv(ids[i], width, unit)}${getCardImage(ids[i], "", `removeInput(${i}, ${j}, 0)`)}</div>`;
}
function inputCardImageRotated(ids, i, j, width, unit, cnt) {
    return `<div class="card-div" style="width: ${(width * 120) / 80}${unit};"><div class="card-overlay"></div>${getCardImage(ids[i], cnt === 2 ? "k" : "r", `removeInput(${i}, ${j}, 1)`)}</div>`;
}
function inputCardImageBack(i, j, width, unit) {
    return `<div class="card-div" style="width: ${width}${unit};"><div class="card-overlay"></div><img src="./cards/b.png" onclick="removeInput(${i}, ${j}, 0)" class="clickable"></div>`;
}
function inputCardImageEmpty(width, unit) {
    return `<div class="card-div" style="width: ${width / 5}${unit};"></div>`;
}
function drawInputCards() {
    ipids = splitTiles(document.getElementById("inputText").value);
    const div = document.getElementById("input-pic");
    let output = "";
    let width = 400 / 14;
    let height = (400 * 171) / 14 / 80;
    let sheight = (400 * 129) / 14 / 80;
    let rheight = 0;
    let unit = "px";
    if (window.matchMedia("screen and (max-width: 512px)").matches) {
        width = div.clientWidth / 20;
        height = (div.clientWidth * 171) / 20 / 80;
        sheight = (div.clientWidth * 129) / 20 / 80;
        unit = "px";
    }
    const tids = ipids[0];
    for (let i = 0; i < tids.length; ++i) (output += inputCardImage(tids, i, -1, width, unit)), (rheight = sheight);
    const sids = ipids[1];
    for (let i = 0; i < sids.length; ++i) {
        output += inputCardImageEmpty(width, unit);
        let t = getUnifiedType(sids[i]);
        if (t % 4 === 0) {
            for (let j = 0; j < sids[i].length; ++j)
                if (j === 0 || j === sids[i].length - 1) output += inputCardImageBack(j, i, width, unit);
                else output += inputCardImage(sids[i], j, i, width, unit);
            rheight = Math.max(rheight, sheight);
        } else {
            let rloc = getRotatedLocation(t, sids[i].length);
            let seq = isSeq(sids[i].map((a) => a.id).sort((a, b) => a - b));
            if (seq) output += inputCardImageRotated(sids[i], rloc, i, width, unit, 1);
            for (let j = 0; j < sids[i].length; ++j)
                if (j === rloc)
                    if (seq) continue;
                    else if (t > 3) output += inputCardImageRotated(sids[i], j++, i, width, unit, 2);
                    else output += inputCardImageRotated(sids[i], j, i, width, unit, 1);
                else output += inputCardImage(sids[i], j, i, width, unit, false);
            if (t > 3) rheight = height;
            else rheight = Math.max(rheight, sheight);
        }
    }
    div.style.paddingTop = `${height - rheight}${unit}`;
    div.innerHTML = output;
    output = "";
    const bonusd = document.getElementById("input-pic-bonus");
    const bids = ipids[2];
    for (let i = 0; i < bids.length; ++i) output += inputCardImage(bids, i, -2, width, unit);
    bonusd.innerHTML = output;
    if (bids.length === 0) bonusd.innerHTML = `<div class="card-div" style="width: ${width}${unit};"><img src="./cards/e.png"></div>`;
    output = "";
    const dorap = document.getElementById("input-pic-dorap");
    const dorapids = ipids[3];
    for (let i = 0; i < dorapids.length; ++i) output += inputCardImage(dorapids, i, -3, width, unit);
    for (let i = dorapids.length; i < 5; ++i) output += inputCardImageBack(i, -3, width, unit);
    dorap.innerHTML = output;
    output = "";
    const urap = document.getElementById("input-pic-urap");
    const urapids = ipids[4];
    for (let i = 0; i < urapids.length; ++i) output += inputCardImage(urapids, i, -4, width, unit);
    for (let i = urapids.length; i < 5; ++i) output += inputCardImageBack(i, -4, width, unit);
    urap.innerHTML = output;
    document.getElementById("subkey_chi").disabled = !isSeq(
        tids
            .slice(-3)
            .map((a) => a.id)
            .sort((a, b) => a - b)
    );
    const noflower = document.getElementsByClassName("enabled-no-flower");
    for (let i = 0; i < noflower.length; ++i) noflower[i].disabled = tids.length === 0 || isFlower(tids.at(-1).id);
    const noempty = document.getElementsByClassName("enable-no-empty");
    for (let i = 0; i < noempty.length; ++i) noempty[i].disabled = tids.length === 0;
}
function remakeInput(ipids) {
    let newInput = joinHand(ipids[0]);
    for (let i = 0; i < ipids[1].length; ++i) {
        const partInput = joinHand(ipids[1][i]);
        if (ipids[1][i].type) newInput += `[${partInput},${ipids[1][i].type}]`;
        else newInput += `[${partInput}]`;
    }
    if (ipids[2].length > 0) newInput += `(${joinHand(ipids[2])})`;
    if (ipids[3].length > 0 || ipids[4].length > 0) newInput += `<${joinHand(ipids[3])},${joinHand(ipids[4])}>`;
    document.getElementById("inputText").value = newInput;
}
function addInput(i) {
    if (typeof i === "number") i = { id: i };
    document.getElementById("inputText").value += " ";
    document.getElementById("inputText").value += cardName(i);
    drawInputCards();
}
function removeInput(i, j, k) {
    if (j === -1) ipids[0].splice(i, 1);
    else if (j <= -2)
        // ipids[0].push(ipids[2][i]);
        ipids[-j].splice(i, 1);
    else {
        let t = getUnifiedType(ipids[1][j]);
        if (t % 4 === 0 || k === 1)
            // for (let i = 0; i < ipids[1][j].length; ++i) ipids[0].push(ipids[1][j][i]);
            ipids[1].splice(j, 1);
        else {
            let nt = 2;
            if (i < 1) nt = 1;
            else if (i === ipids[1][j].length - 1) nt = 3;
            if (t > 3) nt += 4;
            ipids[1][j].type = nt;
        }
    }
    remakeInput(ipids);
    drawInputCards();
}
function clearInput() {
    document.getElementById("inputText").value = "";
    drawInputCards();
}
function sortInput() {
    ipids[0].sort((a, b) => a.id - b.id);
    remakeInput(ipids);
    drawInputCards();
}
function subtileInput(t, k) {
    switch (t) {
        default:
            ipids[1].push(ipids[0].slice(-3));
            ipids[0].splice(-3);
            break;
        case 1:
            if (isTri(ipids[0].slice(-3).map((a) => a.id))) {
                ipids[1].push(ipids[0].slice(-3));
                ipids[0].splice(-3);
            } else {
                ipids[1].push(Array(3).fill(ipids[0].at(-1)));
                ipids[0].pop();
            }
            break;
        case 2:
            if (isQuad(ipids[0].slice(-4).map((a) => a.id))) {
                ipids[1].push(ipids[0].slice(-4));
                ipids[0].splice(-4);
            } else {
                ipids[1].push(Array(4).fill(ipids[0].at(-1)));
                ipids[0].pop();
            }
            ipids[1].at(-1).type = k;
            break;
        case 3:
            ipids[2].push(ipids[0].at(-1));
            ipids[0].pop();
            break;
        case 4:
            ipids[3].push(ipids[0].at(-1));
            ipids[0].pop();
            break;
        case 5:
            ipids[4].push(ipids[0].at(-1));
            ipids[0].pop();
            break;
    }
    remakeInput(ipids);
    drawInputCards();
}
// Score workers
let gb_worker = null;
let gb_worker_info;
function processGBScore() {
    if (gb_worker) {
        gb_worker.terminate();
        gb_worker = null;
    }
    document.getElementById("output-score-gb").textContent = "";
    document.getElementById("brief-output-score-gb").textContent = "";
    document.getElementById("time-output-score-gb").textContent = "Calculating......";
    const gw = Number(document.querySelector('input[name="score-gb-global-wind"]:checked').value);
    const mw = Number(document.querySelector('input[name="score-gb-local-wind"]:checked').value);
    const wt = Number(document.querySelector('input[name="score-gb-wintype"]:checked').value);
    let info = document.querySelectorAll('input[name="score-gb-wininfo"]:checked');
    info = Array.from(info).map((x) => Number(x.value));
    let sq = Array.from(document.querySelectorAll('input[name="score-gb-setting"]:checked'));
    for (let i = 0; i <= 3; ++i) {
        const ssq = Array.from(document.querySelectorAll(`input[name="score-gb-setting-${i}"]:checked`));
        sq.push(...ssq);
    }
    let setting = Array(26).fill(0);
    for (let i = 0; i < sq.length; ++i) {
        const [a, b] = sq[i].value.split(",");
        if (Number(a) === 0 && b === undefined) continue;
        setting[a] = Number(b ?? 1);
    }
    gb_worker = new Worker("mahjong-worker.js");
    gb_worker.onmessage = function (e) {
        if ("debug" in e.data) {
            document.getElementById("time-output-score-gb").textContent = e.data.debug;
            document.getElementById("output-score-gb").innerHTML = e.data.output;
            return;
        }
        gb_worker.terminate();
        gb_worker = null;
        document.getElementById("output-score-gb").innerHTML = e.data.result.output;
        document.getElementById("brief-output-score-gb").innerHTML = e.data.result.brief;
        document.getElementById("time-output-score-gb").textContent = `Used ${e.data.time} ms`;
    };
    const { aids, substeps, save } = gb_worker_info;
    gb_worker.postMessage({ task: "gb-score", aids, substeps, save, gw, mw, wt, info, lang, setting });
}
let jp_worker = null;
let jp_worker_info;
function processJPScore() {
    if (jp_worker) {
        jp_worker.terminate();
        jp_worker = null;
    }
    document.getElementById("output-score-jp").textContent = "";
    document.getElementById("brief-output-score-jp").textContent = "";
    document.getElementById("time-output-score-jp").textContent = "Calculating......";
    const gw = Number(document.querySelector('input[name="score-jp-global-wind"]:checked').value);
    const mw = Number(document.querySelector('input[name="score-jp-local-wind"]:checked').value);
    const wt = Number(document.querySelector('input[name="score-jp-wintype"]:checked').value);
    let info = document.querySelectorAll('input[name="score-jp-wininfo"]:checked');
    info = Array.from(info).map((x) => Number(x.value));
    let sq = Array.from(document.querySelectorAll('input[name="score-jp-setting"]:checked'));
    for (let i = 0; i <= 10; ++i) {
        const ssq = Array.from(document.querySelectorAll(`input[name="score-jp-setting-${i}"]:checked`));
        sq.push(...ssq);
    }
    let setting = Array(17).fill(0);
    for (let i = 0; i < sq.length; ++i) {
        const [a, b] = sq[i].value.split(",");
        setting[a] = Number(b ?? 1);
    }
    setting[0] = Number(document.getElementById("score-jp-setting-fan")?.value ?? 1);
    jp_worker = new Worker("mahjong-worker.js");
    jp_worker.onmessage = function (e) {
        if ("debug" in e.data) {
            document.getElementById("time-output-score-jp").textContent = e.data.debug;
            document.getElementById("output-score-jp").innerHTML = e.data.output;
            return;
        }
        jp_worker.terminate();
        jp_worker = null;
        document.getElementById("output-score-jp").innerHTML = e.data.result.output;
        document.getElementById("brief-output-score-jp").innerHTML = e.data.result.brief;
        document.getElementById("time-output-score-jp").textContent = `Used ${e.data.time} ms`;
    };
    const { aids, substeps } = jp_worker_info;
    jp_worker.postMessage({ task: "jp-score", aids, substeps, gw, mw, wt, info, setting, lang });
}
let qingque_worker = null;
let qingque_worker_info;
function processQingqueScore() {
    if (qingque_worker) {
        qingque_worker.terminate();
        qingque_worker = null;
    }
    document.getElementById("output-score-qingque").textContent = "";
    document.getElementById("brief-output-score-qingque").textContent = "";
    document.getElementById("time-output-score-qingque").textContent = "Calculating......";
    const mw = Number(document.querySelector('input[name="score-qingque-local-wind"]:checked').value);
    const wt = Number(document.querySelector('input[name="score-qingque-wintype"]:checked').value);
    let wi = document.querySelectorAll('input[name="score-qingque-wininfo"]:checked');
    wi = Array.from(wi).map((x) => Number(x.value));
    let info = [mw, wt === 1, wi.includes(2), wi.includes(3), wi.includes(4)];
    qingque_worker = new Worker("mahjong-worker.js");
    qingque_worker.onmessage = function (e) {
        qingque_worker.terminate();
        qingque_worker = null;
        document.getElementById("output-score-qingque").innerHTML = e.data.result;
        document.getElementById("brief-output-score-qingque").innerHTML = e.data.result;
        document.getElementById("time-output-score-qingque").textContent = `Used ${e.data.time} ms`;
    };
    const { aids, substeps } = qingque_worker_info;
    qingque_worker.postMessage({ task: "qingque-score", aids, substeps, info });
}
function getFixedImage(div) {
    return Array.from(div.querySelectorAll("img")).find((img) => getComputedStyle(img).position !== "absolute");
}
function getNamedImage(div) {
    return div.querySelector("img.card-img-overlay, img.card-img-overlay-r, img.card-img-overlay-rr-0") ?? getFixedImage(div);
}
function adjustButtonsFontSize() {
    const baseBtn = document.getElementById("subkey_chi");
    if (!baseBtn) return;
    const targetHeight = baseBtn.clientHeight;
    const buttons = document.getElementsByClassName("subkey-button");
    for (let i = 0; i < buttons.length; i++) {
        let btn = buttons[i];
        if (btn === baseBtn) continue;
        let style = window.getComputedStyle(btn);
        let fontSize = parseFloat(style.fontSize);
        btn.style.fontSize = fontSize + "px";
        while (btn.scrollHeight > targetHeight && fontSize > 8) {
            fontSize--;
            btn.style.fontSize = fontSize + "px";
        }
        btn.style.height = targetHeight + "px";
    }
    if (useHelper()) {
        const divs = document.querySelectorAll(".input-card-button");
        divs.forEach((div) => {
            let numberSpan = div.querySelector("span.card-helper");
            if (!numberSpan) {
                const src = getNamedImage(div).src;
                const filenameWithExt = src.substring(src.lastIndexOf("/") + 1);
                const filename = filenameWithExt.split(".")[0];
                const idx = id(filename).id;
                if (idx === undefined) return;
                const displayNumber = HelperArray[idx];
                numberSpan = document.createElement("span");
                numberSpan.className = "card-helper";
                numberSpan.textContent = displayNumber;
                div.appendChild(numberSpan);
            }
            numberSpan.style.fontSize = `${getCardHelperFontSize(div.offsetWidth, "px")}px`;
        });
    }
}
function addWorkerCardHelper() {
    const imgs = document.querySelectorAll(".no-helper");
    imgs.forEach((img) => {
        const src = img.src;
        const filenameWithExt = src.substring(src.lastIndexOf("/") + 1);
        const filename = filenameWithExt.split(".")[0];
        const idx = id(filename).id;
        if (idx === undefined) return;
        const displayNumber = HelperArray[idx];
        const div = img.parentNode;
        img.classList.remove("no-helper");
        const numberSpan = document.createElement("span");
        numberSpan.className = "card-helper";
        if (img.offsetWidth === 0) return;
        numberSpan.style.fontSize = `${getCardHelperFontSize(img.offsetWidth, "px")}px`;
        numberSpan.textContent = displayNumber;
        div.appendChild(numberSpan);
    });
}
function addReferenceMark() {
    const ref = document.querySelectorAll("[title]");
    const box = document.getElementById("title-box");
    let notes = [];
    ref.forEach((e, i) => {
        const t = e.getAttribute("title");
        const n = i + 1;
        notes.push(`[${n}] ${t}`);
        const sup = document.createElement("sup");
        sup.className = "reference-sup";
        sup.textContent = `[${n}]`;
        e.appendChild(sup);
    });
    box.innerHTML = notes.join("<br/>");
}
const gboverlays = new Set(["card-img-overlay", "card-img-overlay-r", "card-img-overlay-rr-0", "card-img-overlay-rr-1"]);
function updateCardSkin(skin) {
    if (skin) localStorage.setItem("cardskin", cardskin = skin);
    const divs = document.querySelectorAll(".card-div");
    divs.forEach((div) => {
        const i = getNamedImage(div);
        if (!i) return;
        const src = i.src;
        const filenameWithExt = src.substring(src.lastIndexOf("/") + 1);
        const filename = filenameWithExt.split(".")[0];
        const idx = id(filename.slice(-2));
        if (idx.id === undefined) return;
        let type = filename.at(-3) ?? "";
        if (div.querySelector("img.card-img-overlay-r")) type = "r";
        if (div.querySelector("img.card-img-overlay-rr-0")) type = "k";
        const onclick = getFixedImage(div).getAttribute('onclick');
        const imgs = div.querySelectorAll("img");
        imgs.forEach((img) => {
            if (Array.from(img.classList).some((cls) => gboverlays.has(cls))) div.removeChild(img);
        });
        div.removeChild(getFixedImage(div));
        const tmpdiv = document.createElement("div");
        tmpdiv.innerHTML = getCardImage(idx, type, onclick);
        while (tmpdiv.firstChild) div.appendChild(tmpdiv.firstChild);
    });
}
function loadStorage() {
    updateCardSkin(localStorage.getItem("cardskin"));
}