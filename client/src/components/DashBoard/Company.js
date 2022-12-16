import { merge } from "lodash";
import ReactApexChart from "react-apexcharts";
import { useTheme, styled } from "@mui/material/styles";
import { Box, Button, Card, CardHeader, Grid, Typography } from "@mui/material";
import { fNumber } from "../../utils/formatNumber";
import BaseOptionChart from "./BaseOptionChart";
import ListItem from '@mui/material/ListItem';
import { FixedSizeList } from 'react-window';
import { useState, useEffect } from "react";
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
  const [companyMsg, setCompanyMsg] = useState([])//公司信息
  const [isLoading, setIsLoading] = useState(true)//读取数据中
  const [companyId, setCompanyId] = useState(0)//选择的公司Idd
  const [employeeMsg, setEmployeeMsg] = useState([])//根据Id获取相应的公司的雇员信息
  useEffect(() => {
    if (data) {//当数据读取完毕时
      setIsLoading(false)
      setCompanyMsg(Object.values(data))//更新公司信息
    };
  }, [data])
  useEffect(() => {
    if (companyMsg.length !== 0) {//当存在公司信息时
      setEmployeeMsg(Object.values(companyMsg[companyId].employees))//根据Id获取相应的公司的雇员信息
    };
  }, [companyMsg, companyId])
  const theme = useTheme();
  var labels = [];
  var size = [];
  var names = [];

  var count = 0,
    sum = 0;
  for (var company in data) {//图表数据
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
  const chartOptions = merge(BaseOptionChart(), {//图表结果
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
  const CompanyList = () => {//公司列表
    function renderRow(props) {
      const { index, style } = props;
      return (
        <ListItem style={style} key={index}>
          <Box align={"center"} style={{ width: "80%" }}>
            <Button onClick={() => { setCompanyId(index) }}>{companyMsg[index].name}</Button>
          </Box>
          <Box align={"right"} style={{ width: "20%" }}>{companyMsg[index].count}</Box>
        </ListItem>
      );
    }
    return (
      <>
        {isLoading === false ?
          <FixedSizeList
            height={400}
            width={380}
            itemSize={50}
            itemCount={companyMsg.length}
            overscanCount={20}
          >
            {renderRow}
          </FixedSizeList>
          : ""
        }</>
    )
  }
  const CompanyMsgList = () => {//雇员列表
    function renderRow(props) {
      const { index, style } = props;
      return (
        <ListItem style={style} key={index}>
          <Box align={"left"} style={{ width: "20%" }}>
            <Box
              component="img"
              alt={employeeMsg[index].name}
              src={employeeMsg[index].avatar_url}
              sx={{ width: 48, height: 48, borderRadius: 1.5 }}
              lign={"center"}
            />
          </Box>
          <Box align={"left"} style={{ width: "60%" }}>{employeeMsg[index].name}</Box>
          <Box align={"right"} style={{ width: "20%" }}>{employeeMsg[index].contributions}</Box>
        </ListItem>
      );
    }
    return (
      <>
        {isLoading === false ?
          <FixedSizeList
            height={400}
            width={380}
            itemSize={50}
            itemCount={employeeMsg.length}
            overscanCount={20}
          >
            {renderRow}
          </FixedSizeList>
          : ""
        }</>
    )
  }
  return (
    <Grid container spacing={0}>
      <Card style={{ width: '100%' }}>
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
      <Card style={{ width: '50%' }}>
        <CardHeader title="Company" />
        <CompanyList />
      </Card>

      <Card style={{ width: '50%' }}>
        <CardHeader title="Company Employees (ranked by contribution)" />
        <CompanyMsgList />
      </Card>
    </Grid>
  );
};

export default Company;
