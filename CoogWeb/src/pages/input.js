import React, {useState, useEffect} from 'react';
import purple_image from './purple_image.png';
import './input.css';
import {SongForm, SongFormDelete, SongFormEdit} from './inputForms.js';
import {PlaylistViewPage} from './view.js';
import forward from './forward.png';

export const PlaylistList = ({ onPlaylistClick, userName, userId }) => {
    const [playlists, setPlaylists] = useState([]);
        const [loading, setLoading] = useState(true);  // To track loading state
        const [error, setError] = useState(null);
    
            useEffect(() => {
                const fetchProfilePlaylist = async () => {
                    try {
                        const response = await fetch('https://cosc3380-coog-music-2.onrender.com/profileplaylist', {
                            method: 'POST',
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ userName }), 
                        })
                        console.log('Backend response:', response); 
    
                        const data = await response.json();
    
                        if (data.success) {
                            setPlaylists(data.playlists);  
                        } else {
                            setError('Failed to fetch playlists');
                        }
                    } catch (err) {
                        setError('Error fetching playlists');
                    } finally {
                        setLoading(false);  // Data is loaded or error occurred
                    }
                };
        
                fetchProfilePlaylist();
            }, [userName]);
            if (loading) return <div>Loading playlists...</div>;
            if (error) return <div>{error}</div>;
            console.log(playlists);
    return (
        <div className="playlist-list">
            {playlists.map((playlist,index) => (
                <PlaylistCard key={index} playlist={playlist} onPlaylistClick={onPlaylistClick}/>
            ))}
        </div>
    );
}

export const PlaylistCard = ({ playlist, onPlaylistClick}) => {
    return (
        <div className="playlist-card">
            <img src={playlist.playlist_image} alt={playlist.playlist_name} className="playlist-image" />
            <h3 className="playlist-name">{playlist.playlist_name}</h3>
            <button
                className="forward-button"
                onClick={() => onPlaylistClick('playlist-view', playlist)} // Pass the full playlist object
            >
                <img src={forward} alt="forward" className="forward-icon" />
            </button>
        </div>
    );
};

export const Profile = ({ setActiveScreen, onPlaylistClick,userName, userId, userImage}) => {
    const [stats, setStats] = useState({
        followers: 0,
        friends: 0,
        streams: 0,
        likedSongs: 0,
        likedAlbums: 0,
    });

    const [loading, setLoading] = useState(true);  // To track loading state
        const [error, setError] = useState(null);
        
            useEffect(() => {
                const fetchUserInfo = async () => {
                    try {
                        const response = await fetch('https://cosc3380-coog-music-2.onrender.com/infoforprofile', {
                            method: 'POST',
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ userName:userName}),
                        });
                        if (response.ok) {
                            const data = await response.json();
                            if (data.success) {
                                setStats({
                                    followers: data.followers,
                                    friends: data.friends,
                                    streams: data.streams,
                                    likedSongs: data.likedSongs,
                                    likedAlbums: data.likedAlbums,
                                });
                            } else {
                                setError('Failed to fetch user info');
                            }
                        } else {
                            setError('Failed to fetch user info');
                        }
                        
                    } catch (err) {
                        setError('Error fetching user info');
                    } finally {
                        setLoading(false);  // Data is loaded or error occurred
                    }
                };
        
                fetchUserInfo();
            }, [userName]);  
    
        
            if (loading) return <div>Loading user...</div>;
            if (error) return <div>{error}</div>;

    return (
        <section className="everything">
            <div className="profile-section">
                <div className="profile-header">
                    <img src={userImage} alt="Profile" className="profile-image" />
                    <h2 className="profile-username">{userName}</h2>
                </div>
                <div className="Basic-Stats">
                    <p className="basic-stats-text"> Following: {stats.followers}</p>
                    <p className="basic-stats-text"> Friends: {stats.friends}</p>
                    <p className="basic-stats-text"> Streams: {stats.streams}</p>
                    <p className="basic-stats-text"> Liked Songs: {stats.likedSongs}</p>
                    <p className="basic-stats-text"> Liked Albums: {stats.likedAlbums}</p>
                </div>
            </div>

            <div className="playlist-section">
                <div className="playlist-header">Your Playlists:
                    <button className="create-playlist-button" onClick={() => setActiveScreen('create-playlist')}>
                        Create Playlist
                    </button>
                    <button className="create-playlist-button" onClick={() => setActiveScreen('edit-playlist')}>
                        Edit Playlist
                    </button>
                    <button className="create-playlist-button" onClick={() => setActiveScreen('delete-playlist')}>
                        Delete Playlist
                    </button>
                    <button className="create-playlist-button" onClick={() => setActiveScreen('add-song-playlist')}>
                        Add Song
                    </button>
                    <button className="create-playlist-button" onClick={() => setActiveScreen('remove-song-playlist')}>
                        Remove Song
                    </button>
                </div>
                <PlaylistList onPlaylistClick={onPlaylistClick} userName={userName} userId={userId}/>
            </div>
        </section>
    );
};

