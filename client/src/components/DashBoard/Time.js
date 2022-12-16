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
const [StartTime, setStartTime] = useState(dayjs(Date()).subtract(3,'year'));//开始时间
const [EndTime, setEndTime] = useState(dayjs(Date()));//结束时间
const [submit, setsubmit] = useState(false);//上传至后端的触发器
const [releaseButtonClick, setIsReleaseButtonClick] = useState(false);//展开release version
const [Clicked, setClick] = useState(false);//展开时间选着的日历
const [howSelectTime, sethowSelectTime] = useState("");//选择时间的方式
const [IsTimeButton, setTimeButton] = useState(false);//所按的按钮是开始时间还是结束时间
useEffect(
  ()=>{
    if(howSelectTime==="chooseTime"){//当决定直接选择时间时
      setIsReleaseButtonClick(false)//把release version列表关闭
    }else if(howSelectTime==="chooseVersion"){//当决定通过release version选择时间时
      setClick(false)//把日历关闭
    }
  }
,[howSelectTime]
)
useEffect(
  ()=>{
    if(submit===true){
      TimeSelection(msg.msg.repoInfo,StartTime,EndTime)//将数据传至后端
      setsubmit(false)
    }
  }
,[submit]
)
useEffect(
  ()=>{
    if(msg.msg.time){//页面刷新或者页面初始化后，当接收到数据库数据且不是undifined时
      setStartTime(dayjs(msg.msg.time.startTime))//更新时间
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
  const TimeButtonClick=(event)=>{//选择开始时间
    sethowSelectTime("chooseTime")
    setTimeButton(true);
    setClick(true);
  }
  const EndButtonClick=(event)=>{//选择结束时间
    sethowSelectTime("chooseTime")
    setTimeButton(false);
    setClick(true);
  }
  const handleClose=()=>{
    setClick(false);
  }
  const SelectStartTime=()=>{
    //选择开始时间的日历
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
    //选择结束时间的日历

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
const ReleaseVersion=()=>{//版本
  const SwitchTime=(start,end)=>{//根据版本数据内的时间更新时间
    setStartTime(dayjs(start))
    setEndTime(dayjs(end))
  }
  const VersionPop=(Index)=>{//根据index提取版本数据的相应数据
    var index=Index["Index"]
    if(msg.msg.versions[index]!==undefined){
      var version=msg.msg.versions
    return(<Button onClick={()=>{SwitchTime(version[index]['start'],version[index]['end'])}}>{version[index]['tag']}</Button>) }
    else{
      return null
    }
  }
  const ReleaseButton = ()=>{
    function renderRow(props) {//列表
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



