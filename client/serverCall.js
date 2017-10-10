/******************************************************************************
 *
 *  serverCall.js - Interface to connect to the backend server
 *
 *****************************************************************************/

var ServerCall = (function () {

  function ServerCall() {

    /*
    * getTournamentData() - API call to get the tournament id and first round's match ups
    *
    *  @param:
    *    teamsPerMatch
    *    numberOfTeams
    *    callback
    *
    */
    this.getTournamentData = function getTournamentData(teamsPerMatch, numberOfTeams, callback) {
      axios.post('/tournament', {teamsPerMatch: teamsPerMatch, numberOfTeams: numberOfTeams})
        .then((response) => {
          callback(null, response.data)
        })
        .catch((error) => {
          callback(error)
        });
    }

    /*
    * getTeamData() - API call to retrieve team data
    *
    *   @param:
    *     tournammentId
    *     teamId
    *     callback
    *
    */
    this.getTeamData = function getTeamData(tournamentId, teamId) {
      return axios.get('/team?' + 'tournamentId=' + tournamentId + '&teamId=' + teamId)
    }

    /*
    * getMatchData() - API call to get the match score from server
    *
    *  @param:
    *    tournammentId
    *    roundCount
    *    matchCount
    *    callback
    *
    */
    this.getMatchData = function getMatchData(tournamentId, roundCount, matchCount, callback) {
      let params = "tournamentId=" + tournamentId + "&round=" + roundCount + "&match=" + matchCount;
      axios.get('/match?' + params)
        .then((response) => {
          callback(null, response.data)
        })
        .catch((error) => {
          console.log(error)
        });
    }

    /*
    * getMatchWinner() - API call to get the winning score of a match from server
    *
    *   @param:
    *     tournammentId
    *     teamDataArr
    *     matchScore
    *     callback
    *
    */
    this.getMatchWinner = function getMatchWinner(tournamentId, teamDataArr, matchScore, callback) {

      let teamScores = "";
      for (let i = 0; i < teamDataArr.length; i++) {
        teamScores += teamDataArr[i].score + "&teamScores=";
      }

      if (teamScores.length > 12) teamScores = teamScores.substring(0, teamScores.length - 12);

      let params = "tournamentId=" + tournamentId + "&teamScores=" + teamScores + "&matchScore=" + matchScore;
      axios.get('/winner?' + params)
        .then((response) => {
          callback(null, response.data)
        })
        .catch((error) => {
          console.log(error)
        });
    }
  }

  return ServerCall;

})();

/***********************************  END  ***********************************/