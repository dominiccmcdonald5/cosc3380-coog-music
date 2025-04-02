const { stringify } = require('qs');
const pool = require('./database.js');
const queries = require('./queries.js');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const getUsers = (req, res) => {
    pool.query(queries.getUsers, (error, results) => {
        if (error) {
            console.error("Error fetching users:", error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Internal server error" }));
            return;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
    });
};

const handleSignup = async (req, res) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { accountType, email, username, password, image } = parsedBody;

            if (!accountType || !email || !username || !password) {
                throw new Error('Missing required fields');
            }

            const validAccountTypes = ['user', 'artist'];
            if (!validAccountTypes.includes(accountType)) {
                throw new Error('Invalid account type');
            }

            const [result] = await pool.promise().query(
                `INSERT INTO ?? (email, username, password, image_url, created_at) VALUES (?, ?, ?, ?, NOW())`,
                [accountType, email, username, password, image]
            );
            
            
                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true, message: 'Signup Success' }));
                return;

        } catch (err) {
            console.error('Error during signup:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message || 'Signup Failed' }));
        }
    });
};

const handleLogin = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { username, password } = parsedBody;

            if (!username || !password) {
                throw new Error('Missing required fields');
            }

            // Check in 'user' table
            const [user_check] = await pool.promise().query(
                `SELECT user_id, username, image_url FROM user WHERE username = ? AND password = ?`, [username, password]
            );
            console.log('User Check:', user_check);

            if (user_check.length > 0) {
                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                    success: true,
                    userId: user_check[0].user_id,
                    userName: user_check[0].username,
                    userImage: user_check[0].image_url,
                    accountType: 'user',
                    message: "User Account"
                }));
                return;
            }

            // Check in 'artist' table
            const [artist_check] = await pool.promise().query(
                `SELECT artist_id, username, image_url FROM artist WHERE username = ? AND password = ?`, [username, password]
            );
            if (artist_check.length > 0) {
                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                    success: true,
                    userId: artist_check[0].artist_id,
                    userName: artist_check[0].username,
                    userImage: artist_check[0].image_url,
                    accountType: 'artist',
                    message: "Artist Account"
                }));
                return;
            }

            // Check in 'admin' table
            const [admin_check] = await pool.promise().query(
                `SELECT admin_id, username, image_url FROM admin WHERE username = ? AND password = ?`, [username, password]
            );
            if (admin_check.length > 0) {
                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                    success: true,
                    userId: admin_check[0].admin_id,
                    userName: admin_check[0].username,
                    userImage: admin_check[0].image_url,
                    accountType: 'admin',
                    message: "Admin Account"
                }));
                return;
            }

            // If the user is not found in any of the tables
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
                success: false,
                message: "Account not found"
            }));
        }
        catch (err) {
            console.error('Error during login:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message || 'Login Failed' }));
        }
    });
};

const getArtistList = async (req, res) => {
    try {
        const [artists] = await pool.promise().query(`SELECT artist_id, username, image_url FROM artist`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, artists}));  // Ensure response is sent
    } catch (err) {
        console.error('Error fetching artists:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Failed to fetch artists' }));
    }
};

const getAlbumList = async (req, res) => {
    try {
        const [albums] = await pool.promise().query(`SELECT album_id, album.name AS album_name, album.image_url AS album_image, artist.username AS artist_username FROM artist, album WHERE album.artist_id = artist.artist_id`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, albums}));  // Ensure response is sent
    } catch (err) {
        console.error('Error fetching artists:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Failed to fetch albums' }));
    }
};

const getUserList = async (req, res) => {
    try {
        const [users] = await pool.promise().query(`SELECT user_id, username, image_url FROM user`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, users}));  // Ensure response is sent
    } catch (err) {
        console.error('Error fetching users:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Failed to fetch users' }));
    }
}

const getSongList = async (req, res) => {
    try {
        const [songs] = await pool.promise().query(`SELECT song_id, name, song.image_url AS image, artist.username AS artist_username FROM artist, song WHERE song.artist_id = artist.artist_id`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, songs}));  // Ensure response is sent
    } catch (err) {
        console.error('Error fetching artists:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Failed to fetch songs' }));
    }
};

const getArtistViewInfo = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {

    try {
        const parsedBody = JSON.parse(body);
        const { username} = parsedBody;
        if (!username) {
            return res.status(400).json({ success: false, message: 'Username is required' });
        }


        const [followersResult] = await pool.promise().query(`
            SELECT COUNT(*) AS follow FROM artist, following WHERE following.artist_id = artist.artist_id AND artist.username = ?;`, [username]);

        const [streamsResult] = await pool.promise().query(`SELECT COUNT(*) AS streams_count 
            FROM history, song, artist 
            WHERE history.song_id = song.song_id AND song.artist_id = artist.artist_id AND artist.username = ?;`, [username]);

        const [likedSongsResult] = await pool.promise().query(`SELECT COUNT(*) AS liked_songs_count 
            FROM liked_song, song, artist 
            WHERE song.song_id = liked_song.song_id AND song.artist_id = artist.artist_id AND artist.username = ?;`, [username]);

        const [likedAlbumsResult] = await pool.promise().query(`SELECT COUNT(*) AS liked_albums_count 
            FROM liked_album, album, artist 
            WHERE album.album_id = liked_album.album_id AND album.artist_id = artist.artist_id AND artist.username = ?;`, [username]);

            
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, 
            follow: followersResult[0].follow, 
            streams: streamsResult[0].streams_count, 
            likedSongs: likedSongsResult[0].liked_songs_count, 
            likedAlbums: likedAlbumsResult[0].liked_albums_count 
        }));
    }catch (err) {
        console.error('Error fetching artists:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Failed to fetch Artist Info' }));
    }
    });
};

const getArtistViewAlbum = async (req, res) => {
    let body = "";
    
    // Listen for incoming data
    req.on('data', chunk => {
        body += chunk.toString(); // Append received chunks
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { username } = parsedBody;

            if (!username) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Username is required' }));
            }

            const [albums] = await pool.promise().query(`
                SELECT album_id, album.name AS album_name, album.image_url AS album_image, artist.username AS artist_username 
                FROM artist, album 
                WHERE album.artist_id = artist.artist_id AND artist.username = ?;`, [username]);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, albums }));
        } catch (err) {
            console.error('Error fetching albums:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to fetch albums' }));
        }
    });
};

const getArtistViewSong = async (req, res) => {
    let body = "";
    
    // Listen for incoming data
    req.on('data', chunk => {
        body += chunk.toString(); // Append received chunks
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { username } = parsedBody;

            if (!username) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Username is required' }));
            }

            const [songs] = await pool.promise().query(`
                SELECT song_id, song.name AS song_name, song.image_url AS song_image, album.name AS album_name 
                FROM artist, song, album 
                WHERE song.artist_id = artist.artist_id AND album.album_id = song.song_id AND artist.username = ?;`, [username]);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, songs }));
        } catch (err) {
            console.error('Error fetching albums:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to fetch albums' }));
        }
    });
};

