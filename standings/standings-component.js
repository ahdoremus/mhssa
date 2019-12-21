function init() {
    displayGames()
    $('#standing-component-container').show()
    $('#st-loading').hide(2000)
}

const API_URL = 'https://airtable.sharptop.io'
var games = []
var currentGender = 'Boys'
var currentSkillLevel = 'Varsity'
var currentTeam = ''
var competitive = true
var noncompetitive = true
var competitiveStandings
var noncompetitiveStandings

$(document).ready(async function () {
    games = await fetch('Games')
    games.sort(compareDates)
    console.log('games: ', games)

    // create the standings objects
    competitiveStandings = extractStandingTemplate(games)
    noncompetitiveStandings = extractStandingTemplate(games)
    games.forEach(game => {
        addGameToStandings(game, game.competitive ? competitiveStandings : noncompetitiveStandings);
    })

    populateComponent()
    addGenderSelectionHandlers();
    addSkillLevelSelectionHandlers();
    addCompetitiveSelectionHandlers();
    // team selection handlers are added in the populate component method because they have to be added when the component is refreshed

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

function displayGame(game) {
    $(`#st-games-table`).append(`
                <div class="row">
                    <div class="col-2">${game.date.substring(5)}</div>
                    <div class="col-4 st-team-column">${game.homeTeamName}</div>
                    <div class="col-1">${game.homeScore}</div>
                    <div class="col-1 st-away-score">${game.awayScore}</div>
                    <div class="col-4 st-team-column">${game.awayTeamName}</div>
                </div>
            `)
}

function displayGames() {
    $('#st-games-container').html(`
        <h4>${currentTeam}</h4>
        <div id="st-games-table" class="st-games-table">
            <div class="row st-table-header">
                <div class="col-2">Date</div>
                <div class="col-5">Home</div>
                <div class="col-5">Away</div>
            </div>
        </div>
    `)

    games.forEach(game => {
        if (game.homeTeamName[0] === currentTeam || game.awayTeamName[0] === currentTeam) {
            if ((game.competitive && competitive) || (!game.competitive && noncompetitive)) {
                displayGame(game);
            }
        }
    })
}

function sortStandings() {
    let list = []
    for (var team in competitiveStandings[currentGender][currentSkillLevel]) {
        let teamCompetitiveStandings = (competitive ? competitiveStandings[currentGender][currentSkillLevel][team] : {
            won: 0,
            lost: 0,
            tied: 0
        })
        let teamNoncompetitiveStandings = (noncompetitive ? noncompetitiveStandings[currentGender][currentSkillLevel][team] : {
            won: 0,
            lost: 0,
            tied: 0
        })
        list.push({
            name: team,
            won: teamCompetitiveStandings.won + teamNoncompetitiveStandings.won,
            lost: teamCompetitiveStandings.lost + teamNoncompetitiveStandings.lost,
            tied: teamCompetitiveStandings.tied + teamNoncompetitiveStandings.tied,
        })
    }

    list.sort(compareStandings)
    return list;
}

function displayStandings() {
    $('#st-standings-table').html(`
        <div class="row st-table-header">
            <div class="col-2">Rank</div>
            <div class="col-4 st-team-column">Team</div>
            <div class="col-2">Won</div>
            <div class="col-2">Lost</div>
            <div class="col-2">Tied</div>
        </div>
    `)
    sortStandings().forEach((team, i) => {
        if (currentTeam === '') {
            currentTeam = team.name
        }
        // console.log(team)
        $('#st-standings-table').append(`
            <div class="row st-team-row" id="${team.name}">
                <div class="col-2 ${team.name === currentTeam ? 'active' : ''}">${i + 1}</div>
                <div class="col-4 st-team-column ${team.name === currentTeam ? 'active' : ''}">${team.name}</div>
                <div class="col-2 ${team.name === currentTeam ? 'active' : ''}">${team.won}</div>
                <div class="col-2 ${team.name === currentTeam ? 'active' : ''}">${team.lost}</div>
                <div class="col-2 ${team.name === currentTeam ? 'active' : ''}">${team.tied}</div>
            </div>
        `)
    })
}

function populateComponent() {
    console.log(`competitive: `, competitive)
    console.log(`noncompetitive: `, noncompetitive)
    $('li').removeClass('active')
    $(`#st-${currentGender.replace(/\s+/g, '-').toLowerCase()}`).addClass('active')
    $(`#st-${currentSkillLevel.replace(/\s+/g, '-').toLowerCase()}`).addClass('active')

    displayStandings();
    displayGames();
    addTeamSelectionHandler();
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


function switchGender(gender) {
    currentTeam = ''
    currentGender = gender
    populateComponent()
}

function switchSkillLevel(skillLevel) {
    currentTeam = ''
    currentSkillLevel = skillLevel
    populateComponent()
}

function addTeamSelectionHandler() {
    $('.st-team-row').click(function () {
        currentTeam = $(this).prop('id')
        console.log(currentTeam)
        populateComponent()
    })
}

function addGenderSelectionHandlers() {
    $('#st-boys').click(() => switchGender("Boys"))
    $('#st-girls').click(() => switchGender("Girls"))
}

function addSkillLevelSelectionHandlers() {
    $('#st-varsity').click(() => switchSkillLevel("18u"))
    $('#st-junior-varsity').click(() => switchSkillLevel("16u"))
    $('#st-junior-high').click(() => switchSkillLevel("14u"))
    $('#st-elementary').click(() => switchSkillLevel("10u"))
    $('#st-12u').click(() => switchSkillLevel("12u"))
}

function addCompetitiveSelectionHandlers() {
    $(':checkbox').change(function () {
        window[$(this).prop('id').substring(3)] = $(this).is(':checked')
        populateComponent()
    });
}

