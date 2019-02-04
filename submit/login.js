// async function getToken(username, password) {
//     response = await $.ajax({
//         type: 'POST',
//         url: "https://airtable.sharptop.io",
//         dataType: 'json',
//         data: JSON.stringify({
//             'baseId': 'appNtmri6lpYTOimo',
//             'action': 'login',
//             'username': username,
//             'password': password
//         })
//
//     });
//     console.log(response.tokenId);
//     return response;
// }

async function getToken(username, password) {
    response = await $.ajax({
        type: 'POST',
        url: "https://airtable.sharptop.io",
        dataType: 'json',
        data: JSON.stringify({
            'baseId': 'appNtmri6lpYTOimo',
            'action': 'login',
            'username': username,
            'password': password
        }),
        success: function(result) {
            console.log(result.tokenId);
            toggleVisibility();
        },
        error: function() {
            $("#error-txt").text("Could not login. Check your username and password and try again.")
        }
    });
    return response;
}

function toggleVisibility() {
    var loginform = document.getElementById("login-form");
    loginform.style.display = "none";
    var iframe = document.getElementById("airtable-form");
    iframe.style.display = "block";

    var element = iframe.contentWindow.document.getElementsByClassName("sharedFormField")[6];
    element.style.display = "block";
}