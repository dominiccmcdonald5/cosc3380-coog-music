import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import purple_image from './purple_image.png';
import music_notes from './music_notes.png';
import './login.css';

function Login () {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch("https://cosc3380-coog-music-2.onrender.com/loginsection", {  // Ensure the URL is correct
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username:username, password:password }),
            });

            // Check if response is okay (status 2xx)
            if (!response.ok) {
                throw new Error('Failed to log in');
            }

            const data = await response.json();

            if (data.success) {
                
                if (data.accountType === "artist") {
                    alert(
                        `Login Successful!\n\n` +
                        `User ID: ${data.userId}\n` +
                        `Username: ${data.userName}\n` +
                        `Account Type: ${data.accountType}\n` +
                        `Image URL: ${data.userImage}`
                    );
                    navigate('/home', { state: { userId: data.userId, userName: data.userName, accountType: data.accountType, userImage: data.userImage } });
                } else if (data.accountType === "admin") {
                    alert(
                        `Login Successful!\n\n` +
                        `User ID: ${data.userId}\n` +
                        `Username: ${data.userName}\n` +
                        `Account Type: ${data.accountType}\n` +
                        `Image URL: ${data.userImage}`
                    );
                    navigate('/home', { state: { userId: data.userId, userName: data.userName, accountType: data.accountType, userImage: data.userImage } });
                } else {
                    alert(
                        `Login Successful!\n\n` +
                        `User ID: ${data.userId}\n` +
                        `Username: ${data.userName}\n` +
                        `Account Type: ${data.accountType}\n` +
                        `Image URL: ${data.userImage}`
                    );
                    navigate('/home', { state: { userId: data.userId, userName: data.userName, accountType: data.accountType, userImage: data.userImage } });
                }            } 
                
                else {
                alert(`Login failed: ${data.message || 'Invalid username or password'}`);
            }
        } catch (err) {
            console.error('Error during login:', err);
            alert('Login failed. Please try again.');
        }
    };

    return (
        <header className="LogIn-Page">
            <div className="LogIn-Text">
                <p className="LogIn-title">Log In</p>
                <p className="LogIn-description">Please enter your Username and Password:</p>
                <form onSubmit={handleSubmit}>

                    <div className="LogIn-Type">
                        <label>Username:</label>
                    </div>
                    <input
                        className="LogIn-Box"
                        type="text"  // Corrected from "username" to "text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <div className="LogIn-Type">
                        <label>Password:</label>
                    </div>
                    <input
                        className="LogIn-Box"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div>
                        <button className="LogIn-Button" type="submit">Log In</button>
                    </div>
                </form>
            </div>
        </header>
    );
};

export default Login;