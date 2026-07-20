/* =========================================================
   银龄健身 · 老人康复锻炼 APP 逻辑
   - 分类 + 子类型筛选
   - 视频播放器：暂停/续播/退出/循环（无真实视频时进入「演示时钟」，交互完全可用）
   - 跟练口令随进度切换 + 节拍脉冲
   - 按真实时长累计锻炼分钟，写入 localStorage
   - 自然月日历渲染与翻月、今日时长徽标
   ========================================================= */

/* ---------- 数据：分类 ---------- */
const CATS = [
  { id:'resist', name:'抗阻训练', ico:'💪', subs:['上肢','下肢','腰腿'] },
  { id:'daily',  name:'日常锻炼', ico:'🌿', subs:['八段锦','广播体操','太极','五禽戏','跟练'] },
  { id:'tcm',    name:'中医按摩', ico:'🤲', subs:['经络拍打','穴位按摩'] },
];

/* ---------- 数据：锻炼项目 ----------
   说明：所有视频均选用「适合长辈」的内容——坐姿操、椅子瑜伽、太极、五禽戏、经络拍打等，
   不再使用健身房器械训练。embed 填国内可嵌入地址即用网络视频；video 留空=口令演示跟练；
   srcUrl 为 B站原视频链接，嵌入若被拦可一键跳转观看；official 标记是否官方/标准版。       */
const BADUANJIN = ['双手托天理三焦','左右开弓似射雕','调理脾胃须单举','五劳七伤往后瞧',
  '摇头摆尾去心火','两手攀足固肾腰','攒拳怒目增气力','背后七颠百病消'];
const GEN = ['调整呼吸，放松身体','慢慢吸气，轻轻发力','保持住，数 1 2 3','缓缓呼气，慢慢放下',
  '活动一下，别憋气','很好，我们再来一次','保持节奏，不着急','收功，深呼吸放松'];

// 弹力带·坐姿上肢抗阻（居家，踩带/绕椅固定，练肩臂）
const BAND_UPPER = ['坐稳椅面，腰背挺直，双脚踩实地面','弹力带踩在脚下或绕过椅腿固定','双手握带两端，掌心相对',
  '吸气准备，呼气屈肘向上弯举','练手臂前侧，慢起慢落，各10-12次','把带子拉到肩高，双手向上推举',
  '推到顶手肘不锁死，缓缓放下','双臂侧平举拉带，练肩膀','扩胸拉带，夹紧肩胛，挺胸',
  '用力时呼气，放松时吸气，不憋气','累了就松开带子歇一会儿','收功，放松肩臂，深呼吸'];
// 弹力带·肩背舒展（改善圆肩驼背，温和跟练）
const BAND_SHOULDER = ['坐正或站稳，肩膀放松下沉','双手握带两端，手臂向前平举','呼气向两侧拉开，夹紧肩胛骨',
  '感受后背发力，停一秒','吸气慢慢收回，肩膀别耸起','带子举过头顶，做 Y 字上举开肩',
  '高位下拉：带过头向下拉到胸前','面拉：带向脸的方向拉，练后肩','每个动作 8-12 次，动作轻柔',
  '不憋气、不猛拉，护住肩颈','坚持练，改善圆肩驼背','收功，转转肩膀，放松'];
// 护肩颈·舒缓短视频（真人示范，10秒循环跟练）
const HUJIANJING = ['放松肩颈，跟着慢慢做','动作轻柔，均匀呼吸','感受肩颈舒展','不憋气，量力而行'];
// 弹力带·下肢抗阻（套踝/套腿，练腿力护膝）
const BAND_LOWER = ['坐稳椅子，腰背挺直，双脚平放','弹力带套在两脚踝或大腿上方','坐姿伸膝：向前蹬直，抗阻伸腿',
  '停 2 秒收紧大腿前侧，慢慢收回','侧向外展：双膝向外顶开带子','练臀腿外侧，左右各 10-15 次',
  '屈膝后勾：脚跟向后拉，练大腿后侧','踝泵抗阻：勾脚、绷脚，活动脚踝','膝盖不锁死，动作放慢',
  '用力呼气，不憋气，护住膝盖','两条腿都要练到','收功，轻揉大腿放松'];
