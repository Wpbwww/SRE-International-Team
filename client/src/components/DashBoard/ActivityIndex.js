import { Icon } from "@iconify/react";
import { alpha, styled } from "@mui/material/styles";
import { Card, Typography } from "@mui/material";
import dayjs from 'dayjs';
// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
  boxShadow: "none",
  textAlign: "center",
  padding: theme.spacing(5, 0),
  color: "#5F8D4E",
  backgroundColor: theme.palette.info.lighter,
}));

const IconWrapperStyle = styled("div")(({ theme }) => ({
  margin: "auto",
  display: "flex",
  borderRadius: "50%",
  alignItems: "center",
  width: theme.spacing(8),
  height: theme.spacing(8),
  justifyContent: "center",
  marginBottom: theme.spacing(3),
  color: "#5F8D4E",
  backgroundImage: `linear-gradient(135deg, ${alpha(
    "#5F8D4E",
    0
  )} 0%, ${alpha("#A4BE7B", 0.24)} 100%)`,
}));

// ----------------------------------------------------------------------

export default function ActivityIndex(data) {
  const IndexCount = () => {
    if (data.commit_frequency) {
      var total = CountTotal(data.commit_frequency) + CountTotal(data.issue_frequency) + CountTotal(data.pull_frequency)//加总commit、issue和pull次数
      var timeLength = dayjs(data.time.endTime).diff(data.time.startTime, "day")//起始时间和结束时间的时间差
      var frequency = total / timeLength//频率（每日）
      var index = ((Math.sin(Math.atan(Math.log10(frequency))) + 1)) / 2 * 100//对频率取log后，取arctan再取sin、在稍微修饰下、使得定义域=[0,∞) 值域=[0,1)
      return index.toFixed(2)//取两位小数
    }
  }
  function CountTotal(data) {//加总
    var array = Object.values(data)
    var total = 0;
    for (var i = 0; i < array.length; i++) {
      total += array[i]
    }
    return total
  }
  return (
    <RootStyle>
      <IconWrapperStyle>
        <Icon icon="gg-trees" width="24" height="24" />
      </IconWrapperStyle>
      <Typography variant="h3">{IndexCount()}</Typography>
      <Typography variant="subtitle2">Activity Index</Typography>
    </RootStyle>
  );
}
