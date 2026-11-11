// Multi-rule Tenhou / Tianhu Simulator Controller
// Reuses core mahjong algorithms from mahjong.js and DOM/skin helpers from mahjong-document.js
(function () {
    let isRunning = false;
    let worker = null;
    let totalAttempts = 0;
    let startTime = 0;
    let lastElapsedSec = 0;
    let lastSpeed = 0;
    let animFrameId = null;
    let lastResultHand = null;
    let lastResultYaku = null;
    let lastResultFlowers = [];
    let currentMode = "jp4";
    let currentLang = "cn";

        // Mode configuration & metadata
    // dealerFreq: Average dealer hands per unit (GB: strict 4 deals/match no-repeat; SC: 0.25 deal/hand deal-by-deal)
    // matchMinutes: Average duration (minutes) based on online platform data (Quezha/Majsoul/Tenhou/Tencent/JJ)
    const guseSC = guseall.map((_, i) => (i >= 27 ? Infinity : 0));
    const MODE_META = {
        jp4: { nameKey: "mode_jp4_name", handSize: 14, poolKey: "sim_pool_jp4", calcTab: 2, dealerFreq: 2.7, matchMinutes: 40, unitKey: "sim_unit_banzhuang", guse: guseall, hasFlowers: false, isYaku: true,  tianhuKey: "JP_YAKUNAME_32", winBadgeKey: "sim_hint_win_badge" },
        jp3: { nameKey: "mode_jp3_name", handSize: 14, poolKey: "sim_pool_jp3", calcTab: 2, dealerFreq: 3.5, matchMinutes: 25, unitKey: "sim_unit_banzhuang", guse: guse3p,  hasFlowers: false, isYaku: true,  tianhuKey: "JP_YAKUNAME_32", winBadgeKey: "sim_hint_win_badge" },
        shura: { nameKey: "mode_shura_name", handSize: 14, drawSize: 13, poolKey: "sim_pool_shura", handKey: "sim_hand_shura", calcTab: 2, dealerFreq: 2.7, matchMinutes: 15, unitKey: "sim_unit_banzhuang", guse: guseall, hasFlowers: false, hasWildcard: true, isYaku: true, tianhuKey: "JP_YAKUNAME_32", winBadgeKey: "sim_hint_win_badge" },
        gb:  { nameKey: "mode_gb_name", handSize: 14, poolKey: "sim_pool_gb", calcTab: 1, dealerFreq: 4.0, matchMinutes: 70, unitKey: "sim_unit_pan",       guse: guseall, hasFlowers: true,  isYaku: false, tianhuKey: "GB_FANNAME_86", winBadgeKey: "sim_hint_win_badge_gb" },
        sc:  { nameKey: "mode_sc_name", handSize: 14, poolKey: "sim_pool_sc", calcTab: 4, dealerFreq: 0.25, matchMinutes: 4, unitKey: "sim_unit_ju",        guse: guseSC,  hasFlowers: false, isYaku: true,  tianhuKey: "SC_FAN_NAME_12", winBadgeKey: "sim_hint_win_badge" },
        tw:  { nameKey: "mode_tw_name", handSize: 17, poolKey: "sim_pool_tw", calcTab: 3, dealerFreq: 4.5, matchMinutes: 90, unitKey: "sim_unit_zhuang",    guse: guseall, hasFlowers: true,  isYaku: true,  tianhuKey: "GB_FANNAME_86", winBadgeKey: "sim_hint_win_badge" }
    };

    // Rigorous Combinatorial Models for exact Tenhou probability calculations per hand type selection
    const COMBINATORICS = {
        jp4: {
            totalSpace: 4250305029168216000, // C(136, 14)
            types: {
                normal:  11353128141498, // Standard 4 melds + 1 pair
                pair7:   1505948184576,  // 7 distinct pairs (C(34, 7) * 6^7)
                kokushi: 1308622848      // Thirteen Orphans (13 * 6 * 4^12)
            },
            overlaps: [
                { types: ["normal", "pair7"], count: 1306741248 } // Ryanpeikou with 7 distinct pairs
            ]
        },
        jp3: {
            totalSpace: 139737927523546800, // C(108, 14)
            types: {
                normal:  1072362602896, // Standard 4 melds + 1 pair in 3-player pool
                pair7:   248591566080,  // 7 distinct pairs (C(27, 7) * 6^7)
                kokushi: 1308622848      // Thirteen Orphans in 3-player pool
            },
            overlaps: [
                { types: ["normal", "pair7"], count: 375394176 } // Exact Ryanpeikou with 7 distinct pairs
            ]
        },
        shura: {
            totalSpace: 483774556165488000, // C(136, 13)
            types: {
                normal:  32244742336860, // Standard 4 melds + 1 pair Tenpai (Profile 1: 12,019,520,232,324; Profile 2: 20,225,222,104,536)
                pair7:   7027758194688,  // 7 pairs Tenpai (C(34, 6) * 28 * 6^6 * 4)
                kokushi: 3992977408      // Thirteen Orphans Tenpai (4^13 + 13 * 12 * 6 * 4^11)
            },
            overlaps: [
                { types: ["normal", "pair7"], count: 6098125824 } // Exact Normal ∩ Pair7 overlap (32,676 patterns * 186,624)
            ]
        },
        sc: {
            totalSpace: 139737927523546800, // C(108, 14)
            types: {
                normal: 1151855065656, // Natural void of at least 1 suit + Pinghu
                pair7:  26695816704    // Natural void of at least 1 suit + 7 pairs
            },
            overlaps: [
                { types: ["normal", "pair7"], count: 589545216 } // Natural void + Ryanpeikou with 7 distinct pairs
            ]
        },
        gb: {
            totalSpace: 4250305029168216000, // C(136, 14)
            types: {
                normal:         11353128141498, // Standard 4 melds + 1 pair
                pair7:          1569298171584,  // 7 pairs (including 4-of-a-kind as 2 pairs)
                orphan13:       1308622848,      // Thirteen Orphans
                quanbukaoxing:  193273528320,    // All Unsuited / Seven Star Unsuited
                zuhelongxing:   142079164416     // Knitted Dragon (147, 258, 369 + 1 meld + 1 pair)
            },
            overlaps: [
                { types: ["normal", "pair7"], count: 1318439178 } // Exact Normal ∩ Pair7 (including 4-of-a-kind as 2 pairs)
            ]
        },
        tw: {
            totalSpace: 1.8453824364876825e21, // C(136, 17)
            types: {
                normal:         1554490175889888, // Standard 5 melds + 1 pair
                niconico:       169740015515136,  // 7 pairs + 1 triplet (Niconico / 八对半)
                orphan13:       1550516748288,    // 13 Orphans with 1 meld (702 patterns)
                shiliubudaxing: 103079215104000   // 16 isolated tiles (1,000 patterns) + 1 pair
            },
            overlaps: [
                { types: ["normal", "niconico"], count: 142425658800 } // Ryanpeikou + 1 koutsu + 1 pair
            ]
        }
    };

    function parseSciExp(prob) {
        if (!prob || prob <= 0) return null;
        const [coeff, exp] = prob.toExponential(4).split("e");
        return { coeff, expNum: parseInt(exp, 10) };
    }

    function formatProbSciHtml(prob) {
        const parts = parseSciExp(prob);
        if (!parts) return "0";
        return `${parts.coeff} × 10<sup>${parts.expNum}</sup>`;
    }

    function formatProbSciText(prob) {
        const parts = parseSciExp(prob);
        if (!parts) return "0";
        const supMap = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
        const supExp = String(parts.expNum).split("").map(c => supMap[c] || c).join("");
        return `${parts.coeff} × 10${supExp}`;
    }

    let cachedProbData = null;

    function getSelectedProbData(mode = currentMode, forceRefresh = false) {
        if (mode === currentMode && cachedProbData && !forceRefresh) {
            return cachedProbData;
        }
        const comb = COMBINATORICS[mode] || COMBINATORICS.jp4;
        const set = selectedTypes[mode] || new Set();
        let totalWays = 0;
        for (const typeKey of set) {
            if (comb.types[typeKey]) totalWays += comb.types[typeKey];
        }
        if (comb.overlaps) {
            for (const ov of comb.overlaps) {
                if (ov.types.every(t => set.has(t))) totalWays -= ov.count;
            }
        }
        if (totalWays <= 0) totalWays = 1;
        const prob = totalWays / comb.totalSpace;
        const mean = Math.round(comb.totalSpace / totalWays);
        const meanStr = mean.toLocaleString();
        const probHtml = formatProbSciHtml(prob);
        const probStr = formatProbSciText(prob);
        const res = { prob, mean, probHtml, probStr, meanStr, totalWays, totalSpace: comb.totalSpace };
        if (mode === currentMode) cachedProbData = res;
        return res;
    };

    const MODE_HAND_TYPES = {
        jp4:   ["normal", "pair7", "kokushi"],
        jp3:   ["normal", "pair7", "kokushi"],
        shura: ["normal", "pair7", "kokushi"],
        gb:    ["normal", "pair7", "orphan13", "quanbukaoxing", "zuhelongxing"],
        sc:    ["normal", "pair7"],
        tw:    ["normal", "niconico", "orphan13", "shiliubudaxing"]
    };

    const selectedTypes = {
        jp4:   new Set(MODE_HAND_TYPES.jp4),
        jp3:   new Set(MODE_HAND_TYPES.jp3),
        shura: new Set(MODE_HAND_TYPES.shura),
        gb:    new Set(MODE_HAND_TYPES.gb),
        sc:    new Set(MODE_HAND_TYPES.sc),
        tw:    new Set(MODE_HAND_TYPES.tw)
    };

    function fmtTiles(n) {
        const u = loc.sim_tiles_unit || loc.unit || loc.counts || "枚";
        return currentLang === "en" ? `${n} ${u}` : `${n}${u}`;
    }

    function fmtLoc(key, fallback, vars) {
        let s = loc[key] || fallback;
        if (vars) Object.keys(vars).forEach(k => { s = s.split(`{${k}}`).join(vars[k]); });
        return s;
    }
    function getHandsPerSecUnit() {
        return " " + ((loc && loc.sim_unit_hands_per_sec) || "hands/s");
    }

    function getSecondUnit() {
        return (loc && loc.sim_unit_second) || "s";
    }

    function getAttemptsUnit() {
        return " " + ((loc && loc.sim_unit_ci) || "hands");
    }

    function refreshStatsDisplay() {
        const counterEl = document.getElementById("tenhou-counter");
        if (counterEl) counterEl.textContent = totalAttempts.toLocaleString();

        const speedEl = document.getElementById("tenhou-speed");
        if (speedEl) {
            if (lastSpeed > 0 && lastElapsedSec > 0.05) {
                const handsUnit = getHandsPerSecUnit();
                if (lastSpeed >= 1000000) {
                    speedEl.textContent = (lastSpeed / 1000000).toFixed(2) + " M" + handsUnit;
                } else {
                    speedEl.textContent = Math.round(lastSpeed / 1000) + " k" + handsUnit;
                }
            } else {
                speedEl.textContent = "-";
            }
        }

        const timeEl = document.getElementById("tenhou-time");
        if (timeEl) {
            timeEl.textContent = lastElapsedSec.toFixed(1) + " " + getSecondUnit();
        }

        const probData = getSelectedProbData(currentMode);
        const probEl = document.getElementById("tenhou-prob");
        if (probEl) {
            if (totalAttempts > 0) {
                const cumProb = (1 - Math.pow(1 - probData.prob, totalAttempts)) * 100;
                probEl.textContent = cumProb < 0.01 ? (cumProb < 0.0001 ? "< 0.01%" : cumProb.toFixed(3) + "%") : cumProb.toFixed(1) + "%";
            } else {
                probEl.textContent = "0.0%";
            }
        }

        const meanEl = document.getElementById("tenhou-mean");
        if (meanEl && meanEl.dataset.mean !== probData.meanStr) {
            meanEl.dataset.mean = probData.meanStr;
            meanEl.textContent = `${probData.meanStr}${getAttemptsUnit()}`;
            meanEl.title = `${probData.totalWays.toLocaleString()} / ${probData.totalSpace.toLocaleString()}`;
        }
    }


    function getTianhuTerm(mode) {
        const meta = MODE_META[mode] || MODE_META.jp4;
        return loc[meta.tianhuKey] || loc.GB_FANNAME_86 || loc.JP_YAKUNAME_32 || "天和";
    }

    function getWinBadgeText(mode) {
        const meta = MODE_META[mode] || MODE_META.jp4;
        return loc[meta.winBadgeKey] || "TENHOU";
    }

    // Winning capsule shape name directly using loc[yakuType] preserving fan html
    function getWinCapsuleHtml(yakuType) {
        if (!yakuType) return "";
        return loc[yakuType] || yakuType;
    }

    function getYakuDisplayName(mode, yakuType) {
        const meta = MODE_META[mode] || MODE_META.jp4;
        const modeName = loc[meta.nameKey] || meta.nameKey;
        const shapeHtml = loc[yakuType] || yakuType;
        let tianhu = getTianhuTerm(mode);
        // Direct bare call to yaku name -> wrap in class="fan" in English
        if (currentLang === "en") {
            tianhu = `<span class="fan">${tianhu}</span>`;
        }
        return `${modeName} · ${tianhu} · ${shapeHtml}`;
    }

    function setOptionsDisabled(disabled) {
        const bar = document.getElementById("tenhou-type-bar");
        if (bar) bar.classList.toggle("disabled-bar", disabled);
        document.querySelectorAll('#tenhou-type-options input[type="checkbox"]').forEach(input => {
            input.disabled = disabled;
        });
    }

    function renderTypeOptions() {
        const container = document.getElementById("tenhou-type-options");
        if (!container) return;

        const available = MODE_HAND_TYPES[currentMode] || MODE_HAND_TYPES.jp4;
        const currentSet = selectedTypes[currentMode];

        let html = "";
        available.forEach(typeKey => {
            const isChecked = currentSet.has(typeKey);
            const labelHtml = loc[typeKey] || typeKey;
            const disabledAttr = isRunning ? "disabled" : "";
            html += `<label><input type="checkbox" name="tenhou-type" value="${typeKey}" ${isChecked ? "checked" : ""} ${disabledAttr} /><span data-i18n="${typeKey}">${labelHtml}</span></label>`;
        });
        container.innerHTML = html;

        const bar = document.getElementById("tenhou-type-bar");
        if (bar) bar.classList.toggle("disabled-bar", isRunning);

        container.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.addEventListener("change", (e) => {
                if (isRunning) {
                    e.preventDefault();
                    return;
                }
                const val = e.target.value;
                if (e.target.checked) {
                    currentSet.add(val);
                } else {
                    if (currentSet.size <= 1) {
                        e.target.checked = true;
                        return;
                    }
                                        currentSet.delete(val);
                }
                cachedProbData = null;
                updateModeSpecUI();
            });
        });
    }

    function stripHtml(s) {
        return (s || "").replace(/<[^>]*>/g, "").trim();
    }

    function getEvaluation(count, mode) {
        const probData = getSelectedProbData(mode);
        const mean = probData.mean;

        const ci = getAttemptsUnit().trim();
        const descOf = (digits) => `${count.toLocaleString()} ${ci} (${fmtLoc("sim_eval_ratio", "{r}x mean", { r: (count / mean).toFixed(digits) })})`;

        // Scale thresholds proportionally relative to standard Riichi 4P mean (330,000)
        // In JP4 mode, these produce exact integers: 1, 100, 1000, 10000, 100000, 330000, 1000000, 3300000
        const scale = mean / 330000;
        const t2 = Math.max(2, Math.round(100 * scale));
        const t3 = Math.max(5, Math.round(1000 * scale));
        const t4 = Math.max(10, Math.round(10000 * scale));
        const t5 = Math.max(20, Math.round(100000 * scale));
        const t6 = Math.round(mean);
        const t7 = Math.round(1000000 * scale);
        const t8 = Math.round(3300000 * scale);

        if (count === 1) {
            const firstDesc = loc.eval_first_desc || "1 /";
            return {
                title: loc.eval_r1_title || "",
                desc: `${firstDesc} ${mean.toLocaleString()}`
            };
        }
        let rank = 9;
        let digits = 1;
        if (count <= t2) { rank = 2; digits = 3; }
        else if (count <= t3) { rank = 3; digits = 3; }
        else if (count <= t4) { rank = 4; digits = 3; }
        else if (count <= t5) { rank = 5; digits = 2; }
        else if (count <= t6) { rank = 6; digits = 2; }
        else if (count <= t7) { rank = 7; digits = 1; }
        else if (count <= t8) { rank = 8; digits = 1; }

        return {
            title: loc[`eval_r${rank}_title`] || "",
            desc: descOf(digits)
        };
    }

    function splitAndSortHand(handArr, hasWildcard) {
        const toId = (t) => (typeof t === "number" ? t : (t && t.id));
        let leadTile = null;
        let regularTiles = handArr;

        if (hasWildcard) {
            const jc = typeof JokerC !== "undefined" ? JokerC : 42;
            leadTile = jc;
            regularTiles = handArr.filter(t => toId(t) !== jc);
        }

        const handFront = regularTiles.length - 1;
        const sortedFront = regularTiles.slice(0, handFront).sort((a, b) => toId(a) - toId(b));
        const tsumo = regularTiles[handFront];

        return { leadTile, sortedFront, tsumo };
    }

    // Reuses joinHand from mahjong-document.js to format hand in standard MPSZ notation
    function formatHandString(handArr, flowersArr) {
        if (!handArr || handArr.length === 0) return "";
        const meta = MODE_META[currentMode] || MODE_META.jp4;
        const { leadTile, sortedFront, tsumo } = splitAndSortHand(handArr, meta.hasWildcard);
        const sorted = leadTile !== null ? [leadTile, ...sortedFront, tsumo] : [...sortedFront, tsumo];

        let res = typeof joinHand === "function" ? joinHand(sorted) : sorted.join(",");
        if (flowersArr && flowersArr.length > 0) {
            const flowerStr = flowersArr.map(id => typeof cardName === "function" ? cardName(id) : `${id}`).join("");
            res += `(${flowerStr})`;
        }
        res += "-E~F~A=3^X";
        return res;
    }

    function formatPlaytime(totalMinutes) {
        const days = Math.floor(totalMinutes / (24 * 60));
        const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
        const mins = totalMinutes % 60;
        const u = {
            y: (loc && loc.sim_unit_year) || " y",
            d: (loc && loc.sim_unit_day) || " d",
            h: (loc && loc.sim_unit_hour) || " h",
            m: (loc && loc.sim_unit_minute) || " m"
        };
        const approxWord = (loc && loc.sim_approx) || "~";
        if (days >= 365) return `${approxWord} ${(days / 365.25).toFixed(1)}${u.y} (${days.toLocaleString()}${u.d})`;
        if (days > 0) return `${days}${u.d} ${hours}${u.h}`;
        if (hours > 0) return `${hours}${u.h} ${mins}${u.m}`;
        return `${mins}${u.m}`;
    }

    function renderSuccessBanner() {
        const banner = document.getElementById("tenhou-success-banner");
        if (!banner || !lastResultHand || !lastResultYaku) return;

        const evalInfo = getEvaluation(totalAttempts, currentMode);
        const meta = MODE_META[currentMode] || MODE_META.jp4;
        const yakuName = getYakuDisplayName(currentMode, lastResultYaku);

        const totalMatches = Math.round(totalAttempts / meta.dealerFreq);
        const totalMinutes = Math.round(totalMatches * meta.matchMinutes);
        const timeStr = formatPlaytime(totalMinutes);
        const unitName = loc[meta.unitKey] || "半庄";

        const pfx = loc.sim_match_label_prefix || "Equivalent";
        const sfx = loc.sim_match_label_suffix || "Count";
        const matchLabel = currentLang === "en" ? `${pfx} ${unitName} ${sfx}` : `${pfx}${unitName}${sfx}`;
        const timeLabel = loc.sim_playtime_label || "Equivalent Playtime";
        const importBtnText = loc.sim_import_to_calc || "填入主计算器分析";
        const copyBtnText = loc.sim_copy_result || "复制结果";
        const restartBtnText = loc.sim_restart || "重新开始";

        banner.innerHTML = `
            <div class="tenhou-success-badge">${yakuName}</div>
            <div class="tenhou-success-title">${evalInfo.title}</div>
            <div class="tenhou-success-desc">${evalInfo.desc}</div>
            <div class="tenhou-realtime-grid">
                <div class="tenhou-realtime-box">
                    <div class="tenhou-realtime-label">${matchLabel}</div>
                    <div class="tenhou-realtime-val">${loc.sim_approx || "约"} ${totalMatches.toLocaleString()} ${unitName}</div>
                </div>
                <div class="tenhou-realtime-box">
                    <div class="tenhou-realtime-label">${timeLabel}</div>
                    <div class="tenhou-realtime-val">${timeStr}</div>
                </div>
            </div>
            <div class="tenhou-actions-row">
                <button class="tenhou-btn tenhou-btn-primary" onclick="window.tenhouSim.importToCalculator()" type="button">
                    ${importBtnText}
                </button>
                <button class="tenhou-btn tenhou-btn-secondary" onclick="window.tenhouSim.copyResult()" type="button">
                    ${copyBtnText}
                </button>
                <button class="tenhou-btn tenhou-btn-secondary" onclick="window.tenhouSim.start()" type="button">
                    ${restartBtnText}
                </button>
            </div>
        `;
        banner.style.display = "block";
    }

    function refreshStatusUI() {
        const statusHint = document.getElementById("tenhou-status-hint");
        const meta = MODE_META[currentMode] || MODE_META.jp4;
        if (lastResultHand && lastResultYaku) {
            if (statusHint) {
                const winBadge = getWinBadgeText(currentMode);
                const winText = getWinCapsuleHtml(lastResultYaku);
                statusHint.innerHTML = `<span class="mat-status-badge mat-status-win">★ ${winBadge}</span><span class="mat-status-text mat-status-win">${winText}</span>`;
            }
            renderSuccessBanner();
        } else if (lastResultHand && !lastResultYaku) {
            if (statusHint) {
                const dealBadge = loc.sim_hint_dealt || "Hand Dealt";
                const dealText = (!meta.isYaku) ? (loc.sim_hint_no_win_gb || "No Win") : (loc.sim_hint_no_win || "No Tenhou");
                statusHint.innerHTML = `<span class="mat-status-badge">${dealBadge}</span><span class="mat-status-text">${dealText}</span>`;
            }
        } else if (isRunning) {
            if (statusHint) {
                const runBadge = loc.sim_hint_simulating || "Running";
                const samplingWord = loc.sim_hint_sampling || "Sampling...";
                statusHint.innerHTML = `<span class="mat-status-badge">${runBadge}</span><span class="mat-status-text">${samplingWord}</span>`;
            }
        } else if (totalAttempts > 0) {
            if (statusHint) {
                const pauseBadge = loc.sim_hint_paused || "Paused";
                const pauseText = loc.sim_hint_resume || "Waiting";
                statusHint.innerHTML = `<span class="mat-status-badge">${pauseBadge}</span><span class="mat-status-text">${pauseText}</span>`;
            }
        } else {
            if (statusHint) {
                const readyBadge = loc.sim_hint_ready_badge || "Ready";
                const hintText = loc.sim_hint_init || "Ready";
                statusHint.innerHTML = `<span class="mat-status-badge">${readyBadge}</span><span class="mat-status-text">${hintText}</span>`;
            }
        }
    }

    // Maps aliases to the 5 supported canonical languages (aligned with reverse proxy):
    // cn: zh, cn, sg
    // tw: tw
    // hk: hk, mo
    // ja: jp, ja
    // en: en, kr, eu, us, vn, uk
    function normalizeLang(raw) {
        if (!raw) return null;
        const l = String(raw).trim().toLowerCase();
        if (/^(?:zh|cn|sg)$/.test(l)) return "cn";
        if (/^(?:tw)$/.test(l)) return "tw";
        if (/^(?:hk|mo)$/.test(l)) return "hk";
        if (/^(?:jp|ja)$/.test(l)) return "ja";
        if (/^(?:en|kr|eu|us|vn|uk)$/.test(l)) return "en";
        if (l.startsWith("zh-tw") || l.startsWith("zh-hant")) return "tw";
        if (l.startsWith("zh-hk") || l.startsWith("zh-mo")) return "hk";
        if (l.startsWith("zh")) return "cn";
        if (l.startsWith("ja")) return "ja";
        if (l.startsWith("en")) return "en";
        return null;
    }

    function updateUrlParams(updates = {}) {
        if (!window.history || !window.history.replaceState) return;
        try {
            const url = new URL(window.location.href);
            for (const [key, val] of Object.entries(updates)) {
                if (val === null || val === undefined) {
                    url.searchParams.delete(key);
                } else {
                    url.searchParams.set(key, val);
                }
            }
            window.history.replaceState(null, "", url.toString());
        } catch (e) {}
    }

    function getShareUrl() {
        try {
            const url = new URL(window.location.href);
            url.searchParams.set("lang", currentLang);
            if (currentMode) {
                url.searchParams.set("mode", currentMode);
            }
            url.searchParams.delete("deal");
            url.searchParams.delete("demoWin");
            return url.toString();
        } catch (e) {
            return window.location.href;
        }
    }

    // Apply language dynamically across DOM reusing setLoc and replacei18n
    function applyLanguage(rawLang, updateUrl = true) {
        const lang = normalizeLang(rawLang) || "cn";
        currentLang = lang;
        window.lang = lang;
        window.card_helper = (lang === "en");
        try { localStorage.setItem("mahjong-lang", lang); } catch (e) {}

        if (updateUrl) {
            updateUrlParams({ lang: lang });
        }

        if (typeof setLoc === "function") setLoc(lang);
        if (typeof replacei18n === "function") replacei18n();

        if (loc.sim_page_title) document.title = stripHtml(loc.sim_page_title);

        document.querySelectorAll("[data-i18n-title]").forEach((el) => {
            const key = el.getAttribute("data-i18n-title");
            if (loc[key]) el.setAttribute("title", loc[key]);
        });

        document.querySelectorAll("[data-i18n-theme]").forEach((el) => {
            const color = el.getAttribute("data-i18n-theme");
            const text = loc[`theme_${color}`];
            if (text) {
                el.setAttribute("title", text);
                el.setAttribute("aria-label", text);
            }
        });

        const htmlLangMap = { cn: "zh-CN", tw: "zh-TW", hk: "zh-HK", ja: "ja-JP", en: "en-US" };
        document.documentElement.lang = htmlLangMap[lang] || "zh-CN";

        document.querySelectorAll(".lang-group .lang-btn").forEach(btn => {
            btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
        });

        const pageMap = { cn: "mahjong.html", tw: "mahjong-tw.html", hk: "mahjong-hk.html", ja: "mahjong-ja.html", en: "mahjong-en.html" };
        const calcUrl = pageMap[lang] || "mahjong.html";
        document.querySelectorAll(".link-to-calc").forEach(el => {
            el.href = calcUrl;
        });
        const backLink = document.getElementById("tenhou-back-link");
        if (backLink) backLink.href = calcUrl;

        // Sync custom select trigger text to current language
        if (typeof updateCardSkin === "function") {
            const curSkin = typeof cardskin !== "undefined" ? cardskin : (localStorage.getItem("cardskin") || "jp");
            updateCardSkin(curSkin);
        }

        updateModeSpecUI();
        refreshStatsDisplay();
        refreshStatusUI();

        if (lastResultHand && lastResultHand.length >= 14) {
            renderHandTiles(lastResultHand, lastResultFlowers || []);
        }
    }

    function initDOM() {
        let detectedLang = "cn";
        let hasUrlLang = false;
        let urlParams = null;
        try {
            urlParams = new URLSearchParams(window.location.search);
            const rawLang = urlParams.get("lang");
            const pLang = normalizeLang(rawLang);
            if (pLang) {
                detectedLang = pLang;
                hasUrlLang = true;
            } else {
                const savedLang = normalizeLang(localStorage.getItem("mahjong-lang"));
                if (savedLang) {
                    detectedLang = savedLang;
                }
            }
        } catch (e) {}

        // Initialize theme switcher from mahjong-document.js
        if (typeof initThemeSwitcher === "function") initThemeSwitcher();

        // Initialize custom selects from mahjong-document.js
        if (typeof initCustomSelects === "function") initCustomSelects();

        // Initialize cardskin
        const savedSkin = localStorage.getItem("cardskin") || "jp";
        if (typeof updateCardSkin === "function") updateCardSkin(savedSkin);

        applyLanguage(detectedLang, hasUrlLang);

        // Language buttons listener
        document.querySelectorAll(".lang-group .lang-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const lang = btn.getAttribute("data-lang");
                if (lang && lang !== currentLang) applyLanguage(lang, true);
            });
        });

        // Mode tabs click listeners
        const tabsContainer = document.getElementById("tenhou-mode-tabs");
        if (tabsContainer) {
            tabsContainer.querySelectorAll(".tenhou-mode-tab").forEach(tab => {
                tab.addEventListener("click", () => {
                    const mode = tab.getAttribute("data-mode");
                    if (mode && mode !== currentMode) switchMode(mode);
                });
            });
        }

        // URL parameters check
        if (urlParams) {
            const paramMode = urlParams.get("mode");
            if (paramMode && MODE_META[paramMode]) currentMode = paramMode;

            const paramTheme = urlParams.get("theme");
            if (paramTheme && typeof setTheme === "function") setTheme(paramTheme);
        }

        renderTypeOptions();
        updateModeSpecUI();
        renderInitialTiles();

        if (urlParams) {
            if (urlParams.get("deal") === "1") {
                dealOneHand();
            } else if (urlParams.get("demoWin") === "1") {
                triggerDemoWin();
            }
        }
    }

    function switchMode(mode) {
        if (isRunning) stopSimulation();
        currentMode = mode;
        cachedProbData = null;
        updateUrlParams({ mode: mode });

        totalAttempts = 0;
        lastElapsedSec = 0;
        lastSpeed = 0;
        lastResultHand = null;
        lastResultFlowers = [];
        lastResultYaku = null;

        const banner = document.getElementById("tenhou-success-banner");
        if (banner) banner.style.display = "none";

        const handWrapper = document.getElementById("tenhou-hand-wrapper");
        if (handWrapper) handWrapper.classList.remove("active-win");

        refreshStatsDisplay();
        refreshStatusUI();
        renderTypeOptions();
        updateModeSpecUI();
        renderInitialTiles();
    }

    function updateModeSpecUI() {
        const meta = MODE_META[currentMode] || MODE_META.jp4;

        const tabsContainer = document.getElementById("tenhou-mode-tabs");
        if (tabsContainer) {
            tabsContainer.querySelectorAll(".tenhou-mode-tab").forEach(tab => {
                tab.classList.toggle("active", tab.getAttribute("data-mode") === currentMode);
            });
        }

        document.querySelectorAll("[id^='badge-']").forEach(badge => {
            const m = badge.id.replace("badge-", "");
            const mMeta = MODE_META[m];
            if (mMeta) badge.textContent = fmtTiles(mMeta.handSize);
        });

        const poolEl = document.getElementById("spec-pool");
        if (poolEl) {
            poolEl.setAttribute("data-i18n", meta.poolKey);
            const poolText = loc[meta.poolKey] || "";
            poolEl.innerHTML = poolText;
            poolEl.setAttribute("title", poolText);
        }

        const handEl = document.getElementById("spec-hand");
        if (handEl) {
            if (meta.handKey && loc[meta.handKey]) {
                handEl.setAttribute("data-i18n", meta.handKey);
                handEl.textContent = loc[meta.handKey];
            } else {
                handEl.removeAttribute("data-i18n");
                const zimoWord = loc.SC_FAN_NAME_16 || "自摸";
                handEl.textContent = `${fmtTiles(meta.handSize)} (${zimoWord})`;
            }
        }

                const probData = getSelectedProbData(currentMode);

        const probEl = document.getElementById("spec-prob");
        if (probEl) {
            probEl.innerHTML = `${loc.sim_approx || "约"} ${probData.probHtml}`;
            probEl.title = `${probData.probStr} (${probData.totalWays.toLocaleString()} / ${probData.totalSpace.toLocaleString()})`;
        }

        const footLeft = document.getElementById("rack-foot-left");
        if (footLeft) {
            const dealAreaWord = loc.sim_rack_deal_area || "配牌区";
            footLeft.textContent = `${dealAreaWord} (${fmtTiles(meta.handSize - 1)})`;
        }

        const footRight = document.getElementById("rack-foot-right");
        if (footRight) {
            const tsumoWord = loc.sim_rack_tsumo || "自摸和牌张";
            footRight.textContent = `${tsumoWord} (${fmtLoc("sim_nth_tile", "第{n}张", { n: meta.handSize })})`;
        }

        refreshStatsDisplay();
    }

    // Reuses getCardImage from mahjong-document.js and cardName from mahjong.js
    function renderSingleTile(tid, customTitle) {
        const tileObj = (typeof tid === "object") ? tid : { id: tid };
        const name = customTitle || (typeof cardName === "function" ? cardName(tileObj) : `${tid}`);
        const helperHtml = typeof getCardHelperDiv === "function" ? getCardHelperDiv(tileObj) : "";
        const imgHtml = typeof getCardImage === "function" ? getCardImage(tileObj) : "";
        return `<div class="card-div" title="${name}">${helperHtml}${imgHtml}</div>`;
    }
    function renderInitialTiles() {
        const container = document.getElementById("tenhou-tiles-display");
        if (!container) return;

        const meta = MODE_META[currentMode] || MODE_META.jp4;
        const handFront = meta.handSize - 1;
        const backHtml = typeof outputCardImageBack === "function" ? outputCardImageBack() : `<div class="card-div"><img src="./cards/fb.png" class="card-tile-mask"><img src="./cards/b.png"></div>`;

        let html = "";
        const normalCount = meta.hasWildcard ? handFront - 1 : handFront;
        if (meta.hasWildcard) {
            const jc = typeof JokerC !== "undefined" ? JokerC : 42;
            html += renderSingleTile(jc);
        }
        for (let i = 0; i < normalCount; i++) {
            html += backHtml;
        }
        html += `<div class="tsumo-gap"></div>` + backHtml;

        container.innerHTML = html;
        renderFlowersDisplay([]);
    }

    // Render bonus (flower) tiles using capsule container and standard .card-div tiles
    function renderFlowersDisplay(flowersArr) {
        const el = document.getElementById("tenhou-flowers-display");
        if (!el) return;

        const meta = MODE_META[currentMode];
        if (!meta || !meta.hasFlowers) {
            el.style.display = "none";
            el.innerHTML = "";
            return;
        }

        if (!flowersArr || flowersArr.length === 0) {
            const zeroTitle = loc.sim_flower_none || "No Flowers Drawn";
            el.innerHTML = `
                <span class="flower-badge-pill flower-zero" title="${zeroTitle}">
                    <span class="flower-symbol">❀</span>
                    <span class="flower-count">× 0</span>
                </span>
            `;
            el.style.display = "inline-flex";
            return;
        }

        const count = flowersArr.length;
        const flowerNames = flowersArr.map(f => {
            const name = loc[`card_flower_${f}`] || `${f}`;
            const cName = typeof cardName === "function" ? cardName(f) : "";
            return cName ? `${name}(${cName})` : name;
        }).join(" ");

        const titleText = (loc.sim_flower_replacement_hint || "开牌补花") + `: ${flowerNames}`;

        let tilesHtml = "";
        for (let i = 0; i < flowersArr.length; i++) {
            const fid = flowersArr[i];
            const name = typeof cardName === "function" ? cardName(fid) : `${fid}`;
            const fName = loc[`card_flower_${fid}`] || "";
            tilesHtml += renderSingleTile(fid, fName ? `${fName} (${name})` : name);
        }

        el.innerHTML = `
            <span class="flower-badge-pill" title="${titleText}">
                <span class="flower-symbol">❀</span>
                <span class="flower-count">× ${count}</span>
            </span>
            <div class="flower-tiles-list">${tilesHtml}</div>
        `;
        el.style.display = "inline-flex";
    }

    function renderHandTiles(handArr, flowersArr) {
        const container = document.getElementById("tenhou-tiles-display");
        if (!container || !handArr || handArr.length < 14) return;

        const meta = MODE_META[currentMode] || MODE_META.jp4;
        const { leadTile, sortedFront, tsumo } = splitAndSortHand(handArr, meta.hasWildcard);

        let html = "";
        if (leadTile !== null) {
            html += renderSingleTile(leadTile);
        }
        for (let i = 0; i < sortedFront.length; i++) {
            html += renderSingleTile(sortedFront[i]);
        }
        html += `<div class="tsumo-gap"></div>` + renderSingleTile(tsumo);

        container.innerHTML = html;
        renderFlowersDisplay(flowersArr || []);
    }

    function updateStatsUI() {
        if (!isRunning) return;

        lastElapsedSec = (performance.now() - startTime) / 1000;
        if (lastElapsedSec > 0.05) {
            lastSpeed = Math.round(totalAttempts / lastElapsedSec);
        }

        refreshStatsDisplay();

        animFrameId = requestAnimationFrame(updateStatsUI);
    }

    function startSimulation() {
        if (isRunning) return;

        isRunning = true;
        totalAttempts = 0;
        lastElapsedSec = 0;
        lastSpeed = 0;
        startTime = performance.now();
        lastResultHand = null;
        lastResultYaku = null;

        const startBtn = document.getElementById("tenhou-btn-start");
        const stopBtn = document.getElementById("tenhou-btn-stop");
        if (startBtn) startBtn.style.display = "none";
        if (stopBtn) stopBtn.style.display = "inline-flex";

        const liveDot = document.getElementById("tenhou-live-dot");
        if (liveDot) liveDot.classList.add("active-live");

        const banner = document.getElementById("tenhou-success-banner");
        if (banner) banner.style.display = "none";

        const handWrapper = document.getElementById("tenhou-hand-wrapper");
        if (handWrapper) handWrapper.classList.remove("active-win");

        const statusHint = document.getElementById("tenhou-status-hint");
        if (statusHint) {
            const runBadge = loc.sim_hint_simulating || "Running";
            const samplingWord = loc.sim_hint_sampling || "Sampling...";
            statusHint.innerHTML = `<span class="mat-status-badge">${runBadge}</span><span class="mat-status-text">${samplingWord}</span>`;
        }

        setOptionsDisabled(true);
        renderInitialTiles();

        try {
            if (worker) worker.terminate();
            worker = new Worker("tenhou-worker.js?v=202611090105");
            worker.onmessage = function (e) {
                const data = e.data;
                if (data.type === "progress") {
                    totalAttempts += data.count;
                } else if (data.type === "success") {
                    totalAttempts += data.count;
                    handleSuccess(data.hand, data.flowers || [], data.yakuType, data.mode);
                }
            };
            worker.onerror = function (err) {
                console.error("Tenhou worker error:", err);
            };

            let seed = (Date.now() ^ (Math.random() * 0x100000000)) >>> 0;
            if (window.crypto && window.crypto.getRandomValues) {
                const arr = new Uint32Array(1);
                window.crypto.getRandomValues(arr);
                seed = (seed ^ arr[0]) >>> 0;
            }
            worker.postMessage({
                type: "start",
                mode: currentMode,
                allowedTypes: Array.from(selectedTypes[currentMode]),
                seed: seed,
                batchSize: 20000
            });
        } catch (err) {
            console.error("Failed to spawn Worker:", err);
            alert(loc.sim_worker_unsupported || "Web Workers not supported.");
            stopSimulation();
            return;
        }

        animFrameId = requestAnimationFrame(updateStatsUI);
    }

    function stopSimulation() {
        isRunning = false;
        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
        }

        if (worker) {
            try {
                worker.postMessage({ type: "stop" });
                worker.terminate();
            } catch (e) {}
            worker = null;
        }

        const startBtn = document.getElementById("tenhou-btn-start");
        const stopBtn = document.getElementById("tenhou-btn-stop");
        if (startBtn) startBtn.style.display = "inline-flex";
        if (stopBtn) stopBtn.style.display = "none";

        const liveDot = document.getElementById("tenhou-live-dot");
        if (liveDot) liveDot.classList.remove("active-live");

        setOptionsDisabled(false);
        if (!lastResultHand) refreshStatusUI();
    }

    // Deal 1 single random starting hand (reuses getMahjongWall and shuffle(wall, front))
    function dealOneHand() {
        if (isRunning) stopSimulation();

        const meta = MODE_META[currentMode] || MODE_META.jp4;
        const drawSize = meta.drawSize || meta.handSize;
        const wall = Array.from(getMahjongWall(meta.guse, meta.hasFlowers));

        // Full shuffle for accurate flower distribution
        shuffle(wall, wall.length);

        const hand = [];
        const flowers = [];
        const flowerStart = typeof sizeUT !== "undefined" ? sizeUT : 34;
        const flowerEnd = typeof sizeAT !== "undefined" ? sizeAT : 42;
        for (let i = 0; i < wall.length; i++) {
            const id = wall[i];
            if (id >= flowerStart && id < flowerEnd) {
                flowers.push(id);
            } else {
                hand.push(id);
                if (hand.length === drawSize) break;
            }
        }
        if (meta.hasWildcard) {
            hand.unshift(typeof JokerC !== "undefined" ? JokerC : 42);
        }

        totalAttempts++;
        lastResultHand = [...hand];
        lastResultFlowers = [...flowers];
        lastResultYaku = null;
        refreshStatsDisplay();

        const handWrapper = document.getElementById("tenhou-hand-wrapper");
        if (handWrapper) handWrapper.classList.remove("active-win");

        refreshStatusUI();

        const banner = document.getElementById("tenhou-success-banner");
        if (banner) banner.style.display = "none";

        renderHandTiles(hand, flowers);
    }

    function handleSuccess(handArr, flowersArr, yakuType, mode) {
        stopSimulation();
        lastResultHand = [...handArr];
        lastResultFlowers = [...(flowersArr || [])];
        lastResultYaku = yakuType;
        refreshStatsDisplay();

        const handWrapper = document.getElementById("tenhou-hand-wrapper");
        if (handWrapper) handWrapper.classList.add("active-win");

        refreshStatusUI();
        renderHandTiles(handArr, lastResultFlowers);

        // Automatically store the winning hand and matching rule tab so switching directly to the calculator analyzes it
        try {
            const handStr = formatHandString(lastResultHand, lastResultFlowers);
            const meta = MODE_META[mode] || MODE_META[currentMode] || MODE_META.jp4;
            sessionStorage.setItem("inputText", handStr);
            try { localStorage.removeItem("inputText"); } catch (e) {}
            if (meta.calcTab !== undefined) {
                localStorage.setItem("steptab", meta.calcTab);
            }
        } catch (e) {}

        const banner = document.getElementById("tenhou-success-banner");
        if (banner) banner.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function importToCalculator() {
        if (!lastResultHand || lastResultHand.length < 14) return;
        const handStr = formatHandString(lastResultHand, lastResultFlowers);
        const meta = MODE_META[currentMode] || MODE_META.jp4;

        try {
            sessionStorage.setItem("inputText", handStr);
            try { localStorage.removeItem("inputText"); } catch (e) {}
            if (meta.calcTab !== undefined) localStorage.setItem("steptab", meta.calcTab);
        } catch (e) {}

        const pageMap = { cn: "mahjong.html", tw: "mahjong-tw.html", hk: "mahjong-hk.html", ja: "mahjong-ja.html", en: "mahjong-en.html" };
        window.location.href = pageMap[currentLang] || "mahjong.html";
    }

    function copyResult() {
        if (!lastResultHand) return;
        const meta = MODE_META[currentMode] || MODE_META.jp4;
        const modeName = loc[meta.nameKey] || meta.nameKey;
        const yakuName = getYakuDisplayName(currentMode, lastResultYaku);
        const evalInfo = getEvaluation(totalAttempts, currentMode);
        const handStr = formatHandString(lastResultHand, lastResultFlowers);
        let flowerLine = "";
        if (lastResultFlowers && lastResultFlowers.length > 0) {
            const flowerNames = lastResultFlowers.map(f => loc[`card_flower_${f}`] || `${f}`).join(" ");
            const flLabel = loc.flowers || "Flowers";
            flowerLine = `\n${flLabel}: ${flowerNames} (❀×${lastResultFlowers.length})`;
        }
        const simTitle = stripHtml(loc.sim_title || "Blessing of Heaven Simulator");
        const cleanYakuName = stripHtml(yakuName);
        const cleanEvalTitle = stripHtml(evalInfo.title);

        const labels = {
            rule: loc.sim_copy_mode || "Mode",
            win: loc.win || "Win",
            att: loc.sim_copy_attempts || "Attempts",
            exp: loc.sim_copy_expected || "Expected"
        };

        const shareUrl = getShareUrl();
        const text = `【${simTitle}】\n${labels.rule}: ${modeName}\n${labels.win}: ${cleanYakuName}\n${labels.att}: ${totalAttempts.toLocaleString()} (${cleanEvalTitle})\n${labels.exp}: ${getSelectedProbData(currentMode).meanStr}${flowerLine}\nHand: ${handStr}\nURL: ${shareUrl}`;

        if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                alert(loc.sim_copy_ok || "Result copied to clipboard.");
            }).catch(() => { alert(text); });
        } else {
            alert(text);
        }
    }

    const DEMO_GENERATORS = {
        tw: {
            niconico: () => generateWinningNiconico(),
            orphan13: () => generateWinningOrphanMeld(),
            shiliubudaxing: () => generateWinningBuda(),
            normal: () => generateWinningHand(17)
        },
        shura: {
            pair7: () => [typeof JokerC !== "undefined" ? JokerC : 42, ...generateWinningPairs(true).slice(0, 13)],
            kokushi: () => [typeof JokerC !== "undefined" ? JokerC : 42, ...generateWinningOrphan().slice(0, 13)],
            normal: () => [typeof JokerC !== "undefined" ? JokerC : 42, ...generateWinningHand(13)]
        },
        gb: {
            pair7: () => generateWinningPairs(0),
            orphan13: () => generateWinningOrphan(),
            quanbukaoxing: () => generateWinningBukao(),
            zuhelongxing: () => generateWinningKDragon(14),
            normal: () => generateWinningHand(14)
        },
        sc: {
            pair7: () => generateWinningPairs(2, guseSC),
            normal: () => generateWinningSC()
        },
        jp3: {
            pair7: () => generateWinningPairs(true, guse3p),
            kokushi: () => generateWinningOrphan(),
            normal: () => {
                const seqs = default_seqs.filter(s => s >= 9);
                const tris = ArraySeq(0, sizeUT).filter(t => guse3p[t] !== Infinity);
                return generateWinningHand(14, seqs, tris);
            }
        },
        jp4: {
            kokushi: () => generateWinningOrphan(),
            pair7: () => generateWinningPairs(true),
            normal: () => generateWinningHand(14)
        }
    };

    function triggerDemoWin(forcedType) {
        const type = forcedType || (MODE_HAND_TYPES[currentMode] ? MODE_HAND_TYPES[currentMode][0] : "normal");
        const meta = MODE_META[currentMode] || MODE_META.jp4;
        const demoFlowers = meta.hasFlowers ? [34, 38] : [];

        let demoTiles = null;
        try {
            const genMap = DEMO_GENERATORS[currentMode] || DEMO_GENERATORS.jp4;
            const gen = genMap[type] || genMap.normal;
            if (typeof gen === "function") demoTiles = gen();
        } catch (e) {
            console.warn("Demo generator fallback:", e);
        }
        if (!demoTiles || !demoTiles.length) {
            demoTiles = [0, 1, 2, 9, 10, 11, 18, 19, 20, 27, 27, 27, 33, 33];
        }

        totalAttempts = 32890;
        lastElapsedSec = 0.1;
        lastSpeed = 1644500;
        handleSuccess(demoTiles, demoFlowers, type, currentMode);
    }

    // Public API
    window.tenhouSim = {
        start: startSimulation,
        stop: stopSimulation,
        dealOneHand: dealOneHand,
        demoWin: triggerDemoWin,
        importToCalculator: importToCalculator,
        copyResult: copyResult,
        getShareUrl: getShareUrl,
        setLanguage: applyLanguage,
        switchMode: switchMode
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initDOM);
    } else {
        initDOM();
    }
})();


