import React, {useState} from 'react';
import purple_image from './purple_image.png';
import './inputForms.css';

export const SongForm = ({ userName, userId }) => {
    const [song, setSong] = useState({
        name: "",
        artist: userId,
        genre: "",
        album: "",
        image: null, // Store the image file itself
        songFile: null // Store the song file itself
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSong((prev) => ({ ...prev, [name]: value }));
    };

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
                    setSong((prevSong) => ({ ...prevSong, image: imageBase64 }));
                };
    
                // Read the file as a data URL (base64)
                reader.readAsDataURL(file);
            } else {
                alert("Only image files are allowed!");
            }
        }
    };

    const handleSongUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith("audio/")) {
                // Create a FileReader to read the file as a data URL (base64)
                const reader = new FileReader();
    
                // When the file is read, update the state with the base64 data URL
                reader.onloadend = () => {
                    const songBase64 = reader.result; // The base64 data URL
                    setSong((prevSong) => ({ ...prevSong, songFile: songBase64 }));
                };
    
                // Read the file as a data URL (base64)
                reader.readAsDataURL(file);
            } else {
                alert("Only audio files are allowed!");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Song submitted:", song);

        // Create FormData to send files and other form data

        try {
            const response = await fetch("https://cosc3380-coog-music-2.onrender.com/createsong", {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(song),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Song added successfully!");
                setSong({ name: "", artist: userId, genre: "", album: "", image: null, songFile: null }); // Reset form
            } else {
                alert("Failed to add song: " + data.message);
            }
        } catch (error) {
            console.error("Error adding song:", error);
            alert("Error connecting to the server.");
        }
    };

    return (
        <section className="everything">
            <div className="input-section">
                <div className="profile-header">
                    <h2 className="input-username">Create a Song!</h2>
                </div>
            </div>
            <form className="song-form" onSubmit={handleSubmit}>
                <label>Song Name</label>
                <input 
                    type="text" 
                    name="name" 
                    placeholder="Enter song name" 
                    value={song.name} 
                    onChange={handleChange} 
                    required 
                />

                <label>Genre Name</label>
                <input 
                    type="text" 
                    name="genre" 
                    placeholder="Enter genre" 
                    value={song.genre} 
                    onChange={handleChange}  
                />

                <label>Album Name</label>
                <input 
                    type="text" 
                    name="album" 
                    placeholder="Enter album name" 
                    value={song.album} 
                    onChange={handleChange}  
                />

                <label>Image File</label>
                <input 
                    type="file" 
                    name="image" 
                    accept="image/*" 
                    onChange={handleImageUpload}  
                />

                <label>Song File</label>
                <input 
                    type="file" 
                    name="songFile" 
                    accept="audio/*" 
                    onChange={handleSongUpload} 
                    required 
                />

                <button type="submit">Create</button>
            </form>
        </section>
    );
};

export const SongFormEdit = ({userName,userId, song}) => {
    console.log(song);
    const [songing, setSonging] = useState({
        prevName: song.name,
        name: "",
        artist: userId,
        genre: "",
        image: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSonging({ ...songing, [name]: value });
    };

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
                    setSonging((prevSong) => ({ ...prevSong, image: imageBase64 }));
                };
    
                // Read the file as a data URL (base64)
                reader.readAsDataURL(file);
            } else {
                alert("Only image files are allowed!");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Song submitted:", songing);
        
        try {
          const response = await fetch('https://cosc3380-coog-music-2.onrender.com/editsong', {
            method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(songing),
        });

        const data = await response.json();
            
            if (response.ok) {
                alert("Song edited successfully!");
                setSonging({ prevName: songing.prevName, name: "", artist: userId,genre: "", image: ""}); // Reset form
            } else {
                alert("Failed to edit song: " + data.message);
            }
        } catch (error) {
            console.error("Error editing song:", error);
            alert("Error connecting to the server.");
        }
    };

    return (
        <section className="everything">
        <div className="input-section">
                    <div className="profile-header">
                        <h2 className="input-username">Edit a Song!</h2>
                    </div>
        </div>
        <form className="song-form" onSubmit={handleSubmit}>
            <label>New Song Name</label>
            <input type="text" name="name" placeholder="Enter song name" value={songing.name} onChange={handleChange} />

            <label>New Song Genre</label>
            <input type="text" name="genre" placeholder="Enter genre" value={songing.genre} onChange={handleChange} />

            <label>New Song Image</label>
            <input 
                    type="file" 
                    name="image" 
                    accept="image/*" 
                    onChange={handleImageUpload}  
                />

            <button type="submit">Edit</button>
        </form>
        </section>
    );
}

