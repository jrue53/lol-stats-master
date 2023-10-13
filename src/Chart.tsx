import React from 'react';
import  ReactApexChart  from 'react-apexcharts';
import { ParticipantDTO } from './types';


interface ChartProps {
    champs: ParticipantDTO[];
    width: string;
    height: string;
}

const Chart = (props: ChartProps) => {
  const { width, height, champs } = props;

  const ap: number[] = [];
  const ad: number[] = [];
  const truedmg: number[] = [];

  champs.forEach((champ) => {
    ap.push(champ.magicDamageDealtToChampions)
    ad.push(champ.physicalDamageDealtToChampions)
    truedmg.push(champ.trueDamageDealtToChampions)
  })

  const seriesData: { name: string; data: number[] }[] = [{
    name: 'Physical Damage Dealt',
    data: ad
  }, {
    name: 'Magic Damage Dealt',
    data: ap
  },
  {
    name: 'True Damage Dealt',
    data: truedmg
  },]


  const options: object = {
    series: seriesData,
    chart: {
      type: 'bar',
    },
    xaxis: {
        categories: champs.map((champ) => champ.championName),
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
  };

  return (
    <div>
      <ReactApexChart options={options} series={seriesData} type="bar" width={width} height={height} />
    </div>
  );
};

export default Chart;
