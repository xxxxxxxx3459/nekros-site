/* ============ ЗВУКИ ============ */
let audioCtx = null;
function playSound(type) {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        const now = audioCtx.currentTime;
        if (type === 'laser') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(); osc.stop(now + 0.1);
        } else if (type === 'explosion') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(10, now + 0.3);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(); osc.stop(now + 0.3);
        } else if (type === 'jump') {
            osc.type = 'square'; osc.frequency.setValueAtTime(300, now);
            osc.frequency.linearRampToValueAtTime(600, now + 0.1);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
            osc.start(); osc.stop(now + 0.1);
        } else if (type === 'gameover') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 1.2);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
            osc.start(); osc.stop(now + 1.2);
        } else if (type === 'win') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(400, now);
            osc.frequency.setValueAtTime(600, now + 0.1);
            osc.frequency.setValueAtTime(800, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
            osc.start(); osc.stop(now + 0.4);
        } else if (type === 'turbo') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(2000, now + 0.4);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.start(); osc.stop(now + 0.4);
        }
    } catch(e) {}
}

function speakPotracheno() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("Потрачено");
        utterance.lang = 'ru-RU'; utterance.rate = 0.8; utterance.pitch = 0.6; utterance.volume = 1;
        window.speechSynthesis.speak(utterance);
    }
}

const STORAGE_KEY = 'sunset_user_v50';
const AVATAR_COLORS = ['#ff6b6b','#a06cd5','#4a90e2','#ff5e8c','#4ecdc4','#f5a623','#7b68ee','#26a69a','#ba68c8','#e91e63'];
let chosenColor = '#ff6b6b';

let currentUser = null;
let chats = {}, groups = [], channels = [], posts = [], userLikes = [];
let activeChat = null, currentSearchTab = 'people';

let gameState = {
    shooter: { plane: 1, income: 1, fireRate: 1, turbo: 1, coins: 0, unlocked: 1 },
    runner: { unlocked: 1 }
};

const FIRST_NAMES_M = ['Александр','Дмитрий','Максим','Сергей','Андрей','Алексей','Артём','Илья','Кирилл','Михаил','Никита','Матвей','Роман','Егор','Иван','Денис','Евгений','Даниил','Тимур'];
const FIRST_NAMES_F = ['Анна','Мария','Елена','Дарья','Алина','Ирина','Екатерина','Наталья','Ольга','София','Татьяна','Виктория','Полина','Юлия','Ксения','Алиса','Валерия','Вероника','Маргарита','Анастасия'];
const LAST_NAMES = ['Иванов','Смирнов','Кузнецов','Попов','Васильев','Петров','Соколов','Михайлов','Новиков','Фёдоров','Морозов','Волков','Алексеев','Лебедев','Семёнов','Козлов','Степанов','Николаев','Орлов','Андреев'];

function getRandomFullName() {
    const isMale = Math.random() > 0.5;
    const firstName = isMale ? rnd(FIRST_NAMES_M) : rnd(FIRST_NAMES_F);
    const lastName = rnd(LAST_NAMES);
    return `${firstName} ${isMale ? lastName : lastName + 'а'}`;
}
function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

const ALL_USERS = [];
for(let i=0; i<300; i++) {
    const name = getRandomFullName();
    ALL_USERS.push({ id: 'u_' + i, name: name, color: rnd(AVATAR_COLORS), emoji: name.charAt(0), type: 'person', lastSeen: rnd(['в сети', 'недавно', 'год назад']), allowInvites: Math.random() > 0.2 });
}
const PEOPLE = [
  { id: 'alex', name: 'Алекс', color: '#ff6b6b', emoji: 'A', type: 'person', lastSeen: 'в сети' },
  { id: 'maria', name: 'Мария', color: '#a06cd5', emoji: 'M', type: 'person', lastSeen: 'в сети' },
  { id: 'dmitry', name: 'Дмитрий', color: '#4a90e2', emoji: 'Д', type: 'person', lastSeen: 'в сети' }
];
const SONGS = [
  ["Imagine Dragons", "Believer"],["Ed Sheeran", "Shape of You"],["The Weeknd", "Blinding Lights"],
  ["Dua Lipa", "Levitating"],["Billie Eilish", "Bad Guy"],["Post Malone", "Circles"],
  ["Harry Styles", "As It Was"],["The Kid LAROI", "Stay"],["Glass Animals", "Heat Waves"]
];
const BOT_POSTS = [
    { id: 'bp1', author: 'Мария', color: '#a06cd5', text: 'Всем привет! Только что вернулась из спортзала 💪', time: '10 минут назад', views: 45, likes: 12, reposts: 0, comments: [] },
    { id: 'bp2', author: 'Дмитрий', color: '#4a90e2', text: 'Сделал пасту с креветками на ужин 🍝', time: '25 минут назад', views: 82, likes: 24, reposts: 1, comments: [] }
];

