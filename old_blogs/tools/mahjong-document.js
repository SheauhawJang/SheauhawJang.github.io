let aids, tiles, subtiles;
let worker = null;
const TASK_NUM = 5;
let save_normal = undefined;
let worker_dvds = Array(TASK_NUM).fill(null);
let worker_substeps = Array(TASK_NUM).fill(null);
let lastmask = Array(TASK_NUM).fill(null);
const document_element_ids = ["output-std", "output-jp", "output-gb", "output-tw", "output-jp3p"];
function sf(f) {
    try {
        f();
    } catch {}
}
let updateInnerHTML = Array(TASK_NUM)
    .fill(null)
    .map((_, i) =>
        debounce((text) => {
            sf(() => (document.getElementById(document_element_ids[i]).innerHTML = text));
            if (useHelper()) addWorkerCardHelper();
            updateCardSkin();
        }, 100)
    );
function putWorkerResult(e, task) {
    // partial result
    if ("brief" in e.data) sf(() => (document.getElementById("brief-" + document_element_ids[task]).innerHTML = e.data.brief));
    if ("output" in e.data) {
        updateInnerHTML[task](e.data.output);
        return true; // all known results has been put
    }
    // full result
    const { result, time } = e.data;
    updateInnerHTML[task](result.output);
    sf(() => (document.getElementById("time-" + document_element_ids[task]).textContent = `Used ${time} ms`));
    return false; // remain results need to be put
}
function opencheck(openids) {
    for (let i = 0; i < openids.length; ++i) {
        let wfc = openids[i].map((x) => x.id);
        if (wfc.length > 4 || wfc.length < 3) return false;
        if (wfc.length === 3) wfc = wfc.sort((a, b) => a - b);
        if (!isMeld(wfc) && !isQuad(wfc)) return false;
    }
    return true;
}
function processInput() {
    if (worker) {
        worker.terminate();
        worker = null;
    }
    for (let i = 0; i < document_element_ids.length; ++i) {
        updateInnerHTML[i]("");
        sf(() => (document.getElementById("brief-" + document_element_ids[i]).innerHTML = ""));
        sf(() => (document.getElementById("time-" + document_element_ids[i]).textContent = `Waiting......`));
    }
    const document_scores_ids = ["score-gb", "score-jp", "score-qingque"];
    const workers_scores = [gb_worker, jp_worker, qingque_worker];
    for (let i = 0; i < document_scores_ids.length; ++i) {
        const e = document.getElementById(document_scores_ids[i]);
        if (e) e.style.display = "none";
        if (workers_scores[i]) workers_scores[i].terminate();
    }
    const input = document.getElementById("inputText").value;
    sessionStorage.setItem("inputText", input);
    aids = splitTiles(input);
    const tids = aids[0];
    const bids = aids[2];
    tiles = getTiles(tids);
    subtiles = getTiles([...aids[2], ...aids[3], ...aids[4]]);
    for (let i = 0; i < aids[1].length; ++i) {
        const ids = aids[1][i];
        for (let j = 0; j < ids.length; ++j) ++subtiles[ids[j].id];
    }
    const tcnt = tids.length;
    const full_tcnt = tcnt + (tcnt % 3 === 1 ? 1 : 0);
    document.getElementById("output-cnt").textContent = tilesInfo(tcnt);
    document.getElementById("output-pic").innerHTML = tilesImage(tids) + subtilesImage(aids[1], tcnt);
    document.getElementById("output-pic-bonus").innerHTML = tilesImage(bids, 1);
    document.getElementById("output-pic-doras").innerHTML = tilesImage(aids[3], 2);
    document.getElementById("output-pic-uras").innerHTML = tilesImage(aids[4], 2);
    document.getElementsByClassName("output-box-head")[0].style.display = "block";
    worker = new Worker("mahjong-worker.js");
    let task = 0;
    save_normal = undefined;
    worker_substeps = Array(TASK_NUM);
    worker.onmessage = function (e) {
        if (putWorkerResult(e, task)) return;
        const result = e.data.result;
        if (task === 0) {
            save_normal = result.save;
            worker_dvds[0] = result.dvd;
            worker_substeps[0] = result.step;
        } else {
            worker_dvds[task] = result.dvds;
            worker_substeps[task] = result.substep;
        }
        switch (task) {
            case 1:
                const newstepjp = worker_substeps[task].slice();
                if (worker_substeps[0] === -1) newstepjp[0] = -1;
                if ((Math.min(...newstepjp) <= -1 + full_tcnt - tcnt) && opencheck(aids[1])) {
                    document.getElementById("output-score-jp").textContent = "";
                    document.getElementById("brief-output-score-jp").textContent = "";
                    document.getElementById("time-output-score-jp").textContent = "Ready to start!";
                    document.getElementById("score-jp").style.display = "block";
                    jp_worker = null;
                    jp_worker_info = { aids, tiles, substeps: newstepjp };
                }
                break;
            case 2:
                if (Math.min(...worker_substeps[task]) <= -1 + full_tcnt - tcnt && opencheck(aids[1])) {
                    document.getElementById("output-score-gb").textContent = "";
                    document.getElementById("brief-output-score-gb").textContent = "";
                    document.getElementById("time-output-score-gb").textContent = "Ready to start!";
                    document.getElementById("score-gb").style.display = "block";
                    gb_worker = null;
                    gb_worker_info = { aids, tiles, substeps: worker_substeps[task] };
                }
                if (Math.min(worker_substeps[1][0], worker_substeps[2][1]) === -1) {
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
                        qingque_worker_info = { aids, tiles, substeps: [worker_substeps[1][0], worker_substeps[2][1]] };
                    }
                }
                break;
        }
        getStepMask(task, false);
        do ++task;
        while (task < TASK_NUM && !document.getElementById(document_element_ids[task]));
        let mask = getStepMask(task, true);
        lastmask[task] = mask;
        switch (task) {
            case 1:
                sf(() => (document.getElementById("time-" + document_element_ids[task]).textContent = `Calculating......`));
                worker.postMessage({ mask, task, dvds: [worker_dvds[0], undefined, undefined] });
                break;
            case 2:
                sf(() => (document.getElementById("time-" + document_element_ids[task]).textContent = `Calculating......`));
                mask = Array(5).fill(true);
                document.querySelectorAll('input[name="step-gb-types"]').forEach((i) => ((i.disabled = true), (mask[Number(i.value)] = i.checked)));
                worker.postMessage({ mask, task, save: save_normal, steps: [worker_substeps[0], Infinity, worker_substeps[1][2], Infinity, Infinity], dvds: [worker_dvds[0], worker_dvds[1][1], worker_dvds[1][2], undefined, undefined] });
                break;
            case 3:
                sf(() => (document.getElementById("time-" + document_element_ids[task]).textContent = `Calculating......`));
                mask = Array(4).fill(true);
                document.querySelectorAll('input[name="step-tw-types"]').forEach((i) => ((i.disabled = true), (mask[Number(i.value)] = i.checked)));
                worker.postMessage({ mask, task, steps: [worker_substeps[0], Infinity, Infinity, Infinity], save: save_normal, dvds: [worker_dvds[0], undefined, undefined] });
                break;
            case 4:
                sf(() => (document.getElementById("time-" + document_element_ids[task]).textContent = `Calculating......`));
                mask = Array(3).fill(true);
                document.querySelectorAll('input[name="step-jp-types"]').forEach((i) => ((i.disabled = true), (mask[Number(i.value)] = i.checked)));
                worker.postMessage({ mask, task, steps: [Infinity, Infinity, worker_substeps[1][2]], dvds: [worker_dvds[0], worker_dvds[1][1], worker_dvds[1][2]] });
                break;
            default:
                worker.terminate();
                worker = null;
                break;
        }
    };
    sf(() => (document.getElementById("time-" + document_element_ids[task]).textContent = `Calculating......`));
    worker.postMessage({ task, aids, tiles, subtiles, lang });
}
let reworkers = Array(TASK_NUM).fill(null);
function getStepMask(task, lock) {
    const size = [undefined, 3, 5, 4, 3];
    const name = [undefined, "jp", "gb", "tw", "jp"];
    if (size[task] === undefined) return [];
    let mask = Array(size[task]).fill(true);
    let boxes = document.querySelectorAll(`input[name="step-${name[task]}-types"]`);
    boxes.forEach((i) => (mask[Number(i.value)] = i.checked));
    if (lock !== undefined) boxes.forEach((i) => (i.disabled = lock));
    return mask;
}
function restartInput(i) {
    if (!worker_substeps[i]) return;
    const mask = getStepMask(i);
    function m() {
        for (let j = 0; j < mask.length; ++j) if (mask[j] !== lastmask[i][j] && worker_substeps[i][j] !== Infinity) return true;
        return false;
    }
    if (!m()) return;
    lastmask[i] = mask;
    if (reworkers[i]) {
        reworkers[i].terminate();
        reworkers[i] = null;
    }
    updateInnerHTML[i]("");
    sf(() => (document.getElementById("brief-" + document_element_ids[i]).innerHTML = ""));
    sf(() => (document.getElementById("time-" + document_element_ids[i]).textContent = `Re-Calculating......`));
    reworkers[i] = new Worker("mahjong-worker.js");
    reworkers[i].onmessage = function (e) {
        if (putWorkerResult(e, i)) return;
        const result = e.data.result;
        worker_dvds[i] = result.dvds;
        worker_substeps[i] = result.substep;
        reworkers[i].terminate();
        reworkers[i] = null;
    };
    reworkers[i].postMessage({ mask, task: i, aids, tiles, subtiles, lang, steps: worker_substeps[i], dvds: worker_dvds[i], save: save_normal });
}
function updateInput(s) {
    const e = document.getElementById("inputText");
    e.value = s;
    //e.dispatchEvent(new Event("change"));
}
function shuffle(array) {
    for (let i = 0; i < array.length; ++i) {
        const j = Math.floor(Math.random() * (array.length - i));
        [array[i], array[i + j]] = [array[i + j], array[i]];
    }
    return array;
}
function randomInputText() {
    let mount = new Array(136);
    for (let i = 0; i < mount.length; ++i) mount[i] = Math.floor(i / 4);
    shuffle(mount);
    const n = Math.min(parseInt(document.getElementById("randomCardCount").value), mount.length);
    let hand = [];
    for (let i = 0; i < n; ++i) hand.push(mount[i]);
    hand.sort((a, b) => a - b);
    updateInput(joinHand(hand));
}
function randomWinning() {
    const n = parseInt(document.getElementById("randomWinningCardCount").value);
    const melds = Math.floor(n / 3), head = n % 3 ? 1 : 0;
    let tiles = Array(sizeUT).fill(0);
    for (let i = 0; i < melds; ++i) {
        const seq = 21 * 64;
        const tri = sizeUT;
        const r = Math.floor(Math.random() * (seq + tri));
        if (r >= seq) tiles[r - seq] += 3;
        else {
            const rr = Math.floor(r / 64);
            const j = ColorFirstArray[Math.floor(rr / 7)] + rr % 7;
            ++tiles[j], ++tiles[j + 1], ++tiles[j + 2];
        }
    }
    for (let i = 0; i < head; ++i) tiles[Math.floor(Math.random() * sizeUT)] += 2;
    let jokercount = 0;
    for (let i = 0; i < sizeUT; ++i) if (tiles[i] > 4) jokercount += tiles[i] - 4, tiles[i] = 4;
    let hand = [];
    for (let i = 0; i < sizeUT; ++i) hand.push(...Array(tiles[i]).fill(i));
    if (n % 3 === 1)
        if (jokercount) --jokercount;
        else hand.splice(Math.floor(Math.random() * hand.length), 1);
    else if (hand.length > 0) {
        const j = Math.floor(Math.random() * hand.length);
        const id = hand[j];
        hand.splice(j, 1);
        hand.push(id);
    }
    updateInput('J'.repeat(jokercount) + joinHand(hand));
    drawInputCards();
    processInput();
}
function randomInput() {
    randomInputText();
    drawInputCards();
    processInput();
}
function loadInput() {
    const t = sessionStorage.getItem("inputText");
    const e = document.getElementById("inputText");
    //e.addEventListener("change", () => sessionStorage.setItem("inputText", e.value));
    if (t !== null) e.value = t;
    else randomInputText();

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
function getCardHelperDiv(tile, width, unit = "%", t = "") {
    if (!useHelper()) return "";
    const id = tile.id;
    const helper = HelperArray[id] ?? "";
    const fontSize = getCardHelperFontSize(width, unit);
    if (t === "r") return `<span class="card-helper-r" style="font-size: ${fontSize}px">${helper}</span>`;
    if (t === "k") return `<span class="card-helper-rr-0" style="font-size: ${fontSize}px">${helper}</span><span class="card-helper-rr-1" style="font-size: ${fontSize}px">${helper}</span>`;
    return `<span class="card-helper" style="font-size: ${fontSize}px">${helper}</span>`;
}
let cardskin = "jp";
function hasGBCard(id) {
    if ("sp" in id) return false;
    if (id.id >= JokerC) return false;
    return true;
}
function hasJPCard(id) {
    if (id.id >= sizeUT) return false;
    if (id.id >= 27 && "sp" in id) return false;
    return true;
}
function hasQQCard(id) {
    if (id.id === JokerC) return true;
    if (id.id === JokerC + 7) return true;
    if ("sp" in id) return false;
    if (id.id >= JokerC + 4) return false;
    return true;
}
function getOverlay(path, t) {
    if (t === 'r') return `<img src="${path}" class="card-img-overlay-r">`;
    if (t === 'k') return `<img src="${path}" class="card-img-overlay-rr-0"><img src="${path}" class="card-img-overlay-rr-1">`;
    return `<img src="${path}" class="card-img-overlay">`;
}
function getCardImage(id, t = "", onclick = "") {
    let [name, overlay] = [cardName(id), null];
    if (cardskin === "qq" && hasQQCard(id)) overlay = getOverlay(`./qqcards/${name}.png`);
    if (cardskin === "gb" && hasGBCard(id)) overlay = getOverlay(`./gbcards/${name}.gif`);
    if (cardskin === "hk" && hasGBCard(id)) overlay = getOverlay(`./hkcards/${name}.png`);
    if (cardskin === "op" && hasJPCard(id)) overlay = getOverlay(`./opcards/${name}.png`);
    if (cardskin === "jp") 
        switch (id.id) {
            case 42: name = "ij"; break;
            case 43: name = "im", overlay = getOverlay(`./cards/im.png`); break;
            case 44: name = "ip", overlay = getOverlay(`./cards/ip.png`); break;
            case 45: name = "is", overlay = getOverlay(`./cards/is.png`); break;
            case 47: name = "8z", overlay = getOverlay(`./cards/8z.png`); break;
            case 48: name = "9z", overlay = getOverlay(`./cards/9z.png`); break;
        }
    if (overlay) return `${overlay}<img src="./cards/${t}5z.gif"${onclick === "" ? "" : ` onclick="${onclick}" class="clickable"`}>`;
    return `<img src="./cards/${t}${name}.gif"${onclick === "" ? "" : ` onclick="${onclick}" class="clickable"`}>`;
}
function outputCardImage(tids, i, width, link) {
    return `<div class="card-div" style="width: ${width}%;">${link ? `<div class="card-overlay"></div>` : ""}${getCardHelperDiv(tids[i], width)}${getCardImage(tids[i], "", link ? `discard(${i})` : "")}</div>`;
}
function outputCardImageRotated(id, width, cnt) {
    return `<div class="card-div" style="width: ${(width * 120) / 80}%;">${getCardHelperDiv(id, width, undefined, cnt === 2 ? "k" : "r")}${getCardImage(id, cnt === 2 ? "k" : "r")}</div>`;
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
    return `<div class="card-div" style="width: ${(width * 120) / 80}${unit};"><div class="card-overlay"></div>${getCardHelperDiv(ids[i], width, unit, cnt === 2 ? "k" : "r")}${getCardImage(ids[i], cnt === 2 ? "k" : "r", `removeInput(${i}, ${j}, 1)`)}</div>`;
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
    updateInput(newInput);
}
function addInput(i) {
    if (typeof i === "number") i = { id: i };
    document.getElementById("inputText").value += " ";
    document.getElementById("inputText").value += cardName(i);
    //document.getElementById("inputText").dispatchEvent(new Event("change"));
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
    updateInput("");
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
const GB_RADIO_MAX = 7;
const GB_SETTING_SIZE = 45;
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
    for (let i = 0; i <= GB_RADIO_MAX; ++i) {
        const ssq = Array.from(document.querySelectorAll(`input[name="score-gb-setting-${i}"]:checked`));
        sq.push(...ssq);
    }
    let setting = Array(GB_SETTING_SIZE).fill(0);
    for (let i = 0; i < sq.length; ++i) {
        const [a, b] = sq[i].value.split(",");
        if (Number(a) === 0 && b === undefined) continue;
        setting[a] = Number(b ?? 1);
    }
    setting[0] = Number(document.getElementById("score-gb-setting-fan")?.value ?? 8);
    setting[37] = Number(document.getElementById("score-gb-setting-blind")?.value ?? 8);
    setting[38] = setting[38] ? Number(document.getElementById("score-gb-setting-maxfan")?.value ?? 88) : -1;
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
    gb_worker.postMessage({ task: "gb-score", ...gb_worker_info, gw, mw, wt, info, lang, setting });
}
let jp_worker = null;
let jp_worker_info;
const JP_RADIO_MAX = 19;
const JP_SETTING_SIZE = 47;
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
    for (let i = 0; i <= JP_RADIO_MAX; ++i) {
        const ssq = Array.from(document.querySelectorAll(`input[name="score-jp-setting-${i}"]:checked`));
        sq.push(...ssq);
    }
    let setting = Array(JP_SETTING_SIZE).fill(0);
    for (let i = 0; i < sq.length; ++i) {
        const [a, b] = sq[i].value.split(",");
        setting[a] = Number(b ?? 1);
    }
    setting[0] = Number(document.getElementById("score-jp-setting-fan").value);
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
    jp_worker.postMessage({ task: "jp-score", ...jp_worker_info, gw, mw, wt, info, setting, lang });
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
function removeFanSpans(htmlString) {
    const container = document.createElement("div");
    container.innerHTML = htmlString;
    return container.textContent;
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
        e.setAttribute("title", removeFanSpans(t));
    });
    box.innerHTML = notes.join("<br/>");
}
const gboverlays = new Set(["card-img-overlay", "card-img-overlay-r", "card-img-overlay-rr-0", "card-img-overlay-rr-1"]);
function updateCardSkin(skin) {
    if (skin) localStorage.setItem("cardskin", (cardskin = skin));
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
        const onclick = getFixedImage(div).getAttribute("onclick");
        const imgs = div.querySelectorAll("img");
        imgs.forEach((img) => {
            if (Array.from(img.classList).some((cls) => gboverlays.has(cls))) div.removeChild(img);
        });
        div.removeChild(getFixedImage(div));
        const tmpdiv = document.createElement("div");
        tmpdiv.innerHTML = getCardImage(idx, type, onclick ?? "");
        while (tmpdiv.firstChild) div.appendChild(tmpdiv.firstChild);
    });
}
function debounce(f, delay = 20) {
    let timer = null;
    return function (...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            f.apply(this, args);
            timer = null;
        }, delay);
    };
}
function loadCheckbox(key, st = localStorage) {
    const cbs = document.querySelectorAll(`input[name="${key}"]`);
    let cvs = new Set();
    const cvstorage = st.getItem(key);
    if (cvstorage !== null)
        try {
            cvs = new Set(JSON.parse(cvstorage));
            cbs.forEach((cb) => (cb.checked = cvs.has(cb.value), cb.dispatchEvent(new Event("change"))));
        } catch {}

    const cf = debounce(() => {
        const cvstorage = Array.from(cbs)
            .filter((cb) => cb.checked)
            .map((cb) => cb.value);
        st.setItem(key, JSON.stringify(cvstorage));
    }, 20);
    cbs.forEach((cb) => cb.addEventListener("change", cf));
}
function loadRadio(key, st = localStorage) {
    const rds = document.querySelectorAll(`input[name="${key}"]`);
    const sv = st.getItem(key);
    if (sv) rds.forEach((r) => (r.checked = r.value === sv, r.dispatchEvent(new Event("change"))));

    const rf = debounce(() => {
        const s = Array.from(rds).find((r) => r.checked);
        if (s) st.setItem(key, s.value);
        else st.removeItem(key);
    });
    rds.forEach((r) => r.addEventListener("change", rf));
}
function loadInputbox(key, st = localStorage) {
    const e = document.getElementById(key);
    const s = st.getItem(key);
    if (s !== null) e.value = s;

    e.addEventListener("change", () => st.setItem(key, e.value));
}
function loadGBStorage() {
    loadCheckbox("score-gb-setting");
    for (let i = 0; i <= GB_RADIO_MAX; ++i) loadRadio(`score-gb-setting-${i}`);

    loadInputbox("score-gb-setting-fan");
    loadInputbox("score-gb-setting-blind");
    loadInputbox("score-gb-setting-maxfan");

    loadRadio("score-gb-global-wind", sessionStorage);
    loadRadio("score-gb-local-wind", sessionStorage);
    loadCheckbox("score-gb-wintype", sessionStorage);
    loadCheckbox("score-gb-wininfo", sessionStorage);
}
function loadJPStorage() {
    loadCheckbox("score-jp-setting");
    for (let i = 0; i <= JP_RADIO_MAX; ++i) loadRadio(`score-jp-setting-${i}`);

    loadInputbox("score-jp-setting-fan");

    loadRadio("score-jp-global-wind", sessionStorage);
    loadRadio("score-jp-local-wind", sessionStorage);
    loadCheckbox("score-jp-wintype", sessionStorage);
    loadCheckbox("score-jp-wininfo", sessionStorage);
}
function loadStorage() {
    updateCardSkin(localStorage.getItem("cardskin"));
    loadGBStorage();
    loadJPStorage();
}
function processGBSetting(id) {
    let positive = [],
        negative = [],
        radio = [];
    switch (id) {
        default:
            positive = [5, 10, 1, 6, 7, 9, 11, 3, 2, 4, 32, 13, 14, 15, 16, 44, 17, 20, 21, 29];
            negative = [19, 41, 42, 43, 12, "31,1", "31,2", 33, 34, 35, 18, 22, 28, 38, 15];
            radio = [undefined, 0, 0, 0, 0, 0, 0, 0];
            break;
        case 1:
            positive = [19, 41, 42, 43, 5, 10, 1, 6, 7, 9, 11, 32, 13, 14, 15, 16, 44, 17, 20, 21, 22, 28, 29];
            negative = [3, 2, 4, 40, 8, 12, "31,1", "31,2", 33, 35, 18, 38, 15];
            radio = [undefined, 23, "24,1", undefined, 0, undefined, "30,1", 0];
            break;
        case 2:
            positive = [5, 10, 1, 6, 7, 9, 3, 2, 4, 32, 38];
            negative = [19, 41, 42, 43, 11, 12, "31,1", "31,2", 33, 15];
            radio = [undefined, 0, 0, undefined, undefined, undefined, 0, 0];
            document.getElementById("score-gb-setting-maxfan").value = 88;
            document.getElementById("score-gb-setting-maxfan").dispatchEvent(new Event("change"));
            break;
    }
    document.getElementById("score-gb-setting-fan").value = 8;
    document.getElementById("score-gb-setting-blind").value = 8;
    document.getElementById("score-gb-setting-fan").dispatchEvent(new Event("change"));
    document.getElementById("score-gb-setting-blind").dispatchEvent(new Event("change"));
    const cbs = document.querySelectorAll(`input[name="score-gb-setting"]`);
    const mpp = new Set(positive.map(String)),
        mpn = new Set(negative.map(String));
    cbs.forEach((cb) => {
        if (mpp.has(cb.value)) cb.checked = true, cb.dispatchEvent(new Event("change"));
        else if (mpn.has(cb.value)) cb.checked = false, cb.dispatchEvent(new Event("change"));
    });
    for (let i = 0; i <= GB_RADIO_MAX; ++i) {
        if (radio[i] == undefined) continue;
        const rds = document.querySelectorAll(`input[name="score-gb-setting-${i}"]`);
        rds.forEach((r) => (r.checked = r.value == radio[i]));
        if (rds.length) rds[0].dispatchEvent(new Event("change"));
    }
}
function processJPSetting(id) {
    const bigwheels = [26, 27, 28, 29, 30, 31];
    const luckylocals = [32, 33, 34, 35, 36, 37, 38];
    const localyaku0 = Array(9).fill(0);
    // prettier-ignore
    const rules = [
        [[1, 2, 3, 46], [39, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43], [4, 0, 6, 0, 0, "9,1", 10, undefined, 14, 15, ...localyaku0, 0]], // XJTU (0)
        [[3, 46], [1, 2, 39, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43], [4, 0, 6, 0, 0, "9,1", 10, undefined, 14, 15, ...localyaku0, 0]], // XJTU 7 Stars (1)
        [[2, 3, 39, 46], [1, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43], [4, 5, 6, 0, 0, "9,1", 0, undefined, 14, 15, ...localyaku0, 0]], // JPML (2)
        [[2, 3, 39, 46], [1, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43], [4, 5, 6, 7, 0, "9,1", 0, undefined, 14, 15, ...localyaku0, 0]], // JPML WRC (3)
        [[2, 46], [1, 3, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43], [4, 5, 6, 7, 0, 0, 0, undefined, 14, 15, ...localyaku0, 0]], // Saikouisen (4)
        [[2, 46], [1, 3, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43], [4, 5, 6, 0, 0, 0, 0, undefined, 14, 15, ...localyaku0, 0]], // Saikouisen Classic (5)
        [[2, 46], [1, 3, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43], [4, 5, 6, 7, 0, 0, 0, undefined, 14, 15, ...localyaku0, 0]], // ClubJPM (6=4)
        [[2, 46], [1, 3, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43], [4, 5, 6, 7, 0, 0, 0, undefined, 14, 15, ...localyaku0, 0]], // M.League (7=4)
        [[39, 46], [1, 2, 3, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43], [4, 0, 6, 0, 0, "9,1", 0, undefined, 14, 15, ...localyaku0, 0]], // EMA (8)
        [[1, 2, 3, 13, 46], [11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43], [4, 0, 6, 0, 0, 0, 0, undefined, 14, 15, ...localyaku0, 0]], // Mahjong Soul (9)
        [[1, 2, 3, 13, 26, 27, 28, 32, 33, 34, 35, 38, 46], [11, 24, 25, 29, 30, 31, 36, 37, 41, 42, 43], [4, 0, 6, 0, 0, "9,2", 10, undefined, 14, 15, 0, 0, 0, 19, 0, "21,3", 0, "40,2", "44", 0]], // Mahjong Soul Local Yaku (10)
        [[2, 3, 46], [1, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43], [undefined, 0, 6, 0, 0, 0, 0, undefined, 14, 15, ...localyaku0, 0]], // Tenhou (11)
        [[46], [1, 2, 3, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43], [4, 5, 6, 0, 0, 0, 0, undefined, 14, 15, ...localyaku0, 0]], // Shinhouchi (12)
        [[46], [1, 2, 3, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43], [4, 5, 6, 0, 0, 0, 0, undefined, 14, 15, ...localyaku0, 0]], // Mu (13=12)
        [[2, 46], [1, 3, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43], [4, 5, 6, 7, 0, 0, 0, undefined, 14, 15, ...localyaku0, 0]], // RMU (14=4)
        [[46], [1, 2, 3, 39, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43], [4, 5, 6, 0, 0, "9,3", 0, undefined, 14, 15, ...localyaku0, 0]], // Zendanshin (15)
    ];
    const positive = rules[id][0],
        negative = rules[id][1],
        radio = rules[id][2];
    document.getElementById("score-jp-setting-fan").value = 1;
    document.getElementById("score-jp-setting-fan").dispatchEvent(new Event("change"));
    const cbs = document.querySelectorAll(`input[name="score-jp-setting"]`);
    const mpp = new Set(positive.map(String)),
        mpn = new Set(negative.map(String));
    cbs.forEach((cb) => {
        if (mpp.has(cb.value)) cb.checked = true, cb.dispatchEvent(new Event("change"));
        else if (mpn.has(cb.value)) cb.checked = false, cb.dispatchEvent(new Event("change"));
    });
    for (let i = 0; i <= JP_RADIO_MAX; ++i) {
        if (radio[i] == undefined) continue;
        const rds = document.querySelectorAll(`input[name="score-jp-setting-${i}"]`);
        rds.forEach((r) => (r.checked = r.value == radio[i]));
        if (rds.length) rds[0].dispatchEvent(new Event("change"));
    }
}
function toggleOutput(i) {
    const ids = ["output-std", "output-gb", "output-jp", "output-tw", "output-score-gb", "output-score-jp", "output-score-qingque", "output-jp3p"];
    const d = document.getElementById(ids[i]);
    const b = document.getElementById("toggle-" + ids[i]);
    const s = document.getElementById("brief-" + ids[i]);
    const o = document.getElementById("options-" + ids[i]);
    const v = d.style.display !== "none";
    d.style.display = v ? "none" : "block";
    s.style.display = v ? "block" : "none";
    if (o) o.style.display = v ? "none" : "block";
    b.textContent = v ? toggleOutputLang[0] : toggleOutputLang[1];
}
function toggleSwitch(e, on, off, f = () => {}) {
    const btn = e.currentTarget;
    const isOn = btn.getAttribute("aria-pressed") === "true";
    const newState = !isOn;
    btn.setAttribute("aria-pressed", String(newState));
    btn.classList.toggle("on", newState);
    const label = btn.querySelector(".label-text");
    const thumb = btn.querySelector(".thumb");
    if (label) label.textContent = newState ? on : off;
    if (label && thumb) btn.appendChild(newState ? thumb : label);
    f(newState);
}
function switchJP34(newState) {
    const e4 = document.getElementById("output-group-jp");
    const e3 = document.getElementById("output-group-jp3p");
    e4.style.display = newState ? "block" : "none";
    e3.style.display = newState ? "none" : "block";
}
function ptsToggle(el) {
    const collapsed = el.querySelector('.pts-brief');
    const expanded = el.querySelector('.pts-output');
    collapsed.style.display = el.open ? 'none' : '';
    expanded.style.display = el.open ? '' : 'none';
}
function SwitchOption(es, id) {
    const et = document.getElementById(id);
    if (et === null) return;
    et.style.display = es.checked ? '' : 'none';
}
function debugopen(id) {
    const e = document.getElementById(id);
    if (e) e.style.display = '';
}