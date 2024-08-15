///////////////////////////////////////////////////////////
//  Tokeniser/Tokeniser.js                               //
///////////////////////////////////////////////////////////
//
//  Tokeniser - parses a string of data into an array
//  of tokens.
//


///////////////////////////////////////////////////////////
//  Token types.
//
    const   __TOKEN_TYPE_PUNCTUATION    = 'punctuation';
    const   __TOKEN_TYPE_OPERATOR       = 'operator';
    const   __TOKEN_TYPE_NUMERIC        = 'numeric';
    const   __TOKEN_TYPE_STRING         = 'string';
    const   __TOKEN_TYPE_CHAR           = 'char';

    const   __TOKEN_TYPE_COLLECT        = 'collect';

    const   __TOKEN_TYPE_ERROR          = 'error';


///////////////////////////////////////////////////////////
//  the Tokeniser module.                                //
///////////////////////////////////////////////////////////
//
    export const    Tokeniser           = (

        objectify_tokens                = true,
        preserve_quotes                 = true

    ) =>
    {


        let     _tokens                 = [];


        let     __current_byte;
        let     __current_line;

        let     __start_line;


///////////////////////////////////////////////////////////
//  __is_whitespace_char()                               //
///////////////////////////////////////////////////////////
//
        const   __is_whitespace_char    = data =>
        {

            const   __whitespace_chars  =
            [
                ' ', '\t'
            ];

            if (__whitespace_chars.indexOf(data) >= 0)
                return true;

            return false;

        };


///////////////////////////////////////////////////////////
//  __is_punctuation_char()                              //
///////////////////////////////////////////////////////////
//
        const   __is_punctuation_char   = data =>
        {

            const   __punctuation_chars =
            [
                "(", ")",
                "{", "}",
                "[", "]",
                ',', '?'
            ];

            if (__punctuation_chars.indexOf(data) < 0)
                return false;

            return true;

        };


///////////////////////////////////////////////////////////
//  __is_operator_char()                                 //
///////////////////////////////////////////////////////////
//
        const   __is_operator_char      = data =>
        {

            const   __operator_chars    =
            [
                "+", "-",
                "/", "*",
                "="
            ];

            if (__operator_chars.indexOf(data) < 0)
                return false;

            return true;

        };


///////////////////////////////////////////////////////////
//  __is_quote_char()                                    //
///////////////////////////////////////////////////////////
//
        const   __is_quote_char         = data =>
        {

            const   __quote_chars       =
            [
                "\"", '\'', "`"
            ];

            if (__quote_chars.indexOf(data) < 0)
                return false;

            return true;

        };


///////////////////////////////////////////////////////////
//  __get_string_token()                                 //
///////////////////////////////////////////////////////////
//
        const   __get_string_token      = data =>
        {

            let     __quote_character   = data[__current_byte++];
            let     _string_buffer      = '';

            if (preserve_quotes === true)
                _string_buffer          = __quote_character;

    //  Read in everything up to the next " character.
    //
            while (__current_byte <= data.length)
            {

                if (__current_byte >= data.length)
                    return `Unterminated quoted string`;

                const   __byte          = data.substring(__current_byte, (__current_byte + 1));

                if (__byte === __quote_character)
                {
                    if (preserve_quotes === true)
                        _string_buffer += __quote_character;
                    __current_byte++;
                    break;
                }

                if (__byte === '\n')
                    __current_line++;

                _string_buffer += __byte;
                __current_byte++;

            }

            // if (__quote_character === '\'')
            // {
            //     if (_string_buffer.length != 1)
            //         return `Malformed character literal '${_string_buffer}'`;

            //     return {
            //         'type':             __TOKEN_TYPE_CHAR,
            //         'data':             _string_buffer
            //     };
            // }

            return {
                'type':                 __TOKEN_TYPE_STRING,
                'data':                 _string_buffer
            };

        };


///////////////////////////////////////////////////////////
//  __get_numeric_token()                                //
///////////////////////////////////////////////////////////
//
        const   __get_numeric_token     = data =>
        {

            let     __digits            = '';
            let     __prefix            = '';

    //  Skip any prefixes:
    //
    //      0b      - binary
    //      0x      - hex
    //      0o      - octal
    //
            if (
                (data.substring(__current_byte, (__current_byte + 2)).toLowerCase() === '0b')     ||
                (data.substring(__current_byte, (__current_byte + 2)).toLowerCase() === '0x')     ||
                (data.substring(__current_byte, (__current_byte + 2)).toLowerCase() === '0u')
            )
            {
                __prefix               = data.substring(__current_byte, (__current_byte + 2)).toLowerCase();
                __current_byte += 2;
            }

            while (__current_byte < data.length)
            {
        //  Collect everything up to the next non-digit.
        //
                const   __byte          = data[__current_byte];

                if (__prefix === '0x')
                {
                    if (! /^[0-9a-fA-F]$/.test(__byte))
                        break;
                }
                else
                {
                    if (! /^[0-9]$/.test(__byte))
                        break;
                }

                __digits += __byte;
                __current_byte++;
            }

            if (__digits === '')
                __digits = '0';

            return {
                'type':                 __TOKEN_TYPE_NUMERIC,
                'data':                 parseInt(`${__prefix}${__digits}`)
            };

        };


///////////////////////////////////////////////////////////
//  __skip_comment()                                     //
///////////////////////////////////////////////////////////
//
        const   __skip_comment          = data =>
        {

            while (__current_byte < data.length)
            {
                const   __byte          = data[__current_byte++];

                if (__byte === '\n')
                {
                    __current_line++;
                    break;
                }
            }

            return false;

        };


///////////////////////////////////////////////////////////
//  __collect()                                          //
///////////////////////////////////////////////////////////
//
        const   __collect               = data =>
        {

            let     _collected          = '';

            while (__current_byte < data.length)
            {

                const   __byte          = data[__current_byte];

                if (
                    __is_whitespace_char(__byte)        ||
                    __is_punctuation_char(__byte)       ||
                    __is_operator_char(__byte)          ||
                    __is_quote_char(__byte)             ||
                    __byte === '\n'                     ||
                    __byte === '\r'                     ||
                    __byte === ';'
                )
                    break;

                __current_byte++;
                _collected += __byte;
            }

            return {
                'type':                 __TOKEN_TYPE_COLLECT,
                'data':                 _collected
            };

        };


///////////////////////////////////////////////////////////
//  __get_next_token()                                   //
///////////////////////////////////////////////////////////
//
        const   __get_next_token        = data =>
        {

            let     _token              = false;
            let     __byte              = data[__current_byte];

    //  Skip any unquoted whitespace characters.
    //
            while (__is_whitespace_char(__byte))
                __byte = data[++__current_byte];

    //  Skip comments.
    //
            if (__byte === '/' && data[__current_byte + 1] === '/')
                return __skip_comment(data);

    //  If it's an unquoted newline or semi-colon
    //  then it ends the current line, we return
    //  false.
    //
            if (__byte === '\n' || __byte === '\r' || __byte === ';')
            {
                if (__byte === '\n')
                    __current_line++;

                __current_byte++;

                return false;
            }

    //  Is it a string?
    //
            if (__is_quote_char(__byte))
                return __get_string_token(data);

    //  Is it an operator?
    //
            if (__is_operator_char(__byte))
            {
                __current_byte++;

                return {
                    'type':             __TOKEN_TYPE_OPERATOR,
                    'data':             __byte
                };
            }
            
    //  Is it punctuation?
    //
            if (__is_punctuation_char(__byte))
            {
                __current_byte++;

                return {
                    'type':             __TOKEN_TYPE_PUNCTUATION,
                    'data':             __byte
                };
            }

    //  Is it a number?
    //
            if (/^[0-9]$/.test(__byte))
                return __get_numeric_token(data);

    //  Anything else is collected...
    //
            return __collect(data);

        };


///////////////////////////////////////////////////////////
//  _get_tokens()                                        //
///////////////////////////////////////////////////////////
//
        const   _get_tokens             = (

            data,
            prefix_token                = false,
            count_lines                 = true
        
        ) =>
        {

            _tokens                     = [];

            data                        = data.replace(/\n\r?/g, '\n');

            __current_line              = 1;
            __current_byte              = 0;

            let __tokens                = false;
            let __tokens_base           = false;

            while (__current_byte < data.length)
            {

                if (__tokens === false)
                {
                    __tokens = [];
                
                    if (prefix_token !== false)
                        __tokens.push(prefix_token);
                    if (count_lines === true)
                        __tokens.push(__current_line);

                    if (__tokens_base === false)
                        __tokens_base = __tokens.length;

                    __start_line = __current_line;
                }

                const   _objToken       = __get_next_token(data);

    //  If a string is returned it contains an error
    //  message.
    //
                if (typeof _objToken === 'string')
                    return {
                        'type':         __TOKEN_TYPE_ERROR,
                        'line':         __start_line,
                        'data':         _objToken
                    };

    //  False is returned when a ; or newline is found.
    //
                if (_objToken === false)
                {
    //  Only add the line if we have tokens other
    //  than a prefix or line number.
    //
                    if (__tokens.length > __tokens_base)
                        _tokens.push(__tokens);
      
    //  Reset for the next line.
    //
                    __tokens = false;

                    continue;
                }

                let _token              = _objToken.data;

                if (objectify_tokens)
                    _token              = __tokens.push(_objToken);
                
                //    __tokens.push(_objToken.data.trim());

                if (_token !== '' && _token !== false)
                    __tokens.push(_token);
                
            }

            if (__tokens !== false)
            {
                if (__tokens.length > __tokens_base)
                    _tokens.push(__tokens);
            }

            return _tokens;

        };


        return {

            get_tokens:                 _get_tokens,

            tokens:                     _tokens

        };

    };

