Ext.define('Tualo.quill.form.field.Editor', {
    extend: 'Ext.form.field.TextArea',
    alias: ['widget.tualo_quill_editor'],
    language: null,

    height: 300,

    fieldSubTpl: [ // note: {id} here is really {inputId}, but {cmpId} is available 
        '<textarea id="{id}" data-ref="inputEl" type="{type}" {inputAttrTpl}',
        ' size="1"', // allows inputs to fully respect CSS widths across all browsers 
        '<tpl if="name"> name="{name}"</tpl>',
        '<tpl if="placeholder"> placeholder="{placeholder}"</tpl>',
        '{%if (values.maxLength !== undefined){%} maxlength="{maxLength}"{%}%}',
        '<tpl if="readOnly"> readonly="readonly"</tpl>',
        '<tpl if="disabled"> disabled="disabled"</tpl>',
        '<tpl if="tabIdx != null"> tabindex="{tabIdx}"</tpl>',
        '<tpl if="fieldStyle"> style="{fieldStyle}"</tpl>',
        '<tpl foreach="inputElAriaAttributes"> {$}="{.}"</tpl>',
        ' class="{fieldCls} {typeCls} {typeCls}-{ui} {editableCls} {inputCls}" autocomplete="off"/>',
        '<tpl if="value">{[Ext.util.Format.htmlEncode(values.value)]}"</tpl>',
        '</textarea>',
        {
            disableFormats: true
        }
    ],


    initComponent: function () {
        var me = this;
        me.callParent();
        window.mEditor = this;

    },

    afterRender: function () {
        var me = this;
        me.callParent(arguments);
        try {
            me.editor = me.createEditor();
        } catch (e) {
            console.error(e);
        }
    },

    /*
    createEditor: function () {
        let o = {
            width: this.getWidth() - this.labelWidth - 17,
            height: this.getHeight() - 2
        };

        if (typeof this.monacoeditor == 'undefined') {
            document.getElementById(this.id + '-inputEl').style.display = 'none';



            this.monacoeditor = monaco.editor.create(document.getElementById(this.id + '-inputEl').parentNode, {
                language: this.language,
                automaticLayout: true,
                //roundedSelection: false,
                scrollBeyondLastLine: true,
                readOnly: false,
                theme: "vs",
                value: this._value,
                fontSize: 10,
                useShadows: true,

                // Render vertical arrows. Defaults to false.
                verticalHasArrows: true,
                // Render horizontal arrows. Defaults to false.
                horizontalHasArrows: true,

                // Render vertical scrollbar.
                // Accepted values: 'auto', 'visible', 'hidden'.
                // Defaults to 'auto'
                vertical: 'visible',
                // Render horizontal scrollbar.
                // Accepted values: 'auto', 'visible', 'hidden'.
                // Defaults to 'auto'
                horizontal: 'visible',
                verticalScrollbarSize: 17,
                horizontalScrollbarSize: 17,
                arrowSize: 30
            });
            this.monacoeditor.layout(o);

            this.up().on('resize', this.resizeMonacoEditor, this);
            this.monacoeditor.getModel().onDidChangeContent(this.onDidChangeContent.bind(this));
        }
    },
    */
    intern: false,
    createEditor: function (config) {
        var me = this,
            editor;

        Quill.prototype.getHtml = function () {
            return this.container.querySelector('.ql-editor').innerHTML;
        };


        var toolbarOptions = [
            [{ 'font': [] }],
            ['bold', 'italic', 'underline'],
            ['link'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['omega']
        ];

        editor = new Quill('#' + this.id + '-inputEl-quilleditor', {
            modules: {
                toolbar: {
                    container: toolbarOptions,
                    handlers: {
                        'customControl': () => { console.log('customControl was clicked') }
                    }
                }
            },
            theme: 'snow'
        });

        try {
            var customButton = document.querySelectorAll('.ql-omega');
            customButton = customButton[customButton.length - 1];
            customButton.addEventListener('click', this.initContextMenu.bind(this));
        } catch (E) { }

        editor.on('text-change', function (delta, oldDelta, source) {
            me.intern = true;

            me.setValue(editor.getHtml());
            me.fireEvent('change', me, editor.getHtml());
            me.fireEvent('text-change', me, delta, oldDelta, source);

            me.intern = false;
        });
        editor.on('selection-change', function (range, oldRange, source) { me.fireEvent('selection-change', me, range, oldRange, source); });
        return editor;
    },
    onDestroy: function () {
        // this.monacoeditor.dispose();
        this.callParent();
    },
    getSubmitValue: function () {
        var me = this;
        return me.editor.getHtml();
    },

    setValue: function (v) {
        var me = this,
            t = (new Date()).getTime();

        if (typeof me.lastchange == 'undefined') me.lastchange = (new Date()).getTime() - 1000;
        if (t - me.lastchange < 100) return;

        me.callParent([v]);
        me.lastchange = t;

        if (me.intern !== true) {
            if (me.editor) {
                me.editor.setContents(me.editor.clipboard.convert(v), 'silent');
            } else {
                me.on('editorReady', function () {
                    if (me.editor.getHtml() != me.editor.clipboard.convert(v))
                        me.editor.setContents(me.editor.clipboard.convert(v), 'silent');
                }, this, { single: true });
            }

        }

    },
});