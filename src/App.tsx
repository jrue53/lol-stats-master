import React, { useState } from 'react';
import './App.css';
import type { Summoner, IMatchDTO, ParticipantDTO } from './types';
import Chart from './Chart'


function App() {
  const [summonerName, setSummonerName] = useState('');
  const [summoner, setSummoner] = useState<Summoner | null>(null);
  const [matches, setMatches] = useState<IMatchDTO[] | null>(null);
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDamageCharts, setShowDamageCharts] = useState(false);


  function getGameResult(participants: ParticipantDTO[], playerSummonerName: string) {
    const player = participants.find((participant: { summonerName: string; }) =>participant.summonerName === playerSummonerName)
    if(player && player.win){
      return true
    }
  }

  function getChamp(participants: ParticipantDTO[], playerSummonerName: string) {
    const player = participants.find((participant: { summonerName: string; }) =>participant.summonerName === playerSummonerName)
    return player?.championName
  }

  function getMostGold(participants: ParticipantDTO[]) {
    const maxObject = participants.reduce((max, current) => (current.goldEarned > max.goldEarned) ? current : max, participants[0]);
    return maxObject.goldEarned;
  }

  function getMostDmg(participants: ParticipantDTO[]) {
    const maxObject = participants.reduce((max, current) => (current.totalDamageDealtToChampions > max.totalDamageDealtToChampions) ? current : max, participants[0]);
    return maxObject.totalDamageDealtToChampions;
  }

  const handleSearch = () => {
    setLoading(true);
    fetch(`https://localhost:7072/api/LoLAccount/summoner/${summonerName}`)
      .then((res) => res.json())
      .then((data) => {
        setSummoner(data);
        fetch(`https://localhost:7072/api/Matches/${data.puuid}`)
          .then((res) => res.json())
          .then((data) => {
            setMatches(data);
            setLoading(false);
          });
      });
  };

  const toggleMatchExpansion = (gameId: number) => {
    if (expandedMatch === gameId) {
      setExpandedMatch(null); // Collapse the clicked match
      setShowDamageCharts(false);
    } else {
      setShowDamageCharts(false);
      setExpandedMatch(gameId); // Expand the clicked match
    }
  };

  const timeConvert = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    if(seconds < 10){
      return `${minutes}:0${seconds}`
    }
    return `${minutes}:${seconds}`
  }

  return (
    <div className="container mx-auto mt-8">
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="summonerName"
        >
          Summoner Name:
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="summonerName"
          type="text"
          placeholder="Enter Summoner Name"
          value={summonerName}
          onChange={(e) => setSummonerName(e.target.value)}
        />
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={handleSearch}
      >
        {loading ? "Loading..." : "Search"}
      </button>
      {summoner && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">
            Match History for {summoner.name} Level {summoner.summonerLevel}
          </h2>
        </div>
      )}
      {/* for every match */}
      {matches &&
        matches.map((element) => (
          <div
            className={`mt-4 ${
              getGameResult(element.info.participants, summonerName)
                ? `bg-green-400`
                : `bg-red-400`
            }`}
            key={element.info.gameId}
          >
            <div className="flex cursor-pointer" onClick={() => toggleMatchExpansion(element.info.gameId)}>
              <h2 className="text-l font-semibold m-2">
                {element.info.gameMode}
              </h2>
              <h2 className="text-l font-semibold m-2">
                {getChamp(element.info.participants, summonerName)}
              </h2>
              <h2 className="text-l font-semibold m-2">
                {getGameResult(element.info.participants, summonerName)
                  ? "WIN"
                  : "LOSS"}
              </h2>
              <h2 className="text-l font-semibold m-2">
                {timeConvert(element.info.gameDuration)}
              </h2>
            </div>
            {/* within a single match expanded */}
            {expandedMatch === element.info.gameId && (
              <>
                <div className="bg-gray-200 p-4 rounded">
                  <div>
                    {/* for each team */}
                    {element &&
                      element.info.teams.map((team) => (
                        <div
                          className={`mt-4 p-4  ${
                            team.win ? `bg-green-200` : `bg-red-200`
                          }`}
                        >
                          <div className="grid grid-cols-4 gap-4">
                            <h2 className="text-xl font-semibold my-4">
                              {team.win ? "Victory" : "Defeat"}
                            </h2>
                            <h2 className="text-xl font-semibold my-4">KDA</h2>
                            <h2 className="text-xl font-semibold my-4">
                              Gold Earned
                            </h2>
                            <button
                              className="text-blue-500 cursor-pointer"
                              onClick={() =>
                                setShowDamageCharts(!showDamageCharts)
                              }
                            >
                              <h2 className="text-xl font-semibold my-4">
                                Total Damage Dealt
                              </h2>
                            </button>
                          </div>

                          {/* for each player */}
                          {element.info.participants
                            .filter((player) => player.teamId === team.teamId)
                            .map((filteredPlayer) => {
                              // Calculate ratios and set the class name for child-div
                              const goldRatio =
                                (filteredPlayer.goldEarned /
                                  getMostGold(element.info.participants)) *
                                100;
                              const childDiv2Style = {
                                minWidth: `${goldRatio}%`,
                              };

                              const dmgRatio =
                                (filteredPlayer.totalDamageDealtToChampions /
                                  getMostDmg(element.info.participants)) *
                                100;
                              const childDiv3Style = {
                                minWidth: `${dmgRatio}%`,
                              };

                              return (
                                <div
                                  className="grid grid-cols-4 gap-4"
                                  key={filteredPlayer.championId}
                                >
                                  <div>
                                    <h2
                                      className={`text-l mb-2 ${
                                        filteredPlayer.summonerName ===
                                        summonerName
                                          ? "font-extrabold"
                                          : "font-semibold"
                                      }`}
                                    >
                                      {filteredPlayer.championName}:{" "}
                                      {filteredPlayer.summonerName}
                                    </h2>
                                  </div>
                                  <div>
                                    <h2
                                      className={`text-l mb-2 ${
                                        filteredPlayer.summonerName ===
                                        summonerName
                                          ? "font-extrabold"
                                          : "font-semibold"
                                      }`}
                                    >
                                      {filteredPlayer.kills}/
                                      {filteredPlayer.deaths}/
                                      {filteredPlayer.assists} -{" "}
                                      {(
                                        (filteredPlayer.kills +
                                          filteredPlayer.assists) /
                                        filteredPlayer.deaths
                                      ).toFixed(2)}
                                    </h2>
                                  </div>
                                  <div className="parent-div relative">
                                    <div className="child-div-1 absolute top-0 left-0 min-w-full height-50 bg-gray-500">
                                      Gold Earned
                                    </div>
                                    <div
                                      className="child-div-2 absolute top-0 left-50 h-50 bg-yellow-500"
                                      style={childDiv2Style}
                                    >
                                      {filteredPlayer.goldEarned}
                                    </div>
                                  </div>
                                  <div className="parent-div relative">
                                    <div className="child-div-1 absolute top-0 left-0 min-w-full height-50 bg-gray-500">
                                      Damage
                                    </div>
                                    <div
                                      className="child-div-2 absolute top-0 left-50 h-50 bg-purple-500"
                                      style={childDiv3Style}
                                    >
                                      {
                                        filteredPlayer.totalDamageDealtToChampions
                                      }
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ))}
                  </div>
                </div>
                {showDamageCharts && (
                  <div className="bg-gray-200 p-4 rounded flex">
                    <Chart
                      champs={element.info.participants.slice(0, 5)}
                      width="750px"
                      height="500px"
                    />
                    <Chart
                      champs={element.info.participants.slice(5, 10)}
                      width="750px"
                      height="500px"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        ))}
    </div>
  );
}

export default App;