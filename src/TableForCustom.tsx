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

interface Props {
    handleRowClick: (url: string, keywords:any[], channelNumber: number, name: string) => void;
}
const TableForCustom: React.FC<Props>= ({handleRowClick}) => {


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
  
  const keywords1 = [{
    word: 'Коля',
    start: 15.99,
    color: 'red',
  },{
  
    word: 'Наташа',
    start: 99.99,
    color: 'green',
  }]

  const keywords2 = [{
  word: 'Thuesday',
  start: 37.4,
  color: 'red',
},{

  word: 'response',
  start: 190.45,
  color: 'green',
}]
  
  const tableData = [
    { id: '1', title: 'Русский.wav', url: '/audio/rus.wav', keywords: keywords1, channelNumber: 2 },
    { id: '2', title: 'Английский.wav', url: '/audio/Английский.wav', keywords: keywords2, channelNumber: 1 },
    // ...
  ];



  return (
    <StyledTable>
      <thead>
        <tr>
          <TableHeader>Идентификатор</TableHeader>
          <TableHeader>Имя</TableHeader>
        </tr>
      </thead>
      <tbody>
        {tableData.map((row) => (
          <TableRow key={row.id} onClick={() => handleRowClick(row.url, row.keywords, row.channelNumber, row.title)}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.title}</TableCell>
          </TableRow>
        ))}
      </tbody>
    </StyledTable>
  );
};

export default TableForCustom;