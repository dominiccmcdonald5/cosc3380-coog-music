import React, {useState, useEffect} from 'react';
import purple_image from './purple_image.png';
import heart from './heart.png';
import './sections.css';
import play_button from './play.png';
import forward from './forward.png';
import { ArtistView, AlbumViewPage, PlaylistViewPage } from './view';
import { BottomBar } from './home';
import verified from './isverifiedlogo.png';

const MusicPlayer = () => {
    const [currentSong, setCurrentSong] = useState(null);
  
    return (
      <div>
        {/* Render SongCard and pass setCurrentSong */}
        <SongList setCurrentSong={setCurrentSong} />
  
        {/* Pass currentSong to BottomBar */}
        <BottomBar currentSong={currentSong} />
      </div>
    );
  };

  export const SongList = ({ accountType, userId, setCurrentSong }) => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const response = await fetch('https://cosc3380-coog-music-2.onrender.com/songlist', {
                    method: 'GET',
                });
                const data = await response.json();

                if (data.success) {
                    setSongs(data.songs);
                } else {
                    setError('Failed to fetch songs');
                }
            } catch (err) {
                setError('Error fetching songs');
            } finally {
                setLoading(false);
            }
        };

        fetchSongs();
    }, []);

    const filteredSongs = songs.filter(song =>
        song.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading songs...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="song-list-container">
    <div className="search-bar-container">
        <input
            type="text"
            placeholder="Search songs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
        />
    </div>

    <div className="song-list">
        {filteredSongs.map((song, index) => (
            <SongCard
                key={index}
                song={song}
                accountType={accountType}
                userId={userId}
                setCurrentSong={setCurrentSong}
            />
        ))}
        </div>
    </div>
    );
};

export const SongCard = ({ song, accountType, userId, setCurrentSong }) => {
    const [isLiked, setIsLiked] = useState(false); // State to track if the heart is "liked"    const [error, setError] = useState(null);
    const [error, setError] = useState();



    // Only call fetchInitialLike if accountType is 'user'
    useEffect(() => {
        if (accountType === 'user') {
            const fetchInitialLike = async () => {
                try {
                    const response = await fetch('https://cosc3380-coog-music-2.onrender.com/initiallike', {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ userId: userId, song_id: song.song_id }),
                    });
                    const data = await response.json();

                    if (data.success) {
                        setIsLiked(data.isLiked);  // Assuming the backend returns an array of artists
                    } else {
                        setError('Failed to fetch like status');
                    }
                } catch (err) {
                    setError('Error fetching like status');
                }
            };

            fetchInitialLike();
        }
    }, [userId, accountType, song.song_id]);  // Re-run when these change

    const handleHeartClick = async () => {
        if (isLiked) {
            // Unlike the song
            try {
                const response = await fetch(`https://cosc3380-coog-music-2.onrender.com/unlikesong`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId: userId, song_id: song.song_id }),
                });
                if (response.ok) {
                    setIsLiked(false);
                }
            } catch (error) {
                console.error("Error unliking the song:", error);
            }
        } else {
            // Like the song
            try {
                const response = await fetch("https://cosc3380-coog-music-2.onrender.com/likesong", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: userId,
                        song_id: song.song_id,
                    }),
                });
                if (response.ok) {
                    setIsLiked(true);
                }
            } catch (error) {
                console.error("Error liking the song:", error);
            }
        }
    };

    return (
        <div className="song-card">
            {/* Render Base64 Image */}
           
            <img
                src={song.image || purple_image}
                alt={song.name}
                className="song-image"
            />
            

            <h3 className="song-name">{song.name}</h3>
            <h3 className="song-artist">{song.artist_name}</h3>


            <div className="bottom-section">
                {accountType !== 'artist' && accountType !== 'admin' && (
                    <img
                        src={heart}
                        alt="heart"
                        className={`heart-image ${isLiked ? "liked" : ""}`}
                        onClick={handleHeartClick}
                    />
                )}
                <button onClick={() => setCurrentSong(song)} className="play-button">
                    <img src={play_button} alt="Play" className="play" />
                </button>
            </div>
        </div>
    );
};

export const ArtistList = ({onArtistClick}) => {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);  // To track loading state
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');


    useEffect(() => {
        const fetchArtists = async () => {
            try {
                const response = await fetch('https://cosc3380-coog-music-2.onrender.com/artistlist', {
                    method: 'GET',
                });
                const data = await response.json();

                if (data.success) {
                    setArtists(data.artists);  // Assuming the backend returns an array of artists
                } else {
                    setError('Failed to fetch artists');
                }
            } catch (err) {
                setError('Error fetching artists');
            } finally {
                setLoading(false);  // Data is loaded or error occurred
            }
        };

        fetchArtists();
    }, []);  // Empty dependency array to run this only once when the component mounts

    const filteredArtists = artists.filter(artist =>
        artist.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading artists...</div>;
    if (error) return <div>{error}</div>;

    return (<>
        <div className="search-bar-container">
        <input
            type="text"
            placeholder="Search artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
        />
        </div>
        <div className="artist-list">
          {filteredArtists.map((artist, index) => (
            <ArtistCard key={index} artist={artist} onArtistClick={onArtistClick} />
          ))}
        </div>
        </>
      );
}

