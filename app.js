/* ====== 基礎資料 ====== */
/* 門市清單依地理區域（北→南）分組，方便門市尋找；同時作為「區域」自動帶入的來源 */
let STORE_GROUPS=[
  ["基隆",["基隆廟口"]],
  ["台北",["台北大安","台北大巨蛋","台北石牌","台北萬芳","台北西湖","中山南西","信義永吉","信義虎林","信義通化","忠孝敦化","士林捷運","站前南陽"]],
  ["新北",["三重正義","中和南勢角","板橋中正","新店民權","新莊幸福","永和永安市場","汐止中興","林口長庚","蘆洲光華","泰山明志"]],
  ["桃園",["中壢中原","中壢新生","內壢忠孝","桃園中正","桃園藝文","楊梅大成","桃園平鎮"]],
  ["新竹",["新竹民生","新竹清大","竹北勝利","竹北博愛"]],
  ["苗栗",["苗栗頭份","苗栗府前"]],
  ["台中",["台中中科","台中勤美","台中北平","台中大甲","台中大里","台中東山","台中東海","台中豐原","台中逢甲","台中黎明","台中沙鹿"]],
  ["彰化",["彰化員林","彰化彰基"]],
  ["南投",["南投復興"]],
  ["雲林",["斗六中山"]],
  ["嘉義",["嘉義文化"]],
  ["台南",["台南東寧","台南民生","台南永康"]],
  ["高雄",["高雄巨蛋","高雄瑞隆","高雄美麗島","高雄鳳山"]],
  ["屏東",["屏東民生"]],
  ["宜蘭",["宜蘭礁溪","羅東民權"]]
];
let STORES=[]; let STORE_REGION={};
/* 門市 → 負責督導（主檔＝修繕進度系統，由後端 storeDir 帶回；管理頁可編輯）*/
let STORE_SUP={}; let STORE_SYNC_AT="";
/* 門市名稱正規化：修繕系統帶「店」字尾、文宣系統沒有，比對時一律去掉 */
function normStoreName(s){return String(s==null?"":s).trim().replace(/店$/,"")}
function supOfStore(s){
  if(!s)return"";
  if(STORE_SUP[s])return STORE_SUP[s];
  const n=normStoreName(s);
  const k=Object.keys(STORE_SUP).find(k=>normStoreName(k)===n);
  return k?STORE_SUP[k]:"";
}
/* 由 STORE_GROUPS 重算扁平門市清單與「門市→區域」對照（雲端門市清單載入後也會呼叫）*/
function rebuildStores(){
  STORES=STORE_GROUPS.reduce((a,g)=>a.concat(g[1]),[]);
  STORE_REGION={}; STORE_GROUPS.forEach(g=>g[1].forEach(s=>STORE_REGION[s]=g[0]));
}
rebuildStores();

/* 文宣品項主檔（= Excel「設計清單」分頁；之後可改由後端試算表同步）。
   price 為設計部基準報價、ship 運費、design 重新設計時程、print 印刷時程、baseQty 基準數量、format 預設檔案格式 */
let CATALOG=[
  {name:"告五人-人型立牌-A款",baseQty:"1張",price:1780,ship:"250起",design:"14工作日",print:"7工作日",format:"電子稿"},
  {name:"告五人-人型立牌-B款",baseQty:"1張",price:2260,ship:"250起",design:"14工作日",print:"7工作日",format:"印刷稿"},
  {name:"X展架海報60X180CM",baseQty:"1張",price:470,ship:"—",design:"7工作日",print:"5工作日",format:"印刷稿"},
  {name:"PP海報42x60CM",baseQty:"1張",price:90,ship:"—",design:"7工作日",print:"5工作日",format:"印刷稿"},
  {name:"原物料貼紙",baseQty:"1組",price:390,ship:"—",design:"2工作日",print:"5工作日",format:"印刷稿"},
  {name:"今日已打烊/開店準備中吊牌",baseQty:"1張",price:460,ship:"—",design:"不重新設計",print:"7工作日",format:"印刷稿"},
  {name:"桌上型價目表(中英文) 正面菜單/背面熱量表40X24.5CM",baseQty:"1張",price:370,ship:"—",design:"7工作日",print:"7工作日",format:"印刷稿"},
  {name:"掃碼線上點餐牌",baseQty:"1張",price:66,ship:"—",design:"7工作日",print:"3工作日",format:"印刷稿"},
  {name:"POS機支付方式貼紙",baseQty:"1張",price:40,ship:"—",design:"3工作日",print:"3工作日",format:"印刷稿"},
  {name:"食品安全公告/外帶折5元",baseQty:"1張",price:80,ship:"—",design:"7工作日",print:"7工作日",format:"印刷稿"},
  {name:"四邊形紅龍包柱",baseQty:"1組",price:1560,ship:"—",design:"7工作日",print:"7工作日",format:"印刷稿"},
  {name:"A5DM(菜單)21X14.85CM 150磅銅板紙",baseQty:"2000張",price:1220,ship:"100",design:"7工作日",print:"5工作日",format:"印刷稿"},
  {name:"A4文宣21*29.7CM",baseQty:"1張",price:90,ship:"貨到付款",design:"7工作日",print:"7工作日",format:"印刷稿"},
  {name:"活動布條(W)300X(H)80",baseQty:"1條",price:1730,ship:"—",design:"7工作日",print:"7工作日",format:"印刷稿"},
  {name:"活動兌換券14.3X6.5CM 150P銅版紙含流水號",baseQty:"1000張",price:2390,ship:"100",design:"7工作日",print:"20工作日",format:"印刷稿"},
  {name:"A4營業公告或門店特殊公告",baseQty:"1張",price:90,ship:"貨到付款",design:"—",print:"—",format:"印刷稿"},
  {name:"其他(請設計報價)",baseQty:"",price:0,ship:"—",design:"—",print:"—",format:"印刷稿"}
];
let PLAN_OPTS=["方案A 買一送一(品項先選為買)","方案B 第二杯半價(品項後選為半價)","季節新品A","季節新品B","開學日A","開學日B","其他"];
let OPTION_OPTS=["自費選購","總公司贈送"];
let FORMAT_OPTS=["印刷稿","電子稿","給檔"];
let DELIVERY_OPTS=["宅配","親送","給檔"];
const STATUS=["待處理","設計中","已印刷"];
/* 可由「申請欄位設定」開關的文宣品項欄位（品項、申請文宣內容一律顯示）*/
const FIELD_DEFS=[["period","活動期間"],["plan","設計/行銷方案"],["qty","數量"],["option","選配方式"],["format","檔案格式"],["delivery","運送方式"]];
const LS_KEY="promo_apply_cases_v1", LS_LINE="promo_apply_line_v1", LS_FIELDS="promo_apply_fields_v1";
const PUBLIC_SITE="https://johney8590-svg.github.io/promo-apply-web/";
const ADMIN_SITE="https://johney8590-svg.github.io/promo-apply-web/admin.html";  // 通知連結導向管理頁，方便點開直接改狀態（改用 GitHub Pages，Cloudflare 部署快取有問題）
const DEFAULT_LINE_TPL=
  "【門市文宣申請通知】\n"+
  "案號：{caseNo}\n"+
  "門市：{store}（{region}）\n"+
  "申請日期：{applyDate}\n"+
  "聯絡電話：{phone}\n"+
  "申請品項：\n{items}\n"+
  "預估金額：{amount}\n"+
  "連結：{link}";

/* ====== 後端 API（雲端）設定 ======
   兩者留空 => 維持純本機模式（localStorage）。 */
const API_URL  ="https://script.google.com/macros/s/AKfycbwn-hiS6mPpxw3BmZCqTmH211g0AwI7KW7xiBMzWyYXdymk5eBYCeL3eRZq6kz1u9yrRw/exec";
const API_TOKEN="pr_kQ7mZ2xV9tLpA4nBwR8sYcEf";
// 管理密碼由後端 ADMIN_PASSWORD 驗證，不放前端
/* 頁面模式（門市頁 / 管理頁分家）：由各 HTML 在載入 app.js 前設定 window.PAGE_MODE。
   index.html='store'（純門市申請，無管理入口）；admin.html='admin'（開啟即跳管理登入）。
   真正的鎖仍是後端的管理密碼，務必把預設密碼改強。*/
const PAGE_MODE=(window.PAGE_MODE==="admin")?"admin":"store";

/* ====== 狀態 ====== */
let role="store";
let adminPass="";
let cases=load();
let itemRows=[];   // 申請表的品項列暫存
let charts={};
let fieldCfg=loadFieldCfgLocal();   // 申請欄位設定（依品項）
let catalogLoaded=false, catalogLoadError=false;  // 雲端品項主檔是否載入完成（避免載入前/失敗時誤顯示已隱藏品項）

function loadFieldCfgLocal(){try{return JSON.parse(localStorage.getItem(LS_FIELDS))||{}}catch(e){return{}}}
function saveFieldCfgLocal(){try{localStorage.setItem(LS_FIELDS,JSON.stringify(fieldCfg))}catch(e){}}
/* 取某品項的欄位顯示設定；未設定者預設全部顯示 */
function itemFieldCfg(name){
  const d={period:true,plan:true,qty:true,option:true,format:true,delivery:true};
  const c=fieldCfg[name];return c?Object.assign({},d,c):d;
}

/* ====== 雲端 API ====== */
async function api(action,payload){
  const res=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},
    body:JSON.stringify(Object.assign({action,token:API_TOKEN,adminPass},payload||{}))});
  const j=await res.json();
  if(!j.ok)throw new Error(j.error||"伺服器錯誤");
  return j.data;
}
async function syncFromCloud(){
  if(!API_URL||role!=="admin")return;
  try{ cases=await api("list"); save(); refreshAll(); }
  catch(e){ console.warn("雲端同步失敗，改用本機快取",e); toast("⚠ 雲端連線失敗，顯示本機資料"); }
}
async function loadCatalog(){
  if(!API_URL){ catalogLoaded=true; return; }
  for(let attempt=0;attempt<2;attempt++){
    try{
      const list=await api("catalog");
      // 僅在拿到非空清單時才採用並視為載入完成；空清單視為異常，不沿用內建（內建未含隱藏狀態會誤露未開放品項）
      if(Array.isArray(list)&&list.length){ CATALOG=list; catalogLoaded=true; catalogLoadError=false; return; }
    }catch(e){ console.warn("品項主檔載入失敗（第"+(attempt+1)+"次）",e); }
  }
  // 兩次都失敗或回傳空清單：標記錯誤，門市端下拉顯示「載入失敗」而非誤用內建（含已隱藏）清單
  catalogLoadError=true;
  toast("⚠ 文宣品項載入失敗，請檢查網路後重新整理頁面");
}
async function loadFieldConfig(){
  if(!API_URL)return;
  try{
    const fc=await api("fieldConfig");
    if(fc&&typeof fc==="object"){ fieldCfg=fc; saveFieldCfgLocal(); }
  }catch(e){ console.warn("申請欄位設定載入失敗",e); }
}
async function loadOptions(){
  if(!API_URL)return;
  try{
    const opts=await api("options");
    if(opts&&typeof opts==="object"){
      if(Array.isArray(opts.plan)    &&opts.plan.length)    PLAN_OPTS=opts.plan;
      if(Array.isArray(opts.option)  &&opts.option.length)  OPTION_OPTS=opts.option;
      if(Array.isArray(opts.format)  &&opts.format.length)  FORMAT_OPTS=opts.format;
      if(Array.isArray(opts.delivery)&&opts.delivery.length)DELIVERY_OPTS=opts.delivery;
    }
  }catch(e){ console.warn("下拉選項載入失敗",e); }
}
async function loadStores(){
  if(!API_URL)return;
  try{
    const d=await api("storeDir");   // 門市清單＋門市→督導對照
    if(d&&Array.isArray(d.groups)&&d.groups.length){
      STORE_GROUPS=d.groups; STORE_SUP=d.sup||{}; STORE_SYNC_AT=d.syncAt||"";
      rebuildStores(); refillStoreSelects(); return;
    }
  }catch(e){ console.warn("門市／督導對照載入失敗，改用舊版門市清單",e); }
  try{
    const list=await api("stores");
    if(Array.isArray(list)&&list.length){ STORE_GROUPS=list; rebuildStores(); refillStoreSelects(); }
  }catch(e){ console.warn("門市清單載入失敗",e); }
}
/* 門市下拉依「區域」分組（optgroup），門市可以直接跳到自己的區域找店 */
function fillStoreSelect(el,ph){
  if(!el)return;
  const groups=STORE_GROUPS.filter(g=>g&&g[1]&&g[1].length);
  el.innerHTML="<option value=''>"+(ph||"— 請選擇 —")+"</option>"+
    groups.map(g=>`<optgroup label="${esc(g[0])}（${g[1].length}）">`+
      g[1].map(s=>`<option>${esc(s)}</option>`).join("")+"</optgroup>").join("");
}
/* 重新填入門市下拉（雲端門市清單載入或管理頁存檔後），盡量保留目前選取值 */
function refillStoreSelects(){
  if(typeof f_store!=="undefined"){const v=f_store.value;fillStoreSelect(f_store,"— 選擇門市 —");if(STORES.includes(v))f_store.value=v;}
  if(typeof q_store!=="undefined"){const v=q_store.value;fillStoreSelect(q_store,"全部門市");q_store.value=STORES.includes(v)?v:"";}
}