// 弹力带·全身居家（站坐皆可，全身抗阻循环）
const BAND_FULL = ['站稳或坐稳，弹力带准备好','先转手腕脚踝，热身活动一下','上肢：弯举、上推、扩胸拉带',
  '肩背：侧拉、高位下拉，挺起胸','下肢：踩带屈膝、侧向迈步','臀腿：后抬腿、侧抬腿抗阻',
  '核心：坐姿转体拉带，收紧肚子','每个动作 10-12 次，循环两轮','用力时呼气，动作要放慢',
  '不借惯性甩带，量力而行','累了随时停下休息','收功，拉伸放松，深呼吸'];
// 24式太极拳（简化，适老）
const TAIJI = ['起势：两脚开立，两臂前举，屈膝按掌','野马分鬃：弓步分手，上下相随','白鹤亮翅：跟步合抱，虚步分手',
  '搂膝拗步：搂手推掌，步随身换','手挥琵琶：跟步展手，虚步合臂','倒卷肱：退步推掌，轻柔连贯',
  '左揽雀尾：棚捋挤按，圆活连贯','右揽雀尾：左右相随，以腰为轴','单鞭：勾手推掌，沉肩坠肘',
  '云手：两手画圆，步随身移','单鞭：再次勾手推掌','高探马：跟步穿掌，虚步前探',
  '右蹬脚：提膝分手，蹬脚稳住','双峰贯耳：两拳相对，力达拳面','转身左蹬脚：转身分手，蹬脚平衡',
  '左下势独立：仆步穿掌，独立挑掌','右上步七星：虚步棚架，上下相合','退步跨虎：退步撑掌，沉稳含蓄',
  '转身摆莲：转腰摆脚，拍脚成圆','弯弓射虎：落步贯拳，如拉弓弦','十字手：两手交叉，抱于胸前',
  '收势：气沉丹田，缓缓还原'];
// 五禽戏（国家体育总局健身气功标准版）
const WUQINXI = ['起势调息：上提下按，调匀呼吸','虎举：握拳上举，下拉按腹','虎扑：威猛扑按，脊柱蠕动',
  '鹿抵：迈步转腰，舒颈抵腰','鹿奔：弓步后坐，含胸舒背','熊运：腰腹为轴，立圆摇晃',
  '熊晃：提髋落步，沉稳前靠','猿提：提踵转头，灵活轻盈','猿摘：攀枝摘果，敏捷舒展',
  '鸟伸：展翅伸腿，气贯周身','鸟飞：双臂平举，起落如飞','收势：引气归元，搓手浴面'];
// 经络拍打操（老中医带口令）
const PAITONG = ['站立或坐姿，搓热双手，放松心情','拍打上肢：从肩到手，疏通肺经心经','拍打下肢：从根到脚，疏通胃经胆经',
  '空掌拍肩井，放松肩颈','拍打大椎，提神醒脑','双手拍胸腹，调理脏腑',
  '轻拍腰背，疏通膀胱经','拍打腹股沟，活血行气','力度轻柔，以微热为度','收功，搓手浴面，深呼吸'];

