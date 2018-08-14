var AWS = require("aws-sdk");
process.env.AWS_SDK_LOAD_CONFIG = true;
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();
var table = "Audio-Player-Multi-Stream";

function PlaylistAPP(){
   
    this.appId='';
    this.playlistId='';
    this.playlist=[];
    this.state={};
    this.initAPP=async function(playlistId){
        this.appId='APPS/PlaylistAPP/'+playlistId;
        this.playlist=await getyoutubePlaylistAsync(playlistId);
        this.playlistId=playlistId;
    }
    this.initAppFromSongToken=function(songToken){
        var songToken=JSON.parse(songTokenJson);
        var playlistId=songToken.playlistId;


    }
    
    function getSongInfo(song){
        return {
            song:song,
            token:JSON.stringify(firstSongToken)      
        };
    }

    this.getFirstSongInfo=function(){
        var firstSong=this.playlist[0];
        var firstSongToken={appType:'PlayListAPP',playlistId:this.playlistId, songId:firstSong.id};
        return getSongInfo(firstSong)
    }
    this.getNextSongInfo=function(songId){
        var nextSong=getNextSong(songId);
        return getSongInfo(nextSong);
        function getNextSong(songId){
            for (let index = 0; index < this.playlist.length; index++) {
                const song = this.playlist[index];
                if (song.id===songId){
                    var nextSongIndex=index+1;
                    if (nextSongIndex<this.playlist.length){
                        return this.playlist[nextSongIndex];
                    }
                    else{
                        return this.playlist[0];
                    }
                }            
            }
        }
    }


    this.setCurrentPlayingSong=function(songId){
        this.state.currentPlayingSongId=songId;
    }
    this.saveState=function(){
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


exports.reportSongStartedPlaying=async function(songTokenJson){
    var songToken=JSON.parse(songTokenJson);
    var app=new PlaylistAPP();
    app.initAPP(songToken.playlistId);
    app.setCurrentPlayingSong(songToken.songId);
    app.saveState();
}

exports.getFirstSongInfo=async function (playlistId){
    var app=new PlaylistAPP();
    app.initAPP(playlistId);
    return app.getFirstSongInfo();
}
exports.getNextSongInfo=async function (currentSongTokenJson){
    var songToken=JSON.parse(currentSongTokenJson);
    var app=new PlaylistAPP();
    app.initAPP(songToken.playlistId);
    return app.getNextSongInfo(songToken.songId);
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

