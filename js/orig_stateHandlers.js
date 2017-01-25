'use strict';

var Alexa = require('alexa-sdk');
var audioData = require('./audioAssets');
var constants = require('./constants');
var request = require('request');

var stateHandlers = {
    startModeIntentHandlers : Alexa.CreateStateHandler(constants.states.START_MODE, {
        /*
         *  All Intent Handlers for state : START_MODE
         */
        'LaunchRequest' : function () {
            // Initialize Attributes
            this.attributes['playOrder'] = Array.apply(null, {length: audioData.length}).map(Number.call, Number);
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['loop'] = true;
            this.attributes['shuffle'] = false;
            this.attributes['playbackIndexChanged'] = true;
            delete this.attributes.confirm_zipcode;

            //  Change state to START_MODE
            this.handler.state = constants.states.START_MODE;

            // Initialize timezone if undefined
            if (!this.attributes['zipcode']) {
                var message = 'Welcome to Refnet Christian Radio. To optimize the listening experience for your time zone, please state your five digit zipcode.';
                var reprompt = 'Please state your five digit zipcode, or say, Pass, to optimize later.';

                var cardTitle = 'Welcome to RefNet';
                var cardContent = 'To optimize the listening experience for your time zone, please tell Alexa your five digit ZIP code.';

                this.response.cardRenderer(cardTitle, cardContent, null);
                this.handler.state = constants.states.GET_ZIP;

                this.response.speak(message).listen(reprompt);
                this.emit(':responseReady');
            } else {
                var message = 'You\'re listening to Refnet Christian Radio.';
                var podcast = audioData.filter(function(item){ return item.utc == this.attributes['utc']; }.bind(this))[0];

                var cardTitle = 'RefNet Christian Radio';
                var cardContent = 'Now playing ' + podcast.title;
                var cardImage = {
                    'smallImageUrl': 'https://s3.us-east-2.amazonaws.com/ligonier-audio-app/720x480_RefNet.png',
                    'largeImageUrl': 'https://s3.us-east-2.amazonaws.com/ligonier-audio-app/1200x800_RefNet.png'
                };

                this.attributes.confirm_zipcode = this.event.request.intent.slots.zipcode.value;
                this.response.cardRenderer(cardTitle, cardContent, cardImage);

                this.response.speak(message);
                controller.play.call(this);
            }
        },
        'PlayAudio' : function () {
            // Initialize Attributes.
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['loop'] = true;
            this.attributes['shuffle'] = false;
            this.attributes['playbackIndexChanged'] = true;
            delete this.attributes.confirm_zipcode;

            //  Change state to START_MODE
            this.handler.state = constants.states.START_MODE;

            // Initialize timezone if undefined
            if (!this.attributes['zipcode']) {
                var message = 'Welcome to Refnet Christian Radio. To optimize the listening experience for your time zone, please state your five digit zipcode.';
                var reprompt = 'Please state your zipcode, or say, Pass, to optimize later.';
                if (canThrowCard.call(this)) {
                    var cardTitle = 'Welcome to RefNet';
                    var cardContent = 'To optimize the listening experience for your time zone, please tell Alexa your five digit ZIP code.';
                    this.response.cardRenderer(cardTitle, cardContent, null);
                }
                this.handler.state = constants.states.GET_ZIP;
                this.response.speak(message).listen(reprompt);
                this.emit(':responseReady');
            } else {
                var message = 'You\'re listening to Refnet Christian Radio.';
                if (canThrowCard.call(this)) {
                    var podcast = audioData.filter(function(item){ return item.utc == this.attributes['utc']; }.bind(this))[0];
                    var cardTitle = 'You\'re listening to RefNet';
                    var cardContent = 'Not Playing ' + podcast.title;
                    var cardImage = {
                        'smallImageUrl': 'https://s3.us-east-2.amazonaws.com/ligonier-audio-app/720x480_RefNet.png',
                        'largeImageUrl': 'https://s3.us-east-2.amazonaws.com/ligonier-audio-app/1200x800_RefNet.png'
                    };

                    this.response.cardRenderer(cardTitle, cardContent, cardImage);
                }
                this.response.speak(message);
                controller.play.call(this);
            }
        },
        'AMAZON.ResumeIntent' : function () {
            // Initialize Attributes.
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['loop'] = true;
            this.attributes['shuffle'] = false;
            this.attributes['playbackIndexChanged'] = true;
            delete this.attributes.confirm_zipcode;

            //  Change state to START_MODE
            this.handler.state = constants.states.START_MODE;

            // Initialize timezone if undefined
            if (!this.attributes['zipcode']) {
                var message = 'Welcome to Refnet Christian Radio. To optimize the listening experience for your time zone, please state your five digit zipcode.';
                var reprompt = 'Please state your five digit zipcode, or say, Pass, to optimize later.';
                if (canThrowCard.call(this)) {
                    var cardTitle = 'Welcome to RefNet';
                    var cardContent = 'To optimize your listening experience, please tell Alexa your five digit ZIP code.';
                    this.response.cardRenderer(cardTitle, cardContent, null);
                }
                this.handler.state = constants.states.GET_ZIP
                this.response.speak(message).listen(reprompt);
                this.emit(':responseReady');
            } else {
                var message = 'You\'re listening to Refnet Christian Radio.';
                if (canThrowCard.call(this)) {
                    var podcast = audioData.filter(function(item){ return item.utc == this.attributes['utc']; }.bind(this))[0];
                    var cardTitle = 'You\'re listening to RefNet';
                    var cardContent = 'Now playing ' + podcast.title;
                    var cardImage = {
                        'smallImageUrl': 'https://s3.us-east-2.amazonaws.com/ligonier-audio-app/720x480_RefNet.png',
                        'largeImageUrl': 'https://s3.us-east-2.amazonaws.com/ligonier-audio-app/1200x800_RefNet.png'
                    };

                    this.response.cardRenderer(cardTitle, cardContent, cardImage);
                }
                this.response.speak(message);
                controller.play.call(this);
            }
        },
        'AMAZON.HelpIntent' : function () {
            // This will called while audio is playing and a user says "ask <invocation_name> for help"
            var message = 'Ref Net is twenty-four hour internet radio featuring biblical preaching and teaching. You can say things like, "play ref net", to start listening, or, "change my zip code", to optimize the listening experience for your timezone. See your Alexa app for more information. How can I help you?.';
            var reprompt = 'How can I help you?'
            if (canThrowCard.call(this)) {
                var cardTitle = 'Help with RefNet';
                var cardContent = 'Here are some things you can do:\nTo play RefNet, say "Alexa, play RefNet"\n To stop RefNet, say "Alexa, stop"\n To optimize the listening experience for your time zone, say "Alexa, ask RefNet to change my ZIP code" \n To see what is playing in your region, just visit listen.refnet.fm in any Internet browser.';
                this.response.cardRenderer(cardTitle, cardContent, null);
            }

            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'SetZip': function() {
            var message = 'To optimize the listening experience for your time zone, please state your five digit zipcode.';
            var reprompt = 'Please state your five digit zipcode, or say, Pass, to optimize later.';
            if (canThrowCard.call(this) && !this.attributes['zipcode']) {
                var cardTitle = 'Welcome to RefNet';
                var cardContent = 'To optimize the listening experience for your time zone, please tell Alexa your five digit ZIP code.';
                this.response.cardRenderer(cardTitle, cardContent, null);
            }
            delete this.attributes.confirm_zipcode;
            this.handler.state = constants.states.GET_ZIP;
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'AMAZON.StopIntent' : function () {
            var message = 'Good bye.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'AMAZON.CancelIntent' : function () {
            var message = 'Good bye.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'AMAZON.LoopOffIntent' : function () {
            var message = 'Sorry, I cannot loop a live stream.';
            this.response.speak(message);
            controller.play.call(this);
        },
        'AMAZON.LoopOnIntent' : function () {
            var message = 'Sorry, I cannot loop a live stream.';
            this.response.speak(message);
            controller.play.call(this);
        },
        'AMAZON.NextIntent' : function () {
            var message = 'Sorry, I cannot skip ahead on a live stream.';
            this.response.speak(message);
            controller.play.call(this);
        },
        'AMAZON.PreviousIntent' : function () {
            var message = 'Sorry, I cannot rewind a live stream.';
            this.response.speak(message);
            controller.play.call(this);
        },
        'AMAZON.RepeatIntent' : function () {
            var message = 'Sorry, I cannot repeat a live stream.';
            this.response.speak(message);
            controller.play.call(this);
        },
        'AMAZON.ShuffleOffIntent' : function () {
            var message = 'Sorry, I cannot shuffle a live stream.';
            this.response.speak(message);
            controller.play.call(this);
        },
        'AMAZON.ShuffleOnIntent' : function () {
            var message = 'Sorry, I cannot shuffle a live stream.';
            this.response.speak(message);
            controller.play.call(this);
        },
        'AMAZON.StartOverIntent' : function () {
            var message = 'Sorry, I cannot restart a live stream.';
            this.response.speak(message);
            controller.play.call(this);
        },
        'SessionEndedRequest' : function () {
            // No session ended logic
        },
        'Unhandled' : function () {
            var message = 'I\'m not quite sure how to help you with that. You can say Alexa, ask Refnet for help, to learn more.';
            this.response.speak(message);
            controller.play.call(this);
        }
    }),
    playModeIntentHandlers : Alexa.CreateStateHandler(constants.states.PLAY_MODE, {
        /*
         *  All Intent Handlers for state : PLAY_MODE
         */
        'LaunchRequest' : function () {
            /*
             *  Session resumed in PLAY_MODE STATE.
             *      Give welcome message.
             *      Change state to START_STATE to restrict user inputs.
             */

            // Initialize Attributes.
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['loop'] = true;
            this.attributes['shuffle'] = false;
            this.attributes['playbackIndexChanged'] = true;
            delete this.attributes.confirm_zipcode;

            //  Change state to START_MODE
            this.handler.state = constants.states.START_MODE;

            // Initialize timezone if undefined
            if (!this.attributes['zipcode']) {
                var message = 'Welcome to Refnet Christian Radio. To optimize the listening experience for your time zone, please state your five digit zipcode.';
                var reprompt = 'Please state your five digit zipcode, or say, Pass, to optimize later.';

                var cardTitle = 'Welcome to RefNet';
                var cardContent = 'To optimize the listening experience for your time zone, please tell Alexa your five digit ZIP code.';
                this.response.cardRenderer(cardTitle, cardContent, null);

                this.handler.state = constants.states.GET_ZIP;
                this.response.speak(message).listen(reprompt);
                this.emit(':responseReady');
            } else {
                var message = 'You\'re listening to Refnet Christian Radio.';

                var podcast = audioData.filter(function(item){ return item.utc == this.attributes['utc']; }.bind(this))[0];
                var cardTitle = 'You\'re listening to RefNet';
                var cardContent = 'Now playing ' + podcast.title;
                var cardImage = {
                    'smallImageUrl': 'https://s3.us-east-2.amazonaws.com/ligonier-audio-app/720x480_RefNet.png',
                    'largeImageUrl': 'https://s3.us-east-2.amazonaws.com/ligonier-audio-app/1200x800_RefNet.png'
                };

                this.response.cardRenderer(cardTitle, cardContent, cardImage);

                this.response.speak(message);
                controller.play.call(this);
            }
        },
        'PlayAudio' : function () {
            // Initialize Attributes.
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['loop'] = true;
            this.attributes['shuffle'] = false;
            this.attributes['playbackIndexChanged'] = true;
            delete this.attributes.confirm_zipcode;

            //  Change state to START_MODE
            this.handler.state = constants.states.START_MODE;

            // Initialize timezone if undefined
            if (!this.attributes['zipcode']) {
                var message = 'Welcome to Refnet Christian Radio. To optimize the listening experience for your time zone, please state your five digit zipcode.';
                var reprompt = 'Please state your five digit zipcode, or say, Pass, to optimize later.';
                if (canThrowCard.call(this)) {
                    var cardTitle = 'Welcome to RefNet';
                    var cardContent = 'To optimize the listening experience for your time zone, please tell Alexa your five digit ZIP code.';
                    this.response.cardRenderer(cardTitle, cardContent, null);
                }
                this.handler.state = constants.states.GET_ZIP
                this.response.speak(message).listen(reprompt);
                this.emit(':responseReady');
            } else {
                var message = 'You\'re listening to Refnet Christian Radio.';
                if (canThrowCard.call(this)) {
                    var podcast = audioData.filter(function(item){ return item.utc == this.attributes['utc']; }.bind(this))[0];
                    var cardTitle = 'You\'re listening to RefNet';
                    var cardContent = 'Now playing ' + podcast.title;
                    var cardImage = {
                        'smallImageUrl': 'https://s3.us-east-2.amazonaws.com/ligonier-audio-app/720x480_RefNet.png',
                        'largeImageUrl': 'https://s3.us-east-2.amazonaws.com/ligonier-audio-app/1200x800_RefNet.png'
                    };

                    this.response.cardRenderer(cardTitle, cardContent, cardImage);
                }

                this.response.speak(message);
                controller.play.call(this);
            }
        },
        'AMAZON.LoopOffIntent' : function () {
            var message = 'Sorry, I cannot loop a live stream.';
            this.response.speak(message);
            controller.play.call(this);
        },
        'AMAZON.LoopOnIntent' : function () {
            var message = 'Sorry, I cannot loop a live stream.';
            this.response.speak(message);
            controller.play.call(this);
        },
        'AMAZON.NextIntent' : function () {
            var message = 'Sorry, I cannot skip ahead on a live stream.';
            this.response.speak(message);
            controller.play.call(this);
        },
        'AMAZON.PreviousIntent' : function () {
            var message = 'Sorry, I cannot rewind a live stream.';
            this.response.speak(message);
            controller.play.call(this);
        },
        'AMAZON.RepeatIntent' : function () {
            var message = 'Sorry, I cannot repeat a live stream.';
            this.response.speak(message);
            controller.play.call(this);
        },
        'AMAZON.ShuffleOffIntent' : function () {
            var message = 'Sorry, I cannot shuffle a live stream.';
            this.response.speak(message);
            controller.play.call(this);
        },
        'AMAZON.ShuffleOnIntent' : function () {
            var message = 'Sorry, I cannot shuffle a live stream.';
            this.response.speak(message);
            controller.play.call(this);
        },
        'AMAZON.StartOverIntent' : function () {
            var message = 'Sorry, I cannot restart a live stream.';
            this.response.speak(message);
            controller.play.call(this);
        },
        'AMAZON.PauseIntent' : function () { controller.stop.call(this); },
        'AMAZON.StopIntent' : function () { controller.stop.call(this); },
        'AMAZON.CancelIntent' : function () { controller.stop.call(this); },
        'AMAZON.ResumeIntent' : function () { controller.play.call(this); },
        'AMAZON.HelpIntent' : function () {
            // This will called while audio is playing and a user says "ask <invocation_name> for help"
            var message = 'Ref Net is twenty-four hour internet radio featuring biblical preaching and teaching. You can say things like, "play ref net", to start listening, or, "change my zip code", to optimize the listening experience for your timezone. See your Alexa app for more information. How can I help you?.';
            var reprompt = 'How can I help you?'
            if (canThrowCard.call(this)) {
                var cardTitle = 'Help with RefNet';
                var cardContent = 'Here are some things you can do:\nTo play RefNet, say "Alexa, play RefNet"\n To stop RefNet, say "Alexa, stop"\n To optimize the listening experience for your time zone, say "Alexa, ask RefNet to change my ZIP code" \n To see what is playing in your region, just visit listen.refnet.fm in any Internet browser.';
                this.response.cardRenderer(cardTitle, cardContent, null);
            }

            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'SetZip': function() {
            var message = 'To optimize the listening experience for your time zone, please state your five digit zipcode.';
            var reprompt = 'Please state your five digit zipcode, or say, Pass, to optimize later.';
            if (canThrowCard.call(this) && !this.attributes['zipcode']) {
                var cardTitle = 'Welcome to RefNet';
                var cardContent = 'To optimize the listening experience for your time zone, please tell Alexa your five digit ZIP code.';
                this.response.cardRenderer(cardTitle, cardContent, null);
            }
            this.handler.state = constants.states.GET_ZIP;
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'SessionEndedRequest' : function () {
            // No session ended logic
        },
        'Unhandled' : function () {
            var message = 'I\'m not quite sure how to help you with that. You can say Alexa, ask Refnet for help, to learn more.';
            this.response.speak(message);
            controller.play.call(this);
        }
    }),
    remoteControllerHandlers : Alexa.CreateStateHandler(constants.states.PLAY_MODE, {
        /*
         *  All Requests are received using a Remote Control. Calling corresponding handlers for each of them.
         */
        'PlayCommandIssued' : function () { controller.play.call(this) },
        'PauseCommandIssued' : function () { controller.stop.call(this) },
        'NextCommandIssued' : function () {
            var message = 'Sorry, but this command is not supported.';
            this.response.speak(message);
            controller.play.call(this);
        },
        'PreviousCommandIssued' : function () {
            var message = 'Sorry, but this command is not supported.';
            this.response.speak(message);
            controller.play.call(this);
        },
        'Unhandled' : function () {
            var message = 'I\'m not quite sure how to help you with that. You can say Alexa, ask Refnet for help, to learn more.';
            this.response.speak(message);
            controller.play.call(this);
        }
    }),
    getZipIntentHandlers : Alexa.CreateStateHandler(constants.states.GET_ZIP, {
        /*
         *  All Intent Handlers for state : GET_ZIP
         */
        'LaunchRequest' : function () {
            // Initialize Attributes
            // How did you start here? Alexa crash?
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['loop'] = true;
            this.attributes['shuffle'] = false;
            this.attributes['playbackIndexChanged'] = true;
            delete this.attributes.confirm_zipcode;

            // Initialize zipcode undefined
            if (!this.attributes['zipcode']) {
                var message = 'Welcome to Refnet Christian Radio. To optimize the listening experience for your time zone, please state your five digit zipcode.';
                var reprompt = 'Please state your five digit zipcode, or say, Pass, to optimize later.';
                if (canThrowCard.call(this)) {
                    var cardTitle = 'Welcome to RefNet';
                    var cardContent = 'To optimize the listening experience for your time zone, please tell Alexa your five digit ZIP code.';
                    this.response.cardRenderer(cardTitle, cardContent, null);
                }
                this.handler.state = constants.states.GET_ZIP;
                this.response.speak(message).listen(reprompt);
                this.emit(':responseReady');
            } else {
                var message = 'You\'re listening to RefNet Christian Radio.';
                if (canThrowCard.call(this)) {
                    var podcast = audioData.filter(function(item){ return item.utc == this.attributes['utc']; }.bind(this))[0];
                    var cardTitle = 'You\'re listening to RefNet';
                    var cardContent = 'Now playing ' + podcast.title;
                    var cardImage = {
                        'smallImageUrl': 'https://s3.us-east-2.amazonaws.com/ligonier-audio-app/720x480_RefNet.png',
                        'largeImageUrl': 'https://s3.us-east-2.amazonaws.com/ligonier-audio-app/1200x800_RefNet.png'
                    };

                    this.response.cardRenderer(cardTitle, cardContent, cardImage);
                }
                this.handler.state = constants.states.START_MODE;
                this.response.speak(message);
                controller.play.call(this);
            }
        },
        'PlayAudio' : function () {
            // Initialize Attributes
            // How did you start here? Alexa crash?
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['loop'] = true;
            this.attributes['shuffle'] = false;
            this.attributes['playbackIndexChanged'] = true;
            delete this.attributes.confirm_zipcode;

            // Initialize zipcode undefined
            if (!this.attributes['zipcode']) {
                var message = 'Welcome to Refnet Christian Radio. To optimize the listening experience for your time zone, please state your five digit zipcode.';
                var reprompt = 'Please state your five digit zipcode, or say, Pass, to optimize later.';
                if (canThrowCard.call(this)) {
                    var cardTitle = 'Welcome to RefNet';
                    var cardContent = 'To optimize the listening experience for your time zone, please tell Alexa your five digit ZIP code.';
                    this.response.cardRenderer(cardTitle, cardContent, null);
                }
                this.handler.state = constants.states.GET_ZIP;
                this.response.speak(message).listen(reprompt);
                this.emit(':responseReady');
            } else {
                var message = 'You\'re listening to RefNet Christian Radio.';
                if (canThrowCard.call(this)) {
                    var podcast = audioData.filter(function(item){ return item.utc == this.attributes['utc']; }.bind(this))[0];
                    var cardTitle = 'You\'re listening to RefNet';
                    var cardContent = 'Now playing ' + podcast.title;
                    var cardImage = {
                        'smallImageUrl': 'https://s3.us-east-2.amazonaws.com/ligonier-audio-app/720x480_RefNet.png',
                        'largeImageUrl': 'https://s3.us-east-2.amazonaws.com/ligonier-audio-app/1200x800_RefNet.png'
                    };

                    this.response.cardRenderer(cardTitle, cardContent, cardImage);
                }
                this.handler.state = constants.states.START_MODE;
                this.response.speak(message);
                controller.play.call(this);
            }
        },
        'AMAZON.ResumeIntent' : function () {
            // Initialize Attributes
            // How did you start here? Alexa crash?
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['loop'] = true;
            this.attributes['shuffle'] = false;
            this.attributes['playbackIndexChanged'] = true;

            // Initialize zipcode undefined
            if (!this.attributes['zipcode']) {
                var message = 'Welcome to RefNet Christian Radio. To optimize the listening experience for your time zone, please state your five digit zipcode.';
                var reprompt = 'Please state your five digit zipcode, or say, Pass, to optimize later.';
                if (canThrowCard.call(this)) {
                    var cardTitle = 'Welcome to RefNet';
                    var cardContent = 'To optimize the listening experience for your time zone, please tell Alexa your five digit ZIP code.';
                    this.response.cardRenderer(cardTitle, cardContent, null);
                }
                this.handler.state = constants.states.GET_ZIP;
                this.response.speak(message).listen(reprompt);
                this.emit(':responseReady');
            } else {
                var message = 'You\'re listening to RefNet Christian Radio.';
                if (canThrowCard.call(this)) {
                    var podcast = audioData.filter(function(item){ return item.utc == this.attributes['utc']; }.bind(this))[0];
                    var cardTitle = 'Welcome to RefNet';
                    var cardContent = 'Now playing ' + podcast.title;
                    var cardImage = {
                        'smallImageUrl': 'https://s3.us-east-2.amazonaws.com/ligonier-audio-app/720x480_RefNet.png',
                        'largeImageUrl': 'https://s3.us-east-2.amazonaws.com/ligonier-audio-app/1200x800_RefNet.png'
                    };

                    this.response.cardRenderer(cardTitle, cardContent, cardImage);
                }
                this.handler.state = constants.states.START_MODE;
                this.response.speak(message);
                controller.play.call(this);
            }
        },
        'SetZip': function() {
            var message = 'To optimize the listening experience for your time zone, please state your five digit zipcode.';
            var reprompt = 'Please state your five digit zipcode, or say, Pass, to optimize later.';
            if (canThrowCard.call(this) && !this.attributes['zipcode']) {
                var cardTitle = 'Welcome to RefNet';
                var cardContent = 'To optimize the listening experience for your time zone, please tell Alexa your five digit ZIP code.';
                this.response.cardRenderer(cardTitle, cardContent, null);
            }
            this.handler.state = constants.states.GET_ZIP;
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'GetZip' : function () {
            // Check that this is a 5 digit zip.

            var test_zip = this.event.request.intent.slots.zipcode.value;
            test_zip = test_zip.replace(",", "");

            /*
            var cardTitle = 'Zipcode Confirmation';
            var cardContent = 'I heard you say... ' + test_zip + "\n Test_ZIP Bool - Len == 5: " + (test_zip.length == 5);
            this.response.cardRenderer(cardTitle, cardContent, null);
            */

            if (test_zip.length == 5) {
                this.attributes.confirm_zipcode = test_zip;
                var message = 'I heard <say-as interpret-as="digits">' + this.attributes.confirm_zipcode + '</say-as>. Is this correct?';
            } else {
                var message = 'I didn\'t detect a five digit zipcode. Please state your five digit zipcode, or say, Pass, to optimize later.';
            }

            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        },
        'AMAZON.YesIntent' : function() {
            // User has confirmed that their entry is correct.
            if (this.attributes.confirm_zipcode) {
                var request_string = 'https://www.zipcodeapi.com/rest/' + constants.zipKey + '/info.json/' + this.attributes.confirm_zipcode + '/degrees';

                request(request_string, function(error, response, body) {
                    var proc_body = JSON.parse(body);

                    if (proc_body.hasOwnProperty('error_code')){
                        var message = 'That doesn\'t appear to be a valid zip code. Please state a valid five-digit zip code, or say, Pass, to optimize later.';
                        if (canThrowCard.call(this)) {
                            var podcast = audioData.filter(function(item){ return item.utc == this.attributes['utc']; }.bind(this))[0];
                            var cardTitle = 'Optimization Error';
                            var cardContent = 'An error occurred while trying to validate your ZIP code. The system returned the following error:\n\n' + proc_body.error_msg + '\n\nIf you continue to have issues, please contact feedback@refnet.fm with this information.';

                            this.response.cardRenderer(cardTitle, cardContent, null);
                        }
                        this.response.speak(message).listen(message);
                        this.emit(':responseReady');
                    } else {
                        this.attributes.utc = proc_body.timezone.utc_offset_sec / 3600;
                        this.attributes.zipcode = this.attributes.confirm_zipcode; // Assign here in case of bad input
                        var message = 'Thank you. Your experience has been optimized for your time zone. You\'re listening to Refnet Christian Radio.';
                        if (canThrowCard.call(this)) {
                            var podcast = audioData.filter(function(item){ return item.utc == this.attributes['utc']; }.bind(this))[0];
                            var cardTitle = 'You\'re listening to RefNet';
                            var cardContent = 'Now playing ' + podcast.title;
                            var cardImage = {
                                'smallImageUrl': 'https://s3.us-east-2.amazonaws.com/ligonier-audio-app/720x480_RefNet.png',
                                'largeImageUrl': 'https://s3.us-east-2.amazonaws.com/ligonier-audio-app/1200x800_RefNet.png'
                            };

                            this.response.cardRenderer(cardTitle, cardContent, cardImage);
                        }
                        this.handler.state = constants.states.START_MODE;
                        delete this.attributes.confirm_zipcode;
                        this.response.speak(message);
                        controller.play.call(this);
                    }
                }.bind(this));
            } else {
                var message = 'No zipcode provided. Please state your five digit zipcode.';
                this.response.speak(message).listen(message);
                this.emit(':responseReady');
            }
        },
        'AMAZON.NoIntent': function () {
            if (this.attributes.confirm_zipcode) {
                var cardTitle = 'Zipcode Confirmation';
                var cardContent = 'I heard you say...' + this.attributes.confirm_zipcode;
                this.response.cardRenderer(cardTitle, cardContent, null);
                var message = 'Please restate your five digit zipcode or say, Pass, to optimize later.';
            } else {
                var message = 'No zipcode provided. Please state your five digit zipcode or say, Pass, to optimize later.';
            }
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        },
        'AMAZON.HelpIntent' : function () {
            // This will called while audio is playing and a user says "ask <invocation_name> for help"
            var message = 'The ref net christian radio skill requests your zipcode in order to optimize the listening experience for your timezone. For information about how to see what is currently playing in your timezone, see the Alexa app. Please state your five-digit zipcode, or say, Pass, to optimize later.';
            var reprompt = "Please state your five digit zipcode or say, Pass, to optimize later.";

            if (canThrowCard.call(this)) {

                var cardTitle = 'Help with Optimization';
                var cardContent ='RefNet uses your ZIP code to optimize the listening experience for your timezone.\n To see what is playing in your time zone, simply visit listen.refnet.fm in any internet browser.\n You can optimize your listening experience at any time by saying, Alexa, ask RefNet to change my ZIP code.';
                this.response.cardRenderer(cardTitle, cardContent, null);
            }

            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'PassIntent': function(){
            var message = 'Skipping optimization. You\'re listening to Refnet Christian Radio.';
            this.handler.state = constants.states.START_MODE;
            delete this.attributes.confirm_zipcode;
            if (!this.attributes.zipcode) {
                this.attributes.utc = -5;
            }
            if (canThrowCard.call(this)) {
                var cardTitle = 'Optimization Skipped';
                var cardContent = 'When you\'re ready to optimize the listening experience for your time zone, just say "Alexa, ask RefNet to change my ZIP code".';
                this.response.cardRenderer(cardTitle, cardContent, null);
            }

            this.response.speak(message);
            controller.play.call(this);
        },
        'AMAZON.StopIntent' : function () {
            this.handler.state = constants.states.START_MODE;
            controller.stop.call(this);
        },
        'AMAZON.CancelIntent' : function () {
            this.handler.state = constants.states.START_MODE;
            controller.stop.call(this);
        },
        'AMAZON.LoopOffIntent' : function () {
            var message = 'Sorry, I cannot loop a live stream. Please state your five digit zipcode.';
            var reprompt = 'Please state your five digit zipcode.';
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'AMAZON.LoopOnIntent' : function () {
            var message = 'Sorry, I cannot loop a live stream. Please state your five digit zipcode.';
            var reprompt = 'Please state your five digit zipcode.';
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'AMAZON.NextIntent' : function () {
            var message = 'Sorry, I cannot skip ahead on a live stream. Please state your five digit zipcode.';
            var reprompt = 'Please state your five digit zipcode.';
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'AMAZON.PreviousIntent' : function () {
            var message = 'Sorry, I cannot rewind a live stream. Please state your five digit zipcode.';
            var reprompt = 'Please state your five digit zipcode.';
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'AMAZON.RepeatIntent' : function () {
            var message = 'Sorry, I cannot repeat a live stream. Please state your five digit zipcode.';
            var reprompt = 'Please state your five digit zipcode.';
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'AMAZON.ShuffleOffIntent' : function () {
            var message = 'Sorry, I cannot shuffle a live stream. Please state your five digit zipcode.';
            var reprompt = 'Please state your five digit zipcode.';
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');

        },
        'AMAZON.ShuffleOnIntent' : function () {
            var message = 'Sorry, I cannot shuffle a live stream. Please state your five digit zipcode.';
            var reprompt = 'Please state your five digit zipcode.';
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'AMAZON.StartOverIntent' : function () {
            var message = 'Sorry, I cannot restart a live stream. Please state your five digit zipcode.';
            var reprompt = 'Please state your five digit zipcode.';
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'SessionEndedRequest' : function () {
            // No session ended logic
        },
        'Unhandled' : function () {
            var message = 'Sorry, I could not understand. Please state your five digit zipcode.';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        }
    }),

};

module.exports = stateHandlers;

var controller = function () {
    return {
        play: function () {
            /*
             *  Using the function to begin playing audio when:
             *      Play Audio intent invoked.
             *      Resuming audio when stopped/paused.
             *      Next/Previous commands issued.
             */
            this.handler.state = constants.states.PLAY_MODE;

            if (this.attributes['playbackFinished']) {
                // Reset to top of the playlist when reached end.
                this.attributes['playbackIndexChanged'] = true;
                this.attributes['playbackFinished'] = false;
            }

            var token = String(this.attributes['utc']);
            var playBehavior = 'REPLACE_ALL';
            var podcast = audioData.filter(function(item){ return item.utc == this.attributes['utc']; }.bind(this))[0];
            var offsetInMilliseconds = 0;
            // Since play behavior is REPLACE_ALL, enqueuedToken attribute need to be set to null.
            this.attributes['enqueuedToken'] = null;

            /*
             *if (canThrowCard.call(this)) {
             *   var cardTitle = 'Playing ' + podcast.title;
             *   var cardContent = 'Playing ' + podcast.title;
             *   this.response.cardRenderer(cardTitle, cardContent, null);
             *}
             */
            this.response.audioPlayerPlay(playBehavior, podcast.url, token, null, offsetInMilliseconds);
            this.emit(':responseReady');
        },
        stop: function () {
            /*
             *  Issuing AudioPlayer.Stop directive to stop the audio.
             *  Attributes already stored when AudioPlayer.Stopped request received.
             */
            this.response.audioPlayerStop();
            this.emit(':responseReady');
        },
        startOver: function () {
            // Start over the current audio file.
            this.attributes['offsetInMilliseconds'] = 0;
            controller.play.call(this);
        },
        reset: function () {
            // Reset to top of the playlist.
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['playbackIndexChanged'] = true;
            controller.play.call(this);
        }
    }
}();

function canThrowCard() {
    /*
     * To determine when can a card should be inserted in the response.
     * In response to a PlaybackController Request (remote control events) we cannot issue a card,
     * Thus adding restriction of request type being "IntentRequest".
     */
    if (this.event.request.type === 'IntentRequest') {
        return true;
    } else {
        return false;
    }
}
