import { merge } from "lodash";
import ReactApexChart from "react-apexcharts";
import { useTheme, styled } from "@mui/material/styles";
import { Card, CardHeader ,Grid,Typography } from "@mui/material";
import { fNumber } from "../../utils/formatNumber";
import BaseOptionChart from "./BaseOptionChart";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const CHART_HEIGHT = 372;
const LEGEND_HEIGHT = 72;

const ChartWrapperStyle = styled("div")(({ theme }) => ({
  height: CHART_HEIGHT,
  marginTop: theme.spacing(5),
  "& .apexcharts-canvas svg": { height: CHART_HEIGHT },
  "& .apexcharts-canvas svg,.apexcharts-canvas foreignObject": {
    overflow: "visible",
  },
  "& .apexcharts-legend": {
    height: LEGEND_HEIGHT,
    borderTop: `solid 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));


const Company = (data) => {
  const theme = useTheme();
  var labels = [];
  var size = [];
  var names = [];
  var employees = [];

  var count = 0,
    sum = 0;
  for (var company in data) {
    if (count < 6) {
      labels.push(data[company].name);
      size.push(data[company].count);
    } else {
      sum += data[company].count;
    }
    count += 1;
    names.push(data[company].name);
  }
  labels.push("other");
  size.push(sum);
  const chartOptions = merge(BaseOptionChart(), {
    colors: [
      "#ffc400",
      "#ffff00",
      "#ff7800",
      "#ff0050",
      "#ff008b",
      "#df00cb",
      "#0000ff"
    ],
    labels: labels,
    stroke: { colors: [theme.palette.background.paper] },
    legend: { floating: true, horizontalAlign: "center" },
    dataLabels: { enabled: true, dropShadow: { enabled: false } },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (seriesName) => fNumber(seriesName),
        title: {
          formatter: (seriesName) => `#${seriesName}`,
        },
      },
    },
    plotOptions: {
      pie: { donut: { labels: { show: false } } },
    },
  });

  return (
    <Grid container spacing={0}>
    <Card style={{width: '50%' }}>
      <CardHeader title="Company" />
      <ChartWrapperStyle>
        <ReactApexChart
          type="pie"
          series={size}
          options={chartOptions}
          height={290}
        />
      </ChartWrapperStyle>
    </Card>

    <Card style={{width: '25%' }}>
    <CardHeader title="Company" />
    <Tabs
      value={names}
      //onChange={handleChange}
      variant="scrollable"
      scrollButtons={false}
      aria-label="scrollable prevent tabs example"
      >
      <Tab label={names[1]} />
      <Tab label="Item Two" />
      <Tab label="Item Three" />
      <Tab label="Item Four" />
      <Tab label="Item Five" />
      <Tab label="Item Six" />
      <Tab label="Item Seven" />
      </Tabs>
    </Card>

    <Card style={{width: '25%' }}>
    <CardHeader title="Companymsg" />
      <Typography>companymsg</Typography>
    </Card>
    </Grid>
  );
};

export default Company;