// ============ ИНИЦИАЛИЗАЦИЯ И РЕГИСТРАЦИЯ ============
const avatarPreview = document.getElementById('avatarPreview');
const regName = document.getElementById('regName');
const regBtn = document.getElementById('regBtn');
const regError = document.getElementById('regError');

if(avatarPreview) {
    avatarPreview.style.background = chosenColor;
    avatarPreview.textContent = '?';
    avatarPreview.addEventListener('click', function() {
      let i = AVATAR_COLORS.indexOf(chosenColor);
      i = (i + 1) % AVATAR_COLORS.length;
      chosenColor = AVATAR_COLORS[i];
      avatarPreview.style.background = chosenColor;
    });
}

if(regName) {
    regName.addEventListener('input', function() {
      const n = (regName.value || '').trim();
      avatarPreview.textContent = n ? n.charAt(0).toUpperCase() : '?';
      if(n.length >= 2) regError.style.display = 'none';
    });
    regName.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.keyCode === 13) regBtn.click();
    });
}

function continueToApp() {
    const n = (regName.value || '').trim();
    if (n.length < 2) { regError.style.display = 'block'; return; }
    regError.style.display = 'none';

    currentUser = { 
        name: n, color: chosenColor, emoji: n.charAt(0).toUpperCase(), 
        photo: null, premium: null, isAdmin: false, 
        lastSeen: 'в сети', pinnedIds: [],
        allowInvites: true, allowCalls: true 
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser)); } catch(e) {}
    startApp();
}
if(regBtn) regBtn.addEventListener('click', continueToApp);

function startApp() {
  if (!currentUser) return;
  document.getElementById('register').classList.add('hide');
  document.getElementById('panel').classList.add('show');
  
  try {
    chats = JSON.parse(localStorage.getItem('sunset_chats') || '{}');
    groups = JSON.parse(localStorage.getItem('sunset_groups') || '[]');
    channels = JSON.parse(localStorage.getItem('sunset_channels') || '[]');
    posts = JSON.parse(localStorage.getItem('sunset_posts') || '[]');
    userLikes = JSON.parse(localStorage.getItem('sunset_likes') || '[]');
    const savedGames = JSON.parse(localStorage.getItem('sunset_games') || 'null');
    if (savedGames) gameState = savedGames;
  } catch(e) {}

  updateProfileUI();
  renderChatsList('people');
  renderPosts();
  renderMusic(); 
  renderGames();
  renderMyPage(); 
}

function updateProfileUI() {
  const av = document.getElementById('myAvatarSmall');
  if(!av) return;
  if(currentUser.photo) { av.style.backgroundImage = `url(${currentUser.photo})`; av.textContent = ''; } 
  else { av.style.backgroundImage = 'none'; av.style.background = currentUser.color; av.textContent = currentUser.emoji; }
  
  document.getElementById('myNameLabel').textContent = currentUser.name;
  document.getElementById('myStatusLabel').textContent = currentUser.lastSeen;
  
  const promptAv = document.getElementById('promptAvatar');
  if(promptAv) {
      if(currentUser.photo) { promptAv.style.backgroundImage = `url(${currentUser.photo})`; promptAv.textContent = ''; } 
      else { promptAv.style.background = currentUser.color; promptAv.textContent = currentUser.emoji; }
  }
}

document.getElementById('myProfileBtn').addEventListener('click', () => {
    document.getElementById('profileAvatarBig').textContent = currentUser.photo ? '' : currentUser.emoji;
    document.getElementById('profileAvatarBig').style.background = currentUser.photo ? 'transparent' : currentUser.color;
    document.getElementById('profileAvatarBig').style.backgroundImage = currentUser.photo ? `url(${currentUser.photo})` : 'none';
    document.getElementById('myStatusSelect').value = currentUser.lastSeen;
    document.getElementById('profileModal').classList.add('show');
});

