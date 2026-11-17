const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const D={en:{title:"Salah Hub",tPrayer:"Prayer Times",tQibla:"Qibla",tRamadan:"Ramadan",tHijri:"Hijri Converter",
 Fajr:"Fajr",Sunrise:"Sunrise",Dhuhr:"Dhuhr",Asr:"Asr",Maghrib:"Maghrib",Isha:"Isha",next:"Next prayer",
 settings:"Location & method",auto:"Automatic (GPS)",manual:"Manual",useGps:"Use my location",country:"Country",city:"City",
 method:"Calculation method",methodAuto:"Auto (by location)",school:"Asr calculation",shafi:"Standard (Shafi'i, Maliki, Hanbali)",hanafi:"Hanafi",apply:"Apply",
 bearing:"Bearing from true north",distance:"Distance to the Kaaba",aligned:"You are facing the Qibla",enableCompass:"Enable compass",
 compassHelp:"Hold your phone flat and turn until the Kaaba icon points to the top.",day:"Day",date:"Date",suhoor:"Suhoor ends",iftar:"Iftar",
 g2h:"Gregorian to Hijri",h2g:"Hijri to Gregorian",gDate:"Gregorian date",convert:"Convert",dd:"Day",mm:"Month",yy:"Year",
 loading:"Loading…",locating:"Finding your location…",denied:"Location access was blocked. Pick a country and city instead.",
 pickCity:"Choose a country and city to see prayer times.",err:"Something went wrong",km:"km",ah:"AH",ramadanOf:"Ramadan {y} AH",
 rSub:"Starts around {d}. Suhoor ends at Fajr; break your fast at Maghrib."},
ar:{title:"مواقيت الصلاة",tPrayer:"أوقات الصلاة",tQibla:"القبلة",tRamadan:"رمضان",tHijri:"المحول الهجري",
 Fajr:"الفجر",Sunrise:"الشروق",Dhuhr:"الظهر",Asr:"العصر",Maghrib:"المغرب",Isha:"العشاء",next:"الصلاة القادمة",
 settings:"الموقع وطريقة الحساب",auto:"تلقائي (GPS)",manual:"يدوي",useGps:"استخدم موقعي",country:"الدولة",city:"المدينة",
 method:"طريقة الحساب",methodAuto:"تلقائي حسب الموقع",school:"حساب العصر",shafi:"القياسي (الشافعي، المالكي، الحنبلي)",hanafi:"الحنفي",apply:"تطبيق",
 bearing:"الاتجاه من الشمال الحقيقي",distance:"المسافة إلى الكعبة",aligned:"أنت تواجه القبلة",enableCompass:"تفعيل البوصلة",
 compassHelp:"أمسك هاتفك أفقياً وأدِره حتى تصبح أيقونة الكعبة في الأعلى.",day:"اليوم",date:"التاريخ",suhoor:"انتهاء السحور",iftar:"الإفطار",
 g2h:"من ميلادي إلى هجري",h2g:"من هجري إلى ميلادي",gDate:"التاريخ الميلادي",convert:"تحويل",dd:"اليوم",mm:"الشهر",yy:"السنة",
 loading:"جارٍ التحميل…",locating:"جارٍ تحديد موقعك…",denied:"تم حظر الوصول للموقع. اختر الدولة والمدينة يدوياً.",
 pickCity:"اختر الدولة والمدينة لعرض أوقات الصلاة.",err:"حدث خطأ ما",km:"كم",ah:"هـ",ramadanOf:"رمضان {y} هـ",
 rSub:"يبدأ تقريباً في {d}. ينتهي السحور عند الفجر والإفطار عند المغرب."}};
const HM={en:["Muharram","Safar","Rabi' al-awwal","Rabi' al-thani","Jumada al-ula","Jumada al-akhira","Rajab","Sha'ban","Ramadan","Shawwal","Dhu al-Qi'dah","Dhu al-Hijjah"],
 ar:["محرّم","صفر","ربيع الأول","ربيع الآخر","جمادى الأولى","جمادى الآخرة","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"]};
