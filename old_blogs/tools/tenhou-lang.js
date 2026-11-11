// Tenhou Simulator Localization Extension
// Strictly aligned with AGENTS.md / GEMINI.md i18n standards
const tenhou_loc_all = {
    // --- Page Header & Hero ---
    sim_page_title: { cn: "{sim_title} - 麻将多功能计算器", tw: "{sim_title} - 麻將多功能計算機", hk: "{sim_title} - 麻雀多功能計算機", ja: "{sim_title} - 麻雀牌理・点数計算ツール", en: "{sim_title} - Mahjong Theory & Score Calculator" },
    sim_title: { cn: "{GB_FANNAME_86}模拟器", tw: "{GB_FANNAME_86}模擬器", hk: "{GB_FANNAME_86}模擬器", ja: "{GB_FANNAME_86}シミュレーター", en: "{GB_FANNAME_86} Simulator" },
    sim_badge: { cn: "蒙特卡洛模拟 · 牌山真实随机抽样", tw: "蒙特卡洛模擬 · 牌山真實隨機抽樣", hk: "蒙特卡洛模擬 · 牌山真實隨機抽樣", ja: "モンテカルロ法 · 純粋ランダム配牌シミュレーター", en: "Monte Carlo Simulation · True Random Wall Sampling" },
    sim_desc: {
        cn: "庄家起手配牌第一巡即自摸和了称为<strong>{GB_FANNAME_86}</strong>。<br />本页面基于牌山无放回随机抽样与本站标准麻将判定逻辑进行模拟测算，拒绝预设假数据。",
        tw: "莊家起手配牌第一巡即自摸胡牌稱為<strong>{GB_FANNAME_86}</strong>。<br />本頁面基於牌山無放回隨機抽樣與本站標準麻將判定邏輯進行模擬測算，拒絕預設假數據。",
        hk: "莊家起手配牌第一巡即自摸食糊稱為<strong>{GB_FANNAME_86}</strong>。<br />本頁面基於牌山無放回隨機抽樣與本站標準麻雀判定邏輯進行模擬測算，拒絕預設假數據。",
        ja: "親の配牌時点で既に和了形が完成している役満を<strong>{GB_FANNAME_86}（テンホー）</strong>と呼びます。<br />本ツールは牌山の非復元抽出と標準判定ロジックによるモンテカルロ・シミュレーションです。",
        en: "A complete winning hand dealt to the dealer on the initial deal is called <strong><span class='fan'>{GB_FANNAME_86}</span></strong>.<br />Simulated via true random wall sampling and standard mahjong evaluation logic."
    },
    sim_back: { cn: "返回主计算器", tw: "返回主計算機", hk: "返回主計算機", ja: "計算ツールに戻る", en: "Back to Calculator" },

    // --- Simulator Mode Tabs (Exclusive to Simulator) ---
    mode_jp4_name: { cn: "立直麻将 (四人)", tw: "立直麻將 (四人)", hk: "立直麻雀 (四人)", ja: "立直麻雀 (四人)", en: "JP Riichi (4-Player)" },
    mode_jp3_name: { cn: "立直麻将 (三人)", tw: "立直麻將 (三人)", hk: "立直麻雀 (三人)", ja: "立直麻雀 (三人)", en: "JP Riichi (3-Player)" },
    mode_shura_name: { cn: "万象修罗", tw: "萬象修羅", hk: "萬象修羅", ja: "万象修羅", en: "Limitless Asura" },

    // --- Specs & Counters ---
    sim_card_pool: { cn: "牌山规模:", tw: "牌山規模:", hk: "牌山規模:", ja: "牌山規模:", en: "Wall Size:" },
    sim_starting_hand: { cn: "起手配牌:", tw: "起手配牌:", hk: "起手配牌:", ja: "配牌枚数:", en: "Initial Hand:" },
    sim_theo_prob: { cn: "理论概率:", tw: "理論機率:", hk: "理論幾率:", ja: "理論確率:", en: "Theoretical Prob:" },
    sim_counter_header: { cn: "尝试配牌总次数", tw: "嘗試配牌總次數", hk: "嘗試配牌總次數", ja: "試行配牌回数", en: "Total Hands Dealt" },
    sim_speed: { cn: "模拟速度", tw: "模擬速度", hk: "模擬速度", ja: "シミュレーション速度", en: "Speed" },
    sim_elapsed: { cn: "运行时间", tw: "運行時間", hk: "運行時間", ja: "経過時間", en: "Elapsed" },
    sim_cdf: { cn: "理论达成率 (CDF)", tw: "理論達成率 (CDF)", hk: "理論達成率 (CDF)", ja: "理論達成率 (CDF)", en: "Cumulative Prob (CDF)" },
    sim_expectation: { cn: "理论期望均值", tw: "理論期望均值", hk: "理論期望均值", ja: "理論期待値", en: "Expected Mean" },

    // --- Mahjong Felt Mat Rack ---
    sim_rack_deal_area: { cn: "配牌区", tw: "配牌區", hk: "配牌區", ja: "配牌エリア", en: "Hand Tiles" },
    sim_rack_tsumo: { cn: "自摸{win}{unit}", tw: "自摸{win}{unit}", hk: "自摸{win}{unit}", ja: "{win}牌（ツモ）", en: "Winning Tile (Tsumo)" },
    sim_nth_tile: { cn: "第{n}{unit}", tw: "第{n}{unit}", hk: "第{n}{unit}", ja: "{n}{unit}目", en: "tile #{n}" },

    // --- Actions & Controls ---
    sim_btn_start: { cn: "开始模拟", tw: "開始模擬", hk: "開始模擬", ja: "開始", en: "Start Simulation" },
    sim_btn_stop: { cn: "停止模拟", tw: "停止模擬", hk: "停止模擬", ja: "停止", en: "Stop" },
    sim_btn_deal_one: { cn: "随机摸一手", tw: "隨機摸一手", hk: "隨機開一手", ja: "ランダム配牌", en: "Deal 1 Hand" },
    sim_title_deal_one: { cn: "从牌山真实无放回抽取单手配牌并展示", tw: "從牌山真實無放回抽取單手配牌並展示", hk: "從牌山真實無放回抽取單手配牌並展示", ja: "牌山から実際に非復元抽出で配牌を取る", en: "Deal a single random hand from wall" },
    sim_restart: { cn: "重新开始", tw: "重新開始", hk: "重新開始", ja: "再挑戦", en: "Restart" },
    sim_import_to_calc: { cn: "填入主计算器分析", tw: "填入主計算機分析", hk: "填入主計算機分析", ja: "計算ツールで点数・役を分析", en: "Analyze in Main Calculator" },
    sim_copy_result: { cn: "复制结果", tw: "複製結果", hk: "複製結果", ja: "結果をコピー", en: "Copy Result" },
    sim_copy_ok: { cn: "已复制模拟结果到剪贴板。", tw: "已複製模擬結果到剪貼簿。", hk: "已複製模擬結果到剪貼簿。", ja: "結果をクリップボードにコピーしました。", en: "Result copied to clipboard." },
    sim_worker_unsupported: { cn: "当前浏览器环境不支持 Web Worker。", tw: "當前瀏覽器環境不支援 Web Worker。", hk: "當前瀏覽器環境不支援 Web Worker。", ja: "現在のブラウザ環境は Web Worker に対応していません。", en: "Web Workers not supported in current environment." },
    sim_copy_mode: { cn: "模式", tw: "規則", hk: "規則", ja: "ルール", en: "Mode" },
    sim_copy_attempts: { cn: "尝试次数", tw: "嘗試次數", hk: "嘗試次數", ja: "試行回数", en: "Attempts" },
    sim_copy_expected: { cn: "理论期望均值", tw: "理論期望均值", hk: "理論期望均值", ja: "理論期待値", en: "Expected" },
    sim_copy_flowers: "$flowers",
    sim_tiles_unit: "$unit",

    // --- Simulator Units & Time (Exclusive to Simulator) ---
    sim_unit_year: { cn: " 年", tw: " 年", hk: " 年", ja: " 年", en: " years" },
    sim_unit_day: { cn: " 天", tw: " 天", hk: " 天", ja: " 日", en: " days" },
    sim_unit_hour: { cn: " 小时", tw: " 小時", hk: " 小時", ja: " 時間", en: " hrs" },
    sim_unit_minute: { cn: " 分钟", tw: " 分鐘", hk: " 分鐘", ja: " 分", en: " mins" },
    sim_unit_second: { cn: "秒", tw: "秒", hk: "秒", ja: "秒", en: "s" },
    sim_unit_ci: { cn: "次", tw: "次", hk: "次", ja: "回", en: "hands" },
    sim_unit_hands_per_sec: { cn: "手/秒", tw: "手/秒", hk: "手/秒", ja: "回/秒", en: "hands/s" },
    sim_unit_banzhuang: { cn: "半庄", tw: "半莊", hk: "半莊", ja: "半荘", en: "Hanchan" },
    sim_unit_pan: { cn: "盘", tw: "盤", hk: "盤", ja: "局", en: "Rounds" },
    sim_unit_ju: { cn: "局", tw: "局", hk: "局", ja: "局", en: "Hands" },
    sim_unit_zhuang: { cn: "庄", tw: "將", hk: "雀", ja: "荘", en: "Games" },
    sim_playtime_label: { cn: "连续对局耗时估算", tw: "連續對局耗時估算", hk: "連續對局耗時估算", ja: "連続対局時間の概算", en: "Equivalent Playtime" },
    sim_match_label_prefix: { cn: "折算实战", tw: "折算實戰", hk: "折算實戰", ja: "実戦換算", en: "Equivalent" },
    sim_match_label_suffix: { cn: "数", tw: "數", hk: "數", ja: "数", en: "Count" },
    sim_approx: { cn: "约", tw: "約", hk: "約", ja: "約", en: "approx." },
    sim_exclaim: { cn: "！", tw: "！", hk: "！", ja: "！", en: "! " },
    sim_eval_ratio: { cn: "期望均值的 {r} 倍", tw: "期望均值的 {r} 倍", hk: "期望均值的 {r} 倍", ja: "期待値の {r} 倍", en: "{r}× expected mean" },

    // --- State Hints & Badges ---
    sim_hint_ready_badge: { cn: "待机", tw: "待機", hk: "待機", ja: "待機", en: "Ready" },
    sim_hint_init: { cn: "等待开始", tw: "等待開始", hk: "等待開始", ja: "待機中", en: "Ready to start" },
    sim_hint_simulating: { cn: "模拟中", tw: "模擬中", hk: "模擬中", ja: "計算中", en: "Running" },
    sim_hint_sampling: { cn: "抽样中...", tw: "抽樣中...", hk: "抽樣中...", ja: "抽出中...", en: "Sampling..." },
    sim_hint_paused: { cn: "已暂停", tw: "已暫停", hk: "已暫停", ja: "一時停止", en: "Paused" },
    sim_hint_resume: { cn: "等待继续", tw: "等待繼續", hk: "等待繼續", ja: "再開待機", en: "Waiting" },
    sim_hint_dealt: { cn: "单次配牌", tw: "單次配牌", hk: "單次配牌", ja: "配牌", en: "Hand Dealt" },
    sim_hint_no_win: { cn: "未成{GB_FANNAME_86}", tw: "未成{GB_FANNAME_86}", hk: "未成{GB_FANNAME_86}", ja: "{GB_FANNAME_86}ならず", en: "No <span class='fan'>{GB_FANNAME_86}</span>" },
    sim_hint_no_win_gb: { cn: "未{win}", tw: "未{win}", hk: "未{win}", ja: "{win}ならず", en: "No Win" },
    sim_hint_win_badge: { cn: "{GB_FANNAME_86}达成", tw: "{GB_FANNAME_86}達成", hk: "{GB_FANNAME_86}達成", ja: "{GB_FANNAME_86}達成", en: "<span class='fan'>{GB_FANNAME_86}</span>" },
    sim_hint_win_badge_gb: { cn: "{win}达成", tw: "{win}達成", hk: "{win}達成", ja: "{win}達成", en: "WIN" },
    sim_opt_types_label: { cn: "{win}型：", tw: "{win}型：", hk: "{win}型：", ja: "{win}形：", en: "Winning Types:" },

    // --- Flowers & Pools ---
    sim_flower_replacement_hint: { cn: "开牌补花", tw: "開牌補花", hk: "開牌補花", ja: "配牌補花", en: "Flower Replacement" },
    sim_flower_none: { cn: "开牌无补花", tw: "開牌無補花", hk: "開牌無補花", ja: "配牌補花なし", en: "No Flowers Drawn" },
    sim_pool_jp4: { cn: "136 {unit} (标准牌山)", tw: "136 {unit} (標準牌山)", hk: "136 {unit} (標準牌山)", ja: "136 {unit} (標準牌山)", en: "136 {unit} (Standard Wall)" },
    sim_pool_jp3: { cn: "108 {unit} (无2~8万)", tw: "108 {unit} (無2~8萬)", hk: "108 {unit} (無2~8萬)", ja: "108 {unit} (二〜八萬除外)", en: "108 {unit} (No 2-8 Characters)" },
    sim_pool_shura: { cn: "136 {unit} + 1 {joker}", tw: "136 {unit} + 1 {joker}", hk: "136 {unit} + 1 {joker}", ja: "136 {unit} + {joker} 1 {unit}", en: "136 {unit} + 1 {joker}" },
    sim_hand_shura: { cn: "14 {unit} (含{joker})", tw: "14 {unit} (含{joker})", hk: "14 {unit} (含{joker})", ja: "14 {unit} ({joker}含)", en: "14 {unit} (incl. {joker})" },
    sim_pool_gb: { cn: "144 {unit} (标准牌山)", tw: "144 {unit} (標準牌山)", hk: "144 {unit} (標準牌山)", ja: "144 {unit} (標準牌山)", en: "144 {unit} (Standard Wall)" },
    sim_pool_sc: { cn: "108 {unit} (纯序数牌)", tw: "108 {unit} (純序數牌)", hk: "108 {unit} (純序數牌)", ja: "108 {unit} (数牌のみ)", en: "108 {unit} (Suits Only)" },
    sim_pool_tw: { cn: "144 {unit} (标准牌山)", tw: "144 {unit} (標準牌山)", hk: "144 {unit} (標準牌山)", ja: "144 {unit} (標準牌山)", en: "144 {unit} (Standard Wall)" },

    // --- Mode Descriptions (Complex Paragraphs) ---
    sim_info_title: { cn: "支持规则与模拟说明", tw: "支援規則與模擬說明", hk: "支援規則與模擬說明", ja: "対応ルールと解説", en: "Supported Rules & Simulation Logic" },
    sim_desc_jp4: {
        cn: "标准 136 {unit}序数与字牌牌山，起手 14 {unit}自摸{GB_FANNAME_86}。支持{normal}、{pair7}以及{kokushi}。全选时理论概率约为 <strong>1 / 330,530</strong>（仅{normal}约为 <strong>1 / 374,373</strong>，勾选{win}型将即时动态重算）。",
        tw: "標準 136 {unit}序數與字牌牌山，起手 14 {unit}自摸{GB_FANNAME_86}。支援{normal}、{pair7}以及{kokushi}。全選時理論機率約為 <strong>1 / 330,530</strong>（僅{normal}約為 <strong>1 / 374,373</strong>，勾選{win}型將即時動態重算）。",
        hk: "標準 136 {unit}序數與字牌牌山，起手 14 {unit}自摸{GB_FANNAME_86}。支援{normal}、{pair7}以及{kokushi}。全選時理論幾率約為 <strong>1 / 330,530</strong>（僅{normal}約為 <strong>1 / 374,373</strong>，勾選{win}型將即時動態重算）。",
        ja: "標準136{unit}の萬筒索字牌の牌山。親の配牌14{unit}による{GB_FANNAME_86}。{normal}、{pair7}、{kokushi}に対応。全選択時の理論確率は約 <strong>1 / 330,530</strong>（{normal}のみは約 <strong>1 / 374,373</strong>、{win}形選択に応じて動的再計算）。",
        en: "Standard 136 {unit} wall with suits and honors. Dealer's 14 {unit} initial deal winning <span class='fan'>{GB_FANNAME_86}</span>. Supports {normal}, {pair7}, and {kokushi}. Probability with all types: approx. <strong>1 / 330,530</strong> (only {normal} approx. <strong>1 / 374,373</strong>; dynamically updated on selection)."
    },
    sim_desc_jp3: {
        cn: "拔除 2~8 万，共 108 {unit}牌山，起手 14 {unit}自摸{GB_FANNAME_86}。字牌与清一色密度上升，支持{normal}、{pair7}与{kokushi}。全选时理论概率约为 <strong>1 / 105,711</strong>（仅{normal}约为 <strong>1 / 130,308</strong>）。",
        tw: "拔除 2~8 萬，共 108 {unit}牌山，起手 14 {unit}自摸{GB_FANNAME_86}。字牌與清一色密度上升，支援{normal}、{pair7}與{kokushi}。全選時理論機率約為 <strong>1 / 105,711</strong>（僅{normal}約為 <strong>1 / 130,308</strong>）。",
        hk: "拔除 2~8 萬，共 108 {unit}牌山，起手 14 {unit}自摸{GB_FANNAME_86}。字牌與清一色密度上升，支援{normal}、{pair7}與{kokushi}。全選時理論幾率約為 <strong>1 / 105,711</strong>（僅{normal}約為 <strong>1 / 130,308</strong>）。",
        ja: "二〜八萬を除外した108{unit}の牌山。字牌と染め手密度が上昇し、{normal}、{pair7}、{kokushi}に対応。全選択時の理論確率は約 <strong>1 / 105,711</strong>（{normal}のみは約 <strong>1 / 130,308</strong>）。",
        en: "2-8 of Characters removed, 108 {unit} total. Hand size 14, winning <span class='fan'>{GB_FANNAME_86}</span>. Supports {normal}, {pair7}, and {kokushi}. Probability with all types: approx. <strong>1 / 105,711</strong> (only {normal} approx. <strong>1 / 130,308</strong>)."
    },
    sim_desc_shura: {
        cn: "雀魂特色模式。庄家起手 13 {unit}常规配牌并固定自带 1 {unit}{joker}（共 14 {unit}）。由于{joker}可充当任意牌，起手{win}充要等价于「13 {unit}配牌已处于{ready}」。支持{normal}、{pair7}与{kokushi}。全选时理论概率约为 <strong>1 / 12,319</strong>（仅{normal}约为 <strong>1 / 15,003</strong>）。",
        tw: "雀魂特色模式。莊家起手 13 {unit}常規配牌並固定自帶 1 {unit}{joker}（共 14 {unit}）。由於{joker}可充當任意牌，起手{win}充要等價於「13 {unit}配牌已處於{ready}」。支援{normal}、{pair7}與{kokushi}。全選時理論機率約為 <strong>1 / 12,319</strong>（僅{normal}約為 <strong>1 / 15,003</strong>）。",
        hk: "雀魂特色模式。莊家起手 13 {unit}常規配牌並固定自帶 1 {unit}{joker}（共 14 {unit}）。由於{joker}可充當任意牌，起手{win}充要等價於「13 {unit}配牌已處於{ready}」。支援{normal}、{pair7}與{kokushi}。全選時理論幾率約為 <strong>1 / 12,319</strong>（僅{normal}約為 <strong>1 / 15,003</strong>）。",
        ja: "雀魂の特殊モード。親の配牌13{unit}に加え、{joker}を1{unit}所持（計14{unit}）。{joker}が任意の牌になるため、配牌{win}は「配牌13{unit}が既に{ready}」と数学的に等価。{normal}、{pair7}、{kokushi}に対応。全選択時の理論確率は約 <strong>1 / 12,319</strong>（{normal}のみは約 <strong>1 / 15,003</strong>）。",
        en: "Mahjong Soul feature mode. 13 standard dealt {unit} plus 1 permanent {joker} (14 {unit} total). Initial {win} is mathematically equivalent to the 13 dealt {unit} being in {ready}. Supports {normal}, {pair7}, and {kokushi}. Probability with all types: approx. <strong>1 / 12,319</strong> (only {normal} approx. <strong>1 / 15,003</strong>)."
    },
    sim_desc_gb: {
        cn: "国标麻将标准 144 {unit}牌山，起手 14 {unit}自摸。遇花自动补花，集齐 14 {unit}正牌后判定。支持五大{win}型：{normal}、{pair7}（允许4{unit}相同牌作两对）、{orphan13}、{quanbukaoxing}与{zuhelongxing}。全选时理论概率约为 <strong>1 / 320,590</strong>（仅{normal}约为 <strong>1 / 374,373</strong>）。",
        tw: "國標麻將標準 144 {unit}牌山，起手 14 {unit}自摸。遇花自動補花，集齊 14 {unit}正牌後判定。支援五大{win}型：{normal}、{pair7}（允許4{unit}相同牌作兩對）、{orphan13}、{quanbukaoxing}與{zuhelongxing}。全選時理論機率約為 <strong>1 / 320,590</strong>（僅{normal}約為 <strong>1 / 374,373</strong>）。",
        hk: "國標麻雀標準 144 {unit}牌山，起手 14 {unit}自摸。遇花自動補花，集齊 14 {unit}正牌後判定。支援五大{win}型：{normal}、{pair7}（允許4{unit}相同牌作兩對）、{orphan13}、{quanbukaoxing}與{zuhelongxing}。全選時理論幾率約為 <strong>1 / 320,590</strong>（僅{normal}約為 <strong>1 / 374,373</strong>）。",
        ja: "中国国標麻雀標準の144{unit}牌山。親配牌14{unit}。花牌時は自動的に補花を行い、正牌14{unit}揃った時点で判定。五大{win}形：{normal}、{pair7}（4{unit}使い可）、{orphan13}、{quanbukaoxing}、{zuhelongxing}に対応。全選択時の理論確率は約 <strong>1 / 320,590</strong>（{normal}のみは約 <strong>1 / 374,373</strong>）。",
        en: "Chinese Official Mahjong standard 144 {unit} wall, hand size 14. Automatically draws replacement tiles for flowers. Supports all 5 winning types: {normal}, {pair7}, {orphan13}, {quanbukaoxing}, and {zuhelongxing}. Probability with all types: approx. <strong>1 / 320,590</strong> (only {normal} approx. <strong>1 / 374,373</strong>)."
    },
    sim_desc_sc: {
        cn: "包含万、筒、条共 108 {unit}序数牌，起手 14 {unit}。先{GB_FANNAME_86}后定缺（起手自然缺一门）。支持{normal}与{pair7}。全选时理论概率约为 <strong>1 / 118,627</strong>（仅{normal}约为 <strong>1 / 121,316</strong>）。",
        tw: "包含萬、餅、條共 108 {unit}序數牌，起手 14 {unit}。先{GB_FANNAME_86}後定缺（起手自然缺一門）。支援{normal}與{pair7}。全選時理論機率約為 <strong>1 / 118,627</strong>（僅{normal}約為 <strong>1 / 121,316</strong>）。",
        hk: "包含萬、筒、索共 108 {unit}序數牌，起手 14 {unit}。先{GB_FANNAME_86}後定缺（起手自然缺一門）。支援{normal}與{pair7}。全選時理論幾率約為 <strong>1 / 118,627</strong>（僅{normal}約為 <strong>1 / 121,316</strong>）。",
        ja: "萬・筒・索の数牌108{unit}、親配牌14{unit}。配牌時に1色以上が欠如している自然定缺が必要。{normal}・{pair7}に対応。全選択時の理論確率は約 <strong>1 / 118,627</strong>（{normal}のみは約 <strong>1 / 121,316</strong>）。",
        en: "Suited tiles only (108 {unit}), hand size 14, winning <span class='fan'>{GB_FANNAME_86}</span>. Naturally voids at least 1 suit on deal. Supports {normal} and {pair7}. Probability with all types: approx. <strong>1 / 118,627</strong> (only {normal} approx. <strong>1 / 121,316</strong>)."
    },
    sim_desc_tw: {
        cn: "标准 144 {unit}牌山，庄家起手 17 {unit}（16{unit}配牌 + 1{unit}摸牌）。遇花自动补花，集齐 17 {unit}正牌后判定。支持{normal}、{niconico}、{orphan13}与{shiliubudaxing}。{normal}理论概率约为 <strong>1 / 1,187,130</strong>（全选特殊型时约为 <strong>1 / 1,009,113</strong>）。",
        tw: "標準 144 {unit}牌山，莊家起手 17 {unit}（16{unit}配牌 + 1{unit}摸牌）。遇花自動補花，集齊 17 {unit}正牌後判定。支援{normal}、{niconico}、{orphan13}與{shiliubudaxing}。{normal}理論機率約為 <strong>1 / 1,187,130</strong>（全選特殊型時約為 <strong>1 / 1,009,113</strong>）。",
        hk: "標準 144 {unit}牌山，莊家起手 17 {unit}（16{unit}配牌 + 1{unit}摸牌）。遇花自動補花，集齊 17 {unit}正牌後判定。支援{normal}、{niconico}、{orphan13}與{shiliubudaxing}。{normal}理論幾率約為 <strong>1 / 1,187,130</strong>（全選特殊型時約為 <strong>1 / 1,009,113</strong>）。",
        ja: "標準144{unit}牌山。親の配牌17{unit}（16{unit}配牌 + 1{unit}自摸）。花牌時は自動的に補花を行い、正牌17{unit}揃った時点で判定。{normal}、{niconico}、{orphan13}、{shiliubudaxing}に対応。{normal}の理論確率は約 <strong>1 / 1,187,130</strong>（特殊形全選択時は約 <strong>1 / 1,009,113</strong>）。",
        en: "Standard 144 {unit} wall. Dealer's 17 {unit} initial deal (16 dealt + 1 drawn), winning <span class='fan'>{GB_FANNAME_86}</span>. Automatically draws replacement tiles for flowers. Supports {normal}, {niconico}, {orphan13}, and {shiliubudaxing}. Probability with normal type: approx. <strong>1 / 1,187,130</strong> (all special types approx. <strong>1 / 1,009,113</strong>)."
    },
    sim_link_title: { cn: "Web Worker 与主计算器联动", tw: "Web Worker 與主計算機聯動", hk: "Web Worker 與主計算機聯動", ja: "Web Worker と計算ツール連携", en: "Web Worker & Main Calculator Link" },
    sim_desc_link: {
        cn: "利用浏览器 Web Worker 与 Xoshiro128** 无偏抽样算法。达成{GB_FANNAME_86}后可一键将该手牌填入主页面计算器，定位至对应规则标签页展开详尽番数与{ready}分析。",
        tw: "利用瀏覽器 Web Worker 與 Xoshiro128** 無偏抽樣算法。達成{GB_FANNAME_86}後可一鍵將該手牌填入主頁面計算機，定位至對應規則標籤頁展開詳盡台數與{ready}分析。",
        hk: "利用瀏覽器 Web Worker 與 Xoshiro128** 無偏抽樣算法。食{GB_FANNAME_86}後可一鍵將該手牌填入主計算機，定位至對應規則標籤頁展開詳盡番數與{ready}分析。",
        ja: "Web WorkerとXoshiro128**アルゴリズム。{GB_FANNAME_86}達成時はワンクリックで計算ツールへ送り、翻数・点数・{ready}を分析可能。",
        en: "Utilizes Web Worker and Xoshiro128** RNG. Hands winning <span class='fan'>{GB_FANNAME_86}</span> can be loaded into the main calculator with one click for point and shanten analysis."
    },

    // --- Footer & Evaluations ---
    sim_footer_line1: {
        cn: "© 2026 Sheauhaw Jang · {sim_title}",
        tw: "© 2026 Sheauhaw Jang · {sim_title}",
        hk: "© 2026 Sheauhaw Jang · {sim_title}",
        ja: "© 2026 Sheauhaw Jang · {sim_title}",
        en: "© 2026 Sheauhaw Jang · {sim_title}"
    },
    sim_footer_line2: {
        cn: "功能建议/Bug反馈/交流QQ群 1021644248",
        tw: "聯絡作者：<a href=\"https://x.com/akiko36000\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color: inherit;\">三倍滿自動姬</a>",
        hk: "聯絡作者：<a href=\"https://x.com/akiko36000\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color: inherit;\">三倍滿自動姬</a>",
        ja: "連絡先：<a href=\"https://x.com/akiko36000\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color: inherit;\">三倍満自動姫</a>",
        en: "Contact: <a href=\"https://x.com/akiko36000\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color: inherit;\">Sanbaiman Automahime</a>"
    },

    eval_r1_title: { cn: "天眷之神", tw: "天眷之神", hk: "天眷之神", ja: "天に愛されし神", en: "God Loved by Heaven" },
    eval_r2_title: { cn: "超规格强运", tw: "超規格強運", hk: "超規格強運", ja: "規格外の運王", en: "Phenomenal Luck" },
    eval_r3_title: { cn: "踏入神域之人", tw: "踏入神域之人", hk: "踏入神域之人", ja: "神の領域に達せし者", en: "One Reaching the Realm of Gods" },
    eval_r4_title: { cn: "雀神宠儿", tw: "雀神寵兒", hk: "雀神寵兒", ja: "雀神の申し子", en: "Darling of the Mahjong God" },
    eval_r5_title: { cn: "天选强运", tw: "天選強運", hk: "天選強運", ja: "選ばれし強運", en: "Chosen Strong Luck" },
    eval_r6_title: { cn: "{GB_FANNAME_86}探求者", tw: "{GB_FANNAME_86}探求者", hk: "{GB_FANNAME_86}探求者", ja: "{GB_FANNAME_86}の探求者", en: "Seeker of <span class='fan'>{GB_FANNAME_86}</span>" },
    eval_r7_title: { cn: "不屈雀士", tw: "不屈雀士", hk: "不屈雀士", ja: "不屈の雀士", en: "Unyielding Mahjong Player" },
    eval_r8_title: { cn: "跨越苦行之求道者", tw: "跨越苦行之求道者", hk: "跨越苦行之求道者", ja: "苦行を越えし求道者", en: "Seeker Beyond Hardship" },
    eval_r9_title: { cn: "悟道之佛", tw: "悟道之佛", hk: "悟道之佛", ja: "悟りを開きし仏", en: "Enlightened Buddha" },
    eval_first_desc: { cn: "第 1 手直接达成，理论概率约为", tw: "第 1 手直接達成，理論機率約為", hk: "第 1 手直接達成，理論幾率約為", ja: "1回目で奇跡の達成！理論確率は約", en: "Direct hit on hand #1! Theoretical odds approx" },
};

// Auto-register to global loc_all if present
if (typeof loc_all !== "undefined") {
    Object.assign(loc_all, tenhou_loc_all);
    if (typeof loc !== "undefined" && typeof setLoc === "function" && typeof lang !== "undefined") {
        setLoc(lang);
    }
}

if (typeof window !== "undefined") {
    window.tenhou_loc_all = tenhou_loc_all;
}
if (typeof module !== "undefined" && module.exports) {
    module.exports = { tenhou_loc_all };
}
