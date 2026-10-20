let currentUser = null;
let chats = {}, groups = [], channels = [], posts = [], userLikes = [];
let activeChat = null, currentSearchTab = 'people';
const STORAGE_KEY = 'sunset_user_v50';
const AVATAR_COLORS = ['#ff6b6b','#a06cd5','#4a90e2','#ff5e8c','#4ecdc4','#f5a623','#7b68ee','#26a69a','#ba68c8','#e91e63'];
let chosenColor = '#ff6b6b';

const ALL_USERS = [];
for(let i=0; i<50; i++) {
    const name = ['Алекс','Мария','Дмитрий','Анна','Иван','Елена'][Math.floor(Math.random()*6)] + ' ' + Math.floor(Math.random()*100);
    ALL_USERS.push({ id: 'u_' + i, name: name, color: AVATAR_COLORS[Math.floor(Math.random()*AVATAR_COLORS.length)], emoji: name.charAt(0), type: 'person', lastSeen: ['в сети','недавно','год назад'][Math.floor(Math.random()*3)], allowInvites: Math.random() > 0.2 });
}
const PEOPLE = [
  { id: 'alex', name: 'Алекс', color: '#ff6b6b', emoji: 'A', type: 'person', lastSeen: 'в сети' },
  { id: 'maria', name: 'Мария', color: '#a06cd5', emoji: 'M', type: 'person', lastSeen: 'в сети' }
];
const SONGS = [["Imagine Dragons", "Believer"],["Ed Sheeran", "Shape of You"],["The Weeknd", "Blinding Lights"]];
const BOT_POSTS = [{ id: 'bp1', author: 'Мария', color: '#a06cd5', text: 'Всем привет!', time: '10 минут назад', views: 45, likes: 12, reposts: 0, comments: [] }];

const avatarPreview = document.getElementById('avatarPreview');
const regName = document.getElementById('regName');
const regBtn = document.getElementById('regBtn');
const regError = document.getElementById('regError');

if(avatarPreview) {
    avatarPreview.style.background = chosenColor; avatarPreview.textContent = '?';
    avatarPreview.addEventListener('click', function() {
      let i = AVATAR_COLORS.indexOf(chosenColor); i = (i + 1) % AVATAR_COLORS.length;
      chosenColor = AVATAR_COLORS[i]; avatarPreview.style.background = chosenColor;
    });
}
if(regName) {
    regName.addEventListener('input', function() {
      const n = (regName.value || '').trim(); avatarPreview.textContent = n ? n.charAt(0).toUpperCase() : '?';
      if(n.length >= 2) regError.style.display = 'none';
    });
    regName.addEventListener('keydown', function(e) { if (e.key === 'Enter') regBtn.click(); });
}

function continueToApp() {
    const n = (regName.value || '').trim();
    if (n.length < 2) { regError.style.display = 'block'; return; }
    regError.style.display = 'none';
    currentUser = { name: n, color: chosenColor, emoji: n.charAt(0).toUpperCase(), photo: null, premium: null, lastSeen: 'в сети', pinnedIds: [], allowInvites: true, allowCalls: true };
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
    posts = JSON.parse(localStorage.getItem('sunset_posts') || '[]');
  } catch(e) {}
  updateProfileUI(); renderChatsList('people'); renderPosts(); renderMusic(); renderGames();
  document.getElementById('postsList').innerHTML = ''; renderPosts();
}

function updateProfileUI() {
  const av = document.getElementById('myAvatarSmall');
  if(!av) return;
  if(currentUser.photo) { av.style.backgroundImage = `url(${currentUser.photo})`; av.textContent = ''; } 
  else { av.style.backgroundImage = 'none'; av.style.background = currentUser.color; av.textContent = currentUser.emoji; }
  document.getElementById('myNameLabel').textContent = currentUser.name;
  document.getElementById('myStatusLabel').textContent = currentUser.lastSeen;
}

document.getElementById('myProfileBtn').addEventListener('click', () => {
    document.getElementById('profileAvatarBig').textContent = currentUser.photo ? '' : currentUser.emoji;
    document.getElementById('profileAvatarBig').style.background = currentUser.photo ? 'transparent' : currentUser.color;
    document.getElementById('profileAvatarBig').style.backgroundImage = currentUser.photo ? `url(${currentUser.photo})` : 'none';
    document.getElementById('myStatusSelect').value = currentUser.lastSeen;
    document.getElementById('profilePrivacyToggle').checked = currentUser.allowInvites;
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
                const MAX = 300; let w = img.width, h = img.height;
                if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } } else { if (h > MAX) { w *= MAX / h; h = MAX; } }
                canvas.width = w; canvas.height = h; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, w, h);
                currentUser.photo = canvas.toDataURL('image/jpeg', 0.7);
                document.getElementById('profileAvatarBig').textContent = '';
                document.getElementById('profileAvatarBig').style.background = 'transparent';
                document.getElementById('profileAvatarBig').style.backgroundImage = `url(${currentUser.photo})`;
                updateProfileUI();
            }; img.src = event.target.result;
        }; reader.readAsDataURL(file);
    }
});

