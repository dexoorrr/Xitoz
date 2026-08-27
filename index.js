function getCorsHeaders(request) {
  const requestedHeaders =
    request.headers.get("Access-Control-Request-Headers");

  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      requestedHeaders ||
      "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
  };
}


const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      ...cors,
      "Content-Type": "application/json; charset=utf-8"
    }
  });

function getKey(request) {
  const auth = request.headers.get("Authorization");

  if (!auth?.startsWith("Bearer "))
    return null;

  return auth.slice(7).trim();
}

function validKey(request, env) {
  const key = getKey(request);

  if (!key || !env.API_KEYS)
    return false;

  return env.API_KEYS
    .split(",")
    .map(k => k.trim())
    .filter(Boolean)
    .includes(key);
}

/*
=========================================================
CONNECTOR
=========================================================
*/

const CLIENT_CODE = `

(async () => {

const API = "https://xitoz.dexceroficial.workers.dev";

const KEY = API_KEY;

document.getElementById("xitos-valley")?.remove();

const style = document.createElement("style");

style.textContent = \`
#xitos-valley{
position:fixed;
right:20px;
bottom:20px;
width:320px;
z-index:2147483647;
font-family:Arial,sans-serif;
color:#fff3cf;
background:linear-gradient(145deg,#513b25,#2d2117);
border:3px solid #c69a52;
border-radius:16px;
box-shadow:0 12px 40px #000b;
overflow:hidden
}
#xv-head{
padding:14px;
font-size:18px;
font-weight:bold;
background:linear-gradient(#6d9c45,#416b2c)
}
#xv-body{padding:14px}
.xv-input{
width:100%;
box-sizing:border-box;
padding:9px;
margin:5px 0 10px;
background:#211913;
color:#fff0c5;
border:2px solid #86643a;
border-radius:8px
}
.xv-btn{
padding:9px 12px;
margin:3px;
border:0;
border-radius:8px;
background:#659044;
color:white;
font-weight:bold;
cursor:pointer
}
#xv-status{
margin-top:10px;
padding:9px;
background:#17110d;
border-radius:8px;
font-size:12px
}
#xv-progress{
height:8px;
margin-top:8px;
background:#17110d;
border-radius:10px;
overflow:hidden
}
#xv-bar{
height:100%;
width:0%;
background:linear-gradient(90deg,#76b34b,#dbc65b)
}
\`;

document.head.appendChild(style);

const panel = document.createElement("div");

panel.id = "xitos-valley";

panel.innerHTML = \`
<div id="xv-head">🌾 Xitos Valley</div>

<div id="xv-body">

<label>⚡ Velocidade</label>

<input
id="xv-speed"
class="xv-input"
type="number"
value="35"
min="5"
max="1000">

<button class="xv-btn" id="xv-start">
▶ INICIAR
</button>

<button class="xv-btn" id="xv-stop">
■ PARAR
</button>

<div id="xv-status">
🟢 Pronto
</div>

<div id="xv-progress">
<div id="xv-bar"></div>
</div>

<div style="text-align:center;margin-top:10px">
🐱 🌱 🪨 🐔
</div>

</div>
\`;

document.body.appendChild(panel);

const speed =
panel.querySelector("#xv-speed");

const status =
panel.querySelector("#xv-status");

const bar =
panel.querySelector("#xv-bar");

let running = false;

function auth() {
return {
Authorization: "Bearer " + KEY
};
}

async function api(path, options = {}) {

const response = await fetch(
API + path,
{
...options,
headers:{
...auth(),
...(options.headers || {})
}
}
);

const data = await response.json();

if (!response.ok)
throw new Error(
data.error || "Erro na API"
);

return data;
}

function target() {

const active =
document.activeElement;

if(
active &&
(
active.tagName === "TEXTAREA" ||
active.tagName === "INPUT" ||
active.isContentEditable
)
)
return active;

return document.querySelector(
"textarea,input:not([type=hidden]),[contenteditable=true]"
);
}

function insert(el,char){

if(el.isContentEditable){

document.execCommand(
"insertText",
false,
char
);

return;
}

const start =
el.selectionStart ?? el.value.length;

const end =
el.selectionEnd ?? el.value.length;

el.setRangeText(
char,
start,
end,
"end"
);

el.dispatchEvent(
new InputEvent("input",{
bubbles:true,
inputType:"insertText",
data:char
})
);

}

async function run(job){

const el = target();

if(!el)
throw new Error(
"Nenhum campo editável encontrado."
);

el.focus();

const text = job.text;

for(let i=0;i<text.length;i++){

if(!running)
throw new Error("STOP");

let delay =
Number(speed.value)||35;

if(job.options?.variation)
delay += Math.random()*20-10;

await new Promise(
r=>setTimeout(
r,
Math.max(5,delay)
)
);

insert(el,text[i]);

const progress =
Math.round(
((i+1)/text.length)*100
);

bar.style.width =
progress+"%";

if((i+1)%10===0){

await api(
\`/v1/jobs/\${job.id}/status\`,
{
method:"POST",
headers:{
"Content-Type":
"application/json"
},
body:JSON.stringify({
status:"typing",
progress,
done:i+1
})
}
);

}

}

await api(
\`/v1/jobs/\${job.id}/status\`,
{
method:"POST",
headers:{
"Content-Type":
"application/json"
},
body:JSON.stringify({
status:"completed",
progress:100,
done:text.length
})
}
);

}

async function loop(){

while(running){

try{

status.textContent =
"🔎 Procurando job...";

const data =
await api("/v1/jobs/next");

if(!data.job){

status.textContent =
"🌙 Fila vazia";

await new Promise(
r=>setTimeout(r,3000)
);

continue;
}

bar.style.width="0%";

status.textContent =
"✏️ Digitando...";

await run(data.job);

status.textContent =
"🌟 Concluído!";

}catch(error){

if(error.message==="STOP")
status.textContent="⏹️ Parado";
else
status.textContent="❌ "+error.message;

running=false;

}

}

}

panel
.querySelector("#xv-start")
.onclick=()=>{

if(running)return;

running=true;

status.textContent =
"🌱 Xitos iniciado!";

loop();

};

panel
.querySelector("#xv-stop")
.onclick=()=>{

running=false;

status.textContent =
"⏹️ Parando...";

};

console.log(
"%c🌾 Xitos Valley conectado!",
"color:#8bc34a;font-size:18px;font-weight:bold"
);

})();

`;

/*
=========================================================
REQUEST HANDLER
=========================================================
*/

export default {

async fetch(request, env) {

if(request.method === "OPTIONS")
return new Response(null,{
status:204,
headers:cors
});

const url =
new URL(request.url);

/*
HOME
*/

if(
request.method === "GET" &&
url.pathname === "/"
){

return json({
ok:true,
name:"Xitos API",
version:"1.2.0",
status:"online"
});

}

/*
CLIENT
*/

if(
request.method === "GET" &&
url.pathname === "/v1/client"
){

if(!validKey(request,env))
return json({
ok:false,
error:"API Key inválida."
},401);

return json({
ok:true,
version:"1.2.0",
code:CLIENT_CODE
});

}

/*
SEU RESTANTE DA API
*/

return json({
ok:false,
error:"Endpoint não encontrado."
},404);

}

};
