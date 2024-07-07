const socket = io();

function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();

    if (message) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.classList.add('message', 'user');
        document.getElementById('chat-box').appendChild(messageElement);

        socket.emit('message', message); // Send message to server

        chatInput.value = ''; // Clear the input
    }
}

socket.on('reply', (reply) => {
    const replyElement = document.createElement('div');
    replyElement.innerHTML = reply; // Render reply as HTML
    replyElement.classList.add('message', 'bot');
    
    // Sanitize reply to prevent XSS attacks if needed
    // You can use a library like DOMPurify (https://github.com/cure53/DOMPurify)
    // replyElement.innerHTML = DOMPurify.sanitize(reply);

    document.getElementById('chat-box').appendChild(replyElement);

    // Scroll to the bottom of the chat box
    const chatBox = document.getElementById('chat-box');
    chatBox.scrollTop = chatBox.scrollHeight;
});

// Add event listener for Enter key
document.getElementById('chat-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});
