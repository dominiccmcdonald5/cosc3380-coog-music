import React, {useState, useEffect} from 'react';
import purple_image from './purple_image.png';
import heart from './heart.png';
import './sections.css';
import play_button from './play.png';
import forward from './forward.png';
import { ArtistView, AlbumViewPage, PlaylistViewPage } from './view';


export const SongList = () => {
    const [songs] = useState([
        { id: 1, name: "Blinding Lights", photo: purple_image,artist: "Lady Gaga" },
        { id: 2, name: "Shape of You", photo: purple_image,artist: "Lady Gaga" },
        { id: 3, name: "Someone Like You", photo: purple_image,artist: "Lady Gaga" },
        { id: 4, name: "Uptown Funk", photo: purple_image,artist: "Lady Gaga" },
        { id: 5, name: "Levitating", photo: purple_image,artist: "Lady Gaga" },
        { id: 6, name: "Levitating", photo: purple_image,artist: "Lady Gaga" },
        { id: 7, name: "Levitating", photo: purple_image,artist: "Lady Gaga" },
        { id: 8, name: "Levitating", photo: purple_image,artist: "Lady Gaga" },
        { id: 9, name: "Levitating", photo: purple_image,artist: "Lady Gaga" }
    ]);

    return (
        <div className="song-list">
            {songs.map((song) => (
                <SongCard key={song.id} song={song} />
            ))}
        </div>
    );
};

export const SongCard = ({ song }) => {
    const [isLiked, setIsLiked] = useState(false); // State to track if the heart is "liked"

    const handleHeartClick = () => {
        setIsLiked(!isLiked); // Toggle the liked state
    };

    return (
        <div className="song-card">
            <img src={song.photo} alt={song.name} className="song-image" />
            <h3 className="song-name">{song.name}</h3>
            <h3 className="song-artist">{song.artist}</h3>
            <div className="bottom-section">
                <img
                    src={heart} // Use the same heart image
                    alt="heart"
                    className={`heart-image ${isLiked ? "liked" : ""}`} // Add class if liked
                    onClick={handleHeartClick} // Handle click event
                />
                <img src={play_button} alt="play" className="play-button" />
            </div>
        </div>
    );
};

export const ArtistList = ({onArtistClick}) => {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);  // To track loading state
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArtists = async () => {
            try {
                const response = await fetch('http://localhost:5000/artistlist', {
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

    if (loading) return <div>Loading artists...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="artist-list">
          {artists.map((artist, index) => (
            <ArtistCard key={index} artist={artist} onArtistClick={onArtistClick} />
          ))}
        </div>
      );
}

export const ArtistCard = ({ artist, onArtistClick }) => {
    return (
      <div className="artist-card">
        <img src={artist.image_url} alt={artist.username} className="artist-image" />
        <h3 className="artist-name">{artist.username}</h3>
        <button onClick={() => onArtistClick('artist-view', artist)} className="forward-button">
          <img src={forward} alt="forward" className="forward-icon" />
        </button>
      </div>
    );
};

  export const AlbumList = ({ onAlbumClick }) => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);  // To track loading state
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const response = await fetch('http://localhost:5000/albumlist', {
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

    if (loading) return <div>Loading albums...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="album-list">
            {albums.map((album, index) => (
                <AlbumCard key={index} album={album} onAlbumClick={onAlbumClick} />
            ))}
        </div>
    );
};


export const AlbumCard = ({ album, onAlbumClick }) => {
    const [isLiked, setIsLiked] = useState(false); // State to track if the heart is "liked"
  
    const handleHeartClick = () => {
      setIsLiked(!isLiked); // Toggle the liked state
    };
  
    return (
      <div className="album-card">
        <img src={album.photo} alt={album.album_name} className="album-image" />
        <h3 className="album-name">{album.album_name}</h3>
        <h3 className="album-artist">{album.artist_username}</h3>
        <div className="bottom-section">
          <img
            src={heart} // Use the same heart image
            alt="heart"
            className={`heart-image ${isLiked ? "liked" : ""}`} // Add class if liked
            onClick={handleHeartClick} // Handle click event
          />
          <button onClick={() => onAlbumClick('album-view-page')} className="forward-button">
            <img src={forward} alt="forward" className="forward-icon" />
          </button>
        </div>
      </div>
    );
  };

export const UserList = () => {
    const [users] = useState([
        { id: 1, name: "Ariana Grande", photo: purple_image, },
        { id: 2, name: "The Beatles", photo: purple_image },
        { id: 3, name: "Zutomayo", photo: purple_image },
        { id: 4, name: "Lady Gaga", photo: purple_image },
        { id: 5, name: "Nightcore @ 25", photo: purple_image },
        { id: 6, name: "Taylor Swift", photo: purple_image },
        { id: 7, name: "Rick Montgomery", photo: purple_image },
        { id: 8, name: "Doechii", photo: purple_image },
        { id: 9, name: "Deco*27", photo: purple_image }
    ]);

    return (
        <div className="user-list">
            {users.map((user) => (
                <UserCard key={user.id} user={user} />
            ))}
        </div>
    );
}

export const UserCard = ({ user }) => {
    
    return (
        <div className="user-card">
            <img src={user.photo} alt={user.name} className="user-image" />
            <h3 className="user-name">{user.name}</h3>
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