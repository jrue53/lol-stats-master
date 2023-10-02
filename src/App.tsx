import React, { useState } from 'react';
import './App.css';
import type { Summoner, IMatchDTO } from './types';

function App() {
  const [summonerName, setSummonerName] = useState('');
  const [summoner, setSummoner] = useState<Summoner | null>(null);
  const [matches, setMatches] = useState<IMatchDTO[] | null>(null);
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

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
          <h2 className="text-xl font-semibold mb-2">Summoner Information:</h2>
          <pre className="bg-gray-200 p-4 rounded">
            {summoner.name}: Level {summoner.summonerLevel}
          </pre>
        </div>
      )}
      {matches &&
        matches.map((element) => (
          <div
            className="mt-4 cursor-pointer"
            key={element.info.gameId}
            onClick={() => toggleMatchExpansion(element.info.gameId)}
          >
            <h2 className="text-xl font-semibold mb-2">
              Match: {element.info.gameId}
            </h2>
            {expandedMatch === element.info.gameId && (
              <div className="bg-gray-200 p-4 rounded">
                {timeConvert(element.info.gameDuration)}
              </div>
            )}
          </div>
        ))}
    </div>
  );
}

export default App;