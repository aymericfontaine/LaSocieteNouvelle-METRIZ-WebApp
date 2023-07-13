import React from "react";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);

// Libraries

const DeviationChart = ({ id, legalUnitData, branchData }) => {
  const labels = [
    "Production",
    "Consommations intermédiaires",
    "Consommations de capital fixe",
    "Valeur ajoutée nette",
  ];

  const data = legalUnitData.map((value, key) => {

    if (value) {
      const difference = value - branchData[key].value;
      const percentage = (difference / branchData[key].value) * 100;
      return Math.round(percentage);
    } else {
      return 0;
    }
  });

  const maxValue = Math.max(
    Math.abs(Math.min(...data)),
    Math.abs(Math.max(...data))
  );
  const minValue = -maxValue;

  // Data for chart
  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: ["rgb(140, 138, 171)"],
        borderWidth: 0,
        type: "bar",
        barPercentage: 0.9,
        categoryPercentage: 0.4,
        minBarLength: 2,
      },
    ],
  };
  return (
    <Bar
      id={id}
      data={chartData}
      options={{
        devicePixelRatio: 2,
        indexAxis: "y",
        scales: {
          y: {
            display: false,
          },
          x: {
            min: minValue - 10,
            max: maxValue + 10,

            grid: {
              color: "#f0f0f8",
              borderWidth : 4.5,
              borderColor: "#f0f0f8"

            },

            ticks: {
              color: "#8c8aab",
              font: {
                size: 9,
                family: "Raleway",
                weight: "bold",
              },
              callback: (value, index) => {
                if (value === 0 || value === 40 || value === -40) {
                  return value + "%";
                }
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(25,21,88,0.9)",
            cornerRadius: 3,
            callbacks: {
              label: function (context) {
                let label = context.formattedValue + "%";
                return label;
              },
            },
          },
          datalabels: {
            anchor: function (context) {
              return context.dataset.data[context.dataIndex] < 0
                ? "start"
                : "end";
            },
            offset: function (context) {
              return context.dataset.data[context.dataIndex] < 0 ? -30 : 5;
            },
            align: "end",
            color: "#8c8aab",

            font: {
              size: 9,
              family: "Raleway",
              weight: "bold",
            },
            formatter: (value) => {
              if (value !== 0) {
                return value + "%";
              }
            },
          },
        },
      }}
    />
  );
};

export default DeviationChart;
