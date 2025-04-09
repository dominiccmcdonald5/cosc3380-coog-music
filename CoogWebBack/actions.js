const { stringify } = require('qs');
const pool = require('./database.js');
const queries = require('./queries.js');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const {uploadToAzureBlobFromServer} = require('./azure.js');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { get } = require('http');

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
            const imageMatches = image.match(/^data:image\/(\w+);base64,(.+)$/);
            if (!imageMatches) {
                return res.writeHead(400, { 'Content-Type': 'application/json' })
                    .end(JSON.stringify({
                        success: false,
                        message: 'Invalid image file format'
                    }));
            }

            const fileTypeImage = imageMatches[1]; // jpeg, png, etc.
            const base64DataImage = imageMatches[2];
            const bufferImage = Buffer.from(base64DataImage, 'base64');

            // Generate filename
            const fileNameImage = `${username}-${Date.now()}.${fileTypeImage}`;

            // Upload to Azure (or any storage service)
            const imageUrl = await uploadToAzureBlobFromServer(bufferImage, fileNameImage);

            const [result] = await pool.promise().query(
                `INSERT INTO ?? (email, username, password, image_url, created_at) VALUES (?, ?, ?, ?, NOW())`,
                [accountType, email, username, password, imageUrl]
            );

            if (accountType === 'user') {

            const [findUserId] = await pool.promise().query(
                `SELECT user_id FROM user WHERE username = ?`, [username]);


            const [createLikeAlbum] = await pool.promise().query(
                `INSERT INTO playlist (name, user_id, image_url, created_at) VALUES (?, ?, ?, NOW())`, [`Liked Songs`, findUserId[0].user_id, `https://musiccontainer.blob.core.windows.net/mp3/liked_image.png`]
            )
        }
            
            
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
        const [artists] = await pool.promise().query(`SELECT artist_id, username, image_url, isVerified FROM artist`);
        
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
        const [songs] = await pool.promise().query(`SELECT song_id, name, song.image_url AS image, artist.username AS artist_username, song.song_url AS song_url FROM artist, song WHERE song.artist_id = artist.artist_id`);
        
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

        const [isVerifiedAccount] = await pool.promise().query(`SELECT isVerified FROM artist WHERE username = ?;`, [username]);
            
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, 
            follow: followersResult[0].follow, 
            streams: streamsResult[0].streams_count, 
            likedSongs: likedSongsResult[0].liked_songs_count, 
            likedAlbums: likedAlbumsResult[0].liked_albums_count, 
            isVerified: isVerifiedAccount[0].isVerified
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
                SELECT song_id, song.name AS name, song.image_url AS image, song.song_url AS song_url, album.name AS album_name 
                FROM song, album 
                WHERE album.album_id = song.album_id AND album.name = ?;`, [album_name]);

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

        const [imageResult] = await pool.promise().query(`SELECT image_url FROM artist WHERE artist.username = ?;`,[userName])
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

        const [isVerifiedAccount] = await pool.promise().query(`SELECT isVerified FROM artist WHERE username = ?;`, [userName]);
            
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true,
            image_url: imageResult[0].image_url, 
            follow: followersResult[0].follow, 
            streams: streamsResult[0].streams_count, 
            likedSongs: likedSongsResult[0].liked_songs_count, 
            likedAlbums: likedAlbumsResult[0].liked_albums_count ,
            isVerified: isVerifiedAccount[0].isVerified
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
    let body = "";

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { name, artist, genre, album, image, songFile } = parsedBody;

            if (!name || !artist || !songFile) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                    success: false,
                    message: 'Missing required fields (name, artist, genre, album, song file)',
                }));
            }

            let albumCheck = null;
            if (album) {
                [albumCheck] = await pool.promise().query(
                    "SELECT album_id, artist_id FROM album WHERE name = ?",
                    [album]
                );
            }

            if (albumCheck && albumCheck.length > 0) {
                if (albumCheck[0].artist_id !== Number(artist)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({
                        success: false,
                        message: 'Album does not belong to this artist',
                    }));
                }
            } else {
                albumCheck = null;
            }

            let imageUrl = null;
            if (image) {
                const imageMatches = image.match(/^data:image\/(\w+);base64,(.+)$/);
                if (!imageMatches) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({
                        success: false,
                        message: 'Invalid image file format',
                    }));
                }

                const fileTypeImage = imageMatches[1];
                const base64DataImage = imageMatches[2];
                const bufferImage = Buffer.from(base64DataImage, 'base64');

                const fileNameImage = `${name}-${Date.now()}.${fileTypeImage}`;
                imageUrl = await uploadToAzureBlobFromServer(bufferImage, fileNameImage);
            }

            if (typeof songFile !== 'string' || !songFile.startsWith('data:audio/')) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                    success: false,
                    message: 'Invalid audio file format',
                }));
            }

            const audioMatches = songFile.match(/^data:audio\/(\w+);base64,(.+)$/);
            if (!audioMatches) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                    success: false,
                    message: 'Invalid audio file format',
                }));
            }

            const fileType = audioMatches[1];
            const base64Data = audioMatches[2];
            const buffer = Buffer.from(base64Data, 'base64');

            const fileName = `${name}-${artist}-${Date.now()}.${fileType}`;
            const songUrl = await uploadToAzureBlobFromServer(buffer, fileName);
            const albumId = albumCheck && albumCheck.length > 0 ? albumCheck[0].album_id : null;

            const [result] = await pool.promise().query(
                `INSERT INTO song 
                (name, artist_id, album_id, genre, image_url, play_count, likes, length, song_url, created_at)
                VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?, NOW())`,
                [name, artist, albumId, genre, imageUrl || null, songUrl]
            );

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: 'Song created successfully',
                song: {
                    song_id: result.insertId,
                    name,
                    artist_id: artist,
                    album_id: albumCheck ? albumCheck[0].album_id : null,
                    genre,
                    image_url: imageUrl || null,
                    song_url: songUrl,
                    length: 0,
                },
            }));
        } catch (error) {
            console.error('Error creating song:', error);
            if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: error.message || 'Failed to create song',
                }));
            }
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
            if (!prevName || !artist || (!name && !image && !genre)) {
                throw new Error('Missing required fields to update');
            }

            // Check if the song exists with the previous name
            const [songExists] = await pool.promise().execute(
                "SELECT song_id FROM song WHERE name = ? AND artist_id = ?",
                [prevName, artist]
            );

            if (songExists.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Song not found' }));
            }

            // Check for duplicates with the new name (within the same artist)
            if (name) {
                const [duplicateSong] = await pool.promise().execute(
                    "SELECT song_id FROM song WHERE name = ? AND artist_id = ? AND name != ?",
                    [name, artist, prevName]
                );

                if (duplicateSong.length > 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, message: 'Duplicate song name for this artist' }));
                }
            }

            let imageUrl;
            if (image) {
                const imageMatches = image.match(/^data:image\/(\w+);base64,(.+)$/);
                if (!imageMatches) {
                    return res.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({
                        success: false,
                        message: 'Invalid image format'
                    }));
                }

                const fileType = imageMatches[1];
                const base64Data = imageMatches[2];
                const buffer = Buffer.from(base64Data, 'base64');
                const fileName = `${name}-${Date.now()}.${fileType}`;
                imageUrl = await uploadToAzureBlobFromServer(buffer, fileName);
            }

            let query = `UPDATE song SET `;
            const params = [];
            const updates = [];

            if (name) {
                updates.push("name = ?");
                params.push(name);
            }
            if (genre) {
                updates.push("genre = ?");
                params.push(genre);
            }
            if (imageUrl) {
                updates.push("image_url = ?");
                params.push(imageUrl);
            }

            query += updates.join(", ") + " WHERE song_id = ? AND artist_id = ?";
            params.push(songExists[0].song_id, artist);

            await pool.promise().execute(query, params);

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
            if (!name || !artist) {
                throw new Error('Missing required fields');
            }

            // Check if the album exists and belongs to the artist
            const [albumExists] = await pool.promise().execute(
                "SELECT album_id, artist_id FROM album WHERE name = ? AND artist_id = ?",
                [name, artist]
            );

            if (albumExists.length !== 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Album already exist' }));
            }

            let imageUrl = null;
            if (image) {
            const imageMatches = image.match(/^data:image\/(\w+);base64,(.+)$/);
            if (!imageMatches) {
                return res.writeHead(400, { 'Content-Type': 'application/json' })
                    .end(JSON.stringify({
                        success: false,
                        message: 'Invalid image file format'
                    }));
            }

            const fileTypeImage = imageMatches[1]; // jpeg, png, etc.
            const base64DataImage = imageMatches[2];
            const bufferImage = Buffer.from(base64DataImage, 'base64');

            // Generate filename
            const fileNameImage = `${name}-${Date.now()}.${fileTypeImage}`;

            // Upload to Azure (or any storage service)
            imageUrl = await uploadToAzureBlobFromServer(bufferImage, fileNameImage);
        }
            // Insert the song
            await pool.promise().query(
                `INSERT INTO album (name, artist_id, genre, image_url,likes,created_at)
                 VALUES (?, ?, ?, ?, 0, NOW())`,
                [name, artist, genre, imageUrl]
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
            if (!prevName && !artist && (!genre && !image && !name)) {
                throw new Error('Missing required fields to update');
            }

            // Check if the song exists with the previous name
            const [albumExists] = await pool.promise().execute(
                "SELECT album_id FROM album WHERE name = ? AND artist_id = ?",
                [prevName,artist]
            );

            if (albumExists.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Album not found' }));
            }

            // Check for duplicates with the new name (within the same artist)
            if (name) {
                const [duplicateAlbum] = await pool.promise().execute(
                    "SELECT album_id FROM album WHERE name = ? AND name != ? AND artist_id = ?",
                    [name, prevName, artist]
                );

                if (duplicateAlbum.length > 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, message: 'Duplicate album name for this artist' }));
                }
            }

            let imageUrl;
            if (image) {
                const imageMatches = image.match(/^data:image\/(\w+);base64,(.+)$/);
                if (!imageMatches) {
                    return res.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({
                        success: false,
                        message: 'Invalid image format'
                    }));
                }

                const fileType = imageMatches[1];
                const base64Data = imageMatches[2];
                const buffer = Buffer.from(base64Data, 'base64');
                const fileName = `${name}-${Date.now()}.${fileType}`;
                imageUrl = await uploadToAzureBlobFromServer(buffer, fileName);
            }

            let query = `UPDATE album SET `;
            const params = [];
            const updates = [];

            if (name) {
                updates.push("name = ?");
                params.push(name);
            }

            if (genre) {
                updates.push("genre = ?");
                params.push(genre);
            }

            if (imageUrl) {
                updates.push("image_url = ?");
                params.push(imageUrl);
            }

            // Join the SET clause
            query += updates.join(", ") + " WHERE name = ? AND artist_id = ?";
            params.push(prevName, artist);

            await pool.promise().query(query, params);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Playlist edited successfully' }));

        } catch (err) {
            console.error('Error editing playlist:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: err.message || 'Failed to edit playlist'
            }));
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
                SELECT song_id, song.name AS name, song.image_url AS image, song.song_url AS song_url, artist.username AS artist_name 
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

            const [image_url] = await pool.promise().query(`
                SELECT playlist.image_url 
                FROM playlist
                JOIN user ON playlist.user_id = user.user_id
                WHERE user.username = ? AND playlist.name = ?;
            `, [username, playlist_name]);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                songCount: songCount[0].song_count,
                image_url: image_url[0].image_url,
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
            const { playlist_name,userId } = parsedBody;

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
                JOIN user ON playlist.user_id = user.user_id
                WHERE playlist.name = ? AND user.user_id = ?;`, [playlist_name,userId]);

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
            const { playlist_name,user_id } = parsedBody;

            if (!playlist_name) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, message: 'Playlist name is required' }));
            }

            // Correct the query to use playlist_name and fix the join condition
            const [songs] = await pool.promise().query(`
                SELECT 
                    song.song_id, 
                    song.name AS name, 
                    song.image_url AS image, 
                    song.song_url AS song_url,
                    artist.username AS artist_name 
                FROM 
                    artist 
                JOIN song ON song.artist_id = artist.artist_id
                JOIN song_in_playlist ON song_in_playlist.song_id = song.song_id
                JOIN playlist ON playlist.playlist_id = song_in_playlist.playlist_id
                JOIN user ON playlist.user_id = user.user_id
                WHERE playlist.name = ? AND user.user_id = ?`, [playlist_name, user_id]);

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
            if (!name || !user) {
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

            const imageMatches = image.match(/^data:image\/(\w+);base64,(.+)$/);
            if (!imageMatches) {
                return res.writeHead(400, { 'Content-Type': 'application/json' })
                    .end(JSON.stringify({
                        success: false,
                        message: 'Invalid image file format'
                    }));
            }

            const fileTypeImage = imageMatches[1]; // jpeg, png, etc.
            const base64DataImage = imageMatches[2];
            const bufferImage = Buffer.from(base64DataImage, 'base64');

            // Generate filename
            const fileNameImage = `${name}-${Date.now()}.${fileTypeImage}`;

            // Upload to Azure (or any storage service)
            const imageUrl = await uploadToAzureBlobFromServer(bufferImage, fileNameImage);

            // Insert the song
            await pool.promise().query(
                `INSERT INTO playlist (name, user_id, image_url,created_at)
                 VALUES (?, ?, ?, NOW())`,
                [name, user, imageUrl]
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

            if (!prevName || !user || (!name && !image)) {
                throw new Error('Missing required fields to update');
            }

            const [playlistExists] = await pool.promise().execute(
                "SELECT playlist_id FROM playlist WHERE name = ? AND user_id = ?",
                [prevName, user]
            );

            if (playlistExists.length === 0) {
                return res.writeHead(404, { 'Content-Type': 'application/json' }).end(JSON.stringify({
                    success: false,
                    message: 'Playlist not found'
                }));
            }

            if (name) {
                const [duplicatePlaylist] = await pool.promise().execute(
                    "SELECT playlist_id FROM playlist WHERE name = ? AND user_id = ? AND name != ?",
                    [name, user, prevName]
                );

                if (duplicatePlaylist.length > 0) {
                    return res.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({
                        success: false,
                        message: 'Another playlist with this name already exists for this user'
                    }));
                }
            }

            let imageUrl;
            if (image) {
                const imageMatches = image.match(/^data:image\/(\w+);base64,(.+)$/);
                if (!imageMatches) {
                    return res.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({
                        success: false,
                        message: 'Invalid image format'
                    }));
                }

                const fileType = imageMatches[1];
                const base64Data = imageMatches[2];
                const buffer = Buffer.from(base64Data, 'base64');
                const fileName = `${name}-${Date.now()}.${fileType}`;
                imageUrl = await uploadToAzureBlobFromServer(buffer, fileName);
            }

            let query = `UPDATE playlist SET `;
            const params = [];
            const updates = [];

            if (name) {
                updates.push("name = ?");
                params.push(name);
            }

            if (imageUrl) {
                updates.push("image_url = ?");
                params.push(imageUrl);
            }

            // Join the SET clause
            query += updates.join(", ") + " WHERE name = ? AND user_id = ?";
            params.push(prevName, user);

            await pool.promise().query(query, params);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Playlist edited successfully' }));

        } catch (err) {
            console.error('Error editing playlist:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: err.message || 'Failed to edit playlist'
            }));
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
            const { accountType, songId, userId, playlist_name, album_name } = parsedBody;

            // Validate required fields
            if (!accountType || !songId || !userId || (!playlist_name && !album_name)) {
                throw new Error('Missing required fields');
            }

            if (accountType === 'user') {
                // For a user, add the song to the playlist
                if (playlist_name) {
                    // Get the playlist_id for the provided playlist_name
                    const [playlistRows] = await pool.promise().execute(
                        `SELECT playlist_id FROM playlist WHERE name = ? AND user_id = ?`, 
                        [playlist_name, userId]
                    );

                    if (playlistRows.length === 0) {
                        throw new Error('Playlist not found or user does not have access to this playlist');
                    }

                    const playlistId = playlistRows[0].playlist_id;

                    // Insert the song into the song_in_playlist table
                    await pool.promise().execute(
                        `INSERT INTO song_in_playlist (song_id, playlist_id, added_at) VALUES (?, ?, NOW())`, 
                        [songId, playlistId]
                    );

                    res.writeHead(201, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ success: true, message: 'Song added to playlist successfully' }));
                } else {
                    throw new Error('Playlist name is required for user account');
                }
            } else if (accountType === 'artist') {
                // For an artist, update the album_id of the song
                if (album_name) {
                    // Get the album_id for the provided album_name
                    const [albumRows] = await pool.promise().execute(
                        `SELECT album_id FROM album WHERE name = ? AND artist_id = ?`, 
                        [album_name, userId]
                    );

                    if (albumRows.length === 0) {
                        throw new Error('Album not found or artist does not have access to this album');
                    }

                    const albumId = albumRows[0].album_id;

                    // Update the album_id of the song
                    await pool.promise().execute(
                        `UPDATE song SET album_id = ? WHERE song_id = ? AND artist_id = ?`, 
                        [albumId, songId, userId]
                    );

                    res.writeHead(201, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ success: true, message: 'Song added to album successfully' }));
                } else {
                    throw new Error('Album name is required for artist account');
                }
            } else {
                throw new Error('Invalid account type');
            }
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
        const { accountType, userName, newPassword, image } = parsedBody;
        console.log(accountType, userName, newPassword, image);
        let isWorking = false;
        let updatedUser = null;
  
        if (!accountType || !userName || (!image && !newPassword)) {
          throw new Error('Missing required fields');
        }
  
        const validAccountTypes = ['user', 'artist', 'admin'];
        if (!validAccountTypes.includes(accountType)) {
          throw new Error('Invalid account type');
        }
  
        let imageUrl = null;
        if (image) {
          const imageMatches = image.match(/^data:image\/(\w+);base64,(.+)$/);
          if (!imageMatches) {
            return res.writeHead(400, { 'Content-Type': 'application/json' })
              .end(JSON.stringify({
                success: false,
                message: 'Invalid image file format'
              }));
          }
  
          const fileTypeImage = imageMatches[1]; // jpeg, png, etc.
          const base64DataImage = imageMatches[2];
          const bufferImage = Buffer.from(base64DataImage, 'base64');
          const fileNameImage = `${userName}-${Date.now()}.${fileTypeImage}`;
  
          // Upload to Azure (or other service)
          imageUrl = await uploadToAzureBlobFromServer(bufferImage, fileNameImage);
        }
  
        let updateFields = [];
        let updateValues = [];
  
        if (newPassword) {
          updateFields.push('password = ?');
          updateValues.push(newPassword);
        }
  
        if (imageUrl) {
          updateFields.push('image_url = ?');
          updateValues.push(imageUrl);
        }
  
        if (updateFields.length > 0) {
          const [check] = await pool.promise().query(
            `SELECT username FROM ${accountType} WHERE username = ?`, [userName]
          );
  
          if (check.length > 0) {
            const updateQuery = `UPDATE ${accountType} SET ${updateFields.join(', ')} WHERE username = ?`;
            updateValues.push(userName);
            await pool.promise().query(updateQuery, updateValues);
            isWorking = true;
  
            const [fetchedUser] = await pool.promise().query(
              `SELECT image_url FROM ${accountType} WHERE username = ?`, [userName]
            );
            updatedUser = fetchedUser[0];
          }
        }
  
        if (isWorking) {
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            success: true,
            image_url: updatedUser?.image_url || null,
          }));
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
            const { accountType, userName } = parsedBody;
            console.log(accountType, userName); 
            let isWorking = false;

            if (!accountType || !userName) {
                console.log(accountType, userName);
                throw new Error('Missing required fields');
            }

            const validAccountTypes = ['user', 'artist', 'admin'];
            if (!validAccountTypes.includes(accountType)) {
                throw new Error('Invalid account type');
            }

            let result;
            if (accountType === 'user') {
                const [user_check] = await pool.promise().query(
                    `SELECT user_id, username FROM user WHERE username = ?`, [userName]
                );
                if (user_check.length > 0) {
                    result = await pool.promise().query(
                        `DELETE FROM user WHERE username = ?`, [userName]
                    );
                    isWorking = true;
                }
            } else if (accountType === 'artist') {
                const [artist_check] = await pool.promise().query(
                    `SELECT artist_id, username FROM artist WHERE username = ?`, [userName]
                );
                if (artist_check.length > 0) {
                    result = await pool.promise().query(
                        `DELETE FROM artist WHERE username = ?`, [userName]
                    );
                    isWorking = true;
                }
            } else if (accountType === 'admin') {
                const [admin_check] = await pool.promise().query(
                    `SELECT admin_id, username FROM admin WHERE username = ?`, [userName]
                );
                if (admin_check.length > 0) {
                    result = await pool.promise().query(
                        `DELETE FROM admin
                        WHERE username = ?`, [userName]
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

            const [findPlaylistId] = await pool.promise().query(
                `SELECT playlist_id FROM playlist WHERE user_id = ? AND playlist.name = 'Liked Songs'`, [userId]);

            await pool.promise().query(
                `INSERT INTO song_in_playlist (song_id, playlist_id, added_at) VALUES (?, ?, NOW());`, [song_id, findPlaylistId[0].playlist_id]
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

            const [findPlaylistId] = await pool.promise().query(
                `SELECT playlist_id FROM playlist WHERE user_id = ? AND playlist.name = 'Liked Songs'`, [userId]);

            await pool.promise().query(
                `DELETE FROM song_in_playlist WHERE song_id = ? AND playlist_id = ?;`, [song_id, findPlaylistId[0].playlist_id]
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

const adminArtistReport = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { username, date_from, date_to, streams, songs, albums, likes, followers, unique, verified } = parsedBody;
            
            let query = `
            SELECT * FROM (
                SELECT a.username, a.created_at, a.isVerified,
                (SELECT COUNT(*) FROM history s 
                    JOIN song so ON s.song_id = so.song_id 
                    WHERE so.artist_id = a.artist_id) AS total_streams,
                
                (SELECT COUNT(*) FROM song so WHERE so.artist_id = a.artist_id) AS total_songs,
                (SELECT COUNT(*) FROM album al WHERE al.artist_id = a.artist_id) AS total_albums,
                (SELECT COUNT(*) FROM liked_song l JOIN song so ON l.song_id = so.song_id WHERE so.artist_id = a.artist_id) AS total_likes,
                (SELECT COUNT(*) FROM following f WHERE f.artist_id = a.artist_id) AS total_followers,
                (SELECT COUNT(DISTINCT s.user_id) FROM history s 
                    JOIN song so ON s.song_id = so.song_id 
                    WHERE so.artist_id = a.artist_id) AS unique_listeners
                FROM artist AS a
                WHERE 1=1
            `;
            let queryParams = [];

            if (username) {
            query += ` AND a.username LIKE ?`;
            queryParams.push(`%${username}%`);
            }
            if (date_from) {
            query += ` AND a.created_at >= ?`;
            queryParams.push(date_from);
            }
            if (date_to) {
            query += ` AND a.created_at <= ?`;
            queryParams.push(date_to);
            }
            if (verified !== undefined && verified !== null && verified !== "") {
                query += ` AND a.isVerified = ?`;
                queryParams.push(verified);
              }

            query += `
            ) AS artist_data
            WHERE 1=1
            `;

            if (streams) {
            query += ` AND total_streams >= ?`;
            queryParams.push(streams);
            }
            if (songs) {
            query += ` AND total_songs >= ?`;
            queryParams.push(songs);
            }
            if (albums) {
            query += ` AND total_albums >= ?`;
            queryParams.push(albums);
            }
            if (likes) {
            query += ` AND total_likes >= ?`;
            queryParams.push(likes);
            }
            if (followers) {
            query += ` AND total_followers >= ?`;
            queryParams.push(followers);
            }
            if (unique) {
            query += ` AND unique_listeners >= ?`;
            queryParams.push(unique);
            }

            const [rows] = await pool.promise().query(query, queryParams);

            // Send response with the correct status
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, data: rows }));

        } catch (err) {
            console.error("Error fetching artist report:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, message: "No Artists Accessible" }));
        }
    });
};

