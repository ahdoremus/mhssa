const API_URL = 'https://airtable.sharptop.io'
var games = []

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
    games.sort(compareDates)
    console.log('games: ', games)

    let competitiveStandings = extractStandingTemplate(games)
    let noncompetitiveStandings = extractStandingTemplate(games)

    games.forEach(game => {
        addGameToStandings(game, game.competitive ? competitiveStandings : noncompetitiveStandings);
    })
    // console.log(`Competitive`, competitiveStandings)
    // console.log(`Noncompetitive`, noncompetitiveStandings)
    for (var gender in competitiveStandings) {
        console.log(gender, competitiveStandings[gender])
        // $('#st-standings-table').append(`<div class="row"><div class="col-11 offset-1 st-align-left"><strong>${gender}</strong></div></div>`)
        for (var skillLevel in competitiveStandings[gender]) {
            $('#st-standings-table').append(`
                <div class="row">
                    <div class="col-12"><strong>${skillLevel} - ${gender}</strong></div>
                </div>
            `)
            console.log(skillLevel, competitiveStandings[gender][skillLevel])
            let list = []
            for (var team in competitiveStandings[gender][skillLevel]) {
                list.push({
                    name: team,
                    won: competitiveStandings[gender][skillLevel][team].won + noncompetitiveStandings[gender][skillLevel][team].won,
                    lost: competitiveStandings[gender][skillLevel][team].lost + noncompetitiveStandings[gender][skillLevel][team].lost,
                    tied: competitiveStandings[gender][skillLevel][team].tied + noncompetitiveStandings[gender][skillLevel][team].tied,
                })
            }

            list.sort(compareStandings)
            let i = 1
            list.forEach((team, i) => {
                console.log(team)
                $('#st-standings-table').append(`
                    <div class="row">
                        <div class="col-2">${i + 1}</div>
                        <div class="col-4 st-team-column">${team.name}</div>
                        <div class="col-2">${team.won}</div>
                        <div class="col-2">${team.lost}</div>
                        <div class="col-2">${team.tied}</div>
                    </div>
                `)

                let id = team.name.replace(/\s+/g, '-').toLowerCase()
                $('#st-games-container').append(`
                    <h4>${team.name}</h4>
                    <div id="st-games-table-${id}" class="st-games-table">
                        <div class="row st-table-header">
                            <div class="col-2">Date</div>
                            <div class="col-5">Home</div>
                            <div class="col-5">Away</div>
                        </div>
                    </div>
                `)

                games.forEach(game => {
                    if (game.homeTeamName[0] === team.name || game.awayTeamName[0] === team.name) {
                        $(`#st-games-table-${id}`).append(`
                            <div class="row">
                                <div class="col-2">${game.date.substring(5)}</div>
                                <div class="col-4 st-team-column">${game.homeTeamName}</div>
                                <div class="col-1">${game.homeScore}</div>
                                <div class="col-1 st-away-score">${game.awayScore}</div>
                                <div class="col-4 st-team-column">${game.awayTeamName}</div>
                            </div>
                        `)
                    }
                })
            })
        }
    }
}

function fetch(objectType) {
    return $.ajax({
        type: 'POST',
        url: API_URL,
        dataType: 'json',
        data: JSON.stringify({
            'baseId': 'appNtmri6lpYTOimo',
            'tableName': objectType,
            'action': 'select'
        })
    })

}

function compareStandings(a, b) {
    if (a.won > b.won)
        return -1;
    if (a.won < b.won)
        return 1;
    if (a.lost < b.lost)
        return -1;
    if (a.lost > b.lost)
        return 1;
    if (a.tied < b.tied)
        return -1;
    if (a.tied > b.tied)
        return 1;
    return 0;
}

function compareDates(a, b) {
    if (a.date < b.date)
        return -1;
    if (a.date > b.date)
        return 1;
    return 0;
}
