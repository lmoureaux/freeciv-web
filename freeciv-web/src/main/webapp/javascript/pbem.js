/**********************************************************************
    Freeciv-web - the web version of Freeciv. http://play.freeciv.org/
    Copyright (C) 2009-2015  The Freeciv-web project

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

***********************************************************************/

var opponent = null;

/**************************************************************************
 Shows the Freeciv play-by-email dialog.
**************************************************************************/
function show_pbem_dialog() 
{
  var title = "Welcome to Freeciv-web";
  var message = "You are about to start a Play-by-Email game, where you "
    + "can challenge another player, and each player will be notified when "
    + "it is their turn to play through e-mail. "; 
  // reset dialog page.
  $("#dialog").remove();
  $("<div id='dialog'></div>").appendTo("div#game_page");
  $("#dialog").html(message);
  $("#dialog").attr("title", title);
  $("#dialog").dialog({
			bgiframe: true,
			modal: true,
			width: is_small_screen() ? "80%" : "60%",
			buttons:
			{
				"Login existing user" : function() {
                                    login_pbem_user();
				},
				  "Create new user": function() {
                                    create_new_pbem_user();
				}
			}

		});

  $("#dialog").dialog('open');
}

/**************************************************************************
...
**************************************************************************/
function login_pbem_user() 
{

  var title = "Log in";
  var message = "Log in to your Freeciv-web user account:<br><br>"
                + "<table><tr><td>Username:</td><td><input id='username' type='text' size='25' onkeyup='return forceLower(this);'></td></tr>"  
                + "<tr><td>Password:</td><td><input id='password' type='password' size='25'></td></tr></table><br><br>"
                + "<div id='username_validation_result'></div>";   

  // reset dialog page.
  $("#dialog").remove();
  $("<div id='dialog'></div>").appendTo("div#game_page");

  $("#dialog").html(message);
  $("#dialog").attr("title", title);
  $("#dialog").dialog({
			bgiframe: true,
			modal: true,
			width: is_small_screen() ? "80%" : "60%",
			buttons:
			{
				"Login" : function() {
                                  login_pbem_user_request();
				}
			}
		});

  var stored_username = simpleStorage.get("username", "");
  if (stored_username != null && stored_username != false) {
    $("#username").val(stored_username);
  }


  $("#dialog").dialog('open');
}



/**************************************************************************
...
**************************************************************************/
function create_new_pbem_user() 
{

  var title = "New user account";
  var message = "Create a new Freeciv-web user account:<br><br>"
                + "<table><tr><td>Username:</td><td><input id='username' type='text' size='25' onkeyup='return forceLower(this);'></td></tr>"  
                + "<tr><td>Email:</td><td><input id='email' type='email' size='25'></td></tr>"  
                + "<tr><td>Password:</td><td><input id='password' type='password' size='25'></td></tr></table><br><br>"
                + "<div id='username_validation_result'></div>";   

  // reset dialog page.
  $("#dialog").remove();
  $("<div id='dialog'></div>").appendTo("div#game_page");

  $("#dialog").html(message);
  $("#dialog").attr("title", title);
  $("#dialog").dialog({
			bgiframe: true,
			modal: true,
			width: is_small_screen() ? "80%" : "60%",
			buttons:
			{
				"Create" : function() {
                                  create_new_pbem_user_request();
				}
			}
		});

  $("#dialog").dialog('open');
}

/**************************************************************************
...
**************************************************************************/
function create_new_pbem_user_request() 
{

  username = $("#username").val().trim();
  var password = $("#password").val().trim();
  var email = $("#email").val().trim();

  var cleaned_username = username.replace(/[^a-zA-Z]/g,'');

  if (!validateEmail(email)) {
    $("#username_validation_result").html("Invalid email address.");
    return false;
  } else if (username == null || username.length == 0) {
    $("#username_validation_result").html("Your name can't be empty.");
    return false;
  } else if (username.length <= 2 ) {
    $("#username_validation_result").html("Your name is too short.");
    return false;
  } else if (password.length <= 2 ) {
    $("#username_validation_result").html("Your password is too short.");
    return false;
  } else if (username.length >= 32) {
    $("#username_validation_result").html("Your name is too long.");
    return false;
  } else if (username != cleaned_username) {
    $("#username_validation_result").html("Your name contains invalid characters, only the English alphabet is allowed.");
    return false;
  }

  $("#username_validation_result").html("");

  $.ajax({
   type: 'POST',
   url: "/create_pbem_user?username=" + username + "&email=" + email + "&password=" + password ,
   success: function(data, textStatus, request){
       simpleStorage.set("username", username);
       challenge_pbem_player_dialog();
      },
   error: function (request, textStatus, errorThrown) {
     swal("Creating new user failed.");
   }
  });
}