const getAlbumViewSong = async (req, res) => {
    let body = "";
    
    // Listen for incoming data
    req.on('data', chunk => {
        body += chunk.toString(); // Append received chunks
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { album_name } = parsedBody;

            if (!album_name) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Username is required' }));
            }

            const [songList] = await pool.promise().query(`
                SELECT song_id, song.name AS song_name, song.image_url AS song_image, album.name AS album_name 
                FROM song, album 
                WHERE album.album_id = song.song_id AND album.name = ?;`, [album_name]);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, songList }));
        } catch (err) {
            console.error('Error fetching songs:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to fetch songs' }));
        }
    });
};

const getAlbumViewInfo = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {

    try {
        const parsedBody = JSON.parse(body);
        const { album_name} = parsedBody;
        if (!album_name) {
            return res.status(400).json({ success: false, message: 'Username is required' });
        }


        const [songsResult] = await pool.promise().query(`
            SELECT count(*) AS songCount FROM album, song WHERE album.album_id = song.album_id AND album.name = ?;`, [album_name]);

        const [streamsResult] = await pool.promise().query(`SELECT COUNT(*) AS streams_count 
            FROM history, song, album 
            WHERE history.song_id = song.song_id AND song.album_id = album.album_id AND album.name = ?;`, [album_name]);

        const [likedAlbumsResult] = await pool.promise().query(`SELECT likes FROM album WHERE album.name = ?;`, [album_name]);

        const songCount = songsResult.length > 0 ? songsResult[0].songCount : 0;
        const streams = streamsResult.length > 0 ? streamsResult[0].streams_count : 0;
        const likes = likedAlbumsResult.length > 0 ? likedAlbumsResult[0].likes : 0;
            
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, 
            songCount,
            streams,
            likes
        }));
    }catch (err) {
        console.error('Error fetching songs:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Failed to fetch songs' }));
    }
    });
};

const getTopSongs = async (req, res) => {
    try {
        const [songs] = await pool.promise().query(`SELECT 
        ROW_NUMBER() OVER (ORDER BY song.play_count DESC) AS ranks,
        song.song_id,
        song.name,
        song.image_url,
        artist.artist_id AS artist_name,
        play_count
        FROM song
        JOIN artist ON song.artist_id = artist.artist_id
        ORDER BY play_count DESC
        LIMIT 10;`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, songs}));  // Ensure response is sent
    } catch (err) {
        console.error('Error fetching artists:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Failed to fetch songs' }));
    }
};

const getTopArtists = async (req, res) => {
    try {
        const [topArtists] = await pool.promise().query(`SELECT 
        ROW_NUMBER() OVER (ORDER BY SUM(song.play_count) DESC) AS ranks,
        artist.artist_id,
        artist.username,
        artist.image_url,
        SUM(song.play_count) AS total_streams
        FROM artist
        JOIN song ON artist.artist_id = song.artist_id
        GROUP BY artist.artist_id, artist.username
        ORDER BY total_streams DESC
        LIMIT 3;`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, topArtists}));  // Ensure response is sent
    } catch (err) {
        console.error('Error fetching artists:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Failed to fetch artists' }));
    }
};

const getTopAlbums = async (req, res) => {
    try {
        const [topAlbums] = await pool.promise().query(`SELECT 
        ROW_NUMBER() OVER (ORDER BY SUM(song.play_count) DESC) AS ranks,
        album.album_id,
        album.name,
        album.image_url,
        artist.username AS artist_name,
        SUM(song.play_count) AS total_streams
        FROM album
        JOIN song ON album.album_id = song.album_id
        JOIN artist ON album.artist_id = artist.artist_id
        GROUP BY album.album_id, album.name, album.image_url
        ORDER BY total_streams DESC
        LIMIT 3;`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, topAlbums}));  // Ensure response is sent
    } catch (err) {
        console.error('Error fetching artists:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Failed to fetch albums' }));
    }
};

const getTopGenres = async (req, res) => {
    try {
        const [topGenres] = await pool.promise().query(`SELECT 
        genre AS genre_name,
        SUM(play_count) AS total_streams
        FROM song
        GROUP BY genre
        ORDER BY total_streams DESC
        LIMIT 3;`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, topGenres}));  // Ensure response is sent
    } catch (err) {
        console.error('Error fetching artists:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Failed to fetch albums' }));
    }
};

const getTopOther = async (req, res) => {
    try {
        const [streamCount] = await pool.promise().query(`SELECT COUNT(*) FROM history;`);
        const [userCount] = await pool.promise().query(`SELECT COUNT(*) FROM user;`);
        const [artistCount] = await pool.promise().query(`SELECT COUNT(*) FROM artist;`);
        const [albumCount] = await pool.promise().query(`SELECT COUNT(*) FROM album;`);
        const [genreCount] = await pool.promise().query(`SELECT COUNT(DISTINCT genre) FROM song;`);
        const [playlistCount] = await pool.promise().query(`SELECT COUNT(*) FROM playlist;`);
        const [likeCount] = await pool.promise().query(`SELECT 
        (SELECT SUM(likes) FROM album) + 
        (SELECT SUM(likes) FROM song) AS counter;`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, topOthers:{
            streamCount: streamCount[0]['COUNT(*)'],  // Access the count
            userCount: userCount[0]['COUNT(*)'],
            artistCount: artistCount[0]['COUNT(*)'],
            albumCount: albumCount[0]['COUNT(*)'],
            genreCount: genreCount[0]['COUNT(DISTINCT genre)'],
            playlistCount: playlistCount[0]['COUNT(*)'],
            likeCount: likeCount[0].counter}
        }));  // Ensure response is sent
    } catch (err) {
        console.error('Error fetching artists:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Failed to fetch albums' }));
    }
};

const getArtistInfo = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {

    try {
        const parsedBody = JSON.parse(body);
        const { userName} = parsedBody;
        if (!userName) {
            return res.status(400).json({ success: false, message: 'Username is required' });
        }
        const [followersResult] = await pool.promise().query(`
            SELECT COUNT(*) AS follow FROM following, artist WHERE artist.artist_id = following.artist_id AND artist.username = ?;`, [userName]);

        const [streamsResult] = await pool.promise().query(`SELECT COUNT(*) AS streams_count 
            FROM history, song, artist 
            WHERE history.song_id = song.song_id AND song.artist_id = artist.artist_id AND artist.username = ?;`, [userName]);

        const [likedSongsResult] = await pool.promise().query(`SELECT COUNT(*) AS liked_songs_count 
            FROM liked_song, song, artist 
            WHERE song.song_id = liked_song.song_id AND song.artist_id = artist.artist_id AND artist.username = ?;`, [userName]);

        const [likedAlbumsResult] = await pool.promise().query(`SELECT COUNT(*) AS liked_albums_count 
            FROM liked_album, album, artist 
            WHERE album.album_id = liked_album.album_id AND album.artist_id = artist.artist_id AND artist.username = ?;`, [userName]);

            
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, 
            follow: followersResult[0].follow, 
            streams: streamsResult[0].streams_count, 
            likedSongs: likedSongsResult[0].liked_songs_count, 
            likedAlbums: likedAlbumsResult[0].liked_albums_count 
        }));
    }catch (err) {
        console.error('Error fetching artists:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Failed to fetch Artist Info' }));
    }
    });
};

