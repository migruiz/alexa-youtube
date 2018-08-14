var AWS = require("aws-sdk");
//process.env.AWS_SDK_LOAD_CONFIG = true;
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();
var table = "Audio-Player-Multi-Stream";

module.exports=function PlaylistAPP(){
   
    this.appId;
    this.playlistId='';
    this.playlist=[];
    this.state;
    this.initAppAsync=async function(playlistId){        
        this.playlistId=playlistId;
        this.appId='APPS/PlaylistAPP/'+playlistId;
        this.playlist=await getyoutubePlaylistAsync(playlistId);
        this.state=await getAppState(playlistId);
    }    
    getSongInfo=function(playlistId,song){
        return {
            song:song,
            token:JSON.stringify({appType:'PlayListAPP',playlistId:playlistId, songId:song.id})      
        };
    }

    this.getLastPlayedSongInfo=function(){
        if (this.state){
            for (let index = 0; index < this.playlist.length; index++) {
                const song = this.playlist[index];
                if (song.id===this.state.currentPlayingSongId){
                    return getSongInfo(this.playlistId,song);
                }
            }
            var firstSong=this.playlist[0];
            return getSongInfo(this.playlistId,firstSong)
        }
        else{
            var firstSong=this.playlist[0];
            return getSongInfo(this.playlistId,firstSong)
        }
    }
    this.getPrevSongInfo=function(){
        var prevSong=getPrevSong(this.playlist,this.state.currentPlayingSongId);
        return getSongInfo(this.playlistId,prevSong);
        function getPrevSong(playlist,songId){
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
            return this.playlist[0];
        }
    }
    this.getNextSongInfo=function(){
        var nextSong=getNextSong(this.playlist,this.state.currentPlayingSongId);
        return getSongInfo(this.playlistId,nextSong);
        function getNextSong(playlist,songId){
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
        this.state={};
        this.state.currentPlayingSongId=songId;
        this.state.offset=offset;
    }
    this.saveStateAsync=async function(){
        var dynamoParams = {
            TableName:table,
            Item:{
                "id":this.appId,
                "appState":this.state
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
    var data= await getAsync(params);
    return data?data.Item.appState:null;
}
async function getyoutubePlaylistAsync(playlistId){
    var id='youtubeplaylists/'+playlistId;
    var params = {
        TableName: table,
        Key:{
            "id":id
        }
    };
    var data= await getAsync(params);
    return data?data.Item.items:[];
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
            resolve(data);
        });
    });

}