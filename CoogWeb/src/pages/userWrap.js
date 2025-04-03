import React, {useState, useEffect} from 'react';
import purple_image from './purple_image.png';
import './userWrap.css';

export const TopUserArtist = ({userId}) => {
    const [artists, setArtists] = useState([]);
        const [loading, setLoading] = useState(true);  // To track loading state
        const [error, setError] = useState(null);
    
        useEffect(() => {
            const fetchTopArtists = async () => {
                try {
                    const response = await fetch('https://cosc3380-coog-music-2.onrender.com/topuserartists', {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ userId: userId }), 
                    });
                    const data = await response.json();
    
                    if (data.success) {
                        setArtists(data.topArtists);  // Assuming the backend returns an array of artists
                    } else {
                        setError('Failed to fetch artists');
                    }
                } catch (err) {
                    setError('Error fetching artists');
                } finally {
                    setLoading(false);  // Data is loaded or error occurred
                }
            };
    
            fetchTopArtists();
        }, []);  // Empty dependency array to run this only once when the component mounts
    
        if (loading) return <div>Loading artists...</div>;
        if (error) return <div>{error}</div>;

    return (
        <div className="top-artist-list">
            {artists.map((artist, index) => (
                <TopUserArtistCard key={index} artist={artist} />
            ))}
        </div>
    );
}

export const TopUserArtistCard = ({ artist }) => {
    return (
        <div className="top-artist-card">
            <img src={artist.image_url || purple_image} alt={artist.artist_name} className="top-artist-image" />
            <h3 className="top-artist-name">{artist.artist_name}</h3>
        </div>
    );
};

export const TopUserSongList = ({userId}) => {
    const [songs, setSongs] = useState([]);
        const [loading, setLoading] = useState(true);  // To track loading state
        const [error, setError] = useState(null);
    
        useEffect(() => {
            const fetchTopUserSongs = async () => {
                try {
                    const response = await fetch('https://cosc3380-coog-music-2.onrender.com/topusersongs', {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ userId: userId }), 
                    });
                    const data = await response.json();
    
                    if (data.success) {
                        setSongs(data.songs);  // Assuming the backend returns an array of artists
                    } else {
                        setError('Failed to fetch songs');
                    }
                } catch (err) {
                    setError('Error fetching songs');
                } finally {
                    setLoading(false);  // Data is loaded or error occurred
                }
            };
    
            fetchTopUserSongs();
        }, []);  
    
        if (loading) return <div>Loading songs...</div>;
        if (error) return <div>{error}</div>;

    return (
        <div className="top-song-list">
            {songs.map((song, index) => (
                <TopUserSongCard key={index} song={song} />
            ))}
        </div>
    );
};

export const TopUserSongCard = ({ song }) => {
    return (
        <div className="topsong-card">
            <h3 className="topsong-rank">{song.ranks}</h3>
            <img src={song.image_url} alt={song.name} className="topsong-image" />
            <h3 className="topsong-name">{song.name}</h3>
            <h3 className="topsong-artist">{song._name}</h3>
        </div>
    );
};

export const TopUserAlbum = ({userId}) => {
    const [albums, setAlbums] = useState([]);
        const [loading, setLoading] = useState(true);  // To track loading state
        const [error, setError] = useState(null);
    
        useEffect(() => {
            const fetchTopAlbums = async () => {
                try {
                    const response = await fetch('https://cosc3380-coog-music-2.onrender.com/topuseralbums', {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ userId: userId }), 
                    });
                    const data = await response.json();
    
                    if (data.success) {
                        setAlbums(data.topAlbums);  // Assuming the backend returns an array of artists
                    } else {
                        setError('Failed to fetch albums');
                    }
                } catch (err) {
                    setError('Error fetching albums');
                } finally {
                    setLoading(false);  // Data is loaded or error occurred
                }
            };
    
            fetchTopAlbums();
        }, []);  // Empty dependency array to run this only once when the component mounts
    
        if (loading) return <div>Loading albums...</div>;
        if (error) return <div>{error}</div>;

    return (
        <div className="top-album-list">
            {albums.map((album, index) => (
                <TopUserAlbumCard key={index} album={album} />
            ))}
        </div>
    );
}

export const TopUserAlbumCard = ({ album }) => {
    return (
        <div className="top-album-card">
            <img src={album.image_url} alt={album.album_name} className="top-album-image" />
            <h3 className="top-album-name">{album.album_name}</h3>
            <p className="top-album-artist">{album.artist_name}</p>
        </div>
    );
};