const getArtistProfileAlbum = async (req, res) => {
    let body = "";
    
    // Listen for incoming data
    req.on('data', chunk => {
        body += chunk.toString(); // Append received chunks
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { userName } = parsedBody;

            if (!userName) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Username is required' }));
            }

            const [albums] = await pool.promise().query(`
                SELECT album_id, album.name AS album_name, album.image_url AS album_image, artist.username AS artist_username 
                FROM artist, album 
                WHERE album.artist_id = artist.artist_id AND artist.username = ?;`, [userName]);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, albums }));
        } catch (err) {
            console.error('Error fetching albums:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to fetch albums' }));
        }
    });
};

const createSong = async (req, res) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { name, artist, genre, album, image, URL } = parsedBody;
            console.log(name,image,URL);

            // Validate required fields
            if (!name || !artist || !genre || !album || !image || !URL) {
                throw new Error('Missing required fields');
            }

            image = image || null;  // Use null if empty
            URL = URL || null;

            // Check if the album exists and belongs to the artist
            const [albumExists] = await pool.promise().execute(
                "SELECT album_id, artist_id FROM album WHERE name = ?",
                [album]
            );

            if (albumExists.length === 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Album does not exist' }));
            }

            const album_id = albumExists[0].album_id;
            const album_artist_id = albumExists[0].artist_id;


            // Ensure the artist adding the song is the album's owner
            if (album_artist_id !== Number(artist)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'album does not exist' }));
            }

            // Insert the song
            await pool.promise().query(
                `INSERT INTO song (name, artist_id, album_id, genre, image_url, play_count, likes,length, song_url, created_at)
                 VALUES (?, ?, ?, ?, ?, 0, 0,0, ?, NOW())`,
                [name, artist, album_id, genre, image, URL]
            );

            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: 'Song added successfully' }));
        } catch (err) {
            console.error('Error adding song:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message || 'Failed to add song' }));
        }
    });
};

const editSong = async (req, res) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            let { prevName, name, artist, genre, image } = parsedBody;

            // Validate if at least one field is provided
            if (!name && !artist && !genre && !image) {
                throw new Error('Missing required fields to update');
            }

            // Check if the song exists with the previous name
            const [songExists] = await pool.promise().execute(
                "SELECT song_id FROM song WHERE name = ?",
                [prevName]
            );

            if (songExists.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Song not found' }));
            }

            // Check for duplicates with the new name (within the same artist)
            if (name) {
                const [duplicateSong] = await pool.promise().execute(
                    "SELECT song_id FROM song WHERE name = ? AND artist_id = (SELECT artist_id FROM song WHERE name = ?)",
                    [name, prevName]
                );

                if (duplicateSong.length > 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, message: 'Duplicate song name for this artist' }));
                }
            }

            // Handle undefined fields: if a field is undefined, convert to null
            name = name || null;
            artist = artist || null;
            genre = genre || null;
            image = image || null;

            // Update the song with new data (only the fields that are provided)
            await pool.promise().query(
                `UPDATE song 
                SET 
                    name = COALESCE(?, name),
                    artist_id = COALESCE(?, artist_id),
                    genre = COALESCE(?, genre),
                    image_url = COALESCE(?, image_url)
                WHERE name = ?`,
                [name, artist, genre, image, prevName]
            );

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: 'Song edited successfully' }));
        } catch (err) {
            console.error('Error editing song:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message || 'Failed to edit song' }));
        }
    });
};

const deleteSong = async (req, res) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { name, artist } = parsedBody;

            // Validate required fields
            if (!name || !artist) {
                throw new Error('Missing required fields to delete');
            }

            // Check if the song exists for the given artist
            const [songExists] = await pool.promise().execute(
                "SELECT song_id FROM song WHERE name = ? AND artist_id = ?",
                [name, artist]
            );

            if (songExists.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Song not found' }));
            }

            // Delete the song
            await pool.promise().execute(
                "DELETE FROM song WHERE song_id = ?",
                [songExists[0].song_id]
            );

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: 'Song deleted successfully' }));
        } catch (err) {
            console.error('Error deleting song:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message || 'Failed to delete song' }));
        }
    });
};

const createAlbum = async (req, res) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { name, artist, genre, image} = parsedBody;

            // Validate required fields
            if (!name || !artist || !genre ||!image) {
                throw new Error('Missing required fields');
            }

            // Check if the album exists and belongs to the artist
            const [albumExists] = await pool.promise().execute(
                "SELECT album_id, artist_id FROM album WHERE name = ?",
                [name]
            );

            if (albumExists.length !== 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Album already exist' }));
            }

            // Insert the song
            await pool.promise().query(
                `INSERT INTO album (name, artist_id, genre, image_url,likes,created_at)
                 VALUES (?, ?, ?, ?, 0, NOW())`,
                [name, artist, genre, image]
            );

            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: 'Album added successfully' }));
        } catch (err) {
            console.error('Error adding song:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message || 'Failed to add album' }));
        }
    });
};

const editAlbum = async (req, res) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            let { prevName, name, artist, genre, image } = parsedBody;

            // Validate if at least one field is provided
            if (!name && !artist && !genre && !image) {
                throw new Error('Missing required fields to update');
            }

            // Check if the song exists with the previous name
            const [albumExists] = await pool.promise().execute(
                "SELECT album_id FROM album WHERE name = ?",
                [prevName]
            );

            if (albumExists.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Album not found' }));
            }

            // Check for duplicates with the new name (within the same artist)
            if (name) {
                const [duplicateAlbum] = await pool.promise().execute(
                    "SELECT album_id FROM album WHERE name = ? AND artist_id = (SELECT artist_id FROM album WHERE name = ?)",
                    [name, prevName]
                );

                if (duplicateAlbum.length > 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, message: 'Duplicate album name for this artist' }));
                }
            }

            // Handle undefined fields: if a field is undefined, convert to null
            name = name || null;
            artist = artist || null;
            genre = genre || null;
            image = image || null;

            // Update the song with new data (only the fields that are provided)
            await pool.promise().query(
                `UPDATE album 
                SET 
                    name = COALESCE(?, name),
                    artist_id = COALESCE(?, artist_id),
                    genre = COALESCE(?, genre),
                    image_url = COALESCE(?, image_url)
                WHERE name = ?`,
                [name, artist, genre, image, prevName]
            );

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: 'Album edited successfully' }));
        } catch (err) {
            console.error('Error editing song:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message || 'Failed to edit album' }));
        }
    });
};

