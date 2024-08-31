import { Editor } from '@tiptap/react';
import React, { useState, FC, ChangeEvent } from 'react';

interface Props {
    editor: Editor
}

const FontSizeButton: FC<Props> = ({editor}) => {
  const [selectedSize, setSelectedSize] = useState<string>('');

  const handleSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const size = event.target.value;
    setSelectedSize(size);

    // editor.chain().focus().run(({ tr }) => {
    //   const { from, to } = tr.selection;
    //   tr.setStoredMarks([]); // Удаляем все предыдущие стили
    //   tr.addMark(from, to, editor.schema.marks.textStyle.create({ fontSize: size }));
    //   return tr;
    // });
  };

  return (
    <div>
      <select value={selectedSize} onChange={handleSizeChange}>
        <option value="12px">12px</option>
        <option value="14px">14px</option>
        <option value="16px">16px</option>
        <option value="18px">18px</option>
        <option value="20px">20px</option>
      </select>
    </div>
  );
};


export default FontSizeButton;