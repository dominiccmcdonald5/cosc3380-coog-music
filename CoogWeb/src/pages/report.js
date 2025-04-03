import React, {useState} from 'react';
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
        setFilters({ ...filters, [e.target.name]: e.target.value });
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
                    <input type="text" name="username" placeholder="Artist Name" value={filters.username} onChange={handleInputChange} />
                    <input type="date" name="date_from" placeholder="Start Date" value={filters.date_from} onChange={handleInputChange} />
                    <input type="date" name="date_to" placeholder="End Date" value={filters.date_to} onChange={handleInputChange} />
                    <input type="number" name="streams" placeholder="Min Streams" value={filters.streams} onChange={handleInputChange} />
                    <input type="number" name="songs" placeholder="Min Songs" value={filters.songs} onChange={handleInputChange} />
                    <input type="number" name="albums" placeholder="Min Albums" value={filters.albums} onChange={handleInputChange} />
                    <input type="number" name="likes" placeholder="Min Likes" value={filters.likes} onChange={handleInputChange} />
                    <input type="number" name="followers" placeholder="Min Followers" value={filters.followers} onChange={handleInputChange} />
                    <input type="number" name="unique" placeholder="Min Unique Listeners" value={filters.unique} onChange={handleInputChange} />
                    <select name="verified" value={filters.verified} onChange={handleInputChange}>
                        <option value="">Verified?</option>
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