const deleteAlbum = async (req, res) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { name, artist } = parsedBody;

            // Validate required fields
            if (!name || !artist) {
                throw new Error('Missing required fields to delete');
            }

            // Check if the song exists for the given artist
            const [albumExists] = await pool.promise().execute(
                "SELECT album_id FROM album WHERE name = ? AND artist_id = ?",
                [name, artist]
            );

            if (albumExists.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Album not found' }));
            }

            // Delete the song
            await pool.promise().execute(
                "DELETE FROM album WHERE album_id = ?",
                [albumExists[0].album_id]
            );

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: 'Album deleted successfully' }));
        } catch (err) {
            console.error('Error deleting song:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message || 'Failed to delete album' }));
        }
    });
};

const addAlbumSong = async (req, res) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            console.log('Parsed Body:', parsedBody);
            const { name, artist, song_name } = parsedBody;

            // Validate required fields
            if (!name || !artist || !song_name) {
                throw new Error('Missing required fields');
            }

            // Check if the album exists and belongs to the artist
            const [albumExists] = await pool.promise().execute(
                "SELECT album_id FROM album WHERE name = ? AND artist_id = ?",
                [name, artist]
            );

            if (albumExists.length === 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Album does not exist or does not belong to the artist' }));
            }

            const albumId = albumExists[0].album_id;

            // Check if the song exists
            const [songExists] = await pool.promise().execute(
                "SELECT song_id, album_id FROM song WHERE name = ? AND artist_id = ?",
                [song_name, artist]
            );

            if (songExists.length === 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Song does not exist' }));
            }

            const songId = songExists[0].song_id;
            const currentAlbumId = songExists[0].album_id;

            // Prevent reassigning if the song is already in the album
            if (currentAlbumId === albumId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Song is already in this album' }));
            }

            // Assign the song to the album
            await pool.promise().execute(
                `UPDATE song
                SET album_id = ?
                WHERE song_id = ?`,
                [albumId, songId]
            );

            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: 'Song added to album successfully' }));
        } catch (err) {
            console.error('Error adding song:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message || 'Failed to add song' }));
        }
    });
};

const removeAlbumSong = async (req, res) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            console.log('Parsed Body:', parsedBody);
            const { name, artist, song_name } = parsedBody;

            // Validate required fields
            if (!name || !artist || !song_name) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Missing required fields' }));
            }

            // Check if the album exists and belongs to the artist
            const [albumExists] = await pool.promise().execute(
                "SELECT album_id FROM album WHERE name = ? AND artist_id = ?",
                [name, artist]
            );

            if (albumExists.length === 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Album does not exist or does not belong to the artist' }));
            }

            const albumId = albumExists[0].album_id;

            // Check if the song exists
            const [songExists] = await pool.promise().execute(
                "SELECT song_id, album_id FROM song WHERE name = ? AND artist_id = ?",
                [song_name, artist]
            );

            if (songExists.length === 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Song does not exist' }));
            }

            const songId = songExists[0].song_id;
            const currentAlbumId = songExists[0].album_id;

            // Prevent reassigning if the song is already in the album
            if (currentAlbumId !== albumId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Song is not in this album' }));
            }

            // Assign the song to the album
            await pool.promise().execute(
                `UPDATE song
                SET album_id = NULL
                WHERE song_id = ?`,
                [songId]
            );

            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: 'Song removed from album successfully' }));
        } catch (err) {
            console.error('Error removing song:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message || 'Failed to remove song' }));
        }
    });
};

const getArtistProfileSong = async (req, res) => {
    let body = "";
    
    // Listen for incoming data
    req.on('data', chunk => {
        body += chunk.toString(); // Append received chunks
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { userName } = parsedBody;

            if (!userName) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Username is required' }));
            }

            const [songs] = await pool.promise().query(`
                SELECT song_id, song.name AS song_name, song.image_url AS song_image, artist.username AS artist_name 
                FROM artist
                JOIN song ON song.artist_id = artist.artist_id
                WHERE artist.username = ?;`, [userName]);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, songs }));
        } catch (err) {
            console.error('Error fetching albums:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to fetch songs' }));
        }
    });
};

const getPlaylistViewInfo = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { username, playlist_name } = parsedBody;

            if (!username) {
                return res.writeHead(400, { 'Content-Type': 'application/json' })
                .end(JSON.stringify({ success: false, message: 'Name is required' }));
            }

            const [songCount] = await pool.promise().query(`
                SELECT COUNT(*) AS song_count 
                FROM song_in_playlist 
                JOIN playlist ON song_in_playlist.playlist_id = playlist.playlist_id
                JOIN user ON playlist.user_id = user.user_id
                WHERE user.username = ? AND playlist.name = ?;
            `, [username, playlist_name]);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                songCount: songCount[0].song_count,
            }));
        } catch (err) {
            console.error('Error fetching playlist info:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to fetch Playlist Info' }));
        }
    });
};

const getProfilePlaylist = async (req, res) => {
    let body = "";
    
    // Listen for incoming data
    req.on('data', chunk => {
        body += chunk.toString(); // Append received chunks
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { userName } = parsedBody;

            if (!userName) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Username is required' }));
            }

            const [playlists] = await pool.promise().query(`
                SELECT playlist_id, playlist.name AS playlist_name, playlist.image_url AS playlist_image, user.username AS user_username 
                FROM playlist, user 
                WHERE playlist.user_id = user.user_id AND user.username = ?;`, [userName]);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, playlists }));
        } catch (err) {
            console.error('Error fetching albums:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to fetch albums' }));
        }
    });
};

const getPlaylistViewSong = async (req, res) => {
    let body = "";

    // Listen for incoming data
    req.on('data', chunk => {
        body += chunk.toString(); // Append received chunks
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { playlist_name } = parsedBody;

            if (!playlist_name) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Playlist name is required' }));
            }

            // SQL query with explicit JOINs
            const [songList] = await pool.promise().query(`
                SELECT song.song_id, song.name AS song_name, song.image_url AS song_image, artist.username AS artist_name 
                FROM song
                JOIN song_in_playlist ON song_in_playlist.song_id = song.song_id
                JOIN playlist ON song_in_playlist.playlist_id = playlist.playlist_id
                JOIN artist ON song.artist_id = artist.artist_id
                WHERE playlist.name = ?;`, [playlist_name]);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, songList }));
        } catch (err) {
            console.error('Error fetching songs:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to fetch songs' }));
        }
    });
};

