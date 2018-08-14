var AWS = require("aws-sdk");
process.env.AWS_SDK_LOAD_CONFIG = true;
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();
var table = "Audio-Player-Multi-Stream";

exports.PlaylistAPP=function(){
   
    var appId;
    var playlistId;
    var playlist=[];
    var state={};
    this.initAppAsync=async function(playlistId){        
        playlistId=playlistId;
        appId='APPS/PlaylistAPP/'+playlistId;
        playlist=await getyoutubePlaylistAsync(playlistId);
        state=await getAppState(playlistId);
    }    
    function getSongInfo(song){
        return {
            song:song,
            token:JSON.stringify({appType:'PlayListAPP',playlistId:playlistId, songId:song.id})      
        };
    }

    this.getLastPlayedSongInfo=function(){
        if (state){
            for (let index = 0; index < playlist.length; index++) {
                const song = playlist[index];
                if (song.id===state.currentPlayingSongId){
                    return getSongInfo(song);
                }
            }
            var firstSong=playlist[0];
            return getSongInfo(firstSong)
        }
        else{
            var firstSong=playlist[0];
            return getSongInfo(firstSong)
        }
    }
    this.getPrevSongInfo=function(){
        var prevSong=getPrevSong(state.currentPlayingSongId);
        return getSongInfo(prevSong);
        function getPrevSong(songId){
            for (let index = 0; index < playlist.length; index++) {
                const song = playlist[index];
                if (song.id===songId){
                    var prevSongIndex=index-1;
                    if (prevSongIndex>=0){
                        return playlist[prevSongIndex];
                    }
                    else{
                        return playlist[0];
                    }
                }            
            }
            return playlist[0];
        }
    }
    this.getNextSongInfo=function(){
        var nextSong=getNextSong(state.currentPlayingSongId);
        return getSongInfo(nextSong);
        function getNextSong(songId){
            for (let index = 0; index < playlist.length; index++) {
                const song = playlist[index];
                if (song.id===songId){
                    var nextSongIndex=index+1;
                    if (nextSongIndex<playlist.length){
                        return playlist[nextSongIndex];
                    }
                    else{
                        return playlist[0];
                    }
                }            
            }
            return playlist[0];
        }
    }


    this.setCurrentPlayingSong=function(songId,offset){
        state.currentPlayingSongId=songId;
        state.offset=offset;
    }
    this.saveStateAsync=async function(){
        var dynamoParams = {
            TableName:table,
            Item:{
                "id":appId,
                "appState":app.state
            }
        };
        await putAsync(dynamoParams);
    }
}

async function getAppState(playlistId){
    var id='APPS/PlaylistAPP/'+playlistId;
    var params = {
        TableName: table,
        Key:{
            "id":id
        }
    };
    return await getAsync(params);
}
async function getyoutubePlaylistAsync(playlistId){
    var id='youtubeplaylists/'+playlistId;
    var params = {
        TableName: table,
        Key:{
            "id":id
        }
    };
    return await getAsync(params);
}


async function putAsync(params){
    return new Promise(function (resolve, reject) {

        docClient.put(params, function(err, data) {
            if (err !== null) return reject(err);
            resolve(data);
        });
    });

}
async function getAsync(params){
    return new Promise(function (resolve, reject) {

        docClient.get(params, function(err, data) {
            if (err !== null) return reject(err);
            resolve(data.Item?data.Item.items:[]);
        });
    });

}