///////////////////////////////////////////////////////////
//  System16/s16a/core/Linker.js                         //
///////////////////////////////////////////////////////////
//
//
//


///////////////////////////////////////////////////////////
//  The Linker module.                                   //
///////////////////////////////////////////////////////////
//
    export const    Linker              = (

        sections

    ) =>
    {


        const   _objExe                 =
        {
            'model':                    0,
            'maxaddr':                  0,
            'regsize':                  0,
            'byteorder':                0,
            'size':                     0,
            'buffer':                   false,
            'ro_offset':                0,
            'rw_offset':                0,
            'code_offset':              0,
            'reg_offsets':              false
        };


        const   __labels                = [];


///////////////////////////////////////////////////////////
//  __map_header()                                       //
///////////////////////////////////////////////////////////
//
        const   __map_header            = () =>
        {

            const   __exe_view          = new DataView(_objExe.buffer);

    ///////////////////////////////////////////////////////
    //  First six bytes are the ID string s16exe.
    //
            __exe_view.setUint8(0, 's'.charCodeAt(0));
            __exe_view.setUint8(1, '1'.charCodeAt(0));
            __exe_view.setUint8(2, '6'.charCodeAt(0));
            __exe_view.setUint8(3, 'e'.charCodeAt(0));
            __exe_view.setUint8(4, 'x'.charCodeAt(0));
            __exe_view.setUint8(5, 'e'.charCodeAt(0));

    ///////////////////////////////////////////////////////
    //  Next four bytes is the date of assembly.
    //
            __exe_view.setUint8(global.S16_OFFSET_DAY, new Date().getUTCDate());
            __exe_view.setUint8(global.S16_OFFSET_MONTH, (new Date().getUTCMonth() + 1));
            __exe_view.setUint16(global.S16_OFFSET_YEAR, new Date().getUTCFullYear, global.little_endian);

    ///////////////////////////////////////////////////////
    //  Next two bytes are the version info.
    //
            __exe_view.setUint8(global.S16_OFFSET_MAJOR, 1);
            __exe_view.setUint8(global.S16_OFFSET_MINOR, 1);

    ///////////////////////////////////////////////////////
    //  Now the following properties:
    //
    //      Model: 1 byte
    //      Regsize: 1 byte
    //      Maxaddr: 4 bytes
    //      byteorder: 2 bytes
    //
            __exe_view.setUint8(global.S16_OFFSET_MODEL, _objExe.model);
            __exe_view.setUint8(global.S16_OFFSET_REGSIZE, _objExe.regsize);
            __exe_view.setUint32(global.S16_OFFSET_MAXADDR, _objExe.maxaddr, global.little_endian);
            __exe_view.setUint8(global.S16_OFFSET_BYTEORDER, _objExe.byteorder[0]);
            __exe_view.setUint8((global.S16_OFFSET_BYTEORDER + 1), _objExe.byteorder[1]);

    ///////////////////////////////////////////////////////
    //  Next 4 bytes stores the total exe size.
    //
            __exe_view.setUint32(global.S16_OFFSET_EXESIZE, _objExe.size);

        };


///////////////////////////////////////////////////////////
//  __set_register()                                     //
///////////////////////////////////////////////////////////
//
        const   __set_register          = (

            reg_name,
            value

        ) =>
        {

            const   __exe_view          = new DataView(_objExe.buffer);

            if (
                (reg_name === 'OI') ||
                (reg_name === 'II') ||
                (reg_name === 'FL') ||
                (reg_name === 'RT')
            )
                __exe_view.setUint8(_objExe.reg_offsets[reg_name], value);
            else
            {
                if (_objExe.regsize === 1)
                    __exe_view.setUint8(_objExe.reg_offsets[reg_name], value);
                else if (_objExe.regsize === 2)
                    __exe_view.setUint16(_objExe.reg_offsets[reg_name], value, global.little_endian);
                else
                    __exe_view.setUint32(_objExe.reg_offsets[reg_name], value, global.little_endian);
            }

//            global.__s16_verbose(`${global.__s16a_register(reg_name)}=${global.__s16a_number(value)} @ offset ${global.__s16a_number(_objExe.reg_offsets[reg_name])} `);

        };


///////////////////////////////////////////////////////////
//  __map_registers()                                    //
///////////////////////////////////////////////////////////
//
        const   __map_registers         = () =>
        {

            const   __exe_view          = new DataView(_objExe.buffer);

    //  Assume a flat model.
    //
            let     __ro_segment        = 0;
            let     __rw_segment        = 0;
            let     __code_segment      = 0;

            //global.__s16_verbose(`<!<fg blue>!>|\n+--<!<reset>!> Building ${global.__s16a_section(global.S16_SECTION_HEADER)} section:\n`);
            global.__s16_verbose(`<!<fg blue>!>|\n+--<!<reset>!> <!<bold>!>Register<!<reset>!> buffer length: ${global.__s16a_number(_objExe.reg_buflen)} bytes @ offset ${global.__s16a_number(global.S16_REGISTER_OFFSET)}\n<!<fg blue>!>|\n<!<reset>!>`);
           

    //  Split model, the ro and rw sectiosn share
    //  a separate segment.
    //
            if (_objExe.model === 1)
            {
                __ro_segment            = 1;
                __rw_segment            = 1;
            }

    //  Multi - ro and rw each have their own separate
    //  segment.
    //
            if (_objExe.model === 2)
            {
                __ro_segment            = 1;
                __rw_segment            = 2;
            }

            global.__s16_verbose(`<!<fg blue>!>+--<!<reset>!> ${global.__s16a_section(global.S16_SECTION_RO)} section (${global.__s16a_number(_objExe.rw_offset - _objExe.ro_offset)} bytes) in segment ${global.__s16a_number(__ro_segment)} @ offset ${global.__s16a_number(_objExe.ro_offset)}\n`);
            global.__s16_verbose(`<!<fg blue>!>+--<!<reset>!> ${global.__s16a_section(global.S16_SECTION_RW)} section (${global.__s16a_number(_objExe.code_offset - _objExe.rw_offset)} bytes) in segment ${global.__s16a_number(__rw_segment)} @ offset ${global.__s16a_number(_objExe.rw_offset)}\n`);
            global.__s16_verbose(`<!<fg blue>!>+--<!<reset>!> ${global.__s16a_section(global.S16_SECTION_CODE)} section (${global.__s16a_number(_objExe.size - _objExe.code_offset)} bytes) in segment ${global.__s16a_number(__code_segment)} @ offset ${global.__s16a_number(_objExe.code_offset)}\n`);
            
            __set_register('ROS', __ro_segment);
            __set_register('RWS', __rw_segment);
            __set_register('CS', __code_segment);

            __set_register('ROO', _objExe.ro_offset);
            __set_register('RWO', _objExe.rw_offset);
            __set_register('CO', _objExe.code_offset);

            __set_register('BP', _objExe.maxaddr);
            __set_register('IP', _objExe.code_offset);
            __set_register('SP', _objExe.maxaddr);

            __set_register('HB', _objExe.size);
            __set_register('HP', _objExe.size);

            __set_register('OI', 0);
            __set_register('II', 0);

            __set_register('FL', 0);
            __set_register('RT', 0);

            __set_register('AX', 0);
            __set_register('BX', 0);
            __set_register('CX', 0);
            __set_register('DX', 0);
            __set_register('EX', 0);
            __set_register('FX', 0);

        };


///////////////////////////////////////////////////////////
//  __map_data()                                         //
///////////////////////////////////////////////////////////
//
        const   __map_data              = () =>
        {

            const   __exe_view          = new DataView(_objExe.buffer);

            let     __data_offset       = _objExe.ro_offset;

            for (let section_no = 2; section_no < 4; section_no++)
            {

                if (section_no === 1)
                    global.__s16_verbose(`<!<fg blue>!>|\n+--<!<reset>!> Mapping ${global.__s16a_section('ro')} section @ offset ${global.__s16a_number(__data_offset)}:\n<!<fg blue>!>|<!<reset>!>\n`);
                else
                    global.__s16_verbose(`<!<fg blue>!>|\n+--<!<reset>!> Mapping ${global.__s16a_section('rw')} section @ offset ${global.__s16a_number(__data_offset)}:\n<!<fg blue>!>|<!<reset>!>\n`);
            
    //  Everything should be a number, if a string is
    //  found it should be a reference to either a
    //  label or a register.
    //
                const   __section       = sections.sections[section_no].section;

                for (let label_no = 0; label_no < __section.label.length; label_no++)
                {
                    const   __path      = __section.path[label_no];
                    const   __line      = __section.line[label_no];
                    const   __label     = __section.label[label_no];
                    const   __type      = __section.type[label_no];
                    const   __size      = __section.size[label_no];
                    const   __data      = __section.data[label_no];
                    const   __length    = __section.length[label_no];
                    const   __offset    = __section.offset[label_no];

                    global.__s16_verbose(`<!<fg blue>!>+---<!<reset>!> Mapping ${global.__s16a_label(__label)}${global.__s16a_size(__size)} `);
                    global.__s16_verbose(`(${global.__s16a_number(__length)} bytes @ offset ${global.__s16a_number(__data_offset)})\n`);


                    for (let item_no = 0; item_no < __data.length; item_no++)
                    {
                        if (__type === '1')
                            __exe_view.setUint8(__data_offset, __data[item_no]);
                        if (__type === '2')
                            __exe_view.setUint16(__data_offset, __data[item_no], global.little_endian);
                        if (__type === '4')
                            __exe_view.setUint32(__data_offset, __data[item_no], global.little_endian);
                    
                        __data_offset += parseInt(__type);
                    }
                    
                }

                global.__s16_verbose(`<!<fg blue>!>|\n+--<!<reset>!> Done, ${global.__s16a_number(__section.label.length)} total entries, ${global.__s16a_number(__section.total_length)} bytes\n`);

            }

        };


///////////////////////////////////////////////////////////
//  __check_instruction()                                //
///////////////////////////////////////////////////////////
//
        const   __check_instruction     = mnemonic =>
        {

            const   __suffix            = mnemonic.substring(mnemonic.length - 2);

            if (_objExe.regsize === 1)
            {
                if (__suffix === '16' || __suffix === '32')
                    return `Cannot use instruction ${global.__s16a_mnemonic(mnemonic)} - <!<bold>!>regisze<!<reset>!> is ${global.__s16a_number(_objExe.regsize)}`;
            }
            if (_objExe.regsize === 2)
            {
                if (__suffix === '32')
                    return `Cannot use instruction ${global.__s16a_mnemonic(mnemonic)} - <!<bold>!>regisze<!<reset>!> is ${global.__s16a_number(_objExe.regsize)}`;
            }

        };


        const   __get_code_line         = line =>
        {

            let     _opcode             = line[0];
            let     _modifiers          = 0;
            let     _params             = [];

            for (let param_no = 1; param_no < line.length; param_no++)
            {

                if (typeof line[param_no] === 'string')
                {
                    if (line[param_no].substring(0, 1) === '%')
                    {
                        _modifiers |= global.S16_ADDR_DIRECT[(param_no - 1)];
                        line[param_no] = line[param_no].substring(1);
                    }
                    if (line[param_no].substring(0, 1) === '#')
                    {
                        _modifiers |= global.S16_ADDR_INDIRECT[(param_no - 1)];
                        line[param_no] = line[param_no].substring(1);
                    }

                    const   __ref = line[param_no];

    //  Is it a register?
    //
                    if (_objExe.reg_offsets.hasOwnProperty(line[param_no]))
                        line[param_no] = _objExe.reg_offsets[line[param_no]];
                    else
                    {
    //  Is it a label?
    //
                        if (__labels.hasOwnProperty(line[param_no]))
                            line[param_no] = __labels[line[param_no]];
                        else
                        {
    //  It should point to a label in the ro, rw or
    //  code section.
    //
                            const   _ref = line[param_no].split(':');

                            const   _objLabel = sections.objSections.find(_ref[0]);

                            if (typeof _objLabel === 'string')
                                global.__s16_error(_objLabel);

                            if (_objLabel === false)
                                global.__s16_error(`Reference to undefined label ${global.__s16a_label(_ref[0])}`);
                            
                            if (_objLabel.section === 0)
                                global.__s16_file_error(
                                    [ _objLabel.path, _objLabel.line ],
                                    `Cannot reference address in ${global.__s16a_section(global.S16_SECTION_HEADER)} section at runtime`
                                );

                            if (_objLabel.section === 1)
                                global.__s16_file_error(
                                    [ _objLabel.path, _objLabel.line ],
                                    `Cannot reference address in ${global.__s16a_section(global.S16_SECTION_ENV)} section at runtime`
                                );

                            if (_ref.length > 1)
                            {
                                const   __index = parseInt(_ref[1]);
                                if (__index < 0 || __index >= _objLabel.data.length)
                                    global.__s16_file_error(
                                        [ _objLabel.path, _objLabel.line ],
                                        `Cannot reference index ${global.__s16a_number(__index)} of ${global.__s16a_label(_ref[0])}${global.__s16a_size(_ref[1])}`
                                    );
                                line[param_no] = (_objLabel.offset + __index);
                            }
                            else
                                line[param_no] = _objLabel.offset;

                            if (_objLabel.section === 2)
                                line[param_no] += _objExe.ro_offset;
                            else if (_objLabel.section === 3)
                                line[param_no] += _objExe.rw_offset;
                            else
                                line[param_no] += _objExe.code_offset;
                        }
                    }

                    global.__s16_verbose(`${global.__s16a_number(line[param_no])} `);
                }

            }

            line.splice(1, 0, _modifiers);

        };


///////////////////////////////////////////////////////////
//  __map_code_data()                                    //
///////////////////////////////////////////////////////////
//
        const   __map_code_data         = (

            function_name,
            code_offset,
            size,
            length,
            data

        ) =>
        {

            const   __exe_view          = new DataView(_objExe.buffer);

            global.__s16_verbose(`<!<fg blue>!>+---<!<reset>!> Mapping ${global.__s16a_keyword('function')} ${global.__s16a_label(function_name)} @ offset ${global.__s16a_number(code_offset)}\n`);

            if (typeof data === 'undefined')
                return false;
            
            for (let line_no = 0; line_no < data.length; line_no++)
            {

                const   __mnemonic      = global.S16_OPCODE(data[line_no][0]);
                const   __params        = __mnemonic.params;
                const   __response      = __check_instruction(__mnemonic.mnemonic);

                if (typeof __response === 'string')
                    return __response;

                global.__s16_verbose(`<!<fg blue>!>+----<!<reset>!> ${global.__s16a_mnemonic(__mnemonic.mnemonic)} `);

                __get_code_line(
                    data[line_no]
                );

                global.__s16_verbose(`opcode = ${global.__s16a_number(data[line_no][0])}, modifiers = ${global.__s16a_number(data[line_no][1].toString(2))} `);
                global.__s16_verbose(`(${global.__s16a_number(size[line_no])} bytes @ offset ${global.__s16a_number(code_offset)})\n`)

    //  The opcode and modifiers are the first two bytes
    //  of every line.
    //
                __exe_view.setUint8(code_offset++, data[line_no][0]);
                __exe_view.setUint8(code_offset++, data[line_no][1]);

                for (let param_no = 0; param_no < __params.length; param_no++)
                {
                    let     __param     = __params[param_no];

                    if (__param === 0)
                        __param = _objExe.regsize;

                    if (__param === 1)
                        __exe_view.setUint8(code_offset, data[line_no][(param_no + 2)]);
                    else if (__param === 2)
                        __exe_view.setUint16(code_offset, data[line_no][(param_no + 2)], global.little_endian);
                    else 
                        __exe_view.setUint32(code_offset, data[line_no][(param_no + 2)], global.little_endian);

                    code_offset += __param;
                }

            }


            return code_offset;

        };


///////////////////////////////////////////////////////////
//  __map_code()                                         //
///////////////////////////////////////////////////////////
//
        const   __map_code              = () =>
        {

            const   __exe_view          = new DataView(_objExe.buffer);
            
            let     __code_offset       = _objExe.code_offset;
            let     __main_offset       = 0;

            global.__s16_verbose(`<!<fg blue>!>|\n+--<!<reset>!> Mapping ${global.__s16a_section('code')} section @ offset ${global.__s16a_number(__code_offset)}:\n<!<fg blue>!>|<!<reset>!>\n`);

            const   __section           = sections.sections[4].section;

            let     __got_labels        = false;

            let     __total_lines       = 0;
            let     __total_bytes       = 0;

            for (let label_no = 0; label_no <= __section.label.length; label_no++)
            {

                if  (label_no === __section.label.length)
                {
                    if (__got_labels === true)
                        break;
                    else
                    {
                        label_no = 0;
                        __got_labels = true;
                    }
                }

                const   __function_name = __section.label[label_no];

                const   __path          = __section.path[label_no];
                const   __line          = __section.line[label_no];
                const   __data          = __section.data[label_no];
                const   __type          = __section.type[label_no];
                const   __size          = __section.size[label_no];
                const   __length        = __section.length[label_no];
                const   __offset        = __section.offset[label_no];

                if (__type === 'label')
                {
                    if (__got_labels)
                        continue;

                    global.__s16_verbose(`<!<fg blue>!>+---<!<reset>!> Mapping ${global.__s16a_mnemonic('Address')} label ${global.__s16a_label(__function_name)} @ offset ${global.__s16a_number(_objExe.code_offset + __offset)}\n`);
                    __labels[__function_name] = (_objExe.code_offset + __offset);

                    continue;
                }    

                if (! __got_labels)
                    continue;

                if (__function_name === global.S16_KEYWORD_MAIN)
                    __main_offset = __code_offset;

                const   __response  = __map_code_data(
                    __function_name,
                    __code_offset,
                    __size,
                    __length,
                    __data
                );

                if (typeof __response === 'string')
                    global.__s16_file_error(
                        [ __path, __line],
                        __response
                    );

                if (__response === false)
                    continue;

                __code_offset += __length;

                global.__s16_verbose(`<!<fg blue>!>+---<!<reset>!> Done mapping ${global.__s16a_label(__function_name)}, ${global.__s16a_number(__data.length)} lines, ${global.__s16a_number(__length)} bytes\n`)

                __total_lines += __data.length;
                __total_bytes += __length;
            }

            // console.log(`_main offset = ${__main_offset}`);
            // console.log(__labels);

            global.__s16_verbose(`<!<fg blue>!>+--<!<reset>!> Done mapping ${global.__s16a_section(global.S16_SECTION_CODE)} section - `);
            global.__s16_verbose(`${global.__s16a_number(__total_lines)} lines, ${global.__s16a_number(__total_bytes)} bytes\n`);

            _objExe.main_offset = __main_offset;

            __exe_view.setUint32(global.S16_HEADER_MAIN, _objExe.main_offset, global.little_endian);

        };


///////////////////////////////////////////////////////////
//  __initialise()                                       //
///////////////////////////////////////////////////////////
//
        const   __initialise            = () =>
        {

            global.__s16_verbose(`<!<fg blue>!>+-<!<reset>!> Linking ${global.__s16a_title('s16')} executable...\n`);

    //  Firstly - the model, regsize, maxaddr and
    //  byteorder values need to be set, they're in
    //  the header section.
    //
            const   _objModel           = sections.objSections.find(global.S16_HEADER_MODEL);
            const   _objRegsize         = sections.objSections.find(global.S16_HEADER_REGSIZE);
            const   _objMaxaddr         = sections.objSections.find(global.S16_HEADER_MAXADDR);
            const   _objByteorder       = sections.objSections.find(global.S16_HEADER_BYTEORDER);

            _objExe.model               = _objModel.data[0];
            _objExe.regsize             = _objRegsize.data[0];
            _objExe.maxaddr             = _objMaxaddr.data[0];
            _objExe.byteorder           = _objByteorder.data;

            if (_objExe.byteorder[0] === 0xFF)
                global.little_endian = true;
            else
                global.little_endian = false;

    //  Get the register offsets - these are calculated
    //  based on regsize - see:
    //
    //      System16/core/defs/Registers.js
    //
            _objExe.reg_offsets         = global.S16_REGOFFSETS(_objExe.regsize);
            _objExe.reg_buflen          = _objExe.reg_offsets['regbuf_length'];

            delete _objExe.reg_offsets['regbuf_length'];

    //  Now that the size of the register buffer is
    //  known, the offsets of the ro, rw and code
    //  sections can be calculated...
    //
            _objExe.ro_offset           = (global.S16_REGISTER_OFFSET + _objExe.reg_buflen);
            _objExe.rw_offset           = (_objExe.ro_offset + sections.sections[2].section.total_length);
            _objExe.code_offset         = (_objExe.code_offset + (_objExe.rw_offset + sections.sections[3].section.total_length));
            _objExe.size                = (_objExe.code_offset + sections.sections[4].section.total_length);

            _objExe.buffer              = new ArrayBuffer(_objExe.size);

            _objExe.main_offset         = 0;

    //  Now each individual section can be mapped to the
    //  ArrayBuffer.
    //
            __map_header();
            __map_registers();
            __map_data();
            __map_code();

            if (_objExe.main_offset === 0)
                global.__s16_error(`There is no <!<bold>!>_main<!<reset>!> function`);

            global.__s16_verbose(`<!<fg blue>!>|\n<!<reset>!>`);

            _dump_section(global.S16_SECTION_RO);
            _dump_section(global.S16_SECTION_RW);
            _dump_section(global.S16_SECTION_CODE);

            global.__s16_verbose(`<!<fg blue>!>|<!<reset>!>\n`);

        };


        const   _dump_section           = section =>
        {

            let __offset                = _objExe.ro_offset;
            let __end                   = _objExe.rw_offset;

            let __section               = global.S16_SECTION_RO;

            if (section === global.S16_SECTION_RW)
            {
                __offset                = _objExe.rw_offset;
                __end                   = _objExe.code_offset;
                __section               = global.S16_SECTION_RW;
            }

            if (section === global.S16_SECTION_CODE)
            {
                __offset                = _objExe.code_offset;
                __end                   = _objExe.size;
                __section               = global.S16_SECTION_CODE;
            }
            
            global.__s16_verbose(`<!<fg blue>!>+-_<!<reset>!> Dumping ${global.__s16a_section(__section)} section:\n<!<fg blue>!>|\n<!<reset>!>`);
        
            const   __exe_view          = new DataView(_objExe.buffer);
            let     __chunk             = 0;

            while (__offset < __end)
            {

                if (! __chunk || ! (__chunk % 8))
                {
                    if (__chunk)
                        global.__s16_verbose(`\n`);

                    global.__s16_verbose(`<!<fg blue>!>+---<!<reset>!> `);   
                }

                global.__s16_verbose(`\t${global.__s16a_number(__exe_view.getUint8(__offset++))}`);

                __chunk++;
            }

            global.__s16_verbose(`\n<!<fg blue>!>|\n<!<reset>!>`);
        
        };  


        __initialise();


        return {

            objExe:                     _objExe

        };

    };

