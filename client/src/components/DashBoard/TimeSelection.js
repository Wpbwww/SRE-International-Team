import { Icon } from "@iconify/react";
import {useEffect, useState} from 'react';
import { alpha, styled } from "@mui/material/styles";
import { Card, Typography,Button } from "@mui/material";
import { fShortenNumber } from "../../utils/formatNumber";

function TimeSelection() {
  const [IsButtonClick, setIsButtonClick] = useState(false);
  function ButtonClick(){
    setIsButtonClick(!IsButtonClick);
  }
  return (
    <Card style={{height:"100%"}}>
      <Typography>{IsButtonClick}</Typography>
      <Typography>{IsButtonClick===false?<Button onClick={ButtonClick}>Time Selection</Button>:"timeselect"}</Typography>
    </Card>
  );
}
export default TimeSelection;
