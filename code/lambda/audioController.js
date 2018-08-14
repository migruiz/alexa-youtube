

exports.play=async function (handlerInput,songInfo){
  
    const playBehavior = 'REPLACE_ALL';

    handlerInput.responseBuilder
      .speak(`This is ${songInfo.song.title}`)
      .withShouldEndSession(true)
      .addAudioPlayerPlayDirective(playBehavior, songInfo.song.url, songInfo.token, 0, null);
}
exports.stop=function(handlerInput){
     handlerInput.responseBuilder
    .addAudioPlayerStopDirective()
}
exports.enqueNextSong=async function (handlerInput,currentSongToken,nextSongInfo){
  
    const playBehavior = 'ENQUEUE';
    handlerInput.responseBuilder
      .addAudioPlayerPlayDirective(playBehavior, nextSongInfo.song.url, nextSongInfo.token, 0, currentSongToken);
}





