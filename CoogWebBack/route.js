const actions = require('./actions');


function routes(req, res) {
    const URL = req.url;
    const method = req.method;

    console.log(`Incoming request: ${method} ${URL}`);
    if (URL.startsWith('/signup') && method === 'POST') {
        return actions.handleSignup(req, res);
    } 
    if (URL.startsWith('/loginsection') && method === 'POST') {
        return actions.handleLogin(req, res);
    }
    if (URL.startsWith('/artistlist') && method === 'GET') {
        return actions.getArtistList(req, res);
    }
    if (URL.startsWith('/albumlist') && method === 'GET') {
        return actions.getAlbumList(req, res);
    }
    if (URL.startsWith('/userlist') && method === 'GET') {
        return actions.getUserList(req, res);
    }
    if (URL.startsWith('/songlist') && method === 'GET') {
        return actions.getSongList(req, res);
    }
    if (URL.startsWith('/artistview') && method === 'POST') {
        return actions.getArtistViewInfo(req, res);
    }
    if (URL.startsWith('/artistalbum') && method === 'POST') {
        return actions.getArtistViewAlbum(req, res);
    }
    if (URL.startsWith('/artistsong') && method === 'POST') {
        return actions.getArtistViewSong(req, res);
    }
    if (URL.startsWith('/albumview') && method === 'POST') {
        return actions.getAlbumViewInfo(req, res);
    }
    if (URL.startsWith('/albumsong') && method === 'POST') {
        return actions.getAlbumViewSong(req, res);
    }
    if (URL.startsWith('/topsongs') && method === 'GET') {
        return actions.getTopSongs(req, res);
    }
    if (URL.startsWith('/topartists') && method === 'GET') {
        return actions.getTopArtists(req, res);
    }
    if (URL.startsWith('/topalbums') && method === 'GET') {
        return actions.getTopAlbums(req, res);
    }
    if (URL.startsWith('/topgenres') && method === 'GET') {
        return actions.getTopGenres(req, res);
    }
    if (URL.startsWith('/topother') && method === 'GET') {
        return actions.getTopOther(req, res);
    }
    if (URL.startsWith('/artistprofileinfo') && method === 'POST') {
        return actions.getArtistInfo(req, res);
    }
    if (URL.startsWith('/artistprofilealbum') && method === 'POST') {
        return actions.getArtistProfileAlbum(req, res);
    }
    if (URL.startsWith('/createsong') && method === 'POST') {
        return actions.createSong(req, res);
    }
    if (URL.startsWith('/editsong') && method === 'POST') {
        return actions.editSong(req, res);
    }
    if (URL.startsWith('/deletesong') && method === 'POST') {
        return actions.deleteSong(req, res);
    }
    if (URL.startsWith('/addalbum') && method === 'POST') {
        return actions.createAlbum(req, res);
    }
    if (URL.startsWith('/editalbum') && method === 'POST') {
        return actions.editAlbum(req, res);
    }
    if (URL.startsWith('/deletealbum') && method === 'POST') {
        return actions.deleteAlbum(req, res);
    }
    if (URL.startsWith('/addingsongtoalbum') && method === 'POST') {
        return actions.addAlbumSong(req, res);
    }
    if (URL.startsWith('/removesongfromalbum') && method === 'POST') {
        return actions.removeAlbumSong(req, res);
    }
    if (URL.startsWith('/artistprofilesong') && method === 'POST') {
        return actions.getArtistProfileSong(req, res);
    }
    if (URL.startsWith('/playlistviewinfo') && method === 'POST') {
        return actions.getPlaylistViewInfo(req, res);
    }
    if (URL.startsWith('/profileplaylist') && method === 'POST') {
        return actions.getProfilePlaylist(req, res);
    }
    if (URL.startsWith('/playlistviewsong') && method === 'POST') {
        return actions.getPlaylistViewSong(req, res);
    }
    if (URL.startsWith('/infoforprofile') && method === 'POST') {
        return actions.getProfileInfo(req, res);
    }
    if (URL.startsWith('/playlistsongs') && method === 'POST') {
        return actions.getPlaylistSongs(req, res);
    }
    if (URL.startsWith('/createplaylist') && method === 'POST') {
        return actions.createPlaylist(req, res);
    }
    if (URL.startsWith('/editplaylist') && method === 'POST') {
        return actions.editPlaylist(req, res);
    }
    if (URL.startsWith('/deleteplaylist') && method === 'POST') {
        return actions.deletePlaylist(req, res);
    }
    if (URL.startsWith('/addsongtoplaylist') && method === 'POST') {
        return actions.addPlaylistSong(req, res);
    }
    if (URL.startsWith('/removeplaylistsong') && method === 'POST') {
        return actions.removePlaylistSong(req, res);
    }
    if (URL.startsWith('/editinfo') && method === 'POST') {
        return actions.editInfo(req, res);
    }
    if (URL.startsWith('/deleteaccount') && method === 'POST') {
        return actions.deleteAccount(req, res);
    }
    if (URL.startsWith('/songreport') && method === 'GET') {
        return actions.getSongReport(req, res);
    }
    if (URL.startsWith('/artistreport') && method === 'GET') {
        return actions.getArtistReport(req, res);
    }
    if (URL.startsWith('/userreport') && method === 'GET') {
        return actions.getUserReport(req, res);
    }
    if (URL.startsWith('/topusersongs') && method === 'POST') {
        return actions.getTopUserSongs(req, res);
    }
    if (URL.startsWith('/topuserartists') && method === 'POST') {
        return actions.getTopUserArtists(req, res);
    }
    if (URL.startsWith('/topuseralbums') && method === 'POST') {
        return actions.getTopUserAlbums(req, res);
    }
    if (URL.startsWith('/topuserothers') && method === 'POST') {
        return actions.getTopUserOther(req, res);
    }
    if (URL.startsWith('/topusergenres') && method === 'POST') {
        return actions.getTopUserGenres(req, res);
    }
    if (URL.startsWith('/initiallike') && method === 'POST') {
        return actions.checkInitialLike(req, res);
    }
    if (URL.startsWith('/unlikesong') && method === 'POST') {
        return actions.unlikeSong(req, res);
    }
    if (URL.startsWith('/likesong') && method === 'POST') {
        return actions.likeSong(req, res);
    }
    if (URL.startsWith('/albuminitiallike') && method === 'POST') {
        return actions.checkAlbumInitialLike(req, res);
    }
    if (URL.startsWith('/albumlikesong') && method === 'POST') {
        return actions.albumLikeSong(req, res);
    }
    if (URL.startsWith('/albumunlikesong') && method === 'POST') {
        return actions.albumUnlikeSong(req, res);
    }
    if (URL.startsWith('/checkfollowstatus') && method === 'POST') {
        return actions.checkFollowStatus(req, res);
    }
    if (URL.startsWith('/follow') && method === 'POST') {
        return actions.followArtist(req, res);
    }
    if (URL.startsWith('/unfollow') && method === 'POST') {
        return actions.unfollowArtist(req, res);
    }
    if (URL.startsWith('/adminartistreport') && method === 'POST') {
        return actions.adminArtistReport(req, res);
    }
    if (URL.startsWith('/adminuserreport') && method === 'POST') {
        return actions.adminUserReport(req, res);
    }
    if (URL.startsWith('/artistreport') && method === 'POST') {
        return actions.artistSongReport(req, res);
    }


    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Route Not Found" }));
};

module.exports = routes;