function load(){try{return JSON.parse(localStorage.getItem(LS_KEY))||[]}catch(e){return[]}}
function save(){try{localStorage.setItem(LS_KEY,JSON.stringify(cases));return true}catch(e){return false}}
function getLineCfg(){try{return JSON.parse(localStorage.getItem(LS_LINE))||{}}catch(e){return{}}}
function setLineCfg(o){try{localStorage.setItem(LS_LINE,JSON.stringify(o))}catch(e){}}
function esc(s){return String(s==null?"":s).replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function today(){return new Date().toISOString().slice(0,10)}
function fillSelect(el,arr,ph){el.innerHTML="<option value=''>"+(ph||"— 請選擇 —")+"</option>"+arr.map(s=>`<option>${esc(s)}</option>`).join("")}
function fmt$(n){return "$"+Number(n||0).toLocaleString()}
/* 從「2,000張 / 1組 / 1張」等字串取出數字；取不到回 NaN */
function parseNum(s){const m=String(s==null?"":s).replace(/,/g,"").match(/\d+(\.\d+)?/);return m?parseFloat(m[0]):NaN;}

/* ====== 初始化下拉 ====== */
fillStoreSelect(f_store,"— 選擇門市 —");
fillStoreSelect(q_store,"全部門市"); q_store.value="";
f_date.value=today();

/* ====== 品項列（repeater）====== */
function catalogOptions(sel){
  // 雲端品項尚未載入完成時不顯示內建清單（內建清單未含隱藏狀態，會誤露未開放品項）
  if(API_URL&&!catalogLoaded){
    return "<option value=''>"+(catalogLoadError?"⚠ 品項載入失敗，請重新整理頁面":"載入文宣品項中…")+"</option>";
  }
  return "<option value=''>— 選擇文宣品項 —</option>"+
    CATALOG.map((c,i)=>({c,i})).filter(o=>!o.c.hidden||o.i==sel)  // 隱藏品項不顯示（但已選取者仍保留）
      .map(({c,i})=>`<option value="${i}" ${sel==i?"selected":""}>${esc(c.name)}</option>`).join("");
}
function blankRow(){return {item:"",period:"",plan:"",content:"",option:"自費選購",qty:"",format:"印刷稿",delivery:"宅配",images:[]};}
function addItem(data){itemRows.push(data||blankRow());renderItems();}
function rmItem(i){itemRows.splice(i,1);if(!itemRows.length)itemRows.push(blankRow());renderItems();}
/* 依欄位設定取下拉選項：true/undefined=沿用共用清單；array=此品項專屬清單（內容可與共用不同）*/
function fO(all,cfgVal){return Array.isArray(cfgVal)?cfgVal:all;}
function renderItems(){
  itemWrap.innerHTML=itemRows.map((r,i)=>{
    const ci=CATALOG.findIndex(c=>c.name===r.item);
    const c=ci>=0?CATALOG[ci]:null;
    const cfg=itemFieldCfg(r.item);
    const baseN=c?parseNum(c.baseQty):NaN;
    const quote=c?`<div class="quote-line">設計部基準報價：<b>${fmt$(c.price)}</b>（基準量 ${esc(c.baseQty||"—")}）　運費：${esc(c.ship)}　重新設計：${esc(c.design)}　印刷：${esc(c.print)}<br>本項預估（含稅）：<b id="amt_${i}">${fmt$(rowAmount(r))}</b><span class="small" style="color:var(--muted)"> ＝基準報價×（數量÷基準量）</span></div>`:"";
    const F={
      period:`<div><label>活動期間</label><input value="${esc(r.period)}" oninput="setRow(${i},'period',this.value)" placeholder="例：2026/06/01-06/30"></div>`,
      plan:`<div><label>設計／行銷方案</label>
          <select onchange="setRow(${i},'plan',this.value)">${["<option value=''>— 請選擇 —</option>"].concat(fO(PLAN_OPTS,cfg.plan).map(o=>`<option ${r.plan===o?"selected":""}>${esc(o)}</option>`)).join("")}</select></div>`,
      qty:`<div><label>數量 <span class="req">*</span></label><input value="${esc(r.qty)}" oninput="setRow(${i},'qty',this.value)" onchange="qtyCheck(${i},this)" placeholder="${baseN>1?`需為 ${baseN} 的倍數`:"例：1張 / 1組"}">${baseN>1?`<div style="font-size:11px;color:var(--accent);margin-top:4px">⚠ 此品項需以 <b>${baseN}</b> 的倍數訂購（基準量 ${esc(c.baseQty)}），非倍數會自動清除</div>`:""}</div>`,
      option:`<div><label>選配方式</label>
          <select onchange="setRow(${i},'option',this.value)">${fO(OPTION_OPTS,cfg.option).map(o=>`<option ${r.option===o?"selected":""}>${esc(o)}</option>`).join("")}</select></div>`,
      format:`<div><label>檔案格式</label>
          <select onchange="setRow(${i},'format',this.value)">${fO(FORMAT_OPTS,cfg.format).map(o=>`<option ${r.format===o?"selected":""}>${esc(o)}</option>`).join("")}</select></div>`,
      delivery:`<div><label>運送方式</label>
          <select onchange="setRow(${i},'delivery',this.value)">${fO(DELIVERY_OPTS,cfg.delivery).map(o=>`<option ${r.delivery===o?"selected":""}>${esc(o)}</option>`).join("")}</select></div>`
    };
    const optionalHtml=FIELD_DEFS.map(([k])=>cfg[k]?F[k]:"").join("");
    return `<div class="item-card">
      <span class="idx">品項 ${i+1}</span>
      ${itemRows.length>1?`<button class="btn danger sm rm" type="button" onclick="rmItem(${i})">移除</button>`:""}
      <div class="grid">
        <div class="full"><label>文宣品項 <span class="req">*</span></label>
          <select onchange="onItem(${i},this.value)">${catalogOptions(ci)}</select></div>
        ${optionalHtml}
        <div class="full"><label>申請文宣內容 <span class="req">*</span></label>
          <textarea oninput="setRow(${i},'content',this.value)" placeholder="文宣上要呈現的文案／訴求，例：外送門檻、活動辦法、菜單內容…">${esc(r.content)}</textarea></div>
        <div class="full"><label>附件圖檔（選填，可上傳多張，例如門市 QRcode、參考圖、匯款明細）</label>
          <input type="file" accept="image/*" multiple onchange="onItemImage(${i},this)">
          ${(r.images&&r.images.length)?`<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:10px">
            ${r.images.map((img,j)=>`<div style="position:relative">
              <img src="${img}" alt="附件${j+1}" onclick="openLightbox('${img}')" style="max-width:150px;max-height:150px;border:1px solid var(--line);border-radius:8px;display:block;cursor:zoom-in">
              <button class="btn danger sm" type="button" onclick="rmItemImage(${i},${j})" style="position:absolute;top:4px;right:4px;padding:2px 8px">✕</button>
            </div>`).join("")}
          </div>`:``}
          <div style="font-size:11px;color:var(--muted);margin-top:4px">支援 JPG／PNG，可一次選多張；會保留清晰畫質（僅輕度壓縮）</div></div>
      </div>
      ${quote}
    </div>`;
  }).join("");
  renderTotal();
}
/* ====== 申請欄位設定（管理）====== */
function renderFieldTable(){
  fcBody.innerHTML=CATALOG.map(c=>{
    const cfg=itemFieldCfg(c.name);
    const summary=FIELD_DEFS.map(([k,lbl])=>{
      if(cfg[k]===false)return null;
      if(Array.isArray(cfg[k]))return `<b>${lbl}</b><span style="color:var(--primary);font-size:11px">（專屬${cfg[k].length}項）</span>`;
      return lbl;
    }).filter(Boolean).join(' · ')||'<span style="color:var(--muted)">全部隱藏</span>';
    return `<tr style="${c.hidden?'opacity:.55':''}">
      <td style="max-width:200px;word-break:break-all;font-size:13px">${esc(c.name)}${c.hidden?'<span style="margin-left:6px;font-size:11px;color:var(--muted)">（已隱藏）</span>':''}</td>
      <td style="font-size:12px;color:var(--muted);line-height:1.8">${summary}</td>
      <td><button class="btn sm ghost" type="button" onclick="openFieldCfgModal(${JSON.stringify(c.name).replace(/"/g,'&quot;')})">設定</button></td>
    </tr>`;
  }).join("");
}
/* ====== 品項欄位設定 Modal（每個品項可個別管理專屬選項與選項內容）====== */
const FC_DROPDOWN=['plan','option','format','delivery'];
const FC_OPTS_MAP=()=>({plan:PLAN_OPTS,option:OPTION_OPTS,format:FORMAT_OPTS,delivery:DELIVERY_OPTS});
/* Modal 編輯暫存：fcModalItem=當前品項；fcoShow[key]=是否顯示；fcoEdit[key]=此品項專屬選項清單；fcoShared[key]=是否沿用共用清單 */
let fcModalItem=null, fcoShow={}, fcoEdit={}, fcoShared={};
function openFieldCfgModal(itemName){
  fcModalItem=itemName;
  const cfg=itemFieldCfg(itemName);
  const optsMap=FC_OPTS_MAP();
  fcoShow={}; fcoEdit={}; fcoShared={};
  FIELD_DEFS.forEach(([key])=>{
    fcoShow[key]=cfg[key]!==false;
    if(FC_DROPDOWN.includes(key)){
      const custom=Array.isArray(cfg[key]);
      fcoShared[key]=!custom;                                   // 非陣列＝沿用共用
      fcoEdit[key]=custom?[...cfg[key]]:[...(optsMap[key]||[])]; // 沿用時以共用清單為起始內容
    }
  });
  renderFcModal();
}
function renderFcModal(){
  const optsMap=FC_OPTS_MAP();
  const sections=FIELD_DEFS.map(([key,label])=>{
    const isDrop=FC_DROPDOWN.includes(key);
    const shown=fcoShow[key];
    let body='';
    if(isDrop){
      const shared=fcoShared[key];
      const chips=shared
        ? `<div style="font-size:12px;color:var(--muted);margin:6px 0 4px 22px">沿用共用選項（共 ${ (optsMap[key]||[]).length } 項）：${(optsMap[key]||[]).map(esc).join('、')||'—'}</div>`
        : `<div style="display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 8px 22px">
            ${(fcoEdit[key]||[]).map((o,i)=>`<span style="background:#eef5f0;border:1px solid #b8d4c0;border-radius:20px;padding:4px 12px;font-size:13px;display:inline-flex;align-items:center;gap:6px">${esc(o)}<button type="button" onclick="fcoRm('${key}',${i})" style="background:none;border:none;cursor:pointer;color:#c0392b;font-size:15px;padding:0;line-height:1;font-weight:700">×</button></span>`).join('')||'<span style="font-size:12px;color:var(--muted)">尚無選項，請於下方新增</span>'}
          </div>
          <div style="display:flex;gap:8px;align-items:center;margin:0 0 4px 22px">
            <input id="fcoIn_${key}" placeholder="新增此品項專屬選項內容…" onkeydown="if(event.key==='Enter'){event.preventDefault();fcoAdd('${key}')}" style="flex:1;padding:7px 11px;border:1px solid #cdd5d0;border-radius:7px;font-size:13px;font-family:inherit">
            <button class="btn sec sm" type="button" onclick="fcoAdd('${key}')">＋ 新增</button>
          </div>`;
      const toggleShared=`<label style="display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:400;color:var(--muted);cursor:pointer;margin:2px 0 2px 22px">
          <input type="checkbox" ${shared?'checked':''} onchange="fcoSetShared('${key}',this.checked)" style="width:auto;height:14px"> 沿用共用選項（取消勾選即可改為此品項專屬內容）
        </label>`;
      body=`<div class="fco-opts" style="display:${shown?'block':'none'}">${toggleShared}${chips}</div>`;
    }
    return `<div class="fco-section" style="border-bottom:1px solid var(--line);padding:10px 0">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px;font-weight:600">
        <input type="checkbox" ${shown?"checked":""} onchange="fcoSetShow('${key}',this.checked)" style="width:auto;height:16px">
        ${label}${!isDrop?'<span style="font-size:11px;font-weight:400;color:var(--muted)">（文字輸入）</span>':''}
      </label>${body}
    </div>`;
  }).join('');
  showModal(`<button class="close-x" onclick="closeModal()">×</button>
    <h2 style="font-size:15px;word-break:break-all;margin-bottom:6px">📋 ${esc(fcModalItem)}</h2>
    <p class="hint" style="margin-bottom:10px">勾選要顯示的欄位。下拉欄位預設沿用共用選項；取消「沿用共用選項」即可為<b>此品項</b>單獨新增／刪除／編輯專屬選項內容。</p>
    ${sections}
    <div class="btn-row" style="margin-top:16px">
      <button class="btn" onclick="saveFieldCfgModal()">儲存此品項設定</button>
      <button class="btn sec" onclick="closeModal()">取消</button>
    </div>`);
}
function fcoSetShow(key,checked){fcoShow[key]=checked;renderFcModal();}
function fcoSetShared(key,checked){
  fcoShared[key]=checked;
  if(checked)fcoEdit[key]=[...(FC_OPTS_MAP()[key]||[])]; // 重新勾選沿用＝以共用清單為起始內容，之後仍可取消再客製
  renderFcModal();
}
function fcoRm(key,i){(fcoEdit[key]||[]).splice(i,1);renderFcModal();}
function fcoAdd(key){
  const inp=document.getElementById('fcoIn_'+key);
  const v=(inp?inp.value:'').trim();
  if(!v)return;
  if(!fcoEdit[key])fcoEdit[key]=[];
  if(fcoEdit[key].includes(v)){toast('此選項已存在');return;}
  fcoEdit[key].push(v);
  renderFcModal();
  const ni=document.getElementById('fcoIn_'+key); if(ni)ni.focus();
}
function saveFieldCfgModal(){
  const itemName=fcModalItem;
  const newCfg={};
  FIELD_DEFS.forEach(([key])=>{
    if(!fcoShow[key]){newCfg[key]=false;return;}
    if(!FC_DROPDOWN.includes(key)){newCfg[key]=true;return;}
    if(fcoShared[key]){newCfg[key]=true;return;}                 // 沿用共用
    newCfg[key]=(fcoEdit[key]||[]).filter(Boolean);              // 此品項專屬清單
  });
  fieldCfg[itemName]=newCfg;saveFieldCfgLocal();renderItems();renderFieldTable();closeModal();
  if(API_URL){api("saveFieldConfig",{fieldConfig:fieldCfg}).catch(e=>toast("⚠ 雲端儲存失敗："+e.message));toast("已儲存（雲端同步中…）");}
  else{toast("已儲存（本機）");}
}
function onItem(i,v){
  // 注意：v 為空字串（選到「— 選擇文宣品項 —」）時，+v 會變成 0 而誤抓 CATALOG[0]（可能是隱藏品項），故先判斷空值
  const c=(v===""||v==null)?null:CATALOG[+v];
  itemRows[i].item=c?c.name:"";
  if(c){ if(!itemRows[i].qty)itemRows[i].qty=c.baseQty; itemRows[i].format=c.format||itemRows[i].format; }
  renderItems();
}
function setRow(i,k,v){itemRows[i][k]=v; if(k==='qty')renderTotal();}
/* 圖檔壓縮：縮到最長邊 maxDim、JPEG 品質 quality（改存 Drive 後無儲存格上限，故保留清晰畫質，僅做輕度上限保護 maxBytes）*/
function fileToCompressedDataUrl(file,maxDim,quality,maxBytes){
  maxDim=maxDim||1800; quality=quality||0.85; maxBytes=maxBytes||1600000;
  return new Promise((resolve,reject)=>{
    const fr=new FileReader();
    fr.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        let w=img.width,h=img.height;
        if(w>maxDim||h>maxDim){const s=maxDim/Math.max(w,h);w=Math.round(w*s);h=Math.round(h*s);}
        const draw=(ww,hh,q)=>{const cv=document.createElement("canvas");cv.width=ww;cv.height=hh;const x=cv.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,ww,hh);x.drawImage(img,0,0,ww,hh);return cv.toDataURL("image/jpeg",q);};
        let q=quality,url=draw(w,h,q);
        // 僅在超過 maxBytes 時才逐步降質，維持可判讀畫質
        while(url.length>maxBytes&&q>0.5){q-=0.1;url=draw(w,h,q);}
        let ww=w,hh=h;
        while(url.length>maxBytes&&ww>800){ww=Math.round(ww*0.85);hh=Math.round(hh*0.85);url=draw(ww,hh,0.7);}
        resolve(url);
      };
      img.onerror=reject;img.src=fr.result;
    };
    fr.onerror=reject;fr.readAsDataURL(file);
  });
}
async function onItemImage(i,el){
  const files=el.files?Array.from(el.files):[];
  if(!files.length)return;
  if(!itemRows[i].images)itemRows[i].images=[];
  toast("圖片處理中…（"+files.length+" 張）");
  try{
    for(const f of files){
      if(!/^image\//.test(f.type)){toast("略過非圖片檔："+f.name);continue;}
      itemRows[i].images.push(await fileToCompressedDataUrl(f,1800,0.85));
    }
    el.value=""; renderItems();
  }catch(e){ console.warn("圖片讀取失敗",e); toast("⚠ 圖片讀取失敗，請換一張試試"); }
}
function rmItemImage(i,j){ if(itemRows[i].images)itemRows[i].images.splice(j,1); renderItems(); }
/* 圖片放大燈箱（支援 data: 與 https 圖，取代原本開新分頁被瀏覽器擋成空白的做法）*/
function openLightbox(src){
  const bg=document.createElement("div");
  bg.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;cursor:zoom-out";
  bg.innerHTML=`<img src="${src}" style="max-width:96vw;max-height:92vh;border-radius:8px;box-shadow:0 4px 30px rgba(0,0,0,.5)">
    <button style="position:absolute;top:16px;right:20px;background:#fff;border:none;border-radius:50%;width:40px;height:40px;font-size:22px;cursor:pointer">✕</button>`;
  bg.addEventListener("click",()=>bg.remove());
  document.body.appendChild(bg);
}
/* 數量離開欄位即時防呆：基準量>1 的品項，數量非正整數倍 → 主動通知錯誤量並清除（不把無效值填進去）*/
function qtyCheck(i,el){
  const r=itemRows[i]; const cat=CATALOG.find(c=>c.name===r.item); if(!cat)return;
  const base=parseNum(cat.baseQty); if(!(base>1))return;
  if(String(el.value).trim()==="")return;          // 空白留待送出時再擋
  const ord=parseNum(el.value);
  if(isNaN(ord)||ord<=0||ord%base!==0){
    toast("數量「"+el.value+"」不是 "+base+" 的倍數，已清除請重新輸入");
    r.qty=""; el.value=""; renderTotal();
  }
}
/* 預估金額（含稅）＝基準報價 ×（填寫數量 ÷ 基準數量）；無法換算時退回基準報價 */
function rowAmount(r){
  const c=CATALOG.find(c=>c.name===r.item); if(!c)return 0;
  const base=parseNum(c.baseQty), ord=parseNum(r.qty);
  if(!base||isNaN(base)||isNaN(ord)) return c.price||0;
  return Math.round((c.price||0)*ord/base);
}
function renderTotal(){
  // 同步各品項小計（用 id 局部更新，避免重建表單導致輸入失焦）
  itemRows.forEach((r,i)=>{const el=document.getElementById("amt_"+i);if(el)el.textContent=fmt$(rowAmount(r));});
  const sum=itemRows.reduce((a,r)=>a+rowAmount(r),0);
  totalBar.innerHTML=`<span>預估金額合計（含稅）：${fmt$(sum)}　<span class="small">（依數量×設計部基準報價估算，實際以設計部報價單為準）</span></span>
    <span class="small">共 ${itemRows.filter(r=>r.item).length} 項</span>`;
}
addItemBtn.addEventListener("click",()=>addItem());
addItem();

/* ====== 送出 ====== */
function pad3(n){return String(n).padStart(3,"0")}
function genCaseNo(store,dstr){
  const base=(dstr||today()).replaceAll("-","");
  const n=cases.filter(c=>c.store===store&&(c.applyDate||"").replaceAll("-","")===base).length+1;
  return "PR"+store+base+pad3(n);
}
submitBtn.addEventListener("click",()=>{
  const items=itemRows.filter(r=>r.item);
  if(!f_store.value){toast("請選擇門市");return;}
  if(!f_phone.value.trim()){toast("請填寫聯絡電話（門市電話）");return;}
  if(!items.length){toast("請至少新增一個文宣品項");return;}
  for(const r of items){
    const rcfg=itemFieldCfg(r.item);
    const cat=CATALOG.find(c=>c.name===r.item);
    if(!r.content){toast("每個品項需填寫申請文宣內容");return;}
    if(rcfg.qty&&!r.qty){toast("每個品項需填寫數量");return;}
    if(!rcfg.qty&&!r.qty){r.qty=cat?cat.baseQty:"";}
    // 數量防呆：基準量>1 的品項，數量需為基準量的正整數倍
    if(cat){
      const base=parseNum(cat.baseQty), ord=parseNum(r.qty);
      if(base>1){
        if(isNaN(ord)||ord<=0){toast("「"+r.item+"」數量需填寫數字");return;}
        if(ord%base!==0){toast("「"+r.item+"」數量需為 "+base+" 的倍數（基準量 "+cat.baseQty+"）");return;}
      }
    }
  }
  openSignatureModal(items);   // 送出前先電子簽名確認
});

/* ====== 電子簽名 + 匯款明細（送出前必填，確認申請由本門市提出）====== */
let sigCtx=null,sigDrawing=false,sigHasInk=false,sigRemitData="";
function openSignatureModal(items){
  sigRemitData="";   // 每次開啟先清空匯款明細暫存
  showModal(`<button class="close-x" onclick="closeModal()">×</button>
    <h2>申請人電子簽名與匯款明細</h2>
    <p class="hint">請<b>本門市申請人</b>於下方框內簽名、並上傳匯款明細後送出，作為此申請確實由 <b>${esc(f_store.value)}</b> 提出之確認（避免代填他店或惡意申請）。</p>
    <label style="font-size:13px;font-weight:600">電子簽名 <span class="req">*</span></label>
    <div style="border:1px dashed var(--primary);border-radius:10px;background:#fff;margin-top:4px">
      <canvas id="sigPad" style="width:100%;height:200px;display:block;touch-action:none"></canvas>
    </div>
    <div class="btn-row" style="margin-top:8px">
      <button class="btn ghost sm" type="button" onclick="clearSig()">清除重簽</button>
    </div>
    <div style="margin-top:14px">
      <label style="font-size:13px;font-weight:600">匯款明細上傳 <span class="req">*</span></label>
      <input type="file" accept="image/*" onchange="onRemitImage(this)">
      <div style="font-size:11px;color:var(--muted);margin-top:4px">請上傳匯款／轉帳明細截圖（JPG／PNG，會自動壓縮）</div>
      <div id="remitPreview" style="margin-top:8px"></div>
    </div>
    <div style="font-size:12px;color:var(--muted);margin-top:10px">門市：<b>${esc(f_store.value)}</b>（${esc(STORE_REGION[f_store.value]||"")}）　督導：${esc(supOfStore(f_store.value)||"—")}　聯絡電話：${esc(f_phone.value)}</div>
    <div class="btn-row" style="margin-top:10px">
      <button class="btn" id="sigConfirm" type="button">確認並送出</button>
      <button class="btn sec" type="button" onclick="closeModal()">取消</button>
    </div>`);
  setTimeout(initSigPad,30);   // 等 modal 版面完成再量尺寸
  const btn=document.getElementById("sigConfirm");
  if(btn)btn.addEventListener("click",()=>{
    if(!sigHasInk){toast("請先簽名再送出");return;}
    if(!sigRemitData){toast("請上傳匯款明細後再送出");return;}
    const url=document.getElementById("sigPad").toDataURL("image/png");
    closeModal();
    doSubmit(items,url,sigRemitData);
  });
}
async function onRemitImage(el){
  const f=el.files&&el.files[0];if(!f)return;
  if(!/^image\//.test(f.type)){toast("請選擇圖片檔（JPG／PNG）");el.value="";return;}
  toast("匯款明細處理中…");
  try{
    sigRemitData=await fileToCompressedDataUrl(f,700,0.7);
    const pv=document.getElementById("remitPreview");
    if(pv)pv.innerHTML=`<div style="display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap">
      <a href="${sigRemitData}" target="_blank"><img src="${sigRemitData}" alt="匯款明細" style="max-width:180px;max-height:180px;border:1px solid var(--line);border-radius:8px;display:block"></a>
      <button class="btn danger sm" type="button" onclick="rmRemitImage()">移除</button></div>`;
  }catch(e){ console.warn("匯款明細讀取失敗",e); toast("⚠ 匯款明細讀取失敗，請換一張試試"); }
}
function rmRemitImage(){ sigRemitData=""; const pv=document.getElementById("remitPreview"); if(pv)pv.innerHTML=""; }
function initSigPad(){
  const cv=document.getElementById("sigPad");if(!cv)return;
  const rect=cv.getBoundingClientRect();
  cv.width=Math.max(300,Math.round(rect.width));cv.height=Math.round(rect.height||200);
  sigCtx=cv.getContext("2d");sigCtx.lineWidth=2.5;sigCtx.lineCap="round";sigCtx.lineJoin="round";sigCtx.strokeStyle="#1e4d33";
  sigHasInk=false;sigDrawing=false;
  const pos=e=>{const r=cv.getBoundingClientRect();const t=(e.touches&&e.touches[0])?e.touches[0]:e;return{x:(t.clientX-r.left)*(cv.width/r.width),y:(t.clientY-r.top)*(cv.height/r.height)};};
  const start=e=>{sigDrawing=true;const p=pos(e);sigCtx.beginPath();sigCtx.moveTo(p.x,p.y);e.preventDefault();};
  const move=e=>{if(!sigDrawing)return;const p=pos(e);sigCtx.lineTo(p.x,p.y);sigCtx.stroke();sigHasInk=true;e.preventDefault();};
  const end=()=>{sigDrawing=false;};
  cv.addEventListener("mousedown",start);cv.addEventListener("mousemove",move);window.addEventListener("mouseup",end);
  cv.addEventListener("touchstart",start,{passive:false});cv.addEventListener("touchmove",move,{passive:false});cv.addEventListener("touchend",end);
}
function clearSig(){const cv=document.getElementById("sigPad");if(cv&&sigCtx){sigCtx.clearRect(0,0,cv.width,cv.height);sigHasInk=false;}}

/* 本機暫存前移除大型 base64（圖檔），避免 localStorage 爆量 */
function stripBig(c){return {...c,items:(c.items||[]).map(it=>{const o={...it};const n=(o.images&&o.images.length)||0;if(n){o.hasImage=true;o.imageCount=n;}o.images=[];o.image="";return o;})};}

async function doSubmit(items,signatureDataUrl,remitDataUrl){
  const c={
    caseNo:genCaseNo(f_store.value,f_date.value),applyDate:f_date.value,dept:"",region:STORE_REGION[f_store.value]||"",store:f_store.value,
    supervisor:supOfStore(f_store.value),phone:f_phone.value,
    items:items.map(r=>({...r,unitPrice:rowAmount(r)})),
    pos:{name:"",item:"",time:"",ticket:"",type:"",online:"",note:""},
    amount:items.reduce((a,r)=>a+rowAmount(r),0),
    status:0,quote:"",actual:"",adminNote:"",createdAt:new Date().toISOString()
  };
  if(API_URL){
    submitBtn.disabled=true;submitBtn.textContent="送出中…";
    try{
      const saved=await api("create",{case:{applyDate:c.applyDate,dept:c.dept,region:c.region,store:c.store,
        supervisor:c.supervisor,phone:c.phone,items:c.items,pos:c.pos,signature:signatureDataUrl,remit:remitDataUrl}});
      cases.unshift(saved);save();resetForm();refreshAll();   // saved 由後端回傳，圖檔已抽離，本機快取輕量
      toast("已送出申請（已存雲端）　"+saved.caseNo);
    }catch(e){
      console.warn("雲端送出失敗，暫存本機",e);cases.unshift(stripBig(c));
      if(!save()){cases.shift();toast("⚠ 雲端送出失敗，且本機空間已滿");}
      else{resetForm();refreshAll();toast("⚠ 雲端送出失敗，已暫存本機："+c.caseNo);}
    }finally{ submitBtn.disabled=false;submitBtn.textContent="送出申請"; }
    return;
  }
  cases.unshift(stripBig(c));
  if(!save()){cases.shift();toast("⚠ 本機儲存空間已滿");return;}
  resetForm();refreshAll();
  toast("已送出申請　"+c.caseNo);
}
resetBtn.addEventListener("click",resetForm);
function resetForm(){
  f_store.value="";f_phone.value="";f_date.value=today();
  itemRows=[blankRow()];renderItems();
}

/* ====== 清單 ====== */
let sortKey="createdAt",sortDir=-1;
[q_text,q_status,q_store].forEach(el=>el.addEventListener("input",renderList));
document.querySelectorAll("#caseTable th[data-sort]").forEach(th=>{
  th.addEventListener("click",()=>{const k=th.dataset.sort;sortDir=(sortKey===k)?-sortDir:1;sortKey=k;renderList()});
});
function filtered(){
  const q=q_text.value.trim().toLowerCase(),st=q_status.value,sv=q_store.value;
  return cases.filter(c=>{
    if(st!==""&&String(c.status)!==st)return false;
    if(sv&&c.store!==sv)return false;
    if(q){const blob=(c.caseNo+c.store+c.region+c.items.map(i=>i.item+i.content).join("")).toLowerCase();if(!blob.includes(q))return false}
    return true;
  }).sort((a,b)=>{let x=a[sortKey]||"",y=b[sortKey]||"";return x<y?-sortDir:x>y?sortDir:0;});
}
function itemSummary(c){
  const first=c.items[0]?c.items[0].item:"—";
  return esc(first)+(c.items.length>1?` 等 ${c.items.length} 項`:"");
}
function renderList(){
  const rows=filtered();
  if(!rows.length){caseBody.innerHTML=`<tr><td colspan="7"><div class="empty">尚無符合的申請案件</div></td></tr>`;return}
  caseBody.innerHTML=rows.map(c=>{
    const idx=cases.indexOf(c);
    return `<tr>
      <td><b>${esc(c.caseNo)}</b></td><td>${esc(c.applyDate)}</td><td>${esc(c.store)}</td>
      <td style="max-width:240px">${itemSummary(c)}</td>
      <td>${fmt$(c.amount)}</td>
      <td><span class="tag s${c.status}">${STATUS[c.status]}</span></td>
      <td><button class="btn sm ghost" onclick="openCase(${idx})">${role==="admin"?"處理":"檢視"}</button></td>
    </tr>`;
  }).join("");
}

/* ====== 案件詳情 / 處理 ====== */
let editItems=[];
function openCase(idx){
  const c=cases[idx];
  editItems=(role==="admin")?c.items.map(it=>Object.assign({},it)):[];  // 管理端可編輯的申請內容工作副本
  const itemsTableHtml=(arr)=>`<div class="scrollwrap" style="max-height:none;margin-bottom:14px"><table class="itemlist">
    <thead><tr><th>品項</th><th>數量</th><th>方案</th><th>選配</th><th>格式</th><th>運送</th><th>活動期間</th><th>內容</th></tr></thead>
    <tbody>${(arr||[]).map(it=>`<tr>
      <td><b>${esc(it.item)}</b></td><td>${esc(it.qty)}</td><td>${esc(it.plan||"—")}</td>
      <td>${esc(it.option||"—")}</td><td>${esc(it.format||"—")}</td><td>${esc(it.delivery||"—")}</td>
      <td>${esc(it.period||"—")}</td><td style="max-width:220px;white-space:pre-wrap">${esc(it.content||"—")}</td>
    </tr>`).join("")}</tbody></table></div>`;
  const itemsTbl=itemsTableHtml(c.items);
  // 原始送單內容對照（不可改）；比對核心欄位判斷是否已被修改
  const itemsCore=(a)=>JSON.stringify((a||[]).map(it=>({i:it.item,q:it.qty,p:it.plan,o:it.option,f:it.format,d:it.delivery,e:it.period,c:it.content})));
  const hasOrig=c.origItems&&c.origItems.length;
  const contentEdited=hasOrig&&itemsCore(c.items)!==itemsCore(c.origItems);
  const origSection=hasOrig?`<details style="margin:-4px 0 14px">
    <summary style="cursor:pointer;font-size:13px;color:var(--primary-dark);user-select:none">▸ 門市原始送單內容（對照用，永不改動）${contentEdited?' <span style="background:var(--warn);color:#fff;font-size:11px;padding:1px 8px;border-radius:10px">內容已被修改</span>':' <span style="color:var(--ok);font-size:11px">（與目前相同）</span>'}</summary>
    <div style="margin-top:8px">${itemsTableHtml(c.origItems)}</div></details>`:'';
  const pos=c.pos||{};
  const posSection=role==="admin"?`
    <div class="grid">
      <div><label>按鍵名稱</label><input id="m_pos_name" value="${esc(pos.name||'')}"></div>
      <div><label>品項</label><input id="m_pos_item" value="${esc(pos.item||'')}"></div>
      <div><label>活動時間</label><input id="m_pos_time" value="${esc(pos.time||'')}"></div>
      <div><label>票券期間</label><input id="m_pos_ticket" value="${esc(pos.ticket||'')}"></div>
      <div><label>POS類別</label><input id="m_pos_type" value="${esc(pos.type||'')}"></div>
      <div><label>線上點餐</label><select id="m_pos_online"><option value="">—</option><option ${pos.online==='是'?'selected':''}>是</option><option ${pos.online==='否'?'selected':''}>否</option></select></div>
      <div class="full"><label>備註</label><textarea id="m_pos_note">${esc(pos.note||'')}</textarea></div>
    </div>`:"";
  const adminFields=`
    <div class="grid">
      <div><label>處理進度</label>
        <select id="m_status" ${role!=="admin"?"disabled":""}>${STATUS.map((s,i)=>`<option value="${i}" ${c.status==i?"selected":""}>${s}</option>`).join("")}</select></div>
      <div><label>設計部報價</label><input id="m_quote" ${role!=="admin"?"disabled":""} value="${esc(c.quote)}" placeholder="例：1,220 元 / 份"></div>
      <div><label>實際金額</label><input id="m_actual" ${role!=="admin"?"disabled":""} value="${esc(c.actual)}" placeholder="結案金額"></div>
      <div class="full"><label>處理備註</label><textarea id="m_note" ${role!=="admin"?"disabled":""} placeholder="例：6/10 已轉設計部，預計 6/20 出貨">${esc(c.adminNote)}</textarea></div>
    </div>`;
  showModal(`<button class="close-x" onclick="closeModal()">×</button>
    <h2>${esc(c.caseNo)}　<span class="tag s${c.status}">${STATUS[c.status]}</span></h2>
    <div class="kv">
      <div class="k">門市</div><div>${esc(c.store)}（${esc(c.region)}）</div>
      <div class="k">負責督導</div><div>${esc(c.supervisor||supOfStore(c.store)||"—")}</div>
      <div class="k">申請日期</div><div>${esc(c.applyDate)}</div>
      <div class="k">聯絡電話</div><div>${esc(c.phone||"—")}</div>
      <div class="k">預估金額</div><div>${fmt$(c.amount)}</div>
    </div>
    <div class="sec-title"><span class="dot"></span>文宣輸出物（${c.items.length} 項）${role==="admin"?'<span style="font-size:11px;font-weight:400;color:var(--muted)">　可直接修改申請內容</span>':''}</div>
    ${role==="admin"?'<div id="caseItemsEdit"></div>':itemsTbl}
    ${origSection}
    <div id="attachWrap"></div>
    ${role==="admin"?`<div class="sec-title"><span class="dot"></span>POS 按鍵設定（內部）</div>${posSection}`:''}
    <div class="sec-title"><span class="dot"></span>處理進度（管理）</div>
    ${adminFields}
    ${role==="admin"?`<div class="btn-row"><button class="btn" onclick="saveCase(${idx})">儲存處理結果</button><button class="btn danger" onclick="delCase(${idx})">刪除案件</button></div>`
      :`<p class="hint" style="margin-top:10px">切換為「管理（總部）」角色才能更新處理進度。</p>`}
    <div class="sec-title" style="margin-top:18px"><span class="dot"></span>處理進度歷程</div>
    <div id="historyWrap"></div>`);
  if(role==="admin")renderCaseItemsEditor();
  loadAttachments(c);
  loadHistory(c);
}
/* ====== 管理端：編輯申請內容（品項）====== */
function ceCatOptions(sel){
  return CATALOG.map(c=>c.name).filter(n=>!(CATALOG.find(x=>x.name===n)||{}).hidden||n===sel)
    .map(n=>`<option ${n===sel?"selected":""}>${esc(n)}</option>`).join("");
}
function ceSelOpts(val,opts){return ["<option value=''>—</option>"].concat((opts||[]).map(o=>`<option ${val===o?"selected":""}>${esc(o)}</option>`)).join("");}
function renderCaseItemsEditor(){
  const wrap=document.getElementById("caseItemsEdit"); if(!wrap)return;
  wrap.innerHTML=editItems.map((it,i)=>`
    <div class="item-card">
      <span class="idx">品項 ${i+1}</span>
      ${editItems.length>1?`<button class="btn danger sm rm" type="button" onclick="ceRemove(${i})">移除</button>`:""}
      <div class="grid">
        <div class="full"><label>文宣品項</label><select onchange="ceSetItem(${i},this.value)"><option value="">— 選擇 —</option>${ceCatOptions(it.item)}</select></div>
        <div><label>數量</label><input value="${esc(it.qty||'')}" onchange="ceSet(${i},'qty',this.value)"></div>
        <div><label>設計／行銷方案</label><select onchange="ceSet(${i},'plan',this.value)">${ceSelOpts(it.plan,PLAN_OPTS)}</select></div>
        <div><label>選配方式</label><select onchange="ceSet(${i},'option',this.value)">${ceSelOpts(it.option,OPTION_OPTS)}</select></div>
        <div><label>檔案格式</label><select onchange="ceSet(${i},'format',this.value)">${ceSelOpts(it.format,FORMAT_OPTS)}</select></div>
        <div><label>運送方式</label><select onchange="ceSet(${i},'delivery',this.value)">${ceSelOpts(it.delivery,DELIVERY_OPTS)}</select></div>
        <div class="full"><label>活動期間</label><input value="${esc(it.period||'')}" onchange="ceSet(${i},'period',this.value)"></div>
        <div class="full"><label>申請文宣內容</label><textarea onchange="ceSet(${i},'content',this.value)">${esc(it.content||'')}</textarea></div>
      </div>
    </div>`).join("")+
    `<div class="btn-row" style="margin-top:0"><button class="btn sec sm" type="button" onclick="ceAdd()">＋ 新增品項</button></div>`;
}
function ceSet(i,k,v){ if(editItems[i])editItems[i][k]=v; }
function ceSetItem(i,name){ const cat=CATALOG.find(x=>x.name===name); editItems[i].item=name; if(cat){ if(!editItems[i].qty)editItems[i].qty=cat.baseQty; editItems[i].format=cat.format||editItems[i].format; } renderCaseItemsEditor(); }
function ceRemove(i){ editItems.splice(i,1); if(!editItems.length)editItems.push({item:"",qty:"",plan:"",option:"自費選購",format:"印刷稿",delivery:"宅配",period:"",content:""}); renderCaseItemsEditor(); }
function ceAdd(){ editItems.push({item:"",qty:"",plan:"",option:"自費選購",format:"印刷稿",delivery:"宅配",period:"",content:""}); renderCaseItemsEditor(); }
/* 載入並顯示案件附件（門市上傳圖檔／電子簽名）；getAttachments 為管理動作 */
async function loadAttachments(c){
  const wrap=document.getElementById("attachWrap");
  if(!wrap)return;
  if(!API_URL||role!=="admin"){wrap.innerHTML="";return;}
  wrap.innerHTML=`<div class="hint" style="margin:8px 0">載入附件中…</div>`;
  try{
    const atts=await api("getAttachments",{caseNo:c.caseNo});
    const imgs=(atts||[]).filter(a=>a.kind==="item").sort((a,b)=>a.idx-b.idx);
    const sign=(atts||[]).find(a=>a.kind==="sign");
    const remit=(atts||[]).find(a=>a.kind==="remit");
    const src=a=>a.url||a.dataUrl||"";
    const big=a=>a.fileId?('https://drive.google.com/thumbnail?id='+a.fileId+'&sz=w2000'):(a.dataUrl||"");
    const cell=(a,w)=>`<div style="position:relative;display:inline-block">
        <img src="${src(a)}" referrerpolicy="no-referrer" onclick="openLightbox('${big(a)}')"
             onerror="if(this.dataset.fb){this.style.opacity=.3}else if('${a.fileId||''}'){this.dataset.fb=1;this.src='https://lh3.googleusercontent.com/d/${a.fileId||''}=w1600'}"
             style="max-width:${w}px;max-height:${w}px;border:1px solid var(--line);border-radius:8px;display:block;cursor:zoom-in;background:#fff">
        ${a.fileId?`<button class="btn danger sm" type="button" title="刪除此附件" onclick="delAttachment('${esc(c.caseNo)}','${a.fileId}')" style="position:absolute;top:4px;right:4px;padding:2px 8px">✕</button>`:""}
      </div>`;
    let html="";
    html+=`<div class="sec-title"><span class="dot"></span>門市上傳附件（${imgs.length}）</div>
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:8px">${imgs.map(a=>cell(a,180)).join("")||'<span class="hint">（無）</span>'}</div>
      <div style="margin-bottom:6px"><input type="file" accept="image/*" multiple onchange="addAttachmentFiles('${esc(c.caseNo)}',this)">
        <span style="font-size:11px;color:var(--muted)">管理者可補上傳參考圖／匯款明細（可多張，保留清晰畫質）</span></div>`;
    if(remit){ html+=`<div class="sec-title"><span class="dot"></span>匯款明細</div><div style="margin-bottom:6px">${cell(remit,320)}</div>`; }
    if(sign){ html+=`<div class="sec-title" style="margin-top:12px"><span class="dot"></span>申請人電子簽名</div><div>${cell(sign,320)}</div>`; }
    wrap.innerHTML=html;
  }catch(e){ console.warn("附件載入失敗",e); wrap.innerHTML=`<div class="hint" style="color:var(--danger)">附件載入失敗</div>`; }
}
/* 管理端：附件刪除／新增 */
function reloadAttachments(caseNo){ const c=cases.find(x=>x.caseNo===caseNo); if(c)loadAttachments(c); }
async function delAttachment(caseNo,ref){
  if(!confirm("確定刪除這張附件？此動作無法復原。"))return;
  try{ await api("deleteAttachment",{caseNo:caseNo,ref:ref}); toast("已刪除附件"); reloadAttachments(caseNo); }
  catch(e){ toast("⚠ 刪除失敗："+e.message); }
}
async function addAttachmentFiles(caseNo,el){
  const files=el.files?Array.from(el.files):[]; if(!files.length)return;
  toast("上傳中…（"+files.length+" 張）");
  try{
    for(const f of files){ if(!/^image\//.test(f.type)){toast("略過非圖片："+f.name);continue;}
      const data=await fileToCompressedDataUrl(f,1800,0.85);
      await api("addAttachment",{caseNo:caseNo,kind:"item",idx:0,dataUrl:data});
    }
    el.value=""; toast("已新增附件"); reloadAttachments(caseNo);
  }catch(e){ console.warn("上傳失敗",e); toast("⚠ 上傳失敗："+e.message); }
}
/* 處理進度歷程（每次狀態變更一筆，時間軸顯示）；caseHistory 為管理動作 */
function fmtTime(iso){
  if(!iso)return"";
  try{const d=new Date(iso);if(isNaN(d))return esc(iso);
    const p=n=>String(n).padStart(2,"0");
    return `${d.getFullYear()}/${p(d.getMonth()+1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }catch(e){return esc(iso);}
}
async function loadHistory(c){
  const wrap=document.getElementById("historyWrap");
  if(!wrap)return;
  if(!API_URL||role!=="admin"){wrap.innerHTML=`<div class="hint">切換為「管理（總部）」角色可檢視完整進度歷程。</div>`;return;}
  wrap.innerHTML=`<div class="hint" style="margin:6px 0">載入歷程中…</div>`;
  try{
    const hist=await api("caseHistory",{caseNo:c.caseNo});
    if(!hist||!hist.length){wrap.innerHTML=`<div class="hint">尚無歷程記錄（此案件在歷程功能上線前建立）。</div>`;return;}
    wrap.innerHTML=`<div style="padding-left:4px">`+
      hist.map((h,i)=>{
        const last=i===hist.length-1;
        const isNote=Number(h.status)<0;   // status=-1＝內容修改等備註
        const badge=isNote
          ? `<span style="font-size:12.5px;color:#8a6d1e">${esc(h.label||'')}</span>`
          : `<span class="tag s${h.status}">${esc(h.label||STATUS[h.status]||'')}</span>`;
        return `<div style="display:flex;gap:10px;align-items:flex-start">
          <div style="display:flex;flex-direction:column;align-items:center;align-self:stretch">
            <div style="width:11px;height:11px;border-radius:50%;background:${isNote?'#e0b84a':(last?'var(--primary)':'#b8d4c0')};margin-top:5px;flex:0 0 auto"></div>
            ${!last?'<div style="width:2px;flex:1;min-height:20px;background:#dde5e0"></div>':''}
          </div>
          <div style="padding-bottom:10px">
            ${badge}
            <span style="font-size:12px;color:var(--muted);margin-left:8px">${fmtTime(h.at)}</span>
          </div>
        </div>`;
      }).join("")+`</div>`;
  }catch(e){ console.warn("歷程載入失敗",e); wrap.innerHTML=`<div class="hint" style="color:var(--danger)">歷程載入失敗</div>`; }
}
async function saveCase(idx){
  const c=cases[idx];
  c.status=+document.getElementById("m_status").value;
  c.quote=document.getElementById("m_quote").value;
  c.actual=document.getElementById("m_actual").value;
  c.adminNote=document.getElementById("m_note").value;
  const gv=id=>document.getElementById(id)?.value||"";
  let itemsPayload;
  if(role==="admin"){
    c.pos={name:gv("m_pos_name"),item:gv("m_pos_item"),time:gv("m_pos_time"),
           ticket:gv("m_pos_ticket"),type:gv("m_pos_type"),online:gv("m_pos_online"),note:gv("m_pos_note")};
    // 管理端編輯後的申請內容：保留原有旗標（hasImage/imageCount），重算單項金額
    itemsPayload=editItems.filter(it=>it.item).map(it=>({...it,unitPrice:rowAmount(it)}));
    c.items=itemsPayload;
    c.amount=itemsPayload.reduce((a,it)=>a+Number(it.unitPrice||0),0);
  }
  if(API_URL){
    try{ await api("update",{caseNo:c.caseNo,status:c.status,quote:c.quote,actual:c.actual,adminNote:c.adminNote,pos:c.pos,items:itemsPayload}); }
    catch(e){ console.warn("雲端更新失敗",e); toast("⚠ 雲端更新失敗，已暫存本機"); }
  }
  if(!save()){toast("⚠ 儲存失敗：本機空間已滿");return;}
  refreshAll();closeModal();toast("已更新　"+c.caseNo);
}
async function delCase(idx){
  const c=cases[idx];
  if(!confirm("確定刪除案件 "+c.caseNo+"？此動作無法復原。"))return;
  if(API_URL){
    try{ await api("delete",{caseNo:c.caseNo}); }
    catch(e){ toast("⚠ 雲端刪除失敗："+e.message); return; }
  }
  cases.splice(idx,1);save();refreshAll();closeModal();toast("已刪除　"+c.caseNo);
}

/* ====== 儀表板 ====== */
function dashData(){const f=d_from.value,t=d_to.value;return cases.filter(c=>(!f||c.applyDate>=f)&&(!t||c.applyDate<=t));}
function renderDash(){
  const data=dashData();
  const done=data.filter(c=>c.status===2).length;
  const pend=data.filter(c=>c.status===0).length;
  const amt=data.reduce((a,c)=>a+(c.amount||0),0);
  statRow.innerHTML=`
    <div class="stat"><div class="n">${data.length}</div><div class="l">申請案件總數</div></div>
    <div class="stat warn"><div class="n">${pend}</div><div class="l">待處理</div></div>
    <div class="stat ok"><div class="n">${done}</div><div class="l">已印刷</div></div>
    <div class="stat"><div class="n">${new Set(data.map(c=>c.store)).size}</div><div class="l">申請門市數</div></div>
    <div class="stat accent"><div class="n">${fmt$(amt)}</div><div class="l">預估金額合計</div></div>`;
  drawCharts(data);
}
function countBy(arr,key){const m={};arr.forEach(c=>{const k=key(c)||"未分類";m[k]=(m[k]||0)+1});return m}
function mkChart(id,type,labels,vals,opts={}){
  if(charts[id])charts[id].destroy();
  const palette=["#2c6e49","#d68c45","#4a90d9","#c0392b","#8e44ad","#16a085","#e08e0b","#5d6d7e","#27ae60","#cb4335","#2980b9","#7d3c98"];
  charts[id]=new Chart(document.getElementById(id),{type,
    data:{labels,datasets:[{data:vals,backgroundColor:type==="line"?"rgba(44,110,73,.15)":palette,borderColor:"#2c6e49",borderWidth:type==="line"?2:0,fill:type==="line",tension:.3}]},
    options:Object.assign({responsive:true,maintainAspectRatio:false,plugins:{legend:{display:type==="doughnut"||type==="pie",position:"right",labels:{font:{size:11}}}}},opts)});
}
function drawCharts(data){
  if(typeof Chart==="undefined"){toast("⚠ 圖表元件載入失敗，請確認網路");return;}
  const byStore=countBy(data,c=>c.store);
  const top=Object.entries(byStore).sort((a,b)=>b[1]-a[1]).slice(0,12);
  mkChart("chStore","bar",top.map(x=>x[0]),top.map(x=>x[1]),{indexAxis:"y",plugins:{legend:{display:false}}});
  const itemCnt={};data.forEach(c=>c.items.forEach(it=>{const k=it.item||"未分類";itemCnt[k]=(itemCnt[k]||0)+1}));
  const ti=Object.entries(itemCnt).sort((a,b)=>b[1]-a[1]).slice(0,10);
  mkChart("chItem","bar",ti.map(x=>x[0].slice(0,14)),ti.map(x=>x[1]),{indexAxis:"y",plugins:{legend:{display:false}}});
  const byMonth=countBy(data,c=>(c.applyDate||"").slice(0,7));
  const mk=Object.keys(byMonth).sort();
  mkChart("chMonth","line",mk,mk.map(k=>byMonth[k]),{plugins:{legend:{display:false}}});
  const byStatus=countBy(data,c=>STATUS[c.status]);
  mkChart("chStatus","doughnut",Object.keys(byStatus),Object.values(byStatus));
}
applyDash.addEventListener("click",renderDash);
resetDash.addEventListener("click",()=>{d_from.value="";d_to.value="";renderDash()});

/* ====== 匯出 CSV ====== */
exportBtn.addEventListener("click",()=>{
  const head=["案號","申請日","區域","門市","聯絡電話","品項","數量","設計方案","選配方式","檔案格式","運送方式","活動期間","申請文宣內容","預估金額","狀態","設計部報價","實際金額","處理備註"];
  const rows=[];
  filtered().forEach(c=>c.items.forEach(it=>rows.push([
    c.caseNo,c.applyDate,c.region,c.store,c.phone,
    it.item,it.qty,it.plan,it.option,it.format,it.delivery,it.period,it.content,
    it.unitPrice,STATUS[c.status],c.quote,c.actual,c.adminNote])));
  const csv="﻿"+[head,...rows].map(r=>r.map(x=>`"${String(x==null?"":x).replace(/"/g,'""')}"`).join(",")).join("\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
  a.download="文宣申請_"+today()+".csv";a.click();
});

/* ====== LINE 設定 ====== */
(function(){const c=getLineCfg();
  line_token.value=c.token||"";line_to.value=c.to||"";
  line_link.value=c.link||ADMIN_SITE;
  line_tpl.value=(c.template!==undefined&&c.template!=="")?c.template:DEFAULT_LINE_TPL;
})();
/* 進「通知設定」時從雲端載入現值（不含 token），避免瀏覽器 localStorage 舊值覆蓋雲端設定 */
let lineCfgLoaded=false;
async function loadLineCfg(){
  if(!API_URL||role!=="admin"||lineCfgLoaded)return;
  try{
    const c=await api("getLine");
    if(c&&typeof c==="object"){
      line_to.value=c.to||"";
      line_link.value=c.link||ADMIN_SITE;
      if(c.template!==undefined&&c.template!=="")line_tpl.value=c.template;
      lineCfgLoaded=true;
    }
  }catch(e){ console.warn("LINE 設定載入失敗",e); }
}
saveLine.addEventListener("click",async ()=>{
  const cfg={token:line_token.value.trim(),to:line_to.value.trim(),link:line_link.value.trim(),template:line_tpl.value};
  setLineCfg(cfg);
  if(API_URL){
    saveLine.disabled=true;
    try{ await api("saveLine",{line:cfg}); toast("LINE 設定已儲存（雲端，全門市共用）"); }
    catch(e){ toast("⚠ 雲端儲存失敗："+e.message); }
    finally{ saveLine.disabled=false; }
  }else{ toast("LINE 設定已儲存（本機）"); }
});
testLine.addEventListener("click",async ()=>{
  const cfg={token:line_token.value.trim(),to:line_to.value.trim(),link:line_link.value.trim(),template:line_tpl.value};
  setLineCfg(cfg);
  if(!cfg.token){toast("請先填寫 Channel access token");return;}
  if(API_URL){
    testLine.disabled=true;
    try{
      const r=await api("pushTest",{line:cfg});
      if(r.code===200) toast("✅ 已發送測試廣播，請看 LINE（需先把官方帳號加為好友）");
      else toast("⚠ 測試失敗（HTTP "+r.code+"）："+String(r.detail||"").slice(0,80));
    }catch(e){toast("⚠ 測試失敗："+e.message);}
    finally{testLine.disabled=false;}
  }else{ toast("尚未設定雲端後端，無法發送"); }
});

/* ====== Email 通知設定（狀態轉設計中自動寄信；設定存雲端）====== */
const DEFAULT_EMAIL_SUBJECT="【文宣申請】{caseNo} {store} 已進入設計中";
const DEFAULT_EMAIL_TPL=
  "文宣申請案件已進入「設計中」，請設計／相關部門接手：\n\n"+
  "案號：{caseNo}\n門市：{store}（{region}）\n申請日期：{applyDate}\n"+
  "聯絡電話：{phone}\n申請品項：\n{items}\n預估金額：{amount}\n"+
  "設計部報價：{quote}\n處理備註：{adminNote}\n連結：{link}";
let emailCfgLoaded=false;
async function loadEmailCfg(){
  if(!API_URL||role!=="admin"||emailCfgLoaded)return;
  try{
    const c=await api("getEmail");
    if(c&&typeof c==="object"){
      email_enabled.checked=!!c.enabled;
      email_to.value=c.to||"";
      email_subject.value=c.subject||DEFAULT_EMAIL_SUBJECT;
      email_tpl.value=(c.template!==undefined&&c.template!=="")?c.template:DEFAULT_EMAIL_TPL;
      SUP_EMAILS=(c.supEmails&&typeof c.supEmails==="object")?c.supEmails:{};
      const se=document.getElementById("email_sup_enabled");
      if(se){
        se.checked=(c.supEnabled!==false);
        document.getElementById("email_printed_enabled").checked=(c.printedEnabled!==false);
        document.getElementById("email_printed_dept").checked=!!c.printedToDept;
        document.getElementById("email_printed_subject").value=c.printedSubject||DEFAULT_PRINTED_SUBJECT;
        document.getElementById("email_printed_tpl").value=(c.printedTemplate!==undefined&&c.printedTemplate!=="")?c.printedTemplate:DEFAULT_PRINTED_TPL;
      }
      emailCfgLoaded=true;
    }
  }catch(e){ console.warn("Email 設定載入失敗",e); }
}
function emailFormCfg(){
  const cfg={enabled:email_enabled.checked,to:email_to.value.trim(),
    subject:email_subject.value.trim()||DEFAULT_EMAIL_SUBJECT,template:email_tpl.value};
  // 督導通知（卡片以 JS 注入，存在才帶）
  if(document.getElementById("email_sup_enabled")){
    cfg.supEnabled     = document.getElementById("email_sup_enabled").checked;
    cfg.printedEnabled = document.getElementById("email_printed_enabled").checked;
    cfg.printedToDept  = document.getElementById("email_printed_dept").checked;
    cfg.printedSubject = document.getElementById("email_printed_subject").value.trim()||DEFAULT_PRINTED_SUBJECT;
    cfg.printedTemplate= document.getElementById("email_printed_tpl").value;
    cfg.supEmails      = collectSupEmails();
  }
  return cfg;
}

/* ====== 督導 Email 通知（設計中／已印刷 通知對應門市督導；卡片以 JS 注入 view-line）====== */
const DEFAULT_PRINTED_SUBJECT="【文宣印刷完成】{caseNo} {store}";
const DEFAULT_PRINTED_TPL=
  "{supervisor} 督導您好，以下門市的文宣申請已完成印刷：\n\n"+
  "案號：{caseNo}\n門市：{store}（{region}）\n申請日期：{applyDate}\n"+
  "申請品項：\n{items}\n設計部報價：{quote}\n狀態：已印刷 ✅\n連結：{link}";
let SUP_EMAILS={}; let supEmailNames=[];
function ensureSupEmailCard(){
  if(document.getElementById("supEmailCard"))return;
  const view=document.getElementById("view-line"); if(!view)return;
  const card=document.createElement("div"); card.className="card"; card.id="supEmailCard";
  card.innerHTML=`<h2>督導 Email 通知（設計中／已印刷 通知對應門市督導）</h2>
    <p class="hint">每家門市的<b>負責督導</b>在「品項/選項管理 → 門市清單管理」設定（主檔同步自 Google 試算表「門店資料表_UG」）。案件轉<b>設計中</b>或<b>已印刷</b>時，系統會依申請門市自動找到督導，寄信到下方對應信箱；督導沒填信箱就不寄。</p>
    <div class="grid">
      <div class="full"><label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" id="email_sup_enabled" style="width:auto;height:16px">轉「設計中」時，一併通知該門市督導</label></div>
      <div class="full"><label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" id="email_printed_enabled" style="width:auto;height:16px">轉「已印刷」時，寄信通知該門市督導</label></div>
      <div class="full"><label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" id="email_printed_dept" style="width:auto;height:16px">「已印刷」的信同時副知上方「相關部門收件信箱」</label></div>
      <div class="full"><label>「已印刷」主旨範本</label><input type="text" id="email_printed_subject" placeholder="${esc(DEFAULT_PRINTED_SUBJECT)}"></div>
      <div class="full"><label>「已印刷」內容範本</label>
        <textarea id="email_printed_tpl" style="min-height:170px;font-family:inherit"></textarea>
        <div class="pill-note" style="margin-top:8px">可用代入欄位：<code>{caseNo}</code> 案號 · <code>{store}</code> 門市 · <code>{region}</code> 區域 · <code>{supervisor}</code> 督導 · <code>{applyDate}</code> 申請日期 · <code>{phone}</code> 聯絡電話 · <code>{items}</code> 申請品項摘要 · <code>{amount}</code> 預估金額 · <code>{quote}</code> 設計部報價 · <code>{adminNote}</code> 處理備註 · <code>{status}</code> 狀態 · <code>{link}</code> 連結。</div>
      </div>
    </div>
    <div class="sec-title"><span class="dot"></span>督導信箱對照</div>
    <div id="supEmailBody"></div>
    <div class="btn-row"><button class="btn" type="button" onclick="document.getElementById('saveEmail').click()">儲存督導通知設定</button></div>`;
  view.appendChild(card);
}
function renderSupEmailTable(){
  const body=document.getElementById("supEmailBody"); if(!body)return;
  const counts={};
  Object.keys(STORE_SUP).forEach(k=>{const v=String(STORE_SUP[k]||"").trim();if(v)counts[v]=(counts[v]||0)+1;});
  supEmailNames=Object.keys(counts).sort();
  // 已設過信箱但目前沒門市掛在他名下的督導也保留顯示
  Object.keys(SUP_EMAILS).forEach(k=>{if(k&&supEmailNames.indexOf(k)<0)supEmailNames.push(k);});
  if(!supEmailNames.length){
    body.innerHTML='<p class="hint">尚未設定任何門市督導。請到「品項/選項管理 → 門市清單管理」填寫督導，或按該頁的「🔄 從門店資料表同步」。</p>';
    return;
  }
  body.innerHTML=supEmailNames.map((nm,i)=>`
    <div style="display:grid;grid-template-columns:150px 1fr auto;gap:8px;align-items:center;margin-bottom:8px">
      <div style="font-size:13px">${esc(nm)}<span style="color:var(--muted);font-size:11px">　${counts[nm]||0} 家</span></div>
      <input id="supmail_${i}" type="text" value="${esc(SUP_EMAILS[nm]||"")}" placeholder="例：${esc(nm)}@company.com（可多個，逗號分隔）" style="padding:7px 11px;border:1px solid #cdd5d0;border-radius:7px;font-size:13px">
      <button class="btn sec sm" type="button" onclick="testSupEmail(${i})">測試</button>
    </div>`).join("");
}
function collectSupEmails(){
  const out={};
  supEmailNames.forEach((nm,i)=>{
    const el=document.getElementById("supmail_"+i);
    out[nm]=el?el.value.trim():(SUP_EMAILS[nm]||"");
  });
  SUP_EMAILS=out;
  return out;
}
async function testSupEmail(i){
  const nm=supEmailNames[i], el=document.getElementById("supmail_"+i);
  const to=el?el.value.trim():"";
  if(!to){toast("請先填寫 "+nm+" 的信箱");return;}
  if(!API_URL){toast("尚未設定雲端後端，無法發送");return;}
  try{
    const r=await api("emailTest",{to:to,who:nm});
    if(r&&r.ok)toast("✅ 已寄出測試信至："+r.to);
    else toast("⚠ 測試失敗："+String((r&&r.detail)||"請確認信箱"));
  }catch(e){ toast("⚠ 測試失敗："+e.message); }
}
saveEmail.addEventListener("click",async()=>{
  const cfg=emailFormCfg();
  if(cfg.enabled&&!cfg.to){toast("已啟用，請先填寫收件信箱");return;}
  if(!API_URL){toast("尚未設定雲端後端，無法儲存");return;}
  saveEmail.disabled=true;
  try{ await api("saveEmail",{email:cfg}); toast("Email 通知設定已儲存（雲端，全門市共用）"); }
  catch(e){ toast("⚠ 雲端儲存失敗："+e.message); }
  finally{ saveEmail.disabled=false; }
});
testEmail.addEventListener("click",async()=>{
  const cfg=emailFormCfg();
  if(!cfg.to){toast("請先填寫收件信箱");return;}
  if(!API_URL){toast("尚未設定雲端後端，無法發送");return;}
  testEmail.disabled=true;
  try{
    const r=await api("emailTest",{email:cfg});
    if(r&&r.ok)toast("✅ 已寄出測試信至："+r.to);
    else toast("⚠ 測試失敗："+String((r&&r.detail)||"請確認收件信箱"));
  }catch(e){ toast("⚠ 測試失敗："+e.message+"（首次需在 Apps Script 執行 authorizeEmail 授權）"); }
  finally{ testEmail.disabled=false; }
});

/* ====== 管理密碼設定 ====== */
let adminPassList=[];
function maskPw(pw){const s=String(pw);return s.length<=2?s:s.slice(0,2)+"●".repeat(Math.min(s.length-2,6));}
function renderPasswordList(){
  const wrap=document.getElementById("pwListWrap");if(!wrap)return;
  if(!adminPassList.length){wrap.innerHTML=`<p style="color:var(--muted);font-size:13px">尚無密碼記錄（使用預設密碼登入中）</p>`;return;}
  wrap.innerHTML=`<div style="display:flex;flex-wrap:wrap;gap:8px">`+
    adminPassList.map((pw,i)=>`<span style="background:#eef5f0;border:1px solid #b8d4c0;border-radius:20px;padding:5px 14px;font-size:13px;display:inline-flex;align-items:center;gap:8px;font-family:monospace">
      ${esc(maskPw(pw))}
      <button type="button" onclick="deletePw(${i})" style="background:none;border:none;cursor:pointer;color:${adminPassList.length>1?"#c0392b":"#bbb"};font-size:16px;padding:0;line-height:1;font-weight:700" ${adminPassList.length<=1?"disabled title='至少保留一組密碼'":""}>×</button>
    </span>`).join("")+`</div>`;
}
async function loadPasswordList(){
  if(!API_URL)return;
  try{const list=await api("listPasswords");if(Array.isArray(list)){adminPassList=list;renderPasswordList();}}
  catch(e){console.warn("密碼清單載入失敗",e);}
}
async function deletePw(i){
  if(adminPassList.length<=1){toast("至少保留一組密碼");return;}
  if(!confirm("確定刪除這組密碼？"))return;
  const pw=adminPassList[i];
  try{await api("deletePassword",{password:pw});adminPassList.splice(i,1);renderPasswordList();toast("密碼已刪除");}
  catch(e){toast("⚠ 刪除失敗："+e.message);}
}
addPwBtn.addEventListener("click",async()=>{
  const inp=document.getElementById("newPwInput");
  const pw=inp?inp.value.trim():"";
  if(!pw){toast("請輸入新密碼");return;}
  if(pw.length<4){toast("密碼長度至少 4 碼");return;}
  addPwBtn.disabled=true;
  try{
    await api("addPassword",{password:pw});
    adminPassList.push(pw);renderPasswordList();
    if(inp)inp.value="";toast("密碼已新增");
  }catch(e){toast("⚠ 新增失敗："+e.message);}
  finally{addPwBtn.disabled=false;}
});

/* ====== 品項/選項管理 ====== */
let catalogEdit=[];
let optEdit={};
const CE_FORMAT_OPTS=["印刷稿","電子稿","給檔"];

function initOptEdit(){
  optEdit={plan:[...PLAN_OPTS],option:[...OPTION_OPTS],format:[...FORMAT_OPTS],delivery:[...DELIVERY_OPTS]};
}
function catSyncFromDom(){
  document.querySelectorAll(".ce-inp").forEach(el=>{
    const i=+el.dataset.i,k=el.dataset.k;
    if(i<catalogEdit.length) catalogEdit[i][k]=k==="price"?(+el.value||0):el.value;
  });
}
function renderCatalogEditor(){
  const tbody=document.getElementById("catEditBody");
  if(!tbody)return;
  tbody.innerHTML=catalogEdit.map((c,i)=>`<tr style="${c.hidden?'opacity:.5;background:#f6f7f6':''}">
    <td><input class="ce-inp" data-i="${i}" data-k="name" value="${esc(c.name)}" style="min-width:160px">${c.hidden?'<span style="margin-left:6px;font-size:11px;color:var(--muted)">（已隱藏）</span>':''}</td>
    <td><input class="ce-inp" data-i="${i}" data-k="baseQty" value="${esc(c.baseQty||"")}" style="width:78px"></td>
    <td><input class="ce-inp" data-i="${i}" data-k="price" type="number" value="${c.price||0}" style="width:75px"></td>
    <td><input class="ce-inp" data-i="${i}" data-k="ship" value="${esc(c.ship||"")}" style="width:85px"></td>
    <td><input class="ce-inp" data-i="${i}" data-k="design" value="${esc(c.design||"")}" style="width:100px"></td>
    <td><input class="ce-inp" data-i="${i}" data-k="print" value="${esc(c.print||"")}" style="width:95px"></td>
    <td><select class="ce-inp" data-i="${i}" data-k="format" style="width:90px">${CE_FORMAT_OPTS.map(o=>`<option ${c.format===o?"selected":""}>${o}</option>`).join("")}</select></td>
    <td><button class="btn ${c.hidden?'sec':'ghost'} sm" type="button" onclick="catToggleHide(${i})">${c.hidden?'顯示':'隱藏'}</button></td>
  </tr>`).join("");
}
function catToggleHide(i){catSyncFromDom();catalogEdit[i].hidden=!catalogEdit[i].hidden;renderCatalogEditor();}
catAddBtn.addEventListener("click",()=>{
  catSyncFromDom();
  catalogEdit.push({name:"",baseQty:"",price:0,ship:"—",design:"",print:"",format:"印刷稿",hidden:false});
  renderCatalogEditor();
});
saveCatalogBtn.addEventListener("click",async()=>{
  if(API_URL&&!catalogLoaded){toast("⚠ 品項尚未從雲端載入完成，請稍候再儲存（避免覆蓋現有隱藏設定）");return;}
  catSyncFromDom();
  const list=catalogEdit.filter(c=>String(c.name||"").trim());
  if(!list.length){toast("請至少保留一個品項");return;}
  CATALOG=list.map(c=>({...c,price:+c.price||0}));
  catalogEdit=CATALOG.map(c=>({...c}));
  renderItems();renderCatalogEditor();
  if(API_URL){
    saveCatalogBtn.disabled=true;
    try{await api("saveCatalog",{catalog:CATALOG});toast("品項清單已儲存（雲端）");}
    catch(e){toast("⚠ 儲存失敗："+e.message);}
    finally{saveCatalogBtn.disabled=false;}
  }else{toast("品項清單已儲存（本機）");}
});

function renderOptionEditor(){
  const body=document.getElementById("optEditBody");
  if(!body)return;
  const groups=[
    {key:"plan",label:"設計／行銷方案"},
    {key:"option",label:"選配方式"},
    {key:"format",label:"檔案格式"},
    {key:"delivery",label:"運送方式"}
  ];
  body.innerHTML=groups.map(g=>`
    <div style="margin-bottom:20px">
      <div class="sec-title" style="margin-bottom:8px"><span class="dot"></span>${g.label}</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
        ${(optEdit[g.key]||[]).map((o,i)=>`<span style="background:#eef5f0;border:1px solid #b8d4c0;border-radius:20px;padding:4px 14px 4px 14px;font-size:13px;display:inline-flex;align-items:center;gap:6px">${esc(o)}<button type="button" onclick="optRm('${g.key}',${i})" style="background:none;border:none;cursor:pointer;color:#c0392b;font-size:15px;padding:0;line-height:1;font-weight:700">×</button></span>`).join("")}
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <input id="optIn_${g.key}" placeholder="輸入新選項後按新增…" style="flex:1;padding:8px 11px;border:1px solid #cdd5d0;border-radius:7px;font-size:13px;font-family:inherit">
        <button class="btn sec sm" type="button" onclick="optAdd('${g.key}')">＋ 新增</button>
      </div>
    </div>`).join("");
}
function optRm(key,i){optEdit[key].splice(i,1);renderOptionEditor();}
function optAdd(key){
  const inp=document.getElementById("optIn_"+key);
  const v=(inp?inp.value:"").trim();
  if(!v)return;
  if(!optEdit[key])optEdit[key]=[];
  optEdit[key].push(v);
  if(inp)inp.value="";
  renderOptionEditor();
}
saveOptsBtn.addEventListener("click",async()=>{
  PLAN_OPTS=[...(optEdit.plan||[])];
  OPTION_OPTS=[...(optEdit.option||[])];
  FORMAT_OPTS=[...(optEdit.format||[])];
  DELIVERY_OPTS=[...(optEdit.delivery||[])];
  renderItems();
  if(API_URL){
    saveOptsBtn.disabled=true;
    try{await api("saveOptions",{options:optEdit});toast("選項設定已儲存（雲端，全門市共用）");}
    catch(e){toast("⚠ 儲存失敗："+e.message);}
    finally{saveOptsBtn.disabled=false;}
  }else{toast("選項設定已儲存（本機）");}
});

/* ====== 門市清單管理（管理頁；卡片以 JS 注入 view-optmgr，門市/管理兩頁共用 app.js）======
   storeEdit 結構：[[區域,[[門市,督導],...]],...]；門市／督導主檔＝Google 試算表「門店資料表_UG」，可按「從門店資料表同步」拉取 */
let storeEdit=[];
function initStoreEdit(){ storeEdit=STORE_GROUPS.map(g=>[g[0],g[1].map(s=>[s,supOfStore(s)])]); }
function ensureStoreMgrCard(){
  if(document.getElementById("storeMgrCard"))return;
  const view=document.getElementById("view-optmgr"); if(!view)return;
  const card=document.createElement("div");
  card.className="card"; card.id="storeMgrCard";
  card.innerHTML=`<h2>門市清單管理（含負責督導）</h2>
    <p class="hint">新增／調整門市、所屬區域與<b>負責督導</b>（區域用於申請時自動帶入；督導決定「設計中／已印刷」通知寄給誰）。× 刪除、填入後按「＋ 新增門市」；改完按「儲存門市清單」全門市共用。</p>
    <div class="pill-note">門市與督導的<b>主檔是 Google 試算表「門店資料表_UG」</b>（全公司共用，三套系統同一份）：在該表新增門市／改督導後，按下方「🔄 從門店資料表同步」即可拉取，<b>並會同時更新修繕進度系統與門市物料異常回報系統</b>。同步<b>只新增與更新，不會刪掉</b>這裡手動加的門市；主檔沒填督導的門市，這裡手動填的值會保留。<span id="storeSyncAt"></span></div>
    <div id="storeEditBody"></div>
    <div class="btn-row" style="margin-top:6px">
      <button class="btn sec sm" type="button" onclick="storeAddRegion()">＋ 新增區域</button>
      <button class="btn sec sm" id="syncStoreBtn" type="button" onclick="syncStoresNow()">🔄 從門店資料表同步</button>
      <button class="btn" type="button" onclick="saveStores()">儲存門市清單</button>
    </div>
    <datalist id="supNameList"></datalist>`;
  view.appendChild(card);
}
/* 結構變更前，先把畫面上各輸入框的值同步回 storeEdit，避免未失焦的編輯遺失 */
function storeSyncRegions(){
  document.querySelectorAll(".st-region").forEach(el=>{const i=+el.dataset.i;if(i<storeEdit.length)storeEdit[i][0]=el.value;});
  document.querySelectorAll(".st-name").forEach(el=>{const i=+el.dataset.i,j=+el.dataset.j;if(storeEdit[i]&&storeEdit[i][1][j])storeEdit[i][1][j][0]=el.value;});
  document.querySelectorAll(".st-sup").forEach(el=>{const i=+el.dataset.i,j=+el.dataset.j;if(storeEdit[i]&&storeEdit[i][1][j])storeEdit[i][1][j][1]=el.value;});
}
/* 目前已知的督導名單（供輸入框自動完成）*/
function knownSupervisors(){
  const set=new Set();
  Object.keys(STORE_SUP).forEach(k=>{const v=String(STORE_SUP[k]||"").trim();if(v)set.add(v);});
  storeEdit.forEach(g=>g[1].forEach(r=>{const v=String(r[1]||"").trim();if(v)set.add(v);}));
  return [...set].sort();
}
function renderStoreEditor(){
  const body=document.getElementById("storeEditBody"); if(!body)return;
  const dl=document.getElementById("supNameList");
  if(dl)dl.innerHTML=knownSupervisors().map(v=>`<option value="${esc(v)}">`).join("");
  const at=document.getElementById("storeSyncAt");
  if(at)at.textContent=STORE_SYNC_AT?("　最後同步："+STORE_SYNC_AT.slice(0,16).replace("T"," ")):"";
  body.innerHTML=storeEdit.map((g,i)=>`
    <div style="border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin-bottom:12px;background:#fafbfa">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap">
        <span style="font-size:12px;color:var(--muted);white-space:nowrap">區域</span>
        <input class="st-region" data-i="${i}" value="${esc(g[0])}" onchange="storeSetRegion(${i},this.value)" placeholder="區域名稱" style="flex:1;max-width:160px;padding:7px 10px;border:1px solid #cdd5d0;border-radius:7px;font-size:13px">
        <span style="font-size:11px;color:var(--muted)">（${g[1].length} 間）</span>
        <button class="btn danger sm" type="button" onclick="storeRmRegion(${i})" style="margin-left:auto">刪除區域</button>
      </div>
      ${g[1].length?`<div style="display:grid;grid-template-columns:1fr 1fr 34px;gap:6px;font-size:11px;color:var(--muted);margin-bottom:4px"><div>門市名稱</div><div>負責督導</div><div></div></div>`:""}
      <div style="margin-bottom:8px">
        ${g[1].map((r,j)=>`<div style="display:grid;grid-template-columns:1fr 1fr 34px;gap:6px;margin-bottom:6px;align-items:center">
            <input class="st-name" data-i="${i}" data-j="${j}" value="${esc(r[0])}" onchange="storeSetName(${i},${j},this.value)" style="padding:6px 10px;border:1px solid #cdd5d0;border-radius:7px;font-size:13px">
            <input class="st-sup" data-i="${i}" data-j="${j}" value="${esc(r[1]||"")}" list="supNameList" placeholder="（未指派督導）" onchange="storeSetSup(${i},${j},this.value)" style="padding:6px 10px;border:1px solid #cdd5d0;border-radius:7px;font-size:13px">
            <button type="button" onclick="storeRmStore(${i},${j})" title="刪除門市" style="background:none;border:1px solid #e6c9c4;border-radius:7px;cursor:pointer;color:#c0392b;font-size:15px;line-height:1;padding:6px 0;font-weight:700">×</button>
          </div>`).join('')||'<span style="font-size:12px;color:var(--muted)">此區域尚無門市，請於下方新增</span>'}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:6px;align-items:center">
        <input id="storeIn_${i}" placeholder="新增門市名稱…" onkeydown="if(event.key==='Enter'){event.preventDefault();storeAddStore(${i})}" style="padding:7px 11px;border:1px solid #cdd5d0;border-radius:7px;font-size:13px">
        <input id="supIn_${i}" list="supNameList" placeholder="負責督導（可留空）" onkeydown="if(event.key==='Enter'){event.preventDefault();storeAddStore(${i})}" style="padding:7px 11px;border:1px solid #cdd5d0;border-radius:7px;font-size:13px">
        <button class="btn sec sm" type="button" onclick="storeAddStore(${i})">＋ 新增門市</button>
      </div>
    </div>`).join("")||'<p class="hint">尚無區域，請按「＋ 新增區域」。</p>';
}
function storeSetRegion(i,v){ if(storeEdit[i])storeEdit[i][0]=v; }
function storeSetName(i,j,v){ if(storeEdit[i]&&storeEdit[i][1][j])storeEdit[i][1][j][0]=v; }
function storeSetSup(i,j,v){ if(storeEdit[i]&&storeEdit[i][1][j])storeEdit[i][1][j][1]=v; }
function storeAddRegion(){ storeSyncRegions(); storeEdit.push(["新區域",[]]); renderStoreEditor(); }
function storeRmRegion(i){
  storeSyncRegions();
  if(!confirm('確定刪除「'+(storeEdit[i][0]||'此')+'」區域及其所有門市？'))return;
  storeEdit.splice(i,1); renderStoreEditor();
}
function storeAddStore(i){
  const inp=document.getElementById('storeIn_'+i), sup=document.getElementById('supIn_'+i);
  const v=(inp?inp.value:'').trim(); if(!v)return;
  const sv=(sup?sup.value:'').trim();
  storeSyncRegions();
  if(storeEdit.some(g=>g[1].some(r=>r[0]===v))){toast('門市「'+v+'」已存在');return;}
  storeEdit[i][1].push([v,sv]); renderStoreEditor();
  const ni=document.getElementById('storeIn_'+i); if(ni)ni.focus();
}
function storeRmStore(i,j){ storeSyncRegions(); storeEdit[i][1].splice(j,1); renderStoreEditor(); }
async function saveStores(){
  storeSyncRegions();
  const list=storeEdit.filter(g=>String(g[0]||'').trim())
    .map(g=>[String(g[0]).trim(),g[1].map(r=>String(r[0]||'').trim()).filter(Boolean)]);
  const flat=list.reduce((a,g)=>a.concat(g[1]),[]);
  if(!flat.length){toast('請至少新增一個區域與門市');return;}
  const sup={};
  storeEdit.forEach(g=>g[1].forEach(r=>{const nm=String(r[0]||'').trim();if(nm)sup[nm]=String(r[1]||'').trim();}));
  STORE_GROUPS=list; STORE_SUP=sup; rebuildStores(); refillStoreSelects();
  initStoreEdit(); renderStoreEditor(); renderSupEmailTable();
  if(API_URL){
    try{await api("saveStores",{stores:STORE_GROUPS,sup:STORE_SUP});toast("門市／督導已儲存（雲端，全門市共用）");}
    catch(e){toast("⚠ 儲存失敗："+e.message);}
  }else{toast("門市清單已儲存（本機）");}
}
/* 立即從「門店資料表_UG」拉取門市／督導，並連動另外兩套系統（只新增與更新，不刪除既有門市）*/
async function syncStoresNow(){
  if(!API_URL){toast("尚未設定雲端後端，無法同步");return;}
  const btn=document.getElementById("syncStoreBtn");
  if(btn){btn.disabled=true;btn.textContent="同步中…";}
  try{
    const r=await api("syncStores");
    await loadStores(); initStoreEdit(); renderStoreEditor(); renderSupEmailTable();
    const add=(r&&r.added)||[], chg=(r&&r.supervisorChanged)||[], only=(r&&r.onlyInPromo)||[], peers=(r&&r.peers)||[], mv=(r&&r.regionMoved)||[];
    const okPeers=peers.filter(p=>p&&p.ok).length;
    toast("✅ 同步完成：共 "+((r&&r.stores)||STORES.length)+" 家門市／新增 "+add.length+"／督導更新 "+chg.length+(peers.length?"（另 "+okPeers+"/"+peers.length+" 套系統已連動）":""));
    if(add.length)  console.log("同步新增門市：",add);
    if(chg.length)  console.log("督導更新：",chg);
    if(only.length) console.log("主檔沒有、文宣系統仍保留（未刪除）：",only);
    if(peers.length)console.log("連動結果：",peers);
    if(add.length||only.length||peers.some(p=>p&&!p.ok)){
      showModal('<button class="close-x" onclick="closeModal()">×</button><h2>門市同步結果</h2>'+
        '<p class="hint">來源＝Google 試算表「門店資料表_UG」，共 '+((r&&r.stores)||STORES.length)+' 家門市。以下為本次差異，請確認新門市的區域是否正確（可直接在門市清單管理調整）。</p>'+
        (add.length?'<div class="sec-title"><span class="dot"></span>新增門市（'+add.length+'）</div><div style="font-size:13px;line-height:1.9">'+add.map(esc).join('、')+'</div>':'')+
        (chg.length?'<div class="sec-title"><span class="dot"></span>督導更新（'+chg.length+'）</div><div style="font-size:13px;line-height:1.9">'+chg.map(esc).join('、')+'</div>':'')+
        (mv.length?'<div class="sec-title"><span class="dot"></span>區域調整（'+mv.length+'）</div><div style="font-size:13px;line-height:1.9">'+mv.map(esc).join('、')+'</div>':'')+
        (only.length?'<div class="sec-title"><span class="dot"></span>主檔沒有、文宣系統仍保留（'+only.length+'）</div><div style="font-size:13px;line-height:1.9">'+only.map(esc).join('、')+'</div>':'')+
        (peers.length?'<div class="sec-title"><span class="dot"></span>另外兩套系統連動</div><div style="font-size:13px;line-height:1.9">'+peers.map(p=>esc(p.system)+'：'+(p.ok?('✅ '+p.stores+' 家門市／新增 '+p.added+'／督導更新 '+p.changed):('⚠ 失敗 '+esc(p.error||'')))).join('<br>')+'</div>':'')+
        '<div class="btn-row" style="margin-top:12px"><button class="btn" onclick="closeModal()">知道了</button></div>');
    }
  }catch(e){ toast("⚠ 同步失敗："+e.message); }
  finally{ if(btn){btn.disabled=false;btn.textContent="🔄 從門店資料表同步";} }
}

/* ====== 申請欄位設定 事件 ====== */
fcAllOn.addEventListener("click",()=>{
  CATALOG.forEach(c=>{fieldCfg[c.name]={period:true,plan:true,qty:true,option:true,format:true,delivery:true};});
  saveFieldCfgLocal();renderFieldTable();renderItems();
  toast("已全部重設（所有欄位顯示所有選項）");
});
saveFields.addEventListener("click",async()=>{
  if(API_URL){
    saveFields.disabled=true;
    try{ await api("saveFieldConfig",{fieldConfig:fieldCfg}); toast("申請欄位設定已儲存（雲端，全門市共用）"); }
    catch(e){ toast("⚠ 儲存失敗："+e.message); }
    finally{ saveFields.disabled=false; }
  }else{ toast("申請欄位設定已儲存（本機）"); }
  renderItems();
});

/* ====== 角色 / 分頁 ====== */
function applyRoleUI(){
  const adminOnly=["dashboard","fields","optmgr","line"];
  adminOnly.forEach(t=>{document.querySelector(`[data-tab="${t}"]`).style.display=role==="admin"?"":"none";});
  document.getElementById("demoBanner");
  roleHintList.textContent=role==="admin"
    ?"管理端可在此更新處理進度、設計部報價與實際金額。":"門市夥伴可檢視自己送出的申請與處理進度（處理欄位唯讀）。";
  const active=document.querySelector("nav button.active");
  if(role!=="admin"&&active&&adminOnly.includes(active.dataset.tab))document.querySelector('[data-tab="apply"]').click();
}
function setRole(r){role=r;roleSwitch.querySelectorAll("button").forEach(x=>x.classList.toggle("active",x.dataset.role===r));applyRoleUI();renderList();}
function openAdminLogin(){
  showModal(`<button class="close-x" onclick="closeModal()">×</button>
    <h2>管理登入</h2>
    <p class="hint">請輸入管理密碼，進入總部管理模式。</p>
    <input type="password" id="adminPwInput" placeholder="管理密碼" style="margin-top:6px">
    <div id="adminPwErr" style="color:var(--danger);font-size:13px;margin:10px 0;display:none">密碼錯誤，請再試一次</div>
    <div class="btn-row"><button class="btn" id="adminPwBtn">登入</button></div>`);
  const el=document.getElementById("adminPwInput"),btn=document.getElementById("adminPwBtn");
  if(btn)btn.addEventListener("click",submitAdminLogin);
  if(el){el.focus();el.addEventListener("keydown",e=>{if(e.key==="Enter")submitAdminLogin();});}
}
async function submitAdminLogin(){
  const el=document.getElementById("adminPwInput"),er=document.getElementById("adminPwErr");
  const pw=el?el.value:""; if(!pw)return;
  if(API_URL){
    adminPass=pw;
    try{ cases=await api("list");save();setRole("admin");refreshAll();closeModal();toast("已進入管理模式");
      if(PAGE_MODE==="admin")document.querySelector('[data-tab="list"]').click(); }   // 管理頁登入後直接切到案件清單
    catch(e){ adminPass="";if(er)er.style.display="block"; }
  }else{ setRole("admin");closeModal(); } // 純本機模式無法驗證，直接切換
}
/* 管理密碼已移除：admin.html 開啟直接進管理模式（後端亦已取消 adminPass 驗證）*/
async function enterAdminDirect(){
  if(API_URL){
    try{ cases=await api("list"); save(); }
    catch(e){ console.warn("管理資料載入失敗",e); toast("⚠ 載入失敗："+e.message); }
  }
  setRole("admin"); refreshAll();
  const lt=document.querySelector('[data-tab="list"]'); if(lt)lt.click();
}
roleSwitch.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{
  const target=b.dataset.role;
  if(target==="admin"&&role!=="admin"){openAdminLogin();return;}
  if(target==="store")adminPass="";
  setRole(target);
}));
nav.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{
  nav.querySelectorAll("button").forEach(x=>x.classList.remove("active"));b.classList.add("active");
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById("view-"+b.dataset.tab).classList.add("active");
  if(b.dataset.tab==="dashboard")renderDash();
  if(b.dataset.tab==="list")renderList();
  if(b.dataset.tab==="fields")renderFieldTable();
  if(b.dataset.tab==="line"){loadLineCfg();ensureSupEmailCard();loadEmailCfg().then(()=>renderSupEmailTable());}
  if(b.dataset.tab==="optmgr"){catalogEdit=CATALOG.map(c=>({...c}));initOptEdit();renderCatalogEditor();renderOptionEditor();ensureStoreMgrCard();initStoreEdit();renderStoreEditor();
    // 管理密碼已移除：隱藏「管理密碼設定」卡片
    const pw=document.getElementById("pwListWrap"); if(pw&&pw.closest(".card"))pw.closest(".card").style.display="none";}
}));