export const TopUserGenre = ({userId}) => {
    const [genres, setGenres] = useState([]);
        const [loading, setLoading] = useState(true);  // To track loading state
        const [error, setError] = useState(null);
    
        useEffect(() => {
            const fetchTopGenres = async () => {
                try {
                    const response = await fetch('https://cosc3380-coog-music-2.onrender.com/topusergenres', {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ userId: userId }), 
                    });
                    const data = await response.json();
    
                    if (data.success) {
                        setGenres(data.topGenres);  // Assuming the backend returns an array of artists
                    } else {
                        setError('Failed to fetch genres');
                    }
                } catch (err) {
                    setError('Error fetching genres');
                } finally {
                    setLoading(false);  // Data is loaded or error occurred
                }
            };
    
            fetchTopGenres();
        }, []);  // Empty dependency array to run this only once when the component mounts
    
        if (loading) return <div>Loading genres...</div>;
        if (error) return <div>{error}</div>;

    return (
        <div className="top-genre-list">
            {genres.map((genre, index) => (
                <TopUserGenreCard key={index} genre={genre} />
            ))}
        </div>
    );
};

export const TopUserGenreCard = ({ genre }) => {
    return (
        <div className="top-genre-card"> 
            <h3 className="top-genre-name">{genre.genre_name}</h3>
        </div>
    );
};

export const TopUserOther = ({userId}) => {
    const [others, setOthers] = useState([]);
        const [loading, setLoading] = useState(true);  // To track loading state
        const [error, setError] = useState(null);
    
        useEffect(() => {
            const fetchTopOthers = async () => {
                try {
                    const response = await fetch('https://cosc3380-coog-music-2.onrender.com/topuserothers', {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ userId: userId }), 
                    });
                    const data = await response.json();
    
                    if (data.success && data.topOthers && typeof data.topOthers === 'object') {
                        setOthers(Object.entries(data.topOthers)); // Assuming the backend returns an array of artists
                    } else {
                        setError('Failed to fetch others');
                    }
                } catch (err) {
                    setError('Error fetching others');
                } finally {
                    setLoading(false);  // Data is loaded or error occurred
                }
            };
    
            fetchTopOthers();
        }, []);  // Empty dependency array to run this only once when the component mounts
    
        if (loading) return <div>Loading others...</div>;
        if (error) return <div>{error}</div>;

    // Convert the `others` object into an array of key-value pairs

    return (
        <div className="other-list">
            {others.map(([label, value], index) => (
                <UserOtherCard key={index} label={label} other={value} />
            ))}
        </div>
    );
};

export const UserOtherCard = ({ label, other }) => {
    // Format the label to be more readable (e.g., "totalstreams" -> "Total Streams")
    const formattedLabel = label
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter
        .replace("total", ""); // Remove the word "total"

    return (
        <div className="other-card">
            <h3 className="other-label">{formattedLabel}</h3>
            <p className="other-value">{other.toLocaleString()}</p> {/* Format numbers with commas */}
        </div>
    );
};


export const CougarWrapUp = ({userName, userId, userImage}) => {
    return (
        <section className="wrapUpPage">
        <div className="profile-section">
                <div className="profile-header">
                    <img src={userImage || purple_image} alt="Profile" className="profile-image" />
                    <h2 className="profile-username">{userName} Wrap Up!</h2>
                </div>
        </div>
        <div className="top-artists-section">
                        <div className="top-artists-header">Top 3 Artists of the Week! 
                        </div>
                        <TopUserArtist userId={userId}/>
                    </div>
            
                    <div className="top-songs-section">
                        <div className="top-songs-header">Top 10 Songs of the Week! 
                        </div>
                        <TopUserSongList userId={userId}/>
                    </div>
            
                    <div className="top-albums-section">
                        <div className="top-albums-header">Top 3 Albums of the Week! 
                        </div>
                        <TopUserAlbum userId={userId}/>
                    </div>
            
                    <div className="top-genres-section">
                        <div className="top-genres-header">Top 3 Genres of the Week! 
                        </div>
                        <TopUserGenre userId={userId}/>
                    </div>
            
                    <div className="Other-Sections">
                        <div className = "other-header"> Miscellaneous Information
                        </div>
                        <TopUserOther userId={userId}/>
                    </div>
        </section>
    );
}