import { Editor } from '@tiptap/react';
import React, { useState } from 'react';

interface FontButtonProps {
    editor: Editor
}

const FontButton: React.FC<FontButtonProps> = ({ editor }) => {
    const [selectedFont, setSelectedFont] = useState('Roboto');

    const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const font = e.target.value;
        // editor.chain().focus().setFontFamily({font}).run();
        editor.chain().focus().setFontFamily(font).run();
        setSelectedFont(font);
    };

    return (
        <div>
            {/* <label htmlFor="fontSelect">Select Font:</label> */}
            <select id="fontSelect" value={selectedFont} onChange={handleFontChange}>
                <option value="Sans-serif">Default</option>
                <option value="Inter">Inter</option>
                <option value="Comic Sans MS, Comic Sans">Comic Sans</option>
                <option value="Arial">Arial </option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="cursive">cursive</option>
                
            </select>
        </div>
    );
};

export default FontButton;
