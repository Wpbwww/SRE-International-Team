import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';

import {useEffect, useState} from 'react';
import { Card, Typography,Button, Grid } from "@mui/material";

import { useAppContext } from "../../context/appContext";
function Time(){
const [StartTime, setStartTime] = useState(dayjs(Date()).subtract(3,'year'));
const [EndTime, setEndTime] = useState(dayjs(Date()));
const [refresh, setrefresh] = useState(false);
const {
  TimeSelection
} = useAppContext();
const exportTime = () => {
  TimeSelection(StartTime,EndTime);
};
function TimeSelect(){
  const [IsStartButton, setStartButton] = useState(false);
  const [Clicked, setClick] = useState(false);
  const StartButtonClick=(event)=>{
    setStartButton(true);
    setClick(true);
  }
  const EndButtonClick=(event)=>{
    setStartButton(false);
    setClick(true);
  }
  const handleClose=()=>{
    setClick(false);
    exportTime();
  }
  const SelectStartTime=()=>{

    return (
     <LocalizationProvider dateAdapter={AdapterDayjs}>
     <Typography>开始时间</Typography>
        <StaticDatePicker
        displayStaticWrapperAs="desktop"
        value={StartTime}
        onChange={(newValue) => {
          setStartTime(newValue);
        }}
        renderInput={(params) => <TextField {...params} />}
        onClose={handleClose}
        maxDate={EndTime}
      />
   </LocalizationProvider>
  );
  };
  const SelectEndTime =()=> {

    return (
     <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Typography>结束时间</Typography>
        <StaticDatePicker
        displayStaticWrapperAs="desktop"
        value={EndTime}
        onChange={(newValue) => {
          setEndTime(newValue);
        }}
        renderInput={(param) => <TextField {...param} />}
        onClose={handleClose}
        minDate={StartTime}
        maxDate={Date()}
      />
   </LocalizationProvider>
  );
  }
  return (
    <>
        {Clicked===false?
        <Grid align="center" style={{justifyContent:'center'}}>
        <Button onClick={StartButtonClick} id={"starttime"}>{StartTime.get('year')}-{StartTime.get('month')}-{StartTime.get('dates')}</Button>
        <Typography>-</Typography>
        <Button onClick={EndButtonClick} id={"endtime"}>{EndTime.get('year')}-{EndTime.get('month')}-{EndTime.get('dates')}</Button>
        </Grid>
        :
        <Grid align="center" style={{justifyContent:'center'}}>{IsStartButton===true?<SelectStartTime/>:<SelectEndTime/>}</Grid>}
    </>
  );
}
function ReleaseVersion() {
  const [IsButtonClick, setIsButtonClick] = useState(false);
  function ButtonClick(){
    setIsButtonClick(!IsButtonClick);
  }
  return (
    <Card style={{height:"100%"}}>
      <Typography>{IsButtonClick}</Typography>
      <Typography>{IsButtonClick===false?<Button onClick={ButtonClick}>Release Version</Button>:'ReleaseSelect'}</Typography>
    </Card>
  );
}
  return (
    <Card style={{height:"100%",width:"100%"}}>
      <TimeSelect/>
      <Card style={{height:"100%",width:"100%"}}>
        <ReleaseVersion/>
      </Card>
    </Card>
  );
}
export default Time;



