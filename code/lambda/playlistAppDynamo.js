
const PlaylistAPP = require('./PlayListAPP');
const PlaylistSelector=require('./PlaylistSelector');


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

exports.getLastPlayedSongInfoAsync=async function (){
    var selector=new PlaylistSelector();
    await selector.initAsync();
    var app=new PlaylistAPP();
    await app.initAppAsync(selector.getCurrentPlaylistId());
    return app.getLastPlayedSongInfo();
}
exports.getNextSongInfoAsync=async function (){
    var selector=new PlaylistSelector();
    await selector.initAsync();
    var app=new PlaylistAPP();
    await app.initAppAsync(selector.getCurrentPlaylistId());
    return app.getNextSongInfo();
}
exports.getPreviousSongInfoAsync=async function (){
    var selector=new PlaylistSelector();
    await selector.initAsync();
    var app=new PlaylistAPP();
    await app.initAppAsync(selector.getCurrentPlaylistId());
    return app.getPrevSongInfo();


}
exports.setCurrentPlayListByNameAsync=async function (playlistName){
    var selector=new PlaylistSelector();
    await selector.initAsync();
    selector.setCurrentPlaylistByName(playlistName);
    await selector.saveStateAsync();


}