document.getElementById('saveProfileBtn').addEventListener('click', () => {
    currentUser.lastSeen = document.getElementById('myStatusSelect').value;
    currentUser.allowInvites = document.getElementById('profilePrivacyToggle').checked;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser)); updateProfileUI(); closeModal('profileModal');
});
document.getElementById('logoutFromProfileBtn').addEventListener('click', () => { if(confirm('Выйти?')) { localStorage.removeItem(STORAGE_KEY); location.reload(); } });

document.getElementById('settingsBtn').addEventListener('click', () => {
    document.getElementById('privacyGroupsToggle').checked = currentUser.allowInvites;
    document.getElementById('settingsModal').classList.add('show');
});
function saveSettings() { currentUser.allowInvites = document.getElementById('privacyGroupsToggle').checked; localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser)); closeModal('settingsModal'); }
window.closeModal = function(id) { document.getElementById(id).classList.remove('show'); };

document.getElementById('plusBtn').addEventListener('click', () => { document.getElementById('createModal').classList.add('show'); });
let currentCreateType = '';
document.getElementById('optPost').addEventListener('click', () => { closeModal('createModal'); document.getElementById('formModal').classList.add('show'); });
document.getElementById('optGroup').addEventListener('click', () => { closeModal('createModal'); openCreateGroup('group'); });
document.getElementById('optCommunity').addEventListener('click', () => { closeModal('createModal'); openCreateGroup('community'); });
document.getElementById('optChannel').addEventListener('click', () => { closeModal('createModal'); openCreateGroup('channel'); });
function openCreateGroup(type) {
    currentCreateType = type;
    document.getElementById('cgTitle').textContent = { group: 'Новая группа', community: 'Сообщество', channel: 'Канал' }[type];
    document.getElementById('cgName').value = ''; document.getElementById('createGroupModal').classList.add('show');
}
document.getElementById('cgSubmit').addEventListener('click', () => {
    const name = document.getElementById('cgName').value.trim();
    if(!name) return;
    const newItem = { id: 'item_' + Date.now(), name, emoji: name.charAt(0).toUpperCase(), color: AVATAR_COLORS[Math.floor(Math.random()*AVATAR_COLORS.length)], owner: currentUser.name, type: currentCreateType, privacy: document.getElementById('cgType').value, members: [currentUser.name] };
    if(currentCreateType === 'channel') channels.push(newItem); else groups.push(newItem);
    localStorage.setItem('sunset_groups', JSON.stringify(groups));
    closeModal('createGroupModal'); renderChatsList(currentSearchTab, '');
});

document.querySelectorAll('.nav-btn').forEach(b => {
  b.addEventListener('click', () => {
    const tab = b.dataset.tab;
    document.querySelectorAll('.nav-btn').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(x => x.classList.remove('active'));
    b.classList.add('active'); document.getElementById('tab-' + tab).classList.add('active');
    if (tab === 'games') renderGames(); if (tab === 'music') renderMusic();
  });
});
document.querySelectorAll('.search-tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.search-tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active'); currentSearchTab = t.dataset.stab;
    renderChatsList(currentSearchTab, '');
  });
});

function renderChatsList(tab) {
  const list = document.getElementById('chatsList'); list.innerHTML = '';
  let items = [];
  if (tab === 'people') items = [...PEOPLE, ...ALL_USERS];
  else if (tab === 'groups') items = groups.filter(g => g.type === 'group');
  else if (tab === 'communities') items = groups.filter(g => g.type === 'community');
  else if (tab === 'channels') items = channels;
  items.forEach(item => {
    const div = document.createElement('div'); div.className = 'card-item';
    let subText = item.type === 'person' ? item.lastSeen : `${item.members ? item.members.length : 1} участников`;
    div.innerHTML = `<div class="card-avatar" style="background:${item.color}">${item.emoji}</div><div class="card-info"><div class="card-name">${item.name}</div><div class="card-sub">${subText}</div></div>`;
    div.addEventListener('click', () => openChat(item)); list.appendChild(div);
  });
}

const chatEl = document.getElementById('chat');
const chatBody = document.getElementById('chatBody');

function openChat(item) {
  activeChat = item; document.getElementById('chatName').textContent = item.name;
  document.getElementById('chatAvatar').textContent = item.emoji; document.getElementById('chatAvatar').style.background = item.color;
  const statusEl = document.getElementById('chatStatus');
  if (item.type === 'person') { statusEl.textContent = item.lastSeen; statusEl.className = 'status ' + (item.lastSeen === 'в сети' ? 'online' : ''); } 
  else { statusEl.textContent = `${item.members ? item.members.length : 1} участников`; }
  chatEl.classList.add('show'); chatBody.innerHTML = '';
  const msgs = chats[item.id] || [];
  if (!msgs.length) chatBody.innerHTML = '<div class="empty-state"><div class="emoji">👋</div><p>Начните диалог первым!</p></div>';
  else { msgs.forEach(m => { const d = document.createElement('div'); d.className = 'message ' + (m.from === 'me' ? 'me' : 'them'); d.innerHTML = m.text + '<div class="time">' + m.time + '</div>'; chatBody.appendChild(d); }); }
}