const adminUserReport = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { date_from, date_to} = parsedBody;

            let query = `
                SELECT 
                    u.user_id AS user_id,
                    u.username AS user_name, 
                    u.created_at AS created_at,

                    -- Most recent playlist created by the user
                    (SELECT p.name 
                    FROM playlist p 
                    WHERE p.user_id = u.user_id 
                    ORDER BY p.created_at DESC 
                    LIMIT 1) AS most_recent_playlist,

                    -- Number of songs in the most recent playlist
                    (SELECT COUNT(*) 
                    FROM song_in_playlist ps 
                    WHERE ps.playlist_id = (
                        SELECT p.playlist_id 
                        FROM playlist p 
                        WHERE p.user_id = u.user_id 
                        ORDER BY p.created_at DESC 
                        LIMIT 1
                    )) AS songs_in_recent_playlist,

                    -- Favorite artist (by number of streams)
                    (SELECT a.username 
                    FROM artist a 
                    JOIN song s ON s.artist_id = a.artist_id 
                    JOIN history h ON h.song_id = s.song_id 
                    WHERE h.user_id = u.user_id 
                    GROUP BY a.artist_id 
                    ORDER BY COUNT(*) DESC 
                    LIMIT 1) AS favorite_artist

                FROM user u 
                WHERE 1=1
            `;

            let queryParams = [];

            if (date_from) {
                query += ` AND u.created_at >= ?`;
                queryParams.push(date_from);
            }

            if (date_to) {
                query += ` AND u.created_at <= ?`;
                queryParams.push(date_to);
            }

            const [rows] = await pool.promise().query(query, queryParams);

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, data: rows }));

        } catch (err) {
            console.error("Error fetching user report:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, message: "No Users Accessible" }));
        }
    });
};

