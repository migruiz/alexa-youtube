
const PlaylistAPP = require('./PlayListAPP');


async function reportSongStateAsync(songTokenJson,offset){
    var songToken=JSON.parse(songTokenJson);
    var app=new PlaylistAPP();
    await app.initAppAsync(songToken.playlistId);
    app.setCurrentPlayingSong(songToken.songId,0);
    await app.saveStateAsync();
}

exports.reportSongStartedPlayingAsync=async function(songTokenJson,offset){
    await reportSongStateAsync(songTokenJson,offset);
}
exports.reportSongStoppedPlayingAsync=async function(songTokenJson,offset){
    await reportSongStateAsync(songTokenJson,offset);
}

exports.getLastPlayedSongInfoAsync=async function (playlistId){
    var app=new PlaylistAPP();
    await app.initAppAsync(playlistId);
    return app.getLastPlayedSongInfo();
}
exports.getNextSongInfoAsync=async function (playlistId){
    var app=new PlaylistAPP();
    await app.initAppAsync(playlistId);
    return app.getNextSongInfo();
}
exports.getPreviousSongInfoAsync=async function (playlistId){
    var app=new PlaylistAPP();
    await app.initAppAsync(playlistId);
    return app.getPrevSongInfo();


}
