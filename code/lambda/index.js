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
        playlistAppDynamo.reportSongStartedPlaying(token,offset);
        break;
      case 'PlaybackFinished':
        break;
      case 'PlaybackStopped':
        var token=handlerInput.requestEnvelope.request.token;
        var offset=handlerInput.requestEnvelope.request.offsetInMilliseconds;
        playlistAppDynamo.reportSongStoppedPlaying(token,offset);
        break;
      case 'PlaybackNearlyFinished':
        {
          var currentSongToken=handlerInput.requestEnvelope.request.token;
          var nextSongInfo=playlistAppDynamo.getNextSongInfo(currentSongToken);
          return audioController.enqueNextSong(handlerInput,currentSongToken,nextSongInfo);
        }
      case 'PlaybackFailed':
        playbackInfo.inPlaybackSession = false;
        console.log('Playback Failed : %j', handlerInput.requestEnvelope.request.error);
        return;
      default:
        throw new Error('Should never reach here!');
    }

    return responseBuilder.getResponse();
  },
};

const CheckAudioInterfaceHandler = {
  async canHandle(handlerInput) {
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
  async canHandle(handlerInput) {
    return  request.type === 'PlaybackController.PlayCommandIssued'
  },
  handle(handlerInput) {
    var firstSongInfo=playlistAppDynamo.getFirstSongInfo(DEFaultPlayLISTID);
    return audioController.play(handlerInput,firstSongInfo);
  },
};

const NextPlaybackHandler = {
  async canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'PlaybackController.NextCommandIssued' 
  },
  handle(handlerInput) {
    var token=handlerInput.requestEnvelope.request.token;
    var songInfo=playlistAppDynamo.getNextSongInfo(token);
    return audioController.playNext(handlerInput,songInfo);
  },
};

const PreviousPlaybackHandler = {
  async canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'PlaybackController.PreviousCommandIssued';
  },
  handle(handlerInput) {
    var token=handlerInput.requestEnvelope.request.token;
    var songInfo=playlistAppDynamo.getPreviousSongInfo(token);
    return audioController.playNext(handlerInput,songInfo);
  },
};

const PausePlaybackHandler = {
  async canHandle(handlerInput) {
    const playbackInfo = await getPlaybackInfo(handlerInput);
    const request = handlerInput.requestEnvelope.request;

    return playbackInfo.inPlaybackSession &&
      request.type === 'IntentRequest' &&
      (request.intent.name === 'AMAZON.StopIntent' ||
        request.intent.name === 'AMAZON.CancelIntent' ||
        request.intent.name === 'AMAZON.PauseIntent');
  },
  handle(handlerInput) {
    return controller.stop(handlerInput);
  },
};

const LoopOnHandler = {
  async canHandle(handlerInput) {
    const playbackInfo = await getPlaybackInfo(handlerInput);
    const request = handlerInput.requestEnvelope.request;

    return playbackInfo.inPlaybackSession &&
      request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.LoopOnIntent';
  },
  async handle(handlerInput) {
    const playbackSetting = await handlerInput.attributesManager.getPersistentAttributes().playbackSettings;

    playbackSetting.loop = true;

    return handlerInput.responseBuilder
      .speak('Loop turned on.')
      .getResponse();
  },
};

const LoopOffHandler = {
  async canHandle(handlerInput) {
    const playbackInfo = await getPlaybackInfo(handlerInput);
    const request = handlerInput.requestEnvelope.request;

    return playbackInfo.inPlaybackSession &&
      request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.LoopOffIntent';
  },
  async handle(handlerInput) {
    const playbackSetting = await handlerInput.attributesManager.getPersistentAttributes().playbackSetting;

    playbackSetting.loop = false;

    return handlerInput.responseBuilder
      .speak('Loop turned off.')
      .getResponse();
  },
};