const EXERCISES = [
  // 抗阻训练（弹力带·居家，坐姿/温和，适合长辈）
  { id:'r1', cat:'resist', sub:'上肢', title:'弹力带·老年坐姿抗阻', dur:1216, cues:BAND_UPPER, video:'./videos/r1.mp4', embed:'', srcUrl:'https://www.bilibili.com/video/BV1Xw411g7vy/', srcName:'高龄长者弹力带运动 老年健康恢复操（B站：Fifi老师带头示范·坐姿）', official:false, desc:'高龄长者坐姿弹力带抗阻跟练（Fifi老师示范），坐着练肩臂上肢力量，慢速简单、可循环。注意：选轻阻力带、不憋气、肘不锁死、量力而行，胸闷头晕立刻停下。' },
  { id:'r5', cat:'resist', sub:'上肢', title:'弹力带·坐姿手臂抗阻', dur:735, cues:BAND_UPPER, video:'./videos/r5.mp4', embed:'', srcUrl:'https://www.bilibili.com/video/BV1q3411B7fT/', srcName:'12分钟坐姿弹力带手臂紧致训练（B站：wishisnotfar）', official:false, desc:'坐姿弹力带练手臂紧致，简单跟练约12分钟，坐着练肩臂力量。注意：选轻阻力带、不憋气、肘不锁死、量力而行，胸闷头晕立刻停下。' },
  { id:'r2', cat:'resist', sub:'上肢', title:'护肩颈·舒缓跟练', dur:17, cues:HUJIANJING, video:'./videos/hujianjing.mp4', embed:'', srcUrl:'', srcName:'', official:false, desc:'真人示范护肩颈舒缓动作，慢速带节拍循环跟练，放松颈肩、缓解僵硬（竖版·可循环/暂停/继续）' },
  { id:'r3', cat:'resist', sub:'下肢', title:'弹力带·下肢抗阻', dur:493, cues:BAND_LOWER, video:'./videos/r3.mp4', embed:'', srcUrl:'https://www.bilibili.com/video/BV1D9fMBsEjf/', srcName:'下肢弹力带抗阻运动·坐位（B站：康复科坐姿示范，练腿护膝）', official:false, desc:'弹力带套脚踝/大腿做伸膝、外展、后勾，练大腿与臀腿力量、护膝盖（每组10-15次）' },
  { id:'r4', cat:'resist', sub:'腰腿', title:'弹力带·全身居家', dur:546, cues:BAND_FULL, video:'./videos/r4.mp4', embed:'', srcUrl:'https://www.bilibili.com/video/BV13uK76QEvD/', srcName:'居家阻力带全身训练·新手零门槛（B站：一根弹力带练全身，9分钟）', official:false, desc:'一根弹力带练上肢、肩背、腿臀与核心，居家零门槛，约9分钟（量力而行、可循环）' },
  // 日常锻炼
  { id:'d1', cat:'daily', sub:'八段锦', title:'八段锦·国家体育总局标准版', dur:720, cues:BADUANJIN, video:'./videos/d1.mp4', embed:'', srcUrl:'https://www.bilibili.com/video/BV1LJftBnETr/', srcName:'国家体育总局《健身气功·八段锦》标准口令版', official:true, desc:'国家体育总局标准版，八式连贯，配呼吸口令，约12分钟（官方视频跟练）' },
  { id:'d3', cat:'daily', sub:'广播体操', title:'第四套广播体操', dur:234, cues:GEN, video:'./videos/d3.mp4', embed:'', srcUrl:'https://www.bilibili.com/video/BV18z4y1S77T/', srcName:'第四套广播体操（1963-1971）完整版·长辈最熟悉的经典', official:true, desc:'第四套广播体操完整版，长辈最熟悉的一版，全身舒展约4分钟' },
  { id:'d4', cat:'daily', sub:'太极', title:'24式太极拳·背面跟练', dur:420, cues:TAIJI, video:'./videos/d4.mp4', embed:'', srcUrl:'https://www.bilibili.com/video/BV1duBKYyEhu/', srcName:'24式简化太极拳·背面清晰跟练（燕南天：武术冠军 / 国家级社会体育指导员）', official:false, desc:'24式简化太极拳，柔和缓慢、连贯均匀，适合长辈天天练，约7分钟' },
  { id:'d5', cat:'daily', sub:'五禽戏', title:'五禽戏·完整跟练', dur:826, cues:WUQINXI, video:'./videos/d5.mp4', embed:'', srcUrl:'https://www.bilibili.com/video/BV1kd4y1W7cm/', srcName:'健身气功·五禽戏·国家体育总局标准版（带呼吸法口令版）', official:true, desc:'国家体育总局健身气功标准版，虎鹿熊猿鸟五戏，约14分钟' },
  { id:'d2', cat:'daily', sub:'跟练', title:'跟着医生练练', dur:433, cues:GEN, video:'./videos/d2.mp4', embed:'', srcUrl:'', srcName:'', official:false, desc:'医生带做的居家养生跟练，动作简单易学、跟着做即可，约7分钟（视频跟练·可循环/暂停/继续）' },
  // 中医按摩
  { id:'m1', cat:'tcm', sub:'经络拍打', title:'十五经络拍打操', dur:900, cues:PAITONG, video:'./videos/m1.mp4', embed:'', srcUrl:'https://www.bilibili.com/video/BV1fQftBtEfW/', srcName:'十五经络拍打操·带口令解读（老中医跟练版）', official:false, desc:'跟着口令拍打上肢、下肢、肩颈、腰背经络，疏通气血，约15分钟' },
  { id:'m2', cat:'tcm', sub:'穴位按摩', title:'梳头养发跟练', dur:528, cues:GEN, video:'./videos/m2.mp4', embed:'', srcUrl:'https://www.bilibili.com/video/BV1jXoAYWEk8/', srcName:'每日梳头养发8分钟跟练（B站：朦胧心跳·在家自己做头部头皮按摩）', official:false, desc:'十指梳头、按揉头皮的头部保健按摩跟练，疏通头部经络、醒脑安神，坐着就能做，约9分钟（视频跟练）' },
  { id:'m3', cat:'tcm', sub:'穴位按摩', title:'足部保健按摩', dur:369, cues:GEN, video:'./videos/m3.mp4', embed:'', srcUrl:'https://www.bilibili.com/video/BV1T5411d7gs/', srcName:'教你用正确的手法按脚·足部按摩教学（B站：合和大唐）', official:false, desc:'教学示范正确按脚手法，对照在自己脚上揉按足底、脚趾、脚踝，通经络、缓疲劳，适合长辈日常足部保健（视频跟练）' },
  { id:'m4', cat:'tcm', sub:'穴位按摩', title:'手部经络按揉', dur:300, cues:GEN, video:'./videos/m4.mp4', embed:'', srcUrl:'https://www.bilibili.com/video/BV15u411N7xv/', srcName:'手部经络疏通·十指连心（B站：刮手指疏通6条经络）', official:false, desc:'按揉合谷、内关等手部穴位，通经络、安心神（视频跟练）' },
  { id:'m5', cat:'tcm', sub:'穴位按摩', title:'头面部保健按摩', dur:516, cues:GEN, video:'./videos/m5.mp4', embed:'', srcUrl:'https://www.bilibili.com/video/BV1cw411b79x/', srcName:'头面部保健按摩（B站：酷酷水水）', official:false, desc:'头面部保健按摩跟练，按揉额颞、眼周、脸颊与耳部，缓解头部紧张、提神醒脑，约8分半（视频跟练）' },
];