export const AlbumProfileList = ({userName}) => {
    const [albums, setAlbums] = useState([]);
        const [loading, setLoading] = useState(true);  // To track loading state
        const [error, setError] = useState(null);
    
            useEffect(() => {
                const fetchArtistProfileAlbum = async () => {
                    try {
                        const response = await fetch('https://cosc3380-coog-music-2.onrender.com/artistprofilealbum', {
                            method: 'POST',
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ userName: userName }), 
                        })
                        console.log('Backend response:', response); 
    
                        const data = await response.json();
    
                        if (data.success) {
                            setAlbums(data.albums);  
                        } else {
                            setError('Failed to fetch albums');
                        }
                    } catch (err) {
                        setError('Error fetching albums');
                    } finally {
                        setLoading(false);  // Data is loaded or error occurred
                    }
                };
        
                fetchArtistProfileAlbum();
            }, [userName]);
            if (loading) return <div>Loading albums...</div>;
            if (error) return <div>{error}</div>;

    return (
        <div className="albumProfile-list">
            {albums.map((album,index) => (
                <AlbumProfileCard key={index} album={album} />
            ))}
        </div>
    );
}

export const AlbumProfileCard = ({ album }) => {
    return (
        <div className="albumProfile-card">
            <img src={album.album_image} alt={album.album_name} className="albumProfile-image" />
            <h3 className="albumProfile-name">{album.album_name}</h3>
        </div>
    );
};

export const SongProfileList = ({userName}) => {
    const [songs, setSongs] = useState([]);
        const [loading, setLoading] = useState(true);  // To track loading state
        const [error, setError] = useState(null);
    
            useEffect(() => {
                const fetchArtistProfileSong = async () => {
                    try {
                        const response = await fetch('https://cosc3380-coog-music-2.onrender.com/artistprofilesong', {
                            method: 'POST',
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ userName: userName }), 
                        })
                        console.log('Backend response:', response); 
    
                        const data = await response.json();
    
                        if (data.success) {
                            setSongs(data.songs);  
                        } else {
                            setError('Failed to fetch songs');
                        }
                    } catch (err) {
                        setError('Error fetching songs');
                    } finally {
                        setLoading(false);  // Data is loaded or error occurred
                    }
                };
        
                fetchArtistProfileSong();
            }, [userName]);
            if (loading) return <div>Loading songs...</div>;
            if (error) return <div>{error}</div>;

    return (
        <div className="songProfile-list">
            {songs.map((song,index) => (
                <SongProfileCard key={index} song={song} />
            ))}
        </div>
    );
};

export const SongProfileCard = ({ song }) => {
    return (
        <div className="songProfile-card">
            <img src={song.song_image} alt={song.song_name} className="songProfile-image" />
            <h3 className="songProfile-name">{song.song_name}</h3>
            <h3 className="songProfile-album">{song.artist_name}</h3>
        </div>
    );
};

