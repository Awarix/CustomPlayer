// import React, { useRef, useState } from 'react';
// import Tiptap from './components/Editor';
// import Timestamps from './components/Timestamps';
// import TextComponent from './components/TextComponent';
// import { Person } from './graph/types';
// import CallGraph from './graph/CallGraph';
// import { NetworkDiagramCanvas } from './graph/NetworkDiagramCanvas';
// import { AudioProvider } from './audio/AudioContext';
// import AudioPlayer from './audio/AudioPlayer';
// import Table from './Table'; // Предполагается, что у вас есть компонент таблицы

// function App() {
//   const callRecords = [
//     { id: '1', outgoingNumber: '+1234567890', incomingNumber: '+9876543210', name: 'John Doe', location: 'New York' },
//     { id: '2', outgoingNumber: '+9876543210', incomingNumber: '+1112223333', name: 'Jane Smith', location: 'Los Angeles' },
//     { id: '3', outgoingNumber: '9876543210', incomingNumber: '+1112223333', name: 'Jываываыва', location: 'Los Angeles' },
//     { id: '4', outgoingNumber: '+1112223333', incomingNumber: '9876543210', name: 'рпарпар', location: 'Los Angeles' },
//     { id: '5', outgoingNumber: '+123', incomingNumber: '+321', name: 'апрар', location: 'Los Angeles' },
//     { id: '6', outgoingNumber: '+321', incomingNumber: '+123', name: 'имтмитмит', location: 'Los Angeles' },
//     { id: '7', outgoingNumber: '123', incomingNumber: '+111', name: 'апрапрапр', location: 'Los Angeles' },
//     { id: '8', outgoingNumber: '111', incomingNumber: '123', name: 'тимтмитмит', location: 'Los Angeles' },
//     { id: '9', outgoingNumber: '+111', incomingNumber: '123', name: 'апрапрпарапр', location: 'Los Angeles' },
//     { id: '10', outgoingNumber: '123', incomingNumber: '111', name: 'митмитмит', location: 'Los Angeles' },
//     { id: '11', outgoingNumber: '111', incomingNumber: '+333', name: 'митмитмппп', location: 'Los Angeles' },

//   ];

//   return (
//      <AudioProvider>
//       <div>
//         {/* <NetworkDiagramCanvas /> */}
//         <Table />
//         <AudioPlayer />
//       </div>
//     </AudioProvider>
//   );
// }

// export default App;

import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { AudioProvider } from './audio/AudioContext';
import AudioPlayer from './audio/AudioPlayer';
import Table from './Table';
import AudioPlayerV2 from './audio/v2/AudioPlayerV2';
import Player from './audio/r6/Player';
import TestChannelPlayer from './audio/audioPlayerV3/test';
import WavePlayer from './audio/wavesurfer/WaveWithSegments';
import TestWithKeywords from './audio/wavesurfer/TestWithKeywords';
import WaveWithKeywords from './audio/wavesurfer/WaveWithKeywords';
import WaveKeywordsNoRegions from './audio/wavesurfer/WaveKeywordsNoRegions';
import WaveBottomExtend from './audio/wavesurfer/WaveBottomExtend';
import WaveBottomExtend2 from './audio/wavesurfer/WaveBottomExtend2';
import WaveBottomExtend3 from './audio/wavesurfer/WaveBottomExtend3';
import SuperPlayer from './audio/wavesurfer/SuperAudioPlayer/Player';
import WaveBottomExtend4 from './audio/wavesurfer/WaveBottomExtend4';
import ZhestkyiPlayer from './audio/wavesurfer/SuperZhestkyiPlayer/Player';
import Test2Players from './audio/wavesurfer/test2Players/Parrent';
import CompactExtendKeywords from './audio/wavesurfer/CompactExtendKeywords';
import FridayAudioPlayer from './Custom/Friday/FridayAudioPlayer';
import CustomPlayer from './Custom/Friday/CustomAudio';
import CustomAudioZoom from './Custom/Friday/CustomAudioZoom';
import CustomAudioZoomPolzunok from './Custom/Friday/CustomAudioZoomPolzunok';
import CustomAudioZoomBegunok from './Custom/Friday/CustomAudioZoomBegunok';
import CustomScrollFix from './Custom/Friday/CustomScrollFix';
import CustomScrollFix2 from './Custom/Friday/CustomScrollFix2';
import NewCustom from './Custom/Friday/NewCustom';
import Begunok2 from './Custom/Begunok2';
import Begunok3 from './Custom/Begunok3';
import Begunok4 from './Custom/Knopki_and_Begunok';
import Begunok5 from './Custom/Knopki_and_Begunok_and_2Channels';
import AudioPlayerW1 from './Custom/Wednesday/AudioPlayerW1';
import AudioPlayerW2 from './Custom/Wednesday/AudioPlayerW2';
import AudioPlayerW3 from './Custom/Wednesday/AudioPlayerW3';
import CanvasImageTest from './Custom/Wednesday/CanvasImageTest';
import WaveFormZoomTest from './Custom/Wednesday/WaveFormZoomTest';
import WaveformZoomPlayTest from './Custom/Wednesday/WaveformZoomPlayTest';
import Player1 from './Custom/Thursday/Player1';
import ZoomTest2 from './Custom/Wednesday/ZoomTest2';
import ZoomTest3 from './Custom/Wednesday/ZoomTest3';
import ZoomTest4 from './Custom/Wednesday/ZoomTest4';
import Begunok6 from './Custom/Knopki_and_Begunok_and_2Channels copy';
import { ThemeProvider, Typography } from '@material-ui/core';
import { theme } from './theme';
import Release_and_Scroll from './Custom/Release_and_Scroll';
import KnopkiRelease from './Custom/KnopkiRelease';
import TableForCustom from './TableForCustom';
// import { AudioPlayerV3 } from './audio/v3/AudioPlayerV3';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f0f2f5;
  font-family: Arial, sans-serif;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