const P=["Fajr","Sunrise","Dhuhr","Asr","Maghrib","Isha"],ICON={Fajr:"🌌",Sunrise:"🌅",Dhuhr:"☀️",Asr:"🌤️",Maghrib:"🌇",Isha:"🌙"};
let S=Object.assign({lang:(navigator.language||"").startsWith("ar")?"ar":"en",theme:"dark",mode:"auto",lat:null,lng:null,country:"",city:"",method:"",school:"0"},JSON.parse(localStorage.getItem("salah")||"{}"));
let T=null,Q=null,R=null,heading=null,tz="UTC";
const save=()=>localStorage.setItem("salah",JSON.stringify(S));
const t=k=>D[S.lang][k]??D.en[k]??k;
const num=v=>S.lang==="ar"?String(v).replace(/\d/g,d=>"٠١٢٣٤٥٦٧٨٩"[d]):String(v);
const lc=()=>S.lang==="ar"?"ar-EG":"en-GB";
const pad=n=>String(n).padStart(2,"0");
const dmy=d=>`${pad(d.getDate())}-${pad(d.getMonth()+1)}-${d.getFullYear()}`;
const parseDMY=s=>{const[a,b,c]=s.split("-").map(Number);return new Date(c,b-1,a)};
const fmtDate=s=>parseDMY(s).toLocaleDateString(lc(),{weekday:"long",day:"numeric",month:"long",year:"numeric"});
const fmt=v=>{const[h,m]=v.slice(0,5).split(":").map(Number);const ap=h>=12?(S.lang==="ar"?"م":"PM"):(S.lang==="ar"?"ص":"AM");return num(`${h%12||12}:${pad(m)}`)+" "+ap};
const secs=v=>{const[h,m]=v.slice(0,5).split(":").map(Number);return h*3600+m*60};
function status(msg,info){const e=$("#status");e.hidden=!msg;e.textContent=msg||"";e.classList.toggle("info",!!info)}
async function api(p,q={}){const u=new URL(`/api/${p}/`,location.origin);Object.entries(q).forEach(([k,v])=>v!==""&&v!=null&&u.searchParams.set(k,v));
 const r=await fetch(u),j=await r.json();if(!r.ok)throw new Error(j.error||t("err"));return j}
const where=()=>S.mode==="auto"?{lat:S.lat,lng:S.lng}:{country:S.country,city:S.city};
const common=()=>({method:S.method,school:S.school});
const hasLoc=()=>S.mode==="auto"?S.lat!=null:!!(S.country&&S.city);

/* ---------- i18n / theme ---------- */
function applyLang(){const h=document.documentElement;h.lang=S.lang;h.dir=S.lang==="ar"?"rtl":"ltr";h.dataset.theme=S.theme;
 $$("[data-i18n]").forEach(e=>e.textContent=t(e.dataset.i18n));
 $$("#selMethod option[data-en]").forEach(o=>o.textContent=(S.lang==="ar"?o.dataset.ar:o.dataset.en));
 fillMonths();renderTimes();renderQibla();renderRamadan();hijriNow();locLabel()}
function fillMonths(){const v=$("#hM").value;$("#hM").innerHTML=HM[S.lang].map((m,i)=>`<option value="${i+1}">${num(i+1)} – ${m}</option>`).join("");if(v)$("#hM").value=v}

/* ---------- location ---------- */
function gps(){return new Promise((ok,no)=>{if(!navigator.geolocation)return no();
 navigator.geolocation.getCurrentPosition(p=>{S.lat=+p.coords.latitude.toFixed(5);S.lng=+p.coords.longitude.toFixed(5);save();ok()},no,{enableHighAccuracy:true,timeout:15000,maximumAge:600000})})}
function locLabel(){$("#locText").textContent=S.mode==="auto"?(S.lat!=null?`${num(S.lat.toFixed(2))}, ${num(S.lng.toFixed(2))}`:t("useGps")):(S.city?`${S.city}, ${S.country}`:t("country"))}
async function loadCountries(){try{const c=await api("countries");$("#selCountry").innerHTML=`<option value=""></option>`+c.map(n=>`<option>${n}</option>`).join("");$("#selCountry").value=S.country}catch(e){}}
async function loadCities(country,sel){const el=$("#selCity");el.innerHTML="";if(!country)return;
 try{const c=await api("cities",{country});el.innerHTML=`<option value=""></option>`+c.map(n=>`<option>${n}</option>`).join("");el.value=sel||""}catch(e){}}
