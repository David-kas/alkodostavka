(()=>{const K="cart";const state=JSON.parse(localStorage.getItem(K)||"[]");
const drawer=()=>document.getElementById("cart-drawer");
function ensureOverlay(){let o=document.getElementById("cart-overlay");if(o)return o;o=document.createElement("div");o.id="cart-overlay";o.className="cart-overlay";o.setAttribute("aria-hidden","true");document.body.appendChild(o);return o;}
const overlay=()=>ensureOverlay();
const save=()=>{localStorage.setItem(K,JSON.stringify(state));document.querySelectorAll(".cart-badge").forEach(el=>el.textContent=state.reduce((a,i)=>a+i.quantity,0));render();};
window.addToCart=(id)=>{const p=(window.PRODUCTS||[]).find(x=>x.id===id);if(!p||p.inStock===false)return;const ex=state.find(x=>x.id===id);if(ex)ex.quantity++;else state.push({...p,quantity:1});save();openCart();};
window.removeFromCart=(id)=>{const i=state.findIndex(x=>x.id===id);if(i>-1)state.splice(i,1);save();};
window.changeQty=(id,v)=>{const it=state.find(x=>x.id===id);if(!it)return;it.quantity=Math.max(1,it.quantity+v);save();};
function render(){const box=document.getElementById("cart-items");const total=document.getElementById("cart-total");if(!box||!total)return;if(!state.length){box.innerHTML="<p>Корзина пуста</p>";total.textContent="Итого: 0 ₽";return;}
let sum=0;box.innerHTML=state.map(i=>{sum+=i.price*i.quantity;return '<div class="cart-line"><h3>'+i.name+'</h3><p class="cart-line-meta">'+i.price+' ₽ × '+i.quantity+' = '+(i.price*i.quantity)+' ₽</p><div class="cart-line-actions"><button type="button" class="cart-qty" onclick="changeQty('+i.id+',-1)" aria-label="Меньше">−</button><button type="button" class="cart-qty" onclick="changeQty('+i.id+',1)" aria-label="Больше">+</button><button type="button" class="cart-remove" onclick="removeFromCart('+i.id+')">Удалить</button></div></div>';}).join("");
total.textContent='Итого: '+sum+' ₽';}
function setCartOpen(open){const d=drawer();const o=overlay();if(d){d.classList.toggle("open",open);d.setAttribute("aria-hidden",open?"false":"true");}
if(o)o.classList.toggle("show",open);document.body.classList.toggle("cart-open",open);}
function openCart(){setCartOpen(true);}
function closeCart(){setCartOpen(false);}
async function postTelegram(payload){const endpoints=["/send-telegram.php","/api/send-telegram","/api/telegram"];let lastError="Не удалось отправить заказ";
for(const url of endpoints){try{const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const text=await r.text();let j=null;try{j=text?JSON.parse(text):null;}catch(_){j=null;}
if(j&&j.success)return{ok:true};if(j&&j.error)lastError=j.error;else if(!r.ok)lastError="Ошибка сервера "+r.status;}catch(err){lastError=err&&err.message?err.message:lastError;}}
return{ok:false,error:lastError};}
async function sendOrder(e){e.preventDefault();if(!state.length){alert("Корзина пуста");return;}const f=e.target;const fd=new FormData(f);const btn=f.querySelector('button[type="submit"]');
const sum=state.reduce((a,i)=>a+i.price*i.quantity,0);const items=state.map(i=>'- '+i.name+' x '+i.quantity+' = '+(i.price*i.quantity)+' ₽').join('\n');
const dt=new Date().toLocaleString("ru-RU");const msg=['Новый заказ','', 'Товары:',items,'','Сумма: '+sum+' ₽','Имя: '+fd.get("name"),'Телефон: '+fd.get("phone"),'Адрес: '+fd.get("address"),'Комментарий: '+(fd.get("comment")||'нет'),'Дата: '+dt].join('\n');
if(btn){btn.disabled=true;btn.textContent="Отправка...";}
const result=await postTelegram({message:msg});
if(btn){btn.disabled=false;btn.textContent="Отправить заказ";}
if(result.ok){alert("Заказ отправлен! Ожидайте звонка.");state.splice(0,state.length);f.reset();save();closeCart();return;}
alert("Не удалось отправить заказ: "+result.error+"\n\nПозвоните +7 (999) 786-39-67 или напишите в Telegram.");}
document.addEventListener("click",(e)=>{if(e.target.closest(".js-cart-open"))openCart();if(e.target.closest(".js-cart-close")||e.target.closest("#cart-overlay"))closeCart();if(e.target.matches(".add-to-cart"))addToCart(Number(e.target.dataset.id));});
document.addEventListener("submit",(e)=>{if(e.target.id==="checkout-form")sendOrder(e)});save();})();
