const socket = io();

function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    if (message) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.classList.add('message', 'user');
        document.getElementById('chat-box').appendChild(messageElement);
        socket.emit('message', message); 
        chatInput.value = '';
    }
}

socket.on('reply', (reply) => {
    const replyElement = document.createElement('div');
    replyElement.innerHTML = reply; 
    replyElement.classList.add('message', 'bot');
    document.getElementById('chat-box').appendChild(replyElement);
    const chatBox = document.getElementById('chat-box');
    chatBox.scrollTop = chatBox.scrollHeight;
});

document.getElementById('chat-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});
