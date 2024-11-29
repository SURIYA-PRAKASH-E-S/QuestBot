import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import gsap from 'gsap';

import logo from './assets/lucifer.png';


function App() {
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const titleRef = useRef(null); // Reference for the title to animate
    const inputRef = useRef(null); // Reference for the input box to animate

    // GSAP animation for auto-typing effect on the title
    useEffect(() => {
        const text = titleRef.current.innerText;
        titleRef.current.innerHTML = ''; // Clear the text to work with individual characters

        // Split the text into individual span elements
        text.split('').forEach((char, index) => {
            titleRef.current.innerHTML += `<span class="letter">${char}</span>`;
        });

        // Animate each letter one by one for the typing effect
        gsap.fromTo(
            titleRef.current.querySelectorAll('.letter'),
            { opacity: 0, x: -10 }, // Start from opacity 0 and slight offset
            { opacity: 1, x: 0, duration: 0.1, stagger: 0.1, delay: 0.5, ease: "power1.out" }
        );

        // GSAP animation for the input box bounce effect
        gsap.fromTo(
            inputRef.current,
            { opacity: 0, scale: 0.5 }, // Start with hidden and scaled down
            { opacity: 1, scale: 1, duration: 1.5, delay: 1, ease: "bounce.out" } // Bounce effect
        );
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

            <h1 className="text-center mb-4" style={{ fontFamily: 'monospace' }} ref={titleRef}>
                QuestBot 
            </h1>
            <img src={logo} alt="Logo" />

            <div className="card shadow-lg border-0 rounded">
                <div className="card-body p-3 chat-container" style={{ maxHeight: '400px', overflowY: 'scroll' }}>
                    <div>
                        {chat.map((msg, index) => (
                            <div
                                key={index}
                                className={`message-bubble mb-2 p-2 rounded-3 ${msg.user === 'You' ? 'bg-primary text-white text-end ms-auto' : 'bg-secondary text-white'}`}
                            >
                                <strong>{msg.user}:</strong> {msg.text}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="card-footer d-flex align-items-center justify-content-between">
                    <div className="input-container w-100 d-flex">
                        <input
                            ref={inputRef} // Attach the ref for input box animation
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
