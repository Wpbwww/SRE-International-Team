import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';

import {useEffect, useState} from 'react';
import { Card, Typography,Button, Grid } from "@mui/material";

import { useAppContext } from "../../context/appContext";

import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import { FixedSizeList } from 'react-window';

const Time=(msg)=>{
const [StartTime, setStartTime] = useState(dayjs(Date()).subtract(3,'year'));
const [EndTime, setEndTime] = useState(dayjs(Date()));
const [submit, setsubmit] = useState(false);
const [releaseButtonClick, setIsReleaseButtonClick] = useState(false);
const [Clicked, setClick] = useState(false);
const [howSelectTime, sethowSelectTime] = useState("");
const [IsTimeButton, setTimeButton] = useState(false);
useEffect(
  ()=>{
    if(howSelectTime==="chooseTime"){
      setIsReleaseButtonClick(false)
    }else if(howSelectTime==="chooseVersion"){
      setClick(false)
    }
  }
,[howSelectTime]
)
useEffect(
  ()=>{
    if(submit===true){
      console.log(StartTime,EndTime)
      TimeSelection(msg.msg.repoInfo,StartTime,EndTime)
      setsubmit(false)
    }
  }
,[submit]
)
useEffect(
  ()=>{
    if(msg.msg.time){
      setStartTime(dayjs(msg.msg.time.startTime))
      setEndTime(dayjs(msg.msg.time.endTime))
    }
  }
,[msg.msg.time]
)
const {
  TimeSelection
} = useAppContext();
const exportTime = () => {
  
  setsubmit(!submit)
};
function TimeSelect(){
  const TimeButtonClick=(event)=>{
    sethowSelectTime("chooseTime")
    setTimeButton(true);
    setClick(true);
  }
  const EndButtonClick=(event)=>{
    sethowSelectTime("chooseTime")
    setTimeButton(false);
    setClick(true);
  }
  const handleClose=()=>{
    setClick(false);
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
        <Button onClick={TimeButtonClick} id={"starttime"}>{StartTime.get('year')}-{StartTime.get('month')+1}-{StartTime.get('dates')}</Button>
        <Typography>-</Typography>
        <Button onClick={EndButtonClick} id={"endtime"}>{EndTime.get('year')}-{EndTime.get('month')+1}-{EndTime.get('dates')}</Button>
        <Typography/>
        <Button  onClick={exportTime} id={"submit"} variant={"contained"}>submit</Button>
        </Grid>
        :
        <Grid align="center" style={{justifyContent:'center'}}>{IsTimeButton===true?<SelectStartTime/>:<SelectEndTime/>}</Grid>}
    </>
  );
}
const ReleaseVersion=()=>{
  const SwitchTime=(start,end)=>{
    setStartTime(dayjs(start))
    setEndTime(dayjs(end))
  }
  const VersionPop=(Index)=>{
    var index=Index["Index"]
    if(msg.msg.versions[index]!==undefined){
      var version=msg.msg.versions
    return(<Button onClick={()=>{SwitchTime(version[index]['start'],version[index]['end'])}}>{version[index]['tag']}</Button>) }
    else{
      return null
    }
  }
  const ReleaseButton = ()=>{
    function renderRow(props) {
      const { index, style } = props;
      return (
        <ListItem style={style} key={index}>
            <VersionPop Index={index}/>
          
        </ListItem>
      );
    }
    return (
        <Box>
          {releaseButtonClick===false?<Button onClick={()=>{setIsReleaseButtonClick(true);sethowSelectTime("chooseVersion")}}>show release</Button>:
          <>
          <Button onClick={()=>{setIsReleaseButtonClick(false)}}>close</Button>
          <FixedSizeList
            height={250}
            width={500}
            itemSize={50}
            itemCount={msg.msg.versions.length}
            overscanCount={5}
          >
            {renderRow}
          </FixedSizeList>
          </>
          }
          
        </Box>
      );
  }
  return (
    <ReleaseButton/>
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



