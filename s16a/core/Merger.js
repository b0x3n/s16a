///////////////////////////////////////////////////////////
//  System16/s16a/core/Merger.js                         //
///////////////////////////////////////////////////////////
//
//
//


    import { LoadFile } from            "./../../core/LoadFile.js";


    export const    Merger              = () =>
    {

///////////////////////////////////////////////////////////
//  _merge()                                             //
///////////////////////////////////////////////////////////
//
        const   _merge                  = (
            
            asm_files,
            obj_files,
            sections
        
        ) =>
        {

            global.__s16_verbose(`<!<fg blue>!>+-<!<reset>!> Merging ${global.__s16a_number(obj_files.length)} object files...\n<!<fg blue>!>|<!<reset>!>\n`);

            for (let file_no = 0; file_no < obj_files.length; file_no++)
            {

                const   _objFileInfo    = LoadFile(obj_files[file_no]);

                if (typeof _objFileInfo === 'string')
                    global.__s16_error(_objFileInfo);

                if (asm_files.indexOf(_objFileInfo.path) >= 0)
                    global.__s16_error(`Input file ${global.__s16a_file(_objFileInfo.path)} included more than once`);

                asm_files.push(_objFileInfo.path);

                const   __sections      = JSON.parse(_objFileInfo.data);

                global.__s16_verbose(`<!<fg blue>!>+--<!<reset>!> Merging object file ${global.__s16a_file(_objFileInfo.path)}:\n<!<fg blue>!>|<!<reset>!>\n`);
                ///dump_object(__sections);

                for (let section_no = 0; section_no < global.S16_SECTIONS.length; section_no++)
                {
                    let     __label_no  = 0;

                    global.__s16_verbose(`<!<fg blue>!>+---<!<reset>!> Merging ${global.__s16a_section(global.S16_SECTIONS[section_no])}...\n`);
                    
                    for (__label_no; __label_no < __sections[section_no].section.label.length; __label_no++)
                    {
                        //console.log(`Merging label ${__sections[section_no].section.label[__label_no]}`);
                    
                        const   _path = __sections[section_no].section.path[__label_no];
                        const   _line = __sections[section_no].section.line[__label_no];
                        const   _label = __sections[section_no].section.label[__label_no];
                        const   _type = __sections[section_no].section.type[__label_no];
                        const   _size = __sections[section_no].section.size[__label_no];
                        const   _length = __sections[section_no].section.length[__label_no];
                        const   _data = __sections[section_no].section.data[__label_no];

                        let     _offset = __sections[section_no].section.offset[__label_no];

                        const   _objLabel = sections.find(_label);

                        if (typeof _objLabel === 'string')
                            global.__s16_error(_objLabel);

                        if (typeof _objLabel === 'object' && section_no !== 0)
                            global.__s16_file_error([ _path, _line ], `Label ${global.__s16a_label(_label)} previously declared in ${global.__s16a_file(_objLabel.path)}, line ${global.__s16a_number(_objLabel.line)}`);

    //  All of the offsets must be updated...
    //
                        if (Array.isArray(_offset))
                        {
                            for (let offset_no = 0; offset_no < _offset.length; offset_no++)
                                _offset[offset_no] += sections.sections[section_no].section.total_length;
                        }
                        else
                            _offset += sections.sections[section_no].section.total_length;

                        sections.sections[section_no].section.path.push(_path);
                        sections.sections[section_no].section.line.push(_line);
                        sections.sections[section_no].section.label.push(_label);
                        sections.sections[section_no].section.type.push(_type);
                        sections.sections[section_no].section.size.push(_size);
                        sections.sections[section_no].section.data.push(_data);
                        sections.sections[section_no].section.length.push(_length);
                        sections.sections[section_no].section.offset.push(_offset);
 
                        global.__s16_verbose(`<!<fg blue>!>+----<!<reset>!> Merging label ${global.__s16a_label(_label)} (${global.__s16a_number(_length)} bytes @ offset ${global.__s16a_number(sections.sections[section_no].section.total_length)})\n`)

                        sections.sections[section_no].section.total_length += _length;

                    }

                    global.__s16_verbose(`<!<fg blue>!>+---<!<reset>!> Done, ${global.__s16a_number(__label_no)} entries, ${global.__s16a_number(__sections[section_no].section.total_length)} bytes.\n<!<fg blue>!>|<!<reset>!>\n`)
                }

            }

            //global.__s16_verbose(`<!<fg blue>!>|<!<reset>!>\n`);

            return true;
    
        };


        return {

            merge:                      _merge

        };

    };