`;

const WaveContainer = styled.div`
  display: flex;
  height: 192px;
`;

const segments = [{
  Start: 10,
  End: 15,
  ChannelNumber: 0,
},{
  Start: 20,
  End: 30,
  ChannelNumber: 1,
},
{
  Start: 55,
  End: 75,
  ChannelNumber: 1,
},
]

const keywords = [{
  keyword: {
      Start: 10,
      End: 11,
      Name: 'Привет',
      ChannelNumber: 2,
      Confidence: 0.9,
    },
    color: 'red',
},
{
  keyword: {
      Start: 50,
      End: 51,
      Name: 'Коля',
      ChannelNumber: 1,
      Confidence: 1,
    },
    color: 'green',
},
{
  keyword: {
      Start: 60,
      End: 61,
      Name: 'Петька',
      ChannelNumber: 2,
      Confidence: 0.6,
    },
    color: 'purple',
}
]

const tableData = [
  { id: '1', title: 'Audio 1', url: '/audio/rus.wav',segments: segments, keywords: keywords },
  { id: '2', title: 'Audio 2', url: 'https://assets.codepen.io/4358584/Anitek_-_Komorebi.mp3',segments: segments, keywords: keywords },
  { id: '3', title: 'Audio 3', url: 'https://webaudioapi.com/samples/audio-tag/chrono.mp3',segments: segments, keywords: keywords },
  // ...
];

const words = [{
  id: 1,
  recordId: 1,
  channelNumber: 1,
  lang: 'russ',
  word: 'Коля',
  confidence: 1,
  start: 10.99,
  end: 11.00,
  color: 'green',
  bgColor: '#000',
  type: 'string',
},{
  id: 2,
  recordId: 1,
  channelNumber: 1,
  lang: 'russ',
  word: 'Наташа',
  confidence: 0.8,
  start: 30.99,
  end: 31.00,
  color: 'green',
  bgColor: '#000',
  type: 'string',
}]

const words2 = [{
  word: 'Коля',
  start: 15.99,
  color: 'red',
},{

  word: 'Наташа',
  start: 99.99,
  color: 'green',
}]





const App: FC = () => {
  const [url, setUrl] = useState('')
  const [keywords, setKeywords] = useState<any []>([])
  const [channelNumber, setChannelNumber] = useState<number>(0)
  const [name, setName] = useState('')
  
  const handleRowClick = (url:string, keywords: any[], channelNumber: number, name: string) => {
    setUrl(url)
    setKeywords(keywords)
    setChannelNumber(channelNumber)
    setName(name)
  }
  return (
    <ThemeProvider theme={theme}>
    <div>
      <TableForCustom handleRowClick={handleRowClick} />
      <div style={{display: 'flex', justifyContent: 'center', margin: '2rem'}} >
      <Typography variant='h6'>
        В текущей версии:
        <br></br><br></br>
        1. Полностью самодельный аудиоплеер, без использования сторонних библиотек. <br></br>
        Аудио дорожка берётся непосредственно из аудио файла, а не приходит картинкой с бэкэнда.
        <br></br><br></br>
        2. Два вида отображения: компактный и развёрнутый. <br></br>
        Оба вида синхронизированы друг с другом, т.е. идёт воспроизведение, хочется рассмотреть что-то на осцилограмме, разворачиваешь - ползунок воспроизведения сохраняет позицию.
        <br></br><br></br>
        3. Гибкая отрисовка осцилограммы. Можно добавить отрисовку ключевых слов, выделить сегменты, добавить временную шкалу.
        <br></br><br></br>
        4. При зумировании ключевые слова отображаются корректно + добавил анимацию.
        <br></br><br></br>
        Добавить:
        <br></br><br></br>
        1. При измении размера страницы - перерисовывать осцилограмму, чтобы шкала времени правильно отображалась.
        <br></br><br></br>
        2. Придумать, как распологать кнопки в расширенной версии.
        <br></br><br></br>
        3. Сделать, чтобы можно было переключаться между файлами, не останавливая воспроизведение файла.
      </Typography>
      </div>
      {/* <WaveBottomExtend3 url= '/audio/rus.wav' file = {null} activeSegmentProp={null} keywords={keywords} channelCount={2} /> */}
      {/* <CompactExtendKeywords url= '/audio/rus.wav' file = {null} activeSegmentProp={null} keywords={keywords} channelCount={2} /> */}

      {/* wavesurfer актуальная */}
      {/* <ZhestkyiPlayer url= '/audio/rus.wav' file = {null}  keywords={keywords} channelCount={2}/> */}

      {/* <Test2Players url= '/audio/rus.wav' file = {null} activeSegmentProp={null} keywords={keywords} channelCount={2}/> */}
      {/* <WaveKeywordsNoRegions url= '/audio/rus.wav' file = {null} activeSegmentProp={null} keywords={keywords} channelCount={2}/> */}
      {/* <FridayAudioPlayer audioUrl= '/audio/rus.wav' /> */}
      {/* <CustomPlayer audioUrl= '/audio/rus.wav' /> */}
      {/* <CustomAudioZoom audioUrl= '/audio/rus.wav' /> */}
      {/* <CustomAudioZoomPolzunok audioUrl= '/audio/rus.wav' /> */}
      {/* <CustomAudioZoomBegunok audioUrl= '/audio/rus.wav' /> */}
      {/* <CustomScrollFix audioUrl= '/audio/rus.wav' /> */}
      {/* <CustomScrollFix2 audioUrl= '/audio/rus.wav' /> */}
      {/* <NewCustom audioUrl= '/audio/rus.wav' /> */}
      
      {/* кастом норм */}
      {/* <Begunok2 audioUrl= '/audio/rus.wav' /> */}
      
      {/* <Begunok3  audioUrl= '/audio/rus.wav' words={words2}/> */}

      {/* АКТУАЛЬНАЯ РАБОТАЮЩАЯ ВЕРСИЯ КАСТОМ ПЛЕЕРА */}
      {/* <Begunok4 audioUrl= '/audio/Английский.wav' channelNumber={1} markers={words2}/> */}

      {/* кастом кривые кл слова при зумировании */}
      {/* <Begunok5 audioUrl= '/audio/rus.wav' channelNumber={2} keywords={keywords}/> */}
      
      {/* <AudioPlayerW1 /> */}
      {/* <AudioPlayerW2 audioUrl= '/audio/rus.wav'/> */}
      {/* <AudioPlayerW3  audioUrl= '/audio/rus.wav'/> */}
      {/* <CanvasImageTest /> */}
      {/* <WaveFormZoomTest audioUrl= '/audio/rus.wav'/>  */}
      {/* <WaveformZoomPlayTest audioUrl= '/audio/rus.wav'/>  */}
      {/* <Player1 audioUrl= '/audio/rus.wav' words={words}/> */}
      {/* <ZoomTest2 audioUrl= '/audio/rus.wav' words={words2}/> */}

      {/* Правильное отображение ключ слов при зуме, но рендерю всегда не по сэмплам, а полный файл (дольше) */}
      {/* <ZoomTest3 audioUrl= '/audio/rus.wav' words={words2}/> */}

      {/* Правильное отображение ключ слов при зуме + 2 дорожки*/}
      {/* <ZoomTest4 audioUrl= '/audio/rus.wav' words={words2}/> */}
      {/* <Begunok6 audioUrl= '/audio/rus.wav' channelNumber={1} keywords={[]}/> */}
      {/* <Release_and_Scroll audioUrl= '/audio/Английский.wav' channelNumber={1} markers={words2}/> */}
      <KnopkiRelease audioUrl= {url} channelNumber={channelNumber} markers={keywords} fileName={name}/>
    </div>
    </ThemeProvider>
  )
}

export default App;