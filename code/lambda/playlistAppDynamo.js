
const PlaylistAPP = require('./PlayListAPP');


async function reportSongStateAsync(songTokenJson,offset){
    var songToken=JSON.parse(songTokenJson);
    var app=new PlaylistAPP();
    await app.initAppAsync(playlistId);
    app.setCurrentPlayingSong(songToken.songId,0);
    await app.saveStateAsync();
}

exports.reportSongStartedPlayingAsync=async function(songTokenJson,offset){
    await reportSongStateAsync(songTokenJson,offset);
}
exports.reportSongStoppedPlayingAsync=async function(songTokenJson,offset){
    await reportSongStateAsync(songTokenJson,offset);
}

exports.getFirstSongInfoAsync=async function (playlistId){
    var app=new PlaylistAPP();
    await app.initAppAsync(playlistId);
    return app.getFirstSongInfo();
}
exports.getNextSongInfoAsync=async function (currentSongTokenJson){
    var songToken=JSON.parse(currentSongTokenJson);
    var app=new PlaylistAPP();
    await app.initAppAsync(playlistId);
    return app.getNextSongInfo(songToken.songId);
}
exports.getPreviousSongInfoAsync=async function (currentSongTokenJson){
    var songToken=JSON.parse(currentSongTokenJson);
    var app=new PlaylistAPP();
    await app.initAppAsync(playlistId);
    return app.getNextSongInfo(songToken.songId);
}



