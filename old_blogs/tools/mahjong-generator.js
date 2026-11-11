// Mahjong Winning Hand Generators (Pure Functions)
// Independent of DOM, providing procedural generation of winning hand profiles
// across multiple rule variants (Standard, 7 Pairs, 13 Orphans, Knitted Dragon, etc.)

(function (global) {
    function rand(l, r) {
        if (typeof random === "function") return random(l, r);
        if (r === undefined) { r = l; l = 0; }
        return l + Math.floor(Math.random() * (r - l));
    }

    function getMeld(seqs = default_seqs, tris = default_tris) {
        const seqrate = 64;
        const seq = seqs.length * seqrate;
        const tri = tris.length;
        const r = rand(seq + tri);
        if (r >= seq) return Array(3).fill(tris[r - seq]);
        return ArrayMap(3, (_, i) => seqs[Math.floor(r / seqrate)] + i);
    }

    function generateWinningTiles(n = 14, seqs = default_seqs, tris = default_tris) {
        const [melds, head] = [Math.floor(n / 3), n % 3 ? 1 : 0];
        let tiles = Array(sizeUT).fill(0);
        for (let i = 0; i < melds; ++i) getMeld(seqs, tris).forEach((x) => ++tiles[x]);
        for (let i = 0; i < head; ++i) tiles[tris[rand(tris.length)]] += 2;
        return tiles;
    }

    function generateWinningHand(n = 14, seqs = default_seqs, tris = default_tris) {
        const tiles = generateWinningTiles(n, seqs, tris);
        let jokercount = 0;
        for (let i = 0; i < sizeUT; ++i) if (tiles[i] > 4) ((jokercount += tiles[i] - 4), (tiles[i] = 4));
        let hand = tiles.flatMap((count, i) => Array(count).fill(i));
        if (jokercount > 0) {
            const jc = typeof JokerC !== "undefined" ? JokerC : 42;
            hand.unshift(...Array(jokercount).fill(jc));
        }
        return hand;
    }

    function generateWinningPairs(disjoint = 0, guse = guseall) {
        if (disjoint === true) disjoint = 1;
        let arr = [];
        for (let i = 0; i < sizeUT; ++i) if (guse[i] !== Infinity) arr.push(i);
        let hand = [];
        if (disjoint) {
            let plot = arr.flatMap((x) => Array(disjoint).fill(x));
            shuffle(plot);
            for (let i = 0; i < 7; ++i) hand.push(plot[i], plot[i]);
        } else {
            for (let i = 0; i < 7; ++i) hand.push(...Array(2).fill(arr[rand(arr.length)]));
        }
        return hand;
    }

    function generateWinningOrphan() {
        let hand = Orphan13Array.slice();
        hand.push(hand[rand(13)]);
        return hand;
    }

    function generateWinningBukao() {
        let hand = [...KnitDragonSave[rand(6)], ...ArraySeq(27, sizeUT)];
        shuffle(hand);
        return [...hand.slice(0, 13).sort((a, b) => a - b), hand[13]];
    }

    function generateWinningKDragon(n = 14) {
        let tiles = generateWinningTiles(n - 9);
        KnitDragonSave[rand(6)].forEach((x) => ++tiles[x]);
        let hand = [];
        tiles.forEach((x, i) => hand.push(...Array(x).fill(i)));
        return hand;
    }

    function generateWinningNiconico() {
        let hand = [];
        for (let i = 0; i < 7; ++i) hand.push(...Array(2).fill(rand(sizeUT)));
        hand.push(...Array(3).fill(rand(sizeUT)));
        return hand;
    }

    function generateWinningOrphanMeld() {
        let hand = Orphan13Array.slice();
        hand.push(hand[rand(13)], ...getMeld());
        return hand;
    }

    function generateWinningBuda() {
        let buda = [];
        for (let a = 0; a < 3; ++a) for (let b = a + 3; b < 6; ++b) for (let c = b + 3; c < 9; ++c) buda.push([a, b, c]);
        let hand = ArraySeq(27, sizeUT);
        for (let i = 0; i < 3; ++i) hand.push(...buda[rand(buda.length)].map((x) => x + ColorFirstArray[i]));
        hand.push(hand[rand(hand.length)]);
        return hand;
    }

    function generateWinningSC(i) {
        if (i === undefined) i = rand(3);
        if (Math.random() < 0.1) return generateWinningPairs(2, guseque[i]);
        const seqs = default_seqs.filter((_, idx) => idx < i * 7 || idx >= (i + 1) * 7);
        const tris = ArraySeq(0, 27).filter((_, idx) => idx < i * 9 || idx >= (i + 1) * 9);
        return generateWinningHand(14, seqs, tris);
    }

    const root = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : (typeof self !== "undefined" ? self : this));
    root.getMeld = getMeld;
    root.generateWinningTiles = generateWinningTiles;
    root.generateWinningHand = generateWinningHand;
    root.generateWinningPairs = generateWinningPairs;
    root.generateWinningOrphan = generateWinningOrphan;
    root.generateWinningBukao = generateWinningBukao;
    root.generateWinningKDragon = generateWinningKDragon;
    root.generateWinningNiconico = generateWinningNiconico;
    root.generateWinningOrphanMeld = generateWinningOrphanMeld;
    root.generateWinningBuda = generateWinningBuda;
    root.generateWinningSC = generateWinningSC;
    if (typeof window !== "undefined" && root !== window) {
        window.getMeld = getMeld;
        window.generateWinningTiles = generateWinningTiles;
        window.generateWinningHand = generateWinningHand;
        window.generateWinningPairs = generateWinningPairs;
        window.generateWinningOrphan = generateWinningOrphan;
        window.generateWinningBukao = generateWinningBukao;
        window.generateWinningKDragon = generateWinningKDragon;
        window.generateWinningNiconico = generateWinningNiconico;
        window.generateWinningOrphanMeld = generateWinningOrphanMeld;
        window.generateWinningBuda = generateWinningBuda;
        window.generateWinningSC = generateWinningSC;
    }
})(typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : (typeof self !== "undefined" ? self : this)));
