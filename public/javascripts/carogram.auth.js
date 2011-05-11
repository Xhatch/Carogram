$(document).ready(function() {

  // Setup Instagram
  IG.init({
    client_id: '104378f7c76843c78ea0e83339bb9054',
    check_status: true, // check and load active session
    cookie: true // persist a session via cookie
  });

  $('#login-button').click(function(e) {
    // ignore if sesson already exists
    if (IG._session) {
      return;
    }
    
    // client side access_token flow (implicit)
    IG.login(function (response) {
      if (response.session) {
          // user is logged in
          console.log(IG._session.username + ' is logged in');
          window.location.pathname = '/';
      }
    }, {scope: ['comments', 'likes']});
  });
  
  $('#logout-button').click(function(e) {
    // ignore if sesson doesn't exists
    if (IG._session == null) {
      return;
    }
    
    // logout
    IG.logout(function (response) {
      if (response.session) {
          // user is logged out
      }
    });
  });
  
});