/**************************************************************************
...
**************************************************************************/
function login_pbem_user_request() 
{

  username = $("#username").val().trim();
  var password = $("#password").val().trim();

  $.ajax({
   type: 'POST',
   url: "/login_user?username=" + username + "&password=" + password ,
   success: function(data, textStatus, request){
       simpleStorage.set("username", username);
       challenge_pbem_player_dialog();
     },
   error: function (request, textStatus, errorThrown) {
     swal("login user failed.");
   }
  });
}


/**************************************************************************
 Shows the Freeciv play-by-email dialog.
**************************************************************************/
function challenge_pbem_player_dialog() 
{

  var title = "Choose opponent";
  var message = "Enter the username of your opponent: "
   + "<table><tr><td>Username:</td><td><input id='opponent' type='text' size='25'"
   +" onkeyup='return forceLower(this);'></td></tr></table>"; 
  // reset dialog page.
  $("#dialog").remove();
  $("<div id='dialog'></div>").appendTo("div#game_page");
  $("#dialog").html(message);
  $("#dialog").attr("title", title);
  $("#dialog").dialog({
			bgiframe: true,
			modal: true,
			width: is_small_screen() ? "80%" : "60%",
			buttons: {
			"Invite random opponent": function() {
			  $.ajax({
			   type: 'POST',
			   url: "/random_user" ,
			   success: function(data, textStatus, request){
				$("#opponent").val(data)
			      }  });
			},
			"Choose opponent": function() {
                                    create_new_pbem_game($("#opponent").val());
			 }
			}

		});

  $("#dialog").dialog('open');
}


/**************************************************************************
 Determines if the email is valid
**************************************************************************/
function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

/**************************************************************************
...
**************************************************************************/
function forceLower(strInput) 
{
  strInput.value=strInput.value.toLowerCase();
}

/**************************************************************************
...
**************************************************************************/
function create_new_pbem_game(check_opponent) 
{
  $.ajax({
   type: 'POST',
   url: "/validate_user?username=" + check_opponent,
   success: function(data, textStatus, request){
      opponent = check_opponent;
      network_init();
      $("#dialog").dialog('close');
      setTimeout("create_pbem_players();", 2500);
 
    show_dialog_message("Play-by-Email game ready", 
      "You will now play the first turn in this play-by-email game. "
      + "Press the Start Game button to begin your turn.");

      },
   error: function (request, textStatus, errorThrown) {
     swal("Opponent does not exist. Please try another username.");
   }
  });

}

/**************************************************************************
...
**************************************************************************/
function create_pbem_players()
{
  if (opponent != null) {
    var packet = {"pid" : packet_chat_msg_req, 
                     "message" : "/create " + opponent};
   send_request(JSON.stringify(packet));
   set_human_pbem_players();
  }
}

/**************************************************************************
...
**************************************************************************/
function set_human_pbem_players()
 {
    var packet = {"pid" : packet_chat_msg_req, 
                     "message" : "/ai " + opponent};
    send_request(JSON.stringify(packet));
}

/**************************************************************************
...
**************************************************************************/
function is_pbem() 
{
  return ($.getUrlVar('action') == "pbem");
}

/**************************************************************************
...
**************************************************************************/
function pbem_end_phase() {
  var test_packet = {"pid" : packet_chat_msg_req, "message" : "/save"};
  var myJSONText = JSON.stringify(test_packet);
  send_request(myJSONText);
 
  show_dialog_message("Play By Email turn over", 
      "Your turn is now over in this Play By Email game. Now the next player " +
      "will get an email with information about how to complete their turn. " +
      "You will also get an email about when it is your turn to play again. " +
      "See you again soon!"  );
} 