const getProfileInfo = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { userName } = parsedBody;

            if (!userName) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Username is required' }));
            }

            // Get the user_id from the userName
            const [userResult] = await pool.promise().query(`
                SELECT user_id FROM user WHERE username = ?;
            `, [userName]);

            if (!userResult.length) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'User not found' }));
            }

            const userId = userResult[0].user_id;

            // Get the number of followers
            const [followingResult] = await pool.promise().query(`
                SELECT COUNT(*) AS followers_count FROM following WHERE user_id = ?;
            `, [userId]);

            // Get the number of friends
            const [friendResult] = await pool.promise().query(`
                SELECT COUNT(*) AS friend_count FROM friend WHERE (user_id_1 = ? OR user_id_2 = ?);
            `, [userId, userId]);

            // Get the number of streams
            const [streamsResult] = await pool.promise().query(`
                SELECT COUNT(*) AS streams_count 
                FROM history 
                WHERE history.user_id = ?;
            `, [userId]);

            // Get the number of liked songs
            const [likedSongsResult] = await pool.promise().query(`
                SELECT COUNT(*) AS liked_songs_count 
                FROM liked_song, song 
                WHERE song.song_id = liked_song.song_id AND user_id = ?;
            `, [userId]);

            // Get the number of liked albums
            const [likedAlbumsResult] = await pool.promise().query(`
                SELECT COUNT(*) AS liked_albums_count 
                FROM liked_album, album 
                WHERE album.album_id = liked_album.album_id AND user_id = ?;
            `, [userId]);

            // Send the response
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                followers: followingResult[0].followers_count,
                friends: friendResult[0].friend_count,
                streams: streamsResult[0].streams_count,
                likedSongs: likedSongsResult[0].liked_songs_count,
                likedAlbums: likedAlbumsResult[0].liked_albums_count
            }));

        } catch (err) {
            console.error('Error fetching user profile info:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to fetch profile info' }));
        }
    });
};

const getPlaylistSongs = async (req, res) => {
    let body = "";
    
    // Listen for incoming data
    req.on('data', chunk => {
        body += chunk.toString(); // Append received chunks
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { playlist_name } = parsedBody;

            if (!playlist_name) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Playlist name is required' }));
            }

            // Correct the query to use playlist_name and fix the join condition
            const [songs] = await pool.promise().query(`
                SELECT 
                    song.song_id, 
                    song.name AS song_name, 
                    song.image_url AS song_image, 
                    artist.username AS artist_name 
                FROM 
                    artist 
                JOIN song ON song.artist_id = artist.artist_id
                JOIN song_in_playlist ON song_in_playlist.song_id = song.song_id
                JOIN playlist ON playlist.playlist_id = song_in_playlist.playlist_id
                WHERE playlist.name = ?`, [playlist_name]);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, songs }));
        } catch (err) {
            console.error('Error fetching songs:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to fetch songs' }));
        }
    });
};

const createPlaylist = async (req, res) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { name, user, image} = parsedBody;

            // Validate required fields
            if (!name || !user ||!image) {
                throw new Error('Missing required fields');
            }

            // Check if the album exists and belongs to the artist
            const [playlistExists] = await pool.promise().execute(
                "SELECT playlist_id, user_id FROM playlist WHERE name = ? AND user_id = ?",
                [name, user]
            );

            if (playlistExists.length !== 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Playlist already exist' }));
            }

            // Insert the song
            await pool.promise().query(
                `INSERT INTO playlist (name, user_id, image_url,created_at)
                 VALUES (?, ?, ?, NOW())`,
                [name, user, image]
            );

            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: 'Playlist added successfully' }));
        } catch (err) {
            console.error('Error adding song:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message || 'Failed to add playlist' }));
        }
    });
};

const editPlaylist = async (req, res) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            let { prevName, name, user, image } = parsedBody;

            // Validate if at least one field is provided
            if (!name && !user && !prevName && !image) {
                throw new Error('Missing required fields to update');
            }

            // Check if the song exists with the previous name
            const [playlistExists] = await pool.promise().execute(
                "SELECT playlist_id FROM playlist WHERE name = ? AND user_id = ?",
                [prevName, user]
            );

            if (playlistExists.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Playlist not found' }));
            }

            // Check for duplicates with the new name (within the same artist)
            if (name) {
                const [duplicatePlaylist] = await pool.promise().execute(
                    "SELECT playlist_id FROM playlist WHERE name = ? AND user_id = (SELECT user_id FROM playlist WHERE name = ?)",
                    [name, prevName]
                );

                if (duplicatePlaylist.length > 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, message: 'Duplicate playlist name for this user' }));
                }
            }

            // Handle undefined fields: if a field is undefined, convert to null
            name = name || null;
            user = user || null;
            image = image || null;

            // Update the song with new data (only the fields that are provided)
            await pool.promise().query(
                `UPDATE playlist 
                SET 
                    name = COALESCE(?, name),
                    user_id = COALESCE(?, user_id),
                    image_url = COALESCE(?, image_url)
                WHERE name = ?`,
                [name, user, image, prevName]
            );

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: 'Playlist edited successfully' }));
        } catch (err) {
            console.error('Error editing song:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message || 'Failed to edit playlist' }));
        }
    });
};

const deletePlaylist = async (req, res) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { name, user } = parsedBody;

            // Validate required fields
            if (!name || !user) {
                throw new Error('Missing required fields to delete');
            }

            // Check if the song exists for the given artist
            const [playlistExists] = await pool.promise().execute(
                "SELECT playlist_id FROM playlist WHERE name = ? AND user_id = ?",
                [name, user]
            );

            if (playlistExists.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Playlist not found' }));
            }

            // Delete the song
            await pool.promise().execute(
                "DELETE FROM playlist WHERE playlist_id = ? AND user_id = ?",
                [playlistExists[0].playlist_id,user]
            );

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: 'Playlist deleted successfully' }));
        } catch (err) {
            console.error('Error deleting song:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message || 'Failed to delete playlist' }));
        }
    });
};

const addPlaylistSong = async (req, res) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            console.log('Parsed Body:', parsedBody);
            const { name, user, song_name } = parsedBody;

            // Validate required fields
            if (!name || !user || !song_name) {
                throw new Error('Missing required fields');
            }

            // Check if the album exists and belongs to the artist
            const [playlistExists] = await pool.promise().execute(
                "SELECT playlist_id FROM playlist WHERE name = ? AND user_id = ?",
                [name, user]
            );

            if (playlistExists.length === 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Playlist does not exist or does not belong to the user' }));
            }

            const playlistId = playlistExists[0].playlist_id;

            // Check if the song exists
            const [songExists] = await pool.promise().execute(
                "SELECT song_id FROM song WHERE name = ?",
                [song_name]
            );

            if (songExists.length === 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Song does not exist' }));
            }

            const songId = songExists[0].song_id;


            // Assign the song to the album
            await pool.promise().execute(
                `INSERT song_in_playlist (song_id,playlist_id,added_at) VALUES (?,?,NOW())`,
                [songId,playlistId]
            );

            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: 'Song added to album successfully' }));
        } catch (err) {
            console.error('Error adding song:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message || 'Failed to add song' }));
        }
    });
};