function syncForm(){$("#mAuto").classList.toggle("on",S.mode==="auto");$("#mManual").classList.toggle("on",S.mode==="manual");
 $("#autoBox").hidden=S.mode!=="auto";$("#manualBox").hidden=S.mode!=="manual";
 $("#selMethod").value=S.method;$("#selSchool").value=S.school;$("#gpsInfo").textContent=S.lat!=null?`${S.lat}, ${S.lng}`:""}
const drawer=o=>{$("#drawer").classList.toggle("open",o);$("#scrim").classList.toggle("on",o)};

/* ---------- prayer times ---------- */
async function loadAll(){
 if(S.mode==="auto"&&S.lat==null){status(t("locating"),1);try{await gps()}catch(e){status(t("denied"));S.mode="manual";save();syncForm();drawer(true);return}}
 if(!hasLoc()){status(t("pickCity"),1);return}
 status(t("loading"),1);
 try{T=await api("timings",{...where(),...common(),date:dmy(new Date())});tz=T.meta.timezone||"UTC";status("");
  Q=await api("qibla",{lat:T.meta.latitude,lng:T.meta.longitude});R=null;
  renderTimes();renderQibla();hijriNow();locLabel();if($(".tabs .on").dataset.tab==="ramadan")loadRamadan()}
 catch(e){status(e.message)}}
