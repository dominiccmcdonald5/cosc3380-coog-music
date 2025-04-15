import React, {useState, useEffect} from 'react';
import play_button from './play.png';
import purple_image from './purple_image.png';
import './input.css';
import {SongForm, SongFormDelete, SongFormEdit, ChooseSongList} from './inputForms.js';
import {PlaylistViewPage} from './view.js';
import forward from './forward.png';
import verified from './isverifiedlogo.png';

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
                <PlaylistCard key={index} playlist={playlist} onPlaylistClick={onPlaylistClick} userId={userId}/>
            ))}
        </div>
    );
}

export const PlaylistCard = ({ playlist, onPlaylistClick, userId}) => {
    return (
        <div className="playlist-card">
            <img src={playlist.playlist_image} alt={playlist.playlist_name} className="playlist-image" />
            <h3 className="playlist-name">{playlist.playlist_name}</h3>
            <button
                className="forward-button"
                onClick={() => onPlaylistClick('playlist-view', playlist, userId)} // Pass the full playlist object
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
    const [playlistCount, setPlaylistCount] = useState(0);


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
            useEffect(() => {
                const fetchPlaylistCount = async () => {
                    try {
                        const response = await fetch('https://cosc3380-coog-music-2.onrender.com/playlistcount', {
                            method: 'POST',
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ userId }), 
                        })
                        console.log('Backend response:', response); 
    
                        const data = await response.json();
    
                        if (data.success) {
                            setPlaylistCount(data.playlist_count);  
                        } else {
                            setError('Failed to fetch playlists');
                        }
                    } catch (err) {
                        setError('Error fetching playlists');
                    } finally {
                        setLoading(false);  // Data is loaded or error occurred
                    }
                };
        
                fetchPlaylistCount();
            }, [userId]);
        
            if (loading) return <div>Loading user...</div>;
            if (error) return <div>{error}</div>;
            console.log(playlistCount);

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
                {playlistCount === 10 && (
                <div className="trigger-section">
                    <div className="playlist-trigger-message">
                        Warning: You have reached the maximum amount of playlists. Please delete a playlist before creating a new one.
                    </div>
                </div>
            )}

            <div className="playlist-section">
                <div className="playlist-header">Your Playlists:
                    <button className="create-playlist-button" onClick={() => setActiveScreen('create-playlist')}>
                        Create Playlist
                    </button>
                </div>
                <PlaylistList onPlaylistClick={onPlaylistClick} userName={userName} userId={userId}/>
            </div>
        </section>
    );
};

export const AlbumProfileList = ({onAlbumClick, userName, userId}) => {
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
                <AlbumProfileCard key={index} album={album} onAlbumClick={onAlbumClick} userName={userName} userId={userId}/>
            ))}
        </div>
    );
}

export const AlbumProfileCard = ({ album,onAlbumClick, userName, userId }) => {
    return (
        <div className="albumProfile-card">
            <img src={album.album_image || purple_image} alt={album.album_name} className="albumProfile-image" />
            <h3 className="albumProfile-name">{album.album_name}</h3>
            <button onClick={() => onAlbumClick('album-view-page', album, userName, userId)} className="forward-button">
                            <img src={forward} alt="forward" className="forward-icon" />
                        </button>
        </div>
    );
};

export const SongProfileList = ({userName, setCurrentSong, onSongClick, userId}) => {
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
                <SongProfileCard key={index} song={song} setCurrentSong={setCurrentSong} onSongClick={onSongClick} userId={userId} />
            ))}
        </div>
    );
};

export const SongProfileCard = ({ song , setCurrentSong, onSongClick, userId}) => {
    const [deleteError, setDeleteError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        const isConfirmed = window.confirm('Are you sure you want to delete this song?');
        try {
            setIsDeleting(true);
            setDeleteError(null);

            const response = await fetch('https://cosc3380-coog-music-2.onrender.com/deletesong', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: song.name,
                    artist: userId, 
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Song deleted successfully!');
            } else {
                setDeleteError(data.message || 'Failed to delete song');
            }
        } catch (error) {
            console.error('Error deleting song:', error);
            setDeleteError('Error connecting to the server.');
        } finally {
            setIsDeleting(false);
        }
    };
    return (
        <div className="songProfile-card">
            <img src={song.image || purple_image} alt={song.name} className="songProfile-image" />
            <h3 className="songProfile-name">{song.name}</h3>
            <h3 className="songProfile-album">{song.artist_name}</h3>
            <button
                className="delete-song-button"
                onClick={handleDelete}
                disabled={isDeleting}
            >
                {isDeleting ? 'Deleting...' : 'Delete'}
            </button>

            {deleteError && <div className="error-message">{deleteError}</div>}
            <button
                        className="edit-song-button"
                        onClick={() => onSongClick('edit-song',song,userId)}>
                        Edit
                    </button>
            <button onClick={() => setCurrentSong(song)} className="play-button">
                    <img src={play_button} alt="Play" className="play" />
            </button>
        </div>
    );
};

export const ArtistProfile = ({setActiveScreen, userName, userImage, onAlbumClick, userId, setCurrentSong, onSongClick}) => {
    const [stats, setStats] = useState({
        follow: 0,
        streams: 0,
        likedSongs: 0,
        likedAlbums: 0,
        isVerified: false
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
                                image_url: data.image_url,
                                follow: data.follow,
                                streams: data.streams,
                                likedSongs: data.likedSongs,
                                likedAlbums: data.likedAlbums,
                                isVerified: data.isVerified});  
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
                <img src={stats.image_url} alt="Profile" className="profile-image" />
                <h2 className="profile-username">{userName}</h2>
                {stats.isVerified == 1 && (
                            <img src={verified} alt="Verified" className="verifieddd-icon" />
                        )}
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

                </div>
            <AlbumProfileList userName={userName} onAlbumClick={onAlbumClick} userId={userId}/>
            </div>

            <div className="songProfile-section">
                <div className="songProfile-header">Your Songs: 
                <button
                        className="create-song-button"
                        onClick={() => setActiveScreen('create-song')}>
                        Create Song
                    </button>
                </div>
            <SongProfileList userName={userName} setCurrentSong={setCurrentSong} onSongClick={onSongClick} userId={userId}/>
            </div>
           
        </section>
    );
};


export const DataReports = () => {
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
                    <div className="albumProfile-header"></div>
                </div>
            )}
        </section>
    );
};