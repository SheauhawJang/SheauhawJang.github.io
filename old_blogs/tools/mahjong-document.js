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
    const document_scores_ids = ["score-gb"];
    const workers_scores = [gb_worker];
    for (let i = 0; i < document_scores_ids.length; ++i) {
        document.getElementById(document_scores_ids[i]).style.display = 'none';
        if (workers_scores[i]) workers_scores[i].terminate();
    }
    const input = document.getElementById("inputText").value;
    aids = splitTiles(input);
    let tids = aids[0];
    let bids = aids[2];
    let tiles = getTiles(tids);
    let subtiles = getTiles(bids);
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
    document.getElementById("output-pic-bonus").innerHTML = tilesImage(bids, true);
    document.getElementById("output-box-head").style.display = "block";
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
            case 2:
                if (Math.min(...substeps[task]) === -1) {
                    document.getElementById("output-score-gb").textContent = "";
                    document.getElementById("brief-output-score-gb").textContent = "";
                    document.getElementById("time-output-score-gb").textContent = "Ready to start!";
                    document.getElementById("score-gb").style.display = 'block';
                    gb_worker = null;
                    gb_worker_info = { aids, substeps: substeps[task], save: save[task] };
                }
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
function cardLargeImage(tids, i, width, link) {
    return `<div class="card-div" style="width: ${width}%;">${link ? `<div class="card-overlay"></div>` : ""}<img src="./cards/${cardName(tids[i])}.gif"${link ? ` onclick="discard(${i})" class="clickable"` : ""}></div>`;
}
function cardLargeImageRotated(id, width, cnt) {
    return `<div class="card-div" style="width: ${(width * 120) / 80}%;"><img src="./cards/${cnt === 2 ? "k" : "r"}${cardName(id)}.gif"></div>`;
}
function backcardImage(width) {
    return `<div class="card-div" style="width: ${width}%;"><img src="./cards/b.png"></div>`;
}
function emptycardImage(width) {
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
    if (window.matchMedia("screen and (max-width: 512px)").matches) {
        width = 7;
        max_card = 20;
    }
    if (tids.length >= max_card) width = 100 / max_card;
    else if (tids.length >= 100 / width) width = 100 / tids.length;
    if (bonus) width *= 0.5;
    for (let i = 0; i < tids.length; ++i) output += cardLargeImage(tids, i, width, !bonus);
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
        output += emptycardImage(width);
        let t = getUnifiedType(sids[i]);
        if (t % 4 === 0)
            for (let j = 0; j < sids[i].length; ++j)
                if (j === 0 || j === sids[i].length - 1) output += backcardImage(width);
                else output += cardLargeImage(sids[i], j, width, false);
        else {
            let rloc = getRotatedLocation(t, sids[i].length);
            let seq = isSeq(sids[i].map((a) => a.id).sort((a, b) => a - b));
            if (seq) output += cardLargeImageRotated(sids[i][rloc], width, 1);
            for (let j = 0; j < sids[i].length; ++j)
                if (j === rloc)
                    if (seq) continue;
                    else if (t > 3) output += cardLargeImageRotated(sids[i][j++], width, 2);
                    else output += cardLargeImageRotated(sids[i][j], width, 1);
                else output += cardLargeImage(sids[i], j, width, false);
        }
    }
    return output;
}
// Input Panel Functions
let ipids;
function cardInputImage(ids, i, j, width, unit) {
    return `<div class="card-div" style="width: ${width}${unit};"><div class="card-overlay"></div><img src="./cards/${cardName(ids[i])}.gif" onclick="removeInput(${i}, ${j}, 0)" class="clickable"></div>`;
}
function cardInputImageRotated(ids, i, j, width, unit, cnt) {
    return `<div class="card-div" style="width: ${(width * 120) / 80}${unit};"><div class="card-overlay"></div><img src="./cards/${cnt === 2 ? "k" : "r"}${cardName(ids[i])}.gif" onclick="removeInput(${i}, ${j}, 1)" class="clickable"></div>`;
}
function backcardInputImage(i, j, width, unit) {
    return `<div class="card-div" style="width: ${width}${unit};"><div class="card-overlay"></div><img src="./cards/b.png" onclick="removeInput(${i}, ${j}, 0)" class="clickable"></div>`;
}
function emptycardInputImage(width, unit) {
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
        width = 100 / 20;
        height = (100 * 171) / 20 / 80;
        sheight = (100 * 129) / 20 / 80;
        unit = "%";
    }
    const tids = ipids[0];
    for (let i = 0; i < tids.length; ++i) (output += cardInputImage(tids, i, -1, width, unit)), (rheight = sheight);
    const sids = ipids[1];
    for (let i = 0; i < sids.length; ++i) {
        output += emptycardInputImage(width, unit);
        let t = getUnifiedType(sids[i]);
        if (t % 4 === 0) {
            for (let j = 0; j < sids[i].length; ++j)
                if (j === 0 || j === sids[i].length - 1) output += backcardInputImage(j, i, width, unit);
                else output += cardInputImage(sids[i], j, i, width, unit);
            rheight = Math.max(rheight, sheight);
        } else {
            let rloc = getRotatedLocation(t, sids[i].length);
            let seq = isSeq(sids[i].map((a) => a.id).sort((a, b) => a - b));
            if (seq) output += cardInputImageRotated(sids[i], rloc, i, width, unit, 1);
            for (let j = 0; j < sids[i].length; ++j)
                if (j === rloc)
                    if (seq) continue;
                    else if (t > 3) output += cardInputImageRotated(sids[i], j++, i, width, unit, 2);
                    else output += cardInputImageRotated(sids[i], j, i, width, unit, 1);
                else output += cardInputImage(sids[i], j, i, width, unit, false);
            if (t > 3) rheight = height;
            else rheight = Math.max(rheight, sheight);
        }
    }
    div.style.paddingTop = `${height - rheight}${unit}`;
    div.innerHTML = output;
    output = "";
    const bdiv = document.getElementById("input-pic-bonus");
    const bids = ipids[2];
    for (let i = 0; i < bids.length; ++i) output += cardInputImage(bids, i, -2, width * 0.75, unit);
    if (bids.length === 0) bdiv.style.paddingTop = `${sheight * 0.75}${unit}`;
    else bdiv.style.paddingTop = "0";
    bdiv.innerHTML = output;
    document.getElementById("subkey_chi").disabled = !isSeq(
        tids
            .slice(-3)
            .map((a) => a.id)
            .sort((a, b) => a - b)
    );
}
function remakeInput(ipids) {
    let newInput = joinHand(ipids[0]);
    for (let i = 0; i < ipids[1].length; ++i) {
        const partInput = joinHand(ipids[1][i]);
        if (ipids[1][i].type) newInput += `[${partInput},${ipids[1][i].type}]`;
        else newInput += `[${partInput}]`;
    }
    if (ipids[2].length > 0) newInput += `(${joinHand(ipids[2])})`;
    document.getElementById("inputText").value = newInput;
}
function addInput(i) {
    if (typeof i === "number") i = { id: i };
    document.getElementById("inputText").value += " ";
    document.getElementById("inputText").value += cardName(i);
    drawInputCards();
}
function removeInput(i, j, k) {
    if (j === -1) {
        ipids[0].splice(i, 1);
    } else if (j === -2) {
        // ipids[0].push(ipids[2][i]);
        ipids[2].splice(i, 1);
    } else {
        let t = getUnifiedType(ipids[1][j]);
        if (t % 4 === 0 || k === 1) {
            // for (let i = 0; i < ipids[1][j].length; ++i) ipids[0].push(ipids[1][j][i]);
            ipids[1].splice(j, 1);
        } else {
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
    gb_worker = new Worker("mahjong-worker.js");
    gb_worker.onmessage = function (e) {
        if ('debug' in e.data) {
            document.getElementById("time-output-score-gb").textContent = e.data.debug;
            document.getElementById("output-score-gb").innerHTML = e.data.output;
            return;
        }
        gb_worker.terminate();
        gb_worker = null;
        document.getElementById("output-score-gb").innerHTML = e.data.result.output;
        document.getElementById("brief-output-score-gb").innerHTML = e.data.result.brief;
        document.getElementById("time-output-score-gb").textContent = `Used ${e.data.time} ms`;
    }
    const { aids, substeps, save } = gb_worker_info;
    gb_worker.postMessage({ task: "gb-score", aids, substeps, save, gw, mw, wt, info });
}