/* ---------- 本地存储：每日分钟 ---------- */
const STORE_KEY = 'elderfit:minutes';
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
function loadStore(){ try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; } }
function saveStore(o){ localStorage.setItem(STORE_KEY, JSON.stringify(o)); }
function addMinutes(dateStr, mins){
  if (mins <= 0) return;
  const o = loadStore();
  o[dateStr] = (o[dateStr] || 0) + mins;
  saveStore(o);
}
function updateTodayBadge(){
  document.getElementById('todayMinutes').textContent = loadStore()[todayKey()] || 0;
}

/* ---------- 渲染：分类 tabs + 子类型 chips + 列表 ---------- */
let curCat = CATS[0].id;
let curSub = '全部';

function renderTabs(){
  const wrap = document.getElementById('tabs');
  wrap.innerHTML = '';
  CATS.forEach(c => {
    const b = document.createElement('button');
    b.className = 'tab' + (c.id === curCat ? ' is-active' : '');
    b.innerHTML = `<span class="tab__ico">${c.ico}</span>${c.name}`;
    b.onclick = () => { curCat = c.id; curSub = '全部'; renderTabs(); renderChips(); renderList(); };
    wrap.appendChild(b);
  });
}

function renderChips(){
  const wrap = document.getElementById('chips');
  const cat = CATS.find(c => c.id === curCat);
  wrap.innerHTML = '';
  if (!cat.subs.length) return;
  ['全部', ...cat.subs].forEach(s => {
    const b = document.createElement('button');
    b.className = 'chip' + (s === curSub ? ' is-active' : '');
    b.textContent = s;
    b.onclick = () => { curSub = s; renderChips(); renderList(); };
    wrap.appendChild(b);
  });
}

