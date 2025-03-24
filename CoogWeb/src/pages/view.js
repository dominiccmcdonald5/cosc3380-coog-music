import React, {useState, useEffect} from 'react';
import purple_image from './purple_image.png';
import heart from './heart.png';
import './view.css';
import play_button from './play.png';

export const AlbumViewList = ({artist = {}}) => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);  // To track loading state
    const [error, setError] = useState(null);

        useEffect(() => {
            const fetchArtistAlbums = async () => {
                try {
                    const response = await fetch('http://localhost:5000/artistalbum', {
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
                    const response = await fetch('http://localhost:5000/artistsong', {
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
            <img src={song.image} alt={song.song_name} className="songView-image" />
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
            const response = await fetch(`http://localhost:5000/checkfollowstatus`, {
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
            const response = await fetch("http://localhost:5000/follow", {
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
            const response = await fetch("http://localhost:5000/unfollow", {
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
    });
    const [loading, setLoading] = useState(true);  // To track loading state
    const [error, setError] = useState(null);
    
        useEffect(() => {
            const fetchArtistInfo = async () => {
                try {
                    const response = await fetch('http://localhost:5000/artistview', {
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

  export const AlbumViewPage = ({ album = {}, accountType, userId}) => {
    const [isLiked, setIsLiked] = useState(false); // State to track if the heart is "liked"
    if (accountType == 'user') {
        useEffect(() => {
            const fetchInitialLike = async () => {
                try {
                    const response = await fetch('http://localhost:5000/albuminitiallike', {
                        method: 'POST',
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ userId:userId, album_id:album.album_id }), 
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
        }, [userId]);  
    }

const handleHeartClick = async () => {
    if (isLiked) {
        // Unlike the song
        try {
            const response = await fetch(`http://localhost:5000/albumunlikesong`, {
                method: 'POST',
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId:userId, album_id:album.album_id }), 
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
            const response = await fetch("http://localhost:5000/albumlikesong", {
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

    const [info, setInfo] = useState({
        songCount: 0,
        streams: 0,
        likes: 0,
    });
    const [loading, setLoading] = useState(true);  // To track loading state
    const [error, setError] = useState(null);
    
        useEffect(() => {
            const fetchAlbumInfo = async () => {
                try {
                    if (!album.album_name) {
                        setError('Album name is missing');
                        setLoading(false);
                        return;
                    }
                    const response = await fetch('http://localhost:5000/albumview', {
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
                            likes: data.likes});  
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
        }, [album.album_name]);  // Empty dependency array to run this only once when the component mounts

    
        if (loading) return <div>Loading albums...</div>;
        if (error) return <div>{error}</div>;

    return (
        <section className="everything">
            <div className="profile-section">
                <div className="profile-header">
                    <img src={album.photo || purple_image} alt="Album Cover" className="profile-image" />
                    <h2 className="profile-username">{album.album_name}</h2>
                </div>
                <div className="basic-stats">
                    <p className="basic-stats-text">Songs: {info.songCount || 0}</p>
                    <p className="basic-stats-text">Streams: {info.streams || 0}</p>
                    <p className="basic-stats-text">Likes: {info.likes || 0}</p>
                    {accountType !== 'artist' && accountType !== 'admin'  && (
                    <img
                        src={heart} // Use the same heart image
                        alt="heart"
                        className={`heart-image ${isLiked ? "liked" : ""}`} // Add class if liked
                        onClick={handleHeartClick} // Handle click event
                    />)}
                </div>
            </div>

            <div className="songView-section">
                <div className="songView-header">Songs: </div>
                <SongAlbumList album={album} /> 
            </div>
        </section>
    );
};

export const SongAlbumList = ({album = {}}) => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);  // To track loading state
    const [error, setError] = useState(null);

        useEffect(() => {
            const fetchAlbumSongs = async () => {
                try {
                    const response = await fetch('http://localhost:5000/albumsong', {
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
                <SongViewAlbumCard key={index} song={song} />
            ))}
        </div>
    );
};

export const SongViewAlbumCard = ({ song }) => {
    return (
        <div className="songView-card">
            <img src={song.image} alt={song.song_name} className="songView-image" />
            <h3 className="songView-name">{song.song_name}</h3>
            <h3 className="songView-album">{song.album_name}</h3>
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
                const response = await fetch('http://localhost:5000/profileplaylist', {
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
                <PlaylistCard key={playlist.playlist_id} playlist={playlist} onPlaylistClick={onPlaylistClick} />
            ))}
        </div>
    );
};

export const SongPlaylistListCard = ({ song }) => {
    
    return (
        <div className="songView-card">
            <img src={song.song_image} alt={song.song_name} className="songView-image" />
            <h3 className="songView-name">{song.song_name}</h3>
            <h3 className="songView-album">{song.artist_name}</h3>
        </div>
    );
};

export const SongViewPlaylistList = ({playlist = {}}) => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);  // To track loading state
    const [error, setError] = useState(null);

        useEffect(() => {
            const fetchPlaylistSong = async () => {
                try {
                    const response = await fetch('http://localhost:5000/playlistsongs', {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ playlist_name:playlist.playlist_name }), 
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
                <SongViewPlaylistCard key={index} song={song} />
            ))}
        </div>
    );
};

export const SongViewPlaylistCard = ({ song }) => {
    return (
        <div className="songView-card">
            <img src={song.image} alt={song.song_name} className="songView-image" />
            <h3 className="songView-name">{song.song_name}</h3>
            <h3 className="songView-album">{song.album_name}</h3>
        </div>
    );
};

export const PlaylistViewPage = ({ playlist, userName, userId, userImage}) => {
    const [stats, setStats] = useState({
        songCount: 0
    });
    const [loading, setLoading] = useState(true);  // To track loading state
    const [error, setError] = useState(null);
    
        useEffect(() => {
            console.log("Playlist object:", playlist);
            const fetchPlaylistInfo = async () => {
                try {
                    const response = await fetch('http://localhost:5000/playlistviewinfo', {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({username : userName, playlist_name : playlist.playlist_name}), 
                    });
                    const data = await response.json();

    
                    if (data.success) {
                        setStats({
                            songCount: data.songCount});  
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
                    <img src={userImage || purple_image} alt="Playlist Cover" className="profile-image" />
                    <h2 className="profile-username">{playlist.playlist_name}</h2>
                </div>
                <div className="basic-stats">
                    <p className="basic-stats-text">Songs: {stats.songCount || 0}</p>
                </div>
            </div>

            <div className="songView-section">
                <div className="songView-header">Songs: </div>
                <SongViewPlaylistList playlist={playlist} userName={userName}/>
            </div>
        </section>
    );
};

