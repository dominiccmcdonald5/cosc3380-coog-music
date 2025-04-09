import React, {useState, useEffect} from 'react';
import purple_image from './purple_image.png';
import heart from './heart.png';
import './view.css';
import play_button from './play.png';
import verified from './isverifiedlogo.png';


export const AlbumViewList = ({artist = {}}) => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);  // To track loading state
    const [error, setError] = useState(null);

        useEffect(() => {
            const fetchArtistAlbums = async () => {
                try {
                    const response = await fetch('https://cosc3380-coog-music-2.onrender.com/artistalbum', {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ username: artist.username }), 
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
    
            fetchArtistAlbums();
        }, [artist.username]);
        if (loading) return <div>Loading albums...</div>;
        if (error) return <div>{error}</div>;

    return (
        <div className="albumView-list">
            {albums.map((album, index) => (
                <AlbumViewCard key={index} album={album} />
            ))}
        </div>
    );
}

export const AlbumViewCard = ({ album }) => {
    return (
        <div className="albumView-card">
            <img src={album.album_image} alt={album.album_name} className="albumView-image" />
            <h3 className="albumView-name">{album.album_name}</h3>
        </div>
    );
};

export const SongViewList = ({artist = {}}) => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);  // To track loading state
    const [error, setError] = useState(null);

        useEffect(() => {
            const fetchArtistSong = async () => {
                try {
                    const response = await fetch('https://cosc3380-coog-music-2.onrender.com/artistsong', {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ username: artist.username }), 
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
    
            fetchArtistSong();
        }, [artist.username]);
        if (loading) return <div>Loading songs...</div>;
        if (error) return <div>{error}</div>;

    return (
        <div className="songView-list">
            {songs.map((song, index) => (
                <SongViewCard key={index} song={song} />
            ))}
        </div>
    );
};

export const SongViewCard = ({ song }) => {
    return (
        <div className="songView-card">
            <img src={song.song_image} alt={song.song_name} className="songView-image" />
            <h3 className="songView-name">{song.song_name}</h3>
            <h3 className="songView-album">{song.album_name}</h3>
        </div>
    );
};

export const ArtistView = ({ artist = {}, accountType, userId}) => {
    const [isFollowing, setIsFollowing] = useState(false);

    const fetchFollowStatus = async () => {
        setLoading(true);
        setError(null); // Reset error state

        try {
            const response = await fetch(`https://cosc3380-coog-music-2.onrender.com/checkfollowstatus`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userId,
                    artist_id: artist.artist_id,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setIsFollowing(data.isFollowing); // Set initial follow status based on backend response
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to check follow status');
            }
        } catch (error) {
            setError('Error fetching follow status');
        } finally {
            setLoading(false); // Set loading to false after request is done
        }
    };

    // Function to handle the "Follow" action
    const handleFollowClick = async () => {
        setLoading(true);
        setError(null); // Reset error state

        try {
            const response = await fetch("https://cosc3380-coog-music-2.onrender.com/follow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userId,
                    artist_id: artist.artist_id,
                }),
            });

            if (response.ok) {
                setIsFollowing(true); // Mark as followed after successful API response
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to follow user');
            }
        } catch (error) {
            setError('Error following user');
        } finally {
            setLoading(false); // Set loading to false after request is done
        }
    };

    // Function to handle the "Unfollow" action
    const handleUnfollowClick = async () => {
        setLoading(true);
        setError(null); // Reset error state

        try {
            const response = await fetch("https://cosc3380-coog-music-2.onrender.com/unfollow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userId,
                    artist_id: artist.artist_id,
                }),
            });

            if (response.ok) {
                setIsFollowing(false); // Mark as unfollowed after successful API response
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to unfollow user');
            }
        } catch (error) {
            setError('Error unfollowing user');
        } finally {
            setLoading(false); // Set loading to false after request is done
        }
    };

    useEffect(() => {
        fetchFollowStatus(); // Fetch follow status when the component mounts
    }, [userId, artist.artist_id]);


    const [info, setInfo] = useState({
        follow: 0,
        streams: 0,
        likedSongs: 0,
        likedAlbums: 0,
        isVerified: false,
    });
    const [loading, setLoading] = useState(true);  // To track loading state
    const [error, setError] = useState(null);
    
        useEffect(() => {
            const fetchArtistInfo = async () => {
                try {
                    const response = await fetch('https://cosc3380-coog-music-2.onrender.com/artistview', {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ username: artist.username }), 
                    });
                    const data = await response.json();
    
                    if (data.success) {
                        setInfo({
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
    
            fetchArtistInfo();
        }, []);  // Empty dependency array to run this only once when the component mounts

    
        if (loading) return <div>Loading artists...</div>;
        if (error) return <div>{error}</div>;
    return (
      <section className="everything">
        <div className="profile-section">
          <div className="profile-header">
            <img src={artist.image_url} alt="Profile" className="profile-image" />
            <h2 className="profile-username">{artist.username}</h2>
            {info.isVerified == 1 && <img src={verified} alt="Verified" className="verified-icon" />}
          </div>
          <div className="basic-stats">
            <p className="basic-stats-text">Followers: {info.follow}</p>
            <p className="basic-stats-text">Streams: {info.streams}</p>
            <p className="basic-stats-text">Liked Songs: {info.likedSongs}</p>
            <p className="basic-stats-text">Liked Albums: {info.likedAlbums}</p>
            {accountType !== 'artist' && accountType !== 'admin' && (
            <button 
            className="follow-button" 
            onClick={isFollowing ? handleUnfollowClick : handleFollowClick}
            >
                {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
            )}
          </div>
        </div>
        <div className="albumView-section">
                        <div className="albumView-header">Albums: 
                        </div>
            <AlbumViewList artist={artist}/>
        </div>

        <div className="songView-section">
                <div className="songView-header">Songs: 
                </div>
            <SongViewList artist={artist}/>
        </div>
      </section>
    );
  };

  export const AlbumViewPage = ({ album = {}, accountType, userId, setCurrentSong, userName, setActiveScreen}) => {
    const [isLiked, setIsLiked] = useState(false); // State to track if the heart is "liked"
    const [info, setInfo] = useState({
        songCount: 0,
        streams: 0,
        likes: 0,
    });
    const [loading, setLoading] = useState(true); // To track loading state
    const [error, setError] = useState(null); // To track error state

    // UseEffect to handle initial like status fetching
    useEffect(() => {
        if (accountType === 'user' && album.album_id) {
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
                        setIsLiked(data.isLiked);  // Set initial like status
                    } else {
                        setError('Failed to fetch like status');
                    }
                } catch (err) {
                    setError('Error fetching like status');
                } 
            };

            fetchInitialLike();
        }
    }, [accountType, album.album_id, userId]);

    // Handle like/unlike actions for the album
    const handleHeartClick = async () => {
        const url = isLiked ? 'https://cosc3380-coog-music-2.onrender.com/albumunlikesong' : 'https://cosc3380-coog-music-2.onrender.com/albumlikesong';
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: userId, album_id: album.album_id }),
            });

            if (response.ok) {
                setIsLiked(!isLiked); // Toggle the like status
            } else {
                setError('Failed to update like status');
            }
        } catch (error) {
            setError('Error updating like status');
        }
    };

    // Fetch album info (song count, streams, likes)
    useEffect(() => {
        const fetchAlbumInfo = async () => {
            if (!album.album_name) {
                setError('Album name is missing');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('https://cosc3380-coog-music-2.onrender.com/albumview', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ album_name: album.album_name }), 
                });

                const data = await response.json();

                if (data.success) {
                    setInfo({
                        songCount: data.songCount,
                        streams: data.streams,
                        likes: data.likes,
                    });
                } else {
                    setError('Failed to fetch album info');
                }
            } catch (err) {
                setError('Error fetching album info');
            } finally {
                setLoading(false);  // Data is loaded or error occurred
            }
        };

        fetchAlbumInfo();
    }, [album.album_name]);

    // Return loading and error UI
    if (loading) return <div>Loading album...</div>;
    if (error) return <div>{error}</div>;

    return (
        <section className="everything">
            <div className="profile-section">
                <div className="profile-header">
                    <img src={album.album_image || purple_image} alt="Album Cover" className="profile-image" />
                    <h2 className="profile-username">{album.album_name}</h2>
                </div>
                <div className="basic-stats">
                    <p className="basic-stats-text">Songs: {info.songCount || 0}</p>
                    <p className="basic-stats-text">Streams: {info.streams || 0}</p>
                    <p className="basic-stats-text">Likes: {info.likes || 0}</p>
                    {accountType !== 'artist' && accountType !== 'admin' && (
                        <img
                            src={heart} // Use the same heart image
                            alt="heart"
                            className={`heart-image ${isLiked ? "liked" : ""}`} // Add class if liked
                            onClick={handleHeartClick} // Handle click event
                        />
                    )}

                    {accountType !== 'admin' && accountType !== 'user' && album.artist_username === userName && (<button
                        className="create-album-button"
                        onClick={() => setActiveScreen('edit-album',album, userId, userName)}>
                        Edit Album
                    </button>)}

                    {accountType !== 'admin' && accountType !== 'user' && album.artist_username === userName && (<button
                        className="create-album-button"
                        onClick={() => setActiveScreen('delete-album', album, userId, userName)}>
                        Delete Album
                    </button>)}
                </div>
            </div>

            <div className="songView-section">
            <div className="songView-header-container">
                <div className="songView-header">Songs:</div>
                {album.artist_username === userName && (
                <button className="create-playlist-button" onClick={() => setActiveScreen('choose-song-list', album, userId, accountType)}>
                    Add Song
                </button>)}
                {console.log(userId)}
            </div>
                <SongAlbumList album={album} setCurrentSong={setCurrentSong} userId={userId} userName={userName}/> 
                </div>
            
        </section>
    );
};