export const SongFormDelete = ({userName,userId}) => {
    const [song, setSong] = useState({
        name: "",
        artist: userId,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSong({ ...song, [name]: value });
    };

        const handleSubmit = async (e) => {
            e.preventDefault();
            console.log("Song submitted:", song);
            
            try {
              const response = await fetch('https://cosc3380-coog-music-2.onrender.com//deletesong', {
                method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({name: song.name,
                artist: song.artist}),
            });
    
            const data = await response.json();
                
                if (response.ok) {
                    alert("Song deleted successfully!");
                    setSong({name: "", artist: userId}); // Reset form
                } else {
                    alert("Failed to delete song: " + data.message);
                }
            } catch (error) {
                console.error("Error deleting song:", error);
                alert("Error connecting to the server.");
            }
        };


    return (
        <section className="everything">
        <div className="input-section">
                    <div className="profile-header">
                        <h2 className="input-username">Delete a Song!</h2>
                    </div>
        </div>
        <form className="song-form" onSubmit={handleSubmit}>
            <label>Enter Song Name you wish to Delete</label>
            <input type="text" name="name" placeholder="Enter song name" value={song.name} onChange={handleChange} required />
            <button type="submit">Delete</button>
        </form>
        </section>
    );
}


export const AlbumForm = ({userId, userName}) => {
    const [album, setAlbum] = useState({
        name: "",
        artist: userId,
        genre: "",
        image: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAlbum({ ...album, [name]: value });
    };

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
                    setAlbum({ ...album, image: imageBase64 });
                };
    
                // Read the file as a data URL (base64)
                reader.readAsDataURL(file);
            } else {
                alert("Only image files are allowed!");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Album submitted:", album);
        
        try {
          const response = await fetch('https://cosc3380-coog-music-2.onrender.com/addalbum', {
            method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(album),
        });

        const data = await response.json();
            
            if (response.ok) {
                alert("Album added successfully!");
                setAlbum({ name: "", artist: userId,genre: "",image: ""}); // Reset form
            } else {
                alert("Failed to add album: " + data.message);
            }
        } catch (error) {
            console.error("Error adding album:", error);
            alert("Error connecting to the server.");
        }
    };

    return (
        <section className="everything">
        <div className="input-section">
                    <div className="profile-header">
                        <h2 className="input-username">Create an Album!</h2>
                    </div>
        </div>
        <form className="song-form" onSubmit={handleSubmit}>
            <label>Album Name</label>
            <input type="text" name="name" placeholder="Enter album name" value={album.name} onChange={handleChange} required />

            <label>Album Genre</label>
            <input type="text" name="genre" placeholder="Enter genre" value={album.genre} onChange={handleChange} required />

            <label>Album Image</label>
            <input type="file" 
                    name="image" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    />

            <button type="submit">Create</button>
        </form>
        </section>
    );
}

