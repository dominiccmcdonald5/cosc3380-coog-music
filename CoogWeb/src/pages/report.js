import React, {useState, useEffect} from 'react';
import purple_image from './purple_image.png';
import './input.css';
import {SongForm, SongFormDelete, SongFormEdit} from './inputForms.js';
import {PlaylistViewPage} from './view.js';
import forward from './forward.png';

export const DataReport = () => {
    const [artistReport, setArtistReport] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        

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

       

        // Call the fetch functions
        fetchArtistReport();
    }, []);

    return (
        <section className="everything">
            <div className="profile-section">
            <div className="profile-header">
                <h2 className="profile-username">Coog Music Data Report</h2>
            </div>
            </div>

            {error && <p className="error-message">{error}</p>}


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
        </section>
    );
};