document.getElementById('chatSend').addEventListener('click', () => {
  const t = document.getElementById('chatInput').value.trim(); if (!t || !activeChat) return;
  const time = new Date().toLocaleTimeString().slice(0,5);
  if (!chats[activeChat.id]) chats[activeChat.id] = [];
  chats[activeChat.id].push({ text: t, time: time, from: 'me' });
  localStorage.setItem('sunset_chats', JSON.stringify(chats));
  chatBody.innerHTML = ''; chats[activeChat.id].forEach(m => { const d = document.createElement('div'); d.className = 'message ' + (m.from === 'me' ? 'me' : 'them'); d.innerHTML = m.text + '<div class="time">' + m.time + '</div>'; chatBody.appendChild(d); });
  document.getElementById('chatInput').value = ''; chatBody.scrollTop = chatBody.scrollHeight;
  
  const st = document.getElementById('chatStatus'); st.textContent = 'печатает...'; st.className = 'status typing';
  setTimeout(() => {
    chats[activeChat.id].push({ text: "Привет! Как дела?", time: time, from: 'them' }); localStorage.setItem('sunset_chats', JSON.stringify(chats));
    if (activeChat) { st.textContent = activeChat.lastSeen; st.className = 'status'; 
      const d = document.createElement('div'); d.className = 'message them'; d.innerHTML = "Привет! Как дела?" + '<div class="time">' + time + '</div>'; chatBody.appendChild(d); chatBody.scrollTop = chatBody.scrollHeight;
    }
  }, 2000);
});
document.getElementById('backBtn').addEventListener('click', () => { chatEl.classList.remove('show'); activeChat = null; });

document.getElementById('addParticipantsBtn').addEventListener('click', () => {
    document.getElementById('participantsList').innerHTML = '';
    ALL_USERS.forEach(user => {
        const isAllowed = user.allowInvites !== false;
        const div = document.createElement('div'); div.className = 'viewer-item';
        div.innerHTML = `<div class="viewer-avatar" style="background:${user.color}">${user.emoji}</div><div class="viewer-info"><div class="viewer-name">${user.name}</div>${!isAllowed ? '<div style="color:#ff5e62;font-size:11px;">Запрещено</div>' : ''}</div><button class="invite-btn" ${!isAllowed ? 'disabled style="opacity:0.5;"' : ''}>${isAllowed ? 'Пригласить' : 'Запрещено'}</button>`;
        if(isAllowed) div.querySelector('.invite-btn').addEventListener('click', function() { this.textContent = 'Приглашен'; this.style.color = '#86efac'; });
        document.getElementById('participantsList').appendChild(div);
    });
    document.getElementById('addParticipantsModal').classList.add('show');
});

function renderPosts() {
  const el = document.getElementById('postsList'); if(!el) return;
  el.innerHTML = ''; const allFeed = [...posts, ...BOT_POSTS];
  allFeed.forEach(p => {
    const div = document.createElement('div'); div.className = 'post';
    div.innerHTML = `<div class="post-header"><div class="post-avatar" style="background:${p.color}">${p.author.charAt(0)}</div><div class="post-meta"><div class="post-author">${p.author}</div><div class="post-time">${p.time}</div></div></div><div class="post-text">${p.text}</div><div class="post-actions"><button class="post-action">🤍 ${p.likes || 0}</button><button class="post-action">🔄 ${p.reposts || 0}</button><button class="post-action">💬 0</button></div>`;
    el.appendChild(div);
  });
}
document.getElementById('formSubmit').addEventListener('click', () => {
    const text = document.getElementById('formText').value.trim(); if(!text) return;
    posts.unshift({ id: 'p_' + Date.now(), author: currentUser.name, color: currentUser.color, text: text, time: 'только что', likes: 0, reposts: 0 });
    localStorage.setItem('sunset_posts', JSON.stringify(posts)); closeModal('formModal'); renderPosts();
});

function renderMusic() {
    const el = document.getElementById('musicList'); if (!el) return; let html = '';
    SONGS.forEach((s, i) => { html += `<div class="track"><div class="track-left"><div class="track-name">${s[1]}</div><div class="track-artist">${s[0]}</div></div><div class="track-play">▶</div></div>`; });
    el.innerHTML = html;
}

function renderGames() {
    const grid = document.getElementById('gamesGrid'); if (!grid) return;
    grid.innerHTML = `<div class="game-card" onclick="startGame('shooter')"><div class="game-icon">✈️</div><div class="game-title">Космические войны</div><div class="game-desc">Ур. 1</div></div><div class="game-card" onclick="startGame('runner')"><div class="game-icon">🟦</div><div class="game-title">Квадратик</div><div class="game-desc">Ур. 1</div></div>`;
}

window.addEventListener('load', function() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { try { currentUser = JSON.parse(saved); startApp(); } catch(e) {} }
});