const nowSecs=()=>{const p=new Intl.DateTimeFormat("en-GB",{timeZone:tz,hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).formatToParts(new Date());
 const g=k=>+p.find(x=>x.type===k).value;return g("hour")%24*3600+g("minute")*60+g("second")};
function renderTimes(){if(!T)return;
 $("#grid").innerHTML=P.map(p=>`<div class="pcard" data-p="${p}"><i>${ICON[p]}</i><b>${t(p)}</b><time>${fmt(T.timings[p])}</time></div>`).join("");
 const h=T.date.hijri;$("#dateG").textContent=fmtDate(T.date.gregorian.date);
 $("#meta").textContent=`${S.lang==="ar"?h.month.ar:h.month.en} ${num(h.day)}, ${num(h.year)} ${t("ah")} · ${T.meta.method.name}`;tick()}
function tick(){if(!T)return;const n=nowSecs(),s=P.map(p=>secs(T.timings[p]));
 let i=s.findIndex(x=>x>n),nx,pv;if(i<0){nx=s[0]+86400;pv=s[5];i=0}else{nx=s[i];pv=i?s[i-1]:s[5]-86400}
 const d=nx-n;$("#nextName").textContent=t(P[i]);
 $("#count").textContent=num(`${pad(d/3600|0)}:${pad(d%3600/60|0)}:${pad(d%60)}`);
 $("#arc").style.strokeDashoffset=100-Math.max(0,Math.min(100,(n-pv)/(nx-pv)*100));
 $$(".pcard").forEach((c,k)=>{c.classList.toggle("next",k===i);c.classList.toggle("past",s[k]<=n&&k!==i)})}
setInterval(tick,1000);
function hijriNow(){if(!T)return;const h=T.date.hijri;$("#hijriNow").textContent=`${num(h.day)} ${S.lang==="ar"?h.month.ar:h.month.en} ${num(h.year)} ${t("ah")}`}

/* ---------- qibla ---------- */
(function(){let h="";for(let a=0;a<360;a+=10)h+=`<line class="tk" y1="-138" y2="${a%90?-130:-124}" transform="rotate(${a})"/>`;$("#ticks").innerHTML=h})();
function renderQibla(){if(!Q)return;$("#qDeg").textContent=num(Q.bearing.toFixed(1))+"°";$("#qDist").textContent=`${num(Q.distance_km.toLocaleString("en"))} ${t("km")}`;
 $("#kmark").setAttribute("transform",`rotate(${Q.bearing})`);drawCompass()}
function drawCompass(){$("#dial").style.transform=`rotate(${-(heading??0)}deg)`;
 if(heading!=null&&Q){const diff=Math.abs(((Q.bearing-heading+540)%360)-180);$("#compass").classList.toggle("ok",diff<4);$("#qAlign").hidden=diff>=4}}
async function startCompass(){
 try{if(window.DeviceOrientationEvent&&DeviceOrientationEvent.requestPermission&&await DeviceOrientationEvent.requestPermission()!=="granted")return}catch(e){return}
 const on=e=>{const a=e.webkitCompassHeading??(e.absolute&&e.alpha!=null?360-e.alpha:null);if(a!=null){heading=a;drawCompass()}};
 addEventListener("deviceorientationabsolute",on,true);addEventListener("deviceorientation",on,true);$("#compassBtn").hidden=true}

/* ---------- ramadan ---------- */
async function loadRamadan(){if(!hasLoc())return;if(R)return renderRamadan();
 try{R=await api("ramadan",{...where(),...common()});renderRamadan()}catch(e){status(e.message)}}
function renderRamadan(){if(!R)return;const td=dmy(new Date());
 $("#rTitle").textContent=t("ramadanOf").replace("{y}",num(R.year));
 $("#rSub").textContent=t("rSub").replace("{d}",fmtDate(R.days[0].greg));
 $("#rBody").innerHTML=R.days.map(d=>`<tr class="${d.greg===td?"today":""}"><td>${num(+d.hijri)}</td>
  <td>${parseDMY(d.greg).toLocaleDateString(lc(),{weekday:"short",day:"numeric",month:"short"})}</td><td>${fmt(d.fajr)}</td><td>${fmt(d.maghrib)}</td></tr>`).join("")}

/* ---------- hijri converter ---------- */
const hOut=h=>`<b>${num(h.day)} ${S.lang==="ar"?h.month.ar:h.month.en} ${num(h.year)} ${t("ah")}</b>${S.lang==="ar"?h.weekday.ar:h.weekday.en}`;
$("#g2hBtn").onclick=async()=>{const v=$("#gIn").value;if(!v)return;const[y,m,d]=v.split("-");
 try{const r=await api("convert",{type:"g2h",date:`${d}-${m}-${y}`});$("#g2hRes").innerHTML=hOut(r.hijri)}catch(e){$("#g2hRes").textContent=e.message}};
$("#h2gBtn").onclick=async()=>{const d=$("#hD").value,m=$("#hM").value,y=$("#hY").value;if(!d||!y)return;
 try{const r=await api("convert",{type:"h2g",date:`${d}-${m}-${y}`});$("#h2gRes").innerHTML=`<b>${fmtDate(r.gregorian.date)}</b>`}catch(e){$("#h2gRes").textContent=e.message}};

/* ---------- wiring ---------- */
$("#tabs").onclick=e=>{const b=e.target.closest("button");if(!b)return;
 $$(".tabs button,.pane").forEach(x=>x.classList.remove("on"));b.classList.add("on");$("#"+b.dataset.tab).classList.add("on");
 if(b.dataset.tab==="ramadan")loadRamadan()};
$("#langBtn").onclick=()=>{S.lang=S.lang==="ar"?"en":"ar";save();applyLang()};
$("#themeBtn").onclick=()=>{S.theme=S.theme==="dark"?"light":"dark";save();applyLang()};
$("#locChip").onclick=()=>{syncForm();drawer(true)};$("#closeDrawer").onclick=$("#scrim").onclick=()=>drawer(false);
$("#mAuto").onclick=()=>{S.mode="auto";syncForm()};$("#mManual").onclick=()=>{S.mode="manual";syncForm()};
$("#gpsBtn").onclick=async()=>{status(t("locating"),1);try{await gps();status("");syncForm();locLabel()}catch(e){status(t("denied"))}};
$("#selCountry").onchange=e=>{S.country=e.target.value;S.city="";loadCities(S.country)};
$("#apply").onclick=()=>{S.city=$("#selCity").value||S.city;S.method=$("#selMethod").value;S.school=$("#selSchool").value;save();drawer(false);loadAll()};
$("#compassBtn").onclick=startCompass;

(async function init(){applyLang();syncForm();await loadCountries();if(S.country)await loadCities(S.country,S.city);
 const d=new Date();$("#gIn").value=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
 await loadAll();if(T){const h=T.date.hijri;$("#hD").value=h.day;$("#hM").value=h.month.number;$("#hY").value=h.year}})();