export const ArtistProfile = ({setActiveScreen, userName, userImage}) => {
    const [stats, setStats] = useState({
        follow: 0,
        streams: 0,
        likedSongs: 0,
        likedAlbums: 0,
    });

    const [loading, setLoading] = useState(true);  // To track loading state
        const [error, setError] = useState(null);
        
            useEffect(() => {
                const fetchArtistProfileInfo = async () => {
                    try {
                        const response = await fetch('https://cosc3380-coog-music-2.onrender.com/artistprofileinfo', {
                            method: 'POST',
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ userName }), 
                        });
                        const data = await response.json();
                        console.log(data);
        
                        if (data.success) {
                            setStats({
                                follow: data.follow,
                                streams: data.streams,
                                likedSongs: data.likedSongs,
                                likedAlbums: data.likedAlbums});  
                        } else {
                            setError('Failed to fetch artist info');
                        }
                    } catch (err) {
                        setError('Error fetching artist info');
                    } finally {
                        setLoading(false);  // Data is loaded or error occurred
                    }
                };
        
                fetchArtistProfileInfo();
            }, [userName]);  // Empty dependency array to run this only once when the component mounts
    
        
            if (loading) return <div>Loading artists...</div>;
            if (error) return <div>{error}</div>;

    return (
        <section className = "everything">
        <div className="profile-section">
            <div className="profile-header">
                <img src={userImage} alt="Profile" className="profile-image" />
                <h2 className="profile-username">{userName}</h2>
            </div>
            <div className="Basic-Stats">
                <p className="basic-stats-text"> Followers: {stats.follow}</p>
                <p className="basic-stats-text"> Streams: {stats.streams}</p>
                <p className="basic-stats-text"> Liked Songs: {stats.likedSongs}</p>
                <p className="basic-stats-text"> Liked Songs: {stats.likedAlbums}</p>
            </div>
        </div>
        <div className="albumProfile-section">
                <div className="albumProfile-header">Your Albums: 
                <button
                        className="create-album-button"
                        onClick={() => setActiveScreen('create-album')}>
                        Create Album
                    </button>
                <button
                        className="create-album-button"
                        onClick={() => setActiveScreen('edit-album')}>
                        Edit Album
                    </button>
                <button
                        className="create-album-button"
                        onClick={() => setActiveScreen('delete-album')}>
                        Delete Album
                    </button>
                <button
                        className="create-album-button"
                        onClick={() => setActiveScreen('add-song-album')}>
                        Add Song
                    </button>
                <button
                        className="create-album-button"
                        onClick={() => setActiveScreen('remove-song-album')}>
                        Remove Song
                    </button>
                </div>
            <AlbumProfileList userName={userName}/>
            </div>

            <div className="songProfile-section">
                <div className="songProfile-header">Your Songs: 
                <button
                        className="create-song-button"
                        onClick={() => setActiveScreen('create-song')}>
                        Create Song
                    </button>
                <button
                        className="create-song-button"
                        onClick={() => setActiveScreen('edit-song')}>
                        Edit Song
                    </button>
                <button
                        className="create-song-button"
                        onClick={() => setActiveScreen('delete-song')}>
                        Delete Song
                    </button>
                </div>
            <SongProfileList userName={userName}/>
            </div>
        
        </section>
    );
};


