import { Editor } from '@tiptap/react';
import React, { FC, useState } from 'react';
import { Level } from '@tiptap/extension-heading';

interface Props {
    editor: Editor
}

const HeadingButton: FC<Props> = ({ editor }) => {
    const [selectedHeading, setSelectedHeading] = useState(0);

    const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === '0') {
            editor.chain().focus().setParagraph().run()
            setSelectedHeading(0);
        } else {
        let header: Level = 1
        if (Number(e.target.value) == 1) {
            header = 1
        } if (Number(e.target.value) == 2) {
            header = 2
        } if (Number(e.target.value) == 3) {
            header = 3
        }
        editor.chain().focus().toggleHeading({ level: header }).run();
        setSelectedHeading(header);
        }
    };

    return (
        <div>
            {/* <label htmlFor="fontSelect">Заголовок:</label> */}
            <select id="fontSelect" value={selectedHeading} onChange={handleFontChange}>
                <option value={0}>Параграф</option>
                <option value={1}>Заголовок 1</option>
                <option value={2}>Заголовок 2</option>
                <option value={3}>Заголовок 3</option>
            </select>
        </div>
    );
};

export default HeadingButton;
