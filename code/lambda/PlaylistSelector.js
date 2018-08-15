
const id = 'APPS/PlaylistAPP/CurrentPlayList';
const DEFAULT_PLAYLISTID='PLJLM5RvmYjvxaMig-iCqA9ZrB8_gg6a9g';
const SONIA_PLAYLISTID='';
const MIGUEL_PLAYLISTID='';
const ALEJANDRO_PLAYLISTID='';
async function getState() {
    var params = {
        TableName: table,
        Key: {
            "id": id
        }
    };
    var data = await getAsync(params);
    return data ? data.Item.state : null;
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