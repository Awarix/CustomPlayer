import React from 'react';
import styled from 'styled-components';
import { useAudio } from './audio/AudioContext';

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
`;

const TableHeader = styled.th`
  padding: 12px;
  text-align: left;
  background-color: #f1f3f5;
  color: #333;
  font-weight: bold;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8f9fa;
  }

  &:hover {
    background-color: #e9ecef;
    cursor: pointer;
  }
`;

const TableCell = styled.td`
  padding: 12px;
  border-top: 1px solid #dee2e6;
`;

const Table: React.FC = () => {
  const { setCurrentAudioUrl } = useAudio();
  const { setAudioUrl } = useAudio();
  const { setSegments } = useAudio();
  const { setKeywords } = useAudio();

  // Пример данных таблицы
  const segments = [{
    id: 21223213123,
    Start: 1,
    End: 5,
    ChannelNumber: 1,
  },{
    id: 212122334213123,
    Start: 8,
    End: 15,
    ChannelNumber: 1,
  },
  {
    id: 21243432413123,
    Start: 20,
    End: 25,
    ChannelNumber: 2,
  },
  ]
  
  const keywords = [{
    keyword: {
        Start: 10,
        End: 11,
        Name: 'Привет',
        ChannelNumber: 1,
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
      color: 'red',
  },
  {
    keyword: {
        Start: 60,
        End: 61,
        Name: 'Петька',
        ChannelNumber: 1,
        Confidence: 0.6,
      },
      color: 'red',
  }
  ]
  
  const tableData = [
    { id: '1', title: 'Audio 1', url: '/audio/rus.wav',segments: segments, keywords: keywords },
    { id: '2', title: 'Audio 2', url: '/audio/Английский.wav',segments: segments, keywords: keywords },
    { id: '3', title: 'Audio 3', url: 'https://webaudioapi.com/samples/audio-tag/chrono.mp3',segments: segments, keywords: keywords },
    // ...
  ];

  const handleRowClick = (url: string) => {
    setCurrentAudioUrl(url);
    setAudioUrl(url);
    setSegments(segments)
    setKeywords(keywords)
  };

  return (
    <StyledTable>
      <thead>
        <tr>
          <TableHeader>ID</TableHeader>
          <TableHeader>Name</TableHeader>
        </tr>
      </thead>
      <tbody>
        {tableData.map((row) => (
          <TableRow key={row.id} onClick={() => handleRowClick(row.url)}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.title}</TableCell>
          </TableRow>
        ))}
      </tbody>
    </StyledTable>
  );
};

export default Table;