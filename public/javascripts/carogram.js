var WIDTH_BOUNDARY = 1460;

var BACK_LEFT_DEFAULT = 40;
var FORWARD_LEFT_DEFAULT = 1020;
var FORWARD_RIGHT_DEFAULT = 40;
var PHOTO_LEFT_BOUNDARY = 480;

var KEYCODE_LEFT_ARROW = 37;
var KEYCODE_RIGHT_ARROW = 39;

var PHOTO_PLACEHOLDER = '/images/placeholder.png';

var igSelfFeed = null;
var igActiveIndex = 0;

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
  
  // Resize events
  $(window).resize(function(e) {
    adjustLayout();
  });
  
  // Right arrow events
  $(document).bind('keydown', function(e) {
    switch(e.which) {
      case KEYCODE_LEFT_ARROW:
        e.preventDefault();
        previousPhoto();
        break;
      case KEYCODE_RIGHT_ARROW:
        e.preventDefault();
        nextPhoto();
        break;
    }
  });
  
  $.get('https://api.instagram.com/v1/users/self/feed', { 'access_token': IG._session.access_token, 'callback': 'handleFeed' }, function(data) {
    //var json = $.parseJSON(data);
    //console.log(json);
  }, 'script');
});

function handleFeed(feed) {
  igSelfFeed = feed;
  
  console.log(igSelfFeed.data.length);
  
  // Preload feed photos
  var images = _.map(igSelfFeed.data, function(value, key, list) {
    return value.images.standard_resolution.url;
  });
  preload(images);
  
  // Set main photo
  var first = igSelfFeed.data[0];
  var firstURL = first.images.standard_resolution.url;
  setMainPhoto(firstURL);
  
  // Set right photo
  var second = igSelfFeed.data[1];
  var secondURL = second.images.standard_resolution.url;
  setRightPhoto(secondURL);
}

function nextPhoto() {
  igActiveIndex++;
  console.log('next: ' + igActiveIndex);
  
  // Check if additional feed data is needed
  if (igActiveIndex == (igSelfFeed.data.length - 1)) {
    // paging required for more photos
    console.log('page photos');
  }
  
  swapNext();

  // $('#wrapper').animate({
  //   opacity: 0.25,
  //   marginLeft: 0
  // }, 1500);
}

function previousPhoto() {
  // Cannot move past the first image
  if (igActiveIndex == 0) {
    return;
  }
  
  igActiveIndex--;
  console.log('prev: ' + igActiveIndex);
  
  swapPrevious();
  
  // $('#wrapper').animate({
  //   opacity: 0.25,
  //   marginRight: 0
  // }, 1500);
}

function getMainPhoto() {
  return $('#photo > img').attr('src');
}

function setMainPhoto(url) {
  $('#photo > img').attr('src', url);
}

function setLeftPhoto(url) {
  $('#back-image > img').attr('src', url);
}

function getLeftPhoto() {
  return $('#back-image > img').attr('src');
}

function setRightPhoto(url) {
  $('#forward-image > img').attr('src', url);
}

function getRightPhoto() {
  return $('#forward-image > img').attr('src');
}

function swapNext() {
  // Left photo
  setLeftPhoto( getMainPhoto() );
  
  // Main photo
  setMainPhoto( getRightPhoto() );
  
  // Right photo
  var right = igSelfFeed.data[igActiveIndex+1];
  setRightPhoto(right.images.standard_resolution.url);
}

function swapPrevious() {
  // Right photo
  setRightPhoto( getMainPhoto() );
  
  // Main photo
  setMainPhoto( getLeftPhoto() );
  
  // Left photo
  if (igActiveIndex == 0) {
    // Placeholder
    setLeftPhoto(PHOTO_PLACEHOLDER);
  } else {
    // Photo
    var left = igSelfFeed.data[igActiveIndex-1];
    setLeftPhoto(left.images.standard_resolution.url);
  }
}

function preload(arrayOfImages) {
  $(arrayOfImages).each(function(){
    $('<img/>')[0].src = this;
    // Alternatively you could use:
    // (new Image()).src = this;
  });
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