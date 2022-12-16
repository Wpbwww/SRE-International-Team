import { merge } from "lodash";
import moment from "moment";
import ReactApexChart from "react-apexcharts";
// material
import { Card, CardHeader, Box, Grid } from "@mui/material";
//
import BaseOptionChart from "./BaseOptionChart";

// ----------------------------------------------------------------------

const PullFrequency = (data) => {//将数据转换成图表格式
  var labels = [],
    number = [];
  for (var interval in data) {
    labels.push(interval);
    number.push(data[interval]);
  }
  const CHART_DATA = [
    {
      name: "pull times",
      type: "area",
      data: number,
    },
  ];
  const chartOptions = merge(BaseOptionChart(), {//图表格式
    stroke: { width: [3, 2] },
    plotOptions: { bar: { columnWidth: "11%", borderRadius: 4 } },
    fill: { type: ["gradient", "solid"] },
    labels: labels,
    xaxis: { type: "datetime" },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (y) => {
          if (typeof y !== "undefined") {
            return `${y.toFixed(0)}`;
          }
          return y;
        },
      },
    },
  });

  return (
    <Grid container spacing={0}>
      <Card style={{ width: '100%' }}>
        <CardHeader title="Pull Frequency" />
        <Box sx={{ p: 3, pb: 1 }} dir="ltr">
          <ReactApexChart
            type="line"
            series={CHART_DATA}
            options={chartOptions}
            height={355}
          />
        </Box>
      </Card>

    </Grid>
  );
};

export default PullFrequency;
