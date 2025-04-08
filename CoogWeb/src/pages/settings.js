import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import purple_image from './purple_image.png';
import './settings.css';

const SettingsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId, username, accountType, userImage } = location.state || {}; 

    // If location.state is undefined, the variables will default to empty strings
    const [newPassword, setNewPassword] = useState('');
    const [image, setImage] = useState('');

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check if the uploaded file is a valid image
            if (file.type.startsWith("image/")) {
                // Create a FileReader to read the image file as a data URL (base64)
                const reader = new FileReader();
    
                // When the file is read, update the state with the base64 data URL
                reader.onloadend = () => {
                    const imageBase64 = reader.result; // The base64 data URL
                    setImage(imageBase64);
                };
    
                // Read the file as a data URL (base64)
                reader.readAsDataURL(file);
            } else {
                alert("Only image files are allowed!");
            }
        }
    };

    // Handle saving changes
    const handleSaveChanges = async () => {
        console.log(accountType, username, newPassword, image);
        try {
            const response = await fetch('https://cosc3380-coog-music-2.onrender.com/editinfo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountType, username, newPassword, image }),
            });
    
            const result = await response.json();
            if (result.success) {
                alert('Profile updated successfully!');
            } else {
                alert('Failed to update profile: ' + result.message);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('An error occurred while updating profile.');
        }
    };

    // Handle account deletion
    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
        if (!confirmDelete) return;

        try {
            const response = await fetch('https://cosc3380-coog-music-2.onrender.com/deleteaccount', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountType, username }),
            });

            const result = await response.json();
            if (result.success) {
                alert('Account deleted successfully');
                navigate('/');  // Redirect to home page after deletion
            } else {
                alert('Failed to delete account: ' + result.message);
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('An error occurred while deleting account.');
        }
    };

    return (
        <div className="settings-page">
            <h1 className="settings-header">Settings</h1>

            <div className="settings-section">
                <h2 className="settings-section-title">Change Password</h2>
                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="settings-input"
                />
            </div>

            <div className="settings-section">
                <h2 className="settings-section-title">Change Profile Picture</h2>
                <input type="file" 
                    name="image" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    />
                {image && <img src={image} alt="Preview" className="profile-preview" />}
            </div>

            <button className="save-changes-button" onClick={handleSaveChanges}>
                Save Changes
            </button>

            <button className="delete-account-button" onClick={handleDeleteAccount}>
                Delete Account
            </button>
        </div>
    );
};

function Settings() {
    return (
        <header className="Setting-Page">
            <SettingsPage />
        </header>
    );
}

export default Settings;