const removePlaylistSong = async (req, res) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            console.log('Parsed Body:', parsedBody);
            const { name, user, song_name } = parsedBody;

            // Validate required fields
            if (!name || !user || !song_name) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Missing required fields' }));
            }

            // Check if the playlist exists and belongs to the user
            const [playlistExists] = await pool.promise().execute(
                "SELECT playlist_id FROM playlist WHERE name = ? AND user_id = ?",
                [name, user]
            );

            if (playlistExists.length === 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Playlist does not exist or does not belong to the user' }));
            }

            const playlistId = playlistExists[0].playlist_id;

            // Check if the song exists
            const [songExists] = await pool.promise().execute(
                "SELECT song_id FROM song WHERE name = ?",
                [song_name]
            );

            if (songExists.length === 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Song does not exist' }));
            }

            const songId = songExists[0].song_id;

            // Check if the song is in the playlist
            const [isInTable] = await pool.promise().execute(
                `SELECT song_id FROM song_in_playlist WHERE playlist_id = ? AND song_id = ?`,
                [playlistId, songId]
            );

            if (isInTable.length === 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Song is not in the playlist' }));
            }

            // Delete the song from the playlist
            const [result] = await pool.promise().execute(
                `DELETE FROM song_in_playlist WHERE song_id = ? AND playlist_id = ?`,
                [songId, playlistId]
            );

            // Check if any rows were deleted
            if (result.affectedRows === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Song not found or already removed from playlist' }));
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, message: 'Song removed from playlist successfully' }));
        } catch (err) {
            console.error('Error removing song:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message || 'Failed to remove song' }));
        }
    });
};

const editInfo = async (req, res) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { accountType, username, newPassword, image } = parsedBody;
            console.log(accountType, username, newPassword, image); 
            let isWorking = false;

            if (!accountType || !username || (!image && !newPassword)) {
                console.log(accountType, username, newPassword, image);
                throw new Error('Missing required fields');
            }

            const validAccountTypes = ['user', 'artist', 'admin'];
            if (!validAccountTypes.includes(accountType)) {
                throw new Error('Invalid account type');
            }

            let result;
            if (accountType === 'user') {
                const [user_check] = await pool.promise().query(
                    `SELECT user_id, username, image_url FROM user WHERE username = ?`, [username]
                );
                if (user_check.length > 0) {
                    result = await pool.promise().query(
                        `UPDATE user
                        SET password = COALESCE(?, password),
                            image_url = COALESCE(?, image_url)
                        WHERE username = ?`, [newPassword, image, username]
                    );
                    isWorking = true;
                }
            } else if (accountType === 'artist') {
                const [artist_check] = await pool.promise().query(
                    `SELECT artist_id, username, image_url FROM artist WHERE username = ?`, [username]
                );
                if (artist_check.length > 0) {
                    result = await pool.promise().query(
                        `UPDATE artist
                        SET password = COALESCE(?, password),
                            image_url = COALESCE(?, image_url)
                        WHERE username = ?`, [username]
                    );
                    isWorking = true;
                }
            } else if (accountType === 'admin') {
                const [admin_check] = await pool.promise().query(
                    `SELECT admin_id, username, image_url FROM admin WHERE username = ?`, [username]
                );
                if (admin_check.length > 0) {
                    result = await pool.promise().query(
                        `UPDATE admin
                        SET password = COALESCE(?, password),
                            image_url = COALESCE(?, image_url)
                        WHERE username = ?`, [username]
                    );
                    isWorking = true;
                }
            }

            if (isWorking) {
                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true }));
            } else {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: false, message: "No changes were made." }));
            }

        } catch (err) {
            console.error('Error during editInfo:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message || 'Edit Failed' }));
        }
    });
};

const deleteAccount = async (req, res) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { accountType, username } = parsedBody;
            console.log(accountType, username); 
            let isWorking = false;

            if (!accountType || !username) {
                console.log(accountType, username);
                throw new Error('Missing required fields');
            }

            const validAccountTypes = ['user', 'artist', 'admin'];
            if (!validAccountTypes.includes(accountType)) {
                throw new Error('Invalid account type');
            }

            let result;
            if (accountType === 'user') {
                const [user_check] = await pool.promise().query(
                    `SELECT user_id, username FROM user WHERE username = ?`, [username]
                );
                if (user_check.length > 0) {
                    result = await pool.promise().query(
                        `DELETE FROM user WHERE username = ?`, [username]
                    );
                    isWorking = true;
                }
            } else if (accountType === 'artist') {
                const [artist_check] = await pool.promise().query(
                    `SELECT artist_id, username FROM artist WHERE username = ?`, [username]
                );
                if (artist_check.length > 0) {
                    result = await pool.promise().query(
                        `DELETE FROM artist WHERE username = ?`, [newPassword, image, username]
                    );
                    isWorking = true;
                }
            } else if (accountType === 'admin') {
                const [admin_check] = await pool.promise().query(
                    `SELECT admin_id, username FROM admin WHERE username = ?`, [username]
                );
                if (admin_check.length > 0) {
                    result = await pool.promise().query(
                        `DELETE FROM admin
                        WHERE username = ?`, [username]
                    );
                    isWorking = true;
                }
            }

            if (isWorking) {
                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: true, message: "Account Deleted"}));
            } else {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: false, message: "Failed to Delete Account." }));
            }

        } catch (err) {
            console.error('Error during editInfo:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message || 'Failed to delete account' }));
        }
    });
};

const getSongReport = async (req, res) => {
    try {
        const [songs] = await pool.promise().query(`SELECT 
    s.song_id, 
    s.name AS song_name,
    -- Unique listeners for each song
    COUNT(DISTINCT h.user_id) AS unique_listeners,
    -- Like count for each song
    COUNT(DISTINCT ls.user_id) AS like_count,
    -- Users who did not like the song (unique listeners - like count)
    COUNT(DISTINCT h.user_id) - COUNT(DISTINCT ls.user_id) AS users_who_did_not_like,
    -- Like percentage (rounded to 2 decimal places)
    ROUND((COUNT(DISTINCT ls.user_id) / NULLIF(COUNT(DISTINCT h.user_id), 0)) * 100, 2) AS like_percentage,
    -- Like ratio (rounded to 2 decimal places)
    ROUND(COUNT(DISTINCT ls.user_id) / NULLIF(COUNT(DISTINCT h.user_id) - COUNT(DISTINCT ls.user_id), 0), 2) AS like_ratio
    FROM 
        song s
    LEFT JOIN 
        history h ON s.song_id = h.song_id
    LEFT JOIN 
        liked_song ls ON s.song_id = ls.song_id
    GROUP BY 
        s.song_id, s.name;`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, songs}));  // Ensure response is sent
    } catch (err) {
        console.error('Error fetching artists:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Failed to fetch songs' }));
    }
};

