import { Icon } from "@iconify/react";
import { alpha, styled } from "@mui/material/styles";
import { Card, Typography } from "@mui/material";
import { fShortenNumber } from "../../utils/formatNumber";

// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
  boxShadow: "none",
  textAlign: "center",
  padding: theme.spacing(5, 0),
  color: theme.palette.primary.dark,
  backgroundColor: theme.palette.primary.lighter,
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
  color: theme.palette.primary.dark,
  backgroundImage: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.dark,
    0
  )} 0%, ${alpha(theme.palette.primary.dark, 0.24)} 100%)`,
}));

// ----------------------------------------------------------------------

const IssueNumber = (total) => {
  var num = 0;
  for (var interval in total) {
    num += total[interval];
  }//加总commit次数

  return (
    <RootStyle>
      <IconWrapperStyle>
        <Icon icon="whh:issue" width="24" height="24" />
      </IconWrapperStyle>
      <Typography variant="h3">{fShortenNumber(num)}</Typography>
      <Typography variant="subtitle2">Issues in Interval</Typography>
    </RootStyle>
  );
};
export default IssueNumber;