export const ArtistCard = ({ artist, onArtistClick }) => {
    return (
      <div className="artist-card">
        <img src={artist.image_url || purple_image} alt={artist.username} className="artist-image" />
        <div className="artist-headerr">
        <h3 className="artist-name">{artist.username}</h3>
        {artist.isVerified == 1 && (
            <img src={verified} alt="Verified" className="verifiedd-icon" />
        )}
        </div>
        <button onClick={() => onArtistClick('artist-view', artist)} className="forward-button">
          <img src={forward} alt="forward" className="forward-icon" />
        </button>
      </div>
    );
};

  export const AlbumList = ({ onAlbumClick, accountType, userId, userName}) => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);  // To track loading state
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const response = await fetch('https://cosc3380-coog-music-2.onrender.com/albumlist', {
                    method: 'GET',
                });
                const data = await response.json();

                if (data.success) {
                    setAlbums(data.albums);  // Assuming the backend returns an array of artists
                } else {
                    setError('Failed to fetch artists');
                }
            } catch (err) {
                setError('Error fetching artists');
            } finally {
                setLoading(false);  // Data is loaded or error occurred
            }
        };

        fetchAlbums();
    }, []);  // Empty dependency array to run this only once when the component mounts

    const filteredAlbums = albums.filter(album =>
        album.album_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading albums...</div>;
    if (error) return <div>{error}</div>;

    return (<>
    <div className="search-bar-container">
        <input
            type="text"
            placeholder="Search albums..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
        />
        </div>
        <div className="album-list">
            {filteredAlbums.map((album, index) => (
                <AlbumCard key={index} album={album} onAlbumClick={onAlbumClick} accountType={accountType} userId={userId} userName={userName}/>
            ))}
        </div>
        </>
    );
};


export const AlbumCard = ({ album, onAlbumClick, accountType, userId, userName }) => {
    const [isLiked, setIsLiked] = useState(false); // State to track if the heart is "liked"
    const [error, setError] = useState(null);
  
    useEffect(() => {
        const fetchInitialLike = async () => {
            try {
                const response = await fetch('https://cosc3380-coog-music-2.onrender.com/albuminitiallike', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId: userId, album_id: album.album_id }), 
                });
                const data = await response.json();
    
                if (data.success) {
                    setIsLiked(data.isLiked);  // Assuming the backend returns an array of artists
                } else {
                    setError('Failed to fetch like status');
                }
            } catch (err) {
                setError('Error fetching like status');
            }
        };
    
        // Call fetchInitialLike only if accountType is 'user'
        if (accountType === 'user') {
            fetchInitialLike();
        }
    }, [userId, accountType]); // The effect will run when either userId or accountType changes
  
    const handleHeartClick = async () => {
        if (isLiked) {
            // Unlike the song
            try {
                const response = await fetch(`https://cosc3380-coog-music-2.onrender.com/albumunlikesong`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId: userId, album_id: album.album_id }), 
                });
                if (response.ok) {
                    setIsLiked(false);
                }
            } catch (error) {
                console.error("Error unliking the album:", error);
            }
        } else {
            // Like the song
            try {
                const response = await fetch("https://cosc3380-coog-music-2.onrender.com/albumlikesong", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: userId,
                        album_id: album.album_id,
                    }),
                });
                if (response.ok) {
                    setIsLiked(true);
                }
            } catch (error) {
                console.error("Error liking the album:", error);
            }
        }
    };
  
    return (
        <div className="album-card">
            <img src={album.album_image || purple_image} alt={album.album_name} className="album-image" />
            <h3 className="album-name">{album.album_name}</h3>
            <h3 className="album-artist">{album.artist_username}</h3>
            <div className="bottom-section">
                {accountType !== 'artist' && accountType !== 'admin'  && (
                    <img
                        src={heart} // Use the same heart image
                        alt="heart"
                        className={`heart-image ${isLiked ? "liked" : ""}`} // Add class if liked
                        onClick={handleHeartClick} // Handle click event
                    />
                )}
                <button onClick={() => onAlbumClick('album-view-page', album, userName, userId)} className="forward-button">
                    <img src={forward} alt="forward" className="forward-icon" />
                </button>
            </div>
        </div>
    );
};

export const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);  // To track loading state
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('https://cosc3380-coog-music-2.onrender.com/userlist', {
                    method: 'GET',
                });
                const data = await response.json();

                if (data.success) {
                    setUsers(data.users);  // Assuming the backend returns an array of artists
                } else {
                    setError('Failed to fetch users');
                }
            } catch (err) {
                setError('Error fetching users');
            } finally {
                setLoading(false);  // Data is loaded or error occurred
            }
        };

        fetchUsers();
    }, []);  // Empty dependency array to run this only once when the component mounts

    if (loading) return <div>Loading users...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="user-list">
            {users.map((user, index) => (
                <UserCard key={index} user={user} />
            ))}
        </div>
    );
}

export const UserCard = ({ user }) => {
    
    return (
        <div className="user-card">
            <img src={user.image_url} alt={user.username} className="user-image" />
            <h3 className="user-name">{user.username}</h3>
        </div>
    );
};


/*
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SongList.css'; // Create this for styling

const SongList = () => {
    const [songs, setSongs] = useState([]); // State to store songs
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch songs from the backend when the component mounts
    useEffect(() => {
        axios.get('http://localhost:5000/songs')  // Replace with your actual API endpoint
            .then(response => {
                setSongs(response.data); // Store the fetched songs
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching songs:', err);
                setError('Failed to load songs');
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading songs...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="song-list">
            {songs.map((song) => (
                <SongCard key={song.id} song={song} />
            ))}
        </div>
    );
};

// Reusable Card Component for Each Song
const SongCard = ({ song }) => {
    return (
        <div className="song-card">
            <img src={song.photo} alt={song.name} className="song-image" />
            <h3 className="song-name">{song.name}</h3>
        </div>
    );
};

export default SongList;
*/