document.getElementById('profilePhotoInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 300;
                let width = img.width, height = img.height;
                if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
                else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                currentUser.photo = compressedDataUrl;
                document.getElementById('profileAvatarBig').textContent = '';
                document.getElementById('profileAvatarBig').style.background = 'transparent';
                document.getElementById('profileAvatarBig').style.backgroundImage = `url(${compressedDataUrl})`;
                updateProfileUI();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('saveProfileBtn').addEventListener('click', () => {
    currentUser.lastSeen = document.getElementById('myStatusSelect').value;
    currentUser.allowInvites = document.getElementById('profilePrivacyToggle').checked;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    updateProfileUI(); alert('Профиль обновлен!'); closeModal('profileModal');
});

document.getElementById('logoutFromProfileBtn').addEventListener('click', () => {
    if(confirm('Вы уверены что хотите выйти?')) { localStorage.removeItem(STORAGE_KEY); location.reload(); }
});

document.getElementById('settingsBtn').addEventListener('click', () => {
    document.getElementById('privacyGroupsToggle').checked = currentUser.allowInvites;
    document.getElementById('callsToggle').checked = currentUser.allowCalls;
    document.getElementById('settingsModal').classList.add('show');
});
function saveSettings() {
    currentUser.allowInvites = document.getElementById('privacyGroupsToggle').checked;
    currentUser.allowCalls = document.getElementById('callsToggle').checked;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    alert('Настройки сохранены'); closeModal('settingsModal');
}
window.closeModal = function(id) { document.getElementById(id).classList.remove('show'); };

document.getElementById('plusBtn').addEventListener('click', () => { document.getElementById('createModal').classList.add('show'); });
let currentCreateType = '';
document.getElementById('optPost').addEventListener('click', () => { closeModal('createModal'); openPostModal(); });
document.getElementById('optGroup').addEventListener('click', () => { closeModal('createModal'); openCreateGroup('group'); });
document.getElementById('optCommunity').addEventListener('click', () => { closeModal('createModal'); openCreateGroup('community'); });
document.getElementById('optChannel').addEventListener('click', () => { closeModal('createModal'); openCreateGroup('channel'); });
function openCreateGroup(type) {
    currentCreateType = type;
    const titles = { group: 'Новая группа', community: 'Новое сообщество', channel: 'Новый канал' };
    document.getElementById('cgTitle').textContent = titles[type];
    document.getElementById('cgName').value = '';
    document.getElementById('createGroupModal').classList.add('show');
}
document.getElementById('cgSubmit').addEventListener('click', () => {
    const name = document.getElementById('cgName').value.trim();
    if(!name) { alert('Введите название'); return; }
    const typeStr = document.getElementById('cgType').value;
    const allowCalls = document.getElementById('cgCalls').checked;
    const inviteAdmin = document.getElementById('cgInviteAdmin').checked;
    const newItem = { id: 'item_' + Date.now(), name: name, emoji: name.charAt(0).toUpperCase(), color: rnd(AVATAR_COLORS), owner: currentUser.name, type: currentCreateType, privacy: typeStr, allowCalls: allowCalls, inviteAdminOnly: inviteAdmin, members: [{id: 'me', name: currentUser.name}] };
    if(currentCreateType === 'channel') channels.push(newItem); else groups.push(newItem);
    localStorage.setItem('sunset_groups', JSON.stringify(groups));
    localStorage.setItem('sunset_channels', JSON.stringify(channels));
    closeModal('createGroupModal'); alert('Успешно создано!');
    document.querySelector('.nav-btn[data-tab="chats"]').click();
    renderChatsList(currentSearchTab, '');
});

document.querySelectorAll('.nav-btn').forEach(b => {
  b.addEventListener('click', () => {
    const tab = b.dataset.tab;
    document.querySelectorAll('.nav-btn').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(x => x.classList.remove('active'));
    b.classList.add('active'); document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('content').scrollTop = 0;
    if (tab === 'mypage') renderMyPage();
    if (tab === 'games') renderGames();
    if (tab === 'music') renderMusic(); 
  });
});
document.querySelectorAll('.search-tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.search-tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active'); currentSearchTab = t.dataset.stab;
    renderChatsList(currentSearchTab, document.getElementById('mainSearchInput').value.trim().toLowerCase());
  });
});
document.getElementById('mainSearchInput').addEventListener('input', e => {
  renderChatsList(currentSearchTab, e.target.value.trim().toLowerCase());
});

