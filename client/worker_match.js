/******************************************************************************
 *
 *  worker_match.js - Web worker for Match
 *
 *****************************************************************************/

importScripts('./matchModule.js');
importScripts('./serverCall.js');
importScripts('https://unpkg.com/axios/dist/axios.min.js');

self.onmessage = function (e) {
  let workerData = e.data;
  let matchMod = new MatchModule(workerData.tournamentId, workerData.roundCount, workerData.matchCount, workerData.teamIds);
  matchMod.getMatchWinner((winTeam) => {
    self.postMessage(winTeam);
    close();
  });
}


/***********************************  END  ***********************************/