export const SongAlbumList = ({album = {}, setCurrentSong, userId, userName}) => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);  // To track loading state
    const [error, setError] = useState(null);

        useEffect(() => {
            const fetchAlbumSongs = async () => {
                try {
                    const response = await fetch('https://cosc3380-coog-music-2.onrender.com/albumsong', {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ album_name: album.album_name }), 
                    })
                    console.log('Backend response:', response); 

                    const data = await response.json();

                    if (data.success) {
                        setSongs(data.songList);  
                    } else {
                        setError('Failed to fetch songs');
                    }
                } catch (err) {
                    setError('Error fetching songs');
                } finally {
                    setLoading(false);  // Data is loaded or error occurred
                }
            };
    
            fetchAlbumSongs();
        }, [album.album_name]);
        if (loading) return <div>Loading songs...</div>;
        if (error) return <div>{error}</div>;

    return (
        <div className="songView-list">
            {songs.map((song, index) => (
                <SongViewAlbumCard key={index} song={song} setCurrentSong={setCurrentSong} userId={userId} userName={userName} album={album}/>
            ))}
        </div>
    );
};

export const SongViewAlbumCard = ({ song, setCurrentSong, userId, userName, album}) => {
    const handleRemoveSong = async () => {
        const payload = {
            name: album.album_name,
            artistId: userId,
            song_name: song.name,
        };

        try {
            const response = await fetch('https://cosc3380-coog-music-2.onrender.com/removesongfromalbum', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Song removed successfully!");
            } else {
                alert("Failed to remove song: " + data.message);
            }
        } catch (error) {
            console.error("Error removing song:", error);
            alert("Error connecting to the server.");
        }
    };
    return (
        <div className="songView-card">
            <img src={song.image} alt={song.name} className="songView-image" />
            <h3 className="songView-name">{song.name}</h3>
            <h3 className="songView-album">{song.album_name}</h3>
            {song.artist_id !== userName && (
                <>
                

                    <button
                        className="editt-song-button"
                        onClick={handleRemoveSong}
                    >
                        Remove Song
                    </button>
                </>
            )}
            <button onClick={() => setCurrentSong(song)} className="play-button">
                <img src={play_button} alt="Play" className="play" />
            </button>
        </div>
    );
};

