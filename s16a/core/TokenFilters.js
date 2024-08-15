///////////////////////////////////////////////////////////
//  System16/s16a/core/TokenFilters.js                   //
///////////////////////////////////////////////////////////
//
//
//


    export const    TokenFilters        = (

        sections

    ) =>
    {


///////////////////////////////////////////////////////////
//  _filter_reference()                                  //
///////////////////////////////////////////////////////////
//
        const   _filter_reference       = (

            tokens,
            token_start

        ) =>
        {

    //  Do we have an [ index ] ?
    //
            let _index                  = sections.get_size_property(
                tokens,
                (token_start + 1)
            );

    //  There is no index property - all of the data
    //  (if the label exists) will be returned.
    //
            if (_index === false)
                _index = -1;

            const   _objLabel           = sections.find(tokens[token_start].substring(1));

            if (typeof _objLabel === 'string')
                global.__s16_file_error(tokens, _objLabel);

            if (typeof _objLabel !== 'object')
                global.__s16_file_error(tokens, `Reference to undefined label '${global.__s16a_label(tokens[token_start])}'`);

            if (_index >= 0)
            {
                if (_index >= _objLabel.data.length)
                    global.__s16_file_error(tokens, `Index ${global.__s16a_number(_index)} out of range for label ${global.__s16a_label(tokens[token_start].substring(1))}`);

                tokens[token_start] = _objLabel.data[_index];
            }    
            else
                tokens.splice(token_start, 1, ... _objLabel.data);
        };


///////////////////////////////////////////////////////////
//  _filter_all()                                        //
///////////////////////////////////////////////////////////
//
        const   _filter_all             = tokens =>
        {

            for (let token_no = (tokens.length - 1); token_no >= 0; token_no--)
            {

                const   _token          = tokens[token_no];

                if (typeof _token === 'number')
                    continue;

    //  Is it a $ data reference?
    //
                if (_token.substring(0, 1) === '$')
                    _filter_reference(tokens, token_no);

    //  Commas can be used as separators, e.g:
    //
    //      m8  buffer[10]  = 'A', 'B', 'C';
    //
    //  But they're not required and don't mean anything,
    //  they're removed here.
    //
                if (_token === ',')
                {
                    tokens.splice(token_no, 1);
                    continue;
                }

    //  Memtypes such as m32 translate to their equivalent
    //  size in bytes - m32 becomes 4, m16 becomes 2, etc.
    //
                const   __type_index    = global.S16_MEMTYPES.indexOf(_token);

                if (__type_index >= 0)
                {
                    tokens[token_no]    = global.S16_MEMSIZES[__type_index].toString();
                    continue;
                }

    //  Strings will be burst into character arrays and
    //  inserted into the tokens array.
    //
                if (
                    _token.substring(0, 1) === "\""     ||
                    _token.substring(0, 1) === '`'
                )
                {
                    const   _chars      = [];

                    for (let byte_no = 1; byte_no < (_token.length - 1); byte_no++)
                        _chars.push(_token.charCodeAt(byte_no));

                    _chars.push(0);

                    tokens.splice(token_no, 1, ... _chars);
                    
                    continue;
                }

    //  Character constants.
    //
                if (_token.substring(0, 1) === '\'')
                {
                    if (_token.length !== 3)
                        global.__s16_file_error(tokens, `Malformed character constant <!<bold>!>${_token}<!<bold>!>`);

                    tokens[token_no ] = _token.charCodeAt(2);

                    continue;
                }

            }

        };


        return {

            filter_all:                 _filter_all

        };

    };

    