const getArtistReport = async (req, res) => {
    try {
        const [artists] = await pool.promise().query(`SELECT 
        a.artist_id, 
        a.username AS artist_name,
        
        COUNT(DISTINCT h.user_id) AS unique_listeners,
        COUNT(DISTINCT f.user_id) AS followers,
        ABS(COUNT(DISTINCT f.user_id) - COUNT(DISTINCT h.user_id)) AS not_streaming_but_following,
        ROUND((COUNT(DISTINCT f.user_id) / NULLIF(COUNT(DISTINCT h.user_id), 0)) * 100, 2) AS following_percentage,
        ABS(ROUND(COUNT(DISTINCT f.user_id) / NULLIF(COUNT(DISTINCT h.user_id) - COUNT(DISTINCT f.user_id), 0), 2)) AS following_ratio

        FROM 
            artist a
        LEFT JOIN 
            song s ON a.artist_id = s.artist_id
        LEFT JOIN 
            history h ON s.song_id = h.song_id
        LEFT JOIN 
            following f ON a.artist_id = f.artist_id
        GROUP BY 
            a.artist_id, a.username;`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, artists}));  // Ensure response is sent
    } catch (err) {
        console.error('Error fetching artists:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Failed to fetch artists' }));
    }
};

const getUserReport = async (req, res) => {
    try {
        const [users] = await pool.promise().query(`SELECT 
    u.user_id, 
    u.username AS user_name,
    
    -- Total plays per user (history table)
    COUNT(DISTINCT h.song_id) AS total_plays,
    
    -- Total likes per user (liked_song table)
    COUNT(DISTINCT ls.song_id) AS total_likes,
    
    -- Unique artists followed by the user
    COUNT(DISTINCT f.artist_id) AS unique_artists_followed,
    
    -- Songs played but not liked by the user
    COUNT(DISTINCT h.song_id) - COUNT(DISTINCT ls.song_id) AS songs_played_but_not_liked,
    
    -- Following percentage (percentage of songs liked out of total plays)
    ROUND((COUNT(DISTINCT ls.song_id) / NULLIF(COUNT(DISTINCT h.song_id), 0)) * 100, 2) AS following_percentage,
    
    -- Like-to-play ratio (ratio of liked songs to total plays)
    ROUND(COUNT(DISTINCT ls.song_id) / NULLIF(COUNT(DISTINCT h.song_id), 0), 2) AS like_to_play_ratio

    FROM 
        user u
    LEFT JOIN 
        history h ON u.user_id = h.user_id
    LEFT JOIN 
        liked_song ls ON u.user_id = ls.user_id
    LEFT JOIN 
        following f ON u.user_id = f.user_id

    GROUP BY 
        u.user_id, u.username;`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, users}));  // Ensure response is sent
    } catch (err) {
        console.error('Error fetching users:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Failed to fetch users' }));
    }
}

const getTopUserSongs = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {

    try {
        const parsedBody = JSON.parse(body);
        const { userId} = parsedBody;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'Username is required' });
        }

        const [songs] = await pool.promise().query(`SELECT 
        ROW_NUMBER() OVER (ORDER BY COUNT(history.song_id) DESC) AS ranks,
        song.song_id,
        song.name,
        song.image_url,
        artist.artist_id AS artist_id,
        artist.username AS artist_name,
        COUNT(history.song_id) AS play_count
        FROM song
        JOIN artist ON song.artist_id = artist.artist_id
        JOIN history ON song.song_id = history.song_id
        WHERE history.user_id = ?  -- Filter based on the user ID
        GROUP BY song.song_id, song.name, song.image_url, artist.artist_id, artist.username
        ORDER BY play_count DESC
        LIMIT 10;`,[userId]);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, songs}));  // Ensure response is sent
    } catch (err) {
        console.error('Error fetching artists:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Failed to fetch songs' }));
    }
    });
};

const getTopUserArtists = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {

    try {
        const parsedBody = JSON.parse(body);
        const { userId} = parsedBody;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'Username is required' });
        }

        const [topArtists] = await pool.promise().query(`SELECT 
        ROW_NUMBER() OVER (ORDER BY COUNT(history.song_id) DESC) AS ranks,
        artist.artist_id,
        artist.username AS artist_name,
        artist.image_url,
        COUNT(history.song_id) AS play_count
        FROM artist
        JOIN song ON song.artist_id = artist.artist_id
        JOIN history ON song.song_id = history.song_id
        WHERE history.user_id = ?  -- Filter based on the specific user ID
        GROUP BY artist.artist_id, artist.username, artist.image_url
        ORDER BY play_count DESC
        LIMIT 3;`,[userId]);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, topArtists}));  // Ensure response is sent
    } catch (err) {
        console.error('Error fetching artists:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Failed to fetch artists' }));
    }
    });

};

const getTopUserAlbums = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {

    try {
        const parsedBody = JSON.parse(body);
        const { userId} = parsedBody;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'Username is required' });
        }

        const [topAlbums] = await pool.promise().query(`SELECT 
        ROW_NUMBER() OVER (ORDER BY COUNT(history.song_id) DESC) AS ranks,
        album.album_id,
        album.name AS album_name,
        album.image_url,
        artist.username AS artist_name,
        COUNT(history.song_id) AS play_count
        FROM album
        JOIN song ON song.album_id = album.album_id
        JOIN artist ON artist.artist_id = album.artist_id
        JOIN history ON song.song_id = history.song_id
        WHERE history.user_id = ?  -- Filter based on the specific user ID
        GROUP BY album.album_id, album.name, album.image_url
        ORDER BY play_count DESC
        LIMIT 3;`,[userId]);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, topAlbums}));  // Ensure response is sent
    } catch (err) {
        console.error('Error fetching albums:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Failed to fetch albums' }));
    }
    });

};

const getTopUserGenres = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {

    try {
        const parsedBody = JSON.parse(body);
        const { userId} = parsedBody;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'Username is required' });
        }

        const [topGenres] = await pool.promise().query(`SELECT 
        ROW_NUMBER() OVER (ORDER BY COUNT(history.song_id) DESC) AS ranks,
        song.genre AS genre_name,
        COUNT(history.song_id) AS play_count
        FROM song
        JOIN history ON song.song_id = history.song_id
        WHERE history.user_id = ?  -- Filter based on the specific user ID
        GROUP BY song.genre
        ORDER BY play_count DESC
        LIMIT 3;`,[userId]);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, topGenres}));  // Ensure response is sent
    } catch (err) {
        console.error('Error fetching genres:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Failed to fetch genres' }));
    }
    });

};