/* ====== 工具 ====== */
function showModal(html){modalBox.innerHTML=html;modalBg.classList.add("show")}
function closeModal(){modalBg.classList.remove("show")}
modalBg.addEventListener("click",e=>{if(e.target===modalBg)closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&modalBg.classList.contains("show"))closeModal()});
let toastT;function toast(m){const t=document.getElementById("toast");t.textContent=m;t.classList.add("show");clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove("show"),2600)}
function refreshAll(){renderList();if(document.getElementById("view-dashboard").classList.contains("active"))renderDash()}

/* ====== 啟動 ====== */
// 門市頁 / 管理頁分家：兩頁都不用角色切換鈕。管理頁開啟即跳登入；門市頁完全沒有管理入口。
roleSwitch.style.display="none";
if(PAGE_MODE==="admin"){
  demoBanner.textContent="　總部管理頁：可直接檢視全門市案件、更新進度與各項設定（門市申請請改用門市申請頁）。";
  enterAdminDirect();
}else{
  demoBanner.textContent="　門市夥伴：填寫「申請資訊」與「文宣輸出物」，完成電子簽名與匯款明細上傳後即可送出；案件清單可查看自己的申請進度。";
}
applyRoleUI();
renderList();
(async function initData(){
  // 三個雲端載入一起跑、全部結束後只渲染一次，避免載入中重建表單導致使用者輸入失焦／被重置
  await Promise.allSettled([loadCatalog(),loadFieldConfig(),loadOptions(),loadStores()]);
  renderItems();
})();
