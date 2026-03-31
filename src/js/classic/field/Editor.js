Ext.define('Tualo.quill.form.field.Editor', {
    extend: 'Ext.form.field.TextArea',
    alias: ['widget.tualo_quill_editor'],
    language: null,

    height: 300,

    fieldSubTpl: [ // note: {id} here is really {inputId}, but {cmpId} is available 
        '<input id="{id}" data-ref="inputEl" type="hidden" {inputAttrTpl}',
        ' size="1"', // allows inputs to fully respect CSS widths across all browsers 
        '<tpl if="name"> name="{name}"</tpl>',
        '<tpl if="value"> value="{value}"</tpl>',
        '<tpl if="placeholder"> placeholder="{placeholder}"</tpl>',
        '{%if (values.maxLength !== undefined){%} maxlength="{maxLength}"{%}%}',
        '<tpl if="readOnly"> readonly="readonly"</tpl>',
        '<tpl if="disabled"> disabled="disabled"</tpl>',
        '<tpl if="tabIdx != null"> tabindex="{tabIdx}"</tpl>',
        '<tpl if="fieldStyle"> style="{fieldStyle}"</tpl>',
        '<tpl foreach="inputElAriaAttributes"> {$}="{.}"</tpl>',
        ' class="{fieldCls} {typeCls} {typeCls}-{ui} {editableCls} {inputCls}" autocomplete="off"/>',
        '<div id="{id}-quilleditor"  data-ref="inputEl" rows="1" {inputAttrTpl} style="background-color: white;">',
        '<tpl if="value">{[values.value]}</tpl>',
        '<div id="{id}-quilleditor-toolbar"></div>',
        '</div>'
        ,
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
            ['more']
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
            var customButton = document.querySelectorAll('.ql-more');
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
    initContextMenu: function (e) {


        var contextMenu = new Ext.menu.Menu({ items: [], width: 600, scrollable: 'y' });

        Tualo.Ajax.request({
            url: './ds/texttemplate/read',
            params: {
                filter: JSON.stringify([{
                    operator: 'eq',
                    property: 'texttemplate__klasse',
                    value: this.templateid
                }])
            },
            scope: this,
            json: function (o) {
                if (o.success) {

                    o.data.forEach(element => {

                        contextMenu.add({
                            text: element.texttemplate__text.substring(0, 70) + '...',
                            fulltext: element.texttemplate__text,
                            scope: this,
                            handler: this.onItemClick
                        })

                    });
                    var xy = [e.x, e.y];
                    contextMenu.showAt(xy);
                }
            }
        });

    },
    onDestroy: function () {
        // this.monacoeditor.dispose();
        this.callParent();
    },
    getSubmitValue: function () {
        var me = this;
        console.log('getSubmitValue', me);
        if (me.editor) {
            return me.editor.getHtml();
        }
        return me.callParent();
    },

    setValue: function (v) {
        var me = this,
            t = (new Date()).getTime();

        if (typeof me.lastchange == 'undefined') me.lastchange = (new Date()).getTime() - 1000;
        if (t - me.lastchange < 100) return;

        me.callParent([v]);
        me.lastchange = t;
        console.log('setValue', v);

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