const getTopUserOther = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { userId } = parsedBody;
            
            if (!userId) {
                return res.status(400).json({ success: false, message: 'User ID is required' });
            }

            const [streamCount] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM history WHERE user_id = ?;`,
                [userId]
            );

            const [followingCount] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM following WHERE user_id = ?;`,
                [userId]
            );

            const [artistCount] = await pool.promise().query(
                `SELECT COUNT(DISTINCT song.artist_id) AS count 
                FROM song
                JOIN history ON song.song_id = history.song_id
                WHERE history.user_id = ?;`,
                [userId]
            );

            const [albumCount] = await pool.promise().query(
                `SELECT COUNT(DISTINCT song.album_id) AS count 
                FROM song
                JOIN history ON song.song_id = history.song_id
                WHERE history.user_id = ?;`,
                [userId]
            );

            const [genreCount] = await pool.promise().query(
                `SELECT COUNT(DISTINCT song.genre) AS count 
                FROM song
                JOIN history ON song.song_id = history.song_id
                WHERE history.user_id = ?;`,
                [userId]
            );

            const [playlistCount] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM playlist WHERE playlist.user_id = ?;`,
                [userId]
            );

            const [likeCount] = await pool.promise().query(
                `SELECT 
                    (SELECT COUNT(*) FROM liked_album WHERE user_id = ?) + 
                    (SELECT COUNT(*) FROM liked_song WHERE user_id = ?) AS counter;`, 
                [userId, userId]
            );

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                topOthers: {
                    streamCount: streamCount[0].count,
                    followingCount: followingCount[0].count,
                    artistCount: artistCount[0].count,
                    albumCount: albumCount[0].count,
                    genreCount: genreCount[0].count,
                    playlistCount: playlistCount[0].count,
                    likeCount: likeCount[0].counter
                }
            }));
        } catch (err) {
            console.error('Error fetching user stats:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to fetch user statistics' }));
        }
    });
};

const checkInitialLike = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { userId, song_id } = parsedBody;
            
            if (!userId || !song_id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'User ID and Song ID are required' }));
                return;
            }

            // Query to check if the song is liked by the user
            const [rows] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM liked_song WHERE user_id = ? AND song_id = ?;`,
                [userId, song_id]
            );

            const isLiked = rows[0].count > 0;  // if count is greater than 0, the song is liked by the user

            // Send response with the correct status
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                isLiked: isLiked 
            }));

        } catch (err) {
            console.error('Error fetching initial like:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to fetch initial like' }));
        }
    });
};

const likeSong = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { userId, song_id } = parsedBody;
            
            if (!userId || !song_id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'User ID and Song ID are required' }));
                return;
            }

            await pool.promise().query(
                `INSERT INTO liked_song (user_id, song_id, liked_at) VALUES (?, ?, NOW());`,
                [userId, song_id]
            );


            // Send response with the correct status
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                message: "song liked successfully" 
            }));

        } catch (err) {
            console.error('Error liking song:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to like song' }));
        }
    });
};

const unlikeSong = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { userId, song_id } = parsedBody;
            
            if (!userId || !song_id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'User ID and Song ID are required' }));
                return;
            }

            await pool.promise().query(
                `DELETE FROM liked_song WHERE user_id = ? AND song_id = ?;`,
                [userId, song_id]
            );


            // Send response with the correct status
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                message: "song unliked successfully" 
            }));

        } catch (err) {
            console.error('Error unliking song:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to unlike song' }));
        }
    });
};

const checkAlbumInitialLike = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { userId, album_id } = parsedBody;
            
            if (!userId || !album_id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'User ID and Album ID are required' }));
                return;
            }

            // Query to check if the song is liked by the user
            const [rows] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM liked_album WHERE user_id = ? AND album_id = ?;`,
                [userId, album_id]
            );

            const isLiked = rows[0].count > 0;  // if count is greater than 0, the song is liked by the user

            // Send response with the correct status
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                isLiked: isLiked 
            }));

        } catch (err) {
            console.error('Error fetching initial like:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to fetch initial like' }));
        }
    });
};

const albumLikeSong = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { userId, album_id } = parsedBody;
            
            if (!userId || !album_id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'User ID and Album ID are required' }));
                return;
            }

            await pool.promise().query(
                `INSERT INTO liked_album (user_id, album_id, liked_at) VALUES (?, ?, NOW());`,
                [userId, album_id]
            );


            // Send response with the correct status
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                message: "album liked successfully" 
            }));

        } catch (err) {
            console.error('Error liking album:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to like album' }));
        }
    });
};

const albumUnlikeSong = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { userId, album_id } = parsedBody;
            
            if (!userId || !album_id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'User ID and Album ID are required' }));
                return;
            }

            await pool.promise().query(
                `DELETE FROM liked_album WHERE user_id = ? AND album_id = ?;`,
                [userId, album_id]
            );


            // Send response with the correct status
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                message: "album unliked successfully" 
            }));

        } catch (err) {
            console.error('Error unliking album:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to unlike album' }));
        }
    });
};

const checkFollowStatus = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { userId, artist_id } = parsedBody;
            
            if (!userId || !artist_id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'User ID and Artist ID are required' }));
                return;
            }

            // Query to check if the song is liked by the user
            const [rows] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM following WHERE user_id = ? AND artist_id = ?;`,
                [userId, artist_id]
            );

            const isFollowing = rows[0].count > 0;  // if count is greater than 0, the song is liked by the user

            // Send response with the correct status
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                isFollowing: isFollowing 
            }));

        } catch (err) {
            console.error('Error fetching initial follow:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to fetch initial follow' }));
        }
    });
};

const followArtist = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { userId, artist_id } = parsedBody;
            
            if (!userId || !artist_id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'User ID and Artist ID are required' }));
                return;
            }

            await pool.promise().query(
                `INSERT INTO following (user_id, artist_id, followed_at) VALUES (?, ?, NOW());`,
                [userId, artist_id]
            );


            // Send response with the correct status
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                message: "artist followed successfully" 
            }));

        } catch (err) {
            console.error('Error following artist:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to follow artist' }));
        }
    });
};

const unfollowArtist = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { userId, artist_id } = parsedBody;
            
            if (!userId || !artist_id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'User ID and Artist ID are required' }));
                return;
            }

            await pool.promise().query(
                `DELETE FROM following WHERE user_id = ? AND artist_id = ?;`,
                [userId, artist_id]
            );


            // Send response with the correct status
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                message: "artist unfollowed successfully" 
            }));

        } catch (err) {
            console.error('Error unfollowing artist:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to unfollow artist' }));
        }
    });
};

module.exports = {
    getUsers,
    handleSignup,
    handleLogin,
    getArtistList,
    getAlbumList,
    getUserList,
    getSongList,
    getArtistViewInfo,
    getArtistViewAlbum,
    getArtistViewSong,
    getAlbumViewSong,
    getAlbumViewInfo,
    getTopSongs,
    getTopArtists,
    getTopAlbums,
    getTopGenres,
    getTopOther,
    getArtistInfo,
    getArtistProfileAlbum,
    createSong,
    editSong,
    deleteSong,
    createAlbum,
    editAlbum,
    deleteAlbum,
    addAlbumSong,
    removeAlbumSong,
    getArtistProfileSong,
    getPlaylistViewInfo,
    getProfilePlaylist,
    getPlaylistViewSong,
    getProfileInfo,
    getPlaylistSongs,
    createPlaylist,
    editPlaylist,
    deletePlaylist,
    addPlaylistSong,
    removePlaylistSong,
    editInfo,
    deleteAccount,
    getSongReport,
    getArtistReport,
    getUserReport,
    getTopUserSongs,
    getTopUserArtists,
    getTopUserAlbums,
    getTopUserGenres,
    getTopUserOther,
    checkInitialLike,
    likeSong,
    unlikeSong,
    checkAlbumInitialLike,
    albumLikeSong,
    albumUnlikeSong,
    checkFollowStatus,
    followArtist,
    unfollowArtist
};

