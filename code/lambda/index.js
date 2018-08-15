/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable  no-restricted-syntax */
/* eslint-disable  consistent-return */

const alexa = require('ask-sdk');
const playlistAppDynamo = require('./playlistAppDynamo');
const audioController=require('./audioController');
//process.env.AWS_SDK_LOAD_CONFIG = true; 
const DEFaultPlayLISTID='PLJLM5RvmYjvxaMig-iCqA9ZrB8_gg6a9g';

/* INTENT HANDLERS */

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {

    let message = 'Welcome to my youtube player. You can say play to begin.';
    let reprompt = 'You can say, play to begin.';

    return handlerInput.responseBuilder
      .speak(message)
      .reprompt(reprompt)
      .getResponse();
  },
};

const AudioPlayerEventHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type.startsWith('AudioPlayer.');
  },
  async handle(handlerInput) {
    const audioPlayerEventName = handlerInput.requestEnvelope.request.type.split('.')[1];
    switch (audioPlayerEventName) {
      case 'PlaybackStarted':
        var token=handlerInput.requestEnvelope.request.token;
        var offset=handlerInput.requestEnvelope.request.offsetInMilliseconds;
        await playlistAppDynamo.reportSongStartedPlayingAsync(token,offset);
        break;
      case 'PlaybackFinished':
        break;
      case 'PlaybackStopped':
        var token=handlerInput.requestEnvelope.request.token;
        var offset=handlerInput.requestEnvelope.request.offsetInMilliseconds;
        await playlistAppDynamo.reportSongStoppedPlayingAsync(token,offset);
        break;
      case 'PlaybackNearlyFinished':
        {
          var currentSongToken=handlerInput.requestEnvelope.request.token;
          var nextSongInfo=await playlistAppDynamo.getNextSongInfoAsync(DEFaultPlayLISTID);
          audioController.enqueNextSong(handlerInput,currentSongToken,nextSongInfo);
          break;
        }
      case 'PlaybackFailed':
        console.log('Playback Failed : %j', handlerInput.requestEnvelope.request.error);
        return;
      default:
        throw new Error('Should never reach here!');
    }
    return handlerInput.responseBuilder.getResponse();
  },
};

const CheckAudioInterfaceHandler = {
  canHandle(handlerInput) {
    const audioPlayerInterface = ((((handlerInput.requestEnvelope.context || {}).System || {}).device || {}).supportedInterfaces || {}).AudioPlayer;
    return audioPlayerInterface === undefined
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Sorry, this skill is not supported on this device')
      .withShouldEndSession(true)
      .getResponse();
  },
};

const StartPlaybackHandler = {
  canHandle(handlerInput) {
    if (handlerInput.requestEnvelope.request.type === 'IntentRequest') {
      return handlerInput.requestEnvelope.request.intent.name === 'PlayAudio' ||
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ResumeIntent';
    }

  },
  async handle(handlerInput) {
    var songInfo=await playlistAppDynamo.getLastPlayedSongInfoAsync(DEFaultPlayLISTID);
    audioController.play(handlerInput,songInfo);
    return handlerInput.responseBuilder.getResponse();
  },
};

const PlayListsHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    && handlerInput.requestEnvelope.request.intent.name === 'PlaylistIntent';
    
  },
  async handle(handlerInput) {
    const playListSlot = handlerInput.requestEnvelope.request.intent.slots.Playlist;
    let playListName=playListSlot.value;
    return handlerInput.responseBuilder
      .speak(`Opening ${playListName} playlist`)
      .withShouldEndSession(true)
      .getResponse();

  },
};

const NextPlaybackHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NextIntent';
  },
  async handle(handlerInput) {
    var songInfo=await playlistAppDynamo.getNextSongInfoAsync(DEFaultPlayLISTID);
    audioController.play(handlerInput,songInfo);
    return handlerInput.responseBuilder.getResponse();
  },
};

const PreviousPlaybackHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PreviousIntent';
  },
  async handle(handlerInput) {
    var songInfo=await playlistAppDynamo.getPreviousSongInfoAsync(DEFaultPlayLISTID);
    audioController.play(handlerInput,songInfo);
    return handlerInput.responseBuilder.getResponse();
  },
};

const PausePlaybackHandler = {
  canHandle(handlerInput) {
    return 
    handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent' ||
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent');
  },
  handle(handlerInput) {
    audioController.stop(handlerInput);
    return handlerInput.responseBuilder.getResponse();
  },
};



const ShuffleOnHandler = {
  async canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return 
      request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.ShuffleOnIntent';
  },
  async handle(handlerInput) {
    const {
      playbackInfo,
      playbackSetting,
    } = await handlerInput.attributesManager.getPersistentAttributes();

    playbackSetting.shuffle = true;
    playbackInfo.playOrder = await shuffleOrder();
    playbackInfo.index = 0;
    playbackInfo.offsetInMilliseconds = 0;
    playbackInfo.playbackIndexChanged = true;
    return controller.play(handlerInput);
  },
};

const ShuffleOffHandler = {
  async canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return 
      request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.ShuffleOffIntent';
  },
  async handle(handlerInput) {
    const {
      playbackInfo,
      playbackSetting,
    } = await handlerInput.attributesManager.getPersistentAttributes();

    if (playbackSetting.shuffle) {
      playbackSetting.shuffle = false;
      playbackInfo.index = playbackInfo.playOrder[playbackInfo.index];
      playbackInfo.playOrder = [...Array(constants.audioData.length).keys()];
    }

    return controller.play(handlerInput);
  },
};

const StartOverHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return 
      request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.StartOverIntent';
  },
  async handle(handlerInput) {
    var firstSongInfo=await playlistAppDynamo.getFirstSongInfoAsync(DEFaultPlayLISTID);
    audioController.play(handlerInput,firstSongInfo);
    return handlerInput.responseBuilder.getResponse();
  },
};







const SystemExceptionHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'System.ExceptionEncountered';
  },
  handle(handlerInput) {
    console.log(`System exception encountered: ${handlerInput.requestEnvelope.request.reason}`);
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error handled: ${error.stack}`);
    const message = 'Sorry, this is not a valid command. Please say help to hear what you can say.';

    return handlerInput.responseBuilder
      .speak(message)
      .reprompt(message)
      .getResponse();
  },
};




const skillBuilder = alexa.SkillBuilders.standard();
exports.handler = skillBuilder
  .addRequestHandlers(
    CheckAudioInterfaceHandler,
    LaunchRequestHandler,
    SystemExceptionHandler,
    SessionEndedRequestHandler,
    StartPlaybackHandler,
    PlayListsHandler,
    NextPlaybackHandler,
    PreviousPlaybackHandler,
    PausePlaybackHandler,
    ShuffleOnHandler,
    ShuffleOffHandler,
    StartOverHandler,
    AudioPlayerEventHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();