const artistSongReport = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { username, song_name, album_name, date_from, date_to, streams, likes, unique_listeners } = parsedBody;

            if (!username) {
                return res.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ success: false, message: "Username is required" }));
            }

            let query = `
                SELECT 
                    s.name as song_name, 
                    s.created_at, 
                    a.name as album_name,
                    
                    -- Total streams of the song
                    (SELECT COUNT(*) FROM history h WHERE h.song_id = s.song_id) AS total_streams,

                    -- Total likes of the song
                    (SELECT COUNT(*) FROM liked_song ls WHERE ls.song_id = s.song_id) AS total_likes,

                    -- Total unique listeners of the song
                    (SELECT COUNT(DISTINCT h.user_id) FROM history h WHERE h.song_id = s.song_id) AS total_unique_listeners

                FROM song s
                JOIN album a ON s.album_id = a.album_id
                JOIN artist ar ON s.artist_id = ar.artist_id
                WHERE ar.username = ?
            `;

            let queryParams = [username];

            if (song_name) {
                query += ` AND s.name LIKE ?`;
                queryParams.push(`%${song_name}%`);
            }

            if (album_name) {
                query += ` AND a.name LIKE ?`;
                queryParams.push(`%${album_name}%`);
            }

            if (date_from) {
                query += ` AND s.created_at >= ?`;
                queryParams.push(date_from);
            }

            if (date_to) {
                query += ` AND s.created_at <= ?`;
                queryParams.push(date_to);
            }

            // Filtering by aggregates using HAVING
            query += ` HAVING 1=1`;

            if (streams) {
                query += ` AND total_streams >= ?`;
                queryParams.push(streams);
            }

            if (likes) {
                query += ` AND total_likes >= ?`;
                queryParams.push(likes);
            }

            if (unique_listeners) {
                query += ` AND total_unique_listeners >= ?`;
                queryParams.push(unique_listeners);
            }

            const [rows] = await pool.promise().query(query, queryParams);

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, data: rows }));

        } catch (err) {
            console.error("Error fetching song report:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, message: "No Songs Accessible" }));
        }
    });
};

