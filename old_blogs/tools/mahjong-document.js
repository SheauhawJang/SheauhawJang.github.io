let aids;
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
    const input = document.getElementById("inputText").value;
    aids = splitTiles(input);
    let tids = aids[0];
    let bids = aids[2];
    let tiles = getTiles(tids);
    let subtiles = getTiles(bids);
    for (let i = 0; i < aids[1].length; ++i) {
        const ids = aids[1][i].content;
        for (let j = 0; j < ids.length; ++j) ++subtiles[ids[i].id];
    }
    let tcnt = tids.length;
    let full_tcnt = tcnt;
    if (tcnt % 3 === 1) ++full_tcnt;
    document.getElementById("output-cnt").textContent = tilesInfo(tcnt);
    document.getElementById("output-pic").innerHTML = tilesImage(tids) + subtilesImage(aids[1], tcnt);
    document.getElementById("output-pic-bonus").innerHTML = tilesImage(bids, true);
    document.getElementById("output-box-head").style.display = "block";
    worker = new Worker("mahjong-worker.js");
    let task = 0;
    let step, step13;
    let save;
    let dvd, dvd7, dvd13;
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
                step = result.step;
                save = result.save;
                dvd = result.dvd;
                break;
            case 1:
                step13 = result.step13;
                dvd7 = result.dvd7;
                dvd13 = result.dvd13;
                break;
        }
        ++task;
        switch (task) {
            case 0:
            case 1:
                worker.postMessage({ task, tiles, tcnt, full_tcnt, dvd });
                break;
            case 2:
                worker.postMessage({ task, tiles, tcnt, full_tcnt, step, save, step13, dvd, dvd7, dvd13 });
                break;
            case 3:
                worker.postMessage({ task, tiles, tcnt, full_tcnt, step, save, dvd });
                break;
            case 4:
                worker.terminate();
                worker = null;
                break;
        }
    };
    worker.postMessage({ task, tiles, tcnt, full_tcnt, lang });
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
    return `<div class="card-div" style="width: ${width}%;">${link ? `<div class="card-overlay"></div>` : ""}<img src="./cards/${cardName(tids[i])}.gif"${link ? ` onclick="discard(${i})"` : ""}></div>`;
}
function cardLargeImageRotated(id, width, cnt) {
    return `<div class="card-div" style="width: ${width * 129 / 80}%;"><img src="./cards/${cnt === 2 ? 'k' : 'r'}${cardName(id)}.gif"></div>`;
}
function backcardImage(width) {
    return `<div class="card-div" style="width: ${width}%;"><img src="./cards/b.gif"></div>`
}
function emptycardImage(width) {
    return `<div class="card-div" style="width: ${width / 5}%;"></div>`
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
        const ids = aids[1][i].content;
        for (let j = 0; j < ids.length; ++j) ++tiles[ids[i].id];
    }
    let mount = [];
    for (let i = 0; i < sizeUT; ++i) for (let j = 0; j < 4 - tiles[j]; ++j) mount.push(i);
    if (mount.length === 0) return;
    tids.splice(i, 1);
    tids.sort((a, b) => a.id - b.id);
    tids.push({ id: mount[Math.floor(Math.random() * mount.length)] });
    let newInput = joinHand(tids);
    for (let i = 0; i < aids[1].length; ++i) {
        const partInput = joinHand(aids[1][i].content);
        if (aids[1][i].concealed) newInput += `[${partInput}]`;
        else newInput += `<${partInput}>`;
    }
    newInput += `(${joinHand(bids)})`;
    document.getElementById("inputText").value = newInput;
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
        if (sids[i].concealed) {
            for (let j = 0; j < sids[i].content.length; ++j) {
                if (j === 0 || j === sids[i].content.length - 1) output += backcardImage(width);
                else output += cardLargeImage(sids[i].content, j, width, false);
            }
        } else {
            let rid = 0, skip = -1;
            let rcnt = 0;
            for (let j = 0; j < sids[i].content.length; ++j) 
                if (sids[i].content[j].rotate) 
                    if (rcnt < 1) rid = j, ++rcnt; 
                    else {
                        skip = j, ++rcnt;
                        break;
                    }
            for (let j = 0; j < sids[i].content.length; ++j) {
                if (j === skip) continue;
                else if (j === rid) output += cardLargeImageRotated(sids[i].content[j], width, rcnt);
                else output += cardLargeImage(sids[i].content, j, width, false); 
            }
        }
    }
        console.log(output);
    return output;
}
// Input Panel Functions
let ipids;
function cardInputImage(i, width) {
    return `<div class="card-div" style="width: ${width};"><div class="card-overlay"></div><img src="./cards/${cardName(ipids[i])}.gif" onclick="removeInput(${i})"></div>`;
}
function drawInputCards() {
    ipids = splitTiles(document.getElementById("inputText").value);
    let div = document.getElementById("input-pic");
    let output = "";
    let width = `${400 / 14}px`;
    let height = `${(400 * 129) / 14 / 80}px`;
    if (window.matchMedia("screen and (max-width: 512px)").matches) {
        width = `${100 / 20}%`;
        height = `${(100 * 129) / 20 / 80}%`;
    }
    for (let i = 0; i < ipids.length; ++i) output += cardInputImage(i, width);
    if (ipids.length === 0) div.style.paddingTop = height;
    else div.style.paddingTop = "0";
    div.innerHTML = output;
}
function addInput(i) {
    if (typeof i === "number") i = { id: i };
    document.getElementById("inputText").value += " ";
    document.getElementById("inputText").value += cardName(i);
    drawInputCards();
}
function removeInput(i) {
    ipids.splice(i, 1);
    let handname = [];
    for (let i = 0; i < ipids.length; ++i) {
        handname.push(cardName(ipids[i]));
        if (handname.length >= 2) if (handname[i][1] === handname[i - 1][1]) handname[i - 1] = handname[i - 1][0];
    }
    document.getElementById("inputText").value = handname.join("");
    drawInputCards();
}
function clearInput() {
    document.getElementById("inputText").value = "";
    drawInputCards();
}
function sortInput() {
    ipids.sort((a, b) => a.id - b.id);
    let handname = [];
    for (let i = 0; i < ipids.length; ++i) {
        handname.push(cardName(ipids[i]));
        if (handname.length >= 2) if (handname[i][1] === handname[i - 1][1]) handname[i - 1] = handname[i - 1][0];
    }
    document.getElementById("inputText").value = handname.join("");
    drawInputCards();
}
