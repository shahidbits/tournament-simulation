/******************************************************************************
 *
 *  client.js - Main file for client
 *
 *****************************************************************************/

function startTournament() {

  const teamsPerMatchVal = document.getElementById("teamsPerMatch").value;
  const numberOfTeamsVal = document.getElementById("numberOfTeams").value;

  document.getElementById("roundContainer").innerHTML = "";
  document.getElementById("winner").textContent = "";
  document.getElementById("start").disabled = true;

  const tournament = new Tournament(teamsPerMatchVal, numberOfTeamsVal);

  // A. Init the tournament
  tournament.init((err, resp) => {
    if (err) {
      document.getElementById("start").disabled = false;
      console.log(err);
    } else {

      // B. Start playing rounds unitl we get a single winner
      tournament.start(resp.tournamentId, resp.matchUps, (winner) => {
        console.log('TOURNAMENT IS OVER');
        console.log(winner.name + " is the winner");
        document.getElementById("start").disabled = false;
      });
    }
  });
}


class Tournament {
  constructor(teamsPerMatch, numberOfTeams) {
    this.teamsPerMatch = teamsPerMatch;
    this.numberOfTeams = numberOfTeams;
  }

  /*
  * init() - begin the tournament by making a POST call to /tournament to get the tournamentId and first
  *           round's matchups
  */
  init(callback) {
    new ServerCall().getTournamentData(this.teamsPerMatch, this.numberOfTeams, (error, data) => {
      callback(error, data);
    });
  }

  /*
  * start() - start the tournament with first round and go on till the last round
  *
  */
  start(tournamentId, matchUps, callback) {

    // Create the first round and start the tournament until we get the single winner
    let round = new Round(tournamentId, 0, matchUps);
    round.play((winner) => {
      callback(winner);
    });
  }
}


class Round {

  constructor(tournamentId, roundCount, matchUps) {

    this.tournamentId = tournamentId;
    this.roundCount = roundCount;
    this.matchUps = matchUps;
    this.teamsPerMatchVal = matchUps[0].teamIds.length;

  }

  /*
  * play() - Play out all the rounds of the tournament to return the single winner
  */
  play(callback) {

    const self = this;
    let matchCountTemp = 0;
    let winTeams = [];

    let roundSummaryContainer = document.getElementById("roundContainer");
    for (let i = 0; i < self.matchUps.length; i++) {

      // An empty box is added for each match present in matchUps array
      let matchBoxDiv = document.createElement('div');
      matchBoxDiv.className = 'box-match';
      matchBoxDiv.id = self.roundCount + "_match_" + self.matchUps[i].match;
      roundSummaryContainer.appendChild(matchBoxDiv);

      // create a new match and wait for its winner
      let matchCount = self.matchUps[i].match;
      this.getMatchWinnerTeam(self.tournamentId, self.roundCount, matchCount, self.matchUps[i].teamIds, function (winTeam) {

        matchCountTemp++;
        winTeams[matchCount] = winTeam;

        // Great... Got the winner for 'match = matchCount', mark the box as 'completed'
        document.getElementById(self.roundCount + "_match_" + matchCount).className += ' box-match-completed';
        document.getElementById("winner").textContent = winTeam.name;

        if (matchCountTemp == self.matchUps.length) {
          console.log("ROUND " + self.roundCount + " OVER");
          console.log(winTeams);

          if (winTeams.length > 1) {

            // We haven't got the single winner yet i.e. tournament is still on, so -
            // STEP 1) Create newMatchUps array for next round, from the winning teams of prev round
            self.createMatchUps(winTeams, (newMatchUps) => {

              // STEP 2) Play out the next round of the tournament
              (new Round(self.tournamentId, self.roundCount + 1, newMatchUps, callback)).play((winner) => {
                callback(winner);
              });
            });

          } else {

            // Yayyy... We've got the single winner of the tournament. Wrap it up!
            callback(winTeams[0]);
          }
        }
      });
    }
  }

  /*
  * createMatchUps() - Creates matchUps for upcoming round from the winners of previous round
  */
  createMatchUps(winTeams, callback) {

    const self = this;
    let newMatchUps = [];
    let elem = {};
    elem.teamIds = [];

    for (let i = 0; i < winTeams.length; i++) {
      elem.teamIds.push(winTeams[i].teamId);
      if (i % self.teamsPerMatchVal == 0) {
        elem.match = (i / self.teamsPerMatchVal)
      }
      if (i % self.teamsPerMatchVal == (self.teamsPerMatchVal - 1)) {
        newMatchUps.push(elem);
        elem = {};
        elem.teamIds = [];
      }
    }

    callback(newMatchUps);
  }

  /*
  * getMatchWinnerTeam() - Wrapper to get the winner of a match
  */
  getMatchWinnerTeam(tournamentId, roundCount, matchCount, teamIds, callback) {

    if (typeof(Worker) !== "undefined") {

      // Use HTML5's Web Worker API to carry out I/O in background
      let matchWorker = new Worker("./client/worker_match.js");
      let matchMod = new MatchModule(tournamentId, roundCount, matchCount, teamIds);
      let workerData = {
        tournamentId: tournamentId,
        roundCount: roundCount,
        matchCount: matchCount,
        teamIds: teamIds
      };
      matchWorker.postMessage(workerData);
      matchWorker.onmessage = function (e) {
        callback(e.data);
      }

    } else {

      let matchMod = new MatchModule(tournamentId, roundCount, matchCount, teamIds);
      matchMod.getMatchWinner((winTeam) => {
        callback(winTeam);
      });
    }
  }
}

/***********************************  END  ***********************************/
