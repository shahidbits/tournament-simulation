/******************************************************************************
 *
 *  matchModule.js - Module for Match
 *
 *****************************************************************************/

var MatchModule = (function () {

  function MatchModule(tournamentId, roundCount, matchCount, teamIds) {

    this.tournamentId = tournamentId;
    this.roundCount = roundCount;
    this.matchCount = matchCount;
    this.teamIds = teamIds;

    this.getMatchWinner = function getMatchWinner(callback) {

      const self = this;
      const serverCall = new ServerCall();

      let teamDataArr = [];
      let teamDataCall = [];
      for (let j = 0; j < self.teamIds.length; j++) {
        teamDataCall.push(serverCall.getTeamData(self.tournamentId, self.teamIds[j]))
      }

      axios.all(teamDataCall)
        .then(axios.spread(function () {
          for (let i = 0; i < arguments.length; i++) {
            teamDataArr.push(arguments[i].data);
          }

          serverCall.getMatchData(self.tournamentId, self.roundCount, self.matchCount, (err, matchData) => {
            serverCall.getMatchWinner(self.tournamentId, teamDataArr, matchData.score, (err, winner) => {

              let teamLog = "Round-" + self.roundCount + " Match-" + self.matchCount + " [";
              let winTeamsArr = [];

              for (let k = 0; k < teamDataArr.length; k++) {
                let winTeam = teamDataArr[k];
                teamLog += teamDataArr[k].name + ", ";
                if (winTeam.score == winner.score) {
                  winTeamsArr.push(winTeam);
                }
              }
              teamLog = teamLog.substring(0, teamLog.length - 2) + "]";

              // Handle Score Tie (lowest teamId wins)
              let winTeam = winTeamsArr[0];
              for (let k = 1; k < winTeamsArr.length; k++) {
                if (winTeam.teamId > winTeamsArr[k].teamId) {
                  winTeam = winTeamsArr[k];
                }
              }

              teamLog += " > " + winTeam.name;
              console.log("******** " + teamLog);
              console.log(teamDataArr);
              console.log(winner);
              console.log(winTeam);
              callback(winTeam);
            });
          });
        }));
    };
  }

  return MatchModule;

})();


/***********************************  END  ***********************************/
