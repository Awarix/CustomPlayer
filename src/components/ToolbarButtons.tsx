import React, { useRef, useState } from 'react'
import { Button, Slider } from '@material-ui/core';
import { Editor, useEditor, type Editor as refEditor} from "@tiptap/react";

const ToolbarButtons = ({ editor }: { editor: Editor | null }) => {
  const rteRef = useRef<refEditor | null>(null);
  const [htmlResult, setHtmlResult] = useState("");

  return (
    <div className='aditionalButtons' 
    style={{
        display: 'flex', 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'flex-end', 
        gap: '1rem',
        margin: '1rem 0'
        }}>
      <Button
      variant='outlined'
      color='primary'
      size='small'
      onClick={() => console.log('clicked')}
      >
        Скачать
      </Button>
      <Button
      variant='outlined'
      color='primary'
      size='small'
      onClick={() => console.log(htmlResult)}
      >
        Копировать
      </Button>
      <Button
      variant='contained'
      color='primary'
      size='small'
      onClick={() => setHtmlResult(rteRef.current?.getHTML() ?? "")}
      >
        Сохранить
      </Button>
      </div>
  )
}

export default ToolbarButtons