function renderChatsList(tab, q) {
  const list = document.getElementById('chatsList');
  if (!list) return; list.innerHTML = '';
  let items = [];
  if (tab === 'people') items = [...PEOPLE, ...ALL_USERS];
  else if (tab === 'groups') items = groups.filter(g => g.type === 'group');
  else if (tab === 'communities') items = groups.filter(g => g.type === 'community');
  else if (tab === 'channels') items = channels;
  if (q) items = items.filter(i => i.name.toLowerCase().includes(q));
  if (!items.length) { list.innerHTML = `<div class="empty-state"><div class="emoji">📭</div><p>Здесь пока пусто. Создайте что-нибудь через +</p></div>`; return; }
  items.forEach(item => {
    const div = document.createElement('div'); div.className = 'card-item';
    let badge = '';
    if(item.privacy === 'open') badge = '<span class="badge open">🌍 Открыто</span>';
    if(item.privacy === 'closed') badge = '<span class="badge closed">🔒 Закрыто</span>';
    let subText = item.type === 'person' ? item.lastSeen : `${(item.members || []).length} участников`;
    div.innerHTML = `<div class="card-avatar ${item.type === 'group' || item.type === 'community' ? 'group' : ''}" style="background:${item.color}">${item.emoji}</div>
      <div class="card-info"><div class="card-name">${esc(item.name)} ${badge}</div><div class="card-sub">${esc(subText)}</div></div>`;
    div.addEventListener('click', () => openChat(item)); list.appendChild(div);
  });
}

// ЧАТЫ
const chatEl = document.getElementById('chat');
const chatBody = document.getElementById('chatBody');

function openChat(item) {
  activeChat = item;
  document.getElementById('chatName').textContent = item.name;
  document.getElementById('chatAvatar').textContent = item.emoji;
  document.getElementById('chatAvatar').style.background = item.color;
  const statusEl = document.getElementById('chatStatus');
  const callBtn = document.getElementById('callBtn');
  if (item.type === 'person') {
      statusEl.textContent = item.lastSeen;
      document.getElementById('addParticipantsBtn').style.display = 'none';
      document.getElementById('deleteChatBtn').style.display = 'none';
      callBtn.style.display = currentUser.allowCalls ? 'block' : 'none';
  } else {
      statusEl.textContent = `${(item.members || []).length} участников`;
      document.getElementById('addParticipantsBtn').style.display = 'flex';
      document.getElementById('deleteChatBtn').style.display = item.owner === currentUser.name ? 'flex' : 'none';
      callBtn.style.display = (item.allowCalls && currentUser.allowCalls) ? 'block' : 'none';
  }
  chatEl.classList.add('show'); chatBody.innerHTML = '';
  const msgs = chats[item.id] || [];
  if (!msgs.length) chatBody.innerHTML = '<div class="empty-state"><div class="emoji">👋</div><p>Начните диалог первым!</p></div>';
  else { msgs.forEach(m => addMsgToDOM(m)); chatBody.scrollTop = chatBody.scrollHeight; }
}

document.getElementById('callBtn').addEventListener('click', () => { alert('📞 Звонок... (Демо)'); });

function addMsgToDOM(msg) {
  const div = document.createElement('div');
  if (msg.from === 'system') {
    div.style.cssText = 'align-self:center;font-size:12px;color:rgba(255,255,255,0.6);padding:6px 12px;background:rgba(0,0,0,0.3);border-radius:12px;margin:4px 0; text-align:center;';
    div.textContent = msg.text;
  } else {
    div.className = 'message ' + (msg.from === 'me' ? 'me' : 'them');
    div.innerHTML = esc(msg.text) + '<div class="time">' + msg.time + '</div>';
  }
  chatBody.appendChild(div);
}

function nowTime() { const d = new Date(); return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0'); }

document.getElementById('chatSend').addEventListener('click', () => {
  const t = document.getElementById('chatInput').value.trim();
  if (!t || !activeChat) return;
  const msg = { text: t, time: nowTime(), from: 'me' };
  if (!chats[activeChat.id]) chats[activeChat.id] = [];
  chats[activeChat.id].push(msg);
  localStorage.setItem('sunset_chats', JSON.stringify(chats));
  const emptyBlock = chatBody.querySelector('.empty-state'); if (emptyBlock) emptyBlock.remove();
  addMsgToDOM(msg); document.getElementById('chatInput').value = ''; chatBody.scrollTop = chatBody.scrollHeight;
  if (activeChat.type === 'person') {
      setTimeout(() => {
        const reply = { text: "Привет! Как дела?", time: nowTime(), from: 'them' };
        chats[activeChat.id].push(reply); localStorage.setItem('sunset_chats', JSON.stringify(chats));
        addMsgToDOM(reply); chatBody.scrollTop = chatBody.scrollHeight;
      }, 1500);
  }
});

document.getElementById('backBtn').addEventListener('click', () => { chatEl.classList.remove('show'); activeChat = null; });

document.getElementById('addParticipantsBtn').addEventListener('click', () => {
    if (!activeChat) return;
    document.getElementById('searchInviteInput').value = '';
    renderParticipantsList(ALL_USERS);
    document.getElementById('addParticipantsModal').classList.add('show');
});
document.getElementById('searchInviteInput').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    renderParticipantsList(ALL_USERS.filter(u => u.name.toLowerCase().includes(q)));
});

