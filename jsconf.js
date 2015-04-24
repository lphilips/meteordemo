var Messages = new Meteor.Collection('messages');
var Tweets   = new Meteor.Collection('tweets');

if (Meteor.isClient) {
  
  Template.messages.helpers({
    messages: function () {
      return Messages.find({}, {sort: {time: -1}});
    }
  });

  Template.tweets.helpers({
        tweets: function () {
      return Tweets.find({}, {sort: {time: -1}});
    }
  })

  Template.messages.events = {
    'keydown input#message' : function (event, template) {
      var username, message;
      if (event.which == 13) {
        if (Meteor.user())
          username = Meteor.user().emails[0].address;
        else
          username = 'Anonymous';
        message = template.find("#message");
        Messages.insert({
          name    : username,
          message : message.value,
          time    : Date.now() 
        });
        message.value = '';
      }
    }
  }
}

if (Meteor.isServer) {

  var getTweets = function (callback) {
    var stream = Twit.get('search/tweets', 
    {
      q     : '#jsconfbe',
      count : 100
    }, function (err, res) {
      callback(err, res)
    })
  }

  var addTweets = function (tweets) {
    _.each(tweets.statuses, function (tweet) {
      Tweets.insert({
        message : tweet.text,
        time    : tweet.created_at,
        user    : tweet.user.name
      })
    })
  }

  Meteor.startup(function () {
    var startTwit = Meteor.wrapAsync(getTweets);
    try {
      var data =  startTwit();
      addTweets(data);
    } 
    catch (error) {
      console.log(error)
    }
  })

}