export const PlaylistList = ({ onPlaylistClick, userName }) => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);  // To track loading state
    const [error, setError] = useState(null);
    
    useEffect(() => {
        console.log("useEffect triggered");  // This will log every time useEffect runs
        const fetchProfilePlaylist = async () => {
            try {
                const response = await fetch('https://cosc3380-coog-music-2.onrender.com/profileplaylist', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userName }), 
                });
                console.log('Backend response:', response); 
                const data = await response.json();
    
                if (data.success) {
                    setPlaylists(data.playlists);  
                } else {
                    setError('Failed to fetch playlists');
                }
            } catch (err) {
                setError('Error fetching playlists');
            }
            setLoading(false);  // Ensure loading is false after the fetch is complete
        };
    
        fetchProfilePlaylist();
    }, [userName]);

    if (loading) return <div>Loading playlists...</div>;
    if (error) return <div>{error}</div>;

    console.log(playlists);

    return (
        <div className="playlist-list">
            {playlists.map((playlist) => (
                <SongPlaylistListCard key={playlist.playlist_id} playlist={playlist} onPlaylistClick={onPlaylistClick} />
            ))}
        </div>
    );
};

export const SongPlaylistListCard = ({ song }) => {
    
    return (
        <div className="songView-card">
            <img src={song.image} alt={song.song_name} className="songView-image" />
            <h3 className="songView-name">{song.song_name}</h3>
            <h3 className="songView-album">{song.artist_name}</h3>
        </div>
    );
};

