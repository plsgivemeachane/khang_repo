const socket = io();
socket.emit('join-room', { roomId: window.roomId, userId: window.userId });

const messagesEl = document.getElementById('messages');
const input = document.getElementById('messageInput');
const imageInput = document.getElementById('imageInput');
const replyToUserSpan = document.getElementById('replyToUser');
const replyToContentSpan = document.getElementById('replyToContent');

let replyId = null;
let offset = 0;
const limit = 10;
let isLoading = false;

// 📌 Khi click nút xóa
document.addEventListener('click', async (e) => {
  if (e.target.closest('.delete-btn')) {
    const btn = e.target.closest('.delete-btn');
    const chatId = btn.dataset.id;
    if (confirm('Xóa tin nhắn này?')) {
      await fetch(`/api/chat/delete/${chatId}`, { method: 'DELETE' });
      btn.closest('.chat-message')?.remove();

      // ✅ Gửi socket để cập nhật cho người khác
      socket.emit('delete-message', {
        chatId,
        roomId: window.roomId,
      });
    }
  }

  // 📌 Lắng nghe tin nhắn bị xóa từ server
  socket.on('message-deleted', ({ chatId }) => {
    const msg = document.querySelector(`.chat-message[data-id="${chatId}"]`);
    if (msg) msg.remove();
  });

  if (e.target.closest('.reply-btn')) {
    const chat = e.target.closest('.chat-message');
    replyId = chat.dataset.id;
    replyToUserSpan.innerText = chat.dataset.username;
    replyToContentSpan.innerText =
      chat.querySelector('.bubble')?.innerText.trim() || '';
    document.getElementById('replyContext').style.display = 'block';
    input.focus();
  }
});

function clearReply() {
  replyId = null;
  document.getElementById('replyContext').style.display = 'none';
}

document
  .getElementById('chatForm')
  .addEventListener('submit', async function (e) {
    e.preventDefault();
    await sendMessage();
  });

async function sendMessage() {
  const message = input.value.trim();
  const file = imageInput.files[0];
  if (!message && !file) return;

  const formData = new FormData();
  formData.append('roomId', window.roomId);
  formData.append('userId', window.userId);
  if (message) formData.append('message', message);
  if (replyId) formData.append('replyId', replyId);
  if (file) formData.append('image', file);

  // Gửi đến server
  const res = await fetch('/api/chat/send-chat', {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();

  if (data.success) {
    socket.emit('send-message', {
      roomId: String(window.roomId),
      userId: parseInt(window.userId),
    });
  }

  input.value = '';
  imageInput.value = '';
  clearReply();
}

// Nhận realtime tin nhắn mới (từ socket)
socket.on('new-chat', ({ chat }) => {
  renderChat(chat, false);
  messagesEl.scrollTop = messagesEl.scrollHeight;
});

// Realtime cập nhật người đã xem
socket.on('message-seen-update', ({ chatId, seenUsers }) => {
  const wrapper = document.querySelector(`.chat-message[data-id="${chatId}"]`);
  if (!wrapper || !Array.isArray(seenUsers)) return;

  let seenWrapper = wrapper.querySelector('.seen-users');
  if (!seenWrapper) {
    seenWrapper = document.createElement('div');
    seenWrapper.className =
      'seen-users d-flex align-items-center text-muted small mt-1 ms-2';
    const eyeIcon = document.createElement('i');
    eyeIcon.className = 'bi bi-eye-fill me-1';
    seenWrapper.appendChild(eyeIcon);
    const seenText = document.createElement('span');
    seenText.className = 'seen-usernames';
    seenWrapper.appendChild(seenText);
    wrapper.appendChild(seenWrapper);
  }

  seenWrapper.querySelector('.seen-usernames').textContent =
    seenUsers.join(', ');
});

// Hàm load tin nhắn cũ
async function loadChats(isPrepend = false) {
  if (isLoading) return;
  isLoading = true;

  const res = await fetch(
    `/api/chat/list/${window.roomId}?limit=${limit}&offset=${offset}`
  );
  const chats = await res.json();
  const scrollBefore = messagesEl.scrollHeight;
  const fragment = document.createDocumentFragment();

  chats.reverse().forEach((chat) => renderChat(chat, isPrepend, fragment));

  if (isPrepend) {
    messagesEl.prepend(fragment);
    messagesEl.scrollTop = messagesEl.scrollHeight - scrollBefore;
  } else {
    messagesEl.appendChild(fragment);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  offset += chats.length;
  isLoading = false;
}

function renderChat(chat, isPrepend = false, target = messagesEl) {
  const wrapper = document.createElement('div');
  wrapper.classList.add(
    'chat-message',
    chat.userSenderId == window.userId ? 'own' : 'other'
  );
  wrapper.dataset.id = chat.id;
  wrapper.dataset.username = chat.users?.username;

  const bubble = document.createElement('div');
  bubble.classList.add('bubble');

  if (chat.replyMessage) {
    const replyPreview = document.createElement('div');
    replyPreview.classList.add('reply-preview');
    replyPreview.innerText = `Trả lời ${chat.replyMessage.users?.username}: "${
      chat.replyMessage.content || ''
    }"`;
    bubble.appendChild(replyPreview);
  }

  if (chat.imageUrl) {
    const img = document.createElement('img');
    img.src = chat.imageUrl;
    img.alt = 'uploaded image';
    img.className = 'img-thumbnail mb-2';
    img.style.maxWidth = '200px';
    bubble.appendChild(img);
  }

  if (chat.content) {
    const text = document.createTextNode(chat.content);
    bubble.appendChild(text);
  }

  const sender = document.createElement('div');
  sender.className = 'small text-muted';
  sender.innerText = chat.users?.username || '';
  wrapper.appendChild(sender);

  wrapper.appendChild(bubble);

  const actions = document.createElement('div');
  actions.classList.add('message-actions');

  const replyBtn = document.createElement('div');
  replyBtn.className = 'icon-circle reply-btn';
  replyBtn.dataset.id = chat.id;
  replyBtn.dataset.user = chat.users?.username;
  replyBtn.innerHTML = '<i class="bi bi-reply"></i>';
  actions.appendChild(replyBtn);

  if (chat.userSenderId == window.userId) {
    const delBtn = document.createElement('div');
    delBtn.className = 'icon-circle delete-btn';
    delBtn.dataset.id = chat.id;
    delBtn.innerHTML = '<i class="bi bi-trash"></i>';
    actions.appendChild(delBtn);
  }

  wrapper.appendChild(actions);

  if (!chat.chatReads?.some((r) => r.userId == window.userId)) {
    fetch('/api/chat/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: chat.id, userId: Number(window.userId) }),
    });
  }

  if (chat.chatReads?.length > 0) {
    const seenWrapper = document.createElement('div');
    seenWrapper.className = 'seen-users small mt-1 ms-2';

    const eyeIcon = document.createElement('i');
    eyeIcon.className = 'bi bi-eye-fill me-1 text-primary';
    seenWrapper.appendChild(eyeIcon);

    const seenList = document.createElement('span');
    seenList.className = 'seen-usernames';
    seenList.innerHTML = chat.chatReads
      .map((r) => r.user?.username)
      .filter(Boolean)
      .map(
        (name) => `<span class="badge bg-light text-dark me-1">${name}</span>`
      )
      .join('');
    seenWrapper.appendChild(seenList);

    wrapper.appendChild(seenWrapper);
  }

  isPrepend ? target.prepend(wrapper) : target.appendChild(wrapper);
}

messagesEl.addEventListener('scroll', () => {
  if (messagesEl.scrollTop === 0) loadChats(true);
});

loadChats();
