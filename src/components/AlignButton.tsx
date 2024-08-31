import { Editor } from '@tiptap/react';
import React, { FC, useState } from 'react';
import { Level } from '@tiptap/extension-heading';

//material
import FormatAlignLeftIcon from '@material-ui/icons/FormatAlignLeft';
import FormatAlignCenterIcon from '@material-ui/icons/FormatAlignCenter';
import FormatAlignRightIcon from '@material-ui/icons/FormatAlignRight';

interface Props {
    editor: Editor
}

const AlignButton: FC<Props> = ({ editor }) => {
    const [selectedAlign, setSelectedAlign] = useState('left');

    const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const align = e.target.value
        editor.chain().focus().setTextAlign(align).run()
        setSelectedAlign(align)
    };

    return (
        <div>
            <select id="fontSelect" value={selectedAlign} onChange={handleFontChange}>
                <option value={'left'}>left</option>
                <option value={'center'}>center</option>
                <option value={'right'}>right</option>
            </select>
        </div>
    );
};

export default AlignButton