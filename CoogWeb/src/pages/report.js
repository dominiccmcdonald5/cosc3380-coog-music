import React, {useState, useEffect} from 'react';
import purple_image from './purple_image.png';
import './input.css';
import './report.css';

export const DataReport = () => {
    const [artistReport, setArtistReport] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // State for filter inputs
    const [filters, setFilters] = useState({
        username: "",
        date_from: "",
        date_to: "",
        streams: "",
        songs: "",
        albums: "",
        likes: "",
        followers: "",
        unique: "",
        verified: "",
    });

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        setFilters(prev => ({
            ...prev,
            [name]: name === "verified" 
                ? value === "" ? null : parseInt(value, 10)
                : value
        }));
    };

    // Fetch artist report with filters
    const fetchFilteredArtistReport = async () => {
        setLoading(true);
        setError(null);
        setArtistReport(null);

        try {
            const response = await fetch("https://cosc3380-coog-music-2.onrender.com/adminartistreport", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(filters),
            });

            const data = await response.json();
            if (data.success) {
                setArtistReport(data.data); // Set filtered data
            } else {
                setError("No results found.");
            }
        } catch (err) {
            setError("Failed to fetch artist report.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <section className="everything">
            <div className="profile-section">
                <div className="profile-header">
                    <h2 className="profile-username">Admin Artist Report</h2>
                </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            {/* Artist Report Filter Section */}
            <div className="filter-section">
  <h3>Filter Artist Report</h3>
  <div className="filter-form">
    <input
      type="text"
      name="username"
      placeholder="Artist Name"
      value={filters.username}
      onChange={handleInputChange}
    />

    <div className="filter-input">
      <label htmlFor="date_from">Start Date</label>
      <input
        type="date"
        id="date_from"
        name="date_from"
        value={filters.date_from}
        onChange={handleInputChange}
      />
    </div>

            <div className="filter-input">
            <label htmlFor="date_to">End Date</label>
            <input
                type="date"
                id="date_to"
                name="date_to"
                value={filters.date_to}
                onChange={handleInputChange}
            />
            </div>

            <input
            type="number"
            name="streams"
            placeholder="Min Streams"
            value={filters.streams}
            onChange={handleInputChange}
            />
            <input
            type="number"
            name="songs"
            placeholder="Min Songs"
            value={filters.songs}
            onChange={handleInputChange}
            />
            <input
            type="number"
            name="albums"
            placeholder="Min Albums"
            value={filters.albums}
            onChange={handleInputChange}
            />
            <input
            type="number"
            name="likes"
            placeholder="Min Likes"
            value={filters.likes}
            onChange={handleInputChange}
            />
            <input
            type="number"
            name="followers"
            placeholder="Min Followers"
            value={filters.followers}
            onChange={handleInputChange}
            />
            <input
            type="number"
            name="unique"
            placeholder="Min Unique Listeners"
            value={filters.unique}
            onChange={handleInputChange}
            />
            <select
            name="verified"
            value={filters.verified}
            onChange={handleInputChange}
            >
            <option value="">Select verification</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
            </select>

            <button onClick={fetchFilteredArtistReport}>Apply Filters</button>
        </div>
        </div>

            {/* Artist Report Output Section */}
            {loading ? <p>Loading...</p> : null}
            {artistReport && (
                <div className="report-section">
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Artist Name</th>
                                <th>Date Joined</th>
                                <th>Verified</th>
                                <th>Unique Listeners</th>
                                <th>Followers</th>
                                <th>Streams</th>
                                <th>Albums</th>
                                <th>Songs</th>
                                <th>Likes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {artistReport.map((artist) => (
                                <tr key={artist.artist_id}>
                                    <td>{artist.username}</td>
                                    <td>{artist.created_at}</td>
                                    <td>{artist.isVerified ? "✅" : "❌"}</td>
                                    <td>{artist.unique_listeners}</td>
                                    <td>{artist.total_followers}</td>
                                    <td>{artist.total_streams}</td>
                                    <td>{artist.total_albums}</td>
                                    <td>{artist.total_songs}</td>
                                    <td>{artist.total_likes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};

export const UserDataReport = () => {
    const [userReport, setUserReport] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // State for filter inputs
    const [filters, setFilters] = useState({
        date_from: "",
        date_to: ""
    });

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    // Fetch artist report with filters
    const fetchFilteredUserReport = async () => {
        setLoading(true);
        setError(null);
        setUserReport(null);

        try {
            const response = await fetch("https://cosc3380-coog-music-2.onrender.com/adminuserreport", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(filters),
            });

            const data = await response.json();
            if (data.success) {
                setUserReport(data.data); // Set filtered data
            } else {
                setError("No results found.");
            }
        } catch (err) {
            setError("Failed to fetch user report.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <section className="everything">
            <div className="profile-section">
                <div className="profile-header">
                    <h2 className="profile-username">Admin New User Report</h2>
                </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            {/* Artist Report Filter Section */}
            <div className="filter-section">
  <h3>Filter User Report</h3>
  <div className="filter-form">
    <div className="filter-input">
      <label htmlFor="date_from">Start Date</label>
      <input
        type="date"
        id="date_from"
        name="date_from"
        value={filters.date_from}
        onChange={handleInputChange}
      />
    </div>

    <div className="filter-input">
      <label htmlFor="date_to">End Date</label>
      <input
        type="date"
        id="date_to"
        name="date_to"
        value={filters.date_to}
        onChange={handleInputChange}
      />
    </div>

    <button onClick={fetchFilteredUserReport}>Apply Filters</button>
  </div>
</div>


            {/* Artist Report Output Section */}
            {loading ? <p>Loading...</p> : null}
            {userReport && (
                <div className="report-section">
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>User Name</th>
                                <th>Date Joined</th>
                                <th>Most Recent Playlist</th>
                                <th>Songs in Recent Playlist</th>
                                <th>Favorite Artist (By Streams)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userReport.map((user) => (
                                <tr key={user.user_id}>
                                    <td>{user.user_name}</td>
                                    <td>{user.created_at}</td>
                                    <td>{user.most_recent_playlist}</td>
                                    <td>{user.songs_in_recent_playlist}</td>
                                    <td>{user.favorite_artist}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};

export const SongDataReport = ({ userName }) => {
    const [songReport, setSongReport] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        username: userName,
        song_name: "",
        album_name: "",
        date_from: "",
        date_to: "",
        streams: "",
        likes: "",
        unique_listeners: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    const fetchFilteredSongReport = async () => {
        setLoading(true);
        setError(null);
        setSongReport(null);

        try {
            const response = await fetch("https://cosc3380-coog-music-2.onrender.com/artistreport", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(filters),
            });

            const data = await response.json();
            if (data.success) {
                setSongReport(data.data);
            } else {
                setError("No results found.");
            }
        } catch (err) {
            setError("Failed to fetch song report.");
        } finally {
            setLoading(false);
        }
    };

    // Automatically fetch report on component mount
    useEffect(() => {
        fetchFilteredSongReport();
    }, []); // Empty dependency array ensures it runs once when mounted

    return (
        <section className="everything">
            <div className="profile-section">
                <div className="profile-header">
                    <h2 className="profile-username">Artist Song Report</h2>
                </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="filter-section">
                <h3>Filter Song Report</h3>
                <div className="filter-form">
                    <input
                    type="text"
                    name="song_name"
                    placeholder="Song Name"
                    value={filters.song_name}
                    onChange={handleInputChange}
                    />
                    <input
                    type="text"
                    name="album_name"
                    placeholder="Album Name"
                    value={filters.album_name}
                    onChange={handleInputChange}
                    />

                    <div className="filter-input">
                    <label htmlFor="date_from">Start Date</label>
                    <input
                        type="date"
                        id="date_from"
                        name="date_from"
                        value={filters.date_from}
                        onChange={handleInputChange}
                    />
                    </div>

                    <div className="filter-input">
                    <label htmlFor="date_to">End Date</label>
                    <input
                        type="date"
                        id="date_to"
                        name="date_to"
                        value={filters.date_to}
                        onChange={handleInputChange}
                    />
                    </div>

                    <input
                    type="number"
                    name="streams"
                    placeholder="Min Streams"
                    value={filters.streams}
                    onChange={handleInputChange}
                    />
                    <input
                    type="number"
                    name="likes"
                    placeholder="Min Likes"
                    value={filters.likes}
                    onChange={handleInputChange}
                    />
                    <input
                    type="number"
                    name="unique_listeners"
                    placeholder="Min Unique Listeners"
                    value={filters.unique_listeners}
                    onChange={handleInputChange}
                    />

                    <button onClick={fetchFilteredSongReport}>Apply Filters</button>
                </div>
                </div>

            {loading ? <p>Loading...</p> : null}
            {songReport && (
                <div className="report-section">
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Song Name</th>
                                <th>Album Name</th>
                                <th>Date Created</th>
                                <th>Unique Listeners</th>
                                <th>Streams</th>
                                <th>Likes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {songReport.map((song) => (
                                <tr key={song.song_id}>
                                    <td>{song.song_name}</td>
                                    <td>{song.album_name}</td>
                                    <td>{song.created_at}</td>
                                    <td>{song.total_unique_listeners}</td>
                                    <td>{song.total_streams}</td>
                                    <td>{song.total_likes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};
