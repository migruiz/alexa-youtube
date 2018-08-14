

exports.play=async function (handlerInput,songInfo){
  
    const playBehavior = 'REPLACE_ALL';

    handlerInput.responseBuilder
      .speak(`This is ${songInfo.song.title}`)
      .withShouldEndSession(true)
      .addAudioPlayerPlayDirective(playBehavior, songInfo.song.url, songInfo.token, 0, null);

      return handlerInput.responseBuilder.getResponse();
}



const controller = {
    async play(handlerInput) {
      const {
        attributesManager,
        responseBuilder
      } = handlerInput;
  
      const playbackInfo = await getPlaybackInfo(handlerInput);
      const {
        playOrder,
        offsetInMilliseconds,
        index
      } = playbackInfo;
  
      const playBehavior = 'REPLACE_ALL';
      const podcast = constants.audioData[playOrder[index]];
      const token = playOrder[index];
  
      responseBuilder
        .speak(`This is ${podcast.title}`)
        .withShouldEndSession(true)
        .addAudioPlayerPlayDirective(playBehavior, podcast.url, token, offsetInMilliseconds, null);
  
      if (await canThrowCard(handlerInput)) {
        const cardTitle = `Playing ${podcast.title}`;
        const cardContent = `Playing ${podcast.title}`;
        responseBuilder.withSimpleCard(cardTitle, cardContent);
      }
  
      return responseBuilder.getResponse();
    },
    stop(handlerInput) {
      return handlerInput.responseBuilder
        .addAudioPlayerStopDirective()
        .getResponse();
    },
    async playNext(handlerInput) {
      const {
        playbackInfo,
        playbackSetting,
      } = await handlerInput.attributesManager.getPersistentAttributes();
  
      const nextIndex = (playbackInfo.index + 1) % constants.audioData.length;
  
      if (nextIndex === 0 && !playbackSetting.loop) {
        return handlerInput.responseBuilder
          .speak('You have reached the end of the playlist')
          .addAudioPlayerStopDirective()
          .getResponse();
      }
  
      playbackInfo.index = nextIndex;
      playbackInfo.offsetInMilliseconds = 0;
      playbackInfo.playbackIndexChanged = true;
  
      return this.play(handlerInput);
    },
    async playPrevious(handlerInput) {
      const {
        playbackInfo,
        playbackSetting,
      } = await handlerInput.attributesManager.getPersistentAttributes();
  
      let previousIndex = playbackInfo.index - 1;
  
      if (previousIndex === -1) {
        if (playbackSetting.loop) {
          previousIndex += constants.audioData.length;
        } else {
          return handlerInput.responseBuilder
            .speak('You have reached the start of the playlist')
            .addAudioPlayerStopDirective()
            .getResponse();
        }
      }
  
      playbackInfo.index = previousIndex;
      playbackInfo.offsetInMilliseconds = 0;
      playbackInfo.playbackIndexChanged = true;
  
      return this.play(handlerInput);
    },
  };
  



