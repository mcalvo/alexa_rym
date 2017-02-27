'use strict';

module.exports = Object.freeze({
    // App-ID. Set to your own Skill App ID from the developer portal.
    appId : 'amzn1.ask.skill.7b76b3f9-c9f6-4307-bfaa-4aa93ef72e36',
    // MIKE: 'amzn1.ask.skill.7b76b3f9-c9f6-4307-bfaa-4aa93ef72e36',
    // TYLER: 'amzn1.ask.skill.2530a1d2-cfe2-4af8-9b21-b1e9267e7d73',

    //  DynamoDB Table name
    dynamoDBTableName : 'RYMSessions',

    // Voice Insights SDK
    viAppToken: '0bfc8250-efac-11a6-0cf6-0e2486876586',

    /*
     *  States:
     *  START_MODE : Welcome state when the stream has not begun.
     *  PLAY_MODE :  When the stream is being played. Does not imply only active play.
     *               It remains in the state as long as the app is active.
     *  RESUME_MODE: When a user invokes the skill in PLAY_MODE with a LaunchRequest,
     *               the skill provides an option to resume from last position, or to start over the playlist.
     */
    states : {
        START_MODE : '',
        PLAY_MODE : '_PLAY_MODE',
        RESUME_MODE : '_RESUME_MODE'
    }
});
