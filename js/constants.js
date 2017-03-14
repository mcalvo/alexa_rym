'use strict';

module.exports = Object.freeze({
    // App-ID. Set to your own Skill App ID from the Amazon developer portal.
    appId : 'amzn1.ask.skill.XXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXX',

    //  DynamoDB Table name
    dynamoDBTableName : 'XXXXXX',

    // Voice Insights SDK. Used for analytics.
    viAppToken: 'XXXX-XXXX-XXXX-XXXX',

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
    },
    /*
     * API URL serving the json the skill reads from.
     *
     * Expected fields per JSON entry:
     * url: Secured stream for content
     * date: Broadcast date. Used for UX.
     * description: Brief description of the 'episode'. Used in Cards.
     *
     */
    requestString: 'http://www.ligonier.org/podcasts/renewing-your-mind/alexa.json',
});