function renderParticipantsList(users) {
    const list = document.getElementById('participantsList'); list.innerHTML = '';
    if (users.length === 0) { list.innerHTML = '<div style="text-align:center; padding:20px; opacity:0.5;">Никого не найдено</div>'; return; }
    users.slice(0, 30).forEach(user => {
        const div = document.createElement('div'); div.className = 'viewer-item';
        const isAllowed = user.allowInvites !== false;
        div.innerHTML = `<div class="viewer-avatar" style="background:${user.color}">${user.emoji}</div>
            <div class="viewer-info"><div class="viewer-name">${user.name}</div>
            ${!isAllowed ? '<div class="viewer-time" style="color:#ff5e62;">Запрещено приглашать</div>' : ''}</div>
            <button class="invite-btn" ${!isAllowed ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>${isAllowed ? 'Пригласить' : 'Запрещено'}</button>`;
        if (isAllowed) {
            const btn = div.querySelector('.invite-btn');
            btn.addEventListener('click', () => {
                btn.textContent = 'Приглашен'; btn.style.color = '#86efac'; btn.disabled = true;
                if (!activeChat.members) activeChat.members = [];
                if (!activeChat.members.find(m => m.name === user.name)) activeChat.members.push(user);
                localStorage.setItem('sunset_groups', JSON.stringify(groups));
                const sysMsg = { text: `👤 ${user.name} присоединился`, time: nowTime(), from: 'system' };
                if (!chats[activeChat.id]) chats[activeChat.id] = [];
                chats[activeChat.id].push(sysMsg); localStorage.setItem('sunset_chats', JSON.stringify(chats));
                document.getElementById('chatStatus').textContent = `${activeChat.members.length} участников`;
                if (activeChat) { addMsgToDOM(sysMsg); chatBody.scrollTop = chatBody.scrollHeight; }
            });
        }
        list.appendChild(div);
    });
}

// ЛЕНТА
function renderPosts() {
  const el = document.getElementById('postsList');
  if(el) {
      el.innerHTML = '';
      const allFeed = [...posts, ...BOT_POSTS];
      allFeed.forEach(p => el.appendChild(buildPostEl(p)));
  }
  renderMyPagePosts();
}

function buildPostEl(p) {
  const div = document.createElement('div');
  div.className = 'post';
  const hasLiked = userLikes.includes(p.id);
  let mediaHtml = '';
  if (p.image) mediaHtml += `<img src="${esc(p.image)}" class="post-image" onerror="this.style.display='none'">`;
  
  div.innerHTML = `
    <div class="post-header">
      <div class="post-avatar" style="background:${p.color}">${p.author.charAt(0)}</div>
      <div class="post-meta">
        <div class="post-author">${esc(p.author)}</div>
        <div class="post-time">${p.time} · 👁️ ${p.views || 0}</div>
      </div>
    </div>
    <div class="post-text">${esc(p.text)}</div>
    ${mediaHtml}
    <div class="post-actions">
      <button class="post-action ${hasLiked ? 'liked' : ''} like-btn">${hasLiked ? '❤️' : '🤍'} <span>${p.likes || 0}</span></button>
      <button class="post-action repost-btn">🔄 <span>${p.reposts || 0}</span></button>
      <button class="post-action comment-btn">💬 <span>${(p.comments||[]).length}</span></button>
    </div>
    <div class="post-comments" style="display:none">
      <div class="comments-list">${(p.comments || []).map(c => `<div class="comment"><span class="comment-author">${esc(c.author)}:</span> ${esc(c.text)}</div>`).join('')}</div>
      <div class="comment-input-row">
        <input type="text" class="comment-input" placeholder="Написать...">
        <button class="comment-send">➤</button>
      </div>
    </div>`;
  const likeBtn = div.querySelector('.like-btn');
  likeBtn.addEventListener('click', function() {
    if (userLikes.includes(p.id)) { p.likes = Math.max(0, (p.likes || 1) - 1); userLikes = userLikes.filter(id => id !== p.id); this.classList.remove('liked'); this.innerHTML = `🤍 <span>${p.likes}</span>`; }
    else { p.likes = (p.likes || 0) + 1; userLikes.push(p.id); this.classList.add('liked'); this.innerHTML = `❤️ <span>${p.likes}</span>`; }
    localStorage.setItem('sunset_likes', JSON.stringify(userLikes));
  });
  div.querySelector('.repost-btn').addEventListener('click', function() { p.reposts = (p.reposts || 0) + 1; this.innerHTML = `🔄 <span>${p.reposts}</span>`; });
  const cb = div.querySelector('.post-comments');
  div.querySelector('.comment-btn').addEventListener('click', () => { cb.style.display = cb.style.display === 'none' ? 'block' : 'none'; });
  const input = div.querySelector('.comment-input'), send = div.querySelector('.comment-send'), list = div.querySelector('.comments-list');
  send.addEventListener('click', () => {
    const t = input.value.trim(); if (!t) return;
    if (!p.comments) p.comments = [];
    p.comments.push({ author: currentUser.name, text: t });
    input.value = ''; list.insertAdjacentHTML('beforeend', `<div class="comment"><span class="comment-author">${esc(currentUser.name)}:</span> ${esc(t)}</div>`);
  });
  return div;
}