const ShuffleOnHandler = {
  async canHandle(handlerInput) {
    const playbackInfo = await getPlaybackInfo(handlerInput);
    const request = handlerInput.requestEnvelope.request;

    return playbackInfo.inPlaybackSession &&
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
    const playbackInfo = await getPlaybackInfo(handlerInput);
    const request = handlerInput.requestEnvelope.request;

    return playbackInfo.inPlaybackSession &&
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
  async canHandle(handlerInput) {
    const playbackInfo = await getPlaybackInfo(handlerInput);
    const request = handlerInput.requestEnvelope.request;

    return playbackInfo.inPlaybackSession &&
      request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.StartOverIntent';
  },
  async handle(handlerInput) {
    const playbackInfo = await handlerInput.attributesManager.getPersistentAttributes().playbackInfo;

    playbackInfo.offsetInMilliseconds = 0;

    return controller.play(handlerInput);
  },
};

const YesHandler = {
  async canHandle(handlerInput) {
    const playbackInfo = await getPlaybackInfo(handlerInput);
    const request = handlerInput.requestEnvelope.request;

    return !playbackInfo.inPlaybackSession && request.type === 'IntentRequest' && request.intent.name === 'AMAZON.YesIntent';
  },
  handle(handleInput) {
    return controller.play(handleInput);
  },
};

const NoHandler = {
  async canHandle(handlerInput) {
    const playbackInfo = await getPlaybackInfo(handlerInput);
    const request = handlerInput.requestEnvelope.request;

    return !playbackInfo.inPlaybackSession && request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NoIntent';
  },
  async handle(handlerInput) {
    const playbackInfo = await getPlaybackInfo(handlerInput);

    playbackInfo.index = 0;
    playbackInfo.offsetInMilliseconds = 0;
    playbackInfo.playbackIndexChanged = true;
    playbackInfo.hasPreviousPlaybackSession = false;

    return controller.play(handlerInput);
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  async handle(handlerInput) {
    const playbackInfo = await getPlaybackInfo(handlerInput);
    let message;

    if (!playbackInfo.hasPreviousPlaybackSession) {
      message = 'Welcome to the AWS Podcast. You can say, play the audio to begin the podcast.';
    } else if (!playbackInfo.inPlaybackSession) {
      message = `You were listening to ${constants.audioData[playbackInfo.index].title}. Would you like to resume?`;
    } else {
      message = 'You are listening to the AWS Podcast. You can say, Next or Previous to navigate through the playlist. At any time, you can say Pause to pause the audio and Resume to resume.';
    }

    return handlerInput.responseBuilder
      .speak(message)
      .reprompt(message)
      .getResponse();
  },
};

const ExitHandler = {
  async canHandle(handlerInput) {
    const playbackInfo = await getPlaybackInfo(handlerInput);
    const request = handlerInput.requestEnvelope.request;


    return !playbackInfo.inPlaybackSession &&
      request.type === 'IntentRequest' &&
      (request.intent.name === 'AMAZON.StopIntent' ||
        request.intent.name === 'AMAZON.CancelIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Goodbye!')
      .getResponse();
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
    const message = 'Sorry, this is not a valid command. Please say help to hear what you can say.';

    return handlerInput.responseBuilder
      .speak(message)
      .reprompt(message)
      .getResponse();
  },
};

/* INTERCEPTORS */

const LoadPersistentAttributesRequestInterceptor = {
  async process(handlerInput) {
    const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();

    // Check if user is invoking the skill the first time and initialize preset values
    if (Object.keys(persistentAttributes).length === 0) {
      handlerInput.attributesManager.setPersistentAttributes({
        playbackSetting: {
          loop: false,
          shuffle: false,
        },
        playbackInfo: {
          playOrder: [...Array(constants.audioData.length).keys()],
          index: 0,
          offsetInMilliseconds: 0,
          playbackIndexChanged: true,
          token: '',
          nextStreamEnqueued: false,
          inPlaybackSession: false,
          hasPreviousPlaybackSession: false,
        },
      });
    }
  },
};

const SavePersistentAttributesResponseInterceptor = {
  async process(handlerInput) {
    await handlerInput.attributesManager.savePersistentAttributes();
  },
};

/* HELPER FUNCTIONS */

async function getPlaybackInfo(handlerInput) {
  const attributes = await handlerInput.attributesManager.getPersistentAttributes();
  return attributes.playbackInfo;
}

async function canThrowCard(handlerInput) {
  const {
    requestEnvelope,
    attributesManager
  } = handlerInput;
  const playbackInfo = await getPlaybackInfo(handlerInput);

  if (requestEnvelope.request.type === 'IntentRequest' && playbackInfo.playbackIndexChanged) {
    playbackInfo.playbackIndexChanged = false;
    return true;
  }
  return false;
}



async function getIndex(handlerInput) {
  // Extracting index from the token received in the request.
  const tokenValue = parseInt(handlerInput.requestEnvelope.request.token, 10);
  const attributes = await handlerInput.attributesManager.getPersistentAttributes();

  return attributes.playbackInfo.playOrder.indexOf(tokenValue);
}

function getOffsetInMilliseconds(handlerInput) {
  // Extracting offsetInMilliseconds received in the request.
  return handlerInput.requestEnvelope.request.offsetInMilliseconds;
}

function shuffleOrder() {
  const array = [...Array(constants.audioData.length).keys()];
  let currentIndex = array.length;
  let temp;
  let randomIndex;
  // Algorithm : Fisher-Yates shuffle
  return new Promise((resolve) => {
    while (currentIndex >= 1) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temp = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temp;
    }
    resolve(array);
  });
}

const skillBuilder = alexa.SkillBuilders.standard();
exports.handler = skillBuilder
  .addRequestHandlers(
    CheckAudioInterfaceHandler,
    LaunchRequestHandler,
    HelpHandler,
    SystemExceptionHandler,
    SessionEndedRequestHandler,
    YesHandler,
    NoHandler,
    StartPlaybackHandler,
    NextPlaybackHandler,
    PreviousPlaybackHandler,
    PausePlaybackHandler,
    LoopOnHandler,
    LoopOffHandler,
    ShuffleOnHandler,
    ShuffleOffHandler,
    StartOverHandler,
    ExitHandler,
    AudioPlayerEventHandler
  )
  .addRequestInterceptors(LoadPersistentAttributesRequestInterceptor)
  .addResponseInterceptors(SavePersistentAttributesResponseInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withAutoCreateTable(true)
  .withTableName(constants.skill.dynamoDBTableName)
  .lambda();