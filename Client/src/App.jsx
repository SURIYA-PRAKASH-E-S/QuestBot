import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

import AOS from 'aos';
import 'aos/dist/aos.css';  // Import AOS styles

function App() {
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);

    useEffect(() => {
        AOS.init({ duration: 1000, easing: 'ease-in-out' });
    }, []);

    const sendMessage = async () => {
        if (!message.trim()) return;

        setChat([...chat, { user: 'You', text: message }]);

        try {
            const response = await axios.post('http://localhost:5000/api/chat', { query: message });
            setChat([
                ...chat, 
                { user: 'You', text: message }, 
                { user: 'Bot', text: `${response.data.response} (Intent: ${response.data.intent})` }
            ]);
        } catch (error) {
            console.error('Error sending message', error);
        }

        setMessage('');
    };

    return (
        <div className="container-fluid mt-5">
            <h1 className="text-center mb-4" data-aos="fade-up">Chatbot</h1>
            <div className="card shadow-lg border-0 rounded" data-aos="fade-up">
                <div className="card-body p-3 chat-container" style={{ maxHeight: '400px', overflowY: 'scroll' }}>
                    <div>
                        {chat.map((msg, index) => (
                            <div
                                key={index}
                                className={`message-bubble mb-2 p-2 rounded-3 ${msg.user === 'You' ? 'bg-primary text-white text-end ms-auto' : 'bg-secondary text-white'}`}
                                data-aos="fade-in"
                            >
                                <strong>{msg.user}:</strong> {msg.text}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="card-footer d-flex align-items-center justify-content-between">
                    <div className="input-container w-100 d-flex">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            className="form-control me-2 input-chat"
                            placeholder="Type your message..."
                        />
                        <button onClick={sendMessage} className="btn btn-primary ms-2">Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
