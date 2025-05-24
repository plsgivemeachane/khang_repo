const socket = io();
console.log(" socket:", socket)
const formRequest = document.querySelector('.formRequest');

if (formRequest) {
  formRequest.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const userId = formData.get('userId');

    // Emit sự kiện socket
    socket.emit('requestSeller', { userId });

    // Gửi form lên server
    fetch(this.action, {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      })
      .then((data) => {
        Toastify({
          text: "Yêu cầu đã được gửi thành công!",
          duration: 3000,
          gravity: "top",
          position: "right",
          className: "toastify toastify-success", // 👈 loại message
          stopOnFocus: true,
        }).showToast();
        
      })
      .catch((err) => {
        Toastify({
          text: 'Lỗi khi gửi yêu cầu!',
          duration: 3000,
          close: true,
          gravity: 'top',
          position: 'left',
          stopOnFocus: true,
          style: {
            background: 'linear-gradient(to right, #ff416c, #ff4b2b)',
          },
        }).showToast();
      });
  });
}
const roomId = document.querySelector('input[name="roomId"]').value;
const userId = document.querySelector('input[name="userIdRoom"]').value;
const messagesEl = document.getElementById('messages');
const input = document.getElementById('messageInput');

// Tham gia phòng
socket.emit('join-room', { roomId, userId });

// Nhận tin nhắn từ người khác hoặc chính mình
socket.on('receive-message', ({ userId: senderId, message, time }) => {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message');
  msgDiv.classList.add(senderId === userId ? 'right' : 'left');
  msgDiv.innerHTML = `<small><strong>${senderId}</strong> • ${new Date(
    time
  ).toLocaleTimeString()}</small><br>${message}`;
  messagesEl.appendChild(msgDiv);
  messagesEl.scrollTop = messagesEl.scrollHeight;
});

// Gửi tin nhắn
function sendMessage() {
  const message = input.value.trim();
  if (message) {
    socket.emit('send-message', { roomId, userId, message });
    input.value = '';
  }
}

socket.emit('join-room', { roomId: window.roomId, userId: window.userId });

const messagesElChat = document.getElementById('messages');
const inputChat = document.getElementById('messageInput');
const replyToUserSpan = document.getElementById('replyToUser');
const replyToContentSpan = document.getElementById('replyToContent');

let replyId = null;

document.addEventListener('click', function (e) {
  if (e.target.closest('.delete-btn')) {
    const btn = e.target.closest('.delete-btn');
    const chatId = btn.dataset.id;
    if (confirm('Xóa tin nhắn này?')) {
      fetch(`/api/chat/delete/${chatId}`, { method: 'DELETE' })
        .then(() => btn.closest('.chat-message').remove());
    }
  }

  if (e.target.closest('.reply-btn')) {
    const btn = e.target.closest('.reply-btn');
    const chat = btn.closest('.chat-message');
    if (!chat) return;
    replyId = chat.dataset.id;
    const user = chat.dataset.username;
    const content = chat.querySelector('.bubble')?.innerText.trim();
    if (!user || !content) return;
    replyToUserSpan.innerText = user;
    replyToContentSpan.innerText = content;
    document.getElementById('replyContext').style.display = 'block';
    input.focus();
  }
});

function clearReply() {
  replyId = null;
  document.getElementById('replyContext').style.display = 'none';
}

async function sendMessage() {
  const message = inputChat.value.trim();
  if (!message) return;

  socket.emit('send-message', {
    roomId: window.roomId,
    userId: window.userId,
    message,
    replyId
  });

  await fetch('/api/chat/send-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId: window.roomId, userId: window.userId, message, replyId })
  });

  inputChat.value = '';
  clearReply();
  await loadChats();
}

socket.on('receive-message', loadChats);

async function loadChats() {
  const res = await fetch(`/api/chat/list/${window.roomId}`);
  const chats = await res.json();

  messagesElChat.innerHTML = '';
  chats.forEach(chat => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('chat-message', chat.userSenderId == window.userId ? 'own' : 'other');
    wrapper.dataset.id = chat.id;
    wrapper.dataset.username = chat.users?.username;

    const bubble = document.createElement('div');
    bubble.classList.add('bubble');

    if (chat.replyMessage) {
      const replyPreview = document.createElement('div');
      replyPreview.classList.add('reply-preview');
      replyPreview.innerText = `Trả lời ${chat.replyMessage.users?.username}: "${chat.replyMessage.content}"`;
      bubble.appendChild(replyPreview);
    }

    bubble.appendChild(document.createTextNode(chat.content));
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
    messagesElChat.appendChild(wrapper);
  });

  messagesElChat.scrollTop = messagesElChat.scrollHeight;
}

loadChats();