function renderList(){
  const wrap = document.getElementById('list');
  wrap.innerHTML = '';
  const items = EXERCISES.filter(e =>
    e.cat === curCat && (curSub === '全部' || e.sub === curSub));
  items.forEach(e => {
    const card = document.createElement('article');
    card.className = 'card';
    const mins = Math.max(1, Math.round(e.dur / 60));
    card.innerHTML = `
      <div class="card__top">
        <span class="card__tag">${e.sub}</span>
        <span class="card__play">▶</span>
      </div>
      <div class="card__title">${e.title}</div>
      ${e.desc ? `<div class="card__desc">${e.desc}</div>` : ''}
      <div class="card__meta">
        <span class="card__dur">约 ${mins} 分钟</span>
        <span>${e.embed ? '视频跟练 · 带口令' : (e.video ? '本地视频 · 可循环' : '演示跟练 · 可循环')}</span>
      </div>`;
    card.onclick = () => openPlayer(e);
    wrap.appendChild(card);
  });
}

/* ---------- 播放器 ---------- */
const player   = document.getElementById('player');
const video    = document.getElementById('video');
const stage    = document.getElementById('stage');
const stageDemo= document.getElementById('stageDemo');
const cueEl    = document.getElementById('cue');
const cueNext  = document.getElementById('cueNext');
const beatEl   = document.getElementById('beat');
const playBtn  = document.getElementById('playBtn');
const seek     = document.getElementById('seek');
const curTimeEl= document.getElementById('curTime');
const durTimeEl= document.getElementById('durTime');
const loopChk  = document.getElementById('loopChk');
const playerName=document.getElementById('playerName');
const playerCredit=document.getElementById('playerCredit');
const watchLinkBtn=document.getElementById('watchLinkBtn');

let cur = null;          // 当前项目
let playing = false;
let elapsed = 0;         // 当前循环内已过秒数
let totalPlayed = 0;     // 本次会话累计真实秒数（用于计分钟）
let rafId = null, lastTs = 0;
let beatTimer = null;
let usingVideo = false;
let usingEmbed = false;  // 是否播放国内网络嵌入视频（B站等）
let embedTimer = null;   // 嵌入视频的时长计数定时器

const fmt = s => {
  s = Math.max(0, Math.floor(s));
  return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
};

// 国内网络嵌入视频（B站等）通过 e.embed 直接给出 iframe 地址，无需额外拼装
// 若内嵌被来源站屏蔽（如央视设置 X-Frame-Options），下方"来源"链接可跳官方页观看
function srcWatchUrl(e){
  if (e.srcUrl) return e.srcUrl;
  if (e.embed){ const m = e.embed.match(/bvid=(BV[\w]+)/); if (m) return 'https://www.bilibili.com/video/' + m[1]; }
  return null;
}