const streamSong = async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { userId, songId } = parsedBody;
            
            if (!userId || !songId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'User ID and Song ID are required' }));
                return;
            }

            await pool.promise().query(
                `INSERT INTO history (user_id, song_id, last_listen) VALUES (?, ?, NOW());`,
                [userId, songId]
            );


            // Send response with the correct status
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                message: "song streamed successfully" 
            }));

        } catch (err) {
            console.error('Error following artist:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Failed to stream song' }));
        }
    });
};

const getSongOptionList = async (req, res) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const parsedBody = JSON.parse(body);
            const { accountType, userId, album_name, playlist_name } = parsedBody;
            console.log(accountType,userId,album_name,playlist_name);
            
            if (!accountType || !userId || (!album_name && !playlist_name)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ 
                    success: false, 
                    message: 'Missing Required Fields' 
                }));
            }

            let query = `
                SELECT 
                    song.song_id, 
                    song.name, 
                    song.image_url AS image, 
                    artist.username AS artist_username, 
                    song.song_url AS song_url 
                FROM song 
                JOIN artist ON song.artist_id = artist.artist_id
            `;

            let params = [];

            if (accountType === "artist" && album_name) {
                query += ` 
                    WHERE artist.artist_id = ? 
                    AND (song.album_id IS NULL OR song.album_id != (
                        SELECT album_id FROM album WHERE name = ? AND artist_id = ?
                    ))
                `;
                params = [userId, album_name, userId];
            } else if (accountType === "user" && playlist_name) {
                query += ` 
                    WHERE song.song_id NOT IN (
                        SELECT song_id FROM song_in_playlist 
                        WHERE playlist_id = (
                            SELECT playlist_id FROM playlist 
                            WHERE name = ? AND user_id = ?
                        )
                    )
                `;
                params = [playlist_name, userId];
            }

            // Get a connection from the pool
            const connection = await pool.promise().getConnection();
            
            try {
                // Execute the query with proper parameter handling
                const [rows] = await connection.execute(query, params);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: "Songs fetched successfully",
                    songs: rows
                }));
            } finally {
                // Always release the connection back to the pool
                connection.release();
            }

        } catch (err) {
            console.error('Error fetching songs:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false, 
                message: 'Failed to fetch songs',
                error: err.message 
            }));
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
    unfollowArtist,
    adminArtistReport,
    adminUserReport,
    artistSongReport,
    streamSong,
    getSongOptionList
};

