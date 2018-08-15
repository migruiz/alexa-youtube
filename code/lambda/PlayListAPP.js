var AWS = require("aws-sdk");
//process.env.AWS_SDK_LOAD_CONFIG = true;
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();
var table = "Audio-Player-Multi-Stream";


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
function getSongInfo(playlistId,song){        
    return {
        song:song,
        token:JSON.stringify({appType:'PlayListAPP',playlistId:playlistId, songId:song.id})      
    };
}

class PlaylistAPP {
    constructor() {
      this.appId=null;
      this.playlistId=null;
      this.playlist=null;
      this.state=null;
    }
    async initAppAsync(playlistId){        
        this.playlistId=playlistId;
        this.appId='APPS/PlaylistAPP/'+playlistId;
        this.playlist=await getyoutubePlaylistAsync(playlistId);
        this.state=await getAppState(playlistId);
    }

    getLastPlayedSongInfo(){
        if (this.state){
            for (let index = 0; index < this.playlist.length; index++) {
                const song = this.playlist[index];
                if (song.id===this.state.currentPlayingSongId){
                    return getSongInfo(playlistId,song);
                }
            }
            var firstSong=this.playlist[0];
            return getSongInfo(playlistId,firstSong)
        }
        else{
            var firstSong=this.playlist[0];
            return getSongInfo(playlistId,firstSong)
        }
    }
    getPrevSongInfo(){
        var prevSong=getPrevSong(this.playlist,this.state.currentPlayingSongId);
        return getSongInfo(playlistId,prevSong);
        
    }

    getNextSongInfo(){
        var nextSong=getNextSong(this.playlist,this.state.currentPlayingSongId);
        return getSongInfo(playlistId,nextSong);

    }


    setCurrentPlayingSong(songId,offset){
        this.state={};
        this.state.currentPlayingSongId=songId;
        this.state.offset=offset;
    }
    async saveStateAsync(){
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





module.exports=PlaylistAPP;