///////////////////////////////////////////////////////////
//  System16/s16a/core/DataMapper.js                     //
///////////////////////////////////////////////////////////
//
//
//


///////////////////////////////////////////////////////////
//  The DataMapper module.                               //
///////////////////////////////////////////////////////////
//
    export const    DataMapper          = (

        sections

    ) =>
    {


///////////////////////////////////////////////////////////
//  _process_tokens()                                    //
///////////////////////////////////////////////////////////
//
        const   _process_tokens         = (
    
            section,
            tokens
        
        ) =>
        {
            
    //  If tokens[2] matches a Memsize (1, 2 or 4) then
    //  it's a declaration.
    //
            if (global.S16_MEMSIZES.indexOf(parseInt(tokens[2])) >= 0)
                return sections.add_data(section, tokens);

    //  If tokens[2] is a reference then this is an
    //  assignment to an existing label.
    //
            if (typeof tokens[2] === 'string')
            {
                const   _objLabel       = sections.find(tokens[2]);

                if (typeof _objLabel === 'string')
                    global.__s16_file_error(tokens, _objLabel);

                if (typeof _objLabel !== 'object')
                    global.__s16_file_error(tokens, `Reference to undefined label '${global.__s16a_label(tokens[2])}`);

    //  We can't overwrite labels in the ro or data
    //  sections.
    //
                const   _section        = global.S16_SECTIONS[_objLabel.section];

                if (
                    (_section === global.S16_SECTION_RO)    ||
                    (_section === global.S16_SECTION_CODE)
                )
                    global.__s16_file_error(tokens, `Attempt to update read-only label ${global.__s16a_label(tokens[2])} belonging to ${global.__s16a_section(_section)} section`);
    
                const   _label          = tokens[2];
                const   _data           = [];
                const   _index          = sections.get_size_property(
                    tokens,
                    3
                );

                if (typeof _index === 'string')
                    global.__s16_file_error(tokens, _index);

    //  Tokens[3] should be the = operator.
    //
                if (tokens.length < 4)
                    global.__s16_file_error(tokens, `Expected ${global.__s16_operation('=')} operator`);

                if (tokens[3] !== '=')
                    global.__s16_file_error(tokens, `Unexpected token '<!<bold>!>${tokens[3]}<!<bold>!>'`);

                for (let token_no = 4; token_no < tokens.length; token_no++)
                    _data.push(tokens[token_no]);

                const   __update_response = sections.sections[_objLabel.section].update(
                    tokens,
                    _label,
                    _data,
                    _index
                );

                if (typeof __update_response === 'string')
                    global.__s16_file_error(tokens, __update_response);

                return true;
            }

            global.__s16_file_error(tokens, `Unexpected token '<!<bold>!>${tokens[2]}<!<bold>!>'`);

        };


        return {

            process_tokens:             _process_tokens

        };
        
    };

