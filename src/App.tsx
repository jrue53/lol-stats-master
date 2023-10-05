import React, { useState } from 'react';
import './App.css';
import type { Summoner, IMatchDTO, ParticipantDTO } from './types';


function App() {
  const [summonerName, setSummonerName] = useState('');
  const [summoner, setSummoner] = useState<Summoner | null>(null);
  const [matches, setMatches] = useState<IMatchDTO[] | null>(null);
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

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
    } else {
      setExpandedMatch(gameId); // Expand the clicked match
    }
  };

  const timeConvert = (time: number) => {
    // eslint-disable-next-line no-debugger
    debugger
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
      {matches &&
        matches.map((element) => (
          <div
            className={`mt-4 cursor-pointer ${
              getGameResult(element.info.participants, summonerName)
                ? `bg-green-400`
                : `bg-red-400`
            }`}
            key={element.info.gameId}
            onClick={() => toggleMatchExpansion(element.info.gameId)}
          >
            <div className="flex">
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
            {expandedMatch === element.info.gameId && (
              <div className="bg-gray-200 p-4 rounded">
                <div>
                  {element &&
                    element.info.teams.map((team) => (
                      <div
                        className={`mt-4 cursor-pointer ${
                          team.win ? `bg-green-200` : `bg-red-200`
                        }`}
                      >
                        <h2 className="text-xl font-semibold my-4">
                          {team.win ? "Victory" : "Defeat"}
                        </h2>
                        {element &&
                          element.info.participants
                            .filter((player) => player.teamId === team.teamId)
                            .map((filteredPlayer) => (
                              <h2
                                className={`text-l mb-2 ${filteredPlayer.summonerName === summonerName ? 'font-extrabold' : ' font-semibold'}`}
                                key={filteredPlayer.championId}
                              >
                                {filteredPlayer.championName}:{" "}
                                {filteredPlayer.summonerName}{" "}
                                {filteredPlayer.kills}/{filteredPlayer.deaths}/
                                {filteredPlayer.assists}
                              </h2>
                            ))}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}

export default App;