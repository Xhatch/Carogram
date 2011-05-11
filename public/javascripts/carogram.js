var WIDTH_BOUNDARY = 1460;

var BACK_LEFT_DEFAULT = 40;
var FORWARD_LEFT_DEFAULT = 1020;
var FORWARD_RIGHT_DEFAULT = 40;

var PHOTO_LEFT_BOUNDARY = 480;

$(document).ready(function() {
  // Initial layout adjustment
  adjustLayout();
  
  // Setup Instagram
  IG.init({
    client_id: '104378f7c76843c78ea0e83339bb9054',
    check_status: true, // check and load active session
    cookie: true // persist a session via cookie
  });
  
  // Check if user is authenticated
  if (!IG._session) {
    // Redirect to login
    window.location.pathname = '/login.html';
    return;
  }
  
  console.log('made it. must be authenticated');
  
  $(window).resize(function(e) {
    adjustLayout();
  });
  
  /*
  $.get('https://api.instagram.com/v1/users/self/feed', { 'access_token': IG._session.access_token, 'callback': 'handleFeed' }, function(data) {
    //var json = $.parseJSON(data);
    //console.log(json);
  }, 'script');
  */
});

function handleFeed(feed) {
  console.log(feed.data.length);
}

function adjustLayout() {
  var width = $(window).width();
  
  //console.log('resize, window.width: ' + width);
  
  if (width >= WIDTH_BOUNDARY) {
    // Adjust back/forward images to the right
    var backSplit = (PHOTO_LEFT_BOUNDARY - BACK_LEFT_DEFAULT);
    var fwdSplit = (PHOTO_LEFT_BOUNDARY - FORWARD_LEFT_DEFAULT);
    var pLeft = $('#photo').position().left;
    
    var backDiff = (pLeft - backSplit);
    $('#back-image').css('left', backDiff);
    
    var fwdDiff = (pLeft - fwdSplit);
    $('#forward-image').css('left', fwdDiff);
  } else {
    // Remove left position for forward image
    $('#forward-image').css('left', '');
    
    // Ensure default position
    $('#back-image').css('left', BACK_LEFT_DEFAULT);
    $('#forward-image').css('right', FORWARD_RIGHT_DEFAULT);
  }
}