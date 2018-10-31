const API_URL = 'https://airtable.sharptop.io'
var games = []
const gender = {boys: "Boys", girls: "Girls"}
const skillLevel = {var: "Varsity", jv: "Junior Varsity", jh: "Junior High"}
var activeGender = "Boys"
var activeSkillLevel = "Varsity"

$(document).ready(function () {
    displayGames()
    $('#st-loading').hide(2000)
})

function extractStandingTemplate(games) {
    let standings = {}
    games.forEach(game => {
        // console.log(`gender: ${game.gender}, skillLevel: ${game.skillLevel}, homeTeam: ${game.homeTeamName}`)
        if (!standings[game.gender]) standings[game.gender] = {}
        if (!standings[game.gender][game.skillLevel]) standings[game.gender][game.skillLevel] = {}

        if (!standings[game.gender][game.skillLevel][game.homeTeamName]) {
            standings[game.gender][game.skillLevel][game.homeTeamName] = {won: 0, lost: 0, tied: 0}
        }
        if (!standings[game.gender][game.skillLevel][game.awayTeamName]) {
            standings[game.gender][game.skillLevel][game.awayTeamName] = {won: 0, lost: 0, tied: 0}
        }
    })
    return standings
}

function addGameToStandings(game, standing) {
    if (game.winningTeamName) {
        // console.log(`winner: ${game.winningTeamName}, loser: ${game.losingTeamName}`)
        standing[game.gender][game.skillLevel][game.winningTeamName].won++
        standing[game.gender][game.skillLevel][game.losingTeamName].lost++
    } else {
        // console.log(`*** tiers: ${game.homeTeamName} & ${game.awayTeamName}`)
        standing[game.gender][game.skillLevel][game.homeTeamName].tied++
        standing[game.gender][game.skillLevel][game.awayTeamName].tied++
    }
}

async function displayGames() {
    games = await fetch('Games')
    console.log('games: ', games)

    let competitiveStandings = extractStandingTemplate(games)
    let noncompetitiveStandings = extractStandingTemplate(games)

    games.forEach(game => {
        addGameToStandings(game, game.competitive ? competitiveStandings : noncompetitiveStandings);
    })
    console.log(`Competitive`, competitiveStandings)
    console.log(`Noncompetitive`, noncompetitiveStandings)
    // for (var team in competitiveStandings) {
    //     console.log(team, competitiveStandings[team])
    // }
}

function fetch(objectType) {
    return $.ajax({
        type: 'POST',
        url: API_URL,
        dataType: 'json',
        data: JSON.stringify({
            "baseId": "appNtmri6lpYTOimo",
            "tableName": objectType,
            "action": "select"
        })
    })

}