function openPlayer(e){
  cur = e;
  elapsed = 0; totalPlayed = 0; playing = false; lastVideoTime = 0;
  playerName.textContent = e.title;
  durTimeEl.textContent = fmt(e.dur);
  curTimeEl.textContent = '0:00';
  seek.value = 0;
  loopChk.checked = true;

  // 国内网络嵌入视频（B站等） / 本地真实视频 / 演示舞台
  usingEmbed = false;
  const oldFrame = stage.querySelector('iframe');
  if (oldFrame) oldFrame.remove();
  player.classList.remove('is-embed');
  playerCredit.hidden = true;
  watchLinkBtn.hidden = true;
  loopChk.disabled = false;
  stage.classList.remove('has-portrait');   // 重置竖版标记

  if (e.embed){
    usingEmbed = true;
    usingVideo = false;
    player.classList.add('is-embed');
    const f = document.createElement('iframe');
    f.className = 'embed-frame';
    f.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
    f.setAttribute('allowfullscreen', '');
    f.src = e.embed;
    stage.appendChild(f);
    playerCredit.hidden = false;
    const wu = srcWatchUrl(e);
    const linkHtml = wu ? ` ｜ <a class="credit-link" href="${wu}" target="_blank" rel="noopener">点此在来源网站观看官方视频 ↗</a>` : '';
    playerCredit.innerHTML = '视频来源：' + (e.srcName || '网络跟练视频') +
      ' ｜ 提示：视频播放/暂停请用其自带按钮；下方「开始/暂停」控制跟练口令与计时。循环在嵌入视频中不生效。' + linkHtml;
    if (wu){ watchLinkBtn.hidden = false; watchLinkBtn.onclick = () => window.open(wu, '_blank', 'noopener'); }
    else { watchLinkBtn.hidden = true; }
    // 嵌入视频无法读取真实进度：由用户点「开始」后按跟练时长计分钟；循环开关对嵌入视频无效
    loopChk.disabled = true;
    loopChk.checked = false;
  } else if (e.video){
    usingVideo = true;
    video.src = e.video;
    video.loop = loopChk.checked;
    stage.classList.add('has-video');
    // 本地视频：用原生事件同步进度 / 口令 / 计时
    video.onloadedmetadata = () => {
      durTimeEl.textContent = fmt(video.duration || cur.dur);
      // 自动检测竖版视频 → 切换容器为竖屏模式
      const isPortrait = video.videoHeight > video.videoWidth;
      stage.classList.toggle('has-portrait', isPortrait);
    };
    video.ontimeupdate = () => {
      if (!usingVideo) return;
      elapsed = video.currentTime;
      updateProgress();
      showCue();
      const dt = video.currentTime - (lastVideoTime||0);
      if (dt > 0 && dt < 5) totalPlayed += dt;   // 防跳变
      lastVideoTime = video.currentTime;
    };
    video.onended = () => {
      if (!loopChk.checked){ pause(); finalize(); }
      else { elapsed = 0; lastVideoTime = 0; }     // 循环重播时重置
    };
  } else {
    usingVideo = false;
    video.removeAttribute('src');
    stage.classList.remove('has-video');
  }
  showCue();
  setPlayBtn(false);
  player.hidden = false;
  document.body.style.overflow = 'hidden';
}

function showCue(){
  if (!cur) return;
  const cues = cur.cues;
  const totalDur = (usingVideo && video.duration) ? video.duration : cur.dur;
  const slice = totalDur / cues.length;
  let i = Math.min(cues.length - 1, Math.floor(elapsed / slice));
  cueEl.textContent = cues[i];
  cueNext.textContent = (i + 1 < cues.length) ? `下一句：${cues[i+1]}` : '最后一组，坚持住';
}

function tick(ts){
  if (!playing) return;
  const dt = (ts - lastTs) / 1000;
  lastTs = ts;
  elapsed += dt;
  totalPlayed += dt;
  if (elapsed >= cur.dur){
    if (loopChk.checked || usingEmbed){ elapsed = 0; }
    else { elapsed = cur.dur; updateProgress(); showCue(); pause(); finalize(); return; }
  }
  updateProgress();
  showCue();
  rafId = requestAnimationFrame(tick);
}

function updateProgress(){
  curTimeEl.textContent = fmt(elapsed);
  seek.value = cur.dur ? Math.round(elapsed / cur.dur * 100) : 0;
}

function setPlayBtn(isPlaying){
  playBtn.textContent = isPlaying ? '⏸ 暂停' : '▶ 继续';
  playBtn.classList.toggle('is-playing', isPlaying);
}

function play(){
  if (!cur) return;
  playing = true;
  setPlayBtn(true);
  lastTs = performance.now();
  if (usingVideo){ video.loop = loopChk.checked; video.play().catch(()=>{}); }
  else { rafId = requestAnimationFrame(tick); }
  startBeat();
}

function pause(){
  playing = false;
  setPlayBtn(false);
  if (usingVideo) video.pause();
  else if (rafId) cancelAnimationFrame(rafId);
  stopBeat();
}

function togglePlay(){ playing ? pause() : play(); }

function startBeat(){
  stopBeat();
  beatTimer = setInterval(() => {
    beatEl.classList.remove('is-on');
    void beatEl.offsetWidth;       // 重置动画
    beatEl.classList.add('is-on');
  }, 900);
}
function stopBeat(){ if (beatTimer) clearInterval(beatTimer); beatTimer = null; }

