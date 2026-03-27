delimiter ;

insert into
    extjs_base_types (
        id,
        classname,
        baseclass,
        xtype_long_modern,
        xtype_long_classic,
        name,
        vendor
    )
values
    (
        'Tualo.quill.form.field.Editor (widget.tualocodesql)',
        'Tualo.quill.form.field.Editor',
        'Ext.field.Field',
        'widget.tualo_quill_editor',
        'widget.tualo_quill_editor',
        'Tualo.quill.form.field.Editor',
        'tualo solutions GmbH'
    ) on duplicate key
update
    xtype_long_modern = values(xtype_long_modern),
    xtype_long_classic = values(xtype_long_classic);
