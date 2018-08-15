
var AWS = require("aws-sdk");
//process.env.AWS_SDK_LOAD_CONFIG = true;
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();
var table = "Audio-Player-Multi-Stream";

const id = 'APPS/PlaylistAPP/CurrentPlayList';
const DEFAULT_PLAYLISTID='PLJLM5RvmYjvxaMig-iCqA9ZrB8_gg6a9g';
const SONIA_PLAYLISTID='PLJLM5RvmYjvzPpigUHNYOcuK8wK8ELCGz';
const MIGUEL_PLAYLISTID='PLJLM5RvmYjvwk62Semrl4exYe7p4osOWv';
const ALEJANDRO_PLAYLISTID='PLJLM5RvmYjvxxipdtdO7clRjTomBB8ERi';

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


async function getState() {
    var params = {
        TableName: table,
        Key: {
            "id": id
        }
    };
    var data = await getAsync(params);
    return data.Item ? data.Item.state : null;
}

class PlaylistSelector {
    constructor() {
        this.state = {};
    }
    async initAsync() {
        var savedState = await getState();
        this.state = savedState || {};
    }


    getCurrentPlaylistId() {
        return this.state.playlistId;
    }
    setCurrentPlaylistByName(playListName) {
        this.state.playListName = playListName;
        if (playListName.toUpperCase() === 'ALEJANDRO') {
            this.state.playlistId = ALEJANDRO_PLAYLISTID;
        }
        else if (playListName.toUpperCase() === 'SONIA') {
            this.state.playlistId = SONIA_PLAYLISTID;
        }
        else if (playListName.toUpperCase() === 'MIGUEL') {
            this.state.playlistId = MIGUEL_PLAYLISTID;
        }
        else{
            this.state.playListName = 'Default';
            this.state.playlistId = DEFAULT_PLAYLISTID;
        }
    }
    setDefaultPlayList() {
        this.state.playListName = 'Default';
        this.state.playlistId = DEFAULT_PLAYLISTID;
    }

    async saveStateAsync() {
        var dynamoParams = {
            TableName: table,
            Item: {
                "id": id,
                "state": this.state
            }
        };
        await putAsync(dynamoParams);
    }

}
module.exports = PlaylistSelector;