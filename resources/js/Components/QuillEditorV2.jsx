import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import QuillTableBetter from 'quill-table-better';
import 'quill-table-better/dist/quill-table-better.css';

// Register plugins
const BlockEmbed = Quill.import('blots/block/embed');
class DividerBlot extends BlockEmbed { }
DividerBlot.blotName = 'divider';
DividerBlot.tagName = 'hr';

try {
    Quill.register(DividerBlot, true);
    Quill.register({
        'modules/table-better': QuillTableBetter
    }, true);
} catch (e) {
    //
}

const icons = Quill.import('ui/icons');
icons['divider'] = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>';


export default function QuillEditorV2({ value, onChange, className }) {
    const editorRef = useRef(null);
    const quillRef = useRef(null);
    const [isInternalChange, setIsInternalChange] = useState(false);

    useEffect(() => {
        if (!quillRef.current && editorRef.current) {
            const toolbarOptions = [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                ['link', 'image', 'video'],
                ['table-better', 'divider'], 
                ['clean']
            ];

            const quill = new Quill(editorRef.current, {
                theme: 'snow',
                modules: {
                    table: false,
                    toolbar: {
                        container: toolbarOptions,
                        handlers: {
                            divider: function() {
                                const range = this.quill.getSelection(true);
                                if (range) {
                                    this.quill.insertText(range.index, '\n', Quill.sources.USER);
                                    this.quill.insertEmbed(range.index + 1, 'divider', true, Quill.sources.USER);
                                    this.quill.setSelection(range.index + 2, Quill.sources.SILENT);
                                }
                            },
                            image: function() {
                                console.log("Custom image handler triggered");
                                const range = this.quill.getSelection() || { index: this.quill.getLength() };
                                console.log("Using insertion range/index:", range);

                                const input = document.createElement('input');
                                input.setAttribute('type', 'file');
                                input.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon, image/webp, .webp');
                                input.click();

                                input.onchange = () => {
                                    const file = input.files[0];
                                    console.log("File chosen:", file ? file.name : "None", "Mime type:", file ? file.type : "None");
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (e) => {
                                            console.log("File read successfully as DataURL, inserting embed...");
                                            try {
                                                this.quill.insertEmbed(range.index, 'image', e.target.result, Quill.sources.USER);
                                                this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
                                                console.log("Embed inserted successfully.");
                                            } catch (err) {
                                                console.error("Failed to insert embed:", err);
                                            }
                                        };
                                        reader.onerror = (err) => {
                                            console.error("FileReader error:", err);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                };
                            }
                        }
                    },
                    'table-better': {
                        language: 'en_US',
                        menus: ['column', 'row', 'merge', 'table', 'cell', 'wrap', 'copy', 'delete'],
                        toolbarTable: true
                    },
                    keyboard: {
                        bindings: QuillTableBetter.keyboardBindings
                    }
                }
            });

            // Set initial value safely using html
            if (value) {
                const delta = quill.clipboard.convert({ html: value });
                quill.setContents(delta, 'silent');
            }

            quill.on('text-change', (delta, oldDelta, source) => {
                if (source === 'user' || source === 'api') {
                    setIsInternalChange(true);
                    // Use semantic html for quill v2
                    const html = quill.getSemanticHTML();
                    onChange(html);
                }
            });

            quillRef.current = quill;
        }
    }, []);

    // Handle external value changes (like resetting form)
    useEffect(() => {
        if (quillRef.current && !isInternalChange) {
            const currentHtml = quillRef.current.getSemanticHTML();
            if (value !== currentHtml) {
                const delta = quillRef.current.clipboard.convert({ html: value || '' });
                quillRef.current.setContents(delta, 'silent');
            }
        }
        if (isInternalChange) {
            setIsInternalChange(false);
        }
    }, [value]);

    return (
        <div className={className}>
            <div ref={editorRef} style={{ height: 'calc(100% - 42px)' }} />
        </div>
    );
}
