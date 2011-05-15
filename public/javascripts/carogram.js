var WIDTH_BOUNDARY = 1460;

var BACK_LEFT_DEFAULT = 40;
var FORWARD_LEFT_DEFAULT = 1020;
var FORWARD_RIGHT_DEFAULT = 40;
var PHOTO_LEFT_BOUNDARY = 480;

var KEYCODE_LEFT_ARROW = 37;
var KEYCODE_RIGHT_ARROW = 39;

var PHOTO_PLACEHOLDER = '/images/placeholder.png';

var igSelfFeedData = [];
var igPaginationURL = null;
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
  igSelfFeedData = igSelfFeedData.concat(feed.data);
  igPaginationURL = feed.pagination.next_url;
  
  console.log(igSelfFeedData.length);
  
  // Preload NEW (feed.data) feed photos
  var images = _.map(feed.data, function(value, key, list) {
    return value.images.standard_resolution.url;
  });
  preload(images);
  
  // Initial load?
  if (igActiveIndex == 0) {
    // Set main photo & associated data (likes, comments, etc)
    var first = igSelfFeedData[0];
    var firstURL = first.images.standard_resolution.url;
    setMainPhoto(firstURL);
    setMainData();

    // Set right photo
    var second = igSelfFeedData[1];
    var secondURL = second.images.standard_resolution.url;
    setRightPhoto(secondURL);
  }
}

function nextPhoto() {
  igActiveIndex++;
  console.log('next: ' + igActiveIndex);
  
  // Check if additional feed data is needed (page early)
  if (igActiveIndex == (igSelfFeedData.length - 5)) {
    // paging required for more photos
    console.log('page photos');
    $.get(igPaginationURL, {}, function(data) {}, 'script');
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
  setMainData();
  
  // Right photo
  var right = igSelfFeedData[igActiveIndex+1];
  setRightPhoto(right.images.standard_resolution.url);
}

function swapPrevious() {
  // Right photo
  setRightPhoto( getMainPhoto() );
  
  // Main photo
  setMainPhoto( getLeftPhoto() );
  setMainData();
  
  // Left photo
  if (igActiveIndex == 0) {
    // Placeholder
    setLeftPhoto(PHOTO_PLACEHOLDER);
  } else {
    // Photo
    var left = igSelfFeedData[igActiveIndex-1];
    setLeftPhoto(left.images.standard_resolution.url);
  }
}

function setMainData() {
  var entry = igSelfFeedData[igActiveIndex];
  
  updateLikesCount( getLikesCount(entry) );
  updateAuthorUsername( '@'+getAuthorUsername(entry) );
  updateAuthorPicture( getAuthorPicture(entry) );
  updateCaption( getCaption(entry) );
  updateComments( getComments(entry) );
}

// - Interface Updating -//

function updateAuthorUsername(username) {
  $('#post-username').html(username);
}

function updateAuthorPicture(url) {
  $('#avatar > img').attr('src', url);
}

function updateLikesCount(count) {
  $('#likes-count').html(count);
}

function updateCaption(caption) {
  $('#post-caption').html(caption);
}

function updateComments(comments) {
  // Clear old
  $('#comments li').remove();
  
  // Populate new
  $.each(comments, function(index, value) {
    var comment = $('#comment-template').clone();
    comment.find('.author').html('@'+value.from.username);
    comment.find('#comment-user img').attr('src', value.from.profile_picture);
    comment.find('.comment-text').html(value.text);
    comment.appendTo('#comments > ul');
    comment.show();
  });
}

// - Entry Parsing - //

function getAuthorUsername(entry) {
  return entry.user.username;
}

function getAuthorPicture(entry) {
  return entry.user.profile_picture;
}

function getLikesCount(entry) {
  return entry.likes.count;
}

function getCaption(entry) {
  return entry.caption ? entry.caption.text : '';
}

function getComments(entry) {
  return entry.comments.data;
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