export const SongViewPlaylistList = ({playlist = {}, userId,setCurrentSong}) => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);  // To track loading state
    const [error, setError] = useState(null);

        useEffect(() => {
            const fetchPlaylistSong = async () => {
                try {
                    const response = await fetch('https://cosc3380-coog-music-2.onrender.com/playlistsongs', {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ playlist_name:playlist.playlist_name, user_id: userId }), 
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
    
            fetchPlaylistSong();
        }, [playlist.playlist_name]);
        if (loading) return <div>Loading songs...</div>;
        if (error) return <div>{error}</div>;

    return (
        <div className="songView-list">
            {songs.map((song, index) => (
                <SongViewPlaylistCard key={index} song={song} setCurrentSong={setCurrentSong} playlist={playlist} userId={userId} />
            ))}
        </div>
    );
};

export const SongViewPlaylistCard = ({ song, setCurrentSong, playlist, userId, setActiveScreen }) => {

    const handleRemoveSong = async () => {
        const payload = {
            name: playlist.playlist_name,
            user: userId,
            song_name: song.name,
        };

        try {
            const response = await fetch('https://cosc3380-coog-music-2.onrender.com/removeplaylistsong', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Song removed successfully!");
            } else {
                alert("Failed to remove song: " + data.message);
            }
        } catch (error) {
            console.error("Error removing song:", error);
            alert("Error connecting to the server.");
        }
    };

    return (
        <div className="songView-card">
            <img src={song.image || purple_image} alt={song.name} className="songView-image" />
            <h3 className="songView-name">{song.name}</h3>

            

            {playlist.playlist_name !== 'Liked Songs' && (
                <>
                

                    <button
                        className="editt-song-button"
                        onClick={handleRemoveSong}
                    >
                        Remove Song
                    </button>
                </>
            )}
            <button onClick={() => setCurrentSong(song)} className="play-button">
                <img src={play_button} alt="Play" className="play" />
            </button>
        </div>
    );
};

export const PlaylistViewPage = ({ playlist, userName, userId, userImage, setActiveScreen, setCurrentSong, accountType}) => {
    const [stats, setStats] = useState({
        songCount: 0,
        image_url: ""
    });
    const [loading, setLoading] = useState(true);  // To track loading state
    const [error, setError] = useState(null);
    
        useEffect(() => {
            console.log("Playlist object:", playlist);
            const fetchPlaylistInfo = async () => {
                try {
                    const response = await fetch('https://cosc3380-coog-music-2.onrender.com/playlistviewinfo', {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({username : userName, playlist_name : playlist.playlist_name}), 
                    });
                    const data = await response.json();

    
                    if (data.success) {
                        setStats({
                            songCount: data.songCount,
                            image_url: data.image_url});  
                    } else {
                        setError('Failed to fetch playlist info');
                    }
                } catch (err) {
                    setError('Error fetching playlist info');
                } finally {
                    setLoading(false);  // Data is loaded or error occurred
                }
            };
    
            fetchPlaylistInfo();
        }, [userName, playlist.playlist_name]);  // Empty dependency array to run this only once when the component mounts

    
        if (loading) return <div>Loading playlist...</div>;
        if (error) return <div>{error}</div>;
    return (
        <section className="everything">
            <div className="profile-section">
                <div className="profile-header">
                    <img src={stats.image_url || purple_image} alt="Playlist Cover" className="profile-image" />
                    <h2 className="profile-username">{playlist.playlist_name}</h2>
                </div>
                <div className="basic-stats">
                    <p className="basic-stats-text">Songs: {stats.songCount || 0}</p>
                    {playlist.playlist_name !== 'Liked Songs' && (
                    <button 
                        className="create-playlist-button" 
                        onClick={() => setActiveScreen('edit-playlist', playlist, userId)}
                    >
                        Edit Playlist
                    </button>)}
                    
                    {playlist.playlist_name !== 'Liked Songs' && (
                    <button className="create-playlist-button" onClick={() => setActiveScreen('delete-playlist',playlist,userId)}>
                    Delete Playlist
                    </button>)}

                </div>
            </div>

            <div className="songView-section">
            <div className="songView-header-container">
                <div className="songView-header">Songs:</div>
                {playlist.playlist_name !== 'Liked Songs' && (
                <button className="create-playlist-button" onClick={() => setActiveScreen('choose-song-list', playlist, userId, accountType)}>
                    Add Song
                </button>)}
                
            </div>
                <SongViewPlaylistList playlist={playlist} userName={userName} userId={userId} setCurrentSong={setCurrentSong}/>
            </div>
        </section>
    );
};

