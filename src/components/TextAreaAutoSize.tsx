import React, { useLayoutEffect, useRef } from "react";

interface TextAreaAutoSizeProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
}


function resizeTextArea(textarea: HTMLTextAreaElement) {
    if(!textarea) return;
    textarea.style.height = '0';
    textarea.style.height = textarea.scrollHeight + "px";
}

function TextAreaAutoSize({ ...props }: TextAreaAutoSizeProps) {
    const inputRef = useRef<HTMLTextAreaElement>(null);

      


    return <textarea ref={inputRef} {...props} />;
}

export default TextAreaAutoSize;
