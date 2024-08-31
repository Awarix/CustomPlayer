// src/Tiptap.jsx
import { EditorProvider, FloatingMenu, BubbleMenu, useCurrentEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';

// import './editor.scss'
import React, { useState } from 'react'
import ListItem from '@tiptap/extension-list-item'

//material
import { Button, Paper, Slider } from '@material-ui/core';
import FormatBoldIcon from "@material-ui/icons/FormatBold";
import IconButton from '@material-ui/core/IconButton';
import { FormatItalic } from '@material-ui/icons';
import { FormatStrikethrough } from '@material-ui/icons';
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import BorderColorIcon from '@material-ui/icons/BorderColor';
import TextFormatIcon from '@material-ui/icons/TextFormat';
import FormatSizeIcon from '@material-ui/icons/FormatSize';
import FormatUnderlinedIcon from '@material-ui/icons/FormatUnderlined';
import FormatClearIcon from '@material-ui/icons/FormatClear';
import FormatAlignLeftIcon from '@material-ui/icons/FormatAlignLeft';
import FormatAlignCenterIcon from '@material-ui/icons/FormatAlignCenter';
import FormatAlignRightIcon from '@material-ui/icons/FormatAlignRight';
import EditorStyled from "./style";
import ToolbarButtons from './ToolbarButtons';
import FontButton from './FontButton';
import FontFamily from '@tiptap/extension-font-family';
import Heading from '@tiptap/extension-heading';
import HeadingButton from './HeadingButton';
import AlignButton from './AlignButton';
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  btn: {
    color: '#171616',
    backgroundColor: '#ffffff',
    // padding: '-5px 10px',
    width: '40px',
    height: '40px',
    textAlign: 'center',
    border: 'none',
    boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px',
    borderRadius: '1px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f0eaea',
      color: '#000',
    },
  },
});

const MenuBar = () => {
  const { editor } = useCurrentEditor()
  const classes = useStyles();
  const [plainText, setPlainText] = useState('')
  const getText = () => {
    const text = editor?.getHTML()
    if (text) {
    setPlainText(text)
    }
  }

  if (!editor) {
    return null
  }

  return (
    <>
     
    <div style={{display: 'flex', flexDirection: 'row'}}>
      <button onClick={getText}>getText</button>
      <FontButton editor={editor}/>
      <HeadingButton editor={editor} />
      <button
      title="Жирный"
      onClick={() => editor.chain().focus().toggleBold().run()}
      className={classes.btn}
      >B
      </button>
      <IconButton 
        color="primary" 
        title="Жирный"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .toggleBold()
            .run()
        }
        className={classes.btn}
        >
        <FormatBoldIcon />
      </IconButton>
      <IconButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .toggleItalic()
            .run()
        }
        color='primary'
        title='Курсив'
        
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        <FormatItalic />
        </IconButton>
        <IconButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .toggleStrike()
            .run()
        }
        color="primary"
        title="Зачеркнутый"
        className={editor.isActive('strike') ? 'is-active' : ''}
      >
        <FormatStrikethrough />
      </IconButton>
      <IconButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            // .toggleHighlight()
            .run()
        }
        color="primary"
        title="Выделить цветом"
        className={editor.isActive('highlight') ? 'is-active' : ''}
      >
        <BorderColorIcon />
      </IconButton>
      <IconButton 
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        color="primary"
        title="Убрать выделение"
        disabled={
          !editor.can()
            .chain()
            .focus()
            .unsetAllMarks()
            .run()
        }
        >
        <FormatClearIcon />
      </IconButton>
      <AlignButton editor={editor} />
      {/* <IconButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
        // color={editor.isFocused ? "primary" : 'default'}
        color="primary"
        title="Выравнивание по левому краю"
      >
        <FormatAlignLeftIcon />
      </IconButton>
      <IconButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
        // color={editor.isFocused ? "primary" : 'default'}
        color="primary"
        title="Выравнивание по центру"
      >
        <FormatAlignCenterIcon />
      </IconButton>
      <IconButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        // color={editor.isFocused ? "primary" : 'default'}
        color="primary"
        title="Выравнивание по правому краю"
      > */}
        
      {/* <button onClick={() => editor.chain().focus().clearNodes().run()}>
        Отчистить текст
      </button> */}
      {/* <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={editor.isActive('paragraph') ? 'is-active' : ''}
      >
        paragraph
      </button> */}
      {/* <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
      >
        h1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
      >
        h2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
      >
        h3
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}
      >
        h4
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        className={editor.isActive('heading', { level: 5 }) ? 'is-active' : ''}
      >
        h5
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
        className={editor.isActive('heading', { level: 6 }) ? 'is-active' : ''}
      >
        h6
      </button> */}
      <IconButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
        color="primary"
        title="Ненумерованный список"
      >
        <FormatListBulletedIcon/>
        </IconButton>
        <IconButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
        color="primary"
        title="Нумерованный список"
      >
        <FormatListNumberedIcon />
        </IconButton>
      {/* <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        horizontal rule
      </button> */}
      {/* <button onClick={() => editor.chain().focus().setHardBreak().run()}>
        hard break
      </button> */}
      <IconButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .undo()
            .run()
        }
        color="primary"
        title="Действие назад"
      >
        <UndoIcon />
        </IconButton>
      <IconButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .redo()
            .run()
        }
        color="primary"
        title="Действие вперёд"
      >
        <RedoIcon />
        </IconButton>
      </div>
      {plainText ?? <p>{plainText}</p>}
    </>
  )
}

