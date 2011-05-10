var user = null;

$(document).ready(function() {
  // Check if user is authenticated
  if (!user) {
    // Redirect to login
    window.location.pathname = '/login.html';
    console.log('going to login.');
    return;
  }
  
  console.log('made it. must be authenticated');
});