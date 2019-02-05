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
            toggleVisibility(result.submitGameUrl);
            // window.location.replace(result.submitGameUrl);
        },
        error: function() {
            $("#error-txt").html("Login failed.<br> Please try again.")
            $("#error-txt").show()
        }
    });
    return response;
}

function toggleVisibility(url) {
    $('#form-container').hide()
    $('#st-loading').show()
    setTimeout(() => {
        $('#st-loading').hide()
        $('#iframe-container').show()
    }, 4000)
    $('#iframe-container').html('<iframe id="airtable-form" style="display: none;" class="airtable-embed airtable-dynamic-height" src=${url} frameborder="0" onmousewheel="" width="100%" height="1220" style="background: transparent; border: 1px solid #ccc;"></iframe>')

    var iframe = $('#airtable-form')
    iframe.prop('src', url)
    iframe.show()
}