export const DataReport = () => {
    const [songReport, setSongReport] = useState(null);
    const [artistReport, setArtistReport] = useState(null);
    const [userReport, setUserReport] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch Song Report
        const fetchSongReport = async () => {
            try {
                const response = await fetch("https://cosc3380-coog-music-2.onrender.com/songreport");
                const data = await response.json();
                if (data.success) {
                    setSongReport(data.songs);
                } else {
                    setError("Failed to fetch song report");
                }
            } catch (err) {
                setError("Failed to fetch song report");
            }
        };

        // Fetch Artist Report
        const fetchArtistReport = async () => {
            try {
                const response = await fetch("https://cosc3380-coog-music-2.onrender.com/artistreport");
                const data = await response.json();
                if (data.success) {
                    setArtistReport(data.artists);
                } else {
                    setError("Failed to fetch artist report");
                }
            } catch (err) {
                setError("Failed to fetch artist report");
            }
        };

        // Fetch User Report
        const fetchUserReport = async () => {
            try {
                const response = await fetch("https://cosc3380-coog-music-2.onrender.com/userreport");
                const data = await response.json();
                if (data.success) {
                    setUserReport(data.users);
                } else {
                    setError("Failed to fetch user report");
                }
            } catch (err) {
                setError("Failed to fetch user report");
            }
        };

        // Call the fetch functions
        fetchSongReport();
        fetchArtistReport();
        fetchUserReport();
    }, []);

    return (
        <section className="everything">
            <div className="profile-section">
            <div className="profile-header">
                <h2 className="profile-username">Coog Music Data Report</h2>
            </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            {/* Song Report */}
            {songReport && (
                <div className="albumProfile-section">
                    <div className="albumProfile-header">Song Report: </div>
                    <div className="report-table-container">
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Song Name</th>
                                <th>Unique Listeners</th>
                                <th>Like Count</th>
                                <th>Users Who Didn't Like</th>
                                <th>Like Percentage</th>
                                <th>Like Ratio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {songReport.map((song) => (
                                <tr key={song.song_id}>
                                    <td>{song.song_name}</td>
                                    <td>{song.unique_listeners}</td>
                                    <td>{song.like_count}</td>
                                    <td>{song.users_who_did_not_like}</td>
                                    <td className={song.like_percentage >= 50 ? "green-text" : "red-text"}>
                                        {song.like_percentage}%
                                    </td>
                                    <td className={song.like_ratio >= 1 ? "green-text" : "red-text"}>
                                        {song.like_ratio}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}

            {/* Artist Report */}
            {artistReport && (
                <div className="albumProfile-section">
                    <div className="albumProfile-header">Artist Report: </div>
                    <div className="report-table-container">
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Artist Name</th>
                                <th>Unique Listeners</th>
                                <th>Followers</th>
                                <th>Not Streaming But Following</th>
                                <th>Following Percentage</th>
                                <th>Following Ratio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {artistReport.map((artist) => (
                                <tr key={artist.artist_id}>
                                    <td>{artist.artist_name}</td>
                                    <td>{artist.unique_listeners}</td>
                                    <td>{artist.followers}</td>
                                    <td>{artist.not_streaming_but_following}</td>
                                    <td className={artist.following_percentage >= 50 ? "green-text" : "red-text"}>
                                        {artist.following_percentage}%
                                    </td>
                                    <td className={artist.following_ratio >= 1 ? "green-text" : "red-text"}>
                                        {artist.following_ratio}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}

            {/* User Report */}
            {userReport && (
                <div className="albumProfile-section">
                    <div className="albumProfile-header">User Report: </div>
                    <div className="report-table-container">
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>User Name</th>
                                <th>Total Plays</th>
                                <th>Total Likes</th>
                                <th>Unique Artists Followed</th>
                                <th>Songs Played But Not Liked</th>
                                <th>Following Percentage</th>
                                <th>Like-to-Play Ratio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userReport.map((user) => (
                                <tr key={user.user_id}>
                                    <td>{user.user_name}</td>
                                    <td>{user.total_plays}</td>
                                    <td>{user.total_likes}</td>
                                    <td>{user.unique_artists_followed}</td>
                                    <td>{user.songs_played_but_not_liked}</td>
                                    <td className={user.following_percentage >= 50 ? "green-text" : "red-text"}>
                                        {user.following_percentage}%
                                    </td>
                                    <td className={user.like_to_play_ratio >= 1 ? "green-text" : "red-text"}>
                                        {user.like_to_play_ratio}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                    <div></div>
                </div>
            )}
        </section>
    );
};