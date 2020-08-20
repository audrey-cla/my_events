var UserProfile = (function () {

    var getFbId = function () {
        return localStorage.getItem('fbid');   // Or pull this from cookie/localStorage
    };

    // var setName = function (name) {
    //     // Also set this in cookie/localStorage
    // };

    return {
        getFbId: getFbId,
        // setName: setName
    }

})();

export default UserProfile;