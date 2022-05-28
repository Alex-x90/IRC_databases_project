

function searchFriends(){

}

/*
 * Wait until the DOM content is loaded, and then hook up UI interactions, etc.
 */
window.addEventListener('DOMContentLoaded', function () {


    var searchButton = document.getElementByClassName('addfriend');
    if(search){
        addfriend.addEventListener('click', searchFriends)
    }

    var renoveFriendButton = docuemnt.getElementByClassName('removefriend');
    if(addfriend){
        removefriend.addEventListener('click', searchFriends)
    }
});