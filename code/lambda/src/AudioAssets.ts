'use strict';

import { interfaces,Response,Request, IntentRequest} from 'ask-sdk-model';
let en = {
    card: {
        title: 'My Radio',
        text: 'Less bla bla bla, more la la la',
        image: {
            largeImageUrl: 'https://alexademo.ninja/skills/logo-512.png',
            smallImageUrl: 'https://alexademo.ninja/skills/logo-108.png'
        }
    },
    url: 'https://drive.google.com/uc?export=download&id=1kZsT3dqgK1-u9GKiBOeXg_9lkKM5jef0'
};



export function audioData(request : Request) {
    return en; 
}
