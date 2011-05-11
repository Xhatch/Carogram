$(document).ready(function() {
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
  
  $.get('https://api.instagram.com/v1/users/self/feed', { 'access_token': IG._session.access_token, 'callback': 'handleFeed' }, function(data) {
    //var json = $.parseJSON(data);
    //console.log(json);
  }, 'script');
});

function handleFeed(feed) {
  console.log(feed.data.length);
}