export const AlbumFormAdd = ({userName, userId}) => {
    const [album, setAlbum] = useState({
        name: "",
        artist: userId,
        song_name: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAlbum({ ...album, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Album submitted:", album);
        
        try {
          const response = await fetch('https://cosc3380-coog-music-2.onrender.com/addingsongtoalbum', {
            method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(album),
        });

        const data = await response.json();
            
            if (response.ok) {
                alert("Song added successfully!");
                setAlbum({ name: "", artist: userId,song_name: ""}); // Reset form
            } else {
                alert("Failed to add song: " + data.message);
            }
        } catch (error) {
            console.error("Error adding song:", error);
            alert("Error connecting to the server.");
        }
    };

    return (
        <section className="everything">
        <div className="input-section">
                    <div className="profile-header">
                        <h2 className="input-username">Add a Song to an Album!</h2>
                    </div>
        </div>
        <form className="song-form" onSubmit={handleSubmit}>
            <label>Album Name</label>
            <input type="text" name="name" placeholder="Enter album name" value={album.name} onChange={handleChange} required />

            <label>Enter Song Name you want to Add to the Album</label>
            <input type="text" name="song_name" placeholder="Enter song name" value={album.song_name} onChange={handleChange} required />

            <button type="submit">Add</button>
        </form>
        </section>
    );
}

export const AlbumFormEdit = ({userName,userId, album}) => {
    console.log(album);
    const [albuming, setAlbuming] = useState({
        prevName: album.album_name,
        name: "",
        artist: userId,
        genre: "",
        image: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAlbuming({ ...albuming, [name]: value });
    };

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
                    setAlbuming({ ...albuming, image: imageBase64 });
                };
    
                // Read the file as a data URL (base64)
                reader.readAsDataURL(file);
            } else {
                alert("Only image files are allowed!");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
          const response = await fetch('https://cosc3380-coog-music-2.onrender.com/editalbum', {
            method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(albuming),
        });

        const data = await response.json();
            
            if (response.ok) {
                alert("Album edited successfully!");
                setAlbuming({ prevName: albuming.prevName, name: "", artist: userId,genre: "", image: ""}); // Reset form
            } else {
                alert("Failed to edit album: " + data.message);
            }
        } catch (error) {
            console.error("Error editing song:", error);
            alert("Error connecting to the server.");
        }
    };

    return (
        <section className="everything">
        <div className="input-section">
                    <div className="profile-header">
                        <h2 className="input-username">Edit {album.album_name}!</h2>
                    </div>
        </div>
        <form className="song-form" onSubmit={handleSubmit}>
            <label>New Album Name</label>
            <input type="text" name="name" placeholder="Enter album name" value={albuming.name} onChange={handleChange}  />

            <label>New Album Genre</label>
            <input type="text" name="genre" placeholder="Enter genre" value={albuming.genre} onChange={handleChange}  />

            <label>New Album Image</label>
            <input type="file" 
                    name="image" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    />

            <button type="submit">Edit</button>
        </form>
        </section>
    );
}

export const AlbumFormDelete = ({ userName, userId, album }) => {
    console.log(album);

    const [albuming, setAlbuming] = useState({
        name: "",
        artist: userId
    });

    const handleDelete = async () => {
        const confirmed = window.confirm(`Are you sure you want to delete "${album.album_name}"?`);
        if (!confirmed) return;

        try {
            const response = await fetch('https://cosc3380-coog-music-2.onrender.com/deletealbum', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: album.album_name,
                    artist: userId
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Album deleted successfully!");
                setAlbuming({ name: "", artist: userId }); // Reset form
            } else {
                alert("Failed to delete album: " + data.message);
            }
        } catch (error) {
            console.error("Error deleting album:", error);
            alert("Error connecting to the server.");
        }
    };

    return (
        <section className="everything">
            <div className="input-section">
                <div className="profile-header">
                    <h2 className="input-username">Delete {album.album_name}!</h2>
                </div>
                <button
                    type="button"
                    onClick={handleDelete}
                    className="delete-playlist-button"
                >
                    Delete Playlist
                </button>
            </div>
        </section>
    );
};

export const AlbumFormRemove = ({userName, userId}) => {
    const [album, setAlbum] = useState({
        name: "",
        artist: userId,
        song_name: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAlbum({ ...album, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Album submitted:", album);
        
        try {
          const response = await fetch('https://cosc3380-coog-music-2.onrender.com/removesongfromalbum', {
            method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(album),
        });

        const data = await response.json();
            
            if (response.ok) {
                alert("Song removed successfully!");
                setAlbum({ name: "", artist: userId,song_name: ""}); // Reset form
            } else {
                alert("Failed to remove song: " + data.message);
            }
        } catch (error) {
            console.error("Error removing song:", error);
            alert("Error connecting to the server.");
        }
    };

    return (
        <section className="everything">
        <div className="input-section">
                    <div className="profile-header">
                        <h2 className="input-username">Remove a Song from an Album!</h2>
                    </div>
        </div>
        <form className="song-form" onSubmit={handleSubmit}>
            <label>Enter Album Name</label>
            <input type="text" name="name" placeholder="Enter album name" value={album.name} onChange={handleChange} required />

            <label>Enter Song Name you want to Remove</label>
            <input type="text" name="song_name" placeholder="Enter album name" value={album.song_name} onChange={handleChange} required />

            <button type="submit">Remove</button>
        </form>
        </section>
    );
}

export const PlaylistForm = ({userName, userId}) => {
    const [playlist, setPlaylist] = useState({
        name: "",
        user: userId,
        image: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPlaylist({ ...playlist, [name]: value });
    };

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
                    setPlaylist({ ...playlist, image: imageBase64 });
                };
    
                // Read the file as a data URL (base64)
                reader.readAsDataURL(file);
            } else {
                alert("Only image files are allowed!");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Playlist submitted:", playlist);
        
        try {
          const response = await fetch('https://cosc3380-coog-music-2.onrender.com/createplaylist', {
            method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(playlist),
        });

        const data = await response.json();
            
            if (response.ok) {
                alert("Playlist added successfully!");
                setPlaylist({ name: "", user: userId,image: ""}); // Reset form
            } else {
                alert("Failed to add playlist: " + data.message);
            }
        } catch (error) {
            console.error("Error adding playlist:", error);
            alert("Error connecting to the server.");
        }
    };

    return (
        <section className="everything">
        <div className="input-section">
                    <div className="profile-header">
                        <h2 className="input-username">Create a Playlist!</h2>
                    </div>
        </div>
        <form className="song-form" onSubmit={handleSubmit}>
            <label>Playlist Name</label>
            <input type="text" name="name" placeholder="Enter playlist name" value={playlist.name} onChange={handleChange} required />

            <label>Image</label>
            <input type="file" 
                    name="image" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    />

            <button type="submit">Create</button>
        </form>
        </section>
    );
}

export const PlaylistFormAdd = ({userName, userId}) => {
    const [playlist, setplaylist] = useState({
        name: "",
        user: userId,
        song_name: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setplaylist({ ...playlist, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Playlist submitted:", playlist);
        
        try {
          const response = await fetch('https://cosc3380-coog-music-2.onrender.com/addsongtoplaylist', {
            method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(playlist),
        });

        const data = await response.json();
            
            if (response.ok) {
                alert("Song added successfully!");
                setplaylist({ name: "", user: userId,song_name: ""}); // Reset form
            } else {
                alert("Failed to add song: " + data.message);
            }
        } catch (error) {
            console.error("Error adding song:", error);
            alert("Error connecting to the server.");
        }
    };

    return (
        <section className="everything">
        <div className="input-section">
                    <div className="profile-header">
                        <h2 className="input-username">Add a Song to a Playlist!</h2>
                    </div>
        </div>
        <form className="song-form" onSubmit={handleSubmit}>
            <label>Playlist Name</label>
            <input type="text" name="name" placeholder="Enter playlist name" value={playlist.name} onChange={handleChange} required />

            <label>Enter Song Name you want to Add to the Playlist</label>
            <input type="text" name="song_name" placeholder="Enter song name" value={playlist.song_name} onChange={handleChange} required />

            <button type="submit">Add</button>
        </form>
        </section>
    );
}

export const PlaylistFormEdit = ({playlist, userId}) => {
    const [playlisting, setPlaylisting] = useState({
        prevName: playlist.playlist_name,
        name: "",
        user: userId,
        image: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPlaylisting({ ...playlisting, [name]: value });
    };

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
                    setPlaylisting({ ...playlisting, image: imageBase64 });
                };
                // Read the file as a data URL (base64)
                reader.readAsDataURL(file);
            } else {
                alert("Only image files are allowed!");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
          const response = await fetch('https://cosc3380-coog-music-2.onrender.com/editplaylist', {
            method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(playlisting),
        });

        const data = await response.json();
            
            if (response.ok) {
                alert("Playlist edited successfully!");
                setPlaylisting({ prevName: playlisting.prevName, name: "", user: userId, image: ""}); // Reset form
            } else {
                alert("Failed to edit playlist: " + data.message);
            }
        } catch (error) {
            console.error("Error editing playlist:", error);
            alert("Error connecting to the server.");
        }
    };

    return (
        <section className="everything">
        <div className="input-section">
                    <div className="profile-header">
                        <h2 className="input-username">Edit {playlist.playlist_name}!</h2>
                    </div>
        </div>
        <form className="song-form" onSubmit={handleSubmit}>
            <label>Rename Playlist</label>
            <input type="text" name="name" placeholder="Enter new name" value={playlisting.name} onChange={handleChange}  />

            <label>New Playlist Image</label>
            <input type="file" 
                    name="image" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    />

            <button type="submit">Edit</button>
        </form>
        </section>
    );
}

export const PlaylistFormDelete = ({ userName, userId, playlist }) => {
    const handleDelete = async () => {
        const confirmDelete = window.confirm(`Are you sure you want to delete the playlist "${playlist.playlist_name}"?`);

        if (!confirmDelete) return;

        try {
            const response = await fetch('https://cosc3380-coog-music-2.onrender.com/deleteplaylist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: playlist.playlist_name,
                    user: userId
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Playlist deleted successfully!");
                // You can redirect or update UI here if needed
            } else {
                alert("Failed to delete playlist: " + data.message);
            }
        } catch (error) {
            console.error("Error deleting playlist:", error);
            alert("Error connecting to the server.");
        }
    };

    return (
        <section className="everything">
            <div className="input-section">
                <div className="profile-header">
                    <h2 className="input-username">Delete a Playlist</h2>
                </div>
                <button type="button" onClick={handleDelete} className="delete-playlist-button">
                    Delete Playlist
                </button>
            </div>
        </section>
    );
};

export const PlaylistFormRemove = ({userName, userId}) => {
    const [playlist, setPlaylist] = useState({
        name: "",
        user: userId,
        song_name: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPlaylist({ ...playlist, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Playlist submitted:", playlist);
        
        try {
          const response = await fetch('https://cosc3380-coog-music-2.onrender.com/removeplaylistsong', {
            method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(playlist),
        });

        const data = await response.json();
            
            if (response.ok) {
                alert("Song removed successfully!");
                setPlaylist({ name: "", user: userId,song_name: ""}); // Reset form
            } else {
                alert("Failed to remove song: " + data.message);
            }
        } catch (error) {
            console.error("Error removing song:", error);
            alert("Error connecting to the server.");
        }
    };

    return (
        <section className="everything">
        <div className="input-section">
                    <div className="profile-header">
                        <h2 className="input-username">Remove a Song from an Playlist!</h2>
                    </div>
        </div>
        <form className="song-form" onSubmit={handleSubmit}>
            <label>Enter Playlist Name</label>
            <input type="text" name="name" placeholder="Enter playlist name" value={playlist.name} onChange={handleChange} required />

            <label>Enter Song Name you want to Remove</label>
            <input type="text" name="song_name" placeholder="Enter song name" value={playlist.song_name} onChange={handleChange} required />

            <button type="submit">Remove</button>
        </form>
        </section>
    );
}