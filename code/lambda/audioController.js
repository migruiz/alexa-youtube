

exports.play=async function (handlerInput,songInfo){
  
    const playBehavior = 'REPLACE_ALL';

    handlerInput.responseBuilder
      .speak(`This is ${songInfo.song.title}`)
      .withShouldEndSession(true)
      .addAudioPlayerPlayDirective(playBehavior, songInfo.song.url, songInfo.token, 0, null);

      return handlerInput.responseBuilder.getResponse();
}
exports.enqueNextSong=async function (handlerInput,currentSongToken,nextSongInfo){
  
    const playBehavior = 'ENQUEUE';

    handlerInput.responseBuilder
      .addAudioPlayerPlayDirective(playBehavior, nextSongInfo.song.url, nextSongInfo.token, 0, currentSongToken);

      return handlerInput.responseBuilder.getResponse();
}





