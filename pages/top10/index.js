<!DOCTYPE html>

<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>T0PS Index Redesign — Vote4GOAT</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #050709; padding: 32px 16px; font-family: 'Barlow Condensed', sans-serif; display: flex; flex-direction: column; align-items: center; gap: 64px; color: #fff; }
.section-title { font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: #374151; text-align: center; margin-bottom: 16px; }
.mobile-frame { width: min(390px, 100vw - 32px); background: #0d0f18; border-radius: 40px; border: 6px solid #1a1f2e; overflow: hidden; box-shadow: 0 32px 80px rgba(0,0,0,0.6); }
.mobile-notch { width: 120px; height: 28px; background: #1a1f2e; border-radius: 0 0 20px 20px; margin: 0 auto; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px 0; }
.logo { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 2px; color: #fff; }
.logo em { color: #f5a623; font-style: normal; }
.nav-link { font-size: 11px; color: rgba(255,255,255,0.35); }
.nav-signup { font-size: 11px; font-weight: 700; color: #000; background: #f5a623; padding: 4px 10px; border-radius: 20px; margin-left: 10px; }
.hero { padding: 18px 20px 0; text-align: center; }
.hero-mode { font-size: 9px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(245,166,35,0.6); margin-bottom: 5px; }
.hero-title { font-family: 'Bebas Neue', sans-serif; font-size: 32px; letter-spacing: 3px; color: #fff; line-height: 1; margin-bottom: 5px; }
.hero-title em { color: #f5a623; font-style: normal; }
.hero-sub { font-size: 11px; color: rgba(255,255,255,0.3); line-height: 1.4; max-width: 240px; margin: 0 auto; }
.search-wrap { padding: 14px 16px 0; position: relative; }
.search-icon { position: absolute; left: 28px; top: 50%; transform: translateY(-50%); margin-top: 7px; font-size: 12px; color: rgba(255,255,255,0.2); pointer-events: none; }
.search-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); border-radius: 12px; padding: 9px 14px 9px 32px; font-size: 12px; color: #fff; font-family: 'Barlow Condensed', sans-serif; outline: none; }
.search-input::placeholder { color: rgba(255,255,255,0.2); }
.tabs { display: flex; gap: 6px; padding: 10px 16px 0; overflow-x: auto; }
.tabs::-webkit-scrollbar { display: none; }
.tab { flex-shrink: 0; padding: 5px 11px; border-radius: 20px; font-size: 11px; font-weight: 700; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.03); }
.tab.active { background: rgba(245,166,35,0.1); border-color: rgba(245,166,35,0.3); color: #f5a623; }
.tab-count { opacity: 0.5; margin-left: 3px; }
.section-label { font-size: 9px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.2); padding: 14px 16px 8px; }
.cat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 0 16px; }
.cat-card { border-radius: 14px; border: 1.5px solid transparent; height: 68px; display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-end; padding: 10px 12px; cursor: pointer; position: relative; overflow: hidden; transition: transform 0.15s; }
.cat-card:hover { transform: translateY(-2px); }
.cat-name { font-family: 'Bebas Neue', sans-serif; font-size: 17px; letter-spacing: 1.5px; color: #fff; line-height: 1; position: relative; z-index: 1; }
.cat-sub { font-size: 8px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-top: 2px; position: relative; z-index: 1; }
.cat-arrow { position: absolute; top: 10px; right: 10px; z-index: 1; font-size: 11px; color: rgba(255,255,255,0.2); }
.cat-accent { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; }

/* Club cards */
.card-rm   { background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); border-color: rgba(255,255,255,0.16); }
.card-barca { background: linear-gradient(135deg, rgba(0,77,152,0.32), rgba(165,0,68,0.22)); border-color: rgba(165,0,68,0.35); }
.card-bay  { background: linear-gradient(135deg, rgba(220,5,45,0.28), rgba(120,0,20,0.15)); border-color: rgba(220,5,45,0.3); }
.card-mufc { background: linear-gradient(135deg, rgba(218,41,28,0.28), rgba(0,0,0,0.2)); border-color: rgba(218,41,28,0.3); }
.card-lfc  { background: linear-gradient(135deg, rgba(200,16,46,0.28), rgba(0,0,0,0.2)); border-color: rgba(200,16,46,0.28); }
.card-mil  { background: linear-gradient(135deg, rgba(10,10,10,0.6), rgba(160,0,30,0.22)); border-color: rgba(160,0,30,0.28); }
.card-boca { background: linear-gradient(135deg, rgba(0,51,160,0.32), rgba(255,204,0,0.12)); border-color: rgba(0,51,160,0.38); }
.card-riv  { background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(225,29,72,0.14)); border-color: rgba(255,255,255,0.18); }

/* Country cards */
.card-bra { background: linear-gradient(135deg, rgba(0,156,59,0.22), rgba(255,223,0,0.12)); border-color: rgba(255,223,0,0.25); }
.card-arg { background: linear-gradient(135deg, rgba(117,170,219,0.22), rgba(255,255,255,0.06)); border-color: rgba(117,170,219,0.3); }
.card-fra { background: linear-gradient(135deg, rgba(0,85,164,0.28), rgba(229,27,35,0.18)); border-color: rgba(0,85,164,0.38); }
.card-ger { background: linear-gradient(135deg, rgba(15,15,15,0.6), rgba(255,255,255,0.04)); border-color: rgba(255,255,255,0.14); }
.card-esp { background: linear-gradient(135deg, rgba(170,21,27,0.28), rgba(241,191,0,0.12)); border-color: rgba(170,21,27,0.32); }
.card-ita { background: linear-gradient(135deg, rgba(0,114,206,0.28), rgba(255,255,255,0.04)); border-color: rgba(0,114,206,0.32); }
.card-eng { background: linear-gradient(135deg, rgba(200,16,46,0.22), rgba(255,255,255,0.04)); border-color: rgba(200,16,46,0.28); }

/* Accent bars */
.a-rm    { background: #fff; }
.a-bar   { background: linear-gradient(90deg, #004d98, #a50044); }
.a-bay   { background: #dc052d; }
.a-muf   { background: #da291c; }
.a-lfc   { background: #c8102e; }
.a-mil   { background: linear-gradient(90deg, #111, #a0001e); }
.a-boc   { background: linear-gradient(90deg, #0033a0, #ffcc00); }
.a-riv   { background: linear-gradient(90deg, #e5e7eb, #e11d48); }
.a-bra   { background: linear-gradient(90deg, #009c3b, #ffdf00); }
.a-arg   { background: #75aadb; }
.a-fra   { background: linear-gradient(90deg, #0055a4, #e51b23); }
.a-ger   { background: linear-gradient(90deg, #111, #e5e7eb); }
.a-esp   { background: linear-gradient(90deg, #aa151b, #f1bf00); }
.a-ita   { background: linear-gradient(90deg, #0072ce, #e5e7eb); }
.a-eng   { background: linear-gradient(90deg, #e5e7eb, #c8102e); }

.pb { height: 28px; }
</style>

</head>
<body>

<div>
  <p class="section-title">T0PS Index — Mobile</p>
  <div class="mobile-frame">
    <div class="mobile-notch"></div>


<div class="header">
  <div class="logo">Vote4<em>GOAT</em></div>
  <div style="display:flex;align-items:center;">
    <span class="nav-link">Log in</span>
    <span class="nav-signup">Sign up</span>
  </div>
</div>

<div class="hero">
  <div class="hero-mode">T0PS Mode</div>
  <div class="hero-title">Build your <em>Top 10</em></div>
  <div class="hero-sub">Pick a category. Rank your 10. Share it and compare with the world.</div>
</div>

<div class="search-wrap">
  <span class="search-icon">&#x1F50D;</span>
  <input class="search-input" type="text" placeholder="Search clubs, countries..."/>
</div>

<div class="tabs">
  <div class="tab active">All <span class="tab-count">15</span></div>
  <div class="tab">Clubs <span class="tab-count">8</span></div>
  <div class="tab">Countries <span class="tab-count">7</span></div>
  <div class="tab">Positions</div>
</div>

<div class="section-label">Clubs</div>
<div class="cat-grid">
  <div class="cat-card card-rm"><span class="cat-arrow">&#x276F;</span><div class="cat-name">Real Madrid</div><div class="cat-sub">All-time · Football</div><div class="cat-accent a-rm"></div></div>
  <div class="cat-card card-barca"><span class="cat-arrow">&#x276F;</span><div class="cat-name">FC Barcelona</div><div class="cat-sub">All-time · Football</div><div class="cat-accent a-bar"></div></div>
  <div class="cat-card card-bay"><span class="cat-arrow">&#x276F;</span><div class="cat-name">Bayern Munich</div><div class="cat-sub">All-time · Football</div><div class="cat-accent a-bay"></div></div>
  <div class="cat-card card-mufc"><span class="cat-arrow">&#x276F;</span><div class="cat-name">Man United</div><div class="cat-sub">All-time · Football</div><div class="cat-accent a-muf"></div></div>
  <div class="cat-card card-lfc"><span class="cat-arrow">&#x276F;</span><div class="cat-name">Liverpool</div><div class="cat-sub">All-time · Football</div><div class="cat-accent a-lfc"></div></div>
  <div class="cat-card card-mil"><span class="cat-arrow">&#x276F;</span><div class="cat-name">AC Milan</div><div class="cat-sub">All-time · Football</div><div class="cat-accent a-mil"></div></div>
  <div class="cat-card card-boca"><span class="cat-arrow">&#x276F;</span><div class="cat-name">Boca Juniors</div><div class="cat-sub">All-time · Football</div><div class="cat-accent a-boc"></div></div>
  <div class="cat-card card-riv"><span class="cat-arrow">&#x276F;</span><div class="cat-name">River Plate</div><div class="cat-sub">All-time · Football</div><div class="cat-accent a-riv"></div></div>
</div>

<div class="section-label">Countries</div>
<div class="cat-grid">
  <div class="cat-card card-bra"><span class="cat-arrow">&#x276F;</span><div class="cat-name">Brazil</div><div class="cat-sub">All-time · Football</div><div class="cat-accent a-bra"></div></div>
  <div class="cat-card card-arg"><span class="cat-arrow">&#x276F;</span><div class="cat-name">Argentina</div><div class="cat-sub">All-time · Football</div><div class="cat-accent a-arg"></div></div>
  <div class="cat-card card-fra"><span class="cat-arrow">&#x276F;</span><div class="cat-name">France</div><div class="cat-sub">All-time · Football</div><div class="cat-accent a-fra"></div></div>
  <div class="cat-card card-ger"><span class="cat-arrow">&#x276F;</span><div class="cat-name">Germany</div><div class="cat-sub">All-time · Football</div><div class="cat-accent a-ger"></div></div>
  <div class="cat-card card-esp"><span class="cat-arrow">&#x276F;</span><div class="cat-name">Spain</div><div class="cat-sub">All-time · Football</div><div class="cat-accent a-esp"></div></div>
  <div class="cat-card card-ita"><span class="cat-arrow">&#x276F;</span><div class="cat-name">Italy</div><div class="cat-sub">All-time · Football</div><div class="cat-accent a-ita"></div></div>
  <div class="cat-card card-eng"><span class="cat-arrow">&#x276F;</span><div class="cat-name">England</div><div class="cat-sub">All-time · Football</div><div class="cat-accent a-eng"></div></div>
</div>

<div class="pb"></div>


  </div>
</div>

</body>
</html>