function openPostModal() {
    document.getElementById('formModal').classList.add('show');
    document.getElementById('formText').value = '';
    document.getElementById('formPhoto').value = '';
    document.getElementById('formSubmit').onclick = () => {
        const text = document.getElementById('formText').value.trim();
        if (!text) { alert('Введите текст!'); return; }
        const image = document.getElementById('formPhoto').value.trim();
        posts.unshift({ id: 'p_' + Date.now(), author: currentUser.name, color: currentUser.color, text: text, time: 'только что', views: 0, likes: 0, reposts: 0, comments: [], image: image || null });
        localStorage.setItem('sunset_posts', JSON.stringify(posts));
        closeModal('formModal'); renderPosts(); renderMyPage();
    };
}

function renderMyPage() {
    const pinnedContainer = document.getElementById('pinnedSections');
    pinnedContainer.innerHTML = '<div class="pinned-empty">Купите Premium для закрепления разделов</div>';
    renderMyPagePosts();
}

function renderMyPagePosts() {
    const myPageList = document.getElementById('myPagePostsList');
    if (!myPageList) return;
    myPageList.innerHTML = '';
    const myPosts = posts.filter(p => p.author === currentUser.name);
    if (!myPosts.length) myPageList.innerHTML = '<div class="empty-state"><div class="emoji">📝</div><p>У вас пока нет постов.</p></div>';
    else myPosts.forEach(p => myPageList.appendChild(buildPostEl(p)));
}

function renderMusic() {
    const el = document.getElementById('musicList');
    if (!el) return;
    let html = '';
    SONGS.forEach((s, i) => {
        html += `<div class="track"><div class="track-left"><div class="track-num">${i + 1}</div><div class="track-info"><div class="track-name">${esc(s[1])}</div><div class="track-artist">${esc(s[0])}</div></div></div><div class="track-play">▶</div></div>`;
    });
    el.innerHTML = html;
}

function renderGames() {
    const grid = document.getElementById('gamesGrid');
    if (!grid) return;
    grid.innerHTML = `
        <div class="game-card" onclick="startGame('shooter')"><div class="game-icon">✈️</div><div class="game-title">Шутер</div><div class="game-desc">Ур. ${gameState.shooter.unlocked}</div></div>
        <div class="game-card" onclick="startGame('runner')"><div class="game-icon">🟦</div><div class="game-title">Квадратик</div><div class="game-desc">Ур. ${gameState.runner.unlocked}</div></div>
    `;
}

function startGame(type) {
    document.getElementById('gameOverlay').classList.add('show');
    document.getElementById('gameArea').innerHTML = '<div style="color:#fff; text-align:center;">Игра загружается...<br><br><button class="game-btn" onclick="closeGame()">Закрыть</button></div>';
}

function closeGame() {
    document.getElementById('gameOverlay').classList.remove('show');
}

window.addEventListener('load', function() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try { currentUser = JSON.parse(saved); startApp(); } catch(e) { console.error(e); }
    }
});
