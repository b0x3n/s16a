///////////////////////////////////////////////////////////
//  System16/s16a/core/CodeMapper.js                     //
///////////////////////////////////////////////////////////
//
//
//


///////////////////////////////////////////////////////////
//  The CodeMapper module.                               //
///////////////////////////////////////////////////////////
//
    export const    CodeMapper          = (

        sections,
        tokenFilters

    ) =>
    {


///////////////////////////////////////////////////////////
//  __create_address_label()                             //
///////////////////////////////////////////////////////////
//
        const   __create_address_label  = (
            
            tokens,
            offset
    
        ) =>
        {

            const   _objLabel           = sections.find(tokens[2].substring(1));
            const   __section           = global.S16_SECTIONS.indexOf(global.S16_SECTION_CODE);

            if (typeof _objLabel === 'string')
                global.__s16_file_error(tokens, _objLabel);

            if (typeof _objLabel === 'object')
                global.__s16_file_error(tokens, `Redeclaration of label ${tokens[2]}`);

            const   __validated         = sections.sections[0].validate_label(tokens[2].substring(1));

            if (typeof __validated === 'string')
                global.__s16_file_error(tokens, __validated);

            sections.sections[__section].section.path.push(tokens[0]);
            sections.sections[__section].section.line.push(tokens[1]);
            sections.sections[__section].section.label.push(tokens[2].substring(1));
            sections.sections[__section].section.type.push('label');
            sections.sections[__section].section.size.push(0);
            sections.sections[__section].section.data.push(offset);
            sections.sections[__section].section.length.push(0);
            sections.sections[__section].section.offset.push(offset);
        
            global.__s16_verbose(`<!<fg blue>!>+-----<!<reset>!> Line ${global.__s16a_number(tokens[1])} `);
            global.__s16_verbose(`${global.__s16a_mnemonic('Address')} label ${global.__s16a_label(tokens[2].substring(1))} @ offset ${global.__s16a_number(offset)}\n`);

        };


///////////////////////////////////////////////////////////
//  __create_function()                                  //
///////////////////////////////////////////////////////////
//
        const   __create_function       = (
            
            tokens,
            lines,
            line_no

        ) =>
        {

            let     __total_lines       = 0;
            let     __total_bytes       = 0;
            let     __function_size     = 0;

            let     __section           = global.S16_SECTIONS.indexOf(global.S16_SECTION_CODE);
            let     __offset            = sections.sections[__section].section.total_length;

            if (typeof sections.find(tokens[3]) === 'object')
                global.__s16_file_error(tokens, `Cannot create ${global.__s16a_keyword('function')} ${global.__s16a_label(tokens[3])} - label already exists`);

            const   __validated         = sections.sections[0].validate_label(tokens[3], true);

            if (typeof __validated === 'string')
                global.__s16_file_error(tokens, __validated);

            if (__validated !== true)
            {
                if (tokens[3] !== global.S16_KEYWORD_MAIN)
                    global.__s16_file_error(tokens, `${global.__s16a_keyword('function')}} label ${global.__s16a_label(tokens[3])} contains invalid characters`);
            }

            let     __lines             = [];
            let     __sizes             = [];
            let     __offsets           = [];

            let     _tokens;

            global.__s16_verbose(`<!<fg blue>!>+--${global.__dash()}<!<reset>!> Line ${global.__s16a_number(tokens[1])} `);
            global.__s16_verbose(`${global.__s16a_keyword('function')} ${global.__s16a_label(tokens[3])} @ offset ${global.__s16a_number(__offset)}\n`)
            
            const   _objLabel           = sections.find('regsize')
            const   __regsize           = _objLabel.data[0];

            while (line_no < lines.length)
            {
                _tokens                 = lines[line_no];

    //  Every line has at least a 2-byte opcode.
    //
                let     __line_size     = 2;
                let     __line          = [];

                if (_tokens.length < 3)
                    continue;

                tokenFilters.filter_all(_tokens);

    //  If tokens[2] begins with an @ character this
    //  is an address label.
    //
                if (_tokens[2].substring(0, 1) === '@')
                {
                    __create_address_label(
                        _tokens,
                        __offset
                    )
                    ;
                    line_no++;

                    continue;
                }

    //  A valid mnemonic should be in tokens[2]
    //
                if (! global.S16_MNEMONICS.hasOwnProperty(_tokens[2]))
                    global.__s16_file_error(_tokens, `'<!<bold>!>${_tokens[2]}<!<reset>!>' is not a valid instruction`);

    //  Every mnemonic is keyed in S16_MENMONICS, this
    //  will return an object describing how many
    //  parameters the instruction requires, the 
    //  size of those paramters as well as the
    //  opcode for this instruction.
    //
                const   __objMnemonic   = global.S16_MNEMONICS[_tokens[2]];

                const   __params        = __objMnemonic.params;
                const   __opcode        = __objMnemonic.opcode;

                if ((_tokens.length - 3) !== __params.length)
                    global.__s16_file_error(_tokens, `The ${global.__s16a_mnemonic(_tokens[2])} instruction expects exactly ${global.__s16a_number(__params.length)} parameters`);

                __line.push(__opcode);

                let     __str_operands  = '';

    //  Calculate the line size.
    //
                for (let param_no = 0; param_no < __params.length; param_no++)
                {
                    __line.push(_tokens[(3 + param_no)]);

    //  If the param is 0 then it's regsize
    //
                    if (__params[param_no] === 0)
                        __line_size += __regsize;
                    else
                        __line_size += __params[param_no];

                    if (__str_operands === '')
                        __str_operands += _tokens[(3 + param_no)];
                    else
                        __str_operands += `, ${_tokens[(3 + param_no)]}`;
                }

                if (__str_operands !== '')
                    __str_operands += ' ';
                
                global.__s16_verbose(`<!<fg blue>!>+---${global.__dash()}<!<reset>!> Line ${global.__s16a_number(_tokens[1])} `);
                global.__s16_verbose(`${global.__s16a_mnemonic(_tokens[2])} instruction (${global.__s16a_number(__opcode)}) ${__str_operands}`);
                global.__s16_verbose(`(${global.__s16a_number(__line_size)} bytes @ offset ${global.__s16a_number(__offset)})\n`);

    //  Add the individual line, line size and offset to
    //  the respective arrays - these will be stored in
    //  the section.
    //
                __lines.push(__line);
                __sizes.push(__line_size);
                __offsets.push(__offset);

                __offset += __line_size;
                __function_size += __line_size;
                __total_lines++;

                line_no++;

    //  Break when the end instruction (0) is found,
    //  need to roll back line_no because the caller
    //  will increase it on return - don't want to
    //  lose a line!
    //
                if (__opcode === 0)
                {
                    line_no--;
                    break;
                }
            }

    //  Update the total_length of the section, this is
    //  the offset for any subsequent function declarations.
    //
            sections.sections[__section].section.total_length = __offset;

            global.__s16_verbose(`<!<fg blue>!>+--${global.__dash()}<!<reset>!> Line ${global.__s16a_number(_tokens[1])} `);
            global.__s16_verbose(`${global.__s16a_keyword('end')} ${global.__s16a_keyword('function')} ${global.__s16a_label(tokens[3])} `);
            global.__s16_verbose(`(${global.__s16a_number(__total_lines)} total lines, ${global.__s16a_number(__function_size)} total bytes @ offset ${global.__s16a_number(__offset - __function_size)})\n`);

    //  Add the code to the section.
    //
            sections.sections[__section].section.path.push(tokens[0]);
            sections.sections[__section].section.line.push(tokens[1]);
            sections.sections[__section].section.label.push(tokens[3]);
            sections.sections[__section].section.type.push(tokens[2]);
            
            sections.sections[__section].section.size.push(__sizes);
            sections.sections[__section].section.data.push(__lines);
            sections.sections[__section].section.offset.push(__offsets);

            sections.sections[__section].section.length.push(__function_size);
        
            return line_no;

        };


///////////////////////////////////////////////////////////
//  _process_tokens()                                    //
///////////////////////////////////////////////////////////
//
        const   _process_tokens         = (

            lines,
            line_no

        ) =>
        {

    //  All code is contained within between 'function' and
    //  'end' statements - so tokens[2] is expected to be
    //  the keyword 'function', if it's not there's a 
    //  problem!
    //
            let     _tokens             = lines[line_no];

            if (_tokens.length < 3)
                return line_no;

            if (_tokens[2] !== global.S16_KEYWORD_FUNCTION)
                global.__s16_file_error(_tokens, `Unexpected token '<!<bold>!>${_tokens[2]}<!<reset>!>'`);

    //  A function requires a label.
    //
            if (_tokens.length < 4)
                global.__s16_file_error(_tokens, `Declaration of ${global.__s16a_keyword('function')} requires a <|<bold>!>label<!<bold>!>`);

            if (_tokens.length > 4)
                global.__s16_file_error(_tokens, `Excess tokens following ${global.__s16a_keyword('function')} declaration`);

            line_no = __create_function(
                _tokens,
                lines,
                (line_no + 1)
            )

            return line_no;
    
        };


        return {

            process_tokens:             _process_tokens

        };

    };