function finalize(){
  const mins = Math.round(totalPlayed / 60);
  addMinutes(todayKey(), mins);
  updateTodayBadge();
  renderCalendar();
}

function exitPlayer(){
  if (embedTimer){ clearInterval(embedTimer); embedTimer = null; }
  const f = stage.querySelector('iframe');
  if (f) f.remove();
  player.classList.remove('is-embed');
  playerCredit.hidden = true;
  pause();
  finalize();
  player.hidden = true;
  document.body.style.overflow = '';
  cur = null;
}

/* 真实视频事件（如有） */
video.addEventListener('timeupdate', () => {
  if (!usingVideo || !playing) return;
  elapsed = video.currentTime;
  totalPlayed += 0.25; // 近似累加（timeupdate ~4/s）
  updateProgress(); showCue();
});
video.addEventListener('ended', () => { if (!loopChk.checked){ pause(); finalize(); } });

/* 控件绑定 */
playBtn.onclick = togglePlay;
loopChk.onchange = () => {
  if (usingVideo) video.loop = loopChk.checked;
  // 嵌入视频（B站等）不支持跨域循环控制，开关在嵌入模式下已禁用
};
seek.addEventListener('input', () => {
  const p = Number(seek.value) / 100;
  elapsed = p * cur.dur;
  if (usingVideo) video.currentTime = elapsed;
  totalPlayed += 0; // 拖动不计额外时长
  updateProgress(); showCue();
});
document.querySelectorAll('[data-exit]').forEach(el => el.onclick = exitPlayer);

/* ---------- 使用说明弹窗 ---------- */
const helpModal = document.getElementById('helpModal');
function openHelp(){ helpModal.hidden = false; document.body.style.overflow='hidden'; }
function closeHelp(){ helpModal.hidden = true; document.body.style.overflow=''; }
document.getElementById('helpBtn').onclick = openHelp;
document.getElementById('helpBtn2').onclick = openHelp;
document.querySelectorAll('[data-close]').forEach(el => el.onclick = closeHelp);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape'){ if (!player.hidden) exitPlayer(); else if (!helpModal.hidden) closeHelp(); }
});

/* ---------- 自然月日历 ---------- */
const WEEK = ['日','一','二','三','四','五','六'];
let view = { y: new Date().getFullYear(), m: new Date().getMonth() };

function renderCalendar(){
  const grid = document.getElementById('calGrid');
  grid.innerHTML = '';
  WEEK.forEach(w => {
    const h = document.createElement('div');
    h.className = 'cal-cell cal-cell--head'; h.textContent = w; grid.appendChild(h);
  });
  const first = new Date(view.y, view.m, 1);
  const startPad = first.getDay();           // 周日为首列
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const store = loadStore();
  const tKey = todayKey();
  const tY = new Date().getFullYear(), tM = new Date().getMonth(), tD = new Date().getDate();

  for (let i = 0; i < startPad; i++){
    const e = document.createElement('div'); e.className = 'cal-cell cal-cell--empty'; grid.appendChild(e);
  }
  for (let d = 1; d <= days; d++){
    const cell = document.createElement('div');
    cell.className = 'cal-cell';
    const key = `${view.y}-${String(view.m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const mins = store[key] || 0;
    if (mins > 0) cell.classList.add('cal-cell--done');
    if (view.y === tY && view.m === tM && d === tD) cell.classList.add('cal-cell--today');
    cell.innerHTML = `<span class="cal-cell__d">${d}</span>` +
      (mins > 0 ? `<span class="cal-cell__m">${mins}分</span>` : '');
    grid.appendChild(cell);
  }
  document.getElementById('monthLabel').textContent = `${view.y}年${view.m+1}月`;
}

document.getElementById('prevMonth').onclick = () => {
  view.m--; if (view.m < 0){ view.m = 11; view.y--; } renderCalendar();
};
document.getElementById('nextMonth').onclick = () => {
  view.m++; if (view.m > 11){ view.m = 0; view.y++; } renderCalendar();
};

/* ---------- 初始化 ---------- */
renderTabs();
renderChips();
renderList();
renderCalendar();
updateTodayBadge();
