var WIDTH_BOUNDARY = 1460;

var BACK_LEFT_DEFAULT = 40;
var FORWARD_LEFT_DEFAULT = 1020;
var FORWARD_RIGHT_DEFAULT = 40;
var PHOTO_LEFT_BOUNDARY = 480;

var KEYCODE_LEFT_ARROW = 37;
var KEYCODE_RIGHT_ARROW = 39;
var KEYCODE_C = 67;
var KEYCODE_J = 74;
var KEYCODE_K = 75;
var KEYCODE_L = 76;

var PHOTO_PLACEHOLDER = '/images/placeholder.png';

var ANIMATION_DURATION = 300;

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
    window.location.pathname = '/login';
    return;
  }
  
  console.log('made it. must be authenticated');
  
  // Resize events
  $(window).resize(function(e) {
    adjustLayout();
  });
  
  // Keyboard events within the comment box
  $('input#leavecomment').bind('keydown', function(e){
    switch(e.which) {
      case KEYCODE_LEFT_ARROW:
      case KEYCODE_RIGHT_ARROW:
      case KEYCODE_C:
      case KEYCODE_J:
      case KEYCODE_K:
      case KEYCODE_L:
        e.stopPropagation();
        break;
    }    
  });
  
  // Keyboard events
  $(document).bind('keydown', function(e) {
    switch(e.which) {
      case KEYCODE_LEFT_ARROW:
      case KEYCODE_J:
        e.preventDefault();
        previousPhoto();
        break;
      case KEYCODE_RIGHT_ARROW:
      case KEYCODE_K:
        e.preventDefault();
        nextPhoto();
        break;
      case KEYCODE_C:
        e.preventDefault();
        focusComment();
        break;
      case KEYCODE_L:
        e.preventDefault();
        toggleLike();
        break;
    }
  });
  
  // Comment submission events
  $('#submit-button').bind('click', function(e) {
    e.preventDefault();
    
    // Validate comment text
    var text = getCommentText();
    if (text.length == 0) {
      return; // no comment
    }
    
    var entry = getActiveEntry();
    comment(getMediaId(entry), text);
  });
  
  // Like/unlike events
  $('#likes > img').bind('click', function(e) {
    toggleLike();
  });
  
  // Reload events
  $('#reload > button.submit').bind('click', function(e) {
    resetSelfFeed();
    getSelfFeed();
  });
  
  getSelfFeed();
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
  
  // Do not swap if no more photos are in queue. Either due to end of stream
  //  or slow paging from IG.
  if (igActiveIndex >= igSelfFeedData.length - 1) {
    console.log('no more photos');
    return;
  }
  
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
  var entry = getActiveEntry();
  
  updateLikesCount( getLikesCount(entry) );
  updateLikeStatus( getHasLiked(entry) );
  updateAuthorUsername( '@'+getAuthorUsername(entry) );
  updateAuthorPicture( getAuthorPicture(entry) );
  updateCaption( getCaption(entry) );
  updateComments( getComments(entry) );
}

function getActiveEntry() {
  return igSelfFeedData[igActiveIndex];
}

function getCommentText() {
  return $.trim( $('#leavecomment').val() );
}

function toggleLike() {
  var entry = getActiveEntry();
  var isLiked = getHasLiked(entry);
  if (isLiked) {
    unlike( getMediaId(entry) );
  } else {
    like( getMediaId(entry) );
  }
}

function focusComment() {
  //window.location.hash = "tehcomments";
  $('input#leavecomment').focus();
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

function updateLikeStatus(isLiked) {
  var likeSrc = isLiked ? '/images/like_liked.png' : '/images/like.png';
  $('#likes > img').attr('src', likeSrc);
  
  $('#likes > img').hover(
    function() {
      // Over
      $(this).attr('src', isLiked ? '/images/like_liked.png' : '/images/like_hover.png');
    },
    function() {
      // Out
      $(this).attr('src', likeSrc);
    }
  );
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

function getMediaId(entry) {
  return entry.id;
}

function getAuthorUsername(entry) {
  return entry.user.username;
}

function getAuthorPicture(entry) {
  return entry.user.profile_picture;
}

function getLikesCount(entry) {
  return entry.likes.count;
}

function incLikesCount(entry) {
  entry.likes.count += 1;
}

function decLikesCount(entry) {
  entry.likes.count -= 1;
}

function getHasLiked(entry) {
  return entry.user_has_liked;
}

function setHasLiked(entry, value) {
  entry.user_has_liked = value;
}

function getCaption(entry) {
  return entry.caption ? entry.caption.text : '';
}

function getComments(entry) {
  return entry.comments.data;
}

function resetSelfFeed() {
  igSelfFeedData = [];
  igPaginationURL = null;
  igActiveIndex = 0;
  
  setLeftPhoto(PHOTO_PLACEHOLDER);
  setMainPhoto(PHOTO_PLACEHOLDER);
  setRightPhoto(PHOTO_PLACEHOLDER);
}

// - Preloader - //

function preload(arrayOfImages) {
  $(arrayOfImages).each(function(){
    $('<img/>')[0].src = this;
    // Alternatively you could use:
    // (new Image()).src = this;
  });
}

// - API Requests - //

function getSelfFeed() {
  $.get('https://api.instagram.com/v1/users/self/feed', { 'access_token': IG._session.access_token, 'callback': 'handleFeed' }, function(data) {}, 'script');
}

function like(mediaId) {
  $.ajax({
    type: 'POST',
    url: '/media/'+mediaId+'/likes',
    data: { 'access_token': IG._session.access_token },
    success: function(data) {
      // Update like status
      var entry = getActiveEntry();
      setHasLiked(entry, true);
      updateLikeStatus(true);
      
      // Update likes count
      incLikesCount(entry);
      updateLikesCount( getLikesCount(entry) );
    }
  });
}

function unlike(mediaId) {
  $.ajax({
    type: 'DELETE',
    url: '/media/'+mediaId+'/likes',
    data: { 'access_token': IG._session.access_token },
    success: function(data) {
      // Update like status
      var entry = getActiveEntry();
      setHasLiked(entry, false);
      updateLikeStatus(false);
      
      // Update likes count
      decLikesCount(entry);
      updateLikesCount( getLikesCount(entry) );
    }
  });
}

function comment(mediaId, text) {
  $.ajax({
    type: 'POST',
    url: '/media/'+mediaId+'/comments',
    data: { 'access_token': IG._session.access_token, 'text': text, 'callback': 'handleComment' },
    success: function(data) {
      // Reset the form
      $('form#submit-form').get(0).reset();

      // Append the new comment
      var comment = $('#comment-template').clone();
      comment.find('.author').html('@'+data.from.username);
      comment.find('#comment-user img').attr('src', data.from.profile_picture);
      comment.find('.comment-text').html(data.text);
      comment.appendTo('#comments > ul');
      comment.fadeIn(ANIMATION_DURATION);
    }
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