const content = `
<p> Коля ну что там. </p>
<p> <span style="border-bottom: 1px dashed red ">В общем получается</span> что она запустила говорит хотя <span style="color: blue">40</span> процентов не должна была запускать в этот производство. </p>
<p> <span style="color: #F06292">Ага.<span></p>
<p> Ну вот это 30 процентов это 30000 нас высчитывают.</p>
<p> <span style="color: #F06292">Ага.</span> </p>
<p> Ну вот и она говорит пушек можно сделать на пофиг если делают. </p>
<p> Там как бы да по доплата ещё нужна. </p>
<p> А зачем нам этот пофиг то. </p>
<p> А чтобы это как бы <span style="color: blue">30</span> процентов не снять надо этот. </p>
<p> <span style="color: blue">3 3</span> метра там как бы я не знаю в общем что за бардак такое в общем то. </p>
<p> Да <span style="color: blue">Коль</span> да не надо пускай остаётся то что есть. </p>
<p> Пускай там на на сколько ты. </p>
<p> Она <span style="color: blue">70</span> сантиметров у тебя. </p>
<p> Убирается на <span style="color: blue">60</span>.</p>
`



const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  // TextStyle.configure({ types: [ListItem.name] }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false, 
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false, 
    },
  }),
  TextStyle.extend({
    addAttributes() {
    return {
    style: {
    // default: this.options.HTMLAttributes.style
    }
    }
    },
    }),
  Highlight.configure({
    HTMLAttributes: {
      class: 'my-custom-class',
    },
  }),
  TextAlign.configure({
    alignments: ['left', 'center', 'right'],
    types: ['heading', 'paragraph'],
  }),
  FontFamily.configure({
    types: ['textStyle'],
  }),
  Heading.configure({
    levels: [1, 2, 3, 5],
  }),  
]



export default () => {
  const { editor } = useCurrentEditor()
  return (
    <EditorStyled>
    <ToolbarButtons editor={editor}/>
    <Paper style={{minHeight: '700px', padding: '1rem', overflow: 'auto'}}>
    <EditorProvider slotBefore={<MenuBar />} extensions={extensions} content={content} children={undefined} injectCSS= {false}></EditorProvider>
    {/* <MenuBar />  */}
    {/* <EditorContent editor={editor} /> */}
    </Paper>
    </EditorStyled>
  )
}