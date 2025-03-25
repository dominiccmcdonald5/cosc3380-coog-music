import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import './signup.css';


function Signup() {
    const navigate = useNavigate();
    const [accountType, setAccountType] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [image, setImage] = useState("");

    const handleType = (actionType) => {
        if (actionType === "user") {
          setAccountType("user");
        }
        else if (actionType === "artist") {
          setAccountType("artist");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevents page reload
        console.log({accountType, email, username, password, image});
        
        try {
          const response = await fetch('https://cosc3380-coog-music-2.onrender.com/signup', {
            method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({accountType,email,username,password,image}),
        });

        const data = await response.json();

        if (data.success) {
          alert(
              `Signup Successful!`
          );
          navigate('/');
        }
        else {
          alert(`Signup failed: ${data.message}`);
        }
      }
      catch (err) {
        console.error('Error during signup:', err);
        alert('Signup failed. Please try again.');
      }
    }    

    return (
            <header className="SignUp-Page">
              <div className="SignUp-Text">
                <p className= "SignUp-title"> Sign Up</p>
                <p className= "SignUp-description">Please identify the account type you want:</p>
                <form onSubmit={handleSubmit}>
                    <button type="button" className="User-Button" onClick={() =>handleType("user")}>User</button>
                    <button type="button" className="Artist-Button" onClick={() =>handleType("artist")}>Artist</button>

                    <div className="Input-Type">
                    <label>Email:</label>
                    </div>
                    <input className= "Input-Box"
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                    />
                    

                    <div className="Input-Type">
                    <label>Username:</label>
                    </div>
                    <input className= "Input-Box"
                    type="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    />
                    

                    <div className="Input-Type">
                    <label>Password:</label>
                    </div>
                    <input className= "Input-Box"
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required
                    />

                    <div className="Input-Type">
                    <label>Profile Picture:</label>
                    </div>
                    <input className= "Input-Box"
                    type="url" 
                    value={image} 
                    onChange={(e) => setImage(e.target.value)} 
                    
                    />
                    

                    <div>
                    <button className="Input-Button" type="submit">Sign Up</button>
                    </div>
                    </form>
              </div>
            </header>
        );
};

export default Signup
