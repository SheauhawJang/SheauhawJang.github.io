let aids, tiles, subtiles;
let worker = null;
const TASK_NUM = 6;
let save_normal = undefined;
let worker_dvds = Array(TASK_NUM).fill(null);
let worker_substeps = Array(TASK_NUM).fill(null);
let lastmask = Array(TASK_NUM).fill(null);
const document_element_ids = ["output-std", "output-jp", "output-gb", "output-tw", "output-jp3p", "output-sc"];
function sf(f) {
    try {
        f();
    } catch {}
}
function random(l, r) {
    if (r === undefined) ((r = l), (l = 0));
    let len = r - l;
    let off = Math.floor(Math.random() * len);
    return l + off;
}
const ui_debounce_delay = 500;
let updateTaskOutput = ArrayMap(TASK_NUM, (_, i) =>
    debounce((text) => {
        sf(() => (document.getElementById(document_element_ids[i]).innerHTML = text));
        if (useHelper()) addWorkerCardHelper();
        updateCardSkin();
    }, ui_debounce_delay),
);
let updateTaskBrief = ArrayMap(TASK_NUM, (_, i) => debounce((text) => sf(() => (document.getElementById("brief-" + document_element_ids[i]).innerHTML = text)), ui_debounce_delay));
function putWorkerResult(e, task) {
    // partial result
    if ("brief" in e.data) updateTaskBrief[task].immediate(e.data.brief);
    if ("output" in e.data) {
        updateTaskOutput[task](e.data.output);
        return true; // all known results has been put
    }
    // full result
    const { result, time } = e.data;
    updateTaskOutput[task].immediate(result.output);
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
const document_scores_ids = ["score-gb", "score-jp", "score-qingque"];
const updateScoreVisiableBar = ArrayMap(document_scores_ids.length, (_, id) =>
    debounce((visiable) => {
        const tab = document.querySelector(`.tab[data-scoretabid="${id}"]`);
        if (!tab) return;
        tab.style.display = visiable;
    }, ui_debounce_delay),
);
const updateScoreVisiableUI = debounce(function (visiable) {
    let vid = [];
    for (let i = 0; i < document_scores_ids.length; ++i) {
        const se = document.getElementById(document_scores_ids[i]);
        const te = document.querySelector(`.tab[data-scoretabid="${i}"]`);
        if (se && se.style.display !== "none" && te) vid.push([i, se, te]);
    }
    vid.sort((a, b) => (a[2] === b[2] ? 0 : a[2].compareDocumentPosition(b[2]) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    if (visiable === "none") {
        if (vid.length === 0) ((document.getElementById("score-global").style.display = "none"), switchScoreTab(-1, true));
        else switchScoreTab(vid[0][0], true);
    } else {
        document.getElementById("score-global").style.display = visiable;
        if (vid.some((e) => e[0] === scoretab_usr)) switchScoreTab(scoretab_usr, true);
        else switchScoreTab(vid[0][0], true);
    }
}, ui_debounce_delay);
function updateScoreVisiable(id, visiable = "none") {
    const e = document.getElementById(document_scores_ids[id]);
    if (!e) return;
    e.style.display = visiable;
    const b = document.getElementById(`${document_scores_ids[id]}-button`);
    if (b) b.disabled = visiable === "none";
    else console.log(`${document_scores_ids[id]}-button`);
    const utab = document.querySelector(`.tab[data-scoretabid="${id}"]`);
    if (utab && utab.style.display === "none" && visiable !== "none") {
        updateScoreVisiableBar[id].immediate(visiable);
    } else {
        updateScoreVisiableBar[id](visiable);
    }
    const usrse = document.getElementById(document_scores_ids[scoretab_usr]);
    if (usrse && usrse.style.display !== "none" && visiable !== "none") {
        updateScoreVisiableUI.immediate(visiable);
    } else {
        updateScoreVisiableUI(visiable);
    }
}
function processInput() {
    if (worker) {
        worker.terminate();
        worker = null;
    }
    for (let i = 0; i < document_element_ids.length; ++i) {
        updateTaskOutput[i]("");
        updateTaskBrief[i]("");
        sf(() => (document.getElementById("time-" + document_element_ids[i]).textContent = `Waiting......`));
    }
    const workers_scores = [gb_worker, jp_worker, null];
    for (let i = 0; i < workers_scores.length; ++i) {
        updateScoreVisiable(i);
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
                if (Math.min(...newstepjp) <= -1 + full_tcnt - tcnt && opencheck(aids[1])) {
                    updateJPOutput("");
                    updateJPBrief("");
                    document.getElementById("time-output-score-jp").textContent = "Ready to start!";
                    updateScoreVisiable(1, "block");
                    jp_worker = null;
                    jp_worker_info = newstepjp;
                }
                break;
            case 2:
                if (Math.min(...worker_substeps[task]) <= -1 + full_tcnt - tcnt && opencheck(aids[1])) {
                    updateGBOutput("");
                    updateGBBrief("");
                    document.getElementById("time-output-score-gb").textContent = "Ready to start!";
                    updateScoreVisiable(0, "block");
                    gb_worker = null;
                    gb_worker_info = worker_substeps[task];
                }
                if (Math.min(worker_substeps[1][0], worker_substeps[2][1]) === -1 && opencheck(aids[1])) {
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
                        updateScoreVisiable(2, "block");
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
                worker.postMessage({ mask, task, save: save_normal, steps: [worker_substeps[0], Infinity, worker_substeps[1][2], Infinity, Infinity], dvds: [worker_dvds[0], worker_dvds[1][1], worker_dvds[1][2], undefined, undefined] });
                break;
            case 3:
                sf(() => (document.getElementById("time-" + document_element_ids[task]).textContent = `Calculating......`));
                worker.postMessage({ mask, task, steps: [worker_substeps[0], Infinity, Infinity, Infinity], save: save_normal, dvds: [worker_dvds[0], undefined, undefined] });
                break;
            case 4:
                sf(() => (document.getElementById("time-" + document_element_ids[task]).textContent = `Calculating......`));
                worker.postMessage({ mask, task, steps: [Infinity, Infinity, worker_substeps[1][2]], dvds: [worker_dvds[0], worker_dvds[1][1], worker_dvds[1][2]] });
                break;
            case 5:
                sf(() => (document.getElementById("time-" + document_element_ids[task]).textContent = `Calculating......`));
                worker.postMessage({ mask, task, steps: [Infinity, Infinity, Infinity], dvds: [worker_dvds[0], worker_dvds[2][1]] });
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
    const size = [undefined, 3, 5, 4, 3, 3];
    const name = [undefined, "jp", "gb", "tw", "jp", "sc"];
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
    updateTaskOutput[i]("");
    updateTaskBrief[i]("");
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
        const j = random(i, array.length);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function randomInputText(n = parseInt(document.getElementById("randomCardCount").value), m = 136) {
    let mount = new Array(m);
    for (let i = 0; i < mount.length; ++i) mount[i] = Math.floor(i / 4);
    shuffle(mount);
    n = Math.min(n, mount.length);
    let hand = [];
    for (let i = 0; i < n; ++i) hand.push(mount[i]);
    hand.sort((a, b) => a - b);
    updateInput(joinHand(hand));
}
function getMeld(seqs = default_seqs, tris = default_tris) {
    const seqrate = 64;
    const seq = seqs.length * seqrate;
    const tri = tris.length;
    const r = random(seq + tri);
    if (r >= seq) return Array(3).fill(tris[r - seq]);
    else return ArrayMap(3, (_, i) => seqs[Math.floor(r / seqrate)] + i);
}
function randomWinning(local, seqs = default_seqs, tris = default_tris) {
    const n = local ?? parseInt(document.getElementById("randomWinningCardCount").value);
    const [melds, head] = [Math.floor(n / 3), n % 3 ? 1 : 0];
    let tiles = Array(sizeUT).fill(0);
    for (let i = 0; i < melds; ++i) getMeld(seqs, tris).forEach((x) => ++tiles[x]);
    for (let i = 0; i < head; ++i) tiles[tris[random(tris.length)]] += 2;
    if (local !== undefined) return tiles;
    let jokercount = 0;
    for (let i = 0; i < sizeUT; ++i) if (tiles[i] > 4) ((jokercount += tiles[i] - 4), (tiles[i] = 4));
    let hand = [];
    for (let i = 0; i < sizeUT; ++i) hand.push(...Array(tiles[i]).fill(i));
    if (n % 3 === 1)
        if (jokercount) --jokercount;
        else hand.splice(random(hand.length), 1);
    else if (hand.length > 0) {
        const j = random(hand.length);
        const id = hand[j];
        (hand.splice(j, 1), hand.push(id));
    }
    updateInput("J".repeat(jokercount) + joinHand(hand));
    drawInputCards();
    processInput();
}
function submithand(hand, listen) {
    hand.sort((a, b) => a - b);
    const j = random(hand.length);
    const id = hand[j];
    hand.splice(j, 1);
    if (!listen) hand.push(id);
    updateInput(joinHand(hand));
    drawInputCards();
    processInput();
}
function randomWinningPairs(disjoint = false, guse = guseall) {
    const listen = aids[0].length % 3 === 1;
    let arr = [];
    for (let i = 0; i < sizeUT; ++i) if (guse[i] !== Infinity) arr.push(i);
    shuffle(arr);
    let hand = [];
    if (disjoint) for (let i = 0; i < 7; ++i) hand.push(arr[i], arr[i]);
    else for (let i = 0; i < 7; ++i) hand.push(...Array(2).fill(arr[random(arr.length)]));
    submithand(hand, listen);
}
function randomWinningOrphan() {
    const listen = aids[0].length % 3 === 1;
    let hand = Orphan13Array.slice();
    hand.push(hand[random(13)]);
    submithand(hand, listen);
}
function randomWinningBukao() {
    const listen = aids[0].length % 3 === 1;
    let hand = [...KnitDragonSave[random(6)], ...ArrayMap(7, (_, i) => i + 27)];
    shuffle(hand);
    hand = [...hand.slice(0, 13).sort((a, b) => a - b), hand[13]];
    if (listen) hand.pop();
    updateInput(joinHand(hand));
    drawInputCards();
    processInput();
}
function randomWinningKDragon() {
    const n = Math.max(aids[0].length + aids[1].length * 3, 9);
    let tiles = randomWinning(n - 9);
    KnitDragonSave[random(6)].forEach((x) => ++tiles[x]);
    let hand = [];
    tiles.forEach((x, i) => hand.push(...Array(x).fill(i)));
    submithand(hand, n % 3 === 1);
}
function randomWinningNiconico() {
    const listen = aids[0].length % 3 === 1;
    let hand = [];
    for (let i = 0; i < 7; ++i) hand.push(...Array(2).fill(random(sizeUT)));
    hand.push(...Array(3).fill(random(sizeUT)));
    submithand(hand, listen);
}
function randomWinningOrphanMeld() {
    const listen = aids[0].length % 3 === 1;
    let hand = Orphan13Array.slice();
    hand.push(hand[random(13)], ...getMeld());
    submithand(hand, listen);
}
function randomWinningBuda() {
    const listen = aids[0].length % 3 === 1;
    let buda = [];
    for (let a = 0; a < 3; ++a) for (let b = a + 3; b < 6; ++b) for (let c = b + 3; c < 9; ++c) buda.push([a, b, c]);
    let hand = ArrayMap(7, (_, i) => i + 27);
    for (let i = 0; i < 3; ++i) hand.push(...buda[random(buda.length)].map((x) => x + ColorFirstArray[i]));
    hand.push(hand[random(hand.length)]);
    submithand(hand, listen);
}
function randomWinningSC(i) {
    if (Math.random() < 0.1) return randomWinningPairs(false, guseque[i]);
    const seqs = default_seqs.toSpliced(i * 7, 7);
    const tris = ArrayMap(27, (_, i) => i).toSpliced(i * 9, 9);
    const n = aids[0].length + aids[1].length * 3;
    const tiles = randomWinning(n, seqs, tris);
    let hand = [];
    tiles.forEach((x, i) => hand.push(...Array(x).fill(i)));
    submithand(hand, n % 3 === 1);
}
function randomInput(n = parseInt(document.getElementById("randomCardCount").value), m = 136) {
    randomInputText(n, m);
    drawInputCards();
    processInput();
}
function sakiSpecialInput() {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    switch (`${mm}-${dd}`) {
        case "12-15":
            return "東東南南西西北白白発発中中北";
        case "10-27":
            return "4445p0p[1111p,1][2222p][3333p]";
    }
    return null;
}
function loadInput() {
    const t = sessionStorage.getItem("inputText");
    const e = document.getElementById("inputText");
    const s = sakiSpecialInput();
    //e.addEventListener("change", () => sessionStorage.setItem("inputText", e.value));
    if (t !== null) e.value = t;
    else if (s !== null) e.value = s;
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
    if (id.sp) return false;
    if (id.id >= JokerC) return false;
    return true;
}
function hasJPCard(id) {
    if (id.id >= sizeUT) return false;
    if (id.id >= 27 && id.sp) return false;
    return true;
}
function hasQQCard(id) {
    if (id.id === JokerC) return true;
    if (id.id === JokerC + 7) return true;
    if (id.sp) return false;
    if (id.id >= JokerC + 4) return false;
    return true;
}
function getOverlay(path, t) {
    if (t === "r") return `<img src="${path}" class="card-img-overlay-r">`;
    if (t === "k") return `<img src="${path}" class="card-img-overlay-rr-0"><img src="${path}" class="card-img-overlay-rr-1">`;
    return `<img src="${path}" class="card-img-overlay">`;
}
function getCardImage(id, t = "", onclick = "") {
    let [name, overlay] = [cardName(id), null];
    if (cardskin === "qq" && hasQQCard(id)) overlay = getOverlay(`./qqcards/${name}.png`, t);
    if (cardskin === "gb" && hasGBCard(id)) overlay = getOverlay(`./gbcards/${name}.gif`, t);
    if (cardskin === "hk" && hasGBCard(id)) overlay = getOverlay(`./hkcards/${name}.png`, t);
    if (cardskin === "op" && hasJPCard(id)) overlay = getOverlay(`./opcards/${name}.png`, t);
    if (cardskin === "tw" && hasGBCard(id)) overlay = getOverlay(`./twcards/${name}.png`, t);
    if (cardskin === "jp")
        switch (id.id) {
            case 42:
                name = "ij";
                break;
            case 43:
                ((name = "im"), (overlay = getOverlay(`./cards/im.png`, t)));
                break;
            case 44:
                ((name = "ip"), (overlay = getOverlay(`./cards/ip.png`, t)));
                break;
            case 45:
                ((name = "is"), (overlay = getOverlay(`./cards/is.png`, t)));
                break;
            case 47:
                ((name = "8z"), (overlay = getOverlay(`./cards/8z.png`, t)));
                break;
            case 48:
                ((name = "9z"), (overlay = getOverlay(`./cards/9z.png`, t)));
                break;
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
    tids.push({ id: mount[random(mount.length)] });
    remakeInput(aids);
    drawInputCards();
    processInput();
}
function tilesImage(tids, bonus) {
    let output = "";
    let width = 5;
    let max_card = 35;
    if (window.matchMedia("screen and (max-width: 512px)").matches) ((width = 7), (max_card = 20));
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
    for (let i = 0; i < tids.length; ++i) ((output += inputCardImage(tids, i, -1, width, unit)), (rheight = sheight));
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
            .sort((a, b) => a - b),
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
const updateGBOutput = debounce((text) => (document.getElementById("output-score-gb").innerHTML = text), ui_debounce_delay, ui_debounce_delay * 3);
const updateGBBrief = debounce((text) => (document.getElementById("brief-output-score-gb").innerHTML = text), ui_debounce_delay, ui_debounce_delay * 3);
function processGBScore() {
    updateScoreTabUser(0);
    if (gb_worker) {
        gb_worker.terminate();
        gb_worker = null;
    }
    updateGBOutput("");
    updateGBBrief("");
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
            updateGBOutput(e.data.output);
            return;
        }
        gb_worker.terminate();
        gb_worker = null;
        updateGBOutput.immediate(e.data.result.output);
        updateGBBrief.immediate(e.data.result.brief);
        document.getElementById("time-output-score-gb").textContent = `Used ${e.data.time} ms`;
    };
    gb_worker.postMessage({ task: "gb-score", aids, tiles, substeps: gb_worker_info, gw, mw, wt, info, lang, setting });
}
let jp_worker = null;
let jp_worker_info;
const JP_RADIO_MAX = 24;
const JP_SETTING_SIZE = 128;
const updateJPOutput = debounce((text) => (document.getElementById("output-score-jp").innerHTML = text), ui_debounce_delay);
const updateJPBrief = debounce((text) => (document.getElementById("brief-output-score-jp").innerHTML = text), ui_debounce_delay);
function processJPScore() {
    updateScoreTabUser(1);
    if (jp_worker) {
        jp_worker.terminate();
        jp_worker = null;
    }
    updateJPOutput("");
    updateJPBrief("");
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
            updateJPOutput(e.data.output);
            return;
        }
        jp_worker.terminate();
        jp_worker = null;
        updateJPOutput.immediate(e.data.result.output);
        updateJPBrief.immediate(e.data.result.brief);
        document.getElementById("time-output-score-jp").textContent = `Used ${e.data.time} ms`;
    };
    jp_worker.postMessage({ task: "jp-score", aids, tiles, substeps: jp_worker_info, gw, mw, wt, info, setting, lang });
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
function replacei18n() {
    setLoc(lang);
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        let text = loc[key];
        if (!text) return;
        switch (el.getAttribute("data-i18n-case")) {
            case "lower":
                text = text.toLowerCase();
                break;
            case "upper":
                text = text.toUpperCase();
                break;
            case "capitalize":
                text = text.charAt(0).toUpperCase() + text.slice(1);
                break;
            case "title":
                text = text
                    .split(" ")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ");
        }
        el.innerHTML = text;
    });
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
function debounce(f, delay = 20, maxdelay = Infinity) {
    let timer = null;
    let lasts = null;
    let rf = function (...args) {
        let rdelay = delay;
        if (timer) (clearTimeout(timer), (rdelay = Math.min(rdelay, lasts + maxdelay - Date.now())));
        else lasts = Date.now();
        timer = setTimeout(() => {
            f.apply(this, args);
            timer = null;
            lasts = null;
        }, rdelay);
    };
    rf.immediate = function (...args) {
        if (timer) clearTimeout(timer);
        timer = null;
        f.apply(this, args);
    };
    return rf;
}
function loadCheckbox(key, st = localStorage) {
    const cbs = document.querySelectorAll(`input[name="${key}"]`);
    let cvs = new Set();
    const cvstorage = st.getItem(key);
    if (cvstorage !== null)
        try {
            cvs = new Set(JSON.parse(cvstorage));
            cbs.forEach((cb) => ((cb.checked = cvs.has(cb.value)), cb.dispatchEvent(new Event("change"))));
        } catch {}

    const cf = debounce(() => {
        const cvstorage = Array.from(cbs)
            .filter((cb) => cb.checked)
            .map((cb) => cb.value);
        st.setItem(key, JSON.stringify(cvstorage));
    });
    cbs.forEach((cb) => cb.addEventListener("change", cf));
    for (let i = 0; i < document_scores_ids.length; ++i) if (key.startsWith(document_scores_ids[i])) cbs.forEach((cb) => cb.addEventListener("change", () => updateScoreTabUser(i)));
}
function loadRadio(key, st = localStorage) {
    const rds = document.querySelectorAll(`input[name="${key}"]`);
    const sv = st.getItem(key);
    if (sv) rds.forEach((r) => ((r.checked = r.value === sv), r.dispatchEvent(new Event("change"))));

    const rf = debounce(() => {
        const s = Array.from(rds).find((r) => r.checked);
        if (s) st.setItem(key, s.value);
        else st.removeItem(key);
    });
    rds.forEach((r) => r.addEventListener("change", rf));
    for (let i = 0; i < document_scores_ids.length; ++i) if (key.startsWith(document_scores_ids[i])) rds.forEach((r) => r.addEventListener("change", () => updateScoreTabUser(i)));
}
function loadInputbox(key, st = localStorage) {
    const e = document.getElementById(key);
    const s = st.getItem(key);
    if (s !== null) e.value = s;

    e.addEventListener("change", () => st.setItem(key, e.value));
    for (let i = 0; i < document_scores_ids.length; ++i) if (key.startsWith(document_scores_ids[i])) e.addEventListener("change", () => updateScoreTabUser(i));
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
    switchStepTab(Number(localStorage.getItem("steptab")));
    scoretab_usr = Number(localStorage.getItem("scoretab_usr") ?? -1);
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
        if (mpp.has(cb.value)) ((cb.checked = true), cb.dispatchEvent(new Event("change")));
        else if (mpn.has(cb.value)) ((cb.checked = false), cb.dispatchEvent(new Event("change")));
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
        [[1, 2, 3, 46], [39, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43, 51, 52, 53, 58], [4, 0, 6, 0, 0, "9,1", 10, undefined, 14, 15, ...localyaku0, 0, 0, 0, 0, 0, 0]], // XJTU (0)
        [[3, 46], [1, 2, 39, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43, 51, 52, 53, 58], [4, 0, 6, 0, 0, "9,1", 10, undefined, 14, 15, ...localyaku0, 0, 0, 0, 0, 0, 0]], // XJTU 7 Stars (1)
        [[2, 3, 39, 46], [1, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43, 58], [4, 5, 6, 0, 0, "9,1", 0, undefined, 14, 15, ...localyaku0, 0, 0, 0, undefined, 0, 0]], // JPML (2)
        [[2, 3, 39, 46], [1, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43, 58], [4, 5, 6, 7, 0, "9,1", 0, undefined, 14, 15, ...localyaku0, 0, 0, 0, undefined, 0, 0]], // JPML WRC (3)
        [[2, 46], [1, 3, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43, 58], [4, 5, 6, 7, 0, 0, 0, undefined, 14, 15, ...localyaku0, 0, 0, 0, undefined, 0, 0]], // Saikouisen (4)
        [[2, 46], [1, 3, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43, 58], [4, 5, 6, 0, 0, 0, 0, undefined, 14, 15, ...localyaku0, 0, 0, 0, undefined, 0, 0]], // Saikouisen Classic (5)
        [[2, 46], [1, 3, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43, 58], [4, 5, 6, 7, 0, 0, 0, undefined, 14, 15, ...localyaku0, 0, 0, 0, undefined, 0, 0]], // ClubJPM (6=4)
        [[2, 46], [1, 3, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43, 58], [4, 5, 6, 7, 0, 0, 0, undefined, 14, 15, ...localyaku0, 0, 0, 0, undefined, 0, 0]], // M.League (7=4)
        [[39, 46], [1, 2, 3, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43, 58], [4, 0, 6, 0, 0, "9,1", 0, undefined, 14, 15, ...localyaku0, 0, 0, 0, undefined, 0, 0]], // EMA (8)
        [[1, 2, 3, 13, 46], [11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43, 51, 52, 53, 58], [4, 0, 6, 0, 0, 0, 0, undefined, 14, 15, ...localyaku0, 0, 0, 0, 0, 0, 0]], // Mahjong Soul (9)
        [[1, 2, 3, 13, 26, 27, 28, 32, 33, 34, 35, 38, 46], [11, 24, 25, 29, 30, 31, 36, 37, 41, 42, 43, 51, 52, 53, 58], [4, 0, 6, 0, 0, "9,2", 10, undefined, 14, 15, 0, 0, 0, 19, 0, "21,3", 0, "40,2", "44", 0, 0, 0, undefined, 0, 0]], // Mahjong Soul Local Yaku (10)
        [[2, 3, 46], [1, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43, 51, 52, 53, 58], [undefined, 0, 6, 0, 0, 0, 0, undefined, 14, 15, ...localyaku0, 0, 0, 0, 0, 0, 0]], // Tenhou (11)
        [[46], [1, 2, 3, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43, 58], [4, 5, 6, 0, 0, 0, 0, undefined, 14, 15, ...localyaku0, 0, 0, 0, undefined, 0, 0]], // Shinhouchi (12)
        [[46], [1, 2, 3, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43, 58], [4, 5, 6, 0, 0, 0, 0, undefined, 14, 15, ...localyaku0, 0, 0, 0, undefined, 0, 0]], // Mu (13=12)
        [[2, 46], [1, 3, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43, 58], [4, 5, 6, 7, 0, 0, 0, undefined, 14, 15, ...localyaku0, 0, 0, 0, undefined, 0, 0]], // RMU (14=4)
        [[46], [1, 2, 3, 39, 11, 24, 25, ...bigwheels, ...luckylocals, 41, 42, 43, 58], [4, 5, 6, 0, 0, "9,3", 0, undefined, 14, 15, ...localyaku0, 0, 0, 0, undefined, 0, 0]], // Zendanshin (15)
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
        if (mpp.has(cb.value)) ((cb.checked = true), cb.dispatchEvent(new Event("change")));
        else if (mpn.has(cb.value)) ((cb.checked = false), cb.dispatchEvent(new Event("change")));
    });
    for (let i = 0; i <= JP_RADIO_MAX; ++i) {
        if (radio[i] == undefined) continue;
        const rds = document.querySelectorAll(`input[name="score-jp-setting-${i}"]`);
        rds.forEach((r) => (r.checked = r.value == radio[i]));
        if (rds.length) rds[0].dispatchEvent(new Event("change"));
    }
}
function toggleOutput(id) {
    const d = document.getElementById(id);
    const b = document.getElementById("toggle-" + id);
    const s = document.getElementById("brief-" + id);
    const o = document.getElementById("options-" + id);
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
    const collapsed = el.querySelector(".pts-brief");
    const expanded = el.querySelector(".pts-output");
    collapsed.style.display = el.open ? "none" : "";
    expanded.style.display = el.open ? "" : "none";
}
function SwitchOption(es, id, rge = [true, false], reverse = false) {
    if (!rge.includes(es.checked)) return;
    if (!Array.isArray(id)) id = [id];
    id.forEach((id) => {
        const et = document.getElementById(id);
        if (et === null) return;
        et.style.display = es.checked !== reverse ? "" : "none";
    });
}
function debugopen(id) {
    const e = document.getElementById(id);
    if (e) e.style.display = "";
}
let steptab = -1;
function switchStepTab(i) {
    const subboxes = ["steps-std", "steps-gb", "steps-jp", "steps-tw", "steps-sc"];
    if (!(i >= 0 && i < subboxes.length)) return;
    const viewer = document.getElementById("steps-global-viewer");
    if (!viewer) return;
    if (steptab >= 0 && steptab < subboxes.length) {
        const oldbox = document.getElementById(subboxes[steptab]);
        if (oldbox) while (viewer.firstChild) oldbox.appendChild(viewer.firstChild);
    }
    const newbox = document.getElementById(subboxes[i]);
    if (newbox) while (newbox.firstChild) viewer.appendChild(newbox.firstChild);
    steptab = i;
    document.querySelectorAll(".tab[data-steptabid]").forEach((tab) => tab.classList.toggle("active", Number(tab.dataset.steptabid) === i));
    localStorage.setItem("steptab", i);
}
let scoretab = -1;
let scoretab_usr = -1;
function updateScoreTabUser(i) {
    scoretab_usr = i;
    localStorage.setItem("scoretab_usr", i);
}
function switchScoreTab(i, auto = false) {
    const subboxes = document_scores_ids;
    const viewer = document.getElementById("score-global-viewer");
    if (!viewer) return;
    if (scoretab >= 0 && scoretab < subboxes.length) {
        const oldbox = document.getElementById(subboxes[scoretab]);
        if (oldbox) while (viewer.firstChild) oldbox.appendChild(viewer.firstChild);
    }
    if (i >= 0 && i < subboxes.length) {
        const newbox = document.getElementById(subboxes[i]);
        if (newbox) while (newbox.firstChild) viewer.appendChild(newbox.firstChild);
    }
    scoretab = i;
    document.querySelectorAll(".tab[data-scoretabid]").forEach((tab) => tab.classList.toggle("active", Number(tab.dataset.scoretabid) === i));
    if (!auto) updateScoreTabUser(i);
}
let qingqueController = null;
async function getResultFromQingque(myInput) {
    const proxyUrl = `https://mmcr.sanbaiman.workers.dev/`;
    if (qingqueController) {
        qingqueController.abort();
        console.log("Previous request aborted.");
    }
    qingqueController = new AbortController();
    const { signal } = qingqueController;
    try {
        console.log("Sending Request......");
        const response = await fetch(proxyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ expression: myInput }),
            signal: signal
        });
        if (!response.ok) throw new Error("Proxy request failed");
        const buffer = await response.arrayBuffer();
        const decoder = new TextDecoder("utf-8");
        const resultText = decoder.decode(buffer);
        return resultText;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log("Request discarded. Result ignored.");
            return null; 
        }
        document.getElementById("time-output-score-qingque").textContent = `Error: ${error}`;
    } finally {
        if (qingqueController?.signal === signal) {
            qingqueController = null;
        }
    }
}
async function convertQingque() {
    document.getElementById("output-score-qingque").textContent = "";
    document.getElementById("brief-output-score-qingque").textContent = "";
    const a = [...ArrayMap(27, (_, i) => cardName(i)), ..."ESWNCFP"];
    const f = (x) => a[x.id];
    let s = "";
    s += aids[0].map(f).join("");
    s += aids[1]
        .map((x) => {
            const k = x.map(f).join("");
            return x.length === 4 && x.type % 4 === 0 ? `[${k}]` : `(${k})`;
        })
        .join("");
    s += [document.querySelector('input[name="score-qingque-local-wind"]:checked').value, document.querySelector('input[name="score-qingque-wintype"]:checked').value, ...Array.from(document.querySelectorAll('input[name="score-qingque-wininfo"]:checked')).map((x) => x.value)].join("");
    document.getElementById("time-output-score-qingque").textContent = "Sending Request...";
    const now = new Date();
    const ans = await getResultFromQingque(s);
    if (ans) {
        document.getElementById("output-score-qingque").textContent = ans;
        document.getElementById("time-output-score-qingque").textContent = `Used ${new Date() - now} ms`;
    }
}
