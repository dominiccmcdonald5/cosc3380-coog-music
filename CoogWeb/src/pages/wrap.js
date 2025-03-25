import React, {useState, useEffect} from 'react';
import purple_image from './purple_image.png';
import './wrap.css';

export const TopArtist = () => {
    const [artists, setArtists] = useState([]);
        const [loading, setLoading] = useState(true);  // To track loading state
        const [error, setError] = useState(null);
    
        useEffect(() => {
            const fetchTopArtists = async () => {
                try {
                    const response = await fetch('https://cosc3380-coog-music-2.onrender.com/topartists', {
                        method: 'GET',
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
                <TopArtistCard key={index} artist={artist} />
            ))}
        </div>
    );
}

export const TopArtistCard = ({ artist }) => {
    return (
        <div className="top-artist-card">
            <img src={artist.image_url} alt={artist.username} className="top-artist-image" />
            <h3 className="top-artist-name">{artist.username}</h3>
        </div>
    );
};

export const TopSongList = () => {
    const [songs, setSongs] = useState([]);
        const [loading, setLoading] = useState(true);  // To track loading state
        const [error, setError] = useState(null);
    
        useEffect(() => {
            const fetchTopSongs = async () => {
                try {
                    const response = await fetch('https://cosc3380-coog-music-2.onrender.com/topsongs', {
                        method: 'GET',
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
    
            fetchTopSongs();
        }, []);  
    
        if (loading) return <div>Loading songs...</div>;
        if (error) return <div>{error}</div>;

    return (
        <div className="top-song-list">
            {songs.map((song, index) => (
                <TopSongCard key={index} song={song} />
            ))}
        </div>
    );
};

export const TopSongCard = ({ song }) => {
    return (
        <div className="topsong-card">
            <h3 className="topsong-rank">{song.ranks}</h3>
            <img src={song.image_url} alt={song.name} className="topsong-image" />
            <h3 className="topsong-name">{song.name}</h3>
            <h3 className="topsong-artist">{song._name}</h3>
        </div>
    );
};

export const TopAlbum = () => {
    const [albums, setAlbums] = useState([]);
        const [loading, setLoading] = useState(true);  // To track loading state
        const [error, setError] = useState(null);
    
        useEffect(() => {
            const fetchTopAlbums = async () => {
                try {
                    const response = await fetch('https://cosc3380-coog-music-2.onrender.com/topalbums', {
                        method: 'GET',
                    });
                    const data = await response.json();
    
                    if (data.success) {
                        setAlbums(data.topAlbums);  // Assuming the backend returns an array of artists
                    } else {
                        setError('Failed to fetch artists');
                    }
                } catch (err) {
                    setError('Error fetching artists');
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
                <TopAlbumCard key={index} album={album} />
            ))}
        </div>
    );
}

export const TopAlbumCard = ({ album }) => {
    return (
        <div className="top-album-card">
            <img src={album.image_url} alt={album.name} className="top-album-image" />
            <h3 className="top-album-name">{album.name}</h3>
            <p className="top-album-artist">{album.artist_name}</p>
        </div>
    );
};

export const TopGenre = () => {
    const [genres, setGenres] = useState([]);
        const [loading, setLoading] = useState(true);  // To track loading state
        const [error, setError] = useState(null);
    
        useEffect(() => {
            const fetchTopGenres = async () => {
                try {
                    const response = await fetch('https://cosc3380-coog-music-2.onrender.com/topgenres', {
                        method: 'GET',
                    });
                    const data = await response.json();
    
                    if (data.success) {
                        setGenres(data.topGenres);  // Assuming the backend returns an array of artists
                    } else {
                        setError('Failed to fetch artists');
                    }
                } catch (err) {
                    setError('Error fetching artists');
                } finally {
                    setLoading(false);  // Data is loaded or error occurred
                }
            };
    
            fetchTopGenres();
        }, []);  // Empty dependency array to run this only once when the component mounts
    
        if (loading) return <div>Loading albums...</div>;
        if (error) return <div>{error}</div>;

    return (
        <div className="top-genre-list">
            {genres.map((genre, index) => (
                <TopGenreCard key={index} genre={genre} />
            ))}
        </div>
    );
};

export const TopGenreCard = ({ genre }) => {
    return (
        <div className="top-genre-card"> 
            <h3 className="top-genre-name">{genre.genre_name}</h3>
        </div>
    );
};

export const Other = () => {
    const [others, setOthers] = useState([]);
        const [loading, setLoading] = useState(true);  // To track loading state
        const [error, setError] = useState(null);
    
        useEffect(() => {
            const fetchTopOthers = async () => {
                try {
                    const response = await fetch('https://cosc3380-coog-music-2.onrender.com/topothers', {
                        method: 'GET',
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
    
        if (loading) return <div>Loading albums...</div>;
        if (error) return <div>{error}</div>;

    // Convert the `others` object into an array of key-value pairs

    return (
        <div className="other-list">
            {others.map(([label, value], index) => (
                <OtherCard key={index} label={label} other={value} />
            ))}
        </div>
    );
};

export const OtherCard = ({ label, other }) => {
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


export const TopTrending = () => {
    return (
        <section className = "Trending-Page">
        <div className="trending-section">
            <div className="trending-header">
                <h2>Top Trending</h2>
            </div>
        </div>

        <div className="top-artists-section">
            <div className="top-artists-header">Top 3 Artists of the Week! 
            </div>
            <TopArtist />
        </div>

        <div className="top-songs-section">
            <div className="top-songs-header">Top 10 Songs of the Week! 
            </div>
            <TopSongList />
        </div>

        <div className="top-albums-section">
            <div className="top-albums-header">Top 3 Albums of the Week! 
            </div>
            <TopAlbum />
        </div>

        <div className="top-genres-section">
            <div className="top-genres-header">Top 3 Genres of the Week! 
            </div>
            <TopGenre />
        </div>

        <div className="Other-Sections">
            <div className = "other-header"> Miscellaneous Information
            </div>
            <Other